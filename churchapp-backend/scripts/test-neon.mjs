// Test de connectivité rapide à la base cible (Neon).
// Usage : $env:DST_URL='postgresql://…'; node scripts/test-neon.mjs
import pg from 'pg'

const URL_ = process.env.DST_URL
if (!URL_) { console.error('Définir DST_URL.'); process.exit(1) }

const client = new pg.Client({
  connectionString: URL_,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
})
try {
  await client.connect()
  const r = await client.query('SELECT current_database() AS db')
  console.log('OK — base :', r.rows[0].db)
  const t = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
  )
  console.log('Tables :', t.rowCount ? t.rows.map((x) => x.tablename).join(', ') : '(vide — base neuve)')
  process.exit(0)
} catch (e) {
  console.error('ERREUR :', e.message)
  process.exit(1)
}
