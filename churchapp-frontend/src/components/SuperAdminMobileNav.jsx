import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, Church, Users2, Megaphone, ScrollText, LogOut, Menu, X, ShieldCheck, Network, Settings } from 'lucide-react'
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext'

const links = [
  { to: '/super-admin/dashboard', label: 'Vue d\u2019ensemble', icon: LayoutGrid },
  { to: '/super-admin/eglises', label: 'Églises', icon: Church },
  { to: '/super-admin/communautes', label: 'Communautés', icon: Network },
  { to: '/super-admin/utilisateurs', label: 'Utilisateurs', icon: Users2 },
  { to: '/super-admin/annonces', label: 'Annonces', icon: Megaphone },
  { to: '/super-admin/journal', label: 'Journal d\u2019activité', icon: ScrollText },
  { to: '/super-admin/parametres', label: 'Paramètres', icon: Settings },
]

export default function SuperAdminMobileNav() {
  const [ouvert, setOuvert] = useState(false)
  const { superAdmin, logout } = useSuperAdminAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/super-admin')
  }

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 py-3.5 bg-ink-950 text-parchment-100 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-gold-500" />
          <span className="font-display text-lg tracking-tight text-gold-500">ChurchApp</span>
        </div>
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
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-gold-500" />
                <span className="font-display text-lg tracking-tight text-gold-500">ChurchApp</span>
              </div>
              <button onClick={() => setOuvert(false)} aria-label="Fermer le menu" className="p-1 text-parchment-100">
                <X size={20} />
              </button>
            </div>
            <p className="px-6 text-xs text-ink-600 -mt-2 mb-4">Espace Super Admin</p>
            <div className="woven-rule mx-5" />
            <div className="px-5 pb-4 pt-4">
              <div className="rounded-xl bg-ink-900 p-3.5 flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold text-parchment-50 truncate">{superAdmin?.nom}</p>
                <button onClick={handleLogout} title="Se déconnecter" className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-ink-600 hover:text-clay-500 hover:bg-ink-950">
                  <LogOut size={16} />
                </button>
              </div>
            </div>
            <div className="woven-rule mx-5" />
            <nav className="flex-1 px-3 mt-4 space-y-1">
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
          </div>
        </div>
      )}
    </div>
  )
}
