import { Op } from 'sequelize'
import { Annonce, Eglise } from '../models/index.js'
import { urlFichier } from '../middlewares/upload.js'

// Supprime silencieusement les annonces expirées (dateFin dépassée) avant
// toute lecture — c'est le mécanisme de "suppression automatique après leur
// date" : pas de tâche planifiée séparée, le nettoyage se fait à la volée à
// chaque consultation du mur d'annonces.
async function purgerAnnoncesExpirees() {
  const aujourdHui = new Date().toISOString().slice(0, 10)
  await Annonce.destroy({ where: { dateFin: { [Op.lt]: aujourdHui } } })
}

// Exception documentée à l'isolation multi-tenant : le mur d'annonces est
// volontairement partagé entre TOUTES les églises du système (voir cahier des charges §3.2).
export async function listerAnnonces(req, res) {
  await purgerAnnoncesExpirees()

  const annonces = await Annonce.findAll({
    include: [{ model: Eglise, attributes: ['id', 'nom', 'ville'] }],
    order: [['createdAt', 'DESC']],
  })
  res.json(annonces)
}

export async function creerAnnonce(req, res) {
  const { titre, contenu, dateDebut, dateFin } = req.body
  if (!titre || !contenu) return res.status(400).json({ message: 'titre et contenu sont requis.' })
  if (!dateDebut || !dateFin) return res.status(400).json({ message: 'dateDebut et dateFin sont requises.' })
  if (dateFin < dateDebut) return res.status(400).json({ message: 'La date de fin doit être après la date de début.' })

  const annonce = await Annonce.create({
    titre,
    contenu,
    dateDebut,
    dateFin,
    photoUrl: req.file ? urlFichier(req, req.file.filename) : null,
    egliseId: req.egliseId,
  })

  const avecEglise = await Annonce.findByPk(annonce.id, {
    include: [{ model: Eglise, attributes: ['id', 'nom', 'ville'] }],
  })
  res.status(201).json(avecEglise)
}
