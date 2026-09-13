export async function envoyerOTPEmail({ to, code, destinataireNom }) {
  const apiKey = process.env.ZAVU_API_KEY
  const senderEmail = process.env.ZAVU_EMAIL_FROM
  if (!apiKey || !senderEmail) {
    throw new Error('ZAVU_API_KEY ou ZAVU_EMAIL_FROM manquant')
  }

  const res = await fetch('https://api.zavu.dev/v1/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      to,
      subject: 'Votre code de connexion ChurchApp',
      template: 'churchapp-otp',
      data: {
        prenom: destinataireNom || to,
        code,
        appName: 'ChurchApp',
      },
      from: senderEmail,
    }),
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`ZAVU email failed ${res.status}: ${text}`)
  }

  return text
}

export async function envoyerOTPSms({ to, code, destinataireNom }) {
  const apiKey = process.env.ZAVU_API_KEY
  const senderName = process.env.ZAVU_SMS_FROM
  if (!apiKey || !senderName) {
    throw new Error('ZAVU_API_KEY ou ZAVU_SMS_FROM manquant')
  }

  const res = await fetch('https://api.zavu.dev/v1/sms/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      to,
      message: `ChurchApp : votre code de connexion est ${code}. Il est valable 10 minutes.`,
      sender: senderName,
    }),
  })

  const text = await res.text()
  if (!res.ok) {
    throw new Error(`ZAVU SMS failed ${res.status}: ${text}`)
  }

  return text
}
