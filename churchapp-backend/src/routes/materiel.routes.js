import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import { listerMateriel, creerMateriel, modifierMateriel, supprimerMateriel } from '../controllers/materiel.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

router.get('/', listerMateriel)
router.post('/', creerMateriel)
router.put('/:id', modifierMateriel)
router.delete('/:id', supprimerMateriel)

export default router
