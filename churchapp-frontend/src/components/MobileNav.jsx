import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { liensPourRole } from '../lib/navLinks'

export default function MobileNav() {
  const [ouvert, setOuvert] = useState(false)
  const { eglise, logout, utilisateur } = useAuth()
  const navigate = useNavigate()
  // Navbar mobile filtrée selon le rôle (même règle que la Sidebar).
  const links = liensPourRole(utilisateur?.role)

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 py-3.5 bg-ink-950 text-parchment-100 sticky top-0 z-40">
        <img src="/chuchapp.jpeg" alt="ChurchApp" className="h-8 w-auto object-contain" />
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
            {/* En-tête : logo + fermeture */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4">
              <img src="/chuchapp.jpeg" alt="ChurchApp" className="h-8 w-auto object-contain" />
              <button onClick={() => setOuvert(false)} aria-label="Fermer le menu" className="p-1 text-parchment-100">
                <X size={20} />
              </button>
            </div>

            {/* Déconnexion en HAUT du menu (et non plus en bas) */}
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
                  className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 px-2 py-1.5 rounded-lg transition-colors"
                >
                  <LogOut size={14} /> Déconnexion
                </button>
              </div>
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
            <p className="px-6 pb-5 pt-4 text-xs text-ink-700">© 2026 ChurchApp</p>
          </div>
        </div>
      )}
    </div>
  )
}
