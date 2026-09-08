import { Op } from 'sequelize'
import PDFDocument from 'pdfkit'
import { Entree, Charge, Culte, Correspondance, Annonce, Eglise } from '../models/index.js'
import { formatFC } from '../lib/format.js'

const NOMS_MOIS_FR = {
  '01': 'Janvier', '02': 'Février', '03': 'Mars', '04': 'Avril', '05': 'Mai', '06': 'Juin',
  '07': 'Juillet', '08': 'Août', '09': 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre',
}

function ligneTitre(doc, texte) {
  doc.moveDown(1.2)
  doc.fontSize(13).fillColor('#284370').font('Helvetica-Bold').text(texte, { underline: true })
  doc.font('Helvetica').moveDown(0.4)
}

// Rapport de transparence annuel : un seul PDF qui reprend TOUT ce qui concerne
// l'église sur l'année choisie — finances mois par mois, présence aux cultes,
// courrier, et annonces publiées. Voir cahier des charges §2.2.
export async function exporterRapportAnnuelPdf(req, res) {
  const annee = req.query.annee || new Date().getFullYear().toString()

  const eglise = await Eglise.findByPk(req.egliseId)

  const [entrees, charges, cultes, correspondances, annonces] = await Promise.all([
    Entree.findAll({ where: { egliseId: req.egliseId, date: { [Op.startsWith]: annee } }, order: [['date', 'ASC']] }),
    Charge.findAll({ where: { egliseId: req.egliseId, date: { [Op.startsWith]: annee } }, order: [['date', 'ASC']] }),
    Culte.findAll({ where: { egliseId: req.egliseId, date: { [Op.startsWith]: annee } }, order: [['date', 'ASC']] }),
    Correspondance.findAll({ where: { egliseId: req.egliseId, dateReception: { [Op.startsWith]: annee } } }),
    Annonce.findAll({ where: { egliseId: req.egliseId, createdAt: { [Op.gte]: new Date(`${annee}-01-01`), [Op.lt]: new Date(`${Number(annee) + 1}-01-01`) } } }),
  ])

  // --- Regroupement financier par mois ---
  const parMois = {}
  for (const e of entrees) {
    const m = e.date.slice(5, 7)
    parMois[m] = parMois[m] || { entrees: 0, charges: 0 }
    parMois[m].entrees += e.montant
  }
  for (const c of charges) {
    const m = c.date.slice(5, 7)
    parMois[m] = parMois[m] || { entrees: 0, charges: 0 }
    parMois[m].charges += c.montant
  }
  const totalEntrees = entrees.reduce((s, e) => s + e.montant, 0)
  const totalCharges = charges.reduce((s, c) => s + c.montant, 0)

  // --- Statistiques de présence ---
  const nbCultes = cultes.length
  const totalPresentiel = cultes.reduce((s, c) => s + c.presentiel, 0)
  const totalEnLigne = cultes.reduce((s, c) => s + c.enLigne, 0)
  const moyennePresentiel = nbCultes ? Math.round(totalPresentiel / nbCultes) : 0
  const moyenneEnLigne = nbCultes ? Math.round(totalEnLigne / nbCultes) : 0

  // --- Statistiques de courrier ---
  const nbEntrantes = correspondances.filter((c) => c.sens === 'entrante').length
  const nbSortantes = correspondances.filter((c) => c.sens === 'sortante').length
  const nbArchivees = correspondances.filter((c) => c.etat === 'archive').length
  const aujourdHui = new Date().toISOString().slice(0, 10)
  const nbEnRetard = correspondances.filter(
    (c) => c.etat !== 'archive' && c.dateLimiteTraitement && aujourdHui > c.dateLimiteTraitement
  ).length

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="rapport-annuel-${annee}.pdf"`)

  const doc = new PDFDocument({ margin: 50 })
  doc.pipe(res)

  // En-tête
  doc.fillColor('#0F1B2E').fontSize(20).font('Helvetica-Bold').text(eglise?.nom || 'Église')
  doc.font('Helvetica').fillColor('#666').fontSize(10).text(eglise?.ville || '')
  doc.moveDown(0.5)
  doc.fillColor('#C9A227').fontSize(16).font('Helvetica-Bold').text(`Rapport de transparence annuel — ${annee}`)
  doc.font('Helvetica')
  doc.moveDown(0.8)
  doc.strokeColor('#C9A227').lineWidth(1.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke()

  // Section 1 — Finances
  ligneTitre(doc, '1. Finances')
  doc.fontSize(10).fillColor('#0F1B2E')
  doc.text(`Total des entrées sur l'année : ${formatFC(totalEntrees)}`)
  doc.text(`Total des charges sur l'année : ${formatFC(totalCharges)}`)
  doc.font('Helvetica-Bold').text(`Solde annuel : ${formatFC(totalEntrees - totalCharges)}`)
  doc.font('Helvetica').moveDown(0.5)

  doc.fontSize(9).fillColor('#284370').text('Détail mois par mois :', { underline: false })
  doc.moveDown(0.2)
  Object.keys(NOMS_MOIS_FR).forEach((m) => {
    const donnees = parMois[m]
    if (!donnees) return
    const soldeMois = donnees.entrees - donnees.charges
    const nomMoisAligne = NOMS_MOIS_FR[m].padEnd(11, ' ')
    doc.fillColor('#0F1B2E').fontSize(9).text(nomMoisAligne, { continued: true })
    doc.fillColor('#3F6B4F').text(`Entrées ${formatFC(donnees.entrees)}`, { continued: true })
    doc.fillColor('#B5502F').text(`   Charges ${formatFC(donnees.charges)}`, { continued: true })
    doc.fillColor(soldeMois >= 0 ? '#3F6B4F' : '#B5502F').text(`   Solde ${formatFC(soldeMois)}`, { continued: false })
  })
  if (Object.keys(parMois).length === 0) {
    doc.fillColor('#999').text('Aucune donnée financière enregistrée cette année.')
  }

  // Section 2 — Présence aux cultes
  ligneTitre(doc, '2. Présence aux cultes')
  doc.fontSize(10).fillColor('#0F1B2E')
  doc.text(`Nombre de cultes enregistrés : ${nbCultes}`)
  doc.text(`Présence moyenne en salle : ${moyennePresentiel} personnes`)
  doc.text(`Présence moyenne en ligne : ${moyenneEnLigne} personnes`)
  doc.text(`Total cumulé de participations (salle + ligne) : ${totalPresentiel + totalEnLigne}`)

  // Section 3 — Courrier
  ligneTitre(doc, '3. Correspondance')
  doc.fontSize(10).fillColor('#0F1B2E')
  doc.text(`Courriers reçus : ${nbEntrantes}`)
  doc.text(`Courriers envoyés : ${nbSortantes}`)
  doc.text(`Courriers archivés (traités) : ${nbArchivees}`)
  doc.fillColor(nbEnRetard > 0 ? '#B5502F' : '#0F1B2E').text(`Courriers en retard à ce jour : ${nbEnRetard}`)
  doc.fillColor('#0F1B2E')

  // Section 4 — Annonces
  ligneTitre(doc, '4. Annonces publiées')
  doc.fontSize(10).fillColor('#0F1B2E')
  doc.text(`Annonces publiées par l'église cette année : ${annonces.length}`)

  doc.moveDown(2)
  doc.fontSize(8).fillColor('#999').text(
    `Document généré automatiquement par ChurchApp le ${new Date().toLocaleDateString('fr-FR')}.`,
    { align: 'center' }
  )

  doc.end()
}
