import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Entree = sequelize.define('Entree', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  // STRING (et non ENUM) volontairement : quand l'utilisateur choisit "Autre"
  // dans le formulaire, c'est le texte qu'il tape qui est stocké ici directement
  // (ex. "Vente de livres"), pas le mot littéral "Autre".
  type: { type: DataTypes.STRING, allowNull: false },
  provenance: { type: DataTypes.STRING },
  montant: { type: DataTypes.FLOAT, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
})

export default Entree
