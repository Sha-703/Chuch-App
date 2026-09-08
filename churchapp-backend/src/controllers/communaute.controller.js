import { Op } from 'sequelize'
import { Eglise, Entree, Charge, CotisationConfig, Echeance, Versement } from '../models/index.js'

// --- Tableau de bord ---
export async function dashboard(req, res) {
  const eglises = await Eglise.findAll({ where: { communauteId: req.communauteId } })

  const echeances = await Echeance.findAll({ where: { communauteId: req.communauteId } })
  const totalDu = echeances.reduce((s, e) => s + e.montantDu, 0)
  const totalPaye = echeances.reduce((s, e) => s + Math.min(e.montantPaye, e.montantDu), 0)
  const tauxRecouvrement = totalDu > 0 ? Math.round((totalPaye / totalDu) * 100) : 0

  res.json({
    nbEglises: eglises.length,
    totalDu,
    totalPaye,
    totalRestantDu: Math.max(0, totalDu - totalPaye),
    tauxRecouvrement,
  })
}

// --- Églises de la communauté (lecture seule) ---
export async function listerEglises(req, res) {
  const eglises = await Eglise.findAll({
    where: { communauteId: req.communauteId },
    attributes: ['id', 'nom', 'ville', 'statut'],
    order: [['nom', 'ASC']],
  })
  res.json(eglises)
}

// Bilan financier d'UNE église de la communauté — lecture seule, jamais de modification possible.
export async function financesEglise(req, res) {
  const eglise = await Eglise.findOne({ where: { id: req.params.id, communauteId: req.communauteId } })
  if (!eglise) return res.status(404).json({ message: 'Église introuvable dans votre communauté.' })

  const entrees = await Entree.findAll({ where: { egliseId: eglise.id } })
  const charges = await Charge.findAll({ where: { egliseId: eglise.id } })

  const parMois = {}
  const cle = (d) => d.slice(0, 7)
  for (const e of entrees) {
    const k = cle(e.date)
    parMois[k] = parMois[k] || { mois: k, entrees: 0, charges: 0 }
    parMois[k].entrees += e.montant
  }
  for (const c of charges) {
    const k = cle(c.date)
    parMois[k] = parMois[k] || { mois: k, entrees: 0, charges: 0 }
    parMois[k].charges += c.montant
  }

  res.json({
    eglise: { id: eglise.id, nom: eglise.nom, ville: eglise.ville },
    bilanMensuel: Object.values(parMois).sort((a, b) => a.mois.localeCompare(b.mois)),
  })
}

// --- Configuration des cotisations ---
export async function listerCotisations(req, res) {
  const configs = await CotisationConfig.findAll({
    where: { communauteId: req.communauteId },
    include: [{ model: Eglise, attributes: ['id', 'nom'] }],
  })
  res.json(configs)
}

export async function definirCotisation(req, res) {
  const { egliseId, montant, periodicite } = req.body
  const eglise = await Eglise.findOne({ where: { id: egliseId, communauteId: req.communauteId } })
  if (!eglise) return res.status(404).json({ message: 'Église introuvable dans votre communauté.' })

  let config = await CotisationConfig.findOne({ where: { egliseId, communauteId: req.communauteId } })
  if (config) {
    config.montant = montant
    config.periodicite = periodicite
    await config.save()
  } else {
    config = await CotisationConfig.create({ egliseId, communauteId: req.communauteId, montant, periodicite })
  }
  res.status(201).json(config)
}

const MOIS_PAR_PERIODE = { mensuelle: 1, trimestrielle: 3, annuelle: 12 }
const NOMS_MOIS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

// Génère les échéances de l'année en cours pour une église, selon sa configuration
export async function genererEcheances(req, res) {
  const { egliseId } = req.params
  const config = await CotisationConfig.findOne({ where: { egliseId, communauteId: req.communauteId } })
  if (!config) return res.status(404).json({ message: 'Aucune cotisation configurée pour cette église.' })

  const annee = new Date().getFullYear()
  const pas = MOIS_PAR_PERIODE[config.periodicite]
  const echeancesCreees = []

  for (let mois = 0; mois < 12; mois += pas) {
    const dateEcheance = new Date(annee, mois, 1).toISOString().slice(0, 10)
    const libelle = config.periodicite === 'annuelle'
      ? `Année ${annee}`
      : config.periodicite === 'trimestrielle'
        ? `T${Math.floor(mois / 3) + 1} ${annee}`
        : `${NOMS_MOIS_FR[mois]} ${annee}`

    const [echeance, creee] = await Echeance.findOrCreate({
      where: { egliseId, communauteId: req.communauteId, periodeLibelle: libelle },
      defaults: { dateEcheance, montantDu: config.montant },
    })
    if (creee) echeancesCreees.push(echeance)
  }

  res.status(201).json(echeancesCreees)
}

export async function listerEcheances(req, res) {
  const where = { communauteId: req.communauteId }
  if (req.query.egliseId) where.egliseId = req.query.egliseId

  const echeances = await Echeance.findAll({
    where,
    include: [{ model: Eglise, attributes: ['id', 'nom'] }],
    order: [['dateEcheance', 'ASC']],
  })
  res.json(echeances)
}

// --- Versements, avec affectation automatique aux plus anciennes échéances impayées ---
export async function enregistrerVersement(req, res) {
  const { egliseId, montant, date, note, echeanceId } = req.body
  if (!egliseId || !montant) return res.status(400).json({ message: 'egliseId et montant sont requis.' })

  const eglise = await Eglise.findOne({ where: { id: egliseId, communauteId: req.communauteId } })
  if (!eglise) return res.status(404).json({ message: 'Église introuvable dans votre communauté.' })

  const versement = await Versement.create({
    egliseId, communauteId: req.communauteId, montant, date: date || new Date().toISOString().slice(0, 10), note,
    echeanceId: echeanceId || null,
  })

  if (echeanceId) {
    const echeance = await Echeance.findByPk(echeanceId)
    if (echeance) {
      echeance.montantPaye += montant
      await echeance.save()
    }
  } else {
    // Affectation automatique : on comble les échéances impayées les plus anciennes en premier
    let reste = montant
    const echeances = await Echeance.findAll({
      where: { egliseId, communauteId: req.communauteId },
      order: [['dateEcheance', 'ASC']],
    })
    for (const echeance of echeances) {
      if (reste <= 0) break
      const du = echeance.montantDu - echeance.montantPaye
      if (du <= 0) continue
      const applique = Math.min(du, reste)
      echeance.montantPaye += applique
      reste -= applique
      await echeance.save()
    }
  }

  res.status(201).json(versement)
}

// --- Tableau de recouvrement : les églises triées par montant en retard ---
export async function recouvrement(req, res) {
  const eglises = await Eglise.findAll({ where: { communauteId: req.communauteId }, attributes: ['id', 'nom', 'ville'] })
  const aujourdHui = new Date().toISOString().slice(0, 10)

  const resultats = await Promise.all(
    eglises.map(async (eglise) => {
      const echeances = await Echeance.findAll({ where: { egliseId: eglise.id, communauteId: req.communauteId } })
      const totalDu = echeances.reduce((s, e) => s + e.montantDu, 0)
      const totalPaye = echeances.reduce((s, e) => s + Math.min(e.montantPaye, e.montantDu), 0)
      const restant = Math.max(0, totalDu - totalPaye)
      const echeancesEnRetard = echeances.filter((e) => e.dateEcheance < aujourdHui && e.montantPaye < e.montantDu)

      let statut = 'a_jour'
      if (echeancesEnRetard.length > 0) statut = 'en_retard'
      else if (restant > 0) statut = 'partiel'

      return {
        eglise: { id: eglise.id, nom: eglise.nom, ville: eglise.ville },
        totalDu, totalPaye, restant, statut,
        nbEcheancesEnRetard: echeancesEnRetard.length,
      }
    })
  )

  resultats.sort((a, b) => b.restant - a.restant)
  res.json(resultats)
}
