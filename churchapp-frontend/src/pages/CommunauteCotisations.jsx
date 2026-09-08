import { useEffect, useState } from 'react'
import { Loader2, Save, RefreshCw } from 'lucide-react'
import CommunauteLayout from '../components/CommunauteLayout'
import { api } from '../lib/api'
import { formatFC } from '../lib/mockData'
import { useToast } from '../context/ToastContext'

export default function CommunauteCotisations() {
  const { showToast } = useToast()
  const [eglises, setEglises] = useState(null)
  const [configs, setConfigs] = useState({})
  const [erreur, setErreur] = useState('')
  const [enregistrement, setEnregistrement] = useState(null)
  const [generation, setGeneration] = useState(null)

  function recharger() {
    Promise.all([api.communauteListerEglises(), api.communauteListerCotisations()])
      .then(([eg, cot]) => {
        setEglises(eg)
        const map = {}
        cot.forEach((c) => { map[c.egliseId] = { montant: c.montant, periodicite: c.periodicite } })
        setConfigs(map)
      })
      .catch((err) => setErreur(err.message))
  }
  useEffect(recharger, [])

  function majChamp(egliseId, champ, valeur) {
    setConfigs((c) => ({ ...c, [egliseId]: { montant: '', periodicite: 'mensuelle', ...c[egliseId], [champ]: valeur } }))
  }

  async function enregistrer(egliseId) {
    const config = configs[egliseId]
    if (!config?.montant) return showToast('Indiquez un montant.', 'error')
    setEnregistrement(egliseId)
    try {
      await api.communauteDefinirCotisation({ egliseId, montant: parseFloat(config.montant), periodicite: config.periodicite || 'mensuelle' })
      showToast('Cotisation enregistrée.')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setEnregistrement(null)
    }
  }

  async function genererEcheances(egliseId) {
    setGeneration(egliseId)
    try {
      const creees = await api.communauteGenererEcheances(egliseId)
      showToast(creees.length > 0 ? `${creees.length} échéances générées.` : 'Toutes les échéances existaient déjà.')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setGeneration(null)
    }
  }

  if (erreur) return <CommunauteLayout title="Cotisations"><p className="text-clay-600">{erreur}</p></CommunauteLayout>

  return (
    <CommunauteLayout title="Cotisations" subtitle="Montant et fréquence dus par chaque église">
      {!eglises ? (
        <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 font-mono">
                <th className="px-6 py-3 font-semibold">Église</th>
                <th className="px-6 py-3 font-semibold">Montant</th>
                <th className="px-6 py-3 font-semibold">Fréquence</th>
                <th className="px-6 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {eglises.map((e) => {
                const config = configs[e.id] || { montant: '', periodicite: 'mensuelle' }
                return (
                  <tr key={e.id} className="border-t border-ink-950/5">
                    <td className="px-6 py-3.5 text-sm font-medium text-ink-950">{e.nom}</td>
                    <td className="px-6 py-3.5">
                      <input
                        type="number"
                        value={config.montant}
                        onChange={(ev) => majChamp(e.id, 'montant', ev.target.value)}
                        placeholder="Ex. 50000"
                        className="w-28 rounded-lg border border-ink-950/15 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                      />
                    </td>
                    <td className="px-6 py-3.5">
                      <select
                        value={config.periodicite}
                        onChange={(ev) => majChamp(e.id, 'periodicite', ev.target.value)}
                        className="rounded-lg border border-ink-950/15 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                      >
                        <option value="mensuelle">Mensuelle</option>
                        <option value="trimestrielle">Trimestrielle</option>
                        <option value="annuelle">Annuelle</option>
                      </select>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => enregistrer(e.id)} disabled={enregistrement === e.id} className="text-xs font-semibold text-gold-700 hover:underline inline-flex items-center gap-1 disabled:opacity-50">
                          {enregistrement === e.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Enregistrer
                        </button>
                        <button onClick={() => genererEcheances(e.id)} disabled={generation === e.id} className="text-xs font-semibold text-ink-800 hover:underline inline-flex items-center gap-1 disabled:opacity-50">
                          {generation === e.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Générer les échéances
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="px-6 py-4 text-xs text-ink-700/50 border-t border-ink-950/5">
            "Générer les échéances" crée le calendrier de paiement de l'année en cours pour cette église, selon le montant et la fréquence enregistrés.
          </p>
        </div>
      )}

      {eglises && <ListeEcheances eglises={eglises} />}
    </CommunauteLayout>
  )
}

function ListeEcheances({ eglises }) {
  const [egliseFiltre, setEgliseFiltre] = useState('')
  const [echeances, setEcheances] = useState(null)
  const [erreur, setErreur] = useState('')

  function recharger() {
    setEcheances(null)
    api.communauteListerEcheances(egliseFiltre || undefined).then(setEcheances).catch((err) => setErreur(err.message))
  }
  useEffect(recharger, [egliseFiltre])

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden mt-6">
      <div className="flex items-center justify-between px-6 pt-5">
        <h2 className="font-display text-lg text-ink-950">Liste des cotisations (échéances)</h2>
        <select
          value={egliseFiltre}
          onChange={(e) => setEgliseFiltre(e.target.value)}
          className="rounded-lg border border-ink-950/15 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
        >
          <option value="">Toutes les églises</option>
          {eglises.map((e) => <option key={e.id} value={e.id}>{e.nom}</option>)}
        </select>
      </div>
      <div className="woven-rule mx-6 mt-5" />

      {erreur && <p className="text-clay-600 px-6 py-4 text-sm">{erreur}</p>}
      {!echeances ? (
        <div className="flex items-center gap-2 text-ink-700/60 px-6 py-8"><Loader2 className="animate-spin" size={16} /> Chargement...</div>
      ) : (
        <table className="w-full mt-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 font-mono">
              <th className="px-6 py-3 font-semibold">Église</th>
              <th className="px-6 py-3 font-semibold">Période</th>
              <th className="px-6 py-3 font-semibold text-right">Dû</th>
              <th className="px-6 py-3 font-semibold text-right">Payé</th>
              <th className="px-6 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {echeances.map((ec) => {
              const soldee = ec.montantPaye >= ec.montantDu
              const enRetard = !soldee && ec.dateEcheance < new Date().toISOString().slice(0, 10)
              return (
                <tr key={ec.id} className="border-t border-ink-950/5 hover:bg-parchment-50">
                  <td className="px-6 py-3.5 text-sm font-medium text-ink-950">{ec.Eglise?.nom}</td>
                  <td className="px-6 py-3.5 text-sm text-ink-700/70">{ec.periodeLibelle}</td>
                  <td className="px-6 py-3.5 text-sm text-right font-tabular">{formatFC(ec.montantDu)}</td>
                  <td className="px-6 py-3.5 text-sm text-right font-tabular text-leaf-600">{formatFC(ec.montantPaye)}</td>
                  <td className="px-6 py-3.5 text-sm">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono ${
                      soldee ? 'bg-leaf-500/10 text-leaf-700' : enRetard ? 'bg-clay-500/10 text-clay-700' : 'bg-gold-500/10 text-gold-700'
                    }`}>
                      {soldee ? 'Payée' : enRetard ? 'En retard' : 'À venir'}
                    </span>
                  </td>
                </tr>
              )
            })}
            {echeances.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-ink-700/50">Aucune échéance générée pour l'instant.</td></tr>
            )}
          </tbody>
        </table>
      )}
      <div className="h-4" />
    </div>
  )
}
