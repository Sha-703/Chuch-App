import bcrypt from 'bcryptjs'
import { Membre, Utilisateur, Departement } from '../models/index.js'

// Rôles proposés dans le formulaire d'ajout d'un ouvrier (affichage : "Ouvriers")
const ROLES_MEMBRE = ['Ouvrier', 'Chef de département', 'Diacre', 'Ancien', 'Trésorier', 'Administrateur', 'Pasteur']

export async function listerMembres(req, res) {
  const membres = await Membre.findAll({
    where: { egliseId: req.egliseId },
    include: [{ model: Utilisateur, as: 'compte', attributes: ['id', 'email', 'role'] }],
    order: [['nom', 'ASC']],
  })
  res.json(membres)
}

export async function creerMembre(req, res) {
  const { nom, role, contact, depuis } = req.body
  if (!nom) return res.status(400).json({ message: 'nom requis.' })

  // Un rôle peut être libre (option "Autre" du formulaire) : on n'impose que
  // que la liste connue ne soit pas vide.
  if (role && typeof role !== 'string') {
    return res.status(400).json({ message: 'Rôle invalide.' })
  }

  const membre = await Membre.create({
    nom,
    role: role || 'Ouvrier',
    contact,
    depuis,
    egliseId: req.egliseId,
  })
  res.status(201).json(membre)
}

export async function supprimerMembre(req, res) {
  const membre = await Membre.findOne({ where: { id: req.params.id, egliseId: req.egliseId } })
  if (!membre) return res.status(404).json({ message: 'Membre introuvable.' })

  // Retire d'abord le lien avec un compte de connexion éventuel
  if (membre.utilisateurId) {
    await Utilisateur.destroy({ where: { id: membre.utilisateurId } })
    membre.utilisateurId = null
  }
  // Retire le membre des départements qui le contiennent
  const departements = await Departement.findAll({ where: { egliseId: req.egliseId } })
  for (const d of departements) {
    const ouvriers = await d.getOuvriers()
    if (ouvriers.some((o) => o.id === membre.id)) {
      await d.removeOuvrier(membre)
    }
    if (d.chefMembreId === membre.id) {
      d.chefMembreId = null
      d.chefUtilisateurId = null
      await d.save()
    }
  }

  await membre.destroy()
  res.status(204).send()
}

// Donne à un ouvrier un accès de connexion (droits limités : son espace pour
// signer sa présence). Le mot de passe initial = l'adresse e-mail.
// Si roleCible = 'chef_departement', il obtient l'espace dédié du chef et
// devient le chef du département indiqué (departementId).
export async function creerCompteOuvrier(req, res) {
  const { email, roleCible, departementId } = req.body
  if (!email) return res.status(400).json({ message: 'email requis.' })

  const membre = await Membre.findOne({ where: { id: req.params.id, egliseId: req.egliseId } })
  if (!membre) return res.status(404).json({ message: 'Membre introuvable.' })
  if (membre.utilisateurId) return res.status(409).json({ message: 'Ce membre a déjà un compte.' })

  const existant = await Utilisateur.findOne({ where: { email } })
  if (existant) return res.status(409).json({ message: 'Un compte existe déjà avec cet e-mail.' })

  const estChef = roleCible === 'chef_departement'

  let departement = null
  if (estChef) {
    if (!departementId) {
      return res.status(400).json({ message: 'departementId est requis pour créer un compte chef de département.' })
    }
    departement = await Departement.findOne({ where: { id: departementId, egliseId: req.egliseId } })
    if (!departement) return res.status(404).json({ message: 'Département introuvable.' })
    if (departement.chefUtilisateurId) {
      return res.status(409).json({ message: `Le département "${departement.nom}" a déjà un chef avec un accès.` })
    }
  }

  const compte = await Utilisateur.create({
    nom: membre.nom,
    email,
    motDePasseHash: await bcrypt.hash(email, 10),
    motDePasseDoitEtreChange: true,
    role: estChef ? 'chef_departement' : 'ouvrier',
    egliseId: req.egliseId,
  })

  membre.utilisateurId = compte.id
  // Le membre est marqué "Chef de département" pour rester cohérent avec son accès
  if (estChef) membre.role = 'Chef de département'
  await membre.save()

  if (departement) {
    departement.chefMembreId = membre.id
    departement.chefUtilisateurId = compte.id
    await departement.save()
  }

  res.status(201).json({
    email: compte.email,
    motDePasseInitial: email,
    role: compte.role,
    departement: departement ? departement.nom : null,
  })
}
