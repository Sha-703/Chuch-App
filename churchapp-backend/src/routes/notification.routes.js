import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import { listerNotifications } from '../controllers/notification.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

router.get('/', listerNotifications)

export default router
