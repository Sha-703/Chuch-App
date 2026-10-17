import { createContext, useContext, useState } from 'react'
import { api, saveSession, getSession, clearSession } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getSession())
  const [doitChangerMotDePasse, setDoitChangerMotDePasse] = useState(false)

  async function login(email, motDePasse) {
    try {
      const data = await api.login(email, motDePasse)
      saveSession(data)
      setSession({ token: data.token, utilisateur: data.utilisateur, eglise: data.eglise, communaute: data.communaute })
      setDoitChangerMotDePasse(!!data.doitChangerMotDePasse)
      return { ok: true, data }
    } catch (err) {
      // Si le compte existe mais n'est pas encore vérifié (403 + doitVerifierEmail)
      if (err.message && err.message.includes('vérifier votre adresse e-mail')) {
        return { ok: false, doitVerifierEmail: true, email }
      }
      throw err
    }
  }

  function logout() {
    clearSession()
    setSession({ token: null, utilisateur: null, eglise: null, communaute: null })
    setDoitChangerMotDePasse(false)
  }

  return (
    <AuthContext.Provider
      value={{
        ...session,
        login,
        logout,
        isAuthenticated: !!session.token,
        doitChangerMotDePasse,
        majDoitChangerMotDePasse: setDoitChangerMotDePasse,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
