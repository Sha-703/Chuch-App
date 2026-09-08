import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import {
  listerDepartements, creerDepartement, modifierDepartement, supprimerDepartement,
} from '../controllers/departement.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

router.get('/', listerDepartements)
router.post('/', creerDepartement)
router.put('/:id', modifierDepartement)
router.delete('/:id', supprimerDepartement)

export default router
