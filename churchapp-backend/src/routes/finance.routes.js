import { Router } from 'express'
import { authRequired } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import {
  listerEntrees, creerEntree, listerCharges, creerCharge, bilanMensuel, exporterBilanPdf,
} from '../controllers/finance.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

router.get('/entrees', listerEntrees)
router.post('/entrees', creerEntree)
router.get('/charges', listerCharges)
router.post('/charges', creerCharge)
router.get('/bilan-mensuel', bilanMensuel)
router.get('/bilan-mensuel/pdf', exporterBilanPdf)

export default router
