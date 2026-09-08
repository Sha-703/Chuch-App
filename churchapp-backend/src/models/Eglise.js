import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Eglise = sequelize.define('Eglise', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  denomination: { type: DataTypes.STRING },
  ville: { type: DataTypes.STRING },
  statut: { type: DataTypes.ENUM('actif', 'suspendu'), defaultValue: 'actif' },
  communauteId: { type: DataTypes.UUID, allowNull: true }, // rattachement optionnel à une communauté/dénomination
})

export default Eglise
