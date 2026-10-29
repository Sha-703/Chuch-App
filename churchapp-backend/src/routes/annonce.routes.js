import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import { upload } from '../middlewares/upload.js'
import { listerAnnonces, creerAnnonce, supprimerAnnonce } from '../controllers/annonce.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

router.get('/', listerAnnonces)
router.post('/', upload.single('photo'), creerAnnonce)
router.delete('/:id', supprimerAnnonce)

export default router
