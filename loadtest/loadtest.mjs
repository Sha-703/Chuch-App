// Load test ChurchApp — style k6 (scénarios + seuils + métriques), en Node pur.
// Usage : node loadtest.mjs [baseUrl]
// Exemple : node loadtest.mjs http://localhost:4100/api

const BASE = (process.argv[2] || 'http://localhost:4100/api').replace(/\/$/, '')

// ---------- Métriques ----------
const metriques = new Map() // nom -> { requetes, erreurs, codes, durees[] }

function enregistrer(nom, code, dureeMs, erreur) {
  if (!metriques.has(nom)) metriques.set(nom, { requetes: 0, erreurs: 0, codes: {}, durees: [] })
  const m = metriques.get(nom)
  m.requetes++
  m.codes[code] = (m.codes[code] || 0) + 1
  m.durees.push(dureeMs)
  if (erreur) m.erreurs++
}

async function requete(nom, { methode = 'GET', chemin = '/', corps = null, token = null, attendu = null } = {}) {
  const depart = performance.now()
  let code = 0, erreur = false
  try {
    const res = await fetch(`${BASE}${chemin}`, {
      method: methode,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: corps ? JSON.stringify(corps) : undefined,
      signal: AbortSignal.timeout(15000),
    })
    code = res.status
    await res.arrayBuffer().catch(() => {})
    if (attendu && !attendu.includes(code)) erreur = true
    if (code >= 500) erreur = true
  } catch (e) {
    code = 'TIMEOUT/ERR'
    erreur = true
  }
  enregistrer(nom, code, performance.now() - depart, erreur)
}

function percentile(arr, p) {
  if (!arr.length) return 0
  const s = [...arr].sort((a, b) => a - b)
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))]
}

async function scenario(nom, { vus, dureesSecondes = [], fonctions }) {
  console.log(`\n=== Scénario : ${nom} ===`)
  // Montée en charge progressive : 10 → 50 → 100 utilisateurs virtuels
  const paliers = [10, 50, 100].slice(0, vus)
  for (const nbVU of paliers) {
    const duree = dureesSecondes[paliers.indexOf(nbVU)] ?? 3
    let arret = false
    const travailleurs = Array.from({ length: nbVU }, async (_, indice) => {
      // Chaque VU parcourt les fonctions du scénario en rotation.
      let k = indice
      while (!arret) {
        const f = fonctions[k % fonctions.length]
        k++
        await requete(f.nom, f.options)
      }
    })
    await new Promise((r) => setTimeout(r, duree * 1000))
    arret = true
    await Promise.all(travailleurs)
    const dernieres = fonctions.map((f) => {
      const m = metriques.get(f.nom)
      const fin = m.durees.slice(-Math.max(1, Math.floor(m.durees.length / 3))) // dernier tiers
      return `${f.nom}: p95=${percentile(fin, 95).toFixed(0)}ms`
    })
    console.log(`  ${nbVU} VU pendant ${duree}s — ${dernieres.join(' | ')}`)
  }
}

// ---------- Authentification ----------
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

// ---------- Scénarios ----------
async function main() {
  console.log(`Cible : ${BASE}`)

  // 0. Santé
  await scenario('Healthcheck', {
    vus: 1,
    fonctions: [{ nom: 'GET /health', options: { chemin: '/health', attendu: [200, 503] } }],
  })

  // 1. Préparation : connexion avec le compte fourni AVANT le dosage de login
  //    (l'authLimiter n'autorise que 10 tentatives / 15 min / IP : le scénario
  //    d'échec consommerait le quota et bloquerait ce login légitime).
  console.log('\n--- Préparation : connexion au compte de test ---')
  const { status, data } = await login('moisekelenda0@gmail.com', 'moisekelenda0@gmail.com')
  let token = data?.token
  if (!token) {
    const email = `loadtest-${Date.now()}@eglise.cd`
    const cre = await fetch(`${BASE}/auth/eglises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eglise: { nom: `Église LoadTest ${new Date().toISOString().slice(11, 19)}` },
        pasteur: { nom: 'Past. Test', email },
        administrateur: { nom: 'Admin Test', email: `admin-${Date.now()}@eglise.cd` },
      }),
      signal: AbortSignal.timeout(15000),
    }).catch(() => null)
    console.log(`  Création église : HTTP ${cre ? cre.status : 'ECHEC'}`)
    if (cre && cre.ok) {
      const l2 = await login(email, email)
      token = l2.data?.token
    }
  }
  console.log(`  Token : ${token ? 'obtenu' : 'ABSENT (scénarios authentifiés sautés)'}`)
  if (!token) { afficher(); return }

  // 2. Login sans authentification (mauvais identifiants) — doit rester stable + rate limit
  await scenario('Login échoué (dosage)', {
    vus: 1,
    fonctions: [{
      nom: 'POST /auth/login (échec)',
      options: { methode: 'POST', chemin: '/auth/login', corps: { email: 'inexistant@exemple.cd', motDePasse: 'faux' }, attendu: [400, 401, 429] },
    }],
  })

  // 3. Lecture — le vrai test de charge (dashboards, listes)
  await scenario('Lecture (chargement normal)', {
    vus: 1,
    fonctions: [
      { nom: 'GET /finances/entrees', options: { chemin: '/finances/entrees', token, attendu: [200] } },
      { nom: 'GET /cultes', options: { chemin: '/cultes', token, attendu: [200] } },
      { nom: 'GET /membres', options: { chemin: '/membres', token, attendu: [200] } },
    ],
  })

  // 4. Écriture concurrente (ajouts simultanés)
  await scenario('Écriture concurrente', {
    vus: 1,
    dureesSecondes: [3, 3, 3],
    fonctions: [
      { nom: 'POST /membres', options: { methode: 'POST', chemin: '/membres', token, corps: { nom: `Membre ${Math.random().toString(36).slice(2, 8)}`, role: 'Membre' }, attendu: [201] } },
      { nom: 'GET /membres', options: { chemin: '/membres', token, attendu: [200] } },
    ],
  })

  // 5. Champs invalides — les validations doivent répondre proprement, jamais 500
  await scenario('Validation (entrées invalides)', {
    vus: 1,
    dureesSecondes: [2, 2, 2],
    fonctions: [
      { nom: 'POST /finances/entrees négatif', options: { methode: 'POST', chemin: '/finances/entrees', token, corps: { type: 'Dîme', montant: -500, date: '2026-10-28' }, attendu: [400, 401] } },
      { nom: 'POST /membres sans nom', options: { methode: 'POST', chemin: '/membres', token, corps: { role: 'Membre' }, attendu: [400] } },
    ],
  })

  // 6. Nettoyage : supprime les membres de test créés par le scénario d'écriture
  //    pour ne pas laisser de données factices dans l'église du compte de test.
  try {
    const res = await fetch(`${BASE}/membres`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(15000),
    })
    const membres = await res.json()
    const test = membres.filter((m) =>
      /^Membre [a-z0-9]{6}$/.test(m.nom) &&
      (!m.createdAt || Date.now() - new Date(m.createdAt).getTime() < 15 * 60 * 1000)
    )
    for (const m of test) {
      await fetch(`${BASE}/membres/${m.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(15000),
      })
    }
    console.log(`\nNettoyage : ${test.length} membre(s) de test supprimé(s).`)
  } catch (e) {
    console.log(`\nNettoyage impossible : ${e.message}`)
  }

  afficher()
}

function afficher() {
  console.log('\n========== RÉSULTATS GLOBAUX ==========')
  console.log('Scénario'.padEnd(34) + 'Req.'.padStart(7) + 'Err.'.padStart(7) + 'p50'.padStart(8) + 'p95'.padStart(9) + 'max'.padStart(10) + '  Codes')
  let totalErreurs = 0
  for (const [nom, m] of metriques) {
    totalErreurs += m.erreurs
    const codes = Object.entries(m.codes).map(([c, n]) => `${c}×${n}`).join(' ')
    console.log(
      nom.padEnd(34) +
      String(m.requetes).padStart(7) +
      String(m.erreurs).padStart(7) +
      `${percentile(m.durees, 50).toFixed(0)}ms`.padStart(8) +
      `${percentile(m.durees, 95).toFixed(0)}ms`.padStart(9) +
      `${Math.max(...m.durees).toFixed(0)}ms`.padStart(10) +
      `  ${codes}`
    )
  }

  // Seuils façon k6
  console.log('\n--- Seuils (k6-style) ---')
  const verdicts = []
  for (const [nom, m] of metriques) {
    const tauxErreur = (m.erreurs / m.requetes) * 100
    const p95 = percentile(m.durees, 95)
    verdicts.push({
      nom,
      ok: tauxErreur < 1 && p95 < 1000,
      texte: tauxErreur < 1 && p95 < 1000
        ? `✓ ${nom} : ${tauxErreur.toFixed(2)}% erreurs, p95 ${p95.toFixed(0)}ms`
        : `✗ ${nom} : ${tauxErreur.toFixed(2)}% erreurs, p95 ${p95.toFixed(0)}ms`,
    })
  }
  for (const v of verdicts) console.log('  ' + v.texte)
  console.log(`\nTotal erreurs : ${totalErreurs}`)
}

main().catch((e) => { console.error('Échec du load test :', e); process.exit(1) })
