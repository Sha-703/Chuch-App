// Test de charge SOUTENU — ChurchApp
// Répond à la question : « combien d'utilisateurs simultanés le serveur tient-il ? »
// Monte en charge par paliers (5 → 10 → 20 VU) pendant 60 s au total, puis
// redescend, pour observer si la latence dégrade avec le nombre d'utilisateurs.
//
// Usage : node charge-soutenue.mjs [baseUrl]
// Exemple : node charge-soutenue.mjs https://chuchapp-backend-production.up.railway.app/api

const BASE = (process.argv[2] || 'http://localhost:4100/api').replace(/\/$/, '')
const DUREE_VU = 15 // secondes par palier
const PAUSE_ENTRE_REQUETES = 350 // ms — comportement réel (un admin ne hammer pas)

// Paliers : 5 = quelques admins, 10 = jour de semaine chargé, 20 = pic du dimanche
const PALIERS = [
  { vus: 5, nom: '5 VU  — quelques admins' },
  { vus: 10, nom: '10 VU — matinée chargée' },
  { vus: 20, nom: '20 VU — PIC dimanche 12h' },
  { vus: 10, nom: '10 VU — retour au calme' },
]

// ---------- Métriques : phase -> endpoint -> stats ----------
const metriques = new Map() // "phase|endpoint" -> { n, err, codes, durees[] }

function enregistrer(phase, nom, code, dureeMs, erreur) {
  const cle = `${phase}|${nom}`
  if (!metriques.has(cle)) metriques.set(cle, { n: 0, err: 0, codes: {}, durees: [] })
  const m = metriques.get(cle)
  m.n++
  m.codes[code] = (m.codes[code] || 0) + 1
  m.durees.push(dureeMs)
  if (erreur) m.err++
}

let global429 = 0 // compteur de 429 (rate-limit global) pour détection précoce

async function requete(phase, nom, { methode = 'GET', chemin = '/', corps = null, token = null, attendu = [] }) {
  const depart = performance.now()
  let code = 0, erreur = false
  try {
    const res = await fetch(`${BASE}${chemin}`, {
      method: methode,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: corps ? JSON.stringify(corps) : undefined,
      signal: AbortSignal.timeout(20000),
    })
    code = res.status
    if (code === 429) global429++
    await res.arrayBuffer().catch(() => {})
    if (attendu.length && !attendu.includes(code)) erreur = true
    if (code >= 500) erreur = true
  } catch {
    code = 'TIMEOUT/ERR'
    erreur = true
  }
  enregistrer(phase, nom, code, performance.now() - depart, erreur)
}

function percentile(arr, p) {
  if (!arr.length) return 0
  const s = [...arr].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]
}

// ---------- Login (avec attente si authLimiter actif : 10 / 15 min / IP) ----------
async function login(email, motDePasse) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, motDePasse }),
    signal: AbortSignal.timeout(10000),
  })
  const data = await res.json().catch(() => ({}))
  return { status: res.status, data }
}

async function obtenirToken() {
  const email = 'moisekelenda0@gmail.com'
  for (let tentative = 1; tentative <= 3; tentative++) {
    const { status, data } = await login(email, email)
    if (data?.token) return data.token
    if (status === 429 && tentative < 3) {
      console.log(`  Login bloqué par authLimiter (429) — attente de 100 s (fenêtre 15 min)…`)
      await new Promise((r) => setTimeout(r, 100000))
    }
  }
  return null
}

// ---------- Exécution ----------
async function main() {
  console.log(`Cible : ${BASE}`)
  console.log(`Test SOUTENU : ${PALIERS.length} paliers × ${DUREE_VU}s — pause ${PAUSE_ENTRE_REQUETES}ms entre requêtes (comportement réel)\n`)

  console.log('--- Préparation : connexion au compte de test ---')
  const token = await obtenirToken()
  console.log(`  Token : ${token ? 'obtenu' : 'ABSENT (abandon)'}`)
  if (!token) return

  let compteur = 0
  // Rotation réaliste : majoritairement des lectures (dashboards/listes),
  // une écriture de temps en temps (ajout de membre, supprimé au nettoyage).
  const actions = [
    { nom: 'GET /membres',        f: (t) => ({ chemin: '/membres', token: t, attendu: [200] }) },
    { nom: 'GET /cultes',         f: (t) => ({ chemin: '/cultes', token: t, attendu: [200] }) },
    { nom: 'GET /finances/entrees', f: (t) => ({ chemin: '/finances/entrees', token: t, attendu: [200] }) },
    { nom: 'GET /health',         f: () => ({ chemin: '/health', attendu: [200, 503] }) },
    { nom: 'GET /membres (bis)',  f: (t) => ({ chemin: '/membres', token: t, attendu: [200] }) },
    { nom: 'POST /membres',       f: (t) => ({
      methode: 'POST', chemin: '/membres', token: t, attendu: [201],
      corps: { nom: `Membre ${(Math.random().toString(36).slice(2) + 'xxxxxx').slice(0, 6)}`, role: 'Membre' },
    }) },
  ]

  for (let p = 0; p < PALIERS.length; p++) {
    const { vus, nom } = PALIERS[p]
    const phase = `P${p + 1} ${vus}VU`
    process.stdout.write(`\n=== ${nom} (${DUREE_VU}s) ===\n`)
    let arret = false
    const travailleurs = Array.from({ length: vus }, async () => {
      while (!arret) {
        const a = actions[compteur++ % actions.length]
        await requete(phase, a.nom, a.f(token))
        await new Promise((r) => setTimeout(r, PAUSE_ENTRE_REQUETES))
      }
    })
    await new Promise((r) => setTimeout(r, DUREE_VU * 1000))
    arret = true
    await Promise.all(travailleurs)

    // Bilan rapide du palier (toutes requêtes confondues)
    const durees = [...metriques.entries()].filter(([k]) => k.startsWith(phase)).flatMap(([, m]) => m.durees)
    console.log(`  → p50=${percentile(durees, 50).toFixed(0)}ms p95=${percentile(durees, 95).toFixed(0)}ms max=${Math.max(...durees).toFixed(0)}ms (${durees.length} req.)`)

    if (global429 > 100) {
      console.log('  ⚠ Rate-limit global (1000/15 min) atteint — arrêt anticipé.')
      break
    }
  }

  // ---------- Nettoyage : membres de test créés ----------
  try {
    const res = await fetch(`${BASE}/membres`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(20000),
    })
    const membres = await res.json()
    const test = membres.filter((m) =>
      /^Membre [a-z0-9]{6}$/.test(m.nom) &&
      (!m.createdAt || Date.now() - new Date(m.createdAt).getTime() < 20 * 60 * 1000)
    )
    // Par lots de 10 pour aller vite
    for (let i = 0; i < test.length; i += 10) {
      await Promise.all(test.slice(i, i + 10).map((m) =>
        fetch(`${BASE}/membres/${m.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(20000),
        })
      ))
    }
    console.log(`\nNettoyage : ${test.length} membre(s) de test supprimé(s).`)
  } catch (e) {
    console.log(`\nNettoyage impossible : ${e.message}`)
  }

  afficher()
}

function afficher() {
  console.log('\n================ RÉSULTATS PAR PALIER ================')
  const phases = [...new Set([...metriques.keys()].map((k) => k.split('|')[0]))]
  for (const phase of phases) {
    console.log(`\n--- ${phase} ---`)
    console.log('Endpoint'.padEnd(24) + 'Req.'.padStart(6) + 'Err.'.padStart(6) + 'p50'.padStart(9) + 'p95'.padStart(10) + 'max'.padStart(10) + '  Codes')
    for (const [cle, m] of metriques) {
      if (!cle.startsWith(phase)) continue
      const nom = cle.split('|')[1]
      const codes = Object.entries(m.codes).map(([c, n]) => `${c}×${n}`).join(' ')
      console.log(
        nom.padEnd(24) +
        String(m.n).padStart(6) +
        String(m.err).padStart(6) +
        `${percentile(m.durees, 50).toFixed(0)}ms`.padStart(9) +
        `${percentile(m.durees, 95).toFixed(0)}ms`.padStart(10) +
        `${Math.max(...m.durees).toFixed(0)}ms`.padStart(10) +
        `  ${codes}`
      )
    }
  }

  const toutes = [...metriques.values()]
  const totalReq = toutes.reduce((s, m) => s + m.n, 0)
  const totalErr = toutes.reduce((s, m) => s + m.err, 0)
  console.log(`\nTotal : ${totalReq} requêtes, ${totalErr} erreur(s), ${global429}×429 (rate-limit).`)
}

main().catch((e) => { console.error('Échec du test soutenu :', e); process.exit(1) })
