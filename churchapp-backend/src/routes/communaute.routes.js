import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { communauteScope } from '../middlewares/communauteScope.js'
import {
  dashboard, listerEglises, financesEglise,
  listerCotisations, definirCotisation, genererEcheances, listerEcheances,
  enregistrerVersement, recouvrement,
} from '../controllers/communaute.controller.js'

import { Communaute } from '../models/index.js'

const router = Router()

// --- Endpoint PUBLIC pour lister les communautés (utilisé par CreateChurch) ---
async function listerCommunautesPublic(req, res) {
  try {
    const communautes = await Communaute.findAll({
      attributes: ['id', 'nom', 'description'],
      order: [['nom', 'ASC']],
    })
    res.json(communautes)
  } catch (err) {
    console.error('Erreur liste communautés publique:', err)
    res.status(500).json({ message: 'Erreur serveur lors du chargement des communautés.' })
  }
}

router.get('/communautes/public', listerCommunautesPublic)

// Routes protégées (espace communauté)
router.use(authRequired, communauteScope)

router.get('/dashboard', dashboard)
router.get('/eglises', listerEglises)
router.get('/eglises/:id/finances', financesEglise)

router.get('/cotisations', listerCotisations)
router.post('/cotisations', definirCotisation)
router.post('/cotisations/:egliseId/generer-echeances', genererEcheances)

router.get('/echeances', listerEcheances)
router.post('/versements', enregistrerVersement)
router.get('/recouvrement', recouvrement)

export default router
