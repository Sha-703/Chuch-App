import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SuperAdminAuthProvider } from './context/SuperAdminAuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/ProtectedRoute'
import SuperAdminProtectedRoute from './components/SuperAdminProtectedRoute'
import Login from './pages/Login'
import CreateChurch from './pages/CreateChurch'
import Dashboard from './pages/Dashboard'
import Finances from './pages/Finances'
import Cultes from './pages/Cultes'
import RessourcesHumaines from './pages/RessourcesHumaines'
import Rapports from './pages/Rapports'
import Correspondance from './pages/Correspondance'
import Annonces from './pages/Annonces'
import Recherche from './pages/Recherche'
import MonEspace from './pages/MonEspace'
import Planning from './pages/Planning'
import Logistique from './pages/Logistique'
import CommunauteDashboard from './pages/CommunauteDashboard'
import CommunauteEglises from './pages/CommunauteEglises'
import CommunauteCotisations from './pages/CommunauteCotisations'
import CommunauteRecouvrement from './pages/CommunauteRecouvrement'
import SuperAdminLogin from './pages/SuperAdminLogin'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import SuperAdminEglises from './pages/SuperAdminEglises'
import SuperAdminUtilisateurs from './pages/SuperAdminUtilisateurs'
import SuperAdminAnnonces from './pages/SuperAdminAnnonces'
import SuperAdminJournal from './pages/SuperAdminJournal'
import SuperAdminCommunautes from './pages/SuperAdminCommunautes'
import NotFound from './pages/NotFound'

const ADMIN = ['pasteur', 'administrateur', 'tresorier']

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SuperAdminAuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/creer-eglise" element={<CreateChurch />} />
              <Route path="/mon-espace" element={<ProtectedRoute allow={['ouvrier']}><MonEspace /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute allow={ADMIN}><Dashboard /></ProtectedRoute>} />
              <Route path="/finances" element={<ProtectedRoute allow={ADMIN}><Finances /></ProtectedRoute>} />
              <Route path="/cultes" element={<ProtectedRoute allow={ADMIN}><Cultes /></ProtectedRoute>} />
              <Route path="/ressources-humaines" element={<ProtectedRoute allow={ADMIN}><RessourcesHumaines /></ProtectedRoute>} />
              <Route path="/planning" element={<ProtectedRoute allow={ADMIN}><Planning /></ProtectedRoute>} />
              <Route path="/logistique" element={<ProtectedRoute allow={ADMIN}><Logistique /></ProtectedRoute>} />
              <Route path="/rapports" element={<ProtectedRoute allow={ADMIN}><Rapports /></ProtectedRoute>} />
              <Route path="/correspondance" element={<ProtectedRoute allow={ADMIN}><Correspondance /></ProtectedRoute>} />
              <Route path="/annonces" element={<ProtectedRoute allow={ADMIN}><Annonces /></ProtectedRoute>} />
              <Route path="/recherche" element={<ProtectedRoute allow={ADMIN}><Recherche /></ProtectedRoute>} />

              {/* Espace Communauté — connexion via la page normale, comme une église */}
              <Route path="/communaute/dashboard" element={<ProtectedRoute allow={['communaute']}><CommunauteDashboard /></ProtectedRoute>} />
              <Route path="/communaute/eglises" element={<ProtectedRoute allow={['communaute']}><CommunauteEglises /></ProtectedRoute>} />
              <Route path="/communaute/cotisations" element={<ProtectedRoute allow={['communaute']}><CommunauteCotisations /></ProtectedRoute>} />
              <Route path="/communaute/recouvrement" element={<ProtectedRoute allow={['communaute']}><CommunauteRecouvrement /></ProtectedRoute>} />

              {/* Espace Super Admin — totalement séparé, jamais lié à une église */}
              <Route path="/super-admin" element={<SuperAdminLogin />} />
              <Route path="/super-admin/dashboard" element={<SuperAdminProtectedRoute><SuperAdminDashboard /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/eglises" element={<SuperAdminProtectedRoute><SuperAdminEglises /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/communautes" element={<SuperAdminProtectedRoute><SuperAdminCommunautes /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/utilisateurs" element={<SuperAdminProtectedRoute><SuperAdminUtilisateurs /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/annonces" element={<SuperAdminProtectedRoute><SuperAdminAnnonces /></SuperAdminProtectedRoute>} />
              <Route path="/super-admin/journal" element={<SuperAdminProtectedRoute><SuperAdminJournal /></SuperAdminProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ToastProvider>
        </SuperAdminAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
