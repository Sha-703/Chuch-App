import { JournalActivite } from '../models/index.js'

// N'échoue jamais l'action principale si le journal a un souci d'écriture.
export async function journaliser({ action, details, egliseNom, utilisateurNom }) {
  try {
    await JournalActivite.create({ action, details, egliseNom, utilisateurNom })
  } catch (err) {
    console.error('Échec écriture journal activité :', err.message)
  }
}
