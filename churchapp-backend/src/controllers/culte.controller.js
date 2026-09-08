import { Culte } from '../models/index.js'

export async function listerCultes(req, res) {
  const cultes = await Culte.findAll({
    where: { egliseId: req.egliseId },
    order: [['date', 'DESC']],
  })
  res.json(cultes)
}

export async function creerCulte(req, res) {
  const { type, date, predicateur, presentiel, enLigne } = req.body
  if (!type || !date) {
    return res.status(400).json({ message: 'type et date sont requis.' })
  }
  const culte = await Culte.create({
    type,
    date,
    predicateur,
    presentiel: presentiel || 0,
    enLigne: enLigne || 0,
    egliseId: req.egliseId,
  })
  res.status(201).json(culte)
}
