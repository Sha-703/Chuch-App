import { Op } from 'sequelize'
import { Annonce, Eglise } from '../models/index.js'
import { persisterFichier, supprimerFichier } from '../middlewares/upload.js'

// Supprime silencieusement les annonces expirées (dateFin dépassée) avant
// toute lecture — c'est le mécanisme de "suppression automatique après leur
// date" : pas de tâche planifiée séparée, le nettoyage se fait à la volée à
// chaque consultation du mur d'annonces. Les photos sont retirées de la base.
async function purgerAnnoncesExpirees() {
  const aujourdHui = new Date().toISOString().slice(0, 10)
  const avecPhoto = await Annonce.findAll({
    where: { dateFin: { [Op.lt]: aujourdHui }, photoUrl: { [Op.ne]: null } },
    attributes: ['photoUrl'],
  })
  await Annonce.destroy({ where: { dateFin: { [Op.lt]: aujourdHui } } })
  for (const annonce of avecPhoto) await supprimerFichier(annonce.photoUrl)
}

// Exception documentée à l'isolation multi-tenant : le mur PUBLIC est partagé
// entre TOUTES les églises du système (voir cahier des charges §3.2), MAIS les
// annonces à portée 'ouvriers' restent strictement dans l'église qui les a
// créées : on renvoie donc le réseau + les miennes, jamais celles des autres.
export async function listerAnnonces(req, res) {
  await purgerAnnoncesExpirees()

  const annonces = await Annonce.findAll({
    where: {
      [Op.or]: [{ portee: 'reseau' }, { egliseId: req.egliseId }],
    },
    include: [{ model: Eglise, attributes: ['id', 'nom', 'ville'] }],
    order: [['createdAt', 'DESC']],
  })
  res.json(annonces)
}

export async function creerAnnonce(req, res) {
  const { titre, contenu, dateDebut, dateFin, portee } = req.body
  if (!titre || !contenu) return res.status(400).json({ message: 'titre et contenu sont requis.' })
  if (!dateDebut || !dateFin) return res.status(400).json({ message: 'dateDebut et dateFin sont requises.' })
  if (dateFin < dateDebut) return res.status(400).json({ message: 'La date de fin doit être après la date de début.' })
  if (portee && !['reseau', 'ouvriers'].includes(portee)) {
    return res.status(400).json({ message: 'Portée invalide (reseau ou ouvriers).' })
  }

  const annonce = await Annonce.create({
    titre,
    contenu,
    dateDebut,
    dateFin,
    portee: portee || 'reseau',
    photoUrl: await persisterFichier(req, 'annonce'),
    egliseId: req.egliseId,
  })

  const avecEglise = await Annonce.findByPk(annonce.id, {
    include: [{ model: Eglise, attributes: ['id', 'nom', 'ville'] }],
  })
  res.status(201).json(avecEglise)
}

// Suppression d'une annonce — seules les églises peuvent retirer leurs propres
// annonces (le super-admin a sa propre route de suppression).
export async function supprimerAnnonce(req, res) {
  const annonce = await Annonce.findOne({ where: { id: req.params.id, egliseId: req.egliseId } })
  if (!annonce) return res.status(404).json({ message: 'Annonce introuvable.' })
  await supprimerFichier(annonce.photoUrl)
  await annonce.destroy()
  res.status(204).send()
}
