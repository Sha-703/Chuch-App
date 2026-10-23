import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import 'dotenv/config'
import authRoutes from './routes/auth.routes.js'
import financeRoutes from './routes/finance.routes.js'
import culteRoutes from './routes/culte.routes.js'
import membreRoutes from './routes/membre.routes.js'
import correspondanceRoutes from './routes/correspondance.routes.js'
import annonceRoutes from './routes/annonce.routes.js'
import egliseRoutes from './routes/eglise.routes.js'
import rapportRoutes from './routes/rapport.routes.js'
import departementRoutes from './routes/departement.routes.js'
import monEspaceRoutes from './routes/mon-espace.routes.js'
import evenementRoutes from './routes/evenement.routes.js'
import superAdminRoutes from './routes/superAdmin.routes.js'
import materielRoutes from './routes/materiel.routes.js'
import communauteRoutes from './routes/communaute.routes.js'
import notificationRoutes from './routes/notification.routes.js'

const app = express()

app.set('trust proxy', true) // nécessaire derrière Railway pour express-rate-limit

// Headers de sécurité
app.use(helmet({
  crossOriginEmbedderPolicy: false, // nécessaire pour les uploads / affichage de fichiers
}))

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requêtes par IP par fenêtre de 15 min
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // derrière Railway (proxy)
  message: { message: 'Trop de requêtes, veuillez réessayer plus tard.' },
})
app.use(globalLimiter)

// Rate limiting renforcé sur l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tentatives de connexion par IP par fenêtre de 15 min
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // derrière Railway (proxy)
  message: { message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.' },
})
app.use('/api/auth/login', authLimiter)
app.use('/api/super-admin/auth/login', authLimiter)

const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

// Ajoute automatiquement l'URL du frontend Railway si présente
const frontendUrl = process.env.FRONTEND_URL || 'https://chuchapp-frontend-production.up.railway.app'
if (!corsOrigins.includes(frontendUrl)) {
  corsOrigins.push(frontendUrl)
}

app.use(cors({
  origin: corsOrigins.length ? corsOrigins : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'))

// Endpoint d'état de santé : vérifie aussi la connexion à la base de données.
// Railway l'utilise comme healthcheck ; accessible publiquement sans authentification.
// Un timeout dur garantit une réponse même si la base pend (sinon : 499 côté Railway).
app.get('/api/health', async (req, res) => {
  const depart = Date.now()

  async function testerBase() {
    const { sequelize } = await import('./models/index.js')
    await sequelize.authenticate()
    return 'ok'
  }

  function avecTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, rej) => setTimeout(() => rej(new Error(`timeout ${ms}ms`)), ms)),
    ])
  }

  let database = 'deconnecte'
  try {
    database = await avecTimeout(testerBase(), 4000)
  } catch (err) {
    database = `erreur: ${err.message}`
  }

  const ok = database === 'ok'
  res.status(ok ? 200 : 503).json({
    status: ok ? 'ok' : 'degrade',
    database,
    latenceMs: Date.now() - depart,
    uptimeS: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/finances', financeRoutes)
app.use('/api/cultes', culteRoutes)
app.use('/api/membres', membreRoutes)
app.use('/api/correspondances', correspondanceRoutes)
app.use('/api/annonces', annonceRoutes)
app.use('/api/eglises', egliseRoutes)
app.use('/api/rapports', rapportRoutes)
app.use('/api/departements', departementRoutes)
app.use('/api/mon-espace', monEspaceRoutes)
app.use('/api/evenements', evenementRoutes)
app.use('/api/super-admin', superAdminRoutes)
app.use('/api/materiel', materielRoutes)
app.use('/api/communaute', communauteRoutes)

// Endpoint public pour lister les communautés (création d'église)
app.get('/api/communautes', async (req, res) => {
  try {
    const { Communaute } = await import('./models/index.js')
    const communautes = await Communaute.findAll({
      attributes: ['id', 'nom', 'description'],
      order: [['nom', 'ASC']],
    })
    res.json(communautes)
  } catch (err) {
    console.error('Erreur /api/communautes:', err)
    res.status(500).json({ message: 'Erreur serveur.' })
  }
})

app.use('/api/notifications', notificationRoutes)

// Gestion d'erreurs centralisée
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Erreur serveur.' })
})

export default app
