import { Router } from 'express'
import { login, creerEglise } from '../controllers/auth.controller.js'

const router = Router()

router.post('/login', login)
router.post('/eglises', creerEglise) // route publique : inscription d'une nouvelle église

export default router
