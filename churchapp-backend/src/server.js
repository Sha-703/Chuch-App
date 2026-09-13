import 'dotenv/config'
import app from './app.js'
import { sequelize } from './models/index.js'

const PORT = process.env.PORT ? Number(process.env.PORT) : (process.env.NODE_ENV === 'production' ? 8080 : 4000)

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
