import { Op } from 'sequelize'
import PDFDocument from 'pdfkit'
import { Entree, Charge, Eglise } from '../models/index.js'
import { formatFC } from '../lib/format.js'

export async function listerEntrees(req, res) {
  const entrees = await Entree.findAll({
    where: { egliseId: req.egliseId },
    order: [['date', 'DESC']],
  })
  res.json(entrees)
}

export async function creerEntree(req, res) {
  const { type, provenance, montant, date } = req.body
  if (!type || !montant || !date) {
    return res.status(400).json({ message: 'type, montant et date sont requis.' })
  }
  const entree = await Entree.create({ type, provenance, montant, date, egliseId: req.egliseId })
  res.status(201).json(entree)
}

export async function listerCharges(req, res) {
  const charges = await Charge.findAll({
    where: { egliseId: req.egliseId },
    order: [['date', 'DESC']],
  })
  res.json(charges)
}

export async function creerCharge(req, res) {
  const { categorie, description, montant, date } = req.body
  if (!categorie || !montant || !date) {
    return res.status(400).json({ message: 'categorie, montant et date sont requis.' })
  }
  const charge = await Charge.create({ categorie, description, montant, date, egliseId: req.egliseId })
  res.status(201).json(charge)
}

// Regroupe entrées et charges par mois (YYYY-MM) pour alimenter les graphiques
export async function bilanMensuel(req, res) {
  const entrees = await Entree.findAll({ where: { egliseId: req.egliseId } })
  const charges = await Charge.findAll({ where: { egliseId: req.egliseId } })

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
  const mois = req.query.mois || new Date().toISOString().slice(0, 7)
  const [annee, moisNum] = mois.split('-')

  const eglise = await Eglise.findByPk(req.egliseId)
  const entrees = await Entree.findAll({
    where: { egliseId: req.egliseId, date: { [Op.startsWith]: mois } },
    order: [['date', 'ASC']],
  })
  const charges = await Charge.findAll({
    where: { egliseId: req.egliseId, date: { [Op.startsWith]: mois } },
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
