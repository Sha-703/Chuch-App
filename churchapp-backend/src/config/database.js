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
