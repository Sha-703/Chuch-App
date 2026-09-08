import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

// Table de jonction : quels membres ("ouvriers") appartiennent à quel département
const DepartementMembre = sequelize.define('DepartementMembre', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
})

export default DepartementMembre
