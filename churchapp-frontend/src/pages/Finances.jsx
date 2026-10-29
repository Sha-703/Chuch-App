import { useEffect, useState } from 'react'
import { Plus, ArrowDownCircle, ArrowUpCircle, Loader2, X, Trash2, Building2 } from 'lucide-react'
import Layout from '../components/Layout'
import Pagination, { paginer } from '../components/Pagination'
import { api } from '../lib/api'
import { formatFC } from '../lib/mockData'
import { useToast } from '../context/ToastContext'

const tabs = ['Entrées', 'Charges', 'Départements']

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

  async function supprimerEntree(e) {
    if (!window.confirm(`Supprimer l'entrée "${e.type}" de ${formatFC(e.montant)} ?`)) return
    try {
      await api.supprimerEntree(e.id)
      showToast('Entrée supprimée.')
      recharger()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  async function supprimerCharge(c) {
    if (!window.confirm(`Supprimer la charge "${c.categorie}" de ${formatFC(c.montant)} ?`)) return
    try {
      await api.supprimerCharge(c.id)
      showToast('Charge supprimée.')
      recharger()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

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
    <Layout title="Finances" subtitle="Offrandes, dîmes, dons, charges de l'église et finances des départements">
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
        <div className="flex items-center justify-between px-6 pt-5 gap-4 flex-wrap">
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
          {tab !== 'Départements' && (
            <button
              onClick={() => setModalOuvert(true)}
              className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-ink-900 transition-colors"
            >
              <Plus size={16} /> {tab === 'Entrées' ? 'Nouvelle entrée' : 'Nouvelle charge'}
            </button>
          )}
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
                <th className="px-6 py-3 font-semibold text-right">Action</th>
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
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => supprimerEntree(e)}
                      className="text-ink-700/40 hover:text-clay-600"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {entrees.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-ink-700/50">Aucune entrée enregistrée.</td></tr>
              )}
            </tbody>
          </table>
        ) : tab === 'Charges' ? (
          <table className="w-full mt-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 font-mono">
                <th className="px-6 py-3 font-semibold">Catégorie</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold text-right">Montant</th>
                <th className="px-6 py-3 font-semibold text-right">Action</th>
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
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => supprimerCharge(c)}
                      className="text-ink-700/40 hover:text-clay-600"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {charges.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-ink-700/50">Aucune charge enregistrée.</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          <OngletDepartements showToast={showToast} />
        )}

        {tab !== 'Départements' && (
          <Pagination page={page} setPage={setPage} total={tab === 'Entrées' ? entrees.length : charges.length} />
        )}
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

// ---------------------------------------------------------------------------
// Onglet Départements — finances DÉDIÉES, totalement séparées des finances d'église
// ---------------------------------------------------------------------------

function OngletDepartements({ showToast }) {
  const [synthese, setSynthese] = useState(null)
  const [erreur, setErreur] = useState('')
  const [departementOuvert, setDepartementOuvert] = useState(null)

  function recharger() {
    api.financesDepartements().then(setSynthese).catch((err) => setErreur(err.message))
  }

  useEffect(recharger, [])

  if (erreur) return <p className="text-clay-600 px-6 py-6">{erreur}</p>
  if (!synthese) {
    return (
      <div className="flex items-center gap-2 text-ink-700/60 px-6 py-6">
        <Loader2 className="animate-spin" size={18} /> Chargement...
      </div>
    )
  }

  if (departementOuvert) {
    return (
      <DetailDepartement
        departement={departementOuvert}
        onBack={() => { setDepartementOuvert(null); recharger() }}
        showToast={showToast}
      />
    )
  }

  if (synthese.length === 0) {
    return (
      <p className="px-6 py-8 text-center text-sm text-ink-700/50">
        Aucun département créé — ajoutez-en un dans Ressources Humaines &gt; Départements.
      </p>
    )
  }

  return (
    <table className="w-full mt-2">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 font-mono">
          <th className="px-6 py-3 font-semibold">Département</th>
          <th className="px-6 py-3 font-semibold text-right">Entrées</th>
          <th className="px-6 py-3 font-semibold text-right">Charges</th>
          <th className="px-6 py-3 font-semibold text-right">Solde</th>
          <th className="px-6 py-3 font-semibold text-right">Détail</th>
        </tr>
      </thead>
      <tbody>
        {synthese.map((d) => (
          <tr key={d.id} className="border-t border-ink-950/5 hover:bg-parchment-50">
            <td className="px-6 py-3.5 text-sm font-medium text-ink-950 flex items-center gap-2">
              <Building2 size={15} className="text-gold-600" /> {d.nom}
            </td>
            <td className="px-6 py-3.5 text-sm text-right font-tabular text-leaf-600">{formatFC(d.totalEntrees)}</td>
            <td className="px-6 py-3.5 text-sm text-right font-tabular text-clay-600">{formatFC(d.totalCharges)}</td>
            <td className={`px-6 py-3.5 text-sm text-right font-tabular font-semibold ${d.solde >= 0 ? 'text-leaf-600' : 'text-clay-600'}`}>
              {formatFC(d.solde)}
            </td>
            <td className="px-6 py-3.5 text-right">
              <button
                onClick={() => setDepartementOuvert(d)}
                className="text-xs font-semibold text-gold-700 hover:underline"
              >
                Ouvrir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function DetailDepartement({ departement, onBack, showToast }) {
  const [donnees, setDonnees] = useState(null)
  const [erreur, setErreur] = useState('')
  const [modal, setModal] = useState(null) // 'Entrées' | 'Charges'

  function recharger() {
    api.financesDepartement(departement.id).then(setDonnees).catch((err) => setErreur(err.message))
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

  if (erreur) return <p className="text-clay-600 px-6 py-6">{erreur}</p>
  if (!donnees) {
    return (
      <div className="flex items-center gap-2 text-ink-700/60 px-6 py-6">
        <Loader2 className="animate-spin" size={18} /> Chargement...
      </div>
    )
  }

  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <button onClick={onBack} className="text-sm font-semibold text-gold-700 hover:underline">
          ← Retour aux départements
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => setModal('Entrées')}
            className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-ink-900"
          >
            <Plus size={15} /> Entrée
          </button>
          <button
            onClick={() => setModal('Charges')}
            className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-ink-900"
          >
            <Plus size={15} /> Charge
          </button>
        </div>
      </div>

      <h3 className="font-display text-lg text-ink-950 mb-1">{donnees.departement.nom}</h3>
      <p className="text-xs text-ink-700/50 mb-4">
        Finances propres au département — ces montants ne font pas partie des finances générales de l'église.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-parchment-100 rounded-lg p-4">
          <p className="text-[11px] uppercase tracking-wide text-ink-700/60 font-semibold mb-1">Entrées</p>
          <p className="font-display text-xl text-leaf-600 font-tabular">{formatFC(donnees.totalEntrees)}</p>
        </div>
        <div className="bg-parchment-100 rounded-lg p-4">
          <p className="text-[11px] uppercase tracking-wide text-ink-700/60 font-semibold mb-1">Charges</p>
          <p className="font-display text-xl text-clay-600 font-tabular">{formatFC(donnees.totalCharges)}</p>
        </div>
        <div className="bg-ink-950 rounded-lg p-4">
          <p className="text-[11px] uppercase tracking-wide text-ink-600 font-semibold mb-1">Solde</p>
          <p className="font-display text-xl text-gold-500 font-tabular">{formatFC(donnees.solde)}</p>
        </div>
      </div>

      <div className="space-y-5">
        <LigneFinance titre="Entrées" items={donnees.entrees} type="Entrées" couleur="text-leaf-600" signe="+" onSupprimer={supprimer} />
        <LigneFinance titre="Charges" items={donnees.charges} type="Charges" couleur="text-clay-600" signe="-" onSupprimer={supprimer} />
      </div>

      {modal && (
        <FormulaireModal
          type={modal}
          departementId={donnees.departement.id}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null)
            recharger()
            showToast(modal === 'Entrées' ? 'Entrée enregistrée.' : 'Charge enregistrée.')
          }}
        />
      )}
    </div>
  )
}

function LigneFinance({ titre, items, type, couleur, signe, onSupprimer }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/60 mb-2">{titre} ({items.length})</p>
      {items.length === 0 ? (
        <p className="text-sm text-ink-700/50">Aucun élément.</p>
      ) : (
        <ul className="divide-y divide-ink-950/5 border border-ink-950/10 rounded-lg overflow-hidden">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-parchment-50">
              <div className="text-sm">
                <span className="text-ink-950 font-medium">
                  {type === 'Entrées' ? item.type : item.categorie}
                </span>
                <span className="text-ink-700/50 text-xs ml-2">{item.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-tabular font-semibold ${couleur}`}>
                  {signe}{formatFC(item.montant)}
                </span>
                <button
                  onClick={() => onSupprimer(type, item)}
                  className="text-ink-700/40 hover:text-clay-600"
                  aria-label="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------

function FormulaireModal({ type, departementId, onClose, onSaved }) {
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
      if (departementId) {
        if (estEntree) await api.creerEntreeDepartement(departementId, payload)
        else await api.creerChargeDepartement(departementId, payload)
      } else if (estEntree) await api.creerEntree(payload)
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
