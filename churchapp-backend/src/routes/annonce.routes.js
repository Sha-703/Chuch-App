import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import { upload } from '../middlewares/upload.js'
import { listerAnnonces, creerAnnonce } from '../controllers/annonce.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

router.get('/', listerAnnonces)
router.post('/', upload.single('photo'), creerAnnonce)

export default router
