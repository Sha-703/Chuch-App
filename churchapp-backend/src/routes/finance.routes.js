import { Router } from 'express'
import { authRequired, requireRole } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import {
  listerEntrees, creerEntree, supprimerEntree,
  listerCharges, creerCharge, supprimerCharge,
  bilanMensuel, exporterBilanPdf,
  financesDepartement, creerEntreeDepartement, creerChargeDepartement,
  financesTousDepartements,
} from '../controllers/finance.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

// --- Finances GÉNÉRALES de l'église (jamais accessibles à un chef de département) ---
const ROLES_EGLISE = ['pasteur', 'administrateur', 'tresorier']

router.get('/entrees', requireRole(...ROLES_EGLISE), listerEntrees)
router.post('/entrees', requireRole(...ROLES_EGLISE), creerEntree)
router.delete('/entrees/:id', requireRole(...ROLES_EGLISE), supprimerEntree)
router.get('/charges', requireRole(...ROLES_EGLISE), listerCharges)
router.post('/charges', requireRole(...ROLES_EGLISE), creerCharge)
router.delete('/charges/:id', requireRole(...ROLES_EGLISE), supprimerCharge)
router.get('/bilan-mensuel', requireRole(...ROLES_EGLISE), bilanMensuel)
router.get('/bilan-mensuel/pdf', requireRole(...ROLES_EGLISE), exporterBilanPdf)

// --- Finances par DÉPARTEMENT ---
// Vue d'ensemble (admin/pasteur/trésorier) : un département à la fois
router.get('/departements/:departementId', financesDepartement)
router.post('/departements/:departementId/entrees', creerEntreeDepartement)
router.post('/departements/:departementId/charges', creerChargeDepartement)
// Synthèse de TOUS les départements pour la page Finances
router.get('/departements', requireRole(...ROLES_EGLISE), financesTousDepartements)

export default router
