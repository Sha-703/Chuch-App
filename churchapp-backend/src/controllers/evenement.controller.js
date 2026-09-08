import { Op } from 'sequelize'
import { randomUUID } from 'crypto'
import { Evenement, Membre } from '../models/index.js'

const INCLUDE = [{ model: Membre, as: 'responsable', attributes: ['id', 'nom'] }]

function trimestreDeDate(dateStr) {
  const mois = parseInt(dateStr.slice(5, 7), 10)
  return Math.ceil(mois / 3) // 1 à 4
}

function ajouterMois(dateStr, mois) {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + mois)
  return d.toISOString().slice(0, 10)
}

export async function listerEvenements(req, res) {
  const { annee, trimestre } = req.query
  const where = { egliseId: req.egliseId }
  if (annee) where.date = { [Op.startsWith]: annee }

  const evenements = await Evenement.findAll({ where, include: INCLUDE, order: [['date', 'ASC']] })

  const avecTrimestre = evenements.map((e) => ({ ...e.toJSON(), trimestre: trimestreDeDate(e.date) }))
  const filtres = trimestre ? avecTrimestre.filter((e) => e.trimestre === Number(trimestre)) : avecTrimestre

  res.json(filtres)
}

export async function creerEvenement(req, res) {
  const { titre, description, date, heure, responsableMembreId, responsableLibre, rappelActif, rappelDate, recurrence } = req.body
  if (!titre || !date) return res.status(400).json({ message: 'titre et date sont requis.' })

  const donneesBase = {
    titre,
    description,
    heure,
    responsableMembreId: responsableMembreId || null,
    responsableLibre: responsableMembreId ? null : responsableLibre,
    rappelActif: !!rappelActif,
    rappelDate: rappelActif ? rappelDate : null,
    recurrence: recurrence === 'trimestrielle' ? 'trimestrielle' : 'aucune',
    egliseId: req.egliseId,
  }

  if (donneesBase.recurrence === 'trimestrielle') {
    // Génère l'occurrence initiale + 3 occurrences futures (une par trimestre sur un an)
    const serieId = randomUUID()
    const occurrences = await Promise.all(
      [0, 3, 6, 9].map((decalage) =>
        Evenement.create({ ...donneesBase, date: ajouterMois(date, decalage), serieId })
      )
    )
    return res.status(201).json(occurrences.map((o) => o.toJSON()))
  }

  const evenement = await Evenement.create({ ...donneesBase, date })
  res.status(201).json(evenement)
}

export async function supprimerEvenement(req, res) {
  const evenement = await Evenement.findOne({ where: { id: req.params.id, egliseId: req.egliseId } })
  if (!evenement) return res.status(404).json({ message: 'Événement introuvable.' })
  await evenement.destroy()
  res.status(204).send()
}

// Widget tableau de bord : événements des 7 prochains jours
export async function prochainsEvenements(req, res) {
  const aujourdHui = new Date().toISOString().slice(0, 10)
  const dans7Jours = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const evenements = await Evenement.findAll({
    where: { egliseId: req.egliseId, date: { [Op.between]: [aujourdHui, dans7Jours] } },
    include: INCLUDE,
    order: [['date', 'ASC']],
  })
  res.json(evenements)
}

// Rappels "actifs" : la date/heure de rappel est passée, mais l'événement n'a pas encore eu lieu.
// NOTE IMPORTANTE : ceci est un rappel affiché DANS l'application (bandeau/dashboard) —
// il n'y a pas d'envoi de SMS ou d'e-mail automatique (voir cahier des charges, hors périmètre actuel).
export async function rappelsActifs(req, res) {
  const maintenant = new Date()
  const aujourdHui = maintenant.toISOString().slice(0, 10)

  const evenements = await Evenement.findAll({
    where: {
      egliseId: req.egliseId,
      rappelActif: true,
      rappelDate: { [Op.lte]: maintenant },
      date: { [Op.gte]: aujourdHui },
    },
    include: INCLUDE,
    order: [['date', 'ASC']],
  })
  res.json(evenements)
}
