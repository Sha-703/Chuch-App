import { useEffect, useState } from 'react'
import { Plus, Loader2, X, KeyRound, Link2 } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import { superAdminApi } from '../lib/superAdminApi'

export default function SuperAdminCommunautes() {
  const [communautes, setCommunautes] = useState(null)
  const [eglises, setEglises] = useState([])
  const [erreur, setErreur] = useState('')
  const [modalCreation, setModalCreation] = useState(false)
  const [modalCompte, setModalCompte] = useState(null)
  const [modalRattacher, setModalRattacher] = useState(null)
  const [resultat, setResultat] = useState(null)

  function recharger() {
    Promise.all([superAdminApi.listerCommunautes(), superAdminApi.listerEglises()])
      .then(([c, e]) => { setCommunautes(c); setEglises(e) })
      .catch((err) => setErreur(err.message))
  }
  useEffect(recharger, [])

  if (erreur) return <SuperAdminLayout title="Communautés"><p className="text-clay-600">{erreur}</p></SuperAdminLayout>

  return (
    <SuperAdminLayout title="Communautés" subtitle="Dénominations regroupant plusieurs églises (ex: CADEC)">
      <div className="flex justify-end mb-5">
        <button onClick={() => setModalCreation(true)} className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-ink-900">
          <Plus size={16} /> Nouvelle communauté
        </button>
      </div>

      {!communautes ? (
        <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
      ) : communautes.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-ink-700/50 text-sm">Aucune communauté créée.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {communautes.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl shadow-card p-5">
              <p className="font-display text-lg text-ink-950">{c.nom}</p>
              {c.description && <p className="text-sm text-ink-700/60 mt-1">{c.description}</p>}
              <p className="text-xs text-ink-700/50 font-mono uppercase tracking-wide mt-3">{c.nbEglises} église(s) rattachée(s)</p>
              <div className="flex gap-3 mt-3">
                <button onClick={() => setModalCompte(c)} className="text-xs font-semibold text-gold-700 hover:underline inline-flex items-center gap-1">
                  <KeyRound size={12} /> Créer un accès
                </button>
                <button onClick={() => setModalRattacher(c)} className="text-xs font-semibold text-ink-800 hover:underline inline-flex items-center gap-1">
                  <Link2 size={12} /> Rattacher une église
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalCreation && (
        <ModalCreation onClose={() => setModalCreation(false)} onSaved={() => { setModalCreation(false); recharger() }} />
      )}
      {modalCompte && (
        <ModalCompte communaute={modalCompte} onClose={() => setModalCompte(null)} onResultat={setResultat} />
      )}
      {modalRattacher && (
        <ModalRattacher communaute={modalRattacher} eglises={eglises} onClose={() => setModalRattacher(null)} onSaved={() => { setModalRattacher(null); recharger() }} />
      )}
      {resultat && (
        <div className="fixed inset-0 bg-ink-950/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-card w-full max-w-sm p-6">
            <h3 className="font-display text-lg text-ink-950 mb-3">Accès créé</h3>
            <div className="bg-parchment-100 rounded-lg p-4 text-sm space-y-1">
              <p><span className="text-ink-700/60">E-mail :</span> {resultat.email}</p>
              <p><span className="text-ink-700/60">Code OTP :</span> <span className="font-mono">{resultat.otp}</span></p>
            </div>
            <p className="text-xs text-ink-700/50 mt-3">Ce compte se connecte via la page normale, comme une église.</p>
            <button onClick={() => setResultat(null)} className="w-full mt-4 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900">Fermer</button>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  )
}

function ModalCreation({ onClose, onSaved }) {
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      await superAdminApi.creerCommunaute({ nom, description })
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
          <h3 className="font-display text-lg text-ink-950">Nouvelle communauté</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Nom</label>
            <input required value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. CADEC" className="mt-1.5 w-full rounded-lg border border-ink-950/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Description</label>
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5 w-full rounded-lg border border-ink-950/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          </div>
          {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}
          <button type="submit" disabled={chargement} className="w-full flex items-center justify-center gap-2 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900 disabled:opacity-60">
            {chargement ? <Loader2 size={16} className="animate-spin" /> : 'Créer'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ModalCompte({ communaute, onClose, onResultat }) {
  const [email, setEmail] = useState('')
  const [nom, setNom] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      const data = await superAdminApi.creerCompteCommunaute(communaute.id, { email, nom })
      onResultat(data)
      onClose()
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
          <h3 className="font-display text-lg text-ink-950">Accès pour {communaute.nom}</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Nom du contact</label>
            <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder={communaute.nom} className="mt-1.5 w-full rounded-lg border border-ink-950/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">E-mail de connexion</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cadec@exemple.cd" className="mt-1.5 w-full rounded-lg border border-ink-950/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
          </div>
          {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}
          <button type="submit" disabled={chargement} className="w-full flex items-center justify-center gap-2 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900 disabled:opacity-60">
            {chargement ? <Loader2 size={16} className="animate-spin" /> : 'Créer l\u2019accès'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ModalRattacher({ communaute, eglises, onClose, onSaved }) {
  const [egliseId, setEgliseId] = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!egliseId) return setErreur('Choisissez une église.')
    setChargement(true)
    setErreur('')
    try {
      await superAdminApi.rattacherEglise(egliseId, communaute.id)
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
          <h3 className="font-display text-lg text-ink-950">Rattacher une église à {communaute.nom}</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <select value={egliseId} onChange={(e) => setEgliseId(e.target.value)} className="w-full rounded-lg border border-ink-950/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50">
            <option value="">— Choisir une église —</option>
            {eglises.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
          </select>
          {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}
          <button type="submit" disabled={chargement} className="w-full flex items-center justify-center gap-2 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900 disabled:opacity-60">
            {chargement ? <Loader2 size={16} className="animate-spin" /> : 'Rattacher'}
          </button>
        </form>
      </div>
    </div>
  )
}
