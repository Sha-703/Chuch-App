import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Annonce = sequelize.define('Annonce', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  titre: { type: DataTypes.STRING, allowNull: false },
  contenu: { type: DataTypes.TEXT, allowNull: false },
  photoUrl: { type: DataTypes.STRING },
  dateDebut: { type: DataTypes.DATEONLY, allowNull: false },
  dateFin: { type: DataTypes.DATEONLY, allowNull: false }, // passé cette date, l'annonce est supprimée automatiquement
  // Portée de l'annonce :
  //  - 'reseau'  : visible par TOUTES les églises du système (mur public, comportement historique)
  //  - 'ouvriers': STRICTEMENT réservée aux comptes de l'église qui l'a créée
  //                (pasteur/admin de l'église + ouvriers + chefs de département)
  portee: { type: DataTypes.STRING, allowNull: false, defaultValue: 'reseau' },
})

export default Annonce
