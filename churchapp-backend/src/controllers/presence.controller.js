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

  const presentsEnLigne = tableau.filter((t) => t.statut === 'present').length

  res.json({
    culte: { id: culte.id, type: culte.type, date: culte.date },
    presences: tableau,
    // Présence en ligne = ouvriers qui ont signé via leur espace
    presenceEnLigne: presentsEnLigne,
    // Présence physique = membres présents, saisis manuellement par l'admin
    presencePhysique: culte.presentiel || 0,
    total: presentsEnLigne + (culte.presentiel || 0),
  })
}

// --- Saisie manuelle de la présence PHYSIQUE d'un culte (par l'administrateur) ---
// Elle s'ajoute aux présences en ligne des ouvriers pour former le total.
export async function majPresencesPhysiques(req, res) {
  const culte = await Culte.findOne({ where: { id: req.params.culteId, egliseId: req.egliseId } })
  if (!culte) return res.status(404).json({ message: 'Culte introuvable.' })

  const presentiel = parseInt(req.body.presentiel, 10)
  if (!Number.isFinite(presentiel) || presentiel < 0) {
    return res.status(400).json({ message: 'Le nombre de présences physiques doit être un entier positif ou nul.' })
  }

  culte.presentiel = presentiel
  await culte.save()

  const presences = await PresenceCulte.findAll({ where: { culteId: culte.id }, attributes: ['statut'] })
  const presenceEnLigne = presences.filter((p) => p.statut === 'present').length

  res.json({
    id: culte.id,
    presencePhysique: culte.presentiel,
    presenceEnLigne,
    total: culte.presentiel + presenceEnLigne,
  })
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
