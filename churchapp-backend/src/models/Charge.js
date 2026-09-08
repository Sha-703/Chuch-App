import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Charge = sequelize.define('Charge', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  categorie: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  montant: { type: DataTypes.FLOAT, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
})

export default Charge
