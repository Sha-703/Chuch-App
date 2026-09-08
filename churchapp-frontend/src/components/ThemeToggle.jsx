import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { sombre, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      title={sombre ? 'Passer au mode clair' : 'Passer au mode sombre'}
      className="w-9 h-9 rounded-full bg-white border border-ink-950/10 flex items-center justify-center text-ink-800 hover:border-gold-500/60 transition-colors shrink-0"
    >
      {sombre ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )
}
