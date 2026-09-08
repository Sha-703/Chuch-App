import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

// Compte global de pilotage du système — n'appartient à AUCUNE église.
// Volontairement séparé de Utilisateur pour ne jamais mélanger les deux
// mondes (voir cahier des charges §3.4 : espace caché, réservé à l'équipe ChurchApp).
const SuperAdmin = sequelize.define('SuperAdmin', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  motDePasseHash: { type: DataTypes.STRING, allowNull: false },
})

export default SuperAdmin
