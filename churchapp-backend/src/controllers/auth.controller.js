import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Eglise, Utilisateur, Communaute, Membre } from '../models/index.js'
import { journaliser } from '../lib/journal.js'

function signToken(utilisateur) {
  return jwt.sign(
    { sub: utilisateur.id, egliseId: utilisateur.egliseId, communauteId: utilisateur.communauteId, role: utilisateur.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

export async function login(req, res) {
  const { email, motDePasse } = req.body
  if (!email || !motDePasse) {
    return res.status(400).json({ message: 'E-mail et mot de passe requis.' })
  }
  const utilisateur = await Utilisateur.findOne({ where: { email } })
  if (!utilisateur) return res.status(401).json({ message: 'Identifiants invalides.' })

  const valide = await bcrypt.compare(motDePasse, utilisateur.motDePasseHash)
  if (!valide) return res.status(401).json({ message: 'Identifiants invalides.' })

  if (!utilisateur.actif) {
    return res.status(403).json({ message: 'Ce compte a été bloqué. Contactez le support ChurchApp.' })
  }

  if (utilisateur.role === 'communaute') {
    const communaute = await Communaute.findByPk(utilisateur.communauteId)
    const token = signToken(utilisateur)
    return res.json({
      token,
      utilisateur: { id: utilisateur.id, nom: utilisateur.nom, role: utilisateur.role, email: utilisateur.email },
      eglise: null,
      communaute: communaute ? { id: communaute.id, nom: communaute.nom } : null,
      doitChangerMotDePasse: utilisateur.motDePasseDoitEtreChange,
    })
  }

  const eglise = await Eglise.findByPk(utilisateur.egliseId)
  if (eglise?.statut === 'suspendu') {
    return res.status(403).json({ message: 'Cette église a été suspendue. Contactez le support ChurchApp.' })
  }

  const token = signToken(utilisateur)

  res.json({
    token,
    utilisateur: { id: utilisateur.id, nom: utilisateur.nom, role: utilisateur.role, email: utilisateur.email },
    eglise: eglise ? { id: eglise.id, nom: eglise.nom, ville: eglise.ville } : null,
    communaute: null,
    doitChangerMotDePasse: utilisateur.motDePasseDoitEtreChange,
  })
}

export async function changerMonMotDePasse(req, res) {
  const { motDePasseActuel, nouveauMotDePasse } = req.body
  if (!nouveauMotDePasse || nouveauMotDePasse.length < 6) {
    return res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' })
  }

  const utilisateur = await Utilisateur.findByPk(req.auth.sub)
  if (!utilisateur) return res.status(404).json({ message: 'Utilisateur introuvable.' })

  if (!utilisateur.motDePasseDoitEtreChange) {
    if (!motDePasseActuel) return res.status(400).json({ message: 'Mot de passe actuel requis.' })
    const valide = await bcrypt.compare(motDePasseActuel, utilisateur.motDePasseHash)
    if (!valide) return res.status(401).json({ message: 'Mot de passe actuel incorrect.' })
  }

  utilisateur.motDePasseHash = await bcrypt.hash(nouveauMotDePasse, 10)
  utilisateur.motDePasseDoitEtreChange = false
  await utilisateur.save()

  res.json({ message: 'Mot de passe mis à jour.' })
}

// Création d'une église par un utilisateur déjà connecté (admin)
// Le mot de passe initial de chaque compte = son adresse e-mail.
// L'utilisateur devra le changer à sa première connexion.
export async function creerEglise(req, res) {
  const { eglise, pasteur, administrateur, communauteId } = req.body

  if (!eglise?.nom || !pasteur?.email || !administrateur?.email) {
    return res.status(400).json({ message: 'Champs obligatoires manquants.' })
  }

  const existant = await Utilisateur.findOne({
    where: { email: [pasteur.email, administrateur.email] },
  })
  if (existant) {
    return res.status(409).json({ message: 'Un compte existe déjà avec l\'un de ces e-mails.' })
  }

  const nouvelleEglise = await Eglise.create({
    nom: eglise.nom,
    denomination: eglise.denomination,
    ville: eglise.ville,
    communauteId: communauteId || null,
  })

  // Mot de passe initial = adresse e-mail de chaque compte
  const comptePasteur = await Utilisateur.create({
    nom: pasteur.nom,
    email: pasteur.email,
    telephone: pasteur.telephone,
    role: 'pasteur',
    motDePasseHash: await bcrypt.hash(pasteur.email, 10),
    motDePasseDoitEtreChange: true,
    egliseId: nouvelleEglise.id,
  })

  const compteAdmin = await Utilisateur.create({
    nom: administrateur.nom,
    email: administrateur.email,
    role: 'administrateur',
    motDePasseHash: await bcrypt.hash(administrateur.email, 10),
    motDePasseDoitEtreChange: true,
    egliseId: nouvelleEglise.id,
  })

  await journaliser({
    action: 'eglise.creee',
    details: `Inscription de la nouvelle église "${nouvelleEglise.nom}"`,
    egliseNom: nouvelleEglise.nom,
    utilisateurNom: pasteur.nom,
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
