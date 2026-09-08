import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Utilisateur = sequelize.define('Utilisateur', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  motDePasseHash: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('pasteur', 'administrateur', 'tresorier', 'ouvrier', 'communaute'), allowNull: false },
  telephone: { type: DataTypes.STRING },
  actif: { type: DataTypes.BOOLEAN, defaultValue: true }, // false = compte bloqué par le Super Admin
  // Un compte "communaute" n'appartient à aucune église (egliseId reste vide) —
  // il est rattaché à une Communaute via communauteId à la place.
  communauteId: { type: DataTypes.UUID, allowNull: true },
})

export default Utilisateur
