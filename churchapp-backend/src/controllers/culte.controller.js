import { Culte } from '../models/index.js'

export async function listerCultes(req, res) {
  const cultes = await Culte.findAll({
    where: { egliseId: req.egliseId },
    order: [['date', 'DESC']],
  })
  res.json(cultes)
}

export async function creerCulte(req, res) {
  const { type, date, predicateur } = req.body
  if (!type || !date) {
    return res.status(400).json({ message: 'type et date sont requis.' })
  }
  const culte = await Culte.create({
    type,
    date,
    predicateur,
    egliseId: req.egliseId,
  })
  res.status(201).json(culte)
}
