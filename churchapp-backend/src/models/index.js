import { sequelize } from '../config/database.js'
import Eglise from './Eglise.js'
import Utilisateur from './Utilisateur.js'
import Membre from './Membre.js'
import Culte from './Culte.js'
import Entree from './Entree.js'
import Charge from './Charge.js'
import Correspondance from './Correspondance.js'
import Annonce from './Annonce.js'
import Departement from './Departement.js'
import DepartementMembre from './DepartementMembre.js'
import PresenceCulte from './PresenceCulte.js'
import Evenement from './Evenement.js'
import SuperAdmin from './SuperAdmin.js'
import JournalActivite from './JournalActivite.js'
import Materiel from './Materiel.js'
import Communaute from './Communaute.js'
import CotisationConfig from './CotisationConfig.js'
import Echeance from './Echeance.js'
import Versement from './Versement.js'

// Chaque table "métier" appartient à une Eglise (isolation multi-tenant)
for (const Model of [Utilisateur, Membre, Culte, Entree, Charge, Annonce, Departement, Evenement, Materiel]) {
  Eglise.hasMany(Model, { foreignKey: 'egliseId', onDelete: 'CASCADE' })
  Model.belongsTo(Eglise, { foreignKey: 'egliseId' })
}

// Correspondance : appartient à l'église qui la détient dans SA boîte
// (egliseId = propriétaire de cet enregistrement, cohérent avec le tenantScope)
Eglise.hasMany(Correspondance, { foreignKey: 'egliseId', onDelete: 'CASCADE' })
Correspondance.belongsTo(Eglise, { foreignKey: 'egliseId', as: 'eglise' })

// Si la correspondance provient/part vers une église du système (et non un tiers externe)
Eglise.hasMany(Correspondance, { foreignKey: 'egliseCorrespondanteId', as: 'correspondancesLiees' })
Correspondance.belongsTo(Eglise, { foreignKey: 'egliseCorrespondanteId', as: 'egliseCorrespondante' })

// Lien entre l'enregistrement "sortante" (chez l'expéditeur) et "entrante" (chez le destinataire)
// pour la même correspondance numérique inter-églises — permet de propager l'accusé de réception.
Correspondance.belongsTo(Correspondance, { foreignKey: 'correspondanceLieeId', as: 'correspondanceLiee' })

// --- Ressources Humaines : Départements, ouvriers, comptes, présence ---

// Un membre peut avoir un compte de connexion ("ouvrier")
Membre.belongsTo(Utilisateur, { foreignKey: 'utilisateurId', as: 'compte' })

// Un département a un chef (un membre)
Departement.belongsTo(Membre, { foreignKey: 'chefMembreId', as: 'chef' })

// Un département a plusieurs ouvriers (membres), et un membre peut appartenir à plusieurs départements
Departement.belongsToMany(Membre, { through: DepartementMembre, as: 'ouvriers', foreignKey: 'departementId' })
Membre.belongsToMany(Departement, { through: DepartementMembre, as: 'departements', foreignKey: 'membreId' })

// Présence individuelle par culte
Culte.hasMany(PresenceCulte, { foreignKey: 'culteId', onDelete: 'CASCADE' })
PresenceCulte.belongsTo(Culte, { foreignKey: 'culteId' })
Membre.hasMany(PresenceCulte, { foreignKey: 'membreId', onDelete: 'CASCADE' })
PresenceCulte.belongsTo(Membre, { foreignKey: 'membreId' })

// Un événement de planning peut avoir un responsable parmi les membres
Evenement.belongsTo(Membre, { foreignKey: 'responsableMembreId', as: 'responsable' })

// --- Communautés (dénominations) et recouvrement des cotisations ---

// Une communauté regroupe plusieurs églises ; une église appartient à 0 ou 1 communauté
Communaute.hasMany(Eglise, { foreignKey: 'communauteId', as: 'eglises' })
Eglise.belongsTo(Communaute, { foreignKey: 'communauteId' })

// Un compte "communaute" (Utilisateur.role === 'communaute') est rattaché à une Communaute
Communaute.hasMany(Utilisateur, { foreignKey: 'communauteId', as: 'comptes' })
Utilisateur.belongsTo(Communaute, { foreignKey: 'communauteId' })

for (const Model of [CotisationConfig, Echeance, Versement]) {
  Communaute.hasMany(Model, { foreignKey: 'communauteId', onDelete: 'CASCADE' })
  Model.belongsTo(Communaute, { foreignKey: 'communauteId' })
  Eglise.hasMany(Model, { foreignKey: 'egliseId', onDelete: 'CASCADE' })
  Model.belongsTo(Eglise, { foreignKey: 'egliseId' })
}

// Un versement peut être affecté à une échéance précise (ou non affecté explicitement)
Echeance.hasMany(Versement, { foreignKey: 'echeanceId' })
Versement.belongsTo(Echeance, { foreignKey: 'echeanceId' })

export {
  sequelize, Eglise, Utilisateur, Membre, Culte, Entree, Charge, Correspondance, Annonce,
  Departement, DepartementMembre, PresenceCulte, Evenement, SuperAdmin, JournalActivite,
  Materiel, Communaute, CotisationConfig, Echeance, Versement,
}
