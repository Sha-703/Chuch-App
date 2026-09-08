// SÉCURITÉ CLÉ DU SYSTÈME MULTI-TENANT
// Ce middleware attache l'egliseId de l'utilisateur connecté à chaque requête.
// Tous les contrôleurs DOIVENT utiliser req.egliseId pour filtrer leurs requêtes
// Sequelize (where: { egliseId: req.egliseId }) — jamais de requête "globale"
// sur Membre/Culte/Entree/Charge sans ce filtre, sinon une église pourrait
// voir les données d'une autre église.
export function tenantScope(req, res, next) {
  if (!req.auth?.egliseId) {
    return res.status(403).json({ message: 'Aucune église associée à ce compte.' })
  }
  req.egliseId = req.auth.egliseId
  next()
}
