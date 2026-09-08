import { Link } from 'react-router-dom'
import { Church, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-parchment-100 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-12 h-12 rounded-xl bg-ink-950 text-gold-500 mx-auto flex items-center justify-center mb-5">
          <Church size={22} strokeWidth={1.75} />
        </div>
        <p className="font-display text-5xl text-ink-950 mb-2">404</p>
        <h1 className="font-display text-xl text-ink-950 mb-2">Page introuvable</h1>
        <p className="text-sm text-ink-700/70 mb-6">
          Cette page n'existe pas ou a été déplacée. Vérifie l'adresse ou retourne à l'accueil.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 bg-ink-950 text-parchment-50 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-ink-900 transition-colors"
        >
          <ArrowLeft size={16} /> Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}
