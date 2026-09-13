import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutGrid, Church, Users2, Megaphone, ScrollText, LogOut, ShieldCheck, Network, Settings } from 'lucide-react'
import { useSuperAdminAuth } from '../context/SuperAdminAuthContext'
import ThemeToggle from './ThemeToggle'
import SuperAdminMobileNav from './SuperAdminMobileNav'

const links = [
  { to: '/super-admin/dashboard', label: 'Vue d\u2019ensemble', icon: LayoutGrid },
  { to: '/super-admin/eglises', label: 'Églises', icon: Church },
  { to: '/super-admin/communautes', label: 'Communautés', icon: Network },
  { to: '/super-admin/utilisateurs', label: 'Utilisateurs', icon: Users2 },
  { to: '/super-admin/annonces', label: 'Annonces', icon: Megaphone },
  { to: '/super-admin/journal', label: 'Journal d\u2019activité', icon: ScrollText },
  { to: '/super-admin/parametres', label: 'Paramètres', icon: Settings },
]

export default function SuperAdminLayout({ title, subtitle, children }) {
  const { superAdmin, logout } = useSuperAdminAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/super-admin')
  }

  return (
    <div className="flex min-h-screen bg-parchment-100">
      <SuperAdminMobileNav />
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-ink-950 text-parchment-100 h-screen sticky top-0">
        <div className="px-6 pt-6 pb-4 flex items-center gap-2">
          <ShieldCheck size={20} className="text-gold-500" />
          <span className="font-display text-xl tracking-tight text-gold-500">ChurchApp</span>
        </div>
        <p className="px-6 text-xs text-ink-600 -mt-3 mb-4">Espace Super Admin</p>

        <div className="px-4 pb-4">
          <div className="rounded-xl bg-ink-900 p-3.5 flex items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-parchment-50 truncate">{superAdmin?.nom}</p>
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
