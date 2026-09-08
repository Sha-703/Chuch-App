// Équivalent de tenantScope, mais pour un compte "communauté" plutôt qu'une église.
export function communauteScope(req, res, next) {
  if (req.auth?.role !== 'communaute' || !req.auth?.communauteId) {
    return res.status(403).json({ message: 'Accès réservé aux comptes Communauté.' })
  }
  req.communauteId = req.auth.communauteId
  next()
}
