import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../lib/api'
import { Mail, ArrowRight, CheckCircle2, Loader2, RefreshCw } from 'lucide-react'

export default function VerifierEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email') || ''
  const [statut, setStatut] = useState(token ? 'verifiant' : 'attente')
  const [message, setMessage] = useState('')
  const [chargement, setChargement] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatut('erreur')
      setMessage('Aucun token de vérification dans le lien.')
      return
    }
    verifier()
  }, [token])

  async function verifier() {
    setChargement(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://chuchapp-backend-production.up.railway.app/api'}/auth/verifier-email?token=${token}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Token invalide ou expiré.')
      setStatut('succes')
      setMessage(data.message || 'Adresse e-mail vérifiée avec succès.')
    } catch (err) {
      setStatut('erreur')
      setMessage(err.message)
    } finally {
      setChargement(false)
    }
  }

  async function renvoyerVerification() {
    if (!email) {
      setMessage('E-mail inconnu. Veuillez utiliser le lien reçu par courrier.')
      return
    }
    setChargement(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'https://chuchapp-backend-production.up.railway.app/api'}/auth/demander-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Échec du renvoi.')
      setMessage(data.message || 'Un e-mail de vérification a été renvoyé. Consultez votre boîte de réception.')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setChargement(false)
    }
  }

  const icones = {
    succes: <CheckCircle2 className="w-12 h-12 text-leaf-600" />,
    erreur: <Mail className="w-12 h-12 text-clay-600" />,
    verifiant: <Loader2 className="w-12 h-12 text-gold-600 animate-spin" />,
  }

  const titres = {
    succes: 'E-mail vérifié ✅',
    erreur: 'Erreur de vérification ❌',
    verifiant: 'Vérification en cours…',
  }

  const couleurs = {
    succes: 'bg-leaf-500/10 text-leaf-700 border-leaf-200',
    erreur: 'bg-clay-500/10 text-clay-700 border-clay-200',
    verifiant: 'bg-gold-500/10 text-gold-700 border-gold-200',
  }

  return (
    <div className="min-h-screen bg-parchment-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8 text-center">
        <div className={`mx-auto mb-6 p-3 rounded-full ${couleurs[statut]}`}>
          {icones[statut]}
        </div>
        <h1 className="font-display text-xl text-ink-950 mb-2">{titres[statut]}</h1>
        <p className="text-sm text-ink-700/70 mb-6">{message}</p>

        {statut === 'succes' && (
          <div className="space-y-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-ink-950 text-parchment-50 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-ink-900 transition-colors w-full justify-center"
            >
              Se connecter <ArrowRight size={16} />
            </Link>
            {email && (
              <button
                onClick={renvoyerVerification}
                disabled={chargement}
                className="text-xs text-ink-700/60 hover:text-ink-950 underline underline-offset-4"
              >
                {chargement ? 'Envoi…' : `Renvoyer l'e-mail à ${email}`}
              </button>
            )}
          </div>
        )}

        {statut === 'erreur' && email && (
          <div className="space-y-3">
            <button
              onClick={renvoyerVerification}
              disabled={chargement}
              className="inline-flex items-center gap-2 bg-ink-950 text-parchment-50 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-ink-900 transition-colors w-full justify-center">
              <RefreshCw size={16} /> Renvoyer l'e-mail de vérification
            </button>
            <Link to="/" className="text-xs text-ink-700/60 hover:text-ink-950 underline underline-offset-4 mt-2">
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
