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
      max: 10,
      min: 0,
      acquire: 10000, // temps max pour obtenir une connexion du pool
      idle: 10000,
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
