import { useEffect, useState } from 'react'
import { Plus, Loader2, X, AlertTriangle, Trash2 } from 'lucide-react'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'

const styleEtat = { bon: 'bg-leaf-500/10 text-leaf-700', moyen: 'bg-gold-500/10 text-gold-700', mauvais: 'bg-clay-500/10 text-clay-700' }

export default function Logistique() {
  const { showToast } = useToast()
  const [materiel, setMateriel] = useState(null)
  const [erreur, setErreur] = useState('')
  const [modalOuvert, setModalOuvert] = useState(false)

  function recharger() {
    api.listerMateriel().then(setMateriel).catch((err) => setErreur(err.message))
  }
  useEffect(recharger, [])

  async function supprimer(id) {
    try {
      await api.supprimerMateriel(id)
      showToast('Matériel retiré.')
      recharger()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  if (erreur) return <Layout title="Logistique"><p className="text-clay-600">{erreur}</p></Layout>

  return (
    <Layout title="Logistique" subtitle="Inventaire du matériel de l'église">
      <div className="flex justify-end mb-5">
        <button onClick={() => setModalOuvert(true)} className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-ink-900">
          <Plus size={16} /> Ajouter du matériel
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {!materiel ? (
          <div className="flex items-center gap-2 text-ink-700/60 px-6 py-10"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 font-mono">
                <th className="px-6 py-3 font-semibold">Nom</th>
                <th className="px-6 py-3 font-semibold">Catégorie</th>
                <th className="px-6 py-3 font-semibold text-right">Quantité</th>
                <th className="px-6 py-3 font-semibold">État</th>
                <th className="px-6 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {materiel.map((m) => (
                <tr key={m.id} className="border-t border-ink-950/5 hover:bg-parchment-50">
                  <td className="px-6 py-3.5 text-sm font-medium text-ink-950">{m.nom}</td>
                  <td className="px-6 py-3.5 text-sm text-ink-700/60">{m.categorie || '—'}</td>
                  <td className="px-6 py-3.5 text-sm text-right font-tabular">
                    <span className={m.stockFaible ? 'text-clay-600 font-semibold inline-flex items-center gap-1' : 'text-ink-800'}>
                      {m.stockFaible && <AlertTriangle size={12} />} {m.quantite}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${styleEtat[m.etat]}`}>{m.etat}</span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button onClick={() => supprimer(m.id)} className="text-ink-700/40 hover:text-clay-600"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {materiel.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-ink-700/50">Aucun matériel enregistré.</td></tr>
              )}
            </tbody>
          </table>
        )}
        <div className="h-4" />
      </div>

      {modalOuvert && (
        <ModalMateriel onClose={() => setModalOuvert(false)} onSaved={() => { setModalOuvert(false); recharger(); showToast('Matériel ajouté.') }} />
      )}
    </Layout>
  )
}

function ModalMateriel({ onClose, onSaved }) {
  const [form, setForm] = useState({ nom: '', categorie: '', quantite: '', seuilAlerte: '5', etat: 'bon' })
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      await api.creerMateriel(form)
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
          <h3 className="font-display text-lg text-ink-950">Ajouter du matériel</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Champ label="Nom" required value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} placeholder="Ex. Chaises" />
          <Champ label="Catégorie" value={form.categorie} onChange={(v) => setForm({ ...form, categorie: v })} placeholder="Ex. Mobilier" />
          <div className="grid grid-cols-2 gap-3">
            <Champ label="Quantité" type="number" required value={form.quantite} onChange={(v) => setForm({ ...form, quantite: v })} placeholder="0" />
            <Champ label="Seuil d'alerte" type="number" value={form.seuilAlerte} onChange={(v) => setForm({ ...form, seuilAlerte: v })} placeholder="5" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">État</label>
            <select value={form.etat} onChange={(e) => setForm({ ...form, etat: e.target.value })} className={champClasses}>
              {['bon', 'moyen', 'mauvais'].map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}
          <button type="submit" disabled={chargement} className="w-full flex items-center justify-center gap-2 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900 disabled:opacity-60">
            {chargement ? <Loader2 size={16} className="animate-spin" /> : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  )
}

const champClasses = "mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
function Champ({ label, type = 'text', placeholder, value, onChange, required }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">{label}</label>
      <input type={type} required={required} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={champClasses} />
    </div>
  )
}
