import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

// Une échéance = une période pour laquelle une église doit verser sa cotisation.
// Générée automatiquement depuis CotisationConfig. montantPaye augmente au fil
// des versements reçus (voir Versement.js) — le solde dû se calcule par soustraction.
const Echeance = sequelize.define('Echeance', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  periodeLibelle: { type: DataTypes.STRING, allowNull: false }, // ex: "Septembre 2026"
  dateEcheance: { type: DataTypes.DATEONLY, allowNull: false },
  montantDu: { type: DataTypes.FLOAT, allowNull: false },
  montantPaye: { type: DataTypes.FLOAT, defaultValue: 0 },
})

export default Echeance
