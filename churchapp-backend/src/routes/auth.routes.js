import { Router } from 'express'
import { body } from 'express-validator'
import { login, creerEglise, changerMonMotDePasse } from '../controllers/auth.controller.js'
import { authRequired } from '../middlewares/auth.js'
import { validerRequete } from '../middlewares/validation.js'

const router = Router()

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('E-mail invalide.'),
  body('motDePasse').notEmpty().withMessage('Mot de passe requis.'),
  validerRequete,
], login)
router.post('/eglises', authRequired, [
  body('eglise.nom').notEmpty().withMessage('Nom de l\'église requis.'),
  body('pasteur.email').isEmail().normalizeEmail().withMessage('E-mail pasteur invalide.'),
  body('administrateur.email').isEmail().normalizeEmail().withMessage('E-mail administrateur invalide.'),
  validerRequete,
], creerEglise) // protégée : création d'église par un utilisateur connecté
router.put('/mon-mot-de-passe', authRequired, [
  body('nouveauMotDePasse').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit faire au moins 6 caractères.'),
  validerRequete,
], changerMonMotDePasse)

export default router
