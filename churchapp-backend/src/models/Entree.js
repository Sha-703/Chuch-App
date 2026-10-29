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
  // Si renseigné : c'est une entrée APPARTENANT À UN DÉPARTEMENT (finances
  // dédiées, séparées des finances générales de l'église).
  // Si null : entrée générale de l'église.
  departementId: { type: DataTypes.UUID, allowNull: true },
})

export default Entree
