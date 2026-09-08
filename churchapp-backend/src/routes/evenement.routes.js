import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import {
  listerEvenements, creerEvenement, supprimerEvenement, prochainsEvenements, rappelsActifs,
} from '../controllers/evenement.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

router.get('/', listerEvenements)
router.post('/', creerEvenement)
router.delete('/:id', supprimerEvenement)
router.get('/prochains', prochainsEvenements)
router.get('/rappels', rappelsActifs)

export default router
