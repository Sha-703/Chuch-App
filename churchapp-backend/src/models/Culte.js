import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Culte = sequelize.define('Culte', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  predicateur: { type: DataTypes.STRING },
  presentiel: { type: DataTypes.INTEGER, defaultValue: 0 },
  enLigne: { type: DataTypes.INTEGER, defaultValue: 0 },
})

export default Culte
