import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Membre = sequelize.define('Membre', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'Membre' },
  contact: { type: DataTypes.STRING },
  depuis: { type: DataTypes.STRING },
  utilisateurId: { type: DataTypes.UUID, allowNull: true, unique: true }, // compte de connexion "ouvrier", si activé
})

export default Membre
