const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const API_URL = import.meta.env.VITE_API_URL || (isDev ? 'http://localhost:4000/api' : 'https://chuchapp-backend-production.up.railway.app/api')

function getToken() {
  return localStorage.getItem('churchapp_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const estFormData = options.body instanceof FormData
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(estFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || 'Une erreur est survenue.')
  }
  return data
}

export const api = {
  login: (email, motDePasse) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, motDePasse }) }),
  changerMotDePasse: (payload) => request('/auth/mon-mot-de-passe', { method: 'PUT', body: JSON.stringify(payload) }),

  creerEglise: (payload) =>
    request('/auth/eglises', { method: 'POST', body: JSON.stringify(payload) }),

  demanderReset: (payload) =>
    request('/auth/demander-reset', { method: 'POST', body: JSON.stringify(payload) }),

  bilanMensuel: () => request('/finances/bilan-mensuel'),
  telechargerBilanPdf: async (mois) => {
    const token = getToken()
    const res = await fetch(`${API_URL}/finances/bilan-mensuel/pdf?mois=${mois}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || 'Impossible de générer le PDF.')
    }
    return res.blob()
  },
  telechargerRapportAnnuelPdf: async (annee) => {
    const token = getToken()
    const res = await fetch(`${API_URL}/rapports/annuel/pdf?annee=${annee}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message || 'Impossible de générer le rapport annuel.')
    }
    return res.blob()
  },
  listerEntrees: () => request('/finances/entrees'),
  creerEntree: (payload) => request('/finances/entrees', { method: 'POST', body: JSON.stringify(payload) }),
  listerCharges: () => request('/finances/charges'),
  creerCharge: (payload) => request('/finances/charges', { method: 'POST', body: JSON.stringify(payload) }),

  listerCultes: () => request('/cultes'),
  creerCulte: (payload) => request('/cultes', { method: 'POST', body: JSON.stringify(payload) }),

  listerMembres: () => request('/membres'),
  creerMembre: (payload) => request('/membres', { method: 'POST', body: JSON.stringify(payload) }),
  creerCompteOuvrier: (membreId, email) =>
    request(`/membres/${membreId}/compte`, { method: 'POST', body: JSON.stringify({ email }) }),

  listerDepartements: () => request('/departements'),
  creerDepartement: (payload) => request('/departements', { method: 'POST', body: JSON.stringify(payload) }),
  modifierDepartement: (id, payload) => request(`/departements/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  supprimerDepartement: (id) => request(`/departements/${id}`, { method: 'DELETE' }),

  presencesDuCulte: (culteId, departementId) =>
    request(`/cultes/${culteId}/presences${departementId ? `?departementId=${departementId}` : ''}`),

  mesCultes: () => request('/mon-espace/cultes'),
  signerPresence: (culteId, payload) =>
    request(`/mon-espace/cultes/${culteId}/presence`, { method: 'POST', body: JSON.stringify(payload) }),

  listerEvenements: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/evenements${qs ? `?${qs}` : ''}`)
  },
  creerEvenement: (payload) => request('/evenements', { method: 'POST', body: JSON.stringify(payload) }),
  supprimerEvenement: (id) => request(`/evenements/${id}`, { method: 'DELETE' }),
  prochainsEvenements: () => request('/evenements/prochains'),
  rappelsActifs: () => request('/evenements/rappels'),

  listerEglises: () => request('/eglises'),

  listerCorrespondances: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return request(`/correspondances${qs ? `?${qs}` : ''}`)
  },
  creerCorrespondancePhysique: (formData) => request('/correspondances/physique', { method: 'POST', body: formData }),
  creerCorrespondanceNumerique: (formData) => request('/correspondances/numerique', { method: 'POST', body: formData }),
  changerEtatCorrespondance: (id, etat) =>
    request(`/correspondances/${id}/etat`, { method: 'PATCH', body: JSON.stringify({ etat }) }),
  envoyerAccuse: (id) => request(`/correspondances/${id}/accuse`, { method: 'POST' }),

  listerAnnonces: () => request('/annonces'),
  creerAnnonce: (formData) => request('/annonces', { method: 'POST', body: formData }),

  listerMateriel: () => request('/materiel'),
  creerMateriel: (payload) => request('/materiel', { method: 'POST', body: JSON.stringify(payload) }),
  modifierMateriel: (id, payload) => request(`/materiel/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  supprimerMateriel: (id) => request(`/materiel/${id}`, { method: 'DELETE' }),

  listerNotifications: () => request('/notifications'),

  // --- Espace Communauté ---
  communauteDashboard: () => request('/communaute/dashboard'),
  communauteListerEglises: () => request('/communaute/eglises'),
  communauteFinancesEglise: (id) => request(`/communaute/eglises/${id}/finances`),
  communauteListerCotisations: () => request('/communaute/cotisations'),
  communauteDefinirCotisation: (payload) => request('/communaute/cotisations', { method: 'POST', body: JSON.stringify(payload) }),
  communauteGenererEcheances: (egliseId) => request(`/communaute/cotisations/${egliseId}/generer-echeances`, { method: 'POST' }),
  communauteListerEcheances: (egliseId) => request(`/communaute/echeances${egliseId ? `?egliseId=${egliseId}` : ''}`),
  communauteEnregistrerVersement: (payload) => request('/communaute/versements', { method: 'POST', body: JSON.stringify(payload) }),
  communauteRecouvrement: () => request('/communaute/recouvrement'),

  // --- Endpoint PUBLIC pour les communautés (création d'église) ---
  listerCommunautes: () => request('/communautes'),
}

export function saveSession({ token, utilisateur, eglise, communaute }) {
  localStorage.setItem('churchapp_token', token)
  localStorage.setItem('churchapp_utilisateur', JSON.stringify(utilisateur))
  localStorage.setItem('churchapp_eglise', JSON.stringify(eglise || null))
  localStorage.setItem('churchapp_communaute', JSON.stringify(communaute || null))
}

export function getSession() {
  const utilisateur = localStorage.getItem('churchapp_utilisateur')
  const eglise = localStorage.getItem('churchapp_eglise')
  const communaute = localStorage.getItem('churchapp_communaute')
  return {
    token: getToken(),
    utilisateur: utilisateur ? JSON.parse(utilisateur) : null,
    eglise: eglise ? JSON.parse(eglise) : null,
    communaute: communaute ? JSON.parse(communaute) : null,
  }
}

export function clearSession() {
  localStorage.removeItem('churchapp_token')
  localStorage.removeItem('churchapp_utilisateur')
  localStorage.removeItem('churchapp_eglise')
  localStorage.removeItem('churchapp_communaute')
}
