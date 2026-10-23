import { Router } from 'express'
import { body, param } from 'express-validator'
import { authRequired } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import { validerRequete } from '../middlewares/validation.js'
import { listerMembres, creerMembre, creerCompteOuvrier } from '../controllers/membre.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

router.get('/', listerMembres)
router.post('/', [
  body('nom').notEmpty().withMessage('Nom requis.'),
  validerRequete,
], creerMembre)
router.post('/:id/compte', [
  param('id').isUUID().withMessage('ID membre invalide.'),
  body('email').isEmail().normalizeEmail().withMessage('E-mail invalide.'),
  validerRequete,
], creerCompteOuvrier)

export default router
