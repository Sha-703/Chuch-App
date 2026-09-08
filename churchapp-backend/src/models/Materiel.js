import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Materiel = sequelize.define('Materiel', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  categorie: { type: DataTypes.STRING },
  quantite: { type: DataTypes.INTEGER, defaultValue: 0 },
  seuilAlerte: { type: DataTypes.INTEGER, defaultValue: 5 }, // en dessous = affiché en rouge
  etat: { type: DataTypes.ENUM('bon', 'moyen', 'mauvais'), defaultValue: 'bon' },
})

export default Materiel
