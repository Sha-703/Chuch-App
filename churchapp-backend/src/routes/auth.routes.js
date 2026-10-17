import { Router } from 'express'
import { body } from 'express-validator'
import { login, creerEglise, changerMonMotDePasse, demanderReinitialisation } from '../controllers/auth.controller.js'
import { authRequired } from '../middlewares/auth.js'
import { validerRequete } from '../middlewares/validation.js'

const router = Router()

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('E-mail invalide.'),
  body('motDePasse').notEmpty().withMessage('Mot de passe requis.'),
  validerRequete,
], login)
router.post('/eglises', [
  body('eglise.nom').notEmpty().withMessage('Nom de l\'église requis.'),
  body('pasteur.email').isEmail().normalizeEmail().withMessage('E-mail pasteur invalide.'),
  body('administrateur.email').isEmail().normalizeEmail().withMessage('E-mail administrateur invalide.'),
  validerRequete,
], creerEglise) // route publique : inscription d'une nouvelle église
router.post('/demander-reset', [
  body('email').isEmail().normalizeEmail().withMessage('E-mail invalide.'),
  validerRequete,
], demanderReinitialisation) // route publique : mot de passe oublié
router.put('/mon-mot-de-passe', authRequired, [
  body('nouveauMotDePasse').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit faire au moins 6 caractères.'),
  validerRequete,
], changerMonMotDePasse) // pasteur/administrateur/ouvrier/communaute

export default router
