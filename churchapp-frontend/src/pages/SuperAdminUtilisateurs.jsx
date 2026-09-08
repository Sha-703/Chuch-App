import { useEffect, useState } from 'react'
import { Loader2, KeyRound, Ban, CheckCircle2 } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import { superAdminApi } from '../lib/superAdminApi'

export default function SuperAdminUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState(null)
  const [erreur, setErreur] = useState('')
  const [resultat, setResultat] = useState(null) // { email, motDePasseProvisoire }

  function recharger() {
    superAdminApi.listerUtilisateurs().then(setUtilisateurs).catch((err) => setErreur(err.message))
  }

  useEffect(recharger, [])

  async function reinitialiser(u) {
    try {
      const data = await superAdminApi.reinitialiserMotDePasse(u.id)
      setResultat(data)
    } catch (err) {
      setErreur(err.message)
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
          <table className="w-full">
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
                      <button onClick={() => reinitialiser(u)} className="text-xs font-semibold text-gold-700 hover:underline inline-flex items-center gap-1">
                        <KeyRound size={12} /> Réinitialiser
                      </button>
                      <button onClick={() => toggleBlocage(u)} className="text-xs font-semibold text-clay-600 hover:underline inline-flex items-center gap-1">
                        <Ban size={12} /> {u.actif ? 'Bloquer' : 'Débloquer'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="h-4" />
      </div>

      {resultat && (
        <div className="fixed inset-0 bg-ink-950/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-card w-full max-w-sm p-6">
            <h3 className="font-display text-lg text-ink-950 mb-3">Mot de passe réinitialisé</h3>
            <div className="bg-parchment-100 rounded-lg p-4 text-sm space-y-1">
              <p><span className="text-ink-700/60">E-mail :</span> {resultat.email}</p>
              <p><span className="text-ink-700/60">Nouveau mot de passe provisoire :</span> <span className="font-mono">{resultat.motDePasseProvisoire}</span></p>
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
