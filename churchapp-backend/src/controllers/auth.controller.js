import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Eglise, Utilisateur, Communaute } from '../models/index.js'
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

  // Comptes/églises bloqués par le Super Admin (voir Phase 12)
  if (!utilisateur.actif) {
    return res.status(403).json({ message: 'Ce compte a été bloqué. Contactez le support ChurchApp.' })
  }

  // Un compte "communaute" n'a pas d'église — même page de connexion, mais
  // redirection différente côté frontend selon utilisateur.role (voir Phase 13).
  if (utilisateur.role === 'communaute') {
    const communaute = await Communaute.findByPk(utilisateur.communauteId)
    const token = signToken(utilisateur)
    return res.json({
      token,
      utilisateur: { id: utilisateur.id, nom: utilisateur.nom, role: utilisateur.role, email: utilisateur.email },
      eglise: null,
      communaute: communaute ? { id: communaute.id, nom: communaute.nom } : null,
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
  })
}

// Création d'une nouvelle église + ses deux comptes (pasteur, administrateur)
export async function creerEglise(req, res) {
  const { eglise, pasteur, administrateur } = req.body

  if (!eglise?.nom || !pasteur?.email || !administrateur?.email) {
    return res.status(400).json({ message: 'Champs obligatoires manquants.' })
  }

  const existant = await Utilisateur.findOne({
    where: { email: [pasteur.email, administrateur.email] },
  })
  if (existant) {
    return res.status(409).json({ message: 'Un compte existe déjà avec l\u2019un de ces e-mails.' })
  }

  const nouvelleEglise = await Eglise.create({
    nom: eglise.nom,
    denomination: eglise.denomination,
    ville: eglise.ville,
  })

  // Mot de passe provisoire — à remplacer par un vrai flux d'invitation par e-mail
  const motDePasseProvisoire = Math.random().toString(36).slice(-10)
  const hash = await bcrypt.hash(motDePasseProvisoire, 10)

  const comptePasteur = await Utilisateur.create({
    nom: pasteur.nom,
    email: pasteur.email,
    telephone: pasteur.telephone,
    role: 'pasteur',
    motDePasseHash: hash,
    egliseId: nouvelleEglise.id,
  })

  const compteAdmin = await Utilisateur.create({
    nom: administrateur.nom,
    email: administrateur.email,
    role: 'administrateur',
    motDePasseHash: hash,
    egliseId: nouvelleEglise.id,
  })

  await journaliser({
    action: 'eglise.creee',
    details: `Inscription de la nouvelle église "${nouvelleEglise.nom}"`,
    egliseNom: nouvelleEglise.nom,
    utilisateurNom: pasteur.nom,
  })

  // NOTE: en production, envoyer motDePasseProvisoire par e-mail à chaque compte,
  // ne jamais le renvoyer dans la réponse HTTP. On le renvoie ici uniquement
  // pour permettre de tester le flux en développement sans service d'e-mail.
  res.status(201).json({
    eglise: nouvelleEglise,
    comptes: [
      { email: comptePasteur.email, role: 'pasteur' },
      { email: compteAdmin.email, role: 'administrateur' },
    ],
    motDePasseProvisoire,
  })
}
