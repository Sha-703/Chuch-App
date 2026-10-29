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
import { Fichier } from './models/index.js'

const app = express()

app.set('trust proxy', 1) // Railway = 1 proxy : "true" permettait de contourner le rate limit

// Headers de sécurité
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  // POLITIQUE CLÉ : helmet impose par défaut "same-origin", ce qui INTERDISIT
  // au frontend (autre domaine) d'afficher les images/PDF envoyés par le
  // backend (photos d'annonces, scans de correspondance) → le fichier est
  // bien téléversé mais l'<img> reste vide. "cross-origin" l'autorise.
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requêtes par IP par fenêtre — l'app charge plusieurs
             // endpoints par navigation (notifications, tableaux de bord…) :
             // 300 coupait un admin en plein usage. 1000 reste efficace contre l'abus.
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requêtes, veuillez réessayer plus tard.' },
})
app.use(globalLimiter)

// Rate limiting renforcé sur l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tentatives de connexion par IP par fenêtre de 15 min
  standardHeaders: true,
  legacyHeaders: false,
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
// Fichiers legacy encore présents sur le disque (avant la migration en base) :
// express.static tente le disque, puis transmet si le fichier n'y est plus.
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'))

// Fichiers persistés EN BASE PostgreSQL (photos d'annonces, scans de
// correspondance…). Le disque du conteneur est éphémère, la base ne l'est pas :
// après un redéploiement, tout fichier est lu ici depuis Fichier.donnees.
// Les URLs restent identiques (/uploads/<nom>), le frontend ne change pas.
app.get('/uploads/:nom', async (req, res) => {
  try {
    const fichier = await Fichier.findOne({ where: { nom: req.params.nom } })
    if (!fichier) return res.status(404).send('Fichier introuvable.')
    res.set('Content-Type', fichier.typeMime)
    // Nom de fichier unique : mis en cache sans jamais revalider.
    res.set('Cache-Control', 'public, max-age=31536000, immutable')
    res.send(fichier.donnees)
  } catch (err) {
    console.error('Lecture fichier impossible :', err.message)
    res.status(500).send('Erreur de lecture du fichier.')
  }
})

// Endpoint d'état de santé : vérifie aussi la connexion à la base de données.
// Railway l'utilise comme healthcheck ; accessible publiquement sans authentification.
// Un timeout dur garantit une réponse même si la base pend (sinon : 499 côté Railway).
let cacheSante = { valeur: null, expire: 0 }
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
  // Cache court (3 s) : /api/health est appelé par la veille (cron toutes les
  // 10 min) et par Railway — frapper la base à chaque appel est inutile, et en
  // test de charge cela consommait le pool à la place des vraies requêtes.
  const maintenant = Date.now()
  if (cacheSante.valeur && maintenant < cacheSante.expire) {
    database = cacheSante.valeur
  } else {
    try {
      database = await avecTimeout(testerBase(), 4000)
    } catch (err) {
      database = `erreur: ${err.message}`
    }
    cacheSante = { valeur: database, expire: Date.now() + 3000 }
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
