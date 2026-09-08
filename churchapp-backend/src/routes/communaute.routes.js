import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { communauteScope } from '../middlewares/communauteScope.js'
import {
  dashboard, listerEglises, financesEglise,
  listerCotisations, definirCotisation, genererEcheances, listerEcheances,
  enregistrerVersement, recouvrement,
} from '../controllers/communaute.controller.js'

const router = Router()
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
