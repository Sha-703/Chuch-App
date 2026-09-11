import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, XCircle, HelpCircle, LogOut, Loader2, Church, Moon, Sun, Settings } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'

export default function MonEspace() {
  const { utilisateur, eglise, logout } = useAuth()
  const { showToast } = useToast()
  const { sombre, toggle } = useTheme()
  const [cultes, setCultes] = useState(null)
  const [erreur, setErreur] = useState('')
  const [modalAbsence, setModalAbsence] = useState(null) // culte en cours de traitement pour absence

  function recharger() {
    api.mesCultes().then(setCultes).catch((err) => setErreur(err.message))
  }

  useEffect(recharger, [])

  async function signerPresent(culteId) {
    try {
      await api.signerPresence(culteId, { statut: 'present' })
      showToast('Présence enregistrée. Merci !')
      recharger()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div className="min-h-screen bg-parchment-100">
      <header className="bg-ink-950 text-parchment-100 px-6 py-5 flex items-center justify-between sticky top-0 z-10">
        <div>
          <span className="font-display text-xl text-gold-500">ChurchApp</span>
          <p className="text-xs text-ink-600 mt-0.5">{eglise?.nom}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/parametres" className="flex items-center gap-1.5 text-sm text-ink-600 hover:text-gold-400">
            <Settings size={16} />
          </Link>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-ink-600 hover:text-clay-400">
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </header>
      <div className="max-w-lg mx-auto px-5 pt-3 flex justify-end">
        <button
          onClick={toggle}
          title={sombre ? 'Passer au mode clair' : 'Passer au mode sombre'}
          className="w-8 h-8 rounded-full bg-white border border-ink-950/10 flex items-center justify-center text-ink-800 hover:border-gold-500/60"
        >
          {sombre ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      <main className="max-w-lg mx-auto px-5 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-ink-950 text-gold-500 font-display flex items-center justify-center">
            {utilisateur?.nom?.[0] || '?'}
          </div>
          <div>
            <p className="font-display text-xl text-ink-950">{utilisateur?.nom}</p>
            <p className="text-xs text-ink-700/60">Mon espace ouvrier</p>
          </div>
        </div>

        {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2 mb-4">{erreur}</p>}

        {!cultes ? (
          <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
        ) : cultes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-8 text-center text-ink-700/50 text-sm">
            <Church className="mx-auto mb-3 text-ink-950/20" size={28} />
            Aucun culte programmé pour l'instant.
          </div>
        ) : (
          <div className="space-y-3">
            {cultes.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-semibold text-ink-950 text-sm">{c.type}</p>
                    <p className="text-xs text-ink-700/60">{c.date}{c.predicateur ? ` · ${c.predicateur}` : ''}</p>
                  </div>
                  <StatutBadge statut={c.monStatut} raison={c.maRaison} />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => signerPresent(c.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${
                      c.monStatut === 'present'
                        ? 'bg-leaf-500/15 text-leaf-700'
                        : 'bg-parchment-100 text-ink-800 hover:bg-leaf-500/10 hover:text-leaf-700'
                    }`}
                  >
                    <CheckCircle2 size={15} /> Présent
                  </button>
                  <button
                    onClick={() => setModalAbsence(c)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-colors ${
                      c.monStatut === 'absent'
                        ? 'bg-clay-500/15 text-clay-700'
                        : 'bg-parchment-100 text-ink-800 hover:bg-clay-500/10 hover:text-clay-700'
                    }`}
                  >
                    <XCircle size={15} /> Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modalAbsence && (
        <ModalRaisonAbsence
          culte={modalAbsence}
          onClose={() => setModalAbsence(null)}
          onSaved={() => { setModalAbsence(null); recharger(); showToast('Absence enregistrée.') }}
        />
      )}
    </div>
  )
}

function StatutBadge({ statut, raison }) {
  const config = {
    present: { icon: CheckCircle2, style: 'text-leaf-700 bg-leaf-500/10', label: 'Présent' },
    absent: { icon: XCircle, style: 'text-clay-700 bg-clay-500/10', label: raison ? `Absent — ${raison}` : 'Absent' },
    sans_reponse: { icon: HelpCircle, style: 'text-ink-700/50 bg-ink-950/5', label: 'À répondre' },
  }[statut]
  const Icon = config.icon
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${config.style}`}>
      <Icon size={11} /> {config.label}
    </span>
  )
}

function ModalRaisonAbsence({ culte, onClose, onSaved }) {
  const [raison, setRaison] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!raison.trim()) return setErreur('Merci de préciser une raison.')
    setChargement(true)
    setErreur('')
    try {
      await api.signerPresence(culte.id, { statut: 'absent', raison })
      onSaved()
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink-950/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-sm p-6">
        <h3 className="font-display text-lg text-ink-950 mb-1">Signaler une absence</h3>
        <p className="text-xs text-ink-700/60 mb-4">{culte.type} — {culte.date}</p>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Raison</label>
            <input
              autoFocus
              value={raison}
              onChange={(e) => setRaison(e.target.value)}
              placeholder="Ex. Malade, en déplacement..."
              className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
            />
          </div>
          {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 border border-ink-950/15 text-ink-800 rounded-lg py-2.5 text-sm font-semibold hover:border-gold-500/60">
              Annuler
            </button>
            <button
              type="submit"
              disabled={chargement}
              className="flex-1 flex items-center justify-center gap-2 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900 disabled:opacity-60"
            >
              {chargement ? <Loader2 size={16} className="animate-spin" /> : 'Confirmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
