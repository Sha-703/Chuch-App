import { DataTypes } from 'sequelize'
import { sequelize } from '../config/database.js'

// ---------------------------------------------------------------------------
// Fichier téléversé (photo d'annonce, scan de correspondance…) stocké EN BASE.
//
// Le disque du conteneur Railway est ÉPHÉMÈRE : tout fichier écrit dessus
// disparaît au moindre redéploiement. PostgreSQL, lui, persiste — c'est donc
// là que vivent les fichiers désormais.
//
// Servi par GET /uploads/:nom (app.js) — les URLs ne changent pas :
//   https://<backend>/uploads/<nom>
// ---------------------------------------------------------------------------
const Fichier = sequelize.define('Fichier', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  // Nom unique généré à l'upload (horodatage + aléa), utilisé dans l'URL
  nom: { type: DataTypes.STRING, allowNull: false, unique: true },
  typeMime: { type: DataTypes.STRING, allowNull: false }, // image/jpeg, image/png, image/webp, application/pdf
  taille: { type: DataTypes.INTEGER, allowNull: false }, // octets
  donnees: { type: DataTypes.BLOB('long'), allowNull: false }, // octets bruts du fichier
  // 'annonce' | 'correspondance' | 'legacy' (importé depuis l'ancien disque)
  source: { type: DataTypes.STRING },
})

export default Fichier
