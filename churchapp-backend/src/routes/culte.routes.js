import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import { listerCultes, creerCulte } from '../controllers/culte.controller.js'
import { presencesDuCulte } from '../controllers/presence.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

router.get('/', listerCultes)
router.post('/', creerCulte)
router.get('/:culteId/presences', presencesDuCulte)

export default router
