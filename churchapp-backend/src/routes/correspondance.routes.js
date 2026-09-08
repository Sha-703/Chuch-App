import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import { upload } from '../middlewares/upload.js'
import {
  listerCorrespondances, creerCorrespondancePhysique, creerCorrespondanceNumerique,
  changerEtat, envoyerAccuse,
} from '../controllers/correspondance.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

router.get('/', listerCorrespondances)
router.post('/physique', upload.single('document'), creerCorrespondancePhysique)
router.post('/numerique', upload.single('piece_jointe'), creerCorrespondanceNumerique)
router.patch('/:id/etat', changerEtat)
router.post('/:id/accuse', envoyerAccuse)

export default router
