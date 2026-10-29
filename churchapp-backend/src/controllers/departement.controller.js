import { Departement, Membre, Utilisateur } from '../models/index.js'

const INCLUDE_COMPLET = [
  { model: Membre, as: 'chef', attributes: ['id', 'nom', 'utilisateurId'] },
  { model: Membre, as: 'ouvriers', attributes: ['id', 'nom', 'contact', 'role', 'utilisateurId'], through: { attributes: [] } },
]

export async function listerDepartements(req, res) {
  const departements = await Departement.findAll({
    where: { egliseId: req.egliseId },
    include: INCLUDE_COMPLET,
    order: [['nom', 'ASC']],
  })
  res.json(departements)
}

// --- Espace du chef de département : SON département uniquement ---
export async function monDepartement(req, res) {
  const departement = await Departement.findOne({
    where: { egliseId: req.egliseId, chefUtilisateurId: req.auth.sub },
    include: INCLUDE_COMPLET,
  })
  if (!departement) {
    return res.status(404).json({ message: 'Aucun département ne vous est associé. Contactez votre administrateur.' })
  }
  res.json(departement)
}

// --- Ajout / retrait d'ouvriers dans MON département (par le chef lui-même) ---
export async function majMesOuvriers(req, res) {
  const { ouvrierIds } = req.body
  if (!Array.isArray(ouvrierIds)) {
    return res.status(400).json({ message: 'ouvrierIds doit être une liste.' })
  }

  const departement = await Departement.findOne({
    where: { egliseId: req.egliseId, chefUtilisateurId: req.auth.sub },
  })
  if (!departement) return res.status(404).json({ message: 'Aucun département ne vous est associé.' })

  const membres = await Membre.findAll({ where: { id: ouvrierIds, egliseId: req.egliseId } })
  await departement.setOuvriers(membres)

  const avecDetails = await Departement.findByPk(departement.id, { include: INCLUDE_COMPLET })
  res.json(avecDetails)
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
  if (chefMembreId !== undefined) {
    const ancienChef = departement.chefMembreId
    const ancienChefUtilisateurId = departement.chefUtilisateurId
    departement.chefMembreId = chefMembreId || null
    // Le chef change : le compte lié est rétrogradé "ouvrier" (pas d'orphan)
    if (departement.chefMembreId !== ancienChef && ancienChefUtilisateurId) {
      await Utilisateur.update({ role: 'ouvrier' }, { where: { id: ancienChefUtilisateurId } })
      await Membre.update({ role: 'Ouvrier' }, { where: { id: ancienChef, egliseId: req.egliseId } })
      departement.chefUtilisateurId = null
    }
  }
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
