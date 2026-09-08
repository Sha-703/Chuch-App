import jwt from 'jsonwebtoken'

export function authRequired(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentification requise.' })
  }
  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    // payload contient : { sub: utilisateurId, egliseId, role }
    req.auth = payload
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Session invalide ou expirée.' })
  }
}

// Restreint une route à certains rôles (ex: seul le pasteur peut valider un bilan)
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ message: 'Action réservée à : ' + roles.join(', ') })
    }
    next()
  }
}
