import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import { listerEglises } from '../controllers/eglise.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

router.get('/', listerEglises)

export default router
