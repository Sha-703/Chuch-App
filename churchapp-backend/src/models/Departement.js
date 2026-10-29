import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Departement = sequelize.define('Departement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  chefMembreId: { type: DataTypes.UUID, allowNull: true },
  // Compte de connexion du chef de département (role "chef_departement")
  // — lui ouvre un espace dédié : ses ouvriers + les finances de son département.
  chefUtilisateurId: { type: DataTypes.UUID, allowNull: true, unique: true },
})

export default Departement
