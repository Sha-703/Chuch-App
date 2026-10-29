import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Loader2, Moon, Sun, Settings, Users2, Plus, Trash2, X } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import { formatFC } from '../lib/mockData'
import AnnoncesEspace from '../components/AnnoncesEspace'

const onglets = ['Mon équipe', 'Mes finances', 'Annonces']

export default function MonDepartement() {
  const { utilisateur, eglise, logout } = useAuth()
  const { showToast } = useToast()
  const { sombre, toggle } = useTheme()
  const [onglet, setOnglet] = useState('Mon équipe')
  const [departement, setDepartement] = useState(null)
  const [erreur, setErreur] = useState('')

  function recharger() {
    api.monDepartement().then(setDepartement).catch((err) => setErreur(err.message))
  }

  useEffect(recharger, [])

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
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-full bg-ink-950 text-gold-500 font-display flex items-center justify-center">
            {utilisateur?.nom?.[0] || '?'}
          </div>
          <div>
            <p className="font-display text-xl text-ink-950">{utilisateur?.nom}</p>
            <p className="text-xs text-ink-700/60">Espace chef de département</p>
          </div>
        </div>

        {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2 mb-4">{erreur}</p>}

        {!departement ? (
          <div className="flex items-center gap-2 text-ink-700/60">
            <Loader2 className="animate-spin" size={18} /> Chargement...
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-card p-5 mb-5">
              <div className="flex items-center gap-2 mb-1">
                <Users2 size={17} className="text-gold-600" />
                <h2 className="font-display text-lg text-ink-950">{departement.nom}</h2>
              </div>
              {departement.description && <p className="text-sm text-ink-700/60">{departement.description}</p>}
            </div>

            <div className="flex gap-1 bg-parchment-200/60 rounded-lg p-1 mb-5 w-fit">
              {onglets.map((o) => (
                <button
                  key={o}
                  onClick={() => setOnglet(o)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    onglet === o ? 'bg-white shadow-sm text-ink-950' : 'text-ink-700/60'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>

            {onglet === 'Mon équipe' && (
              <OngletEquipe departement={departement} onChanged={recharger} showToast={showToast} />
            )}
            {onglet === 'Mes finances' && (
              <OngletFinances departement={departement} showToast={showToast} />
            )}
            {onglet === 'Annonces' && <AnnoncesEspace />}
          </>
        )}
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Onglet équipe : ouvriers du département, ajout / retrait
// ---------------------------------------------------------------------------

function OngletEquipe({ departement, onChanged, showToast }) {
  const [tousMembres, setTousMembres] = useState(null)
  const [ajoutOuvert, setAjoutOuvert] = useState(false)

  useEffect(() => {
    api.listerMembres().then(setTousMembres).catch(() => setTousMembres([]))
  }, [])

  const ouvriers = departement.ouvriers || []

  async function retirer(membre) {
    const suivants = ouvriers.filter((o) => o.id !== membre.id).map((o) => o.id)
    try {
      await api.majMesOuvriers(suivants)
      showToast(`${membre.nom} retiré du département.`)
      onChanged()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  async function ajouter(ids) {
    try {
      await api.majMesOuvriers([...ouvriers.map((o) => o.id), ...ids])
      showToast('Ouvriers ajoutés au département.')
      setAjoutOuvert(false)
      onChanged()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const disponibles = (tousMembres || []).filter((m) => !ouvriers.some((o) => o.id === m.id))

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-4">
        <h3 className="font-display text-base text-ink-950">Ouvriers ({ouvriers.length})</h3>
        <button
          onClick={() => setAjoutOuvert(true)}
          className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-ink-900"
        >
          <Plus size={15} /> Ajouter un ouvrier
        </button>
      </div>
      <div className="woven-rule mx-5 mt-4" />
      {ouvriers.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-ink-700/50">Aucun ouvrier assigné à votre département.</p>
      ) : (
        <ul className="divide-y divide-ink-950/5">
          {ouvriers.map((o) => (
            <li key={o.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-ink-950">{o.nom}</p>
                <p className="text-xs text-ink-700/50">{o.role || 'Ouvrier'}{o.contact ? ` · ${o.contact}` : ''}</p>
              </div>
              <button
                onClick={() => retirer(o)}
                className="text-ink-700/40 hover:text-clay-600"
                aria-label="Retirer"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {ajoutOuvert && (
        <ModalAjoutMembres
          membres={disponibles}
          onClose={() => setAjoutOuvert(false)}
          onConfirm={ajouter}
        />
      )}
    </div>
  )
}

function ModalAjoutMembres({ membres, onClose, onConfirm }) {
  const [selection, setSelection] = useState([])
  const [recherche, setRecherche] = useState('')

  function toggle(id) {
    setSelection((ids) => (ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]))
  }

  const filtres = membres.filter((m) => m.nom.toLowerCase().includes(recherche.toLowerCase()))

  return (
    <div className="fixed inset-0 bg-ink-950/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-ink-950">Ajouter des ouvriers</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <input
          placeholder="Rechercher..."
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          className="w-full rounded-lg border border-ink-950/15 bg-parchment-50 px-3.5 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
        />
        <div className="space-y-1 max-h-64 overflow-y-auto mb-4">
          {filtres.length === 0 && <p className="text-sm text-ink-700/50 py-4 text-center">Aucun membre disponible.</p>}
          {filtres.map((m) => (
            <label key={m.id} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-parchment-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selection.includes(m.id)}
                onChange={() => toggle(m.id)}
                className="accent-gold-600"
              />
              <span className="text-sm text-ink-950">{m.nom}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-ink-950/15 text-ink-800 rounded-lg py-2.5 text-sm font-semibold hover:border-gold-500/60"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(selection)}
            disabled={selection.length === 0}
            className="flex-1 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900 disabled:opacity-50"
          >
            Ajouter ({selection.length})
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Onglet finances : entrées / charges DÉDIÉES au département
// ---------------------------------------------------------------------------

function OngletFinances({ departement, showToast }) {
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

  if (erreur) return <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>
  if (!donnees) {
    return <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-ink-700/60 font-semibold mb-1">Entrées</p>
          <p className="font-display text-xl text-leaf-600 font-tabular">{formatFC(donnees.totalEntrees)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-ink-700/60 font-semibold mb-1">Charges</p>
          <p className="font-display text-xl text-clay-600 font-tabular">{formatFC(donnees.totalCharges)}</p>
        </div>
        <div className="bg-ink-950 rounded-2xl shadow-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-ink-600 font-semibold mb-1">Solde</p>
          <p className="font-display text-xl text-gold-500 font-tabular">{formatFC(donnees.solde)}</p>
        </div>
      </div>

      <div className="flex justify-end gap-2 mb-4">
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

      <div className="space-y-5">
        <ListeFinance titre="Entrées" items={donnees.entrees} type="Entrées" signe="+" couleur="text-leaf-600" onSupprimer={supprimer} />
        <ListeFinance titre="Charges" items={donnees.charges} type="Charges" signe="-" couleur="text-clay-600" onSupprimer={supprimer} />
      </div>

      {modal && (
        <FormulaireFinance
          type={modal}
          departementId={departement.id}
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

function ListeFinance({ titre, items, type, signe, couleur, onSupprimer }) {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/60 px-5 pt-4 pb-2">
        {titre} ({items.length})
      </p>
      <div className="woven-rule mx-5" />
      {items.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm text-ink-700/50">Aucun élément.</p>
      ) : (
        <ul className="divide-y divide-ink-950/5">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-5 py-3">
              <div className="text-sm">
                <span className="text-ink-950 font-medium">{type === 'Entrées' ? item.type : item.categorie}</span>
                <span className="text-ink-700/50 text-xs ml-2">{item.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-tabular font-semibold ${couleur}`}>{signe}{formatFC(item.montant)}</span>
                <button onClick={() => onSupprimer(type, item)} className="text-ink-700/40 hover:text-clay-600" aria-label="Supprimer">
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

function FormulaireFinance({ type, departementId, onClose, onSaved }) {
  const estEntree = type === 'Entrées'
  const [form, setForm] = useState(
    estEntree
      ? { type: 'Offrande', provenance: '', montant: '', date: new Date().toISOString().slice(0, 10) }
      : { categorie: '', montant: '', date: new Date().toISOString().slice(0, 10) }
  )
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      const payload = { ...form, montant: parseFloat(form.montant) }
      if (estEntree) await api.creerEntreeDepartement(departementId, payload)
      else await api.creerChargeDepartement(departementId, payload)
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
          <h3 className="font-display text-lg text-ink-950">{estEntree ? 'Nouvelle entrée' : 'Nouvelle charge'}</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {estEntree ? (
            <>
              <Champ label="Type">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={styleChamp}>
                  {['Offrande', 'Dîme', 'Don spécial', 'Autre'].map((o) => <option key={o}>{o}</option>)}
                </select>
              </Champ>
              <Champ label="Provenance">
                <input value={form.provenance} onChange={(e) => setForm({ ...form, provenance: e.target.value })} placeholder="Ex. Collecte du dimanche" className={styleChamp} />
              </Champ>
            </>
          ) : (
            <Champ label="Catégorie" required>
              <input value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })} placeholder="Ex. Transport" className={styleChamp} required />
            </Champ>
          )}
          <Champ label="Montant (FC)" required>
            <input type="number" min="0" step="any" value={form.montant} onChange={(e) => setForm({ ...form, montant: e.target.value })} className={styleChamp} required />
          </Champ>
          <Champ label="Date" required>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={styleChamp} required />
          </Champ>

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

const styleChamp =
  'mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500'

function Champ({ label, children }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">{label}</label>
      {children}
    </div>
  )
}
