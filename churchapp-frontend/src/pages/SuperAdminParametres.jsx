import { useState } from 'react'
import { Loader2, KeyRound } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import { superAdminApi } from '../lib/superAdminApi'
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext'

export default function SuperAdminParametres() {
  const { superAdmin } = useSuperAdminAuth()
  const [motDePasseActuel, setMotDePasseActuel] = useState('')
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (nouveauMotDePasse.length < 6) return setErreur('Le nouveau mot de passe doit contenir au moins 6 caractères.')
    if (nouveauMotDePasse !== confirmation) return setErreur('Les deux mots de passe ne correspondent pas.')

    setChargement(true)
    setErreur('')
    setSucces(false)
    try {
      await superAdminApi.changerMotDePasse({ motDePasseActuel, nouveauMotDePasse })
      setSucces(true)
      setMotDePasseActuel(''); setNouveauMotDePasse(''); setConfirmation('')
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <SuperAdminLayout title="Paramètres" subtitle="Gérer votre accès Super Admin">
      <div className="max-w-lg">
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/60 font-mono mb-3">Compte</p>
          <p className="text-sm text-ink-950 font-medium">{superAdmin?.nom}</p>
          <p className="text-sm text-ink-700/60">{superAdmin?.email}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <KeyRound size={16} className="text-gold-600" />
            <h2 className="font-display text-lg text-ink-950">Changer mon mot de passe</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Mot de passe actuel</label>
              <input
                type="password"
                required
                value={motDePasseActuel}
                onChange={(e) => setMotDePasseActuel(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Nouveau mot de passe</label>
              <input
                type="password"
                required
                value={nouveauMotDePasse}
                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Confirmer le nouveau mot de passe</label>
              <input
                type="password"
                required
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
              />
            </div>
            {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}
            {succes && <p className="text-sm text-leaf-700 bg-leaf-500/10 rounded-lg px-3 py-2">Mot de passe mis à jour avec succès.</p>}
            <button
              type="submit"
              disabled={chargement}
              className="w-full flex items-center justify-center gap-2 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900 transition-colors disabled:opacity-60"
            >
              {chargement ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer'}
            </button>
          </form>
        </div>
      </div>
    </SuperAdminLayout>
  )
}
