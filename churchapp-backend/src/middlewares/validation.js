import { validationResult } from 'express-validator'

// Middleware : vérifie qu'il n'y a pas d'erreur de validation et renvoie 400 sinon
export function validerRequete(req, res, next) {
  const erreurs = validationResult(req)
  if (!erreurs.isEmpty()) {
    return res.status(400).json({
      message: 'Données invalides.',
      erreurs: erreurs.array().map(e => ({ champ: e.path, message: e.msg })),
    })
  }
  next()
}
