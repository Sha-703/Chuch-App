import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import {
  SuperAdmin, Eglise, Utilisateur, Membre, Annonce, Correspondance, JournalActivite, Communaute,
} from '../models/index.js'
import { journaliser } from '../lib/journal.js'

export async function login(req, res) {
  const { email, motDePasse } = req.body
  if (!email || !motDePasse) return res.status(400).json({ message: 'E-mail et mot de passe requis.' })

  const superAdmin = await SuperAdmin.findOne({ where: { email } })
  if (!superAdmin) return res.status(401).json({ message: 'Identifiants invalides.' })

  const valide = await bcrypt.compare(motDePasse, superAdmin.motDePasseHash)
  if (!valide) return res.status(401).json({ message: 'Identifiants invalides.' })

  const token = jwt.sign(
    { sub: superAdmin.id, isSuperAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )

  res.json({ token, superAdmin: { id: superAdmin.id, nom: superAdmin.nom, email: superAdmin.email } })
}

// --- Tableau de bord système ---
export async function dashboard(req, res) {
  const [nbEglises, nbEglisesActives, nbMembres, nbAnnonces] = await Promise.all([
    Eglise.count(),
    Eglise.count({ where: { statut: 'actif' } }),
    Membre.count(),
    Annonce.count(),
  ])

  const aujourdHui = new Date().toISOString().slice(0, 10)
  const correspondancesOuvertes = await Correspondance.findAll({
    where: { etat: { [Op.ne]: 'archive' }, dateLimiteTraitement: { [Op.ne]: null } },
    attributes: ['dateLimiteTraitement'],
  })
  const nbEnRetard = correspondancesOuvertes.filter((c) => aujourdHui > c.dateLimiteTraitement).length

  res.json({
    nbEglises,
    nbEglisesActives,
    nbEglisesSuspendues: nbEglises - nbEglisesActives,
    nbMembres,
    nbAnnonces,
    nbCorrespondancesEnRetard: nbEnRetard,
  })
}

// --- Gestion des églises ---
export async function listerEglisesSysteme(req, res) {
  const { recherche } = req.query
  const where = recherche ? { nom: { [Op.like]: `%${recherche}%` } } : {}
  const eglises = await Eglise.findAll({
    where,
    order: [['nom', 'ASC']],
  })

  const avecCompteurs = await Promise.all(
    eglises.map(async (e) => ({
      ...e.toJSON(),
      nbMembres: await Membre.count({ where: { egliseId: e.id } }),
      nbUtilisateurs: await Utilisateur.count({ where: { egliseId: e.id } }),
    }))
  )
  res.json(avecCompteurs)
}

export async function changerStatutEglise(req, res) {
  const { statut } = req.body
  if (!['actif', 'suspendu'].includes(statut)) return res.status(400).json({ message: 'Statut invalide.' })

  const eglise = await Eglise.findByPk(req.params.id)
  if (!eglise) return res.status(404).json({ message: 'Église introuvable.' })

  eglise.statut = statut
  await eglise.save()

  await journaliser({
    action: statut === 'suspendu' ? 'eglise.suspendue' : 'eglise.reactivee',
    details: `Église "${eglise.nom}" ${statut === 'suspendu' ? 'suspendue' : 'réactivée'} par le Super Admin`,
    egliseNom: eglise.nom,
    utilisateurNom: 'Super Admin',
  })

  res.json(eglise)
}

export async function supprimerEglise(req, res) {
  const eglise = await Eglise.findByPk(req.params.id)
  if (!eglise) return res.status(404).json({ message: 'Église introuvable.' })

  await journaliser({
    action: 'eglise.supprimee',
    details: `Église "${eglise.nom}" supprimée définitivement par le Super Admin`,
    egliseNom: eglise.nom,
    utilisateurNom: 'Super Admin',
  })

  await eglise.destroy() // cascade sur toutes les données liées
  res.status(204).send()
}

// --- Gestion des utilisateurs ---
export async function listerUtilisateursSysteme(req, res) {
  const utilisateurs = await Utilisateur.findAll({
    attributes: { exclude: ['motDePasseHash'] },
    include: [{ model: Eglise, attributes: ['id', 'nom'] }],
    order: [['nom', 'ASC']],
  })
  res.json(utilisateurs)
}

export async function reinitialiserMotDePasse(req, res) {
  const utilisateur = await Utilisateur.findByPk(req.params.id)
  if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' })

  const motDePasseProvisoire = Math.random().toString(36).slice(-10)
  utilisateur.motDePasseHash = await bcrypt.hash(motDePasseProvisoire, 10)
  await utilisateur.save()

  await journaliser({
    action: 'utilisateur.mdp_reinitialise',
    details: `Mot de passe réinitialisé pour ${utilisateur.email}`,
    utilisateurNom: 'Super Admin',
  })

  res.json({ email: utilisateur.email, motDePasseProvisoire })
}

export async function toggleBlocageUtilisateur(req, res) {
  const utilisateur = await Utilisateur.findByPk(req.params.id)
  if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' })

  utilisateur.actif = !utilisateur.actif
  await utilisateur.save()

  await journaliser({
    action: utilisateur.actif ? 'utilisateur.debloque' : 'utilisateur.bloque',
    details: `Compte ${utilisateur.email} ${utilisateur.actif ? 'débloqué' : 'bloqué'} par le Super Admin`,
    utilisateurNom: 'Super Admin',
  })

  res.json({ id: utilisateur.id, actif: utilisateur.actif })
}

// --- Modération des annonces ---
export async function listerAnnoncesSysteme(req, res) {
  const annonces = await Annonce.findAll({
    include: [{ model: Eglise, attributes: ['id', 'nom'] }],
    order: [['createdAt', 'DESC']],
  })
  res.json(annonces)
}

export async function supprimerAnnonceSysteme(req, res) {
  const annonce = await Annonce.findByPk(req.params.id)
  if (!annonce) return res.status(404).json({ message: 'Annonce introuvable.' })

  await journaliser({
    action: 'annonce.moderee',
    details: `Annonce "${annonce.titre}" retirée par le Super Admin`,
    utilisateurNom: 'Super Admin',
  })

  await annonce.destroy()
  res.status(204).send()
}

// --- Journal d'activité ---
export async function listerJournal(req, res) {
  const entrees = await JournalActivite.findAll({
    order: [['createdAt', 'DESC']],
    limit: 100,
  })
  res.json(entrees)
}

// --- Création directe d'une église par le Super Admin (sans passer par l'inscription publique) ---
export async function creerEgliseParSuperAdmin(req, res) {
  const { eglise, pasteur, administrateur, communauteId } = req.body

  if (!eglise?.nom || !pasteur?.email || !administrateur?.email) {
    return res.status(400).json({ message: 'Champs obligatoires manquants.' })
  }

  const existant = await Utilisateur.findOne({ where: { email: [pasteur.email, administrateur.email] } })
  if (existant) return res.status(409).json({ message: 'Un compte existe déjà avec l\u2019un de ces e-mails.' })

  const nouvelleEglise = await Eglise.create({
    nom: eglise.nom,
    denomination: eglise.denomination,
    ville: eglise.ville,
    communauteId: communauteId || null,
  })

  const motDePasseProvisoire = Math.random().toString(36).slice(-10)
  const hash = await bcrypt.hash(motDePasseProvisoire, 10)

  const comptePasteur = await Utilisateur.create({
    nom: pasteur.nom, email: pasteur.email, telephone: pasteur.telephone,
    role: 'pasteur', motDePasseHash: hash, egliseId: nouvelleEglise.id,
  })
  const compteAdmin = await Utilisateur.create({
    nom: administrateur.nom, email: administrateur.email,
    role: 'administrateur', motDePasseHash: hash, egliseId: nouvelleEglise.id,
  })

  await journaliser({
    action: 'eglise.creee_par_superadmin',
    details: `Église "${nouvelleEglise.nom}" créée directement par le Super Admin`,
    egliseNom: nouvelleEglise.nom,
    utilisateurNom: 'Super Admin',
  })

  res.status(201).json({
    eglise: nouvelleEglise,
    comptes: [
      { email: comptePasteur.email, role: 'pasteur' },
      { email: compteAdmin.email, role: 'administrateur' },
    ],
    motDePasseProvisoire,
  })
}

// --- Gestion des communautés (dénominations) ---
export async function listerCommunautes(req, res) {
  const communautes = await Communaute.findAll({ order: [['nom', 'ASC']] })
  const avecCompteurs = await Promise.all(
    communautes.map(async (c) => ({
      ...c.toJSON(),
      nbEglises: await Eglise.count({ where: { communauteId: c.id } }),
    }))
  )
  res.json(avecCompteurs)
}

export async function creerCommunaute(req, res) {
  const { nom, description } = req.body
  if (!nom) return res.status(400).json({ message: 'nom requis.' })
  const communaute = await Communaute.create({ nom, description })

  await journaliser({
    action: 'communaute.creee',
    details: `Communauté "${communaute.nom}" créée par le Super Admin`,
    utilisateurNom: 'Super Admin',
  })

  res.status(201).json(communaute)
}

// Rattache (ou détache si communauteId est vide) une église existante à une communauté
export async function rattacherEglise(req, res) {
  const { communauteId } = req.body
  const eglise = await Eglise.findByPk(req.params.id)
  if (!eglise) return res.status(404).json({ message: 'Église introuvable.' })

  eglise.communauteId = communauteId || null
  await eglise.save()

  await journaliser({
    action: 'eglise.rattachee',
    details: `Église "${eglise.nom}" ${communauteId ? 'rattachée à une communauté' : 'détachée de sa communauté'}`,
    egliseNom: eglise.nom,
    utilisateurNom: 'Super Admin',
  })

  res.json(eglise)
}

// Crée le compte de connexion d'une communauté (se connecte ensuite via la page normale /)
export async function creerCompteCommunaute(req, res) {
  const { email, nom } = req.body
  const communaute = await Communaute.findByPk(req.params.id)
  if (!communaute) return res.status(404).json({ message: 'Communauté introuvable.' })

  const existant = await Utilisateur.findOne({ where: { email } })
  if (existant) return res.status(409).json({ message: 'Un compte existe déjà avec cet e-mail.' })

  const motDePasseProvisoire = Math.random().toString(36).slice(-10)
  const hash = await bcrypt.hash(motDePasseProvisoire, 10)

  const compte = await Utilisateur.create({
    nom: nom || communaute.nom,
    email,
    motDePasseHash: hash,
    role: 'communaute',
    communauteId: communaute.id,
  })

  await journaliser({
    action: 'communaute.compte_cree',
    details: `Compte de connexion créé pour la communauté "${communaute.nom}"`,
    utilisateurNom: 'Super Admin',
  })

  res.status(201).json({ email: compte.email, motDePasseProvisoire })
}
