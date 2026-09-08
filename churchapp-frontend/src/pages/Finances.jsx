import { useEffect, useState } from 'react'
import { Plus, ArrowDownCircle, ArrowUpCircle, Loader2, X } from 'lucide-react'
import Layout from '../components/Layout'
import Pagination, { paginer } from '../components/Pagination'
import { api } from '../lib/api'
import { formatFC } from '../lib/mockData'
import { useToast } from '../context/ToastContext'

const tabs = ['Entrées', 'Charges']

export default function Finances() {
  const { showToast } = useToast()
  const [tab, setTab] = useState('Entrées')
  const [page, setPage] = useState(1)
  const [entrees, setEntrees] = useState(null)
  const [charges, setCharges] = useState(null)
  const [erreur, setErreur] = useState('')
  const [modalOuvert, setModalOuvert] = useState(false)

  function recharger() {
    Promise.all([api.listerEntrees(), api.listerCharges()])
      .then(([e, c]) => { setEntrees(e); setCharges(c) })
      .catch((err) => setErreur(err.message))
  }

  useEffect(recharger, [])

  const totalEntrees = entrees?.reduce((s, e) => s + e.montant, 0) || 0
  const totalCharges = charges?.reduce((s, c) => s + c.montant, 0) || 0

  if (erreur) return <Layout title="Finances"><p className="text-clay-600">{erreur}</p></Layout>
  if (!entrees || !charges) {
    return (
      <Layout title="Finances">
        <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Finances" subtitle="Offrandes, dîmes, dons et charges de l'église">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/60 mb-2">Total entrées</p>
          <p className="font-display text-2xl text-leaf-600 font-tabular">{formatFC(totalEntrees)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/60 mb-2">Total charges</p>
          <p className="font-display text-2xl text-clay-600 font-tabular">{formatFC(totalCharges)}</p>
        </div>
        <div className="bg-ink-950 rounded-2xl shadow-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-600 mb-2">Solde net</p>
          <p className="font-display text-2xl text-gold-500 font-tabular">{formatFC(totalEntrees - totalCharges)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5">
          <div className="flex gap-1 bg-parchment-100 rounded-lg p-1">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setPage(1) }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  tab === t ? 'bg-white shadow-sm text-ink-950' : 'text-ink-700/60'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <button
            onClick={() => setModalOuvert(true)}
            className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-ink-900 transition-colors"
          >
            <Plus size={16} /> {tab === 'Entrées' ? 'Nouvelle entrée' : 'Nouvelle charge'}
          </button>
        </div>
        <div className="woven-rule mx-6 mt-5" />

        {tab === 'Entrées' ? (
          <table className="w-full mt-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 font-mono">
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Provenance</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {paginer(entrees, page).map((e) => (
                <tr key={e.id} className="border-t border-ink-950/5 hover:bg-parchment-50">
                  <td className="px-6 py-3.5 text-sm flex items-center gap-2">
                    <ArrowDownCircle size={15} className="text-leaf-600" />
                    {e.type}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-ink-800">{e.provenance || '—'}</td>
                  <td className="px-6 py-3.5 text-sm text-ink-700/60">{e.date}</td>
                  <td className="px-6 py-3.5 text-sm text-right font-tabular font-semibold text-leaf-600">
                    +{formatFC(e.montant)}
                  </td>
                </tr>
              ))}
              {entrees.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-ink-700/50">Aucune entrée enregistrée.</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full mt-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 font-mono">
                <th className="px-6 py-3 font-semibold">Catégorie</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {paginer(charges, page).map((c) => (
                <tr key={c.id} className="border-t border-ink-950/5 hover:bg-parchment-50">
                  <td className="px-6 py-3.5 text-sm flex items-center gap-2">
                    <ArrowUpCircle size={15} className="text-clay-600" />
                    {c.categorie}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-ink-700/60">{c.date}</td>
                  <td className="px-6 py-3.5 text-sm text-right font-tabular font-semibold text-clay-600">
                    -{formatFC(c.montant)}
                  </td>
                </tr>
              ))}
              {charges.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-sm text-ink-700/50">Aucune charge enregistrée.</td></tr>
              )}
            </tbody>
          </table>
        )}
        <Pagination page={page} setPage={setPage} total={tab === 'Entrées' ? entrees.length : charges.length} />
      </div>

      {modalOuvert && (
        <FormulaireModal
          type={tab}
          onClose={() => setModalOuvert(false)}
          onSaved={() => {
            setModalOuvert(false)
            recharger()
            showToast(tab === 'Entrées' ? 'Entrée enregistrée avec succès.' : 'Charge enregistrée avec succès.')
          }}
        />
      )}
    </Layout>
  )
}

function FormulaireModal({ type, onClose, onSaved }) {
  const estEntree = type === 'Entrées'
  const [form, setForm] = useState(
    estEntree
      ? { type: 'Offrande', typeAutre: '', provenance: '', montant: '', date: new Date().toISOString().slice(0, 10) }
      : { categorie: '', montant: '', date: new Date().toISOString().slice(0, 10) }
  )
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (estEntree && form.type === 'Autre' && !form.typeAutre.trim()) {
      setErreur('Merci de préciser le type d\u2019entrée.')
      return
    }
    setChargement(true)
    setErreur('')
    try {
      const { typeAutre, ...reste } = form
      const payload = {
        ...reste,
        type: estEntree && form.type === 'Autre' ? form.typeAutre.trim() : form.type,
        montant: parseFloat(form.montant),
      }
      if (estEntree) await api.creerEntree(payload)
      else await api.creerCharge(payload)
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
          <h3 className="font-display text-lg text-ink-950">
            {estEntree ? 'Nouvelle entrée' : 'Nouvelle charge'}
          </h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {estEntree ? (
            <>
              <SelectField
                label="Type"
                value={form.type}
                onChange={(v) => setForm({ ...form, type: v })}
                options={['Offrande', 'Dîme', 'Don spécial', 'Autre']}
              />
              {form.type === 'Autre' && (
                <InputField
                  label="Précisez le type"
                  placeholder="Ex. Vente de livres"
                  required
                  value={form.typeAutre}
                  onChange={(v) => setForm({ ...form, typeAutre: v })}
                />
              )}
              <InputField label="Provenance" placeholder="Ex. Culte du dimanche" value={form.provenance} onChange={(v) => setForm({ ...form, provenance: v })} />
            </>
          ) : (
            <InputField label="Catégorie" placeholder="Ex. Électricité (SNEL)" value={form.categorie} onChange={(v) => setForm({ ...form, categorie: v })} required />
          )}
          <InputField label="Montant (FC)" type="number" placeholder="0" value={form.montant} onChange={(v) => setForm({ ...form, montant: v })} required />
          <InputField label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} required />

          {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}

          <button
            type="submit"
            disabled={chargement}
            className="w-full flex items-center justify-center gap-2 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900 transition-colors disabled:opacity-60 mt-2"
          >
            {chargement ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}

function InputField({ label, type = 'text', placeholder, value, onChange, required }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">{label}</label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
      />
    </div>
  )
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
