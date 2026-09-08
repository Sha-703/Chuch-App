import { Op } from 'sequelize'
import { Correspondance, Evenement } from '../models/index.js'

export async function listerNotifications(req, res) {
  const aujourdHui = new Date().toISOString().slice(0, 10)

  const correspondancesEnRetard = await Correspondance.findAll({
    where: {
      egliseId: req.egliseId,
      etat: { [Op.ne]: 'archive' },
      dateLimiteTraitement: { [Op.lt]: aujourdHui },
    },
  })

  const rappels = await Evenement.findAll({
    where: {
      egliseId: req.egliseId,
      rappelActif: true,
      rappelDate: { [Op.lte]: new Date() },
      date: { [Op.gte]: aujourdHui },
    },
  })

  const items = [
    ...correspondancesEnRetard.map((c) => ({
      id: `correspondance-${c.id}`,
      type: 'correspondance',
      texte: `Courrier en retard : "${c.objet}"`,
      lien: '/correspondance',
    })),
    ...rappels.map((r) => ({
      id: `rappel-${r.id}`,
      type: 'rappel',
      texte: `Rappel : ${r.titre} — ${r.date}`,
      lien: '/planning',
    })),
  ]

  res.json({ count: items.length, items })
}
