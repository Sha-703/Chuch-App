import bcrypt from 'bcryptjs'
import { Membre, Utilisateur } from '../models/index.js'
import { genererOTP } from '../lib/otp.js'

export async function listerMembres(req, res) {
  const membres = await Membre.findAll({
    where: { egliseId: req.egliseId },
    include: [{ model: Utilisateur, as: 'compte', attributes: ['id', 'email'] }],
    order: [['nom', 'ASC']],
  })
  res.json(membres)
}

export async function creerMembre(req, res) {
  const { nom, role, contact, depuis } = req.body
  if (!nom) return res.status(400).json({ message: 'nom requis.' })
  const membre = await Membre.create({ nom, role, contact, depuis, egliseId: req.egliseId })
  res.status(201).json(membre)
}

// Donne à un membre un accès de connexion en tant qu'"ouvrier" (droits limités :
// il ne verra que son propre espace pour signer sa présence aux cultes).
export async function creerCompteOuvrier(req, res) {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'email requis.' })

  const membre = await Membre.findOne({ where: { id: req.params.id, egliseId: req.egliseId } })
  if (!membre) return res.status(404).json({ message: 'Membre introuvable.' })
  if (membre.utilisateurId) return res.status(409).json({ message: 'Ce membre a déjà un compte.' })

  const existant = await Utilisateur.findOne({ where: { email } })
  if (existant) return res.status(409).json({ message: 'Un compte existe déjà avec cet e-mail.' })

  const otp = genererOTP()
  const hash = await bcrypt.hash(otp, 10)

  const compte = await Utilisateur.create({
    nom: membre.nom,
    email,
    motDePasseHash: hash,
    motDePasseDoitEtreChange: true,
    role: 'ouvrier',
    egliseId: req.egliseId,
  })

  membre.utilisateurId = compte.id
  await membre.save()

  // NOTE: comme pour la création d'église, le code OTP est renvoyé ici pour
  // permettre de tester sans service d'e-mail ; en production il faudrait
  // l'envoyer directement au membre par e-mail ou SMS.
  res.status(201).json({ email: compte.email, otp })
}
