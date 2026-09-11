const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Clés de stockage volontairement différentes de la session église —
// un pasteur connecté et un Super Admin connecté ne doivent jamais se mélanger
// dans le même navigateur (voir cahier des charges §3.4).
function getToken() {
  return localStorage.getItem('churchapp_superadmin_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${API_URL}/super-admin${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Une erreur est survenue.')
  return data
}

export const superAdminApi = {
  login: (email, motDePasse) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, motDePasse }) }),
  changerMotDePasse: (payload) => request('/mon-mot-de-passe', { method: 'PUT', body: JSON.stringify(payload) }),

  dashboard: () => request('/dashboard'),

  listerEglises: (recherche) => request(`/eglises${recherche ? `?recherche=${encodeURIComponent(recherche)}` : ''}`),
  creerEglise: (payload) => request('/eglises', { method: 'POST', body: JSON.stringify(payload) }),
  changerStatutEglise: (id, statut) => request(`/eglises/${id}/statut`, { method: 'PATCH', body: JSON.stringify({ statut }) }),
  rattacherEglise: (id, communauteId) => request(`/eglises/${id}/communaute`, { method: 'PATCH', body: JSON.stringify({ communauteId }) }),
  supprimerEglise: (id) => request(`/eglises/${id}`, { method: 'DELETE' }),

  listerCommunautes: () => request('/communautes'),
  creerCommunaute: (payload) => request('/communautes', { method: 'POST', body: JSON.stringify(payload) }),
  creerCompteCommunaute: (id, payload) => request(`/communautes/${id}/compte`, { method: 'POST', body: JSON.stringify(payload) }),

  listerUtilisateurs: () => request('/utilisateurs'),
  reinitialiserMotDePasse: (id) => request(`/utilisateurs/${id}/reinitialiser-mot-de-passe`, { method: 'POST' }),
  toggleBlocageUtilisateur: (id) => request(`/utilisateurs/${id}/toggle-blocage`, { method: 'PATCH' }),

  listerAnnonces: () => request('/annonces'),
  supprimerAnnonce: (id) => request(`/annonces/${id}`, { method: 'DELETE' }),

  listerJournal: () => request('/journal'),
}

export function saveSuperAdminSession({ token, superAdmin }) {
  localStorage.setItem('churchapp_superadmin_token', token)
  localStorage.setItem('churchapp_superadmin_profil', JSON.stringify(superAdmin))
}

export function getSuperAdminSession() {
  const profil = localStorage.getItem('churchapp_superadmin_profil')
  return { token: getToken(), superAdmin: profil ? JSON.parse(profil) : null }
}

export function clearSuperAdminSession() {
  localStorage.removeItem('churchapp_superadmin_token')
  localStorage.removeItem('churchapp_superadmin_profil')
}
