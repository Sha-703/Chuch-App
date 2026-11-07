// Test de bout en bout — rôles ajoutés le 07/11/2026 :
//   1. Chef du département « Protocole » : peut saisir la présence physique
//   2. Chef d'un AUTRE département : refusé (403)
//   3. Logisticien : CRUD matériel OK, présence/cultes refusés (403)
//   4. Création du rôle via ENUM PostgreSQL (le point risqué de la migration)
// Chaque donnée créée est supprimée à la fin (nettoyage total).
//
// Usage : node test-roles.mjs <baseUrl> <emailAdminPasteur>
// (le mot de passe = l'e-mail, convention du système)

const BASE = (process.argv[2] || 'https://chuchapp-backend-production.up.railway.app/api').replace(/\/$/, '')
const EMAIL_ADMIN = process.argv[3] || 'patrickluvedo@gmail.com'
const ts = Date.now()
const EMAIL_CHEF_PROTO = `chef-proto-${ts}@exemple.com`
const EMAIL_CHEF_LOUANGE = `chef-louange-${ts}@exemple.com`
const EMAIL_LOG = `logisticien-${ts}@exemple.com`

let tokenAdmin = null
const aSupprimer = { membres: [], departements: [], materiel: [], culte: null }

async function appel(nom, { methode = 'GET', chemin = '/', corps = null, token = null, attendu = [] }) {
  try {
    const res = await fetch(`${BASE}${chemin}`, {
      method: methode,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: corps ? JSON.stringify(corps) : undefined,
      signal: AbortSignal.timeout(20000),
    })
    const data = await res.json().catch(() => ({}))
    const ok = attendu.includes(res.status)
    console.log(`  ${ok ? '✓' : '✗'} ${nom} → HTTP ${res.status}${ok ? '' : ` (attendu: ${attendu.join('/')}) — ${data.message || ''}`}`)
    return { status: res.status, data, ok }
  } catch (e) {
    console.log(`  ✗ ${nom} → ERREUR RÉSEAU : ${e.message}`)
    return { status: 0, data: {}, ok: false }
  }
}

async function login(email, mdp) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, motDePasse: mdp }),
    signal: AbortSignal.timeout(15000),
  })
  const data = await res.json().catch(() => ({}))
  return data?.token || null
}

async function main() {
  console.log(`Cible : ${BASE}\n`)

  // --- 0. Compte admin de test ---
  console.log(`--- 0. Connexion pasteur (${EMAIL_ADMIN}) ---`)
  tokenAdmin = await login(EMAIL_ADMIN, EMAIL_ADMIN)
  if (!tokenAdmin) { console.log('  ✗ login admin impossible'); process.exit(1) }
  console.log('  ✓ connecté')

  // Culte TEMPORAIRE dédié au test : les vrais cultes de l'église ne sont
  // jamais modifiés (supprimé au nettoyage).
  const culte = (await appel('POST /cultes (temporaire)', {
    methode: 'POST', chemin: '/cultes',
    corps: { type: 'Culte Test Auto', date: '2026-11-07', predicateur: 'test' },
    token: tokenAdmin, attendu: [201],
  })).data
  if (!culte?.id) { console.log('Impossible de créer le culte de test — abandon.'); process.exit(1) }
  aSupprimer.culte = culte.id
  const presentielInitial = culte.presentiel || 0

  // --- 1. Chemin admin : la saisie fonctionne toujours (valeur identique = sans mutation) ---
  console.log('\n--- 1. Pasteur : saisie présence (doit rester autorisée) ---')
  await appel('PUT presences-physiques (valeur inchangée)', {
    methode: 'PUT', chemin: `/cultes/${culte.id}/presences-physiques`,
    corps: { presentiel: presentielInitial }, token: tokenAdmin, attendu: [200],
  })

  // --- 2. Départements de test : Protocole + Louange ---
  console.log('\n--- 2. Création des départements de test ---')
  const proto = (await appel('POST /departements "Protocole Test"', {
    methode: 'POST', chemin: '/departements',
    corps: { nom: 'Protocole Test', description: 'test auto' }, token: tokenAdmin, attendu: [201],
  })).data
  aSupprimer.departements.push(proto.id)
  const louange = (await appel('POST /departements "Louange Test"', {
    methode: 'POST', chemin: '/departements',
    corps: { nom: 'Louange Test', description: 'test auto' }, token: tokenAdmin, attendu: [201],
  })).data
  aSupprimer.departements.push(louange.id)

  // --- 3. Création des 3 comptes (test ENUM pour logisticien + chefs) ---
  console.log('\n--- 3. Création des comptes de test ---')
  async function creerCompte(nom, email, roleCible, departementId) {
    const m = (await appel(`POST /membres "${nom}"`, {
      methode: 'POST', chemin: '/membres', corps: { nom }, token: tokenAdmin, attendu: [201],
    })).data
    aSupprimer.membres.push(m.id)
    await appel(`POST /membres/:id/compte (${roleCible})`, {
      methode: 'POST', chemin: `/membres/${m.id}/compte`,
      corps: { email, roleCible, ...(departementId ? { departementId } : {}) },
      token: tokenAdmin, attendu: [201],
    })
    return m.id
  }
  await creerCompte('Chef Protocole Test', EMAIL_CHEF_PROTO, 'chef_departement', proto.id)
  await creerCompte('Chef Louange Test', EMAIL_CHEF_LOUANGE, 'chef_departement', louange.id)
  await creerCompte('Logisticien Test', EMAIL_LOG, 'logisticien')

  // --- 4. Chef Protocole : son espace + la saisie de présence ---
  console.log('\n--- 4. Chef Protocole ---')
  const tokenProto = await login(EMAIL_CHEF_PROTO, EMAIL_CHEF_PROTO)
  if (!tokenProto) { console.log('  ✗ login chef protocole impossible'); process.exit(1) }
  console.log('  ✓ connecté')
  await appel('GET /departements/mon (son espace)', { chemin: '/departements/mon', token: tokenProto, attendu: [200] })
  await appel('PUT presences-physiques (AUTORISÉ)', {
    methode: 'PUT', chemin: `/cultes/${culte.id}/presences-physiques`,
    corps: { presentiel: presentielInitial }, token: tokenProto, attendu: [200],
  })
  await appel('POST /cultes (interdit)', { methode: 'POST', chemin: '/cultes', corps: { type: 'X', date: '2026-11-07' }, token: tokenProto, attendu: [403] })

  // --- 5. Chef Louange : présence REFUSÉE (403) ---
  console.log('\n--- 5. Chef Louange (autre département) ---')
  const tokenLouange = await login(EMAIL_CHEF_LOUANGE, EMAIL_CHEF_LOUANGE)
  if (!tokenLouange) { console.log('  ✗ login chef louange impossible'); process.exit(1) }
  console.log('  ✓ connecté')
  await appel('PUT presences-physiques (REFUSÉ 403)', {
    methode: 'PUT', chemin: `/cultes/${culte.id}/presences-physiques`,
    corps: { presentiel: presentielInitial }, token: tokenLouange, attendu: [403],
  })

  // --- 6. Logisticien : matériel OK, présence/cultes REFUSÉS ---
  console.log('\n--- 6. Logisticien ---')
  const tokenLog = await login(EMAIL_LOG, EMAIL_LOG)
  if (!tokenLog) { console.log('  ✗ login logisticien impossible (ENUM ?)'); process.exit(1) }
  console.log('  ✓ connecté (ENUM rôle logisticien OK)')
  await appel('GET /materiel (AUTORISÉ)', { chemin: '/materiel', token: tokenLog, attendu: [200] })
  const mat = (await appel('POST /materiel (AUTORISÉ)', {
    methode: 'POST', chemin: '/materiel',
    corps: { nom: `Temp test ${ts}`, quantite: 1 }, token: tokenLog, attendu: [201],
  })).data
  if (mat.id) {
    aSupprimer.materiel.push(mat.id)
    await appel('DELETE /materiel/:id', { methode: 'DELETE', chemin: `/materiel/${mat.id}`, token: tokenLog, attendu: [204] })
    aSupprimer.materiel.pop()
  }
  await appel('PUT presences-physiques (REFUSÉ 403)', {
    methode: 'PUT', chemin: `/cultes/${culte.id}/presences-physiques`,
    corps: { presentiel: presentielInitial }, token: tokenLog, attendu: [403],
  })
  await appel('POST /cultes (REFUSÉ 403)', { methode: 'POST', chemin: '/cultes', corps: { type: 'X', date: '2026-11-07' }, token: tokenLog, attendu: [403] })

  // --- 7. Nettoyage total ---
  console.log('\n--- 7. Nettoyage ---')
  for (const id of aSupprimer.membres) {
    await appel(`DELETE /membres/${id.slice(0, 8)}…`, { methode: 'DELETE', chemin: `/membres/${id}`, token: tokenAdmin, attendu: [204] })
  }
  for (const id of aSupprimer.departements) {
    await appel(`DELETE /departements/${id.slice(0, 8)}…`, { methode: 'DELETE', chemin: `/departements/${id}`, token: tokenAdmin, attendu: [204] })
  }
  if (aSupprimer.culte) {
    await appel('DELETE /cultes/:id (temporaire)', { methode: 'DELETE', chemin: `/cultes/${aSupprimer.culte}`, token: tokenAdmin, attendu: [204] })
  }

  // Vérification finale : plus rien de ce qui a été créé pour le test
  const restes = (await appel('GET /cultes (vérification)', { chemin: '/cultes', token: tokenAdmin, attendu: [200] })).data
  const culteReste = Array.isArray(restes) && restes.some((c) => c.id === aSupprimer.culte)
  console.log(`\nCulte de test supprimé : ${culteReste ? 'NON (✗)' : 'oui ✓'}`)
  console.log('Test terminé — données de test nettoyées.')
}

main().catch((e) => { console.error('Échec du test :', e); process.exit(1) })
