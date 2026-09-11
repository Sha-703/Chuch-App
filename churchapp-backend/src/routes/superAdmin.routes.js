import { Router } from 'express'
import { superAdminRequired } from '../middlewares/superAdminAuth.js'
import {
  login, dashboard,
  listerEglisesSysteme, changerStatutEglise, supprimerEglise, creerEgliseParSuperAdmin,
  listerUtilisateursSysteme, reinitialiserMotDePasse, toggleBlocageUtilisateur,
  listerAnnoncesSysteme, supprimerAnnonceSysteme,
  listerJournal,
  listerCommunautes, creerCommunaute, rattacherEglise, creerCompteCommunaute,
  changerMonMotDePasseSuperAdmin,
} from '../controllers/superAdmin.controller.js'

const router = Router()

router.post('/auth/login', login) // seule route publique de ce fichier

router.use(superAdminRequired)

router.get('/dashboard', dashboard)

router.get('/eglises', listerEglisesSysteme)
router.post('/eglises', creerEgliseParSuperAdmin)
router.patch('/eglises/:id/statut', changerStatutEglise)
router.patch('/eglises/:id/communaute', rattacherEglise)
router.delete('/eglises/:id', supprimerEglise)

router.get('/utilisateurs', listerUtilisateursSysteme)
router.post('/utilisateurs/:id/reinitialiser-mot-de-passe', reinitialiserMotDePasse)
router.patch('/utilisateurs/:id/toggle-blocage', toggleBlocageUtilisateur)

router.get('/annonces', listerAnnoncesSysteme)
router.delete('/annonces/:id', supprimerAnnonceSysteme)

router.get('/communautes', listerCommunautes)
router.post('/communautes', creerCommunaute)
router.post('/communautes/:id/compte', creerCompteCommunaute)

router.get('/journal', listerJournal)

router.put('/mon-mot-de-passe', changerMonMotDePasseSuperAdmin)

export default router
