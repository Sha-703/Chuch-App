import jwt from 'jsonwebtoken'

// Vérifie un JWT de Super Admin — complètement séparé du JWT d'église
// (payload différent : { sub, isSuperAdmin: true }, jamais d'egliseId).
export function superAdminRequired(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentification requise.' })
  }
  try {
    const payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET)
    if (!payload.isSuperAdmin) {
      return res.status(403).json({ message: 'Accès réservé au Super Admin.' })
    }
    req.superAdmin = payload
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Session invalide ou expirée.' })
  }
}
