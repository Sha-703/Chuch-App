import { Op } from 'sequelize'
import { Culte, PresenceCulte } from '../models/index.js'

// Nombre d'ouvriers présents (signé via leur espace) par culte — une seule requête.
async function comptePresencesEnLigne(culteIds) {
  if (culteIds.length === 0) return {}
  const lignes = await PresenceCulte.findAll({
    where: { culteId: { [Op.in]: culteIds }, statut: 'present' },
    attributes: ['culteId'],
  })
  const compte = {}
  for (const id of culteIds) compte[id] = 0
  for (const l of lignes) compte[l.culteId] = (compte[l.culteId] || 0) + 1
  return compte
}

export async function listerCultes(req, res) {
  const cultes = await Culte.findAll({
    where: { egliseId: req.egliseId },
    order: [['date', 'DESC']],
  })

  const enLigne = await comptePresencesEnLigne(cultes.map((c) => c.id))

  res.json(
    cultes.map((c) => ({
      id: c.id,
      type: c.type,
      date: c.date,
      predicateur: c.predicateur,
      presencePhysique: c.presentiel || 0, // saisi manuellement par l'admin
      presenceEnLigne: enLigne[c.id] || 0, // signée par les ouvriers
      total: (c.presentiel || 0) + (enLigne[c.id] || 0),
    }))
  )
}

export async function creerCulte(req, res) {
  const { type, date, predicateur, presentiel } = req.body
  if (!type || !date) {
    return res.status(400).json({ message: 'type et date sont requis.' })
  }
  let presentielValide = 0
  if (presentiel !== undefined && presentiel !== '' && presentiel !== null) {
    presentielValide = parseInt(presentiel, 10)
    if (!Number.isFinite(presentielValide) || presentielValide < 0) {
      return res.status(400).json({ message: 'Le nombre de présences physiques doit être un entier positif ou nul.' })
    }
  }
  const culte = await Culte.create({
    type,
    date,
    predicateur,
    presentiel: presentielValide,
    egliseId: req.egliseId,
  })
  res.status(201).json(culte)
}

export async function supprimerCulte(req, res) {
  const culte = await Culte.findOne({ where: { id: req.params.culteId, egliseId: req.egliseId } })
  if (!culte) return res.status(404).json({ message: 'Culte introuvable.' })
  await culte.destroy() // PresenceCulte est supprimée en cascade
  res.status(204).send()
}
