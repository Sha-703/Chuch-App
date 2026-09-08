import { useEffect, useState } from 'react'
import { Loader2, Plus, X, AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import CommunauteLayout from '../components/CommunauteLayout'
import { api } from '../lib/api'
import { formatFC } from '../lib/mockData'
import { useToast } from '../context/ToastContext'

const styleStatut = {
  a_jour: { icon: CheckCircle2, style: 'bg-leaf-500/10 text-leaf-700', label: 'À jour' },
  partiel: { icon: Clock, style: 'bg-gold-500/10 text-gold-700', label: 'Partiel' },
  en_retard: { icon: AlertTriangle, style: 'bg-clay-500/10 text-clay-700', label: 'En retard' },
}

export default function CommunauteRecouvrement() {
  const { showToast } = useToast()
  const [donnees, setDonnees] = useState(null)
  const [erreur, setErreur] = useState('')
  const [modalOuvert, setModalOuvert] = useState(false)

  function recharger() {
    api.communauteRecouvrement().then(setDonnees).catch((err) => setErreur(err.message))
  }
  useEffect(recharger, [])

  if (erreur) return <CommunauteLayout title="Recouvrement"><p className="text-clay-600">{erreur}</p></CommunauteLayout>

  const tauxGlobal = donnees ? (() => {
    const totalDu = donnees.reduce((s, d) => s + d.totalDu, 0)
    const totalPaye = donnees.reduce((s, d) => s + d.totalPaye, 0)
    return totalDu > 0 ? Math.round((totalPaye / totalDu) * 100) : 0
  })() : 0

  return (
    <CommunauteLayout title="Recouvrement" subtitle="Vos églises triées par montant en retard — les plus urgentes en premier">
      <div className="flex items-center justify-between mb-5">
        <div className="bg-white rounded-2xl shadow-card px-5 py-3 inline-flex items-center gap-3">
          <span className="text-xs font-mono uppercase text-ink-700/50">Taux global</span>
          <span className="font-display text-xl text-ink-950">{tauxGlobal}%</span>
        </div>
        <button onClick={() => setModalOuvert(true)} className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-ink-900">
          <Plus size={16} /> Enregistrer un versement
        </button>
      </div>

      {!donnees ? (
        <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 font-mono">
                <th className="px-6 py-3 font-semibold">Église</th>
                <th className="px-6 py-3 font-semibold text-right">Dû</th>
                <th className="px-6 py-3 font-semibold text-right">Payé</th>
                <th className="px-6 py-3 font-semibold text-right">Restant</th>
                <th className="px-6 py-3 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {donnees.map((d) => {
                const s = styleStatut[d.statut]
                const Icon = s.icon
                return (
                  <tr key={d.eglise.id} className="border-t border-ink-950/5 hover:bg-parchment-50">
                    <td className="px-6 py-3.5 text-sm font-medium text-ink-950">{d.eglise.nom}</td>
                    <td className="px-6 py-3.5 text-sm text-right font-tabular">{formatFC(d.totalDu)}</td>
                    <td className="px-6 py-3.5 text-sm text-right font-tabular text-leaf-600">{formatFC(d.totalPaye)}</td>
                    <td className="px-6 py-3.5 text-sm text-right font-tabular font-semibold text-clay-600">{formatFC(d.restant)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold font-mono px-2.5 py-0.5 rounded-full ${s.style}`}>
                        <Icon size={11} /> {s.label}{d.nbEcheancesEnRetard > 0 ? ` (${d.nbEcheancesEnRetard})` : ''}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {donnees.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-ink-700/50">Aucune église rattachée.</td></tr>
              )}
            </tbody>
          </table>
          <div className="h-4" />
        </div>
      )}

      {modalOuvert && (
        <ModalVersement
          eglises={donnees?.map((d) => d.eglise) || []}
          onClose={() => setModalOuvert(false)}
          onSaved={() => { setModalOuvert(false); recharger(); showToast('Versement enregistré et affecté aux échéances les plus anciennes.') }}
        />
      )}
    </CommunauteLayout>
  )
}

function ModalVersement({ eglises, onClose, onSaved }) {
  const [egliseId, setEgliseId] = useState('')
  const [montant, setMontant] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!egliseId) return setErreur('Choisissez une église.')
    setChargement(true)
    setErreur('')
    try {
      await api.communauteEnregistrerVersement({ egliseId, montant: parseFloat(montant), date, note })
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
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg text-ink-950">Enregistrer un versement</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Église</label>
            <select value={egliseId} onChange={(e) => setEgliseId(e.target.value)} className="mt-1.5 w-full rounded-lg border border-ink-950/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50">
              <option value="">— Choisir —</option>
              {eglises.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Montant (FC)</label>
            <input type="number" required value={montant} onChange={(e) => setMontant(e.target.value)} placeholder="0" className="mt-1.5 w-full rounded-lg border border-ink-950/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Date</label>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 w-full rounded-lg border border-ink-950/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Note (optionnel)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex. Versement espèces" className="mt-1.5 w-full rounded-lg border border-ink-950/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          </div>
          <p className="text-xs text-ink-700/50 bg-parchment-100 rounded-lg p-3">
            Ce versement sera automatiquement affecté aux échéances impayées les plus anciennes de cette église.
          </p>
          {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}
          <button type="submit" disabled={chargement} className="w-full flex items-center justify-center gap-2 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900 disabled:opacity-60">
            {chargement ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}
