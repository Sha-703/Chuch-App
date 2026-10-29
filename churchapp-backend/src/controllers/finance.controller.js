import PDFDocument from 'pdfkit'
import { Op } from 'sequelize'
import { Entree, Charge, Eglise, Departement } from '../models/index.js'
import { formatFC } from '../lib/format.js'
import { plageMois } from '../lib/dates.js'

// ---------------------------------------------------------------------------
// Finances GÉNÉRALES de l'église (departementId null)
// Les finances des départements sont gérées à part (voir plus bas).
// ---------------------------------------------------------------------------

export async function listerEntrees(req, res) {
  const entrees = await Entree.findAll({
    where: { egliseId: req.egliseId, departementId: { [Op.is]: null } },
    order: [['date', 'DESC']],
  })
  res.json(entrees)
}

export async function creerEntree(req, res) {
  const { type, provenance, montant, date } = req.body
  if (!type || !montant || !date) {
    return res.status(400).json({ message: 'type, montant et date sont requis.' })
  }
  const m = parseFloat(montant)
  if (!isFinite(m) || m < 0) {
    return res.status(400).json({ message: 'Le montant doit être un nombre positif ou nul.' })
  }
  const entree = await Entree.create({ type, provenance, montant: m, date, egliseId: req.egliseId })
  res.status(201).json(entree)
}

export async function listerCharges(req, res) {
  const charges = await Charge.findAll({
    where: { egliseId: req.egliseId, departementId: { [Op.is]: null } },
    order: [['date', 'DESC']],
  })
  res.json(charges)
}

export async function creerCharge(req, res) {
  const { categorie, description, montant, date } = req.body
  if (!categorie || !montant || !date) {
    return res.status(400).json({ message: 'categorie, montant et date sont requis.' })
  }
  const m = parseFloat(montant)
  if (!isFinite(m) || m < 0) {
    return res.status(400).json({ message: 'Le montant doit être un nombre positif ou nul.' })
  }
  const charge = await Charge.create({ categorie, description, montant: m, date, egliseId: req.egliseId })
  res.status(201).json(charge)
}

// --- Suppressions (toute action d'ajout doit pouvoir être annulée) ---
export async function supprimerEntree(req, res) {
  const entree = await Entree.findOne({ where: { id: req.params.id, egliseId: req.egliseId } })
  if (!entree) return res.status(404).json({ message: 'Entrée introuvable.' })
  await entree.destroy()
  res.status(204).send()
}

export async function supprimerCharge(req, res) {
  const charge = await Charge.findOne({ where: { id: req.params.id, egliseId: req.egliseId } })
  if (!charge) return res.status(404).json({ message: 'Charge introuvable.' })
  await charge.destroy()
  res.status(204).send()
}

// ---------------------------------------------------------------------------
// Finances DÉDIÉES À UN DÉPARTEMENT — totalement séparées des finances d'église
// ---------------------------------------------------------------------------

async function chargerDepartement(req) {
  return Departement.findOne({ where: { id: req.params.departementId, egliseId: req.egliseId } })
}

// Un chef de département ne voit que SON département
function autoriseDepartement(req, departement) {
  if (req.auth.role === 'chef_departement') {
    return departement.chefUtilisateurId === req.auth.sub
  }
  return ['pasteur', 'administrateur', 'tresorier'].includes(req.auth.role)
}

export async function financesDepartement(req, res) {
  const departement = await chargerDepartement(req)
  if (!departement) return res.status(404).json({ message: 'Département introuvable.' })
  if (!autoriseDepartement(req, departement)) {
    return res.status(403).json({ message: 'Accès refusé : vous ne gérez pas ce département.' })
  }

  const [entrees, charges] = await Promise.all([
    Entree.findAll({ where: { egliseId: req.egliseId, departementId: departement.id }, order: [['date', 'DESC']] }),
    Charge.findAll({ where: { egliseId: req.egliseId, departementId: departement.id }, order: [['date', 'DESC']] }),
  ])

  const totalEntrees = entrees.reduce((s, e) => s + e.montant, 0)
  const totalCharges = charges.reduce((s, c) => s + c.montant, 0)

  res.json({
    departement: { id: departement.id, nom: departement.nom },
    entrees,
    charges,
    totalEntrees,
    totalCharges,
    solde: totalEntrees - totalCharges,
  })
}

export async function creerEntreeDepartement(req, res) {
  const departement = await chargerDepartement(req)
  if (!departement) return res.status(404).json({ message: 'Département introuvable.' })
  if (!autoriseDepartement(req, departement)) {
    return res.status(403).json({ message: 'Accès refusé : vous ne gérez pas ce département.' })
  }

  const { type, provenance, montant, date } = req.body
  if (!type || !montant || !date) return res.status(400).json({ message: 'type, montant et date sont requis.' })
  const m = parseFloat(montant)
  if (!isFinite(m) || m < 0) return res.status(400).json({ message: 'Le montant doit être un nombre positif ou nul.' })

  const entree = await Entree.create({ type, provenance, montant: m, date, egliseId: req.egliseId, departementId: departement.id })
  res.status(201).json(entree)
}

export async function creerChargeDepartement(req, res) {
  const departement = await chargerDepartement(req)
  if (!departement) return res.status(404).json({ message: 'Département introuvable.' })
  if (!autoriseDepartement(req, departement)) {
    return res.status(403).json({ message: 'Accès refusé : vous ne gérez pas ce département.' })
  }

  const { categorie, description, montant, date } = req.body
  if (!categorie || !montant || !date) return res.status(400).json({ message: 'categorie, montant et date sont requis.' })
  const m = parseFloat(montant)
  if (!isFinite(m) || m < 0) return res.status(400).json({ message: 'Le montant doit être un nombre positif ou nul.' })

  const charge = await Charge.create({ categorie, description, montant: m, date, egliseId: req.egliseId, departementId: departement.id })
  res.status(201).json(charge)
}

// Vue d'ensemble pour l'administrateur : situation financière de CHAQUE département
export async function financesTousDepartements(req, res) {
  const departements = await Departement.findAll({ where: { egliseId: req.egliseId }, order: [['nom', 'ASC']] })
  if (departements.length === 0) return res.json([])

  const ids = departements.map((d) => d.id)
  const [entrees, charges] = await Promise.all([
    Entree.findAll({ where: { egliseId: req.egliseId, departementId: { [Op.in]: ids } } }),
    Charge.findAll({ where: { egliseId: req.egliseId, departementId: { [Op.in]: ids } } }),
  ])

  const synthese = departements.map((d) => {
    const e = entrees.filter((x) => x.departementId === d.id)
    const c = charges.filter((x) => x.departementId === d.id)
    const totalEntrees = e.reduce((s, x) => s + x.montant, 0)
    const totalCharges = c.reduce((s, x) => s + x.montant, 0)
    return {
      id: d.id,
      nom: d.nom,
      nbEntrees: e.length,
      nbCharges: c.length,
      totalEntrees,
      totalCharges,
      solde: totalEntrees - totalCharges,
    }
  })

  res.json(synthese)
}

// ---------------------------------------------------------------------------
// Bilan mensuel + PDF (général — hors finances de département)
// ---------------------------------------------------------------------------

// Regroupe entrées et charges par mois (YYYY-MM) pour alimenter les graphiques
export async function bilanMensuel(req, res) {
  const entrees = await Entree.findAll({ where: { egliseId: req.egliseId, departementId: { [Op.is]: null } } })
  const charges = await Charge.findAll({ where: { egliseId: req.egliseId, departementId: { [Op.is]: null } } })

  const parMois = {}
  const cle = (dateStr) => dateStr.slice(0, 7) // "2026-08"

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

  const bilan = Object.values(parMois).sort((a, b) => a.mois.localeCompare(b.mois))
  res.json(bilan)
}

const NOMS_MOIS_FR = {
  '01': 'Janvier', '02': 'Février', '03': 'Mars', '04': 'Avril', '05': 'Mai', '06': 'Juin',
  '07': 'Juillet', '08': 'Août', '09': 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre',
}

// Génère un PDF téléchargeable du bilan d'un mois donné (?mois=YYYY-MM)
export async function exporterBilanPdf(req, res) {
  const mois = String(req.query.mois || new Date().toISOString().slice(0, 7))
  const [annee, moisNum] = mois.split('-')

  // Filtre par plage de dates : Op.startsWith sur DATEONLY plante en PostgreSQL
  const plage = plageMois(mois)
  if (!plage) return res.status(400).json({ message: 'Format de mois invalide (attendu : YYYY-MM).' })

  const eglise = await Eglise.findByPk(req.egliseId)
  const entrees = await Entree.findAll({
    where: { egliseId: req.egliseId, departementId: { [Op.is]: null }, date: plage },
    order: [['date', 'ASC']],
  })
  const charges = await Charge.findAll({
    where: { egliseId: req.egliseId, departementId: { [Op.is]: null }, date: plage },
    order: [['date', 'ASC']],
  })

  const totalEntrees = entrees.reduce((s, e) => s + e.montant, 0)
  const totalCharges = charges.reduce((s, c) => s + c.montant, 0)
  const solde = totalEntrees - totalCharges
  const libelleMois = `${NOMS_MOIS_FR[moisNum] || moisNum} ${annee}`

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="bilan-${mois}.pdf"`)

  const doc = new PDFDocument({ margin: 50 })
  doc.pipe(res)

  // En-tête
  doc.fillColor('#0F1B2E').fontSize(20).text(eglise?.nom || 'Église', { continued: false })
  doc.fillColor('#666').fontSize(10).text(eglise?.ville || '')
  doc.moveDown(0.5)
  doc.fillColor('#C9A227').fontSize(14).text(`Bilan financier — ${libelleMois}`)
  doc.moveDown(1)
  doc.strokeColor('#C9A227').lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke()
  doc.moveDown(1)

  // Résumé
  doc.fillColor('#0F1B2E').fontSize(11)
  doc.text(`Total des entrées : ${formatFC(totalEntrees)}`)
  doc.text(`Total des charges : ${formatFC(totalCharges)}`)
  doc.font('Helvetica-Bold').text(`Solde du mois : ${formatFC(solde)}`)
  doc.font('Helvetica')
  doc.moveDown(1.5)

  // Tableau des entrées
  doc.fontSize(13).fillColor('#284370').text('Entrées', { underline: true })
  doc.moveDown(0.3)
  doc.fontSize(10).fillColor('#0F1B2E')
  if (entrees.length === 0) {
    doc.fillColor('#999').text('Aucune entrée enregistrée ce mois-ci.')
  }
  entrees.forEach((e) => {
    doc.fillColor('#0F1B2E').text(`${e.date}   ${e.type}${e.provenance ? ' — ' + e.provenance : ''}`, { continued: true })
    doc.fillColor('#3F6B4F').text(`   ${formatFC(e.montant)}`, { align: 'right' })
  })
  doc.moveDown(1)

  // Tableau des charges
  doc.fontSize(13).fillColor('#284370').text('Charges', { underline: true })
  doc.moveDown(0.3)
  doc.fontSize(10)
  if (charges.length === 0) {
    doc.fillColor('#999').text('Aucune charge enregistrée ce mois-ci.')
  }
  charges.forEach((c) => {
    doc.fillColor('#0F1B2E').text(`${c.date}   ${c.categorie}`, { continued: true })
    doc.fillColor('#B5502F').text(`   ${formatFC(c.montant)}`, { align: 'right' })
  })

  doc.moveDown(2)
  doc.fontSize(8).fillColor('#999').text(
    `Document généré automatiquement par ChurchApp le ${new Date().toLocaleDateString('fr-FR')}.`,
    { align: 'center' }
  )

  doc.end()
}
