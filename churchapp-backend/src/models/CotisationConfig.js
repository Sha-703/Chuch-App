import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

// Configuration de la cotisation qu'une église doit verser à sa communauté.
const CotisationConfig = sequelize.define('CotisationConfig', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  montant: { type: DataTypes.FLOAT, allowNull: false },
  periodicite: { type: DataTypes.ENUM('mensuelle', 'trimestrielle', 'annuelle'), defaultValue: 'mensuelle' },
})

export default CotisationConfig
