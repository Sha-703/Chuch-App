import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      const { utilisateur } = await login(email, motDePasse)
      const accueil = utilisateur.role === 'ouvrier' ? '/mon-espace'
        : utilisateur.role === 'communaute' ? '/communaute/dashboard'
        : '/dashboard'
      navigate(accueil)
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-parchment-100">
      {/* Panneau gauche — identité, avec photo d'église en fond */}
      <div className="hidden md:flex flex-col justify-between text-parchment-100 p-12 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1714991850840-ef17f8795355?fm=jpg&q=80&w=1200&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/85 via-ink-950/75 to-ink-950/90" />
        <div className="absolute inset-0 bg-weave opacity-20 pointer-events-none" />
        <div className="relative">
          <span className="font-display text-3xl text-gold-500">ChurchApp</span>
          <p className="text-parchment-200/80 text-sm mt-1">Plateforme de transparence &amp; gestion d'église</p>
        </div>
        <div className="relative">
          <div className="woven-rule mb-8 w-24" />
          <p className="font-display text-2xl leading-snug max-w-sm text-parchment-50">
            Chaque offrande comptée. Chaque charge justifiée. Chaque culte suivi.
          </p>
          <p className="text-parchment-200/80 text-sm mt-4 max-w-sm">
            Un espace unique pour le pasteur et l'administrateur — les chiffres de l'église, clairs pour tous.
          </p>
        </div>
        <p className="relative text-xs text-parchment-200/60">© 2026 ChurchApp — Fait pour les églises de la RDC</p>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8 text-center">
            <span className="font-display text-2xl text-ink-950">ChurchApp</span>
          </div>
          <h1 className="font-display text-2xl text-ink-950">Connexion</h1>
          <p className="text-sm text-ink-700/70 mt-1 mb-8">Accédez à l'espace de votre église.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Adresse e-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pasteur@monteglise.cd"
                className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Mot de passe</label>
              <input
                type="password"
                required
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
              />
            </div>
            {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}
            <button
              type="submit"
              disabled={chargement}
              className="w-full flex items-center justify-center gap-2 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900 transition-colors disabled:opacity-60"
            >
              {chargement ? <Loader2 size={16} className="animate-spin" /> : <>Se connecter <ArrowRight size={16} /></>}
            </button>
          </form>

          <p className="text-xs text-ink-700/50 mt-4 text-center">
            Démo : pasteur@demo.cd — mot de passe demo1234
          </p>

          <p className="text-sm text-ink-700/70 mt-6 text-center">
            Votre église n'est pas encore inscrite ?{' '}
            <Link to="/creer-eglise" className="text-gold-600 font-semibold hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
