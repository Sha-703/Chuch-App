import { useEffect, useState } from 'react'
import { Search, Loader2, PauseCircle, PlayCircle, Trash2, Plus, X } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import { superAdminApi } from '../lib/superAdminApi'

export default function SuperAdminEglises() {
  const [eglises, setEglises] = useState(null)
  const [recherche, setRecherche] = useState('')
  const [erreur, setErreur] = useState('')
  const [modalCreation, setModalCreation] = useState(false)
  const [resultat, setResultat] = useState(null)
  const [communautes, setCommunautes] = useState([])

  function recharger() {
    superAdminApi.listerEglises(recherche).then(setEglises).catch((err) => setErreur(err.message))
  }

  useEffect(() => {
    recharger()
    superAdminApi.listerCommunautes().then((cs) => setCommunautes(cs || [])).catch(() => {})
  }, [])

  async function toggleStatut(eglise) {
    try {
      await superAdminApi.changerStatutEglise(eglise.id, eglise.statut === 'actif' ? 'suspendu' : 'actif')
      recharger()
    } catch (err) {
      setErreur(err.message)
    }
  }

  async function supprimer(eglise) {
    if (!window.confirm(`Supprimer définitivement "${eglise.nom}" et toutes ses données ? Cette action est irréversible.`)) return
    try {
      await superAdminApi.supprimerEglise(eglise.id)
      recharger()
    } catch (err) {
      setErreur(err.message)
    }
  }

  if (erreur) return <SuperAdminLayout title="Églises"><p className="text-clay-600">{erreur}</p></SuperAdminLayout>

  return (
    <SuperAdminLayout title="Églises" subtitle="Toutes les églises inscrites sur ChurchApp">
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center gap-3 px-6 pt-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-700/40" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && recharger()}
              placeholder="Rechercher une église..."
              className="w-full rounded-lg border border-ink-950/15 bg-parchment-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
            />
          </div>
          <button onClick={recharger} className="text-sm font-semibold text-ink-800 hover:text-ink-950">Rechercher</button>
          <button onClick={() => setModalCreation(true)} className="ml-auto flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-4 py-2 text-sm font-semibold hover:bg-ink-900 whitespace-nowrap">
            <Plus size={15} /> Créer une église
          </button>
        </div>
        <div className="woven-rule mx-6 mt-5" />

        {!eglises ? (
          <div className="flex items-center gap-2 text-ink-700/60 px-6 py-10"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
        ) : (
          <table className="w-full mt-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 font-mono">
                <th className="px-6 py-3 font-semibold">Église</th>
                <th className="px-6 py-3 font-semibold">Ville</th>
                <th className="px-6 py-3 font-semibold">Communauté</th>
                <th className="px-6 py-3 font-semibold text-right">Membres</th>
                <th className="px-6 py-3 font-semibold text-right">Comptes</th>
                <th className="px-6 py-3 font-semibold">Statut</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {eglises.map((e) => (
                <tr key={e.id} className="border-t border-ink-950/5 hover:bg-parchment-50">
                  <td className="px-6 py-3.5 text-sm font-medium text-ink-950">{e.nom}</td>
                  <td className="px-6 py-3.5 text-sm text-ink-700/60">{e.ville || '—'}</td>
                  <td className="px-6 py-3.5 text-sm text-ink-700/60">{e.communaute?.nom || '—'}</td>
                  <td className="px-6 py-3.5 text-sm text-right font-tabular">{e.nbMembres}</td>
                  <td className="px-6 py-3.5 text-sm text-right font-tabular">{e.nbUtilisateurs}</td>
                  <td className="px-6 py-3.5 text-sm">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${
                      e.statut === 'actif' ? 'bg-leaf-500/10 text-leaf-700' : 'bg-clay-500/10 text-clay-700'
                    }`}>
                      {e.statut === 'actif' ? 'Actif' : 'Suspendu'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => toggleStatut(e)} className="text-xs font-semibold text-ink-800 hover:underline inline-flex items-center gap-1">
                        {e.statut === 'actif' ? <><PauseCircle size={13} /> Suspendre</> : <><PlayCircle size={13} /> Réactiver</>}
                      </button>
                      <button onClick={() => supprimer(e)} className="text-xs font-semibold text-clay-600 hover:underline inline-flex items-center gap-1">
                        <Trash2 size={13} /> Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {eglises.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-sm text-ink-700/50">Aucune église trouvée.</td></tr>
              )}
            </tbody>
          </table>
        )}
        <div className="h-4" />
      </div>

      {modalCreation && (
        <ModalCreationEglise
          onClose={() => setModalCreation(false)}
          onSaved={(data) => { setModalCreation(false); recharger(); setResultat(data) }}
        />
      )}
      {resultat && (
        <div className="fixed inset-0 bg-ink-950/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-card w-full max-w-sm p-6">
            <h3 className="font-display text-lg text-ink-950 mb-3">Église créée</h3>
            <div className="bg-parchment-100 rounded-lg p-4 text-sm space-y-2">
              {resultat.comptes.map((c) => (
                <div key={c.email} className="pb-2 border-b border-ink-950/5 last:border-0 last:pb-0">
                  <p><span className="text-ink-700/60">{c.role} :</span> {c.email}</p>
                  <p className="text-xs text-ink-700/50">{c.otp ? <>Code OTP : <strong className="text-ink-950">{c.otp}</strong></> : 'Code envoyé par e-mail ✉️'}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setResultat(null)} className="w-full mt-4 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900">Fermer</button>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  )
}

function ModalCreationEglise({ onClose, onSaved }) {
  const [nom, setNom] = useState('')
  const [ville, setVille] = useState('')
  const [denomination, setDenomination] = useState('')
  const [pasteurNom, setPasteurNom] = useState('')
  const [pasteurEmail, setPasteurEmail] = useState('')
  const [adminNom, setAdminNom] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [communauteId, setCommunauteId] = useState('')
  const [communautes, setCommunautes] = useState([])
  const [chargement, setChargement] = useState(false)
  const [chargementCommunes, setChargementCommunes] = useState(true)
  const [erreur, setErreur] = useState('')
  const [erreurCommunes, setErreurCommunes] = useState('')

  // Charger les communautés DANS le modal (indépendant du parent)
  useEffect(() => {
    superAdminApi.listerCommunautes()
      .then((cs) => setCommunautes(cs || []))
      .catch((err) => {
        console.error('[Modal] Erreur chargement communautés:', err)
        setCommunautes([])
        setErreurCommunes(err.message || 'Erreur de chargement')
      })
      .finally(() => setChargementCommunes(false))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setChargement(true)
    setErreur('')
    try {
      const data = await superAdminApi.creerEglise({
        eglise: { nom, ville, denomination },
        pasteur: { nom: pasteurNom, email: pasteurEmail },
        administrateur: { nom: adminNom, email: adminEmail },
        ...(communauteId ? { communauteId } : {}),
      })
      onSaved(data)
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
          <h3 className="font-display text-lg text-ink-950">Créer une église</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Champ label="Nom de l'église" required value={nom} onChange={setNom} placeholder="Ex. CEC Bethel" />
          <div className="grid grid-cols-2 gap-3">
            <Champ label="Ville" value={ville} onChange={setVille} placeholder="Kinshasa" />
            <Champ label="Dénomination" value={denomination} onChange={setDenomination} placeholder="Optionnel" />
          </div>
          <div className="woven-rule w-16" />
          {chargementCommunes ? (
            <div className="flex items-center gap-2 text-ink-700/60 text-sm py-1"><Loader2 size={14} className="animate-spin" /> Chargement des communautés...</div>
          ) : erreurCommunes ? (
            <p className="text-xs text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">⚠️ {erreurCommunes}</p>
          ) : communautes.length > 0 ? (
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Communauté (optionnel)</label>
              <select
                value={communauteId}
                onChange={(e) => setCommunauteId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-ink-950/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 bg-white"
              >
                <option value="">— Aucune (église indépendante) —</option>
                {communautes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            <Champ label="Nom du pasteur" required value={pasteurNom} onChange={setPasteurNom} placeholder="Past. Jean" />
            <Champ label="Nom de l'administrateur" required value={adminNom} onChange={setAdminNom} placeholder="Sr. Grace" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Champ label="E-mail du pasteur" type="email" required value={pasteurEmail} onChange={setPasteurEmail} placeholder="pasteur@exemple.cd" />
            <Champ label="E-mail de l'administrateur" type="email" required value={adminEmail} onChange={setAdminEmail} placeholder="admin@exemple.cd" />
          </div>

          {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">{erreur}</p>}
          {erreurCommunes && <p className="text-xs text-clay-600 mt-2">⚠️ {erreurCommunes}</p>}
          <button type="submit" disabled={chargement} className="w-full flex items-center justify-center gap-2 bg-ink-950 text-parchment-50 rounded-lg py-2.5 text-sm font-semibold hover:bg-ink-900 disabled:opacity-60">
            {chargement ? <Loader2 size={16} className="animate-spin" /> : 'Créer l\u2019église'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Champ({ label, type = 'text', placeholder, value, onChange, required }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">{label}</label>
      <input type={type} required={required} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-lg border border-ink-950/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50" />
    </div>
  )
}
