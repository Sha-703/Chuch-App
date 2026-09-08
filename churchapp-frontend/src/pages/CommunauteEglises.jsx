import { useEffect, useState } from 'react'
import { Loader2, Eye, X } from 'lucide-react'
import CommunauteLayout from '../components/CommunauteLayout'
import { api } from '../lib/api'
import { formatFC } from '../lib/mockData'

export default function CommunauteEglises() {
  const [eglises, setEglises] = useState(null)
  const [erreur, setErreur] = useState('')
  const [egliseSelectionnee, setEgliseSelectionnee] = useState(null)

  useEffect(() => {
    api.communauteListerEglises().then(setEglises).catch((err) => setErreur(err.message))
  }, [])

  if (erreur) return <CommunauteLayout title="Nos églises"><p className="text-clay-600">{erreur}</p></CommunauteLayout>

  return (
    <CommunauteLayout title="Nos églises" subtitle="Lecture seule — vous ne pouvez rien modifier chez elles">
      {!eglises ? (
        <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
      ) : eglises.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-ink-700/50 text-sm">
          Aucune église n'est encore rattachée à votre communauté. Contactez le Super Admin ChurchApp.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {eglises.map((e) => (
            <div key={e.id} className="bg-white rounded-2xl shadow-card p-5">
              <p className="font-display text-lg text-ink-950">{e.nom}</p>
              <p className="text-sm text-ink-700/60 mb-3">{e.ville}</p>
              <button
                onClick={() => setEgliseSelectionnee(e)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-700 hover:underline"
              >
                <Eye size={13} /> Voir la situation financière
              </button>
            </div>
          ))}
        </div>
      )}

      {egliseSelectionnee && (
        <ModalFinances eglise={egliseSelectionnee} onClose={() => setEgliseSelectionnee(null)} />
      )}
    </CommunauteLayout>
  )
}

function ModalFinances({ eglise, onClose }) {
  const [donnees, setDonnees] = useState(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    api.communauteFinancesEglise(eglise.id).then(setDonnees).catch((err) => setErreur(err.message))
  }, [eglise.id])

  const totalEntrees = donnees?.bilanMensuel.reduce((s, m) => s + m.entrees, 0) || 0
  const totalCharges = donnees?.bilanMensuel.reduce((s, m) => s + m.charges, 0) || 0

  return (
    <div className="fixed inset-0 bg-ink-950/40 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-lg p-6 my-8">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-lg text-ink-950">{eglise.nom}</h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>
        <p className="text-xs text-ink-700/50 mb-4">Bilan financier — lecture seule, vous ne pouvez rien modifier ici</p>

        {erreur && <p className="text-sm text-clay-600">{erreur}</p>}
        {!donnees ? (
          <div className="flex items-center gap-2 text-ink-700/60 py-6"><Loader2 className="animate-spin" size={16} /> Chargement...</div>
        ) : donnees.bilanMensuel.length === 0 ? (
          <p className="text-sm text-ink-700/50 py-6 text-center">Aucune donnée financière disponible.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-parchment-100 rounded-xl p-3">
                <p className="text-xs text-ink-700/50 font-mono uppercase">Total entrées</p>
                <p className="font-tabular text-leaf-600 font-semibold mt-1">{formatFC(totalEntrees)}</p>
              </div>
              <div className="bg-parchment-100 rounded-xl p-3">
                <p className="text-xs text-ink-700/50 font-mono uppercase">Total charges</p>
                <p className="font-tabular text-clay-600 font-semibold mt-1">{formatFC(totalCharges)}</p>
              </div>
              <div className="bg-ink-950 rounded-xl p-3">
                <p className="text-xs text-ink-600 font-mono uppercase">Solde</p>
                <p className="font-tabular text-gold-500 font-semibold mt-1">{formatFC(totalEntrees - totalCharges)}</p>
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 font-mono">
                  <th className="py-2 font-semibold">Mois</th>
                  <th className="py-2 font-semibold text-right">Entrées</th>
                  <th className="py-2 font-semibold text-right">Charges</th>
                  <th className="py-2 font-semibold text-right">Solde</th>
                </tr>
              </thead>
              <tbody>
                {donnees.bilanMensuel.slice().reverse().map((m) => {
                  const solde = m.entrees - m.charges
                  return (
                    <tr key={m.mois} className="border-t border-ink-950/5">
                      <td className="py-2.5 text-sm text-ink-700/70 font-mono">{m.mois}</td>
                      <td className="py-2.5 text-sm text-right font-tabular text-leaf-600">{formatFC(m.entrees)}</td>
                      <td className="py-2.5 text-sm text-right font-tabular text-clay-600">{formatFC(m.charges)}</td>
                      <td className={`py-2.5 text-sm text-right font-tabular font-semibold ${solde >= 0 ? 'text-leaf-700' : 'text-clay-700'}`}>
                        {formatFC(solde)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}
