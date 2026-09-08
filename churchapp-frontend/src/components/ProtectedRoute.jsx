import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Où renvoyer chaque rôle s'il tente d'accéder à un espace qui n'est pas le sien.
const ACCUEIL_PAR_ROLE = {
  ouvrier: '/mon-espace',
  communaute: '/communaute/dashboard',
}
function accueilPour(role) {
  return ACCUEIL_PAR_ROLE[role] || '/dashboard'
}

// allow: liste des rôles autorisés sur cette route.
export default function ProtectedRoute({ children, allow }) {
  const { isAuthenticated, utilisateur } = useAuth()
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (allow && !allow.includes(utilisateur?.role)) {
    return <Navigate to={accueilPour(utilisateur?.role)} replace />
  }
  return children
}
