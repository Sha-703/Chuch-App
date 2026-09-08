import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Correspondance = sequelize.define('Correspondance', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  sens: { type: DataTypes.ENUM('entrante', 'sortante'), allowNull: false },
  type: { type: DataTypes.ENUM('physique', 'numerique'), allowNull: false },
  etat: { type: DataTypes.ENUM('entrant', 'en_traitement', 'archive'), defaultValue: 'entrant' },

  objet: { type: DataTypes.STRING, allowNull: false },
  contenu: { type: DataTypes.TEXT },
  fichierUrl: { type: DataTypes.STRING }, // scan du document physique ou pièce jointe numérique

  // Correspondant externe (hors système) — utilisé si egliseCorrespondanteId est vide
  correspondantExterne: { type: DataTypes.STRING },

  dateReception: { type: DataTypes.DATEONLY, allowNull: false },
  dateLimiteTraitement: { type: DataTypes.DATEONLY }, // dateReception + 8 jours, calculé à la création
  dateArchivage: { type: DataTypes.DATEONLY },

  accuseEnvoye: { type: DataTypes.BOOLEAN, defaultValue: false },
  accuseEnvoyeLe: { type: DataTypes.DATE },
})

export default Correspondance
