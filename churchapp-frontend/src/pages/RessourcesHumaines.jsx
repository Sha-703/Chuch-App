import { useEffect, useState } from 'react'
import { Plus, Search, Loader2, X, KeyRound, Users2, Pencil, Trash2 } from 'lucide-react'
import Layout from '../components/Layout'
import Pagination, { paginer } from '../components/Pagination'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'

const onglets = [
  { key: 'membres', label: 'Membres' },
  { key: 'departements', label: 'Départements' },
]

export default function RessourcesHumaines() {
  const [onglet, setOnglet] = useState('membres')

  return (
    <Layout title="Ressources Humaines" subtitle="Membres, départements, chefs et ouvriers de l'église">
      <div className="flex gap-1 bg-parchment-200/60 rounded-lg p-1 mb-6 w-fit">
        {onglets.map((o) => (
          <button
            key={o.key}
            onClick={() => setOnglet(o.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              onglet === o.key ? 'bg-white shadow-sm text-ink-950' : 'text-ink-700/60'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {onglet === 'membres' ? <OngletMembres /> : <OngletDepartements />}
    </Layout>
  )
}

// ---------------------------------------------------------------------------
// Onglet Membres
// ---------------------------------------------------------------------------

function OngletMembres() {
  const { showToast } = useToast()
  const [membres, setMembres] = useState(null)
  const [erreur, setErreur] = useState('')
  const [recherche, setRecherche] = useState('')
  const [modalOuvert, setModalOuvert] = useState(false)
  const [modalCompte, setModalCompte] = useState(null) // membre sélectionné pour créer un accès
  const [page, setPage] = useState(1)

  function recharger() {
    api.listerMembres().then(setMembres).catch((err) => setErreur(err.message))
  }

  useEffect(recharger, [])

  if (erreur) return <p className="text-clay-600">{erreur}</p>
  if (!membres) {
    return <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
  }

  const filtres = membres.filter((m) => m.nom.toLowerCase().includes(recherche.toLowerCase()))

  return (
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
            <th className="px-6 py-3 font-semibold text-right">Accès</th>
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
              <td className="px-6 py-3.5 text-right">
                {m.compte ? (
                  <span className="text-xs text-leaf-700 font-medium">{m.compte.email}</span>
                ) : (
                  <button
                    onClick={() => setModalCompte(m)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 hover:underline whitespace-nowrap"
                  >
                    <KeyRound size={12} /> Donner un accès
                  </button>
                )}
              </td>
            </tr>
          ))}
          {filtres.length === 0 && (
            <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-ink-700/50">Aucun membre trouvé.</td></tr>
          )}
        </tbody>
      </table>
      <Pagination page={page} setPage={setPage} total={filtres.length} />

      {modalOuvert && (
        <ModalMembre
          onClose={() => setModalOuvert(false)}
          onSaved={() => { setModalOuvert(false); recharger(); showToast('Membre ajouté avec succès.') }}
        />
      )}
      {modalCompte && (
        <ModalCompteOuvrier
          membre={modalCompte}
          onClose={() => setModalCompte(null)}
          onSaved={() => { recharger() }}
        />
      )}
    </div>
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
    <ModalShell titre="Ajouter un membre" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Champ label="Nom complet" required value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} placeholder="Ex. Fam. Nsimba" />
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Rôle</label>
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className={champClasses}
          >
            {['Membre', 'Diacre', 'Ancien', 'Administrateur'].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <Champ label="Contact" value={form.contact} onChange={(v) => setForm({ ...form, contact: v })} placeholder="+243 8xx xxx xxx" />
        <Champ label="Membre depuis" value={form.depuis} onChange={(v) => setForm({ ...form, depuis: v })} placeholder="2024" />
        {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}
        <BoutonSubmit chargement={chargement} />
      </form>
    </ModalShell>
  )
}

function ModalCompteOuvrier({ membre, onClose, onSaved }) {
  const [email, setEmail] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [resultat, setResultat] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      const data = await api.creerCompteOuvrier(membre.id, email)
      setResultat(data)
      onSaved()
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  if (resultat) {
    return (
      <ModalShell titre="Accès créé" onClose={onClose}>
        <p className="text-sm text-ink-700/70 mb-4">
          {membre.nom} peut maintenant se connecter à ChurchApp pour signer sa présence aux cultes.
        </p>
        <div className="bg-parchment-100 rounded-lg p-4 text-sm space-y-1">
          <p><span className="text-ink-700/60">E-mail :</span> {resultat.email}</p>
          <p><span className="text-ink-700/60">Code OTP (à saisir comme mot de passe à la première connexion) :</span> <span className="font-mono">{resultat.otp}</span></p>
        </div>
        <button onClick={onClose} className="w-full mt-4 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900">
          Fermer
        </button>
      </ModalShell>
    )
  }

  return (
    <ModalShell titre={`Donner un accès à ${membre.nom}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <p className="text-xs text-ink-700/60 bg-parchment-100 rounded-lg p-3">
          Ce membre pourra se connecter avec des droits limités : il verra uniquement ses cultes pour signer sa présence.
        </p>
        <Champ label="E-mail de connexion" type="email" required value={email} onChange={setEmail} placeholder="ouvrier@exemple.cd" />
        {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}
        <BoutonSubmit chargement={chargement} label="Créer l'accès" />
      </form>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// Onglet Départements
// ---------------------------------------------------------------------------

function OngletDepartements() {
  const { showToast } = useToast()
  const [departements, setDepartements] = useState(null)
  const [membres, setMembres] = useState(null)
  const [erreur, setErreur] = useState('')
  const [modalOuvert, setModalOuvert] = useState(false)
  const [departementEnEdition, setDepartementEnEdition] = useState(null)

  function recharger() {
    Promise.all([api.listerDepartements(), api.listerMembres()])
      .then(([d, m]) => { setDepartements(d); setMembres(m) })
      .catch((err) => setErreur(err.message))
  }

  useEffect(recharger, [])

  async function supprimer(departement) {
    if (!window.confirm(`Supprimer le département "${departement.nom}" ? Cette action est irréversible.`)) return
    try {
      await api.supprimerDepartement(departement.id)
      showToast('Département supprimé.')
      recharger()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  if (erreur) return <p className="text-clay-600">{erreur}</p>
  if (!departements || !membres) {
    return <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
  }

  return (
    <div>
      <div className="flex justify-end mb-5">
        <button
          onClick={() => setModalOuvert(true)}
          className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-ink-900 transition-colors"
        >
          <Plus size={16} /> Nouveau département
        </button>
      </div>

      {departements.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-ink-700/50 text-sm">
          Aucun département créé pour l'instant.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {departements.map((d) => (
            <div key={d.id} className="bg-white rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Users2 size={16} className="text-gold-600" />
                  <h3 className="font-display text-lg text-ink-950">{d.nom}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setDepartementEnEdition(d)}
                    className="text-xs font-semibold text-gold-700 hover:underline inline-flex items-center gap-1"
                  >
                    <Pencil size={12} /> Modifier
                  </button>
                  <button
                    onClick={() => supprimer(d)}
                    className="text-ink-700/40 hover:text-clay-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {d.description && <p className="text-sm text-ink-700/60 mb-3">{d.description}</p>}
              <div className="woven-rule w-12 mb-3" />
              <p className="text-xs text-ink-700/50 font-mono uppercase tracking-wide mb-1">Chef</p>
              <p className="text-sm text-ink-800 mb-3">{d.chef?.nom || '—'}</p>
              <p className="text-xs text-ink-700/50 font-mono uppercase tracking-wide mb-1">
                Ouvriers ({d.ouvriers?.length || 0})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(d.ouvriers || []).map((o) => (
                  <span key={o.id} className="text-xs bg-parchment-100 text-ink-800 px-2 py-0.5 rounded-full">
                    {o.nom}
                  </span>
                ))}
                {(!d.ouvriers || d.ouvriers.length === 0) && <span className="text-xs text-ink-700/40">Aucun ouvrier assigné</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOuvert && (
        <ModalDepartement
          membres={membres}
          onClose={() => setModalOuvert(false)}
          onSaved={() => { setModalOuvert(false); recharger(); showToast('Département créé avec succès.') }}
        />
      )}
      {departementEnEdition && (
        <ModalDepartement
          membres={membres}
          departement={departementEnEdition}
          onClose={() => setDepartementEnEdition(null)}
          onSaved={() => { setDepartementEnEdition(null); recharger(); showToast('Département modifié avec succès.') }}
        />
      )}
    </div>
  )
}

function ModalDepartement({ membres, departement, onClose, onSaved }) {
  const estEdition = !!departement
  const [nom, setNom] = useState(departement?.nom || '')
  const [description, setDescription] = useState(departement?.description || '')
  const [chefMembreId, setChefMembreId] = useState(departement?.chefMembreId || departement?.chef?.id || '')
  const [ouvrierIds, setOuvrierIds] = useState((departement?.ouvriers || []).map((o) => o.id))
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  function toggleOuvrier(id) {
    setOuvrierIds((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      const payload = { nom, description, chefMembreId: chefMembreId || null, ouvrierIds }
      if (estEdition) await api.modifierDepartement(departement.id, payload)
      else await api.creerDepartement(payload)
      onSaved()
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <ModalShell titre={estEdition ? `Modifier ${departement.nom}` : 'Nouveau département'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Champ label="Nom du département" required value={nom} onChange={setNom} placeholder="Ex. Chorale" />
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Rôle et mission du département..."
            className={champClasses}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Chef de département</label>
          <select value={chefMembreId} onChange={(e) => setChefMembreId(e.target.value)} className={champClasses}>
            <option value="">— Choisir un membre —</option>
            {membres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Ouvriers du département</label>
          <div className="mt-1.5 max-h-40 overflow-y-auto border border-ink-950/15 rounded-lg divide-y divide-ink-950/5">
            {membres.map((m) => (
              <label key={m.id} className="flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer hover:bg-parchment-50">
                <input
                  type="checkbox"
                  checked={ouvrierIds.includes(m.id)}
                  onChange={() => toggleOuvrier(m.id)}
                  className="rounded border-ink-950/30 text-gold-600 focus:ring-gold-500/50"
                />
                {m.nom}
              </label>
            ))}
          </div>
        </div>
        {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}
        <BoutonSubmit chargement={chargement} label={estEdition ? "Enregistrer les modifications" : "Enregistrer"} />
      </form>
    </ModalShell>
  )
}

// ---------------------------------------------------------------------------
// Composants partagés
// ---------------------------------------------------------------------------

const champClasses = "mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"

function Champ({ label, type = 'text', placeholder, value, onChange, required }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">{label}</label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={champClasses}
      />
    </div>
  )
}

function ModalShell({ titre, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-ink-950/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-sm p-6 my-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg text-ink-950">{titre}</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function BoutonSubmit({ chargement, label = 'Enregistrer' }) {
  return (
    <button
      type="submit"
      disabled={chargement}
      className="w-full flex items-center justify-center gap-2 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900 transition-colors disabled:opacity-60 mt-2"
    >
      {chargement ? <Loader2 size={16} className="animate-spin" /> : label}
    </button>
  )
}
