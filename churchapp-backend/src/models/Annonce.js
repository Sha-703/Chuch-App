import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Annonce = sequelize.define('Annonce', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  titre: { type: DataTypes.STRING, allowNull: false },
  contenu: { type: DataTypes.TEXT, allowNull: false },
  photoUrl: { type: DataTypes.STRING },
  dateDebut: { type: DataTypes.DATEONLY, allowNull: false },
  dateFin: { type: DataTypes.DATEONLY, allowNull: false }, // passé cette date, l'annonce est supprimée automatiquement
})

export default Annonce
