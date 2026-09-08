import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id))
    }, 3500)
  }, [])

  function dismiss(id) {
    setToasts((t) => t.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex items-start gap-2.5 rounded-xl shadow-card px-4 py-3 text-sm font-medium animate-[toast-in_0.2s_ease-out] ${
              t.type === 'success' ? 'bg-ink-950 text-parchment-50' : 'bg-clay-600 text-parchment-50'
            }`}
          >
            {t.type === 'success' ? (
              <CheckCircle2 size={18} className="text-gold-500 shrink-0 mt-0.5" />
            ) : (
              <XCircle size={18} className="text-parchment-50 shrink-0 mt-0.5" />
            )}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-parchment-50/60 hover:text-parchment-50 shrink-0">
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
