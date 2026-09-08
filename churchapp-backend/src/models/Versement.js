import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Versement = sequelize.define('Versement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  montant: { type: DataTypes.FLOAT, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  note: { type: DataTypes.STRING },
})

export default Versement
