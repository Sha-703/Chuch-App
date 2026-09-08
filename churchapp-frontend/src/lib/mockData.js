export const eglise = {
  nom: 'CEC Bethel Mbanza-Ngungu',
  ville: 'Mbanza-Ngungu, Kongo-Central',
  pasteur: 'Past. Jean-Pierre Kibambe',
  administrateur: 'Sr. Grace Nsimba',
}

export const bilanMensuel = [
  { mois: 'Mars', entrees: 1450000, charges: 980000 },
  { mois: 'Avr', entrees: 1620000, charges: 1050000 },
  { mois: 'Mai', entrees: 1380000, charges: 1120000 },
  { mois: 'Juin', entrees: 1790000, charges: 1240000 },
  { mois: 'Juil', entrees: 1950000, charges: 1300000 },
  { mois: 'Août', entrees: 2100000, charges: 1180000 },
]

export const entreesRecentes = [
  { id: 1, type: 'Dîme', membre: 'Fam. Nsimba', montant: 25000, date: '2026-08-23' },
  { id: 2, type: 'Offrande', membre: 'Culte du dimanche', montant: 340000, date: '2026-08-23' },
  { id: 3, type: 'Don spécial', membre: 'Fam. Kiese', montant: 100000, date: '2026-08-20' },
  { id: 4, type: 'Dîme', membre: 'Fr. Mbemba', montant: 15000, date: '2026-08-18' },
  { id: 5, type: 'Offrande', membre: 'Culte de prière', montant: 68000, date: '2026-08-17' },
]

export const charges = [
  { id: 1, categorie: 'Électricité (SNEL)', montant: 85000, date: '2026-08-15' },
  { id: 2, categorie: 'Soutien pasteur', montant: 400000, date: '2026-08-01' },
  { id: 3, categorie: 'Entretien bâtiment', montant: 120000, date: '2026-08-10' },
  { id: 4, categorie: "Œuvre sociale", montant: 60000, date: '2026-08-05' },
]

export const cultes = [
  { id: 1, date: '2026-08-23', type: 'Culte dominical', predicateur: 'Past. Kibambe', presentiel: 312, enLigne: 74 },
  { id: 2, date: '2026-08-20', type: 'Réunion de prière', predicateur: 'Anc. Mafuta', presentiel: 96, enLigne: 21 },
  { id: 3, date: '2026-08-16', type: 'Culte dominical', predicateur: 'Past. Kibambe', presentiel: 298, enLigne: 61 },
  { id: 4, date: '2026-08-13', type: 'Étude biblique', predicateur: 'Sr. Nsimba', presentiel: 74, enLigne: 15 },
  { id: 5, date: '2026-08-09', type: 'Culte dominical', predicateur: 'Past. Kibambe', presentiel: 305, enLigne: 58 },
]

export const frequentation = cultes
  .slice()
  .reverse()
  .map((c) => ({ date: c.date.slice(5), presentiel: c.presentiel, enLigne: c.enLigne }))

export function formatFC(montant) {
  return new Intl.NumberFormat('fr-CD', { maximumFractionDigits: 0 }).format(montant) + ' FC'
}
