import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Eglise, Utilisateur, Communaute } from '../models/index.js'
import { journaliser } from '../lib/journal.js'
import { genererOTP } from '../lib/otp.js'
import { envoyerMail } from '../lib/mail.js'
import { envoyerOTPSms } from '../lib/zavu.js'
import crypto from 'crypto'

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://chuchapp-frontend-production.up.railway.app'

// Génère un token de vérification unique (valide 24h)
function genererTokenVerification() {
  return crypto.randomBytes(32).toString('hex')
}

// Envoie l'email de vérification (lien à cliquer, pas de code affiché)
async function sendVerificationEmail({ to, token, destinataireNom }) {
  const lien = `${FRONTEND_URL}/verifier-email?token=${token}`
  const ok = await envoyerMail({
    to,
    sujet: 'Vérifiez votre adresse e-mail — ChurchApp',
    texte: `Bonjour ${destinataireNom || to},

Bienvenue sur ChurchApp !

Pour activer votre compte, veuillez cliquer sur le lien suivant (valide 24 heures) :

${lien}

Si vous n'avez pas créé ce compte, ignorez ce message.

Cordialement,
L'équipe ChurchApp`,
  })
  return !!ok
}

// Emails : Gmail SMTP seulement
async function sendOtpEmail({ to, code, destinataireNom }) {
  const ok = await envoyerMail({
    to,
    sujet: 'Votre code de connexion ChurchApp',
    texte: `Bonjour ${destinataireNom || to},

Voici votre code de connexion provisoire :

Code OTP : ${code}

Utilisez ce code comme mot de passe à votre première connexion. Vous serez ensuite invité à le remplacer par un mot de passe personnel.

Cordialement,
L'équipe ChurchApp`,
  })
  return !!ok
}

// SMS : ZAVU seulement, jamais d'email
async function sendOtpSms({ to, code, destinataireNom }) {
  try {
    await envoyerOTPSms({ to, code, destinataireNom })
    return true
  } catch (err) {
    console.error('[ZAVU][SMS] Échec envoi OTP SMS :', err.message)
    return false
  }
}

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

  // Vérification e-mail obligatoire avant connexion
  if (!utilisateur.estVerifie) {
    return res.status(403).json({
      message: 'Veuillez vérifier votre adresse e-mail avant de vous connecter. Consultez votre boîte mail.',
      email: utilisateur.email,
      doitVerifierEmail: true,
    })
  }

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

// Un utilisateur déjà connecté change son propre mot de passe (page Paramètres).
// Si son compte porte encore un code OTP provisoire (motDePasseDoitEtreChange),
// l'ancien mot de passe n'a pas besoin d'être re-saisi : le simple fait d'avoir
// un token valide prouve déjà qu'il connaissait le code OTP au moment du login.
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

// Création d'une nouvelle église + ses deux comptes (pasteur, administrateur)
export async function creerEglise(req, res) {
  const { eglise, pasteur, administrateur, communauteId } = req.body

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
    communauteId: communauteId || null,
  })

  // Chaque compte reçoit un mot de passe provisoire (OTP) à usage unique ET
  // doit vérifier son adresse e-mail avant de pouvoir se connecter.
  const otpPasteur = genererOTP()
  const otpAdmin = genererOTP()
  const tokenPasteur = genererTokenVerification()
  const tokenAdmin = genererTokenVerification()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // +24h

  const comptePasteur = await Utilisateur.create({
    nom: pasteur.nom,
    email: pasteur.email,
    telephone: pasteur.telephone,
    role: 'pasteur',
    motDePasseHash: await bcrypt.hash(otpPasteur, 10),
    motDePasseDoitEtreChange: true,
    egliseId: nouvelleEglise.id,
    estVerifie: false,
    tokenVerification: tokenPasteur,
    tokenVerificationExpires: expires,
  })

  const compteAdmin = await Utilisateur.create({
    nom: administrateur.nom,
    email: administrateur.email,
    role: 'administrateur',
    motDePasseHash: await bcrypt.hash(otpAdmin, 10),
    motDePasseDoitEtreChange: true,
    egliseId: nouvelleEglise.id,
    estVerifie: false,
    tokenVerification: tokenAdmin,
    tokenVerificationExpires: expires,
  })

  await journaliser({
    action: 'eglise.creee',
    details: `Inscription de la nouvelle église "${nouvelleEglise.nom}"`,
    egliseNom: nouvelleEglise.nom,
    utilisateurNom: pasteur.nom,
  })

  const [pasteurMailOk, adminMailOk] = await Promise.all([
    sendVerificationEmail({ to: comptePasteur.email, token: tokenPasteur, destinataireNom: comptePasteur.nom }),
    sendVerificationEmail({ to: compteAdmin.email, token: tokenAdmin, destinataireNom: compteAdmin.nom }),
  ])

  console.log(
    `[VERIF] Pasteur ${comptePasteur.email}: token envoyé (${pasteurMailOk ? 'email envoyé' : 'échec email'}) | ` +
    `Admin ${compteAdmin.email}: token envoyé (${adminMailOk ? 'email envoyé' : 'échec email'})`
  )

  res.status(201).json({
    eglise: nouvelleEglise,
    comptes: [
      { email: comptePasteur.email, role: 'pasteur', doitVerifierEmail: true },
      { email: compteAdmin.email, role: 'administrateur', doitVerifierEmail: true },
    ],
    message: 'Comptes créés. Vérifiez vos e-mails pour activer vos comptes avant de vous connecter.',
  })
}

// Demander une réinitialisation de mot de passe (publique)
// L'utilisateur entre son email → reçoit un OTP par mail → se connecte avec ce code → est forcé de changer le mot de passe
export async function demanderReinitialisation(req, res) {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'E-mail requis.' })

  const utilisateur = await Utilisateur.findOne({ where: { email } })
  if (!utilisateur) {
    // Ne pas révéler que l'email n'existe pas
    return res.json({ email })
  }

  const otp = genererOTP()
  utilisateur.motDePasseHash = await bcrypt.hash(otp, 10)
  utilisateur.motDePasseDoitEtreChange = true
  await utilisateur.save()

  const sent = await sendOtpEmail({ to: utilisateur.email, code: otp, destinataireNom: utilisateur.nom })
  if (!sent) {
    await envoyerMail({
      to: utilisateur.email,
      sujet: 'Réinitialisation de votre mot de passe ChurchApp',
      texte: `Bonjour ${utilisateur.nom || utilisateur.email},

Vous avez demandé à réinitialiser votre mot de passe. Voici votre code de connexion provisoire :

Code OTP : ${otp}

Utilisez ce code comme mot de passe pour vous connecter. Vous serez ensuite invité à le remplacer par un mot de passe personnel.

Cordialement,
L'équipe ChurchApp`,
    }).then(() => true).catch(() => false)
  }

  console.log(`[OTP] ${utilisateur.email}: ${otp} (réinitialisation demandée)`)

  res.json({ email })
}

// Vérifier l'e-mail via le token reçu par courrier (GET public)
export async function verifierEmail(req, res) {
  const { token } = req.query
  if (!token) {
    return res.status(400).json({ message: 'Token de vérification manquant.' })
  }

  const utilisateur = await Utilisateur.findOne({
    where: { tokenVerification: token },
  })
  if (!utilisateur) {
    return res.status(400).json({ message: 'Token de vérification invalide.' })
  }

  if (utilisateur.tokenVerificationExpires && new Date() > utilisateur.tokenVerificationExpires) {
    return res.status(400).json({ message: 'Token de vérification expiré. Demandez-en un nouveau.' })
  }

  utilisateur.estVerifie = true
  utilisateur.tokenVerification = null
  utilisateur.tokenVerificationExpires = null
  await utilisateur.save()

  await journaliser({
    action: 'email.verifie',
    details: `E-mail vérifié pour ${utilisateur.email}`,
    utilisateurNom: utilisateur.nom,
  })

  res.json({
    message: 'Adresse e-mail vérifiée avec succès. Vous pouvez maintenant vous connecter.',
    email: utilisateur.email,
  })
}

// Renvoyer l'e-mail de vérification (POST public)
export async function demanderVerification(req, res) {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'E-mail requis.' })

  const utilisateur = await Utilisateur.findOne({ where: { email } })
  if (!utilisateur) {
    // Ne pas révéler si l'email existe
    return res.json({ message: 'Si ce compte existe, un e-mail de vérification a été envoyé.' })
  }

  if (utilisateur.estVerifie) {
    return res.status(400).json({ message: 'Ce compte est déjà vérifié.' })
  }

  const token = genererTokenVerification()
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // +24h

  utilisateur.tokenVerification = token
  utilisateur.tokenVerificationExpires = expires
  await utilisateur.save()

  const sent = await sendVerificationEmail({
    to: utilisateur.email,
    token,
    destinataireNom: utilisateur.nom,
  })

  console.log(`[VERIF] ${utilisateur.email}: token renvoyé (${sent ? 'email envoyé' : 'échec email'})`)

  res.json({ message: "Si ce compte existe et n'est pas encore vérifié, un e-mail de vérification a été renvoyé." })
}
