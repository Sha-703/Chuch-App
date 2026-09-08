import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [sombre, setSombre] = useState(() => localStorage.getItem('churchapp_theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', sombre)
    localStorage.setItem('churchapp_theme', sombre ? 'dark' : 'light')
  }, [sombre])

  return (
    <ThemeContext.Provider value={{ sombre, toggle: () => setSombre((s) => !s) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
