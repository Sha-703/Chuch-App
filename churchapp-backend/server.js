import 'dotenv/config'
import app from './app.js'
import { sequelize } from './models/index.js'

const PORT = process.env.PORT ? Number(process.env.PORT) : (process.env.NODE_ENV === 'production' ? 8080 : 4000)

// Securite : refuser de demarrer si JWT_SECRET est manquant ou par defaut en production
if (!process.env.JWT_SECRET) {
  console.error('ERREUR : JWT_SECRET doit etre defini dans les variables d\'environnement.')
  process.exit(1)
}
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET === 'change-moi-en-production') {
  console.error('ERREUR : JWT_SECRET ne doit pas etre la valeur par defaut en production.')
  process.exit(1)
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms))

// Synchronisation de la base en arriere-plan, avec nouvelles tentatives.
// On ECOUTE d'abord le port : sinon, si la base est momentanement injoignable
// au demarrage, l'API ne repond jamais (les healthchecks Railway renvoient 499).
async function synchroniserBase() {
  const maxEssais = 10
  for (let essai = 1; essai <= maxEssais; essai++) {
    try {
      await sequelize.authenticate()
      await sequelize.sync({ alter: true }) // ajoute les colonnes manquantes
      console.log(`Base de donnees prete (essai ${essai}).`)
      return
    } catch (err) {
      console.error(`Echec synchronisation base (essai ${essai}/${maxEssais}) :`, err.message)
      if (essai === maxEssais) {
        console.error('API demarree MAIS base indisponible — /api/health repondra 503.')
        return
      }
      await pause(5000)
    }
  }
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ChurchApp API demarree sur http://0.0.0.0:${PORT}`)
  synchroniserBase()
})
