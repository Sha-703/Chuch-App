import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Departement = sequelize.define('Departement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  chefMembreId: { type: DataTypes.UUID, allowNull: true },
})

export default Departement
