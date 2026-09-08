import { Culte, Membre, PresenceCulte, Departement } from '../models/index.js'

// --- Vue administrateur : tableau des présences pour un culte donné ---
export async function presencesDuCulte(req, res) {
  const { culteId } = req.params
  const { departementId } = req.query

  const culte = await Culte.findOne({ where: { id: culteId, egliseId: req.egliseId } })
  if (!culte) return res.status(404).json({ message: 'Culte introuvable.' })

  // Périmètre : tous les ouvriers de l'église, ou seulement ceux d'un département
  let membres
  if (departementId) {
    const departement = await Departement.findOne({
      where: { id: departementId, egliseId: req.egliseId },
      include: [{ model: Membre, as: 'ouvriers', attributes: ['id', 'nom'] }],
    })
    if (!departement) return res.status(404).json({ message: 'Département introuvable.' })
    membres = departement.ouvriers
  } else {
    membres = await Membre.findAll({ where: { egliseId: req.egliseId }, attributes: ['id', 'nom'] })
  }

  const presences = await PresenceCulte.findAll({ where: { culteId } })
  const parMembreId = Object.fromEntries(presences.map((p) => [p.membreId, p]))

  const tableau = membres.map((m) => {
    const p = parMembreId[m.id]
    return {
      membreId: m.id,
      nom: m.nom,
      statut: p ? p.statut : 'sans_reponse',
      raison: p?.raison || null,
    }
  })

  res.json({ culte: { id: culte.id, type: culte.type, date: culte.date }, presences: tableau })
}

// --- Espace ouvrier : ses propres cultes + son propre statut ---

async function resoudreMembreConnecte(req) {
  return Membre.findOne({ where: { utilisateurId: req.auth.sub, egliseId: req.egliseId } })
}

export async function mesCultes(req, res) {
  const membre = await resoudreMembreConnecte(req)
  if (!membre) return res.status(404).json({ message: 'Aucun profil de membre associé à ce compte.' })

  const cultes = await Culte.findAll({ where: { egliseId: req.egliseId }, order: [['date', 'DESC']], limit: 20 })
  const presences = await PresenceCulte.findAll({ where: { membreId: membre.id } })
  const parCulteId = Object.fromEntries(presences.map((p) => [p.culteId, p]))

  res.json(
    cultes.map((c) => ({
      id: c.id,
      type: c.type,
      date: c.date,
      predicateur: c.predicateur,
      monStatut: parCulteId[c.id]?.statut || 'sans_reponse',
      maRaison: parCulteId[c.id]?.raison || null,
    }))
  )
}

export async function signerPresence(req, res) {
  const membre = await resoudreMembreConnecte(req)
  if (!membre) return res.status(404).json({ message: 'Aucun profil de membre associé à ce compte.' })

  const { statut, raison } = req.body
  if (!['present', 'absent'].includes(statut)) {
    return res.status(400).json({ message: 'Statut invalide (present ou absent).' })
  }
  if (statut === 'absent' && !raison) {
    return res.status(400).json({ message: 'Merci de préciser une raison pour une absence.' })
  }

  const culte = await Culte.findOne({ where: { id: req.params.culteId, egliseId: req.egliseId } })
  if (!culte) return res.status(404).json({ message: 'Culte introuvable.' })

  const [presence] = await PresenceCulte.findOrCreate({
    where: { culteId: culte.id, membreId: membre.id },
    defaults: { statut, raison: statut === 'absent' ? raison : null },
  })
  presence.statut = statut
  presence.raison = statut === 'absent' ? raison : null
  await presence.save()

  res.json(presence)
}
