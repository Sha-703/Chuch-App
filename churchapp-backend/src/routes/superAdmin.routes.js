import { Router } from 'express'
import { body, param } from 'express-validator'
import { superAdminRequired } from '../middlewares/superAdminAuth.js'
import { validerRequete } from '../middlewares/validation.js'
import {
  login, dashboard,
  listerEglisesSysteme, changerStatutEglise, modifierEglise, supprimerEglise, creerEgliseParSuperAdmin,
  listerUtilisateursSysteme, modifierUtilisateur, reinitialiserMotDePasse, toggleBlocageUtilisateur,
  listerAnnoncesSysteme, supprimerAnnonceSysteme,
  listerJournal,
  listerCommunautes, creerCommunaute, modifierCommunaute, rattacherEglise, creerCompteCommunaute,
  changerMonMotDePasseSuperAdmin,
} from '../controllers/superAdmin.controller.js'

const router = Router()

router.post('/auth/login', [
  body('email').isEmail().normalizeEmail().withMessage('E-mail invalide.'),
  body('motDePasse').notEmpty().withMessage('Mot de passe requis.'),
  validerRequete,
], login) // seule route publique de ce fichier

router.use(superAdminRequired)

router.get('/dashboard', dashboard)

router.get('/eglises', listerEglisesSysteme)
router.post('/eglises', [
  body('eglise.nom').notEmpty().withMessage('Nom de l\'église requis.'),
  body('pasteur.email').isEmail().normalizeEmail().withMessage('E-mail pasteur invalide.'),
  body('administrateur.email').isEmail().normalizeEmail().withMessage('E-mail administrateur invalide.'),
  validerRequete,
], creerEgliseParSuperAdmin)
router.put('/eglises/:id', [
  param('id').isUUID().withMessage('ID église invalide.'),
  body('eglise.nom').optional().notEmpty().withMessage('Nom de l\'église requis.'),
  body('pasteur.email').optional().isEmail().normalizeEmail().withMessage('E-mail pasteur invalide.'),
  body('administrateur.email').optional().isEmail().normalizeEmail().withMessage('E-mail administrateur invalide.'),
  validerRequete,
], modifierEglise)
router.patch('/eglises/:id/statut', [
  param('id').isUUID().withMessage('ID église invalide.'),
  body('statut').isIn(['actif', 'suspendu']).withMessage('Statut invalide.'),
  validerRequete,
], changerStatutEglise)
router.patch('/eglises/:id/communaute', [
  param('id').isUUID().withMessage('ID église invalide.'),
  validerRequete,
], rattacherEglise)
router.delete('/eglises/:id', supprimerEglise)

router.get('/utilisateurs', listerUtilisateursSysteme)
router.put('/utilisateurs/:id', [
  param('id').isUUID().withMessage('ID utilisateur invalide.'),
  body('nom').optional().notEmpty().withMessage('Nom requis.'),
  body('email').optional().isEmail().normalizeEmail().withMessage('E-mail invalide.'),
  body('role').optional().isIn(['pasteur', 'administrateur', 'tresorier', 'ouvrier', 'communaute']).withMessage('Rôle invalide.'),
  validerRequete,
], modifierUtilisateur)
router.post('/utilisateurs/:id/reinitialiser-mot-de-passe', [
  param('id').isUUID().withMessage('ID utilisateur invalide.'),
  validerRequete,
], reinitialiserMotDePasse)
router.patch('/utilisateurs/:id/toggle-blocage', [
  param('id').isUUID().withMessage('ID utilisateur invalide.'),
  validerRequete,
], toggleBlocageUtilisateur)

router.get('/annonces', listerAnnoncesSysteme)
router.delete('/annonces/:id', supprimerAnnonceSysteme)

router.get('/communautes', listerCommunautes)
router.post('/communautes', creerCommunaute)
router.put('/communautes/:id', [
  param('id').isUUID().withMessage('ID communauté invalide.'),
  body('nom').optional().notEmpty().withMessage('Nom requis.'),
  validerRequete,
], modifierCommunaute)
router.post('/communautes/:id/compte', [
  param('id').isUUID().withMessage('ID communauté invalide.'),
  body('email').isEmail().normalizeEmail().withMessage('E-mail invalide.'),
  validerRequete,
], creerCompteCommunaute)

router.get('/journal', listerJournal)

router.put('/mon-mot-de-passe', [
  body('motDePasseActuel').notEmpty().withMessage('Mot de passe actuel requis.'),
  body('nouveauMotDePasse').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit faire au moins 6 caractères.'),
  validerRequete,
], changerMonMotDePasseSuperAdmin)

export default router
