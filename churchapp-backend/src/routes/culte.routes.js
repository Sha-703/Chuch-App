import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import { listerCultes, creerCulte, supprimerCulte } from '../controllers/culte.controller.js'
import { presencesDuCulte, majPresencesPhysiques } from '../controllers/presence.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

router.get('/', listerCultes)
router.post('/', creerCulte)
router.delete('/:culteId', supprimerCulte)
router.get('/:culteId/presences', presencesDuCulte)
// Saisie manuelle des présences PHYSIQUES (membres présents) — admin
router.put('/:culteId/presences-physiques', majPresencesPhysiques)

export default router
