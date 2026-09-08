import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

// Une ligne = la réponse d'un membre/ouvrier pour un culte donné.
// Absence de ligne = "sans réponse" (calculé côté contrôleur, pas stocké).
const PresenceCulte = sequelize.define('PresenceCulte', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  statut: { type: DataTypes.ENUM('present', 'absent'), allowNull: false },
  raison: { type: DataTypes.STRING }, // requis en pratique si statut = absent
}, {
  indexes: [{ unique: true, fields: ['culteId', 'membreId'] }],
})

export default PresenceCulte
