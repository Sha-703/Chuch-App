import { Eglise } from '../models/index.js'

// Annuaire public (aux utilisateurs connectés) des églises du système,
// nécessaire pour choisir un destinataire de correspondance ou afficher
// l'auteur d'une annonce. Ne renvoie que des informations non sensibles.
export async function listerEglises(req, res) {
  const eglises = await Eglise.findAll({
    attributes: ['id', 'nom', 'ville', 'denomination'],
    where: { statut: 'actif' },
    order: [['nom', 'ASC']],
  })
  res.json(eglises.filter((e) => e.id !== req.egliseId))
}
