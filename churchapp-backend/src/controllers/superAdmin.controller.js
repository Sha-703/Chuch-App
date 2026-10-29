import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import {
  SuperAdmin, Eglise, Utilisateur, Membre, Annonce, Correspondance, JournalActivite, Communaute,
} from '../models/index.js'
import { journaliser } from '../lib/journal.js'
import { supprimerFichier } from '../middlewares/upload.js'

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
  const [nbEglises, nbEglisesActives, nbMembres, nbAnnonces, nbCommunautes] = await Promise.all([
    Eglise.count(),
    Eglise.count({ where: { statut: 'actif' } }),
    Membre.count(),
    Annonce.count(),
    Communaute.count(),
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
    nbCommunautes,
    nbCorrespondancesEnRetard: nbEnRetard,
  })
}

// --- Gestion des églises ---
export async function listerEglisesSysteme(req, res) {
  const { recherche } = req.query
  const where = recherche ? { nom: { [Op.like]: `%${recherche}%` } } : {}
  const eglises = await Eglise.findAll({
    where,
    include: [
      { model: Communaute, attributes: ['id', 'nom'] },
      { model: Utilisateur, attributes: ['id', 'nom', 'email', 'role', 'telephone'] },
    ],
    order: [['nom', 'ASC']],
  })

  const avecCompteurs = await Promise.all(
    eglises.map(async (e) => {
      const json = e.toJSON()
      // Comptes de direction (pasteur / administrateur) pour l'édition depuis la console
      const comptes = json.Utilisateurs || json.utilisateurs || []
      json.comptesDirection = comptes
        .filter((u) => u.role === 'pasteur' || u.role === 'administrateur')
        .map(({ id, nom, email, role, telephone }) => ({ id, nom, email, role, telephone }))
      delete json.Utilisateurs
      delete json.utilisateurs
      return {
        ...json,
        nbMembres: await Membre.count({ where: { egliseId: e.id } }),
        nbUtilisateurs: await Utilisateur.count({ where: { egliseId: e.id } }),
      }
    })
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

// --- Édition complète d'une église (informations + comptes pasteur/administrateur) ---
export async function modifierEglise(req, res) {
  const { eglise: infos, pasteur, administrateur, communauteId } = req.body

  const eglise = await Eglise.findByPk(req.params.id)
  if (!eglise) return res.status(404).json({ message: 'Église introuvable.' })

  // 1. Informations de l'église
  if (infos) {
    if (infos.nom !== undefined) {
      if (!String(infos.nom).trim()) return res.status(400).json({ message: 'Le nom de l\'église ne peut pas être vide.' })
      eglise.nom = String(infos.nom).trim()
    }
    if (infos.denomination !== undefined) eglise.denomination = infos.denomination || null
    if (infos.ville !== undefined) eglise.ville = infos.ville || null
    if (communauteId !== undefined) {
      if (communauteId) {
        const communaute = await Communaute.findByPk(communauteId)
        if (!communaute) return res.status(404).json({ message: 'Communauté introuvable.' })
      }
      eglise.communauteId = communauteId || null
    }
    await eglise.save()
  }

  // 2. Comptes pasteur / administrateur de l'église
  const comptes = await Utilisateur.findAll({ where: { egliseId: eglise.id, role: ['pasteur', 'administrateur'] } })
  const majComptes = []

  for (const [cle, roleAttendu] of [['pasteur', 'pasteur'], ['administrateur', 'administrateur']]) {
    const donnees = req.body[cle]
    if (!donnees) continue
    const compte = comptes.find((c) => c.role === roleAttendu)
    if (!compte) continue // pas de compte correspondant : on n'en crée pas ici (voir création)

    if (donnees.nom !== undefined && String(donnees.nom).trim()) compte.nom = String(donnees.nom).trim()
    if (donnees.telephone !== undefined) compte.telephone = donnees.telephone || null
    if (donnees.email !== undefined && donnees.email && donnees.email !== compte.email) {
      const email = String(donnees.email).toLowerCase().trim()
      const existant = await Utilisateur.findOne({ where: { email, id: { [Op.ne]: compte.id } } })
      if (existant) return res.status(409).json({ message: `Un compte existe déjà avec l'e-mail ${email}.` })
      compte.email = email
      // Le mot de passe initial reste l'e-mail : si l'utilisateur n'a pas encore
      // changé son mot de passe, on le recalcule avec le nouvel e-mail.
      if (compte.motDePasseDoitEtreChange) compte.motDePasseHash = await bcrypt.hash(email, 10)
    }
    majComptes.push(compte.save())
  }
  await Promise.all(majComptes)

  await journaliser({
    action: 'eglise.modifiee',
    details: `Église "${eglise.nom}" modifiée par le Super Admin`,
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

  // Le nouveau mot de passe initial = l'adresse e-mail
  utilisateur.motDePasseHash = await bcrypt.hash(utilisateur.email, 10)
  utilisateur.motDePasseDoitEtreChange = true
  await utilisateur.save()

  await journaliser({
    action: 'utilisateur.mdp_reinitialise',
    details: `Mot de passe réinitialisé pour ${utilisateur.email} (mot de passe initial = e-mail)`,
    utilisateurNom: 'Super Admin',
  })

  res.json({ email: utilisateur.email, motDePasseInitial: utilisateur.email })
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

// --- Édition d'un compte utilisateur (nom, e-mail, rôle) ---
const ROLES_VALIDES = ['pasteur', 'administrateur', 'tresorier', 'ouvrier', 'communaute']

export async function modifierUtilisateur(req, res) {
  const { nom, email, role } = req.body

  const utilisateur = await Utilisateur.findByPk(req.params.id)
  if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' })

  if (nom !== undefined) {
    if (!String(nom).trim()) return res.status(400).json({ message: 'Le nom ne peut pas être vide.' })
    utilisateur.nom = String(nom).trim()
  }

  if (email !== undefined && email && email !== utilisateur.email) {
    const nouvelEmail = String(email).toLowerCase().trim()
    const existant = await Utilisateur.findOne({ where: { email: nouvelEmail, id: { [Op.ne]: utilisateur.id } } })
    if (existant) return res.status(409).json({ message: `Un compte existe déjà avec l'e-mail ${nouvelEmail}.` })
    utilisateur.email = nouvelEmail
    // Mot de passe initial = e-mail : recalculé tant qu'il n'a pas été changé
    if (utilisateur.motDePasseDoitEtreChange) utilisateur.motDePasseHash = await bcrypt.hash(nouvelEmail, 10)
  }

  if (role !== undefined) {
    if (!ROLES_VALIDES.includes(role)) return res.status(400).json({ message: 'Rôle invalide.' })
    // Un compte rattaché à une communauté ne doit pas garder d'église, et inversement
    if (role === 'communaute' && !utilisateur.communauteId) {
      return res.status(400).json({ message: 'Un rôle "communaute" nécessite un rattachement à une communauté — créez-le depuis la page Communautés.' })
    }
    if (role !== 'communaute') utilisateur.communauteId = null
    utilisateur.role = role
  }

  await utilisateur.save()

  await journaliser({
    action: 'utilisateur.modifie',
    details: `Compte ${utilisateur.email} modifié (rôle : ${utilisateur.role}) par le Super Admin`,
    utilisateurNom: 'Super Admin',
  })

  res.json(utilisateur)
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

  await supprimerFichier(annonce.photoUrl)
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

// --- Création directe d'une église par le Super Admin ---
// Le mot de passe initial de chaque compte = son adresse e-mail.
export async function creerEgliseParSuperAdmin(req, res) {
  const { eglise, pasteur, administrateur, communauteId } = req.body

  if (!eglise?.nom || !pasteur?.email || !administrateur?.email) {
    return res.status(400).json({ message: 'Champs obligatoires manquants.' })
  }

  const existant = await Utilisateur.findOne({ where: { email: [pasteur.email, administrateur.email] } })
  if (existant) return res.status(409).json({ message: 'Un compte existe déjà avec l\'un de ces e-mails.' })

  const nouvelleEglise = await Eglise.create({
    nom: eglise.nom,
    denomination: eglise.denomination,
    ville: eglise.ville,
    communauteId: communauteId || null,
  })

  const comptePasteur = await Utilisateur.create({
    nom: pasteur.nom, email: pasteur.email, telephone: pasteur.telephone,
    role: 'pasteur', motDePasseHash: await bcrypt.hash(pasteur.email, 10), motDePasseDoitEtreChange: true, egliseId: nouvelleEglise.id,
  })
  const compteAdmin = await Utilisateur.create({
    nom: administrateur.nom, email: administrateur.email,
    role: 'administrateur', motDePasseHash: await bcrypt.hash(administrateur.email, 10), motDePasseDoitEtreChange: true, egliseId: nouvelleEglise.id,
  })

  await journaliser({
    action: 'eglise.creee_par_superadmin',
    details: `Église "${nouvelleEglise.nom}" créée directement par le Super Admin`,
    egliseNom: nouvelleEglise.nom,
    utilisateurNom: 'Super Admin',
  })

  // Le pasteur et l'administrateur font déjà partie du personnel (Ressources Humaines)
  await Promise.all([
    Membre.create({
      nom: pasteur.nom,
      role: 'Pasteur',
      contact: pasteur.telephone || null,
      depuis: new Date().toISOString().slice(0, 4),
      egliseId: nouvelleEglise.id,
    }),
    Membre.create({
      nom: administrateur.nom,
      role: 'Administrateur',
      contact: null,
      depuis: new Date().toISOString().slice(0, 4),
      egliseId: nouvelleEglise.id,
    }),
  ])

  res.status(201).json({
    eglise: nouvelleEglise,
    comptes: [
      { email: comptePasteur.email, role: 'pasteur', motDePasseInitial: pasteur.email },
      { email: compteAdmin.email, role: 'administrateur', motDePasseInitial: administrateur.email },
    ],
    message: 'Église créée. Le mot de passe initial de chaque compte est son adresse e-mail.',
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

// --- Édition d'une communauté ---
export async function modifierCommunaute(req, res) {
  const { nom, description } = req.body

  const communaute = await Communaute.findByPk(req.params.id)
  if (!communaute) return res.status(404).json({ message: 'Communauté introuvable.' })

  if (nom !== undefined) {
    if (!String(nom).trim()) return res.status(400).json({ message: 'Le nom ne peut pas être vide.' })
    communaute.nom = String(nom).trim()
  }
  if (description !== undefined) communaute.description = description || null

  await communaute.save()

  await journaliser({
    action: 'communaute.modifiee',
    details: `Communauté "${communaute.nom}" modifiée par le Super Admin`,
    utilisateurNom: 'Super Admin',
  })

  res.json(communaute)
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

// Crée le compte de connexion d'une communauté
// Le mot de passe initial = l'adresse e-mail.
export async function creerCompteCommunaute(req, res) {
  const { email, nom } = req.body
  const communaute = await Communaute.findByPk(req.params.id)
  if (!communaute) return res.status(404).json({ message: 'Communauté introuvable.' })

  const existant = await Utilisateur.findOne({ where: { email } })
  if (existant) return res.status(409).json({ message: 'Un compte existe déjà avec cet e-mail.' })

  const compte = await Utilisateur.create({
    nom: nom || communaute.nom,
    email,
    motDePasseHash: await bcrypt.hash(email, 10),
    motDePasseDoitEtreChange: true,
    role: 'communaute',
    communauteId: communaute.id,
  })

  await journaliser({
    action: 'communaute.compte_cree',
    details: `Compte de connexion créé pour la communauté "${communaute.nom}"`,
    utilisateurNom: 'Super Admin',
  })

  res.status(201).json({ email: compte.email, motDePasseInitial: email })
}

// --- Le Super Admin change son propre mot de passe (page Paramètres) ---
export async function changerMonMotDePasseSuperAdmin(req, res) {
  const { motDePasseActuel, nouveauMotDePasse } = req.body
  if (!motDePasseActuel || !nouveauMotDePasse || nouveauMotDePasse.length < 6) {
    return res.status(400).json({ message: 'Mot de passe actuel et nouveau mot de passe (6 caractères min.) requis.' })
  }

  const superAdmin = await SuperAdmin.findByPk(req.superAdmin.sub)
  if (!superAdmin) return res.status(404).json({ message: 'Compte introuvable.' })

  const valide = await bcrypt.compare(motDePasseActuel, superAdmin.motDePasseHash)
  if (!valide) return res.status(401).json({ message: 'Mot de passe actuel incorrect.' })

  superAdmin.motDePasseHash = await bcrypt.hash(nouveauMotDePasse, 10)
  await superAdmin.save()

  res.json({ message: 'Mot de passe mis à jour.' })
}
