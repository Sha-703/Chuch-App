import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

const Culte = sequelize.define('Culte', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  type: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  predicateur: { type: DataTypes.STRING },
  // Présence physique des membres (simple nombre) saisie MANUELLEMENT par
  // l'administrateur depuis la liste des cultes. Elle s'ajoute aux présences
  // en ligne des ouvriers (table PresenceCulte) pour donner le total.
  presentiel: { type: DataTypes.INTEGER, defaultValue: 0 },
})

export default Culte
