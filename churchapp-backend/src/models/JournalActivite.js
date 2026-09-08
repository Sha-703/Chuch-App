import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

// Journal simple : qui a fait quoi, quand. Consulté uniquement depuis
// l'espace Super Admin. Volontairement minimal (pas un vrai audit trail
// exhaustif) — voir cahier des charges §3.4.
const JournalActivite = sequelize.define('JournalActivite', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  action: { type: DataTypes.STRING, allowNull: false }, // ex: "correspondance.archivee"
  details: { type: DataTypes.STRING },
  egliseNom: { type: DataTypes.STRING },
  utilisateurNom: { type: DataTypes.STRING },
})

export default JournalActivite
