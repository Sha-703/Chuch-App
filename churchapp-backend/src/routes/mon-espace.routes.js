import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import { mesCultes, signerPresence } from '../controllers/presence.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

router.get('/cultes', mesCultes)
router.post('/cultes/:culteId/presence', signerPresence)

export default router
