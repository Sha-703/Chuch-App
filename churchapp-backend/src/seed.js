import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { sequelize, Eglise, Utilisateur, Membre, Culte, Entree, Charge, SuperAdmin } from './models/index.js'

async function seed() {
  await sequelize.sync({ force: true })

  const eglise = await Eglise.create({
    nom: 'CEC Bethel Mbanza-Ngungu',
    denomination: 'Communauté des Églises du Christ',
    ville: 'Mbanza-Ngungu, Kongo-Central',
  })

  const hash = await bcrypt.hash('demo1234', 10)

  await Utilisateur.create({
    nom: 'Past. Jean-Pierre Kibambe',
    email: 'pasteur@demo.cd',
    motDePasseHash: hash,
    role: 'pasteur',
    egliseId: eglise.id,
  })

  await Utilisateur.create({
    nom: 'Sr. Grace Nsimba',
    email: 'admin@demo.cd',
    motDePasseHash: hash,
    role: 'administrateur',
    egliseId: eglise.id,
  })

  await Membre.bulkCreate([
    { nom: 'Fam. Nsimba', role: 'Membre', depuis: '2018', contact: '+243 81 234 5678', egliseId: eglise.id },
    { nom: 'Fr. Mbemba', role: 'Diacre', depuis: '2015', contact: '+243 89 876 5432', egliseId: eglise.id },
    { nom: 'Anc. Mafuta', role: 'Ancien', depuis: '2012', contact: '+243 84 456 7890', egliseId: eglise.id },
    { nom: 'Fam. Kiese', role: 'Membre', depuis: '2021', contact: '+243 85 567 8901', egliseId: eglise.id },
  ])

  await Culte.bulkCreate([
    { type: 'Culte dominical', date: '2026-08-23', predicateur: 'Past. Kibambe', presentiel: 312, enLigne: 74, egliseId: eglise.id },
    { type: 'Réunion de prière', date: '2026-08-20', predicateur: 'Anc. Mafuta', presentiel: 96, enLigne: 21, egliseId: eglise.id },
    { type: 'Culte dominical', date: '2026-08-16', predicateur: 'Past. Kibambe', presentiel: 298, enLigne: 61, egliseId: eglise.id },
    { type: 'Étude biblique', date: '2026-08-13', predicateur: 'Sr. Nsimba', presentiel: 74, enLigne: 15, egliseId: eglise.id },
    { type: 'Culte dominical', date: '2026-08-09', predicateur: 'Past. Kibambe', presentiel: 305, enLigne: 58, egliseId: eglise.id },
  ])

  await Entree.bulkCreate([
    { type: 'Dîme', provenance: 'Fam. Nsimba', montant: 25000, date: '2026-08-23', egliseId: eglise.id },
    { type: 'Offrande', provenance: 'Culte du dimanche', montant: 340000, date: '2026-08-23', egliseId: eglise.id },
    { type: 'Don spécial', provenance: 'Fam. Kiese', montant: 100000, date: '2026-08-20', egliseId: eglise.id },
    { type: 'Dîme', provenance: 'Fr. Mbemba', montant: 15000, date: '2026-08-18', egliseId: eglise.id },
    { type: 'Offrande', provenance: 'Culte de prière', montant: 68000, date: '2026-08-17', egliseId: eglise.id },
    { type: 'Offrande', provenance: 'Culte du dimanche', montant: 298000, date: '2026-07-26', egliseId: eglise.id },
    { type: 'Dîme', provenance: 'Fam. Nsimba', montant: 25000, date: '2026-07-19', egliseId: eglise.id },
  ])

  await Charge.bulkCreate([
    { categorie: 'Électricité (SNEL)', montant: 85000, date: '2026-08-15', egliseId: eglise.id },
    { categorie: 'Soutien pasteur', montant: 400000, date: '2026-08-01', egliseId: eglise.id },
    { categorie: 'Entretien bâtiment', montant: 120000, date: '2026-08-10', egliseId: eglise.id },
    { categorie: "Œuvre sociale", montant: 60000, date: '2026-08-05', egliseId: eglise.id },
    { categorie: 'Soutien pasteur', montant: 400000, date: '2026-07-01', egliseId: eglise.id },
  ])

  console.log('Base de données peuplée avec succès.')
  console.log('Connexion démo : pasteur@demo.cd / admin@demo.cd — mot de passe : demo1234')

  // Deuxième église, pour tester la correspondance et les annonces inter-églises
  const eglise2 = await Eglise.create({
    nom: 'Église Nouvelle Alliance Kinshasa',
    denomination: '8e CEPAC',
    ville: 'Kinshasa',
  })
  await Utilisateur.create({
    nom: 'Past. Emmanuel Lutete',
    email: 'pasteur2@demo.cd',
    motDePasseHash: hash,
    role: 'pasteur',
    egliseId: eglise2.id,
  })
  console.log('Deuxième église de démo : pasteur2@demo.cd — mot de passe : demo1234')

  await SuperAdmin.create({
    nom: 'Super Admin ChurchApp',
    email: 'superadmin@churchapp.cd',
    motDePasseHash: hash,
  })
  console.log('Super Admin : superadmin@churchapp.cd — mot de passe : demo1234')

  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
