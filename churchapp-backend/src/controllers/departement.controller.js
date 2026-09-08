import { Departement, Membre } from '../models/index.js'

const INCLUDE_COMPLET = [
  { model: Membre, as: 'chef', attributes: ['id', 'nom'] },
  { model: Membre, as: 'ouvriers', attributes: ['id', 'nom', 'contact'], through: { attributes: [] } },
]

export async function listerDepartements(req, res) {
  const departements = await Departement.findAll({
    where: { egliseId: req.egliseId },
    include: INCLUDE_COMPLET,
    order: [['nom', 'ASC']],
  })
  res.json(departements)
}

export async function creerDepartement(req, res) {
  const { nom, description, chefMembreId, ouvrierIds } = req.body
  if (!nom) return res.status(400).json({ message: 'Le nom du département est requis.' })

  const departement = await Departement.create({ nom, description, chefMembreId: chefMembreId || null, egliseId: req.egliseId })

  if (Array.isArray(ouvrierIds) && ouvrierIds.length > 0) {
    const membres = await Membre.findAll({ where: { id: ouvrierIds, egliseId: req.egliseId } })
    await departement.setOuvriers(membres)
  }

  const avecDetails = await Departement.findByPk(departement.id, { include: INCLUDE_COMPLET })
  res.status(201).json(avecDetails)
}

export async function modifierDepartement(req, res) {
  const { nom, description, chefMembreId, ouvrierIds } = req.body
  const departement = await Departement.findOne({ where: { id: req.params.id, egliseId: req.egliseId } })
  if (!departement) return res.status(404).json({ message: 'Département introuvable.' })

  if (nom !== undefined) departement.nom = nom
  if (description !== undefined) departement.description = description
  if (chefMembreId !== undefined) departement.chefMembreId = chefMembreId || null
  await departement.save()

  if (Array.isArray(ouvrierIds)) {
    const membres = await Membre.findAll({ where: { id: ouvrierIds, egliseId: req.egliseId } })
    await departement.setOuvriers(membres)
  }

  const avecDetails = await Departement.findByPk(departement.id, { include: INCLUDE_COMPLET })
  res.json(avecDetails)
}

export async function supprimerDepartement(req, res) {
  const departement = await Departement.findOne({ where: { id: req.params.id, egliseId: req.egliseId } })
  if (!departement) return res.status(404).json({ message: 'Département introuvable.' })
  await departement.destroy()
  res.status(204).send()
}
