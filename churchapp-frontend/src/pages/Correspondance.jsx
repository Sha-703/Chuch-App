import { useEffect, useState } from 'react'
import {
  Plus, FileText, Upload, Send, CheckCircle2, Archive, AlertTriangle, Loader2, X, Paperclip, Camera, FileUp,
} from 'lucide-react'
import Layout from '../components/Layout'
import Pagination, { paginer } from '../components/Pagination'
import CameraCapture from '../components/CameraCapture'
import { api } from '../lib/api'
import { useToast } from '../context/ToastContext'

const onglets = [
  { key: 'toutes', label: 'Toutes', params: {} },
  { key: 'entrant', label: 'Entrantes', params: { etat: 'entrant' } },
  { key: 'en_traitement', label: 'En traitement', params: { etat: 'en_traitement' } },
  { key: 'sortie', label: 'Sortie', params: { sens: 'sortante' } },
  { key: 'archive', label: 'Archivées', params: { etat: 'archive' } },
]

const badgeEtat = {
  entrant: 'bg-clay-500/10 text-clay-700',
  en_traitement: 'bg-gold-500/10 text-gold-700',
  archive: 'bg-leaf-500/10 text-leaf-700',
}
const labelEtat = { entrant: 'Entrant', en_traitement: 'En traitement', archive: 'Archivé' }

export default function Correspondance() {
  const { showToast } = useToast()
  const [toutes, setToutes] = useState(null)
  const [onglet, setOnglet] = useState('toutes')
  const [erreur, setErreur] = useState('')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null) // 'physique' | 'numerique' | null

  function recharger() {
    api.listerCorrespondances()
      .then(setToutes)
      .catch((err) => setErreur(err.message))
  }

  useEffect(recharger, [])

  function correspondPourOnglet(c, key) {
    if (key === 'toutes') return true
    if (key === 'sortie') return c.sens === 'sortante'
    return c.etat === key
  }

  const correspondances = toutes ? toutes.filter((c) => correspondPourOnglet(c, onglet)) : null
  const nbEnRetard = toutes ? toutes.filter((c) => c.enRetard).length : 0
  const compteurs = toutes
    ? Object.fromEntries(onglets.map((o) => [o.key, toutes.filter((c) => correspondPourOnglet(c, o.key)).length]))
    : {}

  async function handleAction(id, action) {
    try {
      if (action === 'accuse') {
        await api.envoyerAccuse(id)
        showToast('Accusé de réception envoyé.')
      } else {
        await api.changerEtatCorrespondance(id, action)
        showToast(action === 'archive' ? 'Correspondance archivée.' : 'Marquée en traitement.')
      }
      recharger()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  if (erreur) return <Layout title="Correspondance"><p className="text-clay-600">{erreur}</p></Layout>

  return (
    <Layout title="Correspondance" subtitle="Courrier entrant, sortant et archivage — accusés de réception sous 8 jours">
      {nbEnRetard > 0 && (
        <div className="flex items-start gap-3 bg-clay-500/10 border border-clay-500/30 text-clay-800 rounded-xl px-4 py-3 mb-5">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Action requise</p>
            <p className="text-sm">
              {nbEnRetard} dossier{nbEnRetard > 1 ? 's ont' : ' a'} dépassé le délai de traitement de 8 jours.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 flex-wrap gap-3">
          <div className="flex gap-1 bg-parchment-100 rounded-lg p-1 flex-wrap">
            {onglets.map((o) => (
              <button
                key={o.key}
                onClick={() => { setOnglet(o.key); setPage(1) }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  onglet === o.key ? 'bg-white shadow-sm text-ink-950' : 'text-ink-700/60'
                }`}
              >
                {o.label}
                {toutes && compteurs[o.key] > 0 && (
                  <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded-full ${onglet === o.key ? 'bg-ink-950 text-parchment-50' : 'bg-ink-950/10 text-ink-700'}`}>
                    {compteurs[o.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setModal('physique')}
              className="flex items-center gap-1.5 border border-ink-950/15 text-ink-800 rounded-lg px-3.5 py-2 text-sm font-semibold hover:border-gold-500/60 transition-colors"
            >
              <Upload size={15} /> Courrier physique
            </button>
            <button
              onClick={() => setModal('numerique')}
              className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-3.5 py-2 text-sm font-semibold hover:bg-ink-900 transition-colors"
            >
              <Send size={15} /> Envoyer un courrier
            </button>
          </div>
        </div>
        <div className="woven-rule mx-6 mt-5" />

        {!correspondances ? (
          <div className="flex items-center gap-2 text-ink-700/60 px-6 py-10">
            <Loader2 className="animate-spin" size={18} /> Chargement...
          </div>
        ) : (
          <>
            <table className="w-full mt-2">

              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 font-mono">
                  <th className="px-6 py-3 font-semibold">Objet</th>
                  <th className="px-6 py-3 font-semibold">Correspondant</th>
                  <th className="px-6 py-3 font-semibold">Sens</th>
                  <th className="px-6 py-3 font-semibold">État</th>
                  <th className="px-6 py-3 font-semibold">Reçu le</th>
                  <th className="px-6 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginer(correspondances, page).map((c) => (
                  <tr key={c.id} className="border-t border-ink-950/5 hover:bg-parchment-50 align-top">
                    <td className="px-6 py-3.5 text-sm font-medium text-ink-950 max-w-[220px]">
                      <div className="flex items-center gap-1.5">
                        {c.type === 'physique' ? <FileText size={14} className="text-ink-700/50 shrink-0" /> : <Send size={14} className="text-ink-700/50 shrink-0" />}
                        <span className="truncate">{c.objet}</span>
                        {c.fichierUrl && (
                          <a href={c.fichierUrl} target="_blank" rel="noreferrer" className="text-gold-600 shrink-0" title="Voir la pièce jointe">
                            <Paperclip size={13} />
                          </a>
                        )}
                      </div>
                      {c.enRetard && (
                        <span className="inline-flex items-center gap-1 text-xs text-clay-600 font-medium mt-1">
                          <AlertTriangle size={11} /> Délai de 8 jours dépassé
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-ink-800">
                      {c.egliseCorrespondante?.nom || c.correspondantExterne || '—'}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-ink-700/70 capitalize">{c.sens}</td>
                    <td className="px-6 py-3.5 text-sm">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${badgeEtat[c.etat]}`}>
                        {labelEtat[c.etat]}
                      </span>
                      {c.accuseEnvoye && (
                        <span className="inline-flex items-center gap-1 text-xs text-leaf-600 mt-1">
                          <CheckCircle2 size={11} /> Accusé envoyé
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-ink-700/60">{c.dateReception}</td>
                    <td className="px-6 py-3.5 text-right">
                      {onglet === 'sortie' ? (
                        c.accuseEnvoye ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-leaf-700 whitespace-nowrap">
                            <CheckCircle2 size={12} /> Reçu et accusé
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-ink-700/50 whitespace-nowrap">En attente d'accusé</span>
                        )
                      ) : (
                        <div className="flex justify-end gap-1.5 flex-wrap">
                          {c.sens === 'entrante' && !c.accuseEnvoye && (
                            <button
                              onClick={() => handleAction(c.id, 'accuse')}
                              className="text-xs font-semibold text-gold-700 hover:underline whitespace-nowrap"
                            >
                              Envoyer accusé
                            </button>
                          )}
                          {c.etat === 'entrant' && (
                            <button
                              onClick={() => handleAction(c.id, 'en_traitement')}
                              className="text-xs font-semibold text-ink-800 hover:underline whitespace-nowrap"
                            >
                              En traitement
                            </button>
                          )}
                          {c.etat !== 'archive' && (
                            <button
                              onClick={() => handleAction(c.id, 'archive')}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-leaf-700 hover:underline whitespace-nowrap"
                            >
                              <Archive size={12} /> Archiver
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {correspondances.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-ink-700/50">Aucune correspondance pour ce filtre.</td></tr>
                )}
              </tbody>
            </table>
            <Pagination page={page} setPage={setPage} total={correspondances.length} />
          </>
        )}
      </div>

      {modal === 'physique' && (
        <ModalPhysique onClose={() => setModal(null)} onSaved={() => { setModal(null); recharger(); showToast('Courrier physique enregistré.') }} />
      )}
      {modal === 'numerique' && (
        <ModalNumerique onClose={() => setModal(null)} onSaved={() => { setModal(null); recharger(); showToast('Courrier envoyé.') }} />
      )}
    </Layout>
  )
}

function ModalPhysique({ onClose, onSaved }) {
  const [sens, setSens] = useState('entrante')
  const [objet, setObjet] = useState('')
  const [correspondantExterne, setCorrespondantExterne] = useState('')
  const [fichier, setFichier] = useState(null)
  const [apercu, setApercu] = useState(null)
  const [camerapOuverte, setCameraOuverte] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  function choisirFichier(f) {
    setFichier(f)
    setApercu(f.type.startsWith('image/') ? URL.createObjectURL(f) : null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!fichier) return setErreur('Le scan du document est obligatoire.')
    setChargement(true)
    setErreur('')
    try {
      const fd = new FormData()
      fd.append('sens', sens)
      fd.append('objet', objet)
      fd.append('correspondantExterne', correspondantExterne)
      fd.append('document', fichier)
      await api.creerCorrespondancePhysique(fd)
      onSaved()
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <ModalShell titre="Courrier physique (scan)" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Sens</label>
          <select value={sens} onChange={(e) => setSens(e.target.value)} className={champClasses}>
            <option value="entrante">Reçu (entrant)</option>
            <option value="sortante">Envoyé (sortant)</option>
          </select>
        </div>
        <Champ label="Objet" required value={objet} onChange={setObjet} placeholder="Ex. Courrier du gouvernorat" />
        <Champ label="Correspondant (externe)" value={correspondantExterne} onChange={setCorrespondantExterne} placeholder="Ex. Gouvernorat du Kongo-Central" />

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Document scanné</label>

          {apercu && (
            <img src={apercu} alt="Aperçu du document" className="mt-2 w-full h-32 object-cover rounded-lg border border-ink-950/10" />
          )}
          {fichier && !apercu && (
            <p className="mt-2 text-xs text-ink-700/70 bg-parchment-100 rounded-lg px-3 py-2 truncate">{fichier.name}</p>
          )}

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setCameraOuverte(true)}
              className="flex-1 flex items-center justify-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900"
            >
              <Camera size={15} /> Scanner
            </button>
            <label className="flex-1 flex items-center justify-center gap-1.5 border border-ink-950/15 text-ink-800 rounded-lg py-2.5 text-sm font-semibold hover:border-gold-500/60 cursor-pointer">
              <FileUp size={15} /> Choisir un fichier
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => e.target.files[0] && choisirFichier(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}
        <BoutonSubmit chargement={chargement} />
      </form>

      {camerapOuverte && (
        <CameraCapture
          onCapture={(file) => { choisirFichier(file); setCameraOuverte(false) }}
          onClose={() => setCameraOuverte(false)}
        />
      )}
    </ModalShell>
  )
}

function ModalNumerique({ onClose, onSaved }) {
  const [eglises, setEglises] = useState([])
  const [destinataireEgliseId, setDestinataireEgliseId] = useState('')
  const [correspondantExterne, setCorrespondantExterne] = useState('')
  const [objet, setObjet] = useState('')
  const [contenu, setContenu] = useState('')
  const [fichier, setFichier] = useState(null)
  const [apercu, setApercu] = useState(null)
  const [camerapOuverte, setCameraOuverte] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => { api.listerEglises().then(setEglises).catch(() => {}) }, [])

  function choisirFichier(f) {
    setFichier(f)
    setApercu(f.type.startsWith('image/') ? URL.createObjectURL(f) : null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!destinataireEgliseId && !correspondantExterne) {
      return setErreur('Choisissez une église du système ou indiquez un correspondant externe.')
    }
    setChargement(true)
    setErreur('')
    try {
      const fd = new FormData()
      fd.append('objet', objet)
      fd.append('contenu', contenu)
      if (destinataireEgliseId) fd.append('destinataireEgliseId', destinataireEgliseId)
      else fd.append('correspondantExterne', correspondantExterne)
      if (fichier) fd.append('piece_jointe', fichier)
      await api.creerCorrespondanceNumerique(fd)
      onSaved()
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  return (
    <ModalShell titre="Envoyer un courrier numérique" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Église destinataire (système)</label>
          <select
            value={destinataireEgliseId}
            onChange={(e) => { setDestinataireEgliseId(e.target.value); if (e.target.value) setCorrespondantExterne('') }}
            className={champClasses}
          >
            <option value="">— Aucune (correspondant externe) —</option>
            {eglises.map((e) => <option key={e.id} value={e.id}>{e.nom} — {e.ville}</option>)}
          </select>
        </div>
        {!destinataireEgliseId && (
          <Champ label="Correspondant externe" value={correspondantExterne} onChange={setCorrespondantExterne} placeholder="Ex. Diocèse de Matadi" />
        )}
        <Champ label="Objet" required value={objet} onChange={setObjet} placeholder="Ex. Invitation à la conférence" />
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Message</label>
          <textarea
            rows={4}
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            className={champClasses}
            placeholder="Rédigez votre message..."
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Pièce jointe (optionnel)</label>

          {apercu && (
            <img src={apercu} alt="Aperçu" className="mt-2 w-full h-28 object-cover rounded-lg border border-ink-950/10" />
          )}
          {fichier && !apercu && (
            <p className="mt-2 text-xs text-ink-700/70 bg-parchment-100 rounded-lg px-3 py-2 truncate">{fichier.name}</p>
          )}

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setCameraOuverte(true)}
              className="flex-1 flex items-center justify-center gap-1.5 border border-ink-950/15 text-ink-800 rounded-lg py-2 text-sm font-semibold hover:border-gold-500/60"
            >
              <Camera size={14} /> Scanner
            </button>
            <label className="flex-1 flex items-center justify-center gap-1.5 border border-ink-950/15 text-ink-800 rounded-lg py-2 text-sm font-semibold hover:border-gold-500/60 cursor-pointer">
              <FileUp size={14} /> Fichier
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => e.target.files[0] && choisirFichier(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
        </div>
        {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}
        <BoutonSubmit chargement={chargement} label="Envoyer" />
      </form>

      {camerapOuverte && (
        <CameraCapture
          onCapture={(file) => { choisirFichier(file); setCameraOuverte(false) }}
          onClose={() => setCameraOuverte(false)}
        />
      )}
    </ModalShell>
  )
}

const champClasses = "mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"

function Champ({ label, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">{label}</label>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={champClasses}
      />
    </div>
  )
}

function ModalShell({ titre, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-ink-950/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-md p-6 my-8">
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
