import { Sequelize } from 'sequelize'
import 'dotenv/config'

let sequelize

if (process.env.DATABASE_URL) {
  // Production : PostgreSQL (Supabase, Railway, etc.)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      // Timeout de connexion : sans cela, une base injoignable fait pendre
      // les requêtes indéfiniment (les healthchecks Railway renvoient alors 499).
      connectionTimeoutMillis: 5000,
      statement_timeout: 15000,
      query_timeout: 15000,
    },
    pool: {
      // Rafales : plusieurs pages ouvertes en parallèle + healthcheck →
      // au-delà de 10 connexions simultanées, les requêtes faisaient la queue
      // (acquisition 10 s → timeouts client à 15 s observés en test de charge).
      max: 25,
      // Connexions toujours chaudes : sans min, chaque rafale après inactivité
      // paie un handshake TLS complet vers mainline.proxy (~0,5-1,5 s).
      min: 2,
      acquire: 15000,
      // 60 s plutôt que 10 s : le recyclage fréquent était le principal
      // facteur de latence (lenteur ~1,5 s même sur de petites listes).
      idle: 60000,
    },
    logging: false,
  })
} else {
  // Développement : SQLite local
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './data/churchapp.sqlite',
    logging: false,
  })
}

export { sequelize }
