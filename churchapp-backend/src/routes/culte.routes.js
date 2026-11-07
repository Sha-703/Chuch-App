import { Router } from 'express'
import { authRequired, requireRole } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import { listerCultes, creerCulte, supprimerCulte } from '../controllers/culte.controller.js'
import { presencesDuCulte, majPresencesPhysiques } from '../controllers/presence.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

// La lecture reste ouverte à tous les rôles de l'église (le chef du
// département Protocole doit pouvoir voir les cultes pour y saisir la
// présence physique) ; la création et la suppression sont réservées à la
// direction.
router.get('/', listerCultes)
router.post('/', requireRole('pasteur', 'administrateur'), creerCulte)
router.delete('/:culteId', requireRole('pasteur', 'administrateur'), supprimerCulte)
router.get('/:culteId/presences', presencesDuCulte)
// Saisie manuelle des présences PHYSIQUES (membres présents) — admin
router.put('/:culteId/presences-physiques', majPresencesPhysiques)

export default router
