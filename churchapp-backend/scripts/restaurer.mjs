// Restaure un backup JSON (produit par scripts/sauvegarder.mjs) dans une
// base PostgreSQL cible (Neon, etc.).
//
// Usage :
//   $env:DST_URL='postgresql://…neon…'; node scripts/restaurer.mjs backup-railway-….json
//
// Étapes :
//   1. crée le schéma dans la base cible (sequelize.sync — les modèles de l'app)
//   2. copie chaque table dans l'ordre des clés étrangères (tri topologique)
//   3. idempotent : re-jouable (ON CONFLICT DO NOTHING)
import pg from 'pg'
import fs from 'node:fs'

const DST = process.env.DST_URL
const fichier = process.argv[2]
if (!DST) { console.error('Définir DST_URL (postgresql://…) avant de lancer.'); process.exit(1) }
if (!fichier || !fs.existsSync(fichier)) { console.error(`Fichier backup introuvable : ${fichier || '(argument manquant)'}`); process.exit(1) }

const backup = JSON.parse(fs.readFileSync(fichier, 'utf8'))
console.log(`Backup du ${backup.date} — ${Object.keys(backup.tables).length} table(s)`)

// --- 1. Schéma : les modèles de l'app créent les tables dans DST_URL ---
process.env.DATABASE_URL = DST
const { sequelize } = await import('../src/models/index.js')
await sequelize.sync() // crée les tables manquantes (base neuve)
console.log('Schéma créé/vérifié dans la base cible.')
await sequelize.close()

// --- 2. Outils de copie ---
const client = new pg.Client({ connectionString: DST, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 })
await client.connect()

// Types de colonnes (pour bytea / jsonb)
const { rows: colonnesType } = await client.query(
  `SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public'`
)
const typeColonne = new Map() // "table.colonne" -> data_type
for (const c of colonnesType) typeColonne.set(`${c.table_name}.${c.column_name}`, c.data_type)

// Graphe des clés étrangères → ordre d'insertion (parents d'abord)
const { rows: fks } = await client.query(
  `SELECT tc.table_name AS "table", ccu.table_name AS "ref"
   FROM information_schema.table_constraints tc
   JOIN information_schema.constraint_column_usage ccu
     ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = 'public'
   WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'`
)
const dependances = new Map() // table -> Set(tables dont elle dépend)
for (const f of fks) {
  if (f.table === f.ref) continue // auto-référence : ignorée
  if (!dependances.has(f.table)) dependances.set(f.table, new Set())
  dependances.get(f.table).add(f.ref)
}

const tables = Object.keys(backup.tables)
// Tri topologique de Kahn
const ordre = []
const restantes = new Set(tables)
let progres = true
while (restantes.size && progres) {
  progres = false
  for (const t of [...restantes]) {
    const deps = dependances.get(t) || new Set()
    const prets = [...deps].every((d) => !restantes.has(d) || !tables.includes(d))
    if (prets) { ordre.push(t); restantes.delete(t); progres = true }
  }
}
// Ce qui reste (cycle inattendu) → à la fin, avec ON CONFLICT pour ne pas échouer
for (const t of restantes) ordre.push(t)

// Convertit une valeur du backup en valeur pg pour le type de colonne
function convertir(table, colonne, v) {
  if (v === null || v === undefined) return null
  const type = typeColonne.get(`${table}.${colonne}`)
  if (type === 'bytea') {
    if (typeof v === 'string' && v.startsWith('\\x')) return Buffer.from(v.slice(2), 'hex')
    return v
  }
  if ((type === 'json' || type === 'jsonb') && typeof v === 'object') return JSON.stringify(v)
  return v
}

// --- 3. Copie table par table ---
let total = 0
for (const table of ordre) {
  const lignes = backup.tables[table]
  const existe = typeColonne.has(`${table}.*`) || colonnesType.some((c) => c.table_name === table)
  if (!existe) {
    console.log(`  ⚠ ${table} : absente du schéma cible — ignorée`)
    continue
  }
  // Colonnes réellement présentes dans la table cible (le schéma peut avoir évolué)
  const colonnes = colonnesType.filter((c) => c.table_name === table).map((c) => c.column_name)

  await client.query('BEGIN')
  let inseres = 0
  try {
    for (const ligne of lignes) {
      const cols = Object.keys(ligne).filter((c) => colonnes.includes(c))
      if (cols.length === 0) continue
      const sql = `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(', ')})
                   VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')})
                   ON CONFLICT DO NOTHING`
      const valeurs = cols.map((c) => convertir(table, c, ligne[c]))
      const r = await client.query(sql, valeurs)
      inseres += r.rowCount
    }
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    console.error(`  ✗ ${table} : ERREUR — ${e.message}`)
    await client.end()
    process.exit(1)
  }
  total += inseres
  console.log(`  ${table.padEnd(28)} ${inseres}/${lignes.length} ligne(s)`)
}

await client.end()
console.log(`\nRestauration terminée : ${total} ligne(s) insérée(s).`)
