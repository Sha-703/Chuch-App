import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Evenement = sequelize.define('Evenement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  titre: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  heure: { type: DataTypes.STRING }, // ex: "10:00", facultatif

  responsableMembreId: { type: DataTypes.UUID, allowNull: true },
  responsableLibre: { type: DataTypes.STRING }, // si le responsable n'est pas un membre enregistré

  rappelActif: { type: DataTypes.BOOLEAN, defaultValue: false },
  rappelDate: { type: DataTypes.DATE, allowNull: true }, // date+heure à laquelle le rappel doit s'afficher

  recurrence: { type: DataTypes.ENUM('aucune', 'trimestrielle'), defaultValue: 'aucune' },
  serieId: { type: DataTypes.UUID, allowNull: true }, // relie les occurrences d'un même événement répété
})

export default Evenement
