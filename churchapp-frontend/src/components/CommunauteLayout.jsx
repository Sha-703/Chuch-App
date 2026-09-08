import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, Church, Wallet, TrendingUp, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

const links = [
  { to: '/communaute/dashboard', label: 'Vue d\u2019ensemble', icon: LayoutGrid },
  { to: '/communaute/eglises', label: 'Nos églises', icon: Church },
  { to: '/communaute/cotisations', label: 'Cotisations', icon: Wallet },
  { to: '/communaute/recouvrement', label: 'Recouvrement', icon: TrendingUp },
]

export default function CommunauteLayout({ title, subtitle, children }) {
  const { communaute, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-parchment-100">
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-ink-950 text-parchment-100 h-screen sticky top-0">
        <div className="px-6 pt-6 pb-4">
          <span className="font-display text-2xl tracking-tight text-gold-500">ChurchApp</span>
        </div>
        <div className="px-4 pb-4">
          <div className="rounded-xl bg-ink-900 p-3.5 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-parchment-50 truncate">{communaute?.nom}</p>
              <p className="text-xs text-ink-600 mt-0.5">Espace Communauté</p>
            </div>
            <button onClick={handleLogout} title="Se déconnecter" className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-ink-600 hover:text-clay-500 hover:bg-ink-950">
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <div className="woven-rule mx-6" />
        <nav className="flex-1 px-3 mt-6 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-ink-800 text-gold-400' : 'text-parchment-200/80 hover:bg-ink-900 hover:text-parchment-50'
                }`
              }
            >
              <Icon size={18} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="px-6 md:px-10 pt-8 pb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-ink-950 tracking-tight">{title}</h1>
            {subtitle && <p className="text-ink-700/70 text-sm mt-1">{subtitle}</p>}
          </div>
          <ThemeToggle />
        </header>
        <main className="px-6 md:px-10 pb-16">{children}</main>
      </div>
    </div>
  )
}
