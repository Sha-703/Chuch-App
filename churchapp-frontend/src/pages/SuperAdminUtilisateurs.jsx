import { useEffect, useState } from 'react'
import { Loader2, KeyRound, Ban, CheckCircle2, Pencil, X } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import { superAdminApi } from '../lib/superAdminApi'

const ROLES = [
  { valeur: 'pasteur', label: 'Pasteur' },
  { valeur: 'administrateur', label: 'Administrateur' },
  { valeur: 'tresorier', label: 'Trésorier' },
  { valeur: 'ouvrier', label: 'Ouvrier' },
  { valeur: 'communaute', label: 'Communauté' },
]

export default function SuperAdminUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState(null)
  const [erreur, setErreur] = useState('')
  const [resultat, setResultat] = useState(null) // { email, motDePasseInitial }
  const [reinitialisant, setReinitialisant] = useState(null) // id utilisateur en cours
  const [utilisateurEnEdition, setUtilisateurEnEdition] = useState(null)

  function recharger() {
    superAdminApi.listerUtilisateurs().then(setUtilisateurs).catch((err) => setErreur(err.message))
  }

  useEffect(recharger, [])

  async function reinitialiser(u) {
    setReinitialisant(u.id)
    try {
      const data = await superAdminApi.reinitialiserMotDePasse(u.id)
      setResultat(data)
    } catch (err) {
      setErreur(err.message)
    } finally {
      setReinitialisant(null)
    }
  }

  async function toggleBlocage(u) {
    try {
      await superAdminApi.toggleBlocageUtilisateur(u.id)
      recharger()
    } catch (err) {
      setErreur(err.message)
    }
  }

  if (erreur) return <SuperAdminLayout title="Utilisateurs"><p className="text-clay-600">{erreur}</p></SuperAdminLayout>

  return (
    <SuperAdminLayout title="Utilisateurs" subtitle="Pasteurs, administrateurs et ouvriers de toutes les églises">
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {!utilisateurs ? (
          <div className="flex items-center gap-2 text-ink-700/60 px-6 py-10"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
        ) : (
          <div className="overflow-x-auto"><table className="w-full min-w-[600px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 font-mono">
                <th className="px-6 py-3 font-semibold">Nom</th>
                <th className="px-6 py-3 font-semibold">Église</th>
                <th className="px-6 py-3 font-semibold">Rôle</th>
                <th className="px-6 py-3 font-semibold">E-mail</th>
                <th className="px-6 py-3 font-semibold">Statut</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilisateurs.map((u) => (
                <tr key={u.id} className="border-t border-ink-950/5 hover:bg-parchment-50">
                  <td className="px-6 py-3.5 text-sm font-medium text-ink-950">{u.nom}</td>
                  <td className="px-6 py-3.5 text-sm text-ink-700/60">{u.Eglise?.nom || '—'}</td>
                  <td className="px-6 py-3.5 text-sm">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-gold-500/10 text-gold-700 text-xs font-semibold font-mono">{u.role}</span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-ink-800 font-tabular">{u.email}</td>
                  <td className="px-6 py-3.5 text-sm">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold font-mono ${u.actif ? 'text-leaf-700' : 'text-clay-600'}`}>
                      {u.actif ? <CheckCircle2 size={12} /> : <Ban size={12} />} {u.actif ? 'Actif' : 'Bloqué'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setUtilisateurEnEdition(u)}
                        className="text-xs font-semibold text-ink-800 hover:underline inline-flex items-center gap-1"
                      >
                        <Pencil size={12} /> Modifier
                      </button>
                      <button
                        onClick={() => reinitialiser(u)}
                        disabled={reinitialisant === u.id}
                        className="text-xs font-semibold text-gold-700 hover:underline inline-flex items-center gap-1 disabled:opacity-60"
                      >
                        {reinitialisant === u.id ? <Loader2 size={12} className="animate-spin" /> : <KeyRound size={12} />}
                        Réinitialiser
                      </button>
                      <button onClick={() => toggleBlocage(u)} className="text-xs font-semibold text-clay-600 hover:underline inline-flex items-center gap-1">
                        <Ban size={12} /> {u.actif ? 'Bloquer' : 'Débloquer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        )}
        <div className="h-4" />
      </div>

      {utilisateurEnEdition && (
        <ModalEditionUtilisateur
          utilisateur={utilisateurEnEdition}
          onClose={() => setUtilisateurEnEdition(null)}
          onSaved={() => { setUtilisateurEnEdition(null); recharger() }}
        />
      )}

      {resultat && (
        <div className="fixed inset-0 bg-ink-950/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-card w-full max-w-sm p-6 my-8">
            <h3 className="font-display text-lg text-ink-950 mb-3">Mot de passe réinitialisé</h3>
            <div className="bg-parchment-100 rounded-lg p-4 text-sm space-y-1">
              <p><span className="text-ink-700/60">E-mail :</span> {resultat.email}</p>
              <p><span className="text-ink-700/60">Mot de passe initial :</span> {resultat.motDePasseInitial}</p>
            </div>
            <button onClick={() => setResultat(null)} className="w-full mt-4 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900">
              Fermer
            </button>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  )
}

// Édition d'un compte : nom, e-mail et rôle
function ModalEditionUtilisateur({ utilisateur, onClose, onSaved }) {
  const [form, setForm] = useState({
    nom: utilisateur.nom || '',
    email: utilisateur.email || '',
    role: utilisateur.role || 'pasteur',
  })
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  const rolesDisponibles = form.role === utilisateur.role
    ? ROLES // on garde le rôle actuel même s'il est hors liste standard
    : ROLES.filter((r) => r.valeur !== 'communaute' || utilisateur.communauteId)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.nom.trim()) return setErreur('Le nom est requis.')
    setChargement(true)
    setErreur('')
    try {
      await superAdminApi.modifierUtilisateur(utilisateur.id, {
        nom: form.nom.trim(),
        email: form.email.trim(),
        role: form.role,
      })
      onSaved()
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink-950/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-sm p-6 my-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg text-ink-950">Modifier le compte</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Nom</label>
            <input
              required
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-ink-950/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">E-mail</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-ink-950/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Rôle</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-ink-950/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 bg-white"
            >
              {rolesDisponibles.map((r) => (
                <option key={r.valeur} value={r.valeur}>{r.label}</option>
              ))}
            </select>
            <p className="text-xs text-ink-700/50 mt-1.5">
              Le rôle détermine les pages accessibles après connexion.
            </p>
          </div>
          <p className="text-xs text-ink-700/50">
            Si l'e-mail change et que le compte n'a pas encore changé son mot de passe, le nouveau mot de passe initial devient le nouvel e-mail.
          </p>

          {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}

          <button
            type="submit"
            disabled={chargement}
            className="w-full flex items-center justify-center gap-2 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900 transition-colors disabled:opacity-60 mt-2"
          >
            {chargement ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}
