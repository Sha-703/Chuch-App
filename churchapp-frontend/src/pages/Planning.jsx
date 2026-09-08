import { useEffect, useState } from 'react'
import {
  Plus, Calendar, List, Bell, Repeat, User, Loader2, X, Trash2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'

const NOMS_TRIMESTRE = { 1: 'T1 · Janvier-Mars', 2: 'T2 · Avril-Juin', 3: 'T3 · Juillet-Septembre', 4: 'T4 · Octobre-Décembre' }

function trimestreDeMois(mois) {
  return Math.ceil((mois + 1) / 3)
}

export default function Planning() {
  const { showToast } = useToast()
  const [vue, setVue] = useState('liste') // 'liste' | 'calendrier'
  const [annee, setAnnee] = useState(new Date().getFullYear())
  const [trimestre, setTrimestre] = useState(trimestreDeMois(new Date().getMonth()))
  const [evenements, setEvenements] = useState(null)
  const [erreur, setErreur] = useState('')
  const [modalOuvert, setModalOuvert] = useState(false)

  function recharger() {
    api.listerEvenements({ annee })
      .then(setEvenements)
      .catch((err) => setErreur(err.message))
  }

  useEffect(() => { setEvenements(null); recharger() }, [annee])

  async function supprimer(id) {
    try {
      await api.supprimerEvenement(id)
      showToast('Événement supprimé.')
      recharger()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  if (erreur) return <Layout title="Planning"><p className="text-clay-600">{erreur}</p></Layout>

  const evenementsTrimestre = evenements?.filter((e) => e.trimestre === trimestre) || []

  return (
    <Layout title="Planning" subtitle="Activités de l'église, par trimestre, avec rappels">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <select
            value={annee}
            onChange={(e) => setAnnee(Number(e.target.value))}
            className="rounded-lg border border-ink-950/15 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          >
            {[annee - 1, annee, annee + 1].map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <div className="flex gap-1 bg-parchment-200/60 rounded-lg p-1">
            <button
              onClick={() => setVue('liste')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${vue === 'liste' ? 'bg-white shadow-sm text-ink-950' : 'text-ink-700/60'}`}
            >
              <List size={14} /> Liste
            </button>
            <button
              onClick={() => setVue('calendrier')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${vue === 'calendrier' ? 'bg-white shadow-sm text-ink-950' : 'text-ink-700/60'}`}
            >
              <Calendar size={14} /> Calendrier
            </button>
          </div>
        </div>
        <button
          onClick={() => setModalOuvert(true)}
          className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-ink-900 transition-colors"
        >
          <Plus size={16} /> Nouvel événement
        </button>
      </div>

      {!evenements ? (
        <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
      ) : vue === 'liste' ? (
        <>
          <div className="flex gap-1 bg-white rounded-lg p-1 mb-5 w-fit shadow-card">
            {[1, 2, 3, 4].map((t) => (
              <button
                key={t}
                onClick={() => setTrimestre(t)}
                className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  trimestre === t ? 'bg-ink-950 text-gold-500' : 'text-ink-700/60'
                }`}
              >
                T{t}
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-700/50 font-mono uppercase tracking-wide mb-3">{NOMS_TRIMESTRE[trimestre]}</p>

          {evenementsTrimestre.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-card p-10 text-center text-ink-700/50 text-sm">
              Aucun événement prévu pour ce trimestre.
            </div>
          ) : (
            <div className="space-y-3">
              {evenementsTrimestre.map((e) => (
                <CarteEvenement key={e.id} evenement={e} onSupprimer={() => supprimer(e.id)} />
              ))}
            </div>
          )}
        </>
      ) : (
        <VueCalendrier evenements={evenements} annee={annee} onSupprimer={supprimer} />
      )}

      {modalOuvert && (
        <ModalEvenement
          onClose={() => setModalOuvert(false)}
          onSaved={() => { setModalOuvert(false); recharger(); showToast('Événement enregistré.') }}
        />
      )}
    </Layout>
  )
}

function CarteEvenement({ evenement: e, onSupprimer }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-ink-950 text-sm">{e.titre}</p>
          {e.recurrence === 'trimestrielle' && (
            <span className="inline-flex items-center gap-1 text-xs font-mono text-gold-700 bg-gold-500/10 px-2 py-0.5 rounded-full">
              <Repeat size={11} /> Trimestriel
            </span>
          )}
          {e.rappelActif && (
            <span className="inline-flex items-center gap-1 text-xs font-mono text-ink-700 bg-ink-950/5 px-2 py-0.5 rounded-full">
              <Bell size={11} /> Rappel programmé
            </span>
          )}
        </div>
        {e.description && <p className="text-sm text-ink-700/60 mt-1">{e.description}</p>}
        <div className="flex items-center gap-3 mt-2 text-xs text-ink-700/60 font-mono">
          <span>{e.date}{e.heure ? ` · ${e.heure}` : ''}</span>
          {(e.responsable?.nom || e.responsableLibre) && (
            <span className="inline-flex items-center gap-1"><User size={11} /> {e.responsable?.nom || e.responsableLibre}</span>
          )}
        </div>
      </div>
      <button onClick={onSupprimer} className="text-ink-700/40 hover:text-clay-600 shrink-0" aria-label="Supprimer">
        <Trash2 size={15} />
      </button>
    </div>
  )
}

function VueCalendrier({ evenements, annee, onSupprimer }) {
  const [mois, setMois] = useState(new Date().getFullYear() === annee ? new Date().getMonth() : 0)
  const [jourSelectionne, setJourSelectionne] = useState(null)

  const premierJour = new Date(annee, mois, 1)
  const decalage = (premierJour.getDay() + 6) % 7 // lundi = 0
  const nbJours = new Date(annee, mois + 1, 0).getDate()

  const evenementsParJour = {}
  evenements.forEach((e) => {
    const [a, m, j] = e.date.split('-').map(Number)
    if (a === annee && m - 1 === mois) {
      evenementsParJour[j] = evenementsParJour[j] || []
      evenementsParJour[j].push(e)
    }
  })

  const nomMois = new Date(annee, mois, 1).toLocaleDateString('fr-FR', { month: 'long' })

  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setMois((m) => Math.max(0, m - 1))} className="p-1.5 hover:bg-parchment-100 rounded-lg" disabled={mois === 0}>
          <ChevronLeft size={18} className={mois === 0 ? 'text-ink-700/20' : 'text-ink-800'} />
        </button>
        <p className="font-display text-lg text-ink-950 capitalize">{nomMois} {annee}</p>
        <button onClick={() => setMois((m) => Math.min(11, m + 1))} className="p-1.5 hover:bg-parchment-100 rounded-lg" disabled={mois === 11}>
          <ChevronRight size={18} className={mois === 11 ? 'text-ink-700/20' : 'text-ink-800'} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono text-ink-700/50 uppercase mb-2">
        {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((j) => <div key={j}>{j}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: decalage }).map((_, i) => <div key={`vide-${i}`} />)}
        {Array.from({ length: nbJours }, (_, i) => i + 1).map((jour) => {
          const evenementsJour = evenementsParJour[jour] || []
          const estSelectionne = jourSelectionne === jour
          return (
            <button
              key={jour}
              onClick={() => setJourSelectionne(estSelectionne ? null : jour)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-colors ${
                estSelectionne ? 'bg-ink-950 text-parchment-50' : 'hover:bg-parchment-100 text-ink-800'
              }`}
            >
              {jour}
              {evenementsJour.length > 0 && (
                <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${estSelectionne ? 'bg-gold-500' : 'bg-gold-500'}`} />
              )}
            </button>
          )
        })}
      </div>

      {jourSelectionne && (
        <div className="mt-4 pt-4 border-t border-ink-950/5 space-y-2">
          {(evenementsParJour[jourSelectionne] || []).length === 0 ? (
            <p className="text-sm text-ink-700/50">Aucun événement ce jour.</p>
          ) : (
            evenementsParJour[jourSelectionne].map((e) => (
              <CarteEvenement key={e.id} evenement={e} onSupprimer={() => onSupprimer(e.id)} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function ModalEvenement({ onClose, onSaved }) {
  const [membres, setMembres] = useState([])
  const [titre, setTitre] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [heure, setHeure] = useState('')
  const [responsableMembreId, setResponsableMembreId] = useState('')
  const [responsableLibre, setResponsableLibre] = useState('')
  const [rappelActif, setRappelActif] = useState(false)
  const [rappelDate, setRappelDate] = useState('')
  const [recurrence, setRecurrence] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => { api.listerMembres().then(setMembres).catch(() => {}) }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      await api.creerEvenement({
        titre,
        description,
        date,
        heure: heure || null,
        responsableMembreId: responsableMembreId || null,
        responsableLibre: responsableMembreId ? null : responsableLibre,
        rappelActif,
        rappelDate: rappelActif ? rappelDate : null,
        recurrence: recurrence ? 'trimestrielle' : 'aucune',
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
      <div className="bg-white rounded-2xl shadow-card w-full max-w-md p-6 my-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg text-ink-950">Nouvel événement</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Champ label="Titre" required value={titre} onChange={setTitre} placeholder="Ex. Réunion des chefs de départements" />
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={champClasses} placeholder="Détails de l'activité..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Champ label="Date" type="date" required value={date} onChange={setDate} />
            <Champ label="Heure (optionnel)" type="time" value={heure} onChange={setHeure} />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Responsable</label>
            <select value={responsableMembreId} onChange={(e) => setResponsableMembreId(e.target.value)} className={champClasses}>
              <option value="">— Choisir un membre —</option>
              {membres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
            </select>
            {!responsableMembreId && (
              <input
                value={responsableLibre}
                onChange={(e) => setResponsableLibre(e.target.value)}
                placeholder="Ou tapez un nom libre..."
                className={`${champClasses} mt-2`}
              />
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-800 cursor-pointer">
            <input type="checkbox" checked={recurrence} onChange={(e) => setRecurrence(e.target.checked)} className="rounded border-ink-950/30 text-gold-600 focus:ring-gold-500/50" />
            Répéter tous les trimestres (crée 4 occurrences sur un an)
          </label>

          <label className="flex items-center gap-2 text-sm text-ink-800 cursor-pointer">
            <input type="checkbox" checked={rappelActif} onChange={(e) => setRappelActif(e.target.checked)} className="rounded border-ink-950/30 text-gold-600 focus:ring-gold-500/50" />
            Activer un rappel
          </label>
          {rappelActif && (
            <div>
              <Champ label="Date et heure du rappel" type="datetime-local" required value={rappelDate} onChange={setRappelDate} />
              <p className="text-xs text-ink-700/50 mt-1.5">
                Le rappel s'affiche dans l'application (tableau de bord). Pas d'envoi de SMS ou e-mail pour l'instant.
              </p>
            </div>
          )}

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
