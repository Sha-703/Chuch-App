import multer from 'multer'
import path from 'path'
import fs from 'fs'
import Fichier from '../models/Fichier.js'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const typesAutorises = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

function filtreFichier(req, file, cb) {
  if (typesAutorises.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Type de fichier non autorisé (image ou PDF uniquement).'))
}

// ---------------------------------------------------------------------------
// Les fichiers sont lus EN MÉMOIRE puis écrits dans PostgreSQL (voir modèle
// Fichier) : le disque du conteneur Railway est éphémère — tout ce qui y était
// écrit disparaissait à chaque redéploiement. La base persiste.
// Le dossier ./uploads ne sert plus qu'aux anciens fichiers (legacy).
// ---------------------------------------------------------------------------
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: filtreFichier,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 Mo
})

const MIME_PAR_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
}

export function urlFichier(req, filename) {
  // PUBLIC_API_URL permet de forcer l'origine publique (utile si le Host
  // derrière le proxy Railway n'est pas celui attendu).
  const base = process.env.PUBLIC_API_URL
    ? process.env.PUBLIC_API_URL.replace(/\/$/, '')
    : `${req.protocol}://${req.get('host')}`
  return `${base}/uploads/${filename}`
}

// Écrit le fichier téléversé (req.file, en mémoire) EN BASE et renvoie son
// URL publique. Appelé par les contrôleurs à la place de urlFichier(req, ...).
export async function persisterFichier(req, source) {
  if (!req.file) return null
  const ext = (path.extname(req.file.originalname || '').toLowerCase())
    || Object.keys(MIME_PAR_EXT).find((e) => MIME_PAR_EXT[e] === req.file.mimetype)
    || ''
  const nom = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
  await Fichier.create({
    nom,
    typeMime: req.file.mimetype,
    taille: req.file.size,
    donnees: req.file.buffer,
    source,
    egliseId: req.egliseId || null,
  })
  return urlFichier(req, nom)
}

// Supprime un fichier de la base à partir de son URL. Best-effort : une
// erreur ne doit jamais faire échouer la suppression de l'enregistrement
// métier qui le reference.
export async function supprimerFichier(url) {
  try {
    if (!url) return
    const partie = url.split('/uploads/')[1]
    if (!partie) return
    const nom = partie.split('?')[0]
    await Fichier.destroy({ where: { nom } })
  } catch (err) {
    console.error('Suppression fichier impossible :', err.message)
  }
}

// Migration unique à chaque démarrage : importe EN BASE les fichiers encore
// présents sur le disque (ancienne version) pour qu'ils survivent au prochain
// redéploiement. Les URLs (/uploads/<nom>) restent identiques — une fois le
// fichier importé, GET /uploads/:nom le sert depuis PostgreSQL.
export async function importerFichiersLegacy() {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) return 0
    let importes = 0
    for (const nom of await fs.promises.readdir(UPLOAD_DIR)) {
      const chemin = path.join(UPLOAD_DIR, nom)
      const stat = await fs.promises.stat(chemin)
      if (!stat.isFile()) continue
      const dejaPresent = await Fichier.findOne({ where: { nom }, attributes: ['id'] })
      if (dejaPresent) continue
      const donnees = await fs.promises.readFile(chemin)
      const ext = path.extname(nom).toLowerCase()
      await Fichier.create({
        nom,
        typeMime: MIME_PAR_EXT[ext] || 'application/octet-stream',
        taille: donnees.length,
        donnees,
        source: 'legacy',
        egliseId: null,
      })
      importes += 1
    }
    return importes
  } catch (err) {
    console.error('Import des fichiers legacy impossible :', err.message)
    return 0
  }
}
