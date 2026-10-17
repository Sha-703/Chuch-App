import 'dotenv/config'
import app from './app.js'
import { sequelize } from './models/index.js'

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

async function start() {
  await sequelize.authenticate()
  await sequelize.sync() // en production : utiliser des migrations plutôt que sync()
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ChurchApp API démarrée sur http://0.0.0.0:${PORT}`)
  })
}

start().catch((err) => {
  console.error('Échec du démarrage du serveur :', err)
  process.exit(1)
})
