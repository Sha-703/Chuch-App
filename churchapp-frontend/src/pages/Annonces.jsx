import { useEffect, useState } from 'react'
import { Plus, Megaphone, Church, X, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

export default function Annonces() {
  const { showToast } = useToast()
  const { utilisateur, eglise } = useAuth()
  const [annonces, setAnnonces] = useState(null)
  const [erreur, setErreur] = useState('')
  const [modalOuvert, setModalOuvert] = useState(false)

  function recharger() {
    api.listerAnnonces().then(setAnnonces).catch((err) => setErreur(err.message))
  }

  useEffect(recharger, [])

  async function supprimer(a) {
    if (!window.confirm(`Supprimer l'annonce "${a.titre}" ?`)) return
    try {
      await api.supprimerAnnonce(a.id)
      showToast('Annonce supprimée.')
      recharger()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  if (erreur) return <Layout title="Annonces"><p className="text-clay-600">{erreur}</p></Layout>

  const peutPublier = ['pasteur', 'administrateur'].includes(utilisateur?.role)

  return (
    <Layout title="Annonces" subtitle="Mur public du réseau ChurchApp + annonces internes aux ouvriers de votre église">
      <div className="flex justify-end mb-5">
        {peutPublier ? (
          <button
            onClick={() => setModalOuvert(true)}
            className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-ink-900 transition-colors"
          >
            <Plus size={16} /> Publier une annonce
          </button>
        ) : (
          <p className="text-xs text-ink-700/50">La publication est réservée au pasteur et à l'administrateur.</p>
        )}
      </div>

      {!annonces ? (
        <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
      ) : annonces.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-ink-700/50 text-sm">
          Aucune annonce publiée pour l'instant sur le réseau.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {annonces.map((a) => (
            <article key={a.id} className="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col">
              {a.photoUrl ? (
                <img src={a.photoUrl} alt={a.titre} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 bg-ink-950 flex items-center justify-center">
                  <Megaphone className="text-gold-500" size={28} strokeWidth={1.5} />
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-display text-lg text-ink-950">{a.titre}</h3>
                  {a.portee === 'ouvriers' && (
                    <span className="shrink-0 inline-block px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-700 text-[11px] font-semibold font-mono">
                      Interne ouvriers
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink-700/70 flex-1 mb-4 line-clamp-4">{a.contenu}</p>
                <div className="woven-rule mb-3" />
                <div className="flex items-center justify-between text-xs text-ink-700/50">
                  <span className="inline-flex items-center gap-1.5 font-medium text-ink-800">
                    <Church size={12} /> {a.Eglise?.nom}
                  </span>
                  <span>Jusqu'au {a.dateFin}</span>
                </div>
                {(a.egliseId === (utilisateur?.egliseId || eglise?.id)) && (
                  <button
                    onClick={() => supprimer(a)}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-700/50 hover:text-clay-600 self-start"
                  >
                    <Trash2 size={13} /> Supprimer
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOuvert && (
        <ModalAnnonce
          onClose={() => setModalOuvert(false)}
          onSaved={() => { setModalOuvert(false); recharger(); showToast('Annonce publiée avec succès.') }}
        />
      )}
    </Layout>
  )
}

function ModalAnnonce({ onClose, onSaved }) {
  const [titre, setTitre] = useState('')
  const [contenu, setContenu] = useState('')
  const [photo, setPhoto] = useState(null)
  const [portee, setPortee] = useState('reseau')
  const aujourdHui = new Date().toISOString().slice(0, 10)
  const dansUneSemaine = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [dateDebut, setDateDebut] = useState(aujourdHui)
  const [dateFin, setDateFin] = useState(dansUneSemaine)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (dateFin < dateDebut) return setErreur('La date de fin doit être après la date de début.')
    setChargement(true)
    setErreur('')
    try {
      const fd = new FormData()
      fd.append('titre', titre)
      fd.append('contenu', contenu)
      fd.append('dateDebut', dateDebut)
      fd.append('dateFin', dateFin)
      fd.append('portee', portee)
      if (photo) fd.append('photo', photo)
      await api.creerAnnonce(fd)
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
          <h3 className="font-display text-lg text-ink-950">Publier une annonce</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <div className="mb-4">
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Portée de l'annonce</label>
          <select
            value={portee}
            onChange={(e) => setPortee(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          >
            <option value="reseau">Tout le réseau ChurchApp — toutes les églises</option>
            <option value="ouvriers">Ouvriers de mon église — interne uniquement</option>
          </select>
          <p className="text-[11px] text-ink-700/50 mt-1.5">
            {portee === 'reseau'
              ? 'Visible par toutes les églises inscrites sur ChurchApp, jusqu\'à la date de fin.'
              : 'Restera strictement dans votre église : visible par le pasteur, l\'administrateur, les ouvriers et les chefs de département — jamais par les autres églises.'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Titre</label>
            <input
              required
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Ex. Conférence annuelle 2026"
              className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Contenu</label>
            <textarea
              required
              rows={4}
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
              placeholder="Détails de l'annonce..."
              className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Date de début</label>
              <input
                type="date"
                required
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Date de fin</label>
              <input
                type="date"
                required
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60 flex items-center gap-1.5">
              <ImageIcon size={13} /> Photo (optionnel)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files[0])}
              className="mt-1.5 w-full text-sm text-ink-700/70 file:mr-3 file:py-2 file:px-3.5 file:rounded-lg file:border-0 file:bg-ink-950 file:text-parchment-50 file:text-sm file:font-semibold"
            />
          </div>
          {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}
          <button
            type="submit"
            disabled={chargement}
            className="w-full flex items-center justify-center gap-2 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900 transition-colors disabled:opacity-60 mt-2"
          >
            {chargement ? <Loader2 size={16} className="animate-spin" /> : 'Publier'}
          </button>
        </form>
      </div>
    </div>
  )
}
