// Sauvegarde COMPLÈTE d'une base PostgreSQL vers un fichier JSON local.
// Sert à extraire les données Railway avant suppression / migration Neon.
//
// Usage :
//   $env:SRC_URL='postgresql://...'; node scripts/sauvegarder.mjs [fichierSortie]
//
// Le fichier contient, pour chaque table : les lignes telles quelles.
// Les BLOB (bytea, photos/scans) sont sérialisés en hexadécimal (\x…).
import pg from 'pg'

const SRC = process.env.SRC_URL
if (!SRC) {
  console.error('Définir SRC_URL (postgresql://…) avant de lancer.')
  process.exit(1)
}

const sortie = process.argv[2] || `backup-railway-${new Date().toISOString().slice(0, 10)}.json`

// Sérialisation propre pour JSON : Buffer (bytea) → "\\x68656c6c…"
function versJSON(v) {
  if (v === null || v === undefined) return null
  if (Buffer.isBuffer(v)) return '\\x' + v.toString('hex')
  if (v instanceof Date) return v.toISOString()
  if (Array.isArray(v)) return v.map(versJSON)
  if (typeof v === 'object') {
    const o = {}
    for (const [k, val] of Object.entries(v)) o[k] = versJSON(val)
    return o
  }
  return v
}

async function main() {
  const client = new pg.Client({ connectionString: SRC, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 })
  await client.connect()
  console.log('Connecté à la base source.')

  const { rows: tables } = await client.query(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
  )
  console.log(`${tables.length} table(s) trouvée(s) : ${tables.map((t) => t.tablename).join(', ')}`)

  const backup = { date: new Date().toISOString(), source: SRC.replace(/:[^:@/]+@/, ':***@'), tables: {} }
  let total = 0

  for (const { tablename } of tables) {
    // Nom entre guillemets pour respecter la casse
    const res = await client.query(`SELECT * FROM "${tablename}"`)
    backup.tables[tablename] = res.rows.map(versJSON)
    total += res.rows.length
    console.log(`  ${tablename.padEnd(28)} ${res.rowCount} ligne(s)`)
  }

  await client.end()

  const fs = await import('node:fs')
  fs.writeFileSync(sortie, JSON.stringify(backup))
  const poids = (fs.statSync(sortie).size / 1024 / 1024).toFixed(2)
  console.log(`\nSauvegarde écrite : ${sortie} (${poids} Mo, ${total} ligne(s) au total)`)
}

main().catch((e) => { console.error('ÉCHEC :', e.message); process.exit(1) })
