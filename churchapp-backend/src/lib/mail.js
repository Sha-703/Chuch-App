import nodemailer from 'nodemailer'

let transporter = null
let lastTransportTime = 0
const TRANSPORT_TTL = 60_000 // 1 minute — recréer le transporteur après cette durée

function getTransporter() {
  const now = Date.now()
  if (transporter && now - lastTransportTime < TRANSPORT_TTL) {
    return transporter
  }
  // Recycler le transporteur (TTL écoulé ou première utilisation)
  transporter = null
  lastTransportTime = now

  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT, 10) || 587
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    console.warn(
      '[MAIL] SMTP non configuré (SMTP_HOST, SMTP_USER, SMTP_PASS manquants). ' +
      'Les e-mails ne seront pas envoyés.'
    )
    return null
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })

  return transporter
}

export async function envoyerMail({ to, sujet, texte }) {
  const transport = getTransporter()
  if (!transport) {
    console.warn(`[MAIL] Non envoyé (pas de config SMTP). To: ${to}`)
    return false
  }

  // Vérifier la connexion SMTP AVANT d'envoyer
  try {
    await transport.verify()
  } catch (verifyErr) {
    console.error(`[MAIL] Vérification SMTP échouée pour ${to}:`, verifyErr.message)
    console.error(
      '  → Vérifie tes identifiants SMTP (SMTP_USER/SMTP_PASS) dans le .env\n' +
      '  → Si Gmail : https://myaccount.google.com/apppasswords\n' +
      '  → Si Railway : utilise Mailtrap (https://mailtrap.io) comme alternative'
    )
    // Forcer la recréation du transporteur au prochain appel
    transporter = null
    return false
  }

  try {
    await transport.sendMail({
      from: `"ChurchApp" <${process.env.SMTP_USER}>`,
      to,
      subject: sujet,
      text: texte,
    })
    console.log(`[MAIL] Envoyé à ${to}`)
    return true
  } catch (err) {
    console.error(`[MAIL] Échec pour ${to}:`, err.message)
    console.error(`[MAIL] Stack:`, err.stack?.split('\n').slice(0, 5).join(' | '))
    // Forcer la recréation du transporteur au prochain appel
    transporter = null
    return false
  }
}
