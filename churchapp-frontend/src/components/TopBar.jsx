import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Bell, Search, Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { api } from '../lib/api'

export default function TopBar({ title, subtitle }) {
  const { utilisateur } = useAuth()
  const { sombre, toggle } = useTheme()
  const navigate = useNavigate()
  const [recherche, setRecherche] = useState('')
  const [notifications, setNotifications] = useState({ count: 0, items: [] })
  const [notifOuvertes, setNotifOuvertes] = useState(false)
  const nom = utilisateur?.nom || 'Utilisateur'
  const role = utilisateur?.role === 'pasteur' ? 'Pasteur' : utilisateur?.role === 'administrateur' ? 'Administrateur' : ''

  useEffect(() => {
    api.listerNotifications().then(setNotifications).catch(() => {})
  }, [])

  function lancerRecherche(e) {
    e.preventDefault()
    if (recherche.trim()) navigate(`/recherche?q=${encodeURIComponent(recherche.trim())}`)
  }

  return (
    <div>
      {/* Barre utilitaire sticky : recherche, thème, notifications */}
      <div className="hidden md:flex items-center gap-3 px-6 md:px-10 pt-6 sticky top-0 z-30 bg-parchment-100/80 backdrop-blur-md">
        <form onSubmit={lancerRecherche} className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/40" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un membre, un courrier, une annonce..."
            className="w-full rounded-lg border border-ink-950/10 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          />
        </form>
        <div className="flex-1" />
        <button
          onClick={toggle}
          title={sombre ? 'Passer au mode clair' : 'Passer au mode sombre'}
          className="w-9 h-9 rounded-full bg-white border border-ink-950/10 flex items-center justify-center text-ink-800 hover:border-gold-500/60 transition-colors"
        >
          {sombre ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      <header className="flex items-center justify-between px-6 md:px-10 pt-4 md:pt-4 pb-6">
        <div>
          <h1 className="font-display text-3xl text-ink-950 tracking-tight">{title}</h1>
          {subtitle && <p className="text-ink-700/70 text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setNotifOuvertes((v) => !v)}
              className="relative w-9 h-9 rounded-full bg-white border border-ink-950/10 flex items-center justify-center text-ink-800 hover:border-gold-500/60 transition-colors"
            >
              <Bell size={16} />
              {notifications.count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-clay-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {notifications.count}
                </span>
              )}
            </button>
            {notifOuvertes && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-card border border-ink-950/5 overflow-hidden z-40">
                <p className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-700/50 font-mono border-b border-ink-950/5">
                  Notifications
                </p>
                {notifications.items.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-ink-700/50 text-center">Rien à signaler.</p>
                ) : (
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.items.map((n) => (
                      <Link
                        key={n.id}
                        to={n.lien}
                        onClick={() => setNotifOuvertes(false)}
                        className="block px-4 py-3 text-sm text-ink-800 hover:bg-parchment-50 border-b border-ink-950/5 last:border-0"
                      >
                        {n.texte}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-ink-950 text-gold-500 font-display text-sm flex items-center justify-center">
              {nom.trim().split(' ').slice(-1)[0]?.[0] || '?'}
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-semibold text-ink-950">{nom}</p>
              <p className="text-xs text-ink-700/60">{role}</p>
            </div>
          </div>
        </div>
      </header>
    </div>
  )
}
