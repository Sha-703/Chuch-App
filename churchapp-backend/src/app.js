import express from 'express'
import cors from 'cors'
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

const corsOrigins = (process.env.CORS_ORIGIN || '*').split(',').map(o => o.trim()).filter(Boolean)
console.log('CORS_ORIGINS:', corsOrigins)
app.use(cors({ origin: corsOrigins.length ? corsOrigins : '*' }))

// Fallback CORS — toujours actif pour éviter les blocages
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})
app.use(express.json())
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

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
app.use('/api/notifications', notificationRoutes)

// Gestion d'erreurs centralisée
app.use((err, req, res, next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Erreur serveur.' })
})

export default app
