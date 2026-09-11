import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, KeyRound, ShieldCheck } from 'lucide-react'
import Layout from '../components/Layout'
import CommunauteLayout from '../components/CommunauteLayout'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Parametres() {
  const { utilisateur, eglise, communaute, doitChangerMotDePasse, majDoitChangerMotDePasse } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const obligatoire = doitChangerMotDePasse || searchParams.get('premiere') === '1'

  const [motDePasseActuel, setMotDePasseActuel] = useState('')
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (nouveauMotDePasse.length < 6) return setErreur('Le nouveau mot de passe doit contenir au moins 6 caractères.')
    if (nouveauMotDePasse !== confirmation) return setErreur('Les deux mots de passe ne correspondent pas.')

    setChargement(true)
    setErreur('')
    try {
      await api.changerMotDePasse({
        motDePasseActuel: obligatoire ? undefined : motDePasseActuel,
        nouveauMotDePasse,
      })
      majDoitChangerMotDePasse(false)
      showToast('Mot de passe mis à jour avec succès.')
      if (obligatoire) navigate('/dashboard')
      else {
        setMotDePasseActuel(''); setNouveauMotDePasse(''); setConfirmation('')
      }
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  const contenu = (
    <div className="max-w-lg">
      {obligatoire && (
        <div className="bg-gold-500/10 border border-gold-500/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <ShieldCheck size={18} className="text-gold-700 shrink-0 mt-0.5" />
          <p className="text-sm text-ink-800">
            Vous vous êtes connecté avec un code provisoire (OTP). Pour continuer, choisissez un mot de passe personnel.
          </p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/60 font-mono mb-3">Compte</p>
        <p className="text-sm text-ink-950 font-medium">{utilisateur?.nom}</p>
        <p className="text-sm text-ink-700/60">{utilisateur?.email}</p>
        <p className="text-xs text-ink-700/50 mt-1">{eglise?.nom || communaute?.nom}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound size={16} className="text-gold-600" />
          <h2 className="font-display text-lg text-ink-950">
            {obligatoire ? 'Choisir mon mot de passe' : 'Changer mon mot de passe'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!obligatoire && (
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
          )}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Nouveau mot de passe</label>
            <input
              type="password"
              required
              value={nouveauMotDePasse}
              onChange={(e) => setNouveauMotDePasse(e.target.value)}
              placeholder="6 caractères minimum"
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
  )

  if (utilisateur?.role === 'ouvrier') {
    return (
      <div className="min-h-screen bg-parchment-100 px-5 py-8">
        {contenu}
      </div>
    )
  }

  if (utilisateur?.role === 'communaute') {
    return (
      <CommunauteLayout title="Paramètres" subtitle="Gérer votre accès à ChurchApp">
        {contenu}
      </CommunauteLayout>
    )
  }

  return (
    <Layout title="Paramètres" subtitle="Gérer votre accès à ChurchApp">
      {contenu}
    </Layout>
  )
}
