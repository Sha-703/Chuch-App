import nodemailer from 'nodemailer'

let transporter = null

function getTransporter() {
  if (transporter) return transporter

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
  const transporter = getTransporter()
  if (!transporter) {
    console.warn(`[MAIL] Non envoyé (pas de config SMTP). To: ${to}`)
    return false
  }

  try {
    await transporter.sendMail({
      from: `"ChurchApp" <${process.env.SMTP_USER}>`,
      to,
      subject: sujet,
      text: texte,
    })
    console.log(`[MAIL] Envoyé à ${to}`)
    return true
  } catch (err) {
    console.error(`[MAIL] Échec pour ${to}:`, err.message)
    return false
  }
}
