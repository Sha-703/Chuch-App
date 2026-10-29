import { Router } from 'express'
import { authRequired, requireRole } from '../middlewares/auth.js'
import { tenantScope } from '../middlewares/tenantScope.js'
import { upload } from '../middlewares/upload.js'
import { listerAnnonces, creerAnnonce, supprimerAnnonce } from '../controllers/annonce.controller.js'

const router = Router()
router.use(authRequired, tenantScope)

// Lecture : toutes les autorisations d'église passent (le renvoi est filtré
// côté contrôleur — réseau + annonces internes de MA propre église).
router.get('/', listerAnnonces)
// Publication : réservée aux responsables de l'église.
router.post('/', requireRole('pasteur', 'administrateur'), upload.single('photo'), creerAnnonce)
router.delete('/:id', supprimerAnnonce)

export default router
