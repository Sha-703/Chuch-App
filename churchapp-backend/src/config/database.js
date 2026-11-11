import { Sequelize } from 'sequelize'
import 'dotenv/config'

let sequelize

if (process.env.DATABASE_URL) {
  // Production : PostgreSQL (Neon, Supabase, Railway, etc.)
  // ⚠️ Construction EXPLICITE : le parseur d'URL de Sequelize (url.parse)
  // ré-échappe "%20" dans le nom de base → PG répond « database does not
  // exist » pour une base nommée "Aprovic Educ". WHATWG URL + décodeur
  // = zéro ambiguïté sur le nom, l'utilisateur et le mot de passe.
  const u = new URL(process.env.DATABASE_URL)
  console.log(`[db] PostgreSQL → ${u.host}`)
  sequelize = new Sequelize({
    dialect: 'postgres',
    host: u.hostname,
    port: u.port ? Number(u.port) : 5432,
    database: decodeURIComponent(u.pathname.slice(1)),
    username: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      // Timeout de connexion : sans cela, une base injoignable fait pendre
      // les requêtes indéfiniment (les healthchecks renvoient alors 499).
      // 15 s : Neon scale-to-zero peut prendre ~5-10 s à se réveiller.
      connectionTimeoutMillis: 15000,
      statement_timeout: 15000,
      query_timeout: 15000,
    },
    pool: {
      // Rafales : plusieurs pages ouvertes en parallèle + healthcheck →
      // au-delà de 10 connexions simultanées, les requêtes faisaient la queue
      // (acquisition 10 s → timeouts client à 15 s observés en test de charge).
      max: 25,
      // Connexions toujours chaudes : sans min, chaque rafale après inactivité
      // paie un handshake TLS complet (démarrage à froid ~0,5-5 s).
      min: 2,
      acquire: 15000,
      // 60 s plutôt que 10 s : le recyclage fréquent était le principal
      // facteur de latence (lenteur ~1,5 s même sur de petites listes).
      idle: 60000,
    },
    logging: false,
  })
} else if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  // Production SANS DATABASE_URL = erreur CLAIRE. Sinon l'app tomberait sur un
  // SQLite fantôme dans un conteneur éphémère : plantage + données invisibles.
  throw new Error(
    "DATABASE_URL manquante : définir la variable d'environnement sur Render " +
    '(Dashboard du service → Environment → Add Environment Variable).'
  )
} else {
  // Développement : SQLite local
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE || './data/churchapp.sqlite',
    logging: false,
  })
}

export { sequelize }
