import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LogOut, Loader2, Moon, Sun, Settings, Plus, ArrowDownCircle, ArrowUpCircle, Trash2, X, Wallet, Landmark,
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import { formatFC } from '../lib/mockData'

// ---------------------------------------------------------------------------
// Espace privé du TRÉSORIER : il enregistre les entrées et les charges de
// l'église, sans accès au reste de l'administration.
// ---------------------------------------------------------------------------
export default function MonTresorier() {
  const { utilisateur, eglise, logout } = useAuth()
  const { showToast } = useToast()
  const { sombre, toggle } = useTheme()
  const [entrees, setEntrees] = useState(null)
  const [charges, setCharges] = useState(null)
  const [erreur, setErreur] = useState('')
  const [onglet, setOnglet] = useState('Entrées')
  const [modal, setModal] = useState(null) // 'Entrées' | 'Charges'

  function recharger() {
    Promise.all([api.listerEntrees(), api.listerCharges()])
      .then(([e, c]) => { setEntrees(e); setCharges(c) })
      .catch((err) => setErreur(err.message))
  }

  useEffect(recharger, [])

  async function supprimer(type, item) {
    const libelle = type === 'Entrées' ? item.type : item.categorie
    if (!window.confirm(`Supprimer ${type === 'Entrées' ? "l'entrée" : 'la charge'} "${libelle}" ?`)) return
    try {
      if (type === 'Entrées') await api.supprimerEntree(item.id)
      else await api.supprimerCharge(item.id)
      showToast('Élément supprimé.')
      recharger()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const totalEntrees = entrees?.reduce((s, e) => s + e.montant, 0) || 0
  const totalCharges = charges?.reduce((s, c) => s + c.montant, 0) || 0

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
      <div className="max-w-3xl mx-auto px-5 pt-3 flex justify-end">
        <button
          onClick={toggle}
          title={sombre ? 'Passer au mode clair' : 'Passer au mode sombre'}
          className="w-8 h-8 rounded-full bg-white border border-ink-950/10 flex items-center justify-center text-ink-800 hover:border-gold-500/60"
        >
          {sombre ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      <main className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-full bg-ink-950 text-gold-500 font-display flex items-center justify-center">
            {utilisateur?.nom?.[0] || '?'}
          </div>
          <div>
            <p className="font-display text-xl text-ink-950">{utilisateur?.nom}</p>
            <p className="text-xs text-ink-700/60">Espace trésorier — finances de l'église</p>
          </div>
        </div>

        {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2 mb-4">{erreur}</p>}

        {!entrees || !charges ? (
          <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/60 mb-2 inline-flex items-center gap-1.5">
                  <ArrowDownCircle size={13} className="text-leaf-600" /> Entrées
                </p>
                <p className="font-display text-2xl text-leaf-600 font-tabular">{formatFC(totalEntrees)}</p>
              </div>
              <div className="bg-white rounded-2xl shadow-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/60 mb-2 inline-flex items-center gap-1.5">
                  <ArrowUpCircle size={13} className="text-clay-600" /> Charges
                </p>
                <p className="font-display text-2xl text-clay-600 font-tabular">{formatFC(totalCharges)}</p>
              </div>
              <div className="bg-ink-950 rounded-2xl shadow-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-600 mb-2 inline-flex items-center gap-1.5">
                  <Landmark size={13} className="text-gold-500" /> Solde
                </p>
                <p className="font-display text-2xl text-gold-500 font-tabular">{formatFC(totalEntrees - totalCharges)}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-4 gap-3 flex-wrap">
                <div className="flex gap-1 bg-parchment-100 rounded-lg p-1">
                  {['Entrées', 'Charges'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setOnglet(t)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        onglet === t ? 'bg-white shadow-sm text-ink-950' : 'text-ink-700/60'
                      }`}
                    >
                      {t} ({t === 'Entrées' ? entrees.length : charges.length})
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setModal(onglet)}
                  className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-ink-900 transition-colors"
                >
                  <Plus size={16} /> {onglet === 'Entrées' ? 'Nouvelle entrée' : 'Nouvelle charge'}
                </button>
              </div>
              <div className="woven-rule mx-5 mt-4" />

              <ul className="divide-y divide-ink-950/5">
                {(onglet === 'Entrées' ? entrees : charges).map((item) => {
                  const estEntree = onglet === 'Entrées'
                  return (
                    <li key={item.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-2 text-sm">
                        {estEntree
                          ? <ArrowDownCircle size={15} className="text-leaf-600" />
                          : <ArrowUpCircle size={15} className="text-clay-600" />}
                        <div>
                          <p className="font-medium text-ink-950">{estEntree ? item.type : item.categorie}</p>
                          <p className="text-xs text-ink-700/50">
                            {item.date}{!estEntree && item.description ? ` · ${item.description}` : ''}
                            {estEntree && item.provenance ? ` · ${item.provenance}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-tabular font-semibold ${estEntree ? 'text-leaf-600' : 'text-clay-600'}`}>
                          {estEntree ? '+' : '-'}{formatFC(item.montant)}
                        </span>
                        <button
                          onClick={() => supprimer(onglet, item)}
                          className="text-ink-700/40 hover:text-clay-600"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  )
                })}
                {(onglet === 'Entrées' ? entrees : charges).length === 0 && (
                  <li className="px-5 py-8 text-center text-sm text-ink-700/50">
                    <Wallet className="mx-auto mb-2 text-ink-950/20" size={24} />
                    Aucun élément enregistré pour l'instant.
                  </li>
                )}
              </ul>
            </div>

            <p className="text-[11px] text-ink-700/40 mt-4 text-center">
              Ces montants constituent les finances générales de l'église.
            </p>
          </>
        )}
      </main>

      {modal && (
        <FormulaireFinance
          type={modal}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null)
            recharger()
            showToast(modal === 'Entrées' ? 'Entrée enregistrée avec succès.' : 'Charge enregistrée avec succès.')
          }}
        />
      )}
    </div>
  )
}

function FormulaireFinance({ type, onClose, onSaved }) {
  const estEntree = type === 'Entrées'
  const [form, setForm] = useState(
    estEntree
      ? { type: 'Offrande', provenance: '', montant: '', date: new Date().toISOString().slice(0, 10) }
      : { categorie: '', description: '', montant: '', date: new Date().toISOString().slice(0, 10) }
  )
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      const payload = { ...form, montant: parseFloat(form.montant) }
      if (estEntree) await api.creerEntree(payload)
      else await api.creerCharge(payload)
      onSaved()
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  const styleChamp = 'mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50'

  return (
    <div className="fixed inset-0 bg-ink-950/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg text-ink-950">{estEntree ? 'Nouvelle entrée' : 'Nouvelle charge'}</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {estEntree ? (
            <>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={styleChamp}>
                  {['Offrande', 'Dîme', 'Don spécial', 'Autre'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Provenance</label>
                <input value={form.provenance} onChange={(e) => setForm({ ...form, provenance: e.target.value })} placeholder="Ex. Culte du dimanche" className={styleChamp} />
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Catégorie</label>
              <input required value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} placeholder="Ex. Électricité (SNEL)" className={styleChamp} />
            </div>
          )}
          {!estEntree && (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optionnel" className={styleChamp} />
            </div>
          )}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Montant (FC)</label>
            <input type="number" min="0" step="any" required value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} className={styleChamp} />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Date</label>
            <input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={styleChamp} />
          </div>

          {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}

          <button
            type="submit"
            disabled={chargement}
            className="w-full flex items-center justify-center gap-2 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900 disabled:opacity-60 mt-2"
          >
            {chargement ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}
