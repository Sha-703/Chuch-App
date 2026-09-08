import { useEffect, useState } from 'react'
import { Plus, Search, Loader2, X } from 'lucide-react'
import Layout from '../components/Layout'
import Pagination, { paginer } from '../components/Pagination'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'

export default function Membres() {
  const { showToast } = useToast()
  const [membres, setMembres] = useState(null)
  const [erreur, setErreur] = useState('')
  const [recherche, setRecherche] = useState('')
  const [modalOuvert, setModalOuvert] = useState(false)
  const [page, setPage] = useState(1)

  function recharger() {
    api.listerMembres().then(setMembres).catch((err) => setErreur(err.message))
  }

  useEffect(recharger, [])

  if (erreur) return <Layout title="Membres"><p className="text-clay-600">{erreur}</p></Layout>
  if (!membres) {
    return (
      <Layout title="Membres">
        <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
      </Layout>
    )
  }

  const filtres = membres.filter((m) => m.nom.toLowerCase().includes(recherche.toLowerCase()))

  return (
    <Layout title="Membres" subtitle="Annuaire des membres et responsables de l'église">
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 gap-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/40" />
            <input
              placeholder="Rechercher un membre..."
              value={recherche}
              onChange={(e) => { setRecherche(e.target.value); setPage(1) }}
              className="w-full rounded-lg border border-ink-950/15 bg-parchment-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            />
          </div>
          <button
            onClick={() => setModalOuvert(true)}
            className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-ink-900 transition-colors whitespace-nowrap"
          >
            <Plus size={16} /> Ajouter un membre
          </button>
        </div>
        <div className="woven-rule mx-6 mt-5" />
        <table className="w-full mt-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 font-mono">
              <th className="px-6 py-3 font-semibold">Nom</th>
              <th className="px-6 py-3 font-semibold">Rôle</th>
              <th className="px-6 py-3 font-semibold">Membre depuis</th>
              <th className="px-6 py-3 font-semibold">Contact</th>
            </tr>
          </thead>
          <tbody>
            {paginer(filtres, page).map((m) => (
              <tr key={m.id} className="border-t border-ink-950/5 hover:bg-parchment-50">
                <td className="px-6 py-3.5 text-sm font-medium text-ink-950">{m.nom}</td>
                <td className="px-6 py-3.5 text-sm">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-gold-500/10 text-gold-700 text-xs font-semibold font-mono">
                    {m.role}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-sm text-ink-700/60">{m.depuis || '—'}</td>
                <td className="px-6 py-3.5 text-sm text-ink-800 font-tabular">{m.contact || '—'}</td>
              </tr>
            ))}
            {filtres.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-ink-700/50">Aucun membre trouvé.</td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} setPage={setPage} total={filtres.length} />
      </div>

      {modalOuvert && (
        <ModalMembre
          onClose={() => setModalOuvert(false)}
          onSaved={() => {
            setModalOuvert(false)
            recharger()
            showToast('Membre ajouté avec succès.')
          }}
        />
      )}
    </Layout>
  )
}

function ModalMembre({ onClose, onSaved }) {
  const [form, setForm] = useState({ nom: '', role: 'Membre', contact: '', depuis: String(new Date().getFullYear()) })
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      await api.creerMembre(form)
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
          <h3 className="font-display text-lg text-ink-950">Ajouter un membre</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Field label="Nom complet" required value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} placeholder="Ex. Fam. Nsimba" />
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Rôle</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
            >
              {['Membre', 'Diacre', 'Ancien', 'Administrateur'].map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <Field label="Contact" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} placeholder="+243 8xx xxx xxx" />
          <Field label="Membre depuis" value={form.depuis} onChange={(v) => setForm({ ...form, depuis: v })} placeholder="2024" />

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

function Field({ label, type = 'text', placeholder, value, onChange, required }) {
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
