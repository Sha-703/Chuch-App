import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, Landmark, CalendarDays, FileBarChart, Users2, LogOut, Menu, X, Mail, Megaphone, CalendarClock, Boxes, Settings } from 'lucide-react'
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

export default function MobileNav() {
  const [ouvert, setOuvert] = useState(false)
  const { eglise, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 py-3.5 bg-ink-950 text-parchment-100 sticky top-0 z-40">
        <span className="font-display text-xl text-gold-500">ChurchApp</span>
        <button
          onClick={() => setOuvert(true)}
          aria-label="Ouvrir le menu"
          className="p-1.5 -mr-1.5 text-parchment-100"
        >
          <Menu size={22} />
        </button>
      </div>

      {ouvert && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setOuvert(false)} />
          <div className="relative w-72 max-w-[85%] bg-ink-950 text-parchment-100 h-full flex flex-col">
            <div className="flex items-center justify-between px-5 pt-6 pb-4">
              <span className="font-display text-xl text-gold-500">ChurchApp</span>
              <button onClick={() => setOuvert(false)} aria-label="Fermer le menu" className="p-1 text-parchment-100">
                <X size={20} />
              </button>
            </div>
            <div className="woven-rule mx-5" />
            <nav className="flex-1 px-3 mt-5 space-y-1">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOuvert(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-ink-800 text-gold-400' : 'text-parchment-200/80 hover:bg-ink-900'
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={1.75} />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="px-4 pb-6 pt-4">
              <div className="rounded-xl bg-ink-900 p-3.5 mb-3">
                <p className="text-[13px] font-semibold text-parchment-50 leading-tight">{eglise?.nom || 'Mon église'}</p>
                <p className="text-xs text-ink-600 mt-0.5">{eglise?.ville || ''}</p>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-ink-600 hover:text-clay-500 px-1">
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
