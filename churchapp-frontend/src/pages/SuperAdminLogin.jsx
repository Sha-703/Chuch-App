import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext'

export default function SuperAdminLogin() {
  const navigate = useNavigate()
  const { login } = useSuperAdminAuth()
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [erreur, setErreur] = useState('')
  const [chargement, setChargement] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    setChargement(true)
    try {
      await login(email, motDePasse)
      navigate('/super-admin/dashboard')
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-parchment-100">
      <div className="hidden md:flex flex-col justify-between text-parchment-100 p-12 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1714991850840-ef17f8795355?fm=jpg&q=80&w=1200&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/90 via-ink-950/85 to-ink-950/95" />
        <div className="relative flex items-center gap-2">
          <ShieldCheck className="text-gold-500" size={22} />
          <span className="font-display text-3xl text-gold-500">ChurchApp</span>
        </div>
        <div className="relative">
          <div className="woven-rule mb-8 w-24" />
          <p className="font-display text-2xl leading-snug max-w-sm text-parchment-50">
            Espace Super Administrateur
          </p>
          <p className="text-parchment-200/80 text-sm mt-4 max-w-sm">
            Accès réservé à l'équipe ChurchApp pour piloter l'ensemble des églises du système.
            Ce n'est pas l'espace d'une église.
          </p>
        </div>
        <p className="relative text-xs text-parchment-200/60">© 2026 ChurchApp</p>
      </div>

      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="md:hidden mb-8 text-center flex items-center justify-center gap-2">
            <ShieldCheck className="text-ink-950" size={20} />
            <span className="font-display text-2xl text-ink-950">ChurchApp</span>
          </div>
          <h1 className="font-display text-2xl text-ink-950">Connexion Super Admin</h1>
          <p className="text-sm text-ink-700/70 mt-1 mb-8">Espace réservé — pas pour les églises.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Adresse e-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="superadmin@churchapp.cd"
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
            Démo : superadmin@churchapp.cd — mot de passe demo1234
          </p>
        </div>
      </div>
    </div>
  )
}
