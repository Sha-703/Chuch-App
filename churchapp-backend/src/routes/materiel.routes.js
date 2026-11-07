import { Router } from 'express'
import { authRequired, requireRole } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import { listerMateriel, creerMateriel, modifierMateriel, supprimerMateriel } from '../controllers/materiel.controller.js'

const router = Router()
// Inventaire du matériel : direction de l'église + le logisticien (espace
// privé /mon-logistique). N'importe quel autre membre connecté ne doit pas
// pouvoir modifier l'inventaire.
router.use(authRequired, tenantScope, requireRole('pasteur', 'administrateur', 'logisticien'))

router.get('/', listerMateriel)
router.post('/', creerMateriel)
router.put('/:id', modifierMateriel)
router.delete('/:id', supprimerMateriel)

export default router
