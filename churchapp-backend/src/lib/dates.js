import { Op } from 'sequelize'

// Construit une plage [début, fin) pour filtrer une colonne DATEONLY.
//
// ATTENTION : ne JAMAIS utiliser Op.startsWith / Op.like sur une colonne DATE/DATEONLY.
// En SQLite les dates sont stockées en texte, ça "fonctionne" ; en PostgreSQL cela
// génère `date LIKE '2026-10%'` → erreur `operator does not exist: date ~~ unknown`
// → exception Sequelize non rattrapée → crash du process Node (Railway restart).
//
// Usage : plageMois('2026-10') => { [Op.gte]: '2026-10-01', [Op.lt]: '2026-11-01' }
//        plageAnnee('2026')    => { [Op.gte]: '2026-01-01', [Op.lt]: '2027-01-01' }

function moisSuivant(aaaamm) {
  const [annee, mois] = aaaamm.split('-').map(Number)
  if (!annee || !mois || mois < 1 || mois > 12) return null
  const anneeFin = mois === 12 ? annee + 1 : annee
  const moisFin = mois === 12 ? 1 : mois + 1
  return `${anneeFin}-${String(moisFin).padStart(2, '0')}`
}

// "2026-10" → plage sur tout le mois (paramètre déjà validé par les routes)
export function plageMois(mois) {
  const suivant = moisSuivant(String(mois))
  if (!suivant) return null
  return { [Op.gte]: `${mois}-01`, [Op.lt]: `${suivant}-01` }
}

// "2026" → plage sur toute l'année
export function plageAnnee(annee) {
  const a = Number(annee)
  if (!Number.isInteger(a) || a < 1900 || a > 9999) return null
  return { [Op.gte]: `${a}-01-01`, [Op.lt]: `${a + 1}-01-01` }
}
