import multer from 'multer'
import path from 'path'
import fs from 'fs'

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads'
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    cb(null, `${unique}${path.extname(file.originalname)}`)
  },
})

const typesAutorises = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

function filtreFichier(req, file, cb) {
  if (typesAutorises.includes(file.mimetype)) cb(null, true)
  else cb(new Error('Type de fichier non autorisé (image ou PDF uniquement).'))
}

export const upload = multer({
  storage,
  fileFilter: filtreFichier,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 Mo
})

export function urlFichier(req, filename) {
  return `${req.protocol}://${req.get('host')}/uploads/${filename}`
}
