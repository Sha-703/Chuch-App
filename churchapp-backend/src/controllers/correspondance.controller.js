import { Op } from 'sequelize'
import { Correspondance, Eglise } from '../models/index.js'
import { urlFichier } from '../middlewares/upload.js'
import { journaliser } from '../lib/journal.js'

const JOURS_LIMITE_TRAITEMENT = 8

function ajouterJours(dateStr, jours) {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + jours)
  return d.toISOString().slice(0, 10)
}

// Ajoute un indicateur de retard calculé (le modèle ne stocke que les dates)
function enrichir(correspondance) {
  const c = correspondance.toJSON ? correspondance.toJSON() : correspondance
  if (c.etat !== 'archive' && c.dateLimiteTraitement) {
    const aujourdHui = new Date().toISOString().slice(0, 10)
    c.enRetard = aujourdHui > c.dateLimiteTraitement
  } else {
    c.enRetard = false
  }
  return c
}

export async function listerCorrespondances(req, res) {
  const { sens, etat } = req.query
  const where = { egliseId: req.egliseId }
  if (sens) where.sens = sens
  if (etat) where.etat = etat

  const correspondances = await Correspondance.findAll({
    where,
    include: [{ model: Eglise, as: 'egliseCorrespondante', attributes: ['id', 'nom'] }],
    order: [['dateReception', 'DESC']],
  })
  res.json(correspondances.map(enrichir))
}

// Enregistrement d'un courrier PHYSIQUE (scan obligatoire), entrant ou sortant
export async function creerCorrespondancePhysique(req, res) {
  const { sens, objet, correspondantExterne, dateReception } = req.body
  if (!sens || !objet) return res.status(400).json({ message: 'sens et objet sont requis.' })
  if (!req.file) return res.status(400).json({ message: 'Le scan du document est obligatoire pour une correspondance physique.' })

  const dateRecep = dateReception || new Date().toISOString().slice(0, 10)
  const estSortante = sens === 'sortante'

  const correspondance = await Correspondance.create({
    sens,
    type: 'physique',
    etat: estSortante ? 'archive' : 'entrant',
    objet,
    correspondantExterne,
    fichierUrl: urlFichier(req, req.file.filename),
    dateReception: dateRecep,
    dateLimiteTraitement: estSortante ? null : ajouterJours(dateRecep, JOURS_LIMITE_TRAITEMENT),
    dateArchivage: estSortante ? dateRecep : null,
    egliseId: req.egliseId,
  })

  res.status(201).json(enrichir(correspondance))
}

// Envoi d'une correspondance NUMÉRIQUE — soit vers une église du système,
// soit vers un correspondant externe (simple enregistrement, pas d'échange).
export async function creerCorrespondanceNumerique(req, res) {
  const { objet, contenu, destinataireEgliseId, correspondantExterne } = req.body
  if (!objet) return res.status(400).json({ message: 'objet est requis.' })
  if (!destinataireEgliseId && !correspondantExterne) {
    return res.status(400).json({ message: 'Précisez un destinataire (église du système ou correspondant externe).' })
  }

  const dateRecep = new Date().toISOString().slice(0, 10)
  const fichierUrl = req.file ? urlFichier(req, req.file.filename) : null

  // Copie "sortante" chez l'expéditeur — considérée traitée dès l'envoi
  const sortante = await Correspondance.create({
    sens: 'sortante',
    type: 'numerique',
    etat: 'archive',
    objet,
    contenu,
    fichierUrl,
    correspondantExterne: destinataireEgliseId ? null : correspondantExterne,
    egliseCorrespondanteId: destinataireEgliseId || null,
    dateReception: dateRecep,
    dateArchivage: dateRecep,
    egliseId: req.egliseId,
  })

  // Si le destinataire est une église du système : créer sa copie "entrante"
  if (destinataireEgliseId) {
    const destinataire = await Eglise.findByPk(destinataireEgliseId)
    if (!destinataire) return res.status(404).json({ message: 'Église destinataire introuvable.' })

    const entrante = await Correspondance.create({
      sens: 'entrante',
      type: 'numerique',
      etat: 'entrant',
      objet,
      contenu,
      fichierUrl,
      egliseCorrespondanteId: req.egliseId,
      dateReception: dateRecep,
      dateLimiteTraitement: ajouterJours(dateRecep, JOURS_LIMITE_TRAITEMENT),
      egliseId: destinataireEgliseId,
      correspondanceLieeId: sortante.id,
    })
    sortante.correspondanceLieeId = entrante.id
    await sortante.save()
  }

  res.status(201).json(enrichir(sortante))
}

// Changement d'état : entrant -> en_traitement -> archive
export async function changerEtat(req, res) {
  const { etat } = req.body
  if (!['entrant', 'en_traitement', 'archive'].includes(etat)) {
    return res.status(400).json({ message: 'État invalide.' })
  }

  const correspondance = await Correspondance.findOne({ where: { id: req.params.id, egliseId: req.egliseId } })
  if (!correspondance) return res.status(404).json({ message: 'Correspondance introuvable.' })

  correspondance.etat = etat
  if (etat === 'archive') {
    correspondance.dateArchivage = new Date().toISOString().slice(0, 10)
  }
  await correspondance.save()

  if (etat === 'archive') {
    const eglise = await Eglise.findByPk(req.egliseId)
    await journaliser({
      action: 'correspondance.archivee',
      details: `Courrier "${correspondance.objet}" archivé`,
      egliseNom: eglise?.nom,
      utilisateurNom: req.auth?.role,
    })
  }

  res.json(enrichir(correspondance))
}

// Envoi de l'accusé de réception — obligatoire pour toute correspondance entrante.
// Si elle provient d'une église du système, propage l'accusé sur la copie "sortante" du côté expéditeur.
export async function envoyerAccuse(req, res) {
  const correspondance = await Correspondance.findOne({ where: { id: req.params.id, egliseId: req.egliseId } })
  if (!correspondance) return res.status(404).json({ message: 'Correspondance introuvable.' })
  if (correspondance.sens !== 'entrante') {
    return res.status(400).json({ message: "Seule une correspondance entrante peut recevoir un accusé de réception." })
  }

  correspondance.accuseEnvoye = true
  correspondance.accuseEnvoyeLe = new Date()
  // Passage automatique en traitement dès l'accusé envoyé, si ce n'était pas déjà fait
  if (correspondance.etat === 'entrant') correspondance.etat = 'en_traitement'
  await correspondance.save()

  if (correspondance.correspondanceLieeId) {
    const liee = await Correspondance.findByPk(correspondance.correspondanceLieeId)
    if (liee) {
      liee.accuseEnvoye = true
      liee.accuseEnvoyeLe = new Date()
      await liee.save()
    }
  }

  res.json(enrichir(correspondance))
}
