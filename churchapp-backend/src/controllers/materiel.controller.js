import { Materiel } from '../models/index.js'

function enrichir(materiel) {
  const m = materiel.toJSON ? materiel.toJSON() : materiel
  m.stockFaible = m.quantite < m.seuilAlerte
  return m
}

export async function listerMateriel(req, res) {
  const materiel = await Materiel.findAll({ where: { egliseId: req.egliseId }, order: [['categorie', 'ASC'], ['nom', 'ASC']] })
  res.json(materiel.map(enrichir))
}

export async function creerMateriel(req, res) {
  const { nom, categorie, quantite, seuilAlerte, etat } = req.body
  if (!nom) return res.status(400).json({ message: 'nom requis.' })
  const materiel = await Materiel.create({
    nom, categorie, etat,
    quantite: parseInt(quantite) || 0,
    seuilAlerte: seuilAlerte !== undefined ? parseInt(seuilAlerte) : 5,
    egliseId: req.egliseId,
  })
  res.status(201).json(enrichir(materiel))
}

export async function modifierMateriel(req, res) {
  const materiel = await Materiel.findOne({ where: { id: req.params.id, egliseId: req.egliseId } })
  if (!materiel) return res.status(404).json({ message: 'Matériel introuvable.' })

  const { nom, categorie, quantite, seuilAlerte, etat } = req.body
  if (nom !== undefined) materiel.nom = nom
  if (categorie !== undefined) materiel.categorie = categorie
  if (quantite !== undefined) materiel.quantite = parseInt(quantite)
  if (seuilAlerte !== undefined) materiel.seuilAlerte = parseInt(seuilAlerte)
  if (etat !== undefined) materiel.etat = etat
  await materiel.save()

  res.json(enrichir(materiel))
}

export async function supprimerMateriel(req, res) {
  const materiel = await Materiel.findOne({ where: { id: req.params.id, egliseId: req.egliseId } })
  if (!materiel) return res.status(404).json({ message: 'Matériel introuvable.' })
  await materiel.destroy()
  res.status(204).send()
}
