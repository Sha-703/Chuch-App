import { Router } from 'express'
import { login, creerEglise, changerMonMotDePasse, demanderReinitialisation } from '../controllers/auth.controller.js'
import { authRequired } from '../middlewares/auth.js'

const router = Router()

router.post('/login', login)
router.post('/eglises', creerEglise) // route publique : inscription d'une nouvelle église
router.post('/demander-reset', demanderReinitialisation) // route publique : mot de passe oublié
router.put('/mon-mot-de-passe', authRequired, changerMonMotDePasse) // pasteur/administrateur/ouvrier/communaute

export default router
