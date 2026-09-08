import { useEffect, useState } from 'react'
import { Plus, MonitorPlay, Users, Loader2, X, ClipboardList, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import Layout from '../components/Layout'
import Pagination, { paginer } from '../components/Pagination'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'

export default function Cultes() {
  const { showToast } = useToast()
  const [cultes, setCultes] = useState(null)
  const [erreur, setErreur] = useState('')
  const [modalOuvert, setModalOuvert] = useState(false)
  const [culteSelectionne, setCulteSelectionne] = useState(null)
  const [page, setPage] = useState(1)

  function recharger() {
    api.listerCultes().then(setCultes).catch((err) => setErreur(err.message))
  }

  useEffect(recharger, [])

  if (erreur) return <Layout title="Cultes & présence"><p className="text-clay-600">{erreur}</p></Layout>
  if (!cultes) {
    return (
      <Layout title="Cultes & présence">
        <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
      </Layout>
    )
  }

  const frequentation = cultes
    .slice()
    .reverse()
    .map((c) => ({ date: c.date.slice(5), presentiel: c.presentiel, enLigne: c.enLigne }))

  return (
    <Layout title="Cultes & présence" subtitle="Suivi de fréquentation en présentiel et en ligne">
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-display text-lg text-ink-950">Évolution de la fréquentation</h2>
        </div>
        <div className="woven-rule w-16 mb-5" />
        {frequentation.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={frequentation} margin={{ left: -10 }}>
              <defs>
                <linearGradient id="presentiel" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A227" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#C9A227" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="enligne" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#284370" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#284370" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B2A4A0f" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#284370' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#28437099' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #1B2A4A1a', fontSize: 13 }} />
              <Area type="monotone" dataKey="presentiel" name="Présentiel" stroke="#C9A227" fill="url(#presentiel)" strokeWidth={2.5} />
              <Area type="monotone" dataKey="enLigne" name="En ligne" stroke="#284370" fill="url(#enligne)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-ink-700/50 py-8 text-center">Aucun culte enregistré pour l'instant.</p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="font-display text-lg text-ink-950">Historique des cultes</h2>
          <button
            onClick={() => setModalOuvert(true)}
            className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-ink-900 transition-colors"
          >
            <Plus size={16} /> Enregistrer un culte
          </button>
        </div>
        <div className="woven-rule mx-6 mt-5" />
        <table className="w-full mt-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 font-mono">
              <th className="px-6 py-3 font-semibold">Culte</th>
              <th className="px-6 py-3 font-semibold">Prédicateur</th>
              <th className="px-6 py-3 font-semibold">Date</th>
              <th className="px-6 py-3 font-semibold text-right">Présentiel</th>
              <th className="px-6 py-3 font-semibold text-right">En ligne</th>
              <th className="px-6 py-3 font-semibold text-right">Total</th>
              <th className="px-6 py-3 font-semibold text-right">Présences</th>
            </tr>
          </thead>
          <tbody>
            {paginer(cultes, page).map((c) => (
              <tr key={c.id} className="border-t border-ink-950/5 hover:bg-parchment-50">
                <td className="px-6 py-3.5 text-sm font-medium text-ink-950">{c.type}</td>
                <td className="px-6 py-3.5 text-sm text-ink-800">{c.predicateur || '—'}</td>
                <td className="px-6 py-3.5 text-sm text-ink-700/60">{c.date}</td>
                <td className="px-6 py-3.5 text-sm text-right font-tabular">
                  <span className="inline-flex items-center gap-1.5 text-ink-800">
                    <Users size={13} /> {c.presentiel}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-sm text-right font-tabular">
                  <span className="inline-flex items-center gap-1.5 text-ink-800">
                    <MonitorPlay size={13} /> {c.enLigne}
                  </span>
                </td>
                <td className="px-6 py-3.5 text-sm text-right font-tabular font-semibold text-gold-600">
                  {c.presentiel + c.enLigne}
                </td>
                <td className="px-6 py-3.5 text-right">
                  <button
                    onClick={() => setCulteSelectionne(c)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-800 hover:text-ink-950 hover:underline whitespace-nowrap"
                  >
                    <ClipboardList size={13} /> Détail
                  </button>
                </td>
              </tr>
            ))}
            {cultes.length === 0 && (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-sm text-ink-700/50">Aucun culte enregistré.</td></tr>
            )}
          </tbody>
        </table>
        <Pagination page={page} setPage={setPage} total={cultes.length} />
      </div>

      {modalOuvert && (
        <ModalCulte
          onClose={() => setModalOuvert(false)}
          onSaved={() => {
            setModalOuvert(false)
            recharger()
            showToast('Culte enregistré avec succès.')
          }}
        />
      )}
      {culteSelectionne && (
        <ModalPresences culte={culteSelectionne} onClose={() => setCulteSelectionne(null)} />
      )}
    </Layout>
  )
}

function ModalCulte({ onClose, onSaved }) {
  const [form, setForm] = useState({
    type: 'Culte dominical',
    typeAutre: '',
    date: new Date().toISOString().slice(0, 10),
    predicateur: '',
    presentiel: '',
    enLigne: '',
  })
  const [departements, setDepartements] = useState([])
  const [predicateurLibre, setPredicateurLibre] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => { api.listerDepartements().then(setDepartements).catch(() => {}) }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.type === 'Autre' && !form.typeAutre.trim()) {
      return setErreur('Merci de préciser le type de culte.')
    }
    if (!predicateurLibre && !form.predicateur) {
      return setErreur('Merci de choisir un prédicateur (ou de basculer en saisie libre).')
    }
    setChargement(true)
    setErreur('')
    try {
      await api.creerCulte({
        type: form.type === 'Autre' ? form.typeAutre.trim() : form.type,
        date: form.date,
        predicateur: form.predicateur,
        presentiel: parseInt(form.presentiel) || 0,
        enLigne: parseInt(form.enLigne) || 0,
      })
      onSaved()
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink-950/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-sm p-6 my-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg text-ink-950">Enregistrer un culte</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Type de culte</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
            >
              {['Culte dominical', 'Réunion de prière', 'Étude biblique', 'Autre'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          {form.type === 'Autre' && (
            <Field
              label="Précisez le type de culte"
              placeholder="Ex. Veillée de prière"
              required
              value={form.typeAutre}
              onChange={(v) => setForm({ ...form, typeAutre: v })}
            />
          )}

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Prédicateur</label>
              <button
                type="button"
                onClick={() => { setPredicateurLibre((v) => !v); setForm({ ...form, predicateur: '' }) }}
                className="text-xs text-gold-700 font-semibold hover:underline"
              >
                {predicateurLibre ? 'Choisir parmi les membres' : 'Saisir un nom libre'}
              </button>
            </div>
            {predicateurLibre ? (
              <input
                value={form.predicateur}
                onChange={(e) => setForm({ ...form, predicateur: e.target.value })}
                placeholder="Ex. Past. invité Kibambe"
                className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
              />
            ) : (
              <select
                value={form.predicateur}
                onChange={(e) => setForm({ ...form, predicateur: e.target.value })}
                className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
              >
                <option value="">— Choisir un membre —</option>
                {departements.map((d) => (
                  (d.ouvriers || []).length > 0 && (
                    <optgroup key={d.id} label={d.nom}>
                      {d.ouvriers.map((m) => <option key={m.id} value={m.nom}>{m.nom}</option>)}
                    </optgroup>
                  )
                ))}
              </select>
            )}
            {!predicateurLibre && departements.every((d) => !d.ouvriers?.length) && (
              <p className="text-xs text-ink-700/50 mt-1.5">
                Aucun ouvrier de département enregistré pour l'instant — utilisez "Saisir un nom libre" ou ajoutez des ouvriers dans Ressources Humaines.
              </p>
            )}
          </div>

          <Field label="Date" type="date" value={form.date} onChange={(v) => setForm({ ...form, date: v })} required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Présentiel" type="number" value={form.presentiel} onChange={(v) => setForm({ ...form, presentiel: v })} placeholder="0" />
            <Field label="En ligne" type="number" value={form.enLigne} onChange={(v) => setForm({ ...form, enLigne: v })} placeholder="0" />
          </div>

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

const styleStatut = {
  present: { icon: CheckCircle2, couleur: 'text-leaf-700 bg-leaf-500/10', label: 'Présent' },
  absent: { icon: XCircle, couleur: 'text-clay-700 bg-clay-500/10', label: 'Absent' },
  sans_reponse: { icon: HelpCircle, couleur: 'text-ink-700/50 bg-ink-950/5', label: 'Sans réponse' },
}

function ModalPresences({ culte, onClose }) {
  const [departements, setDepartements] = useState(null)
  const [departementId, setDepartementId] = useState('')
  const [donnees, setDonnees] = useState(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => { api.listerDepartements().then(setDepartements).catch(() => setDepartements([])) }, [])

  function charger() {
    setDonnees(null)
    api.presencesDuCulte(culte.id, departementId || undefined)
      .then((d) => setDonnees(d.presences))
      .catch((err) => setErreur(err.message))
  }

  useEffect(charger, [departementId])

  return (
    <div className="fixed inset-0 bg-ink-950/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-lg p-6 my-8">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-lg text-ink-950">Présences — {culte.type}</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <p className="text-xs text-ink-700/50 mb-4">{culte.date}</p>

        {departements && departements.length > 0 && (
          <select
            value={departementId}
            onChange={(e) => setDepartementId(e.target.value)}
            className="mb-4 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          >
            <option value="">Tous les membres</option>
            {departements.map((d) => <option key={d.id} value={d.id}>{d.nom}</option>)}
          </select>
        )}

        {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}

        {!donnees ? (
          <div className="flex items-center gap-2 text-ink-700/60 py-6"><Loader2 className="animate-spin" size={16} /> Chargement...</div>
        ) : donnees.length === 0 ? (
          <p className="text-sm text-ink-700/50 py-6 text-center">Aucun membre dans ce périmètre.</p>
        ) : (
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {donnees.map((p) => {
              const s = styleStatut[p.statut]
              const Icon = s.icon
              return (
                <div key={p.membreId} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-parchment-50">
                  <span className="text-sm text-ink-950">{p.nom}</span>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full font-mono ${s.couleur}`}>
                    <Icon size={12} /> {s.label}{p.raison ? ` — ${p.raison}` : ''}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
