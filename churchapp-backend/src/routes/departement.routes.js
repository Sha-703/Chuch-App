import { Router } from 'express'
import { authRequired, requireRole } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import {
  listerDepartements, monDepartement, majMesOuvriers,
  creerDepartement, modifierDepartement, supprimerDepartement,
} from '../controllers/departement.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

// --- Espace du chef de département (son propre département) ---
router.get('/mon', requireRole('chef_departement'), monDepartement)
router.put('/mon/ouvriers', requireRole('chef_departement'), majMesOuvriers)

// --- Gestion complète (admin / pasteur / trésorier) ---
const ROLES_ADMIN = ['pasteur', 'administrateur', 'tresorier']
router.get('/', requireRole(...ROLES_ADMIN), listerDepartements)
router.post('/', requireRole('pasteur', 'administrateur'), creerDepartement)
router.put('/:id', requireRole('pasteur', 'administrateur'), modifierDepartement)
router.delete('/:id', requireRole('pasteur', 'administrateur'), supprimerDepartement)

export default router
