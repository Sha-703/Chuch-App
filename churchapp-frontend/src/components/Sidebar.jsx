import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, Landmark, CalendarDays, FileBarChart, Users2, LogOut, Mail, Megaphone, Church, CalendarClock, Boxes, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/dashboard', label: 'Vue d\u2019ensemble', icon: LayoutGrid },
  { to: '/finances', label: 'Finances', icon: Landmark },
  { to: '/cultes', label: 'Cultes & présence', icon: CalendarDays },
  { to: '/ressources-humaines', label: 'Ressources Humaines', icon: Users2 },
  { to: '/planning', label: 'Planning', icon: CalendarClock },
  { to: '/logistique', label: 'Logistique', icon: Boxes },
  { to: '/parametres', label: 'Paramètres', icon: Settings },
  { to: '/correspondance', label: 'Correspondance', icon: Mail },
  { to: '/annonces', label: 'Annonces', icon: Megaphone },
  { to: '/rapports', label: 'Rapports', icon: FileBarChart },
]

export default function Sidebar() {
  const { eglise, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-ink-950 text-parchment-100 h-screen sticky top-0">
      <div className="px-6 pt-6 pb-4">
        <span className="inline-flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-gold-500 text-ink-950 flex items-center justify-center shrink-0">
            <Church size={15} strokeWidth={2} />
          </span>
          <span className="font-display text-2xl tracking-tight text-parchment-50">ChurchApp</span>
        </span>
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-xl bg-ink-900 p-3.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-parchment-50 leading-tight truncate">{eglise?.nom || 'Mon église'}</p>
            <p className="text-xs text-ink-600 mt-0.5 truncate">{eglise?.ville || ''}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Se déconnecter"
            aria-label="Se déconnecter"
            className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-ink-600 hover:text-clay-500 hover:bg-ink-950 transition-colors"
          >
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
                isActive
                  ? 'bg-ink-800 text-gold-400'
                  : 'text-parchment-200/80 hover:bg-ink-900 hover:text-parchment-50'
              }`
            }
          >
            <Icon size={18} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      <p className="px-6 pb-5 pt-4 text-xs text-ink-700">© 2026 ChurchApp</p>
    </aside>
  )
}
