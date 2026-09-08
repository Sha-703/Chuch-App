import { createContext, useContext, useState } from 'react'
import { superAdminApi, saveSuperAdminSession, getSuperAdminSession, clearSuperAdminSession } from '../lib/superAdminApi'

const SuperAdminAuthContext = createContext(null)

export function SuperAdminAuthProvider({ children }) {
  const [session, setSession] = useState(getSuperAdminSession())

  async function login(email, motDePasse) {
    const data = await superAdminApi.login(email, motDePasse)
    saveSuperAdminSession(data)
    setSession({ token: data.token, superAdmin: data.superAdmin })
    return data
  }

  function logout() {
    clearSuperAdminSession()
    setSession({ token: null, superAdmin: null })
  }

  return (
    <SuperAdminAuthContext.Provider value={{ ...session, login, logout, isAuthenticated: !!session.token }}>
      {children}
    </SuperAdminAuthContext.Provider>
  )
}

export function useSuperAdminAuth() {
  return useContext(SuperAdminAuthContext)
}
