import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import { listerMembres, creerMembre, creerCompteOuvrier } from '../controllers/membre.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

router.get('/', listerMembres)
router.post('/', creerMembre)
router.post('/:id/compte', creerCompteOuvrier)

export default router
