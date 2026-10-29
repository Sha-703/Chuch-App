import 'dotenv/config'
import app from './app.js'
import { sequelize } from './models/index.js'
import { importerFichiersLegacy } from './middlewares/upload.js'

const PORT = process.env.PORT ? Number(process.env.PORT) : (process.env.NODE_ENV === 'production' ? 8080 : 4000)

// Sécurité : refuser de démarrer si JWT_SECRET est manquant ou par défaut en production
if (!process.env.JWT_SECRET) {
  console.error('ERREUR : JWT_SECRET doit être défini dans les variables d\'environnement.')
  process.exit(1)
}
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'change-moi-en-production') {
  console.error('ERREUR : JWT_SECRET ne doit pas être la valeur par défaut en production.')
  process.exit(1)
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms))

// Synchronisation de la base en arrière-plan, avec nouvelles tentatives.
// On ÉCOUTE d'abord le port : sinon, si la base est momentanément injoignable
// au démarrage (IPv6, redémarrage Railway...), l'API ne répond jamais et les
// healthchecks renvoient 499 jusqu'au timeout de 30 s.
async function synchroniserBase() {
  const maxEssais = 10
  for (let essai = 1; essai <= maxEssais; essai++) {
    try {
      await sequelize.authenticate()
      await sequelize.sync({ alter: true }) // ajoute les colonnes manquantes
      console.log(`Base de données prête (essai ${essai}).`)
      // Récupère les fichiers encore sur le disque (photos/scans de l'ancienne
      // version) pour qu'ils survivent au prochain redéploiement.
      const importes = await importerFichiersLegacy()
      if (importes > 0) console.log(`${importes} fichier(s) importé(s) en base PostgreSQL.`)
      return
    } catch (err) {
      console.error(`Échec synchronisation base (essai ${essai}/${maxEssais}) :`, err.message)
      if (essai === maxEssais) {
        console.error('API démarrée MAIS base indisponible — /api/health répondra 503.')
        return
      }
      await pause(5000)
    }
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ChurchApp API démarrée sur http://0.0.0.0:${PORT}`)
  synchroniserBase()
})
