import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

// Une communauté (dénomination) regroupe plusieurs églises — ex: la CADEC.
// Créée uniquement par le Super Admin, qui y rattache ensuite des églises.
const Communaute = sequelize.define('Communaute', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
})

export default Communaute
