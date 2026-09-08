import { useEffect, useState } from 'react'
import { FileDown, FileText, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { formatFC } from '../lib/mockData'
import { useToast } from '../context/ToastContext'

const nomsMois = { '01': 'Janvier', '02': 'Février', '03': 'Mars', '04': 'Avril', '05': 'Mai', '06': 'Juin', '07': 'Juillet', '08': 'Août', '09': 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre' }

export default function Rapports() {
  const { showToast } = useToast()
  const [bilan, setBilan] = useState(null)
  const [erreur, setErreur] = useState('')
  const [telechargementEnCours, setTelechargementEnCours] = useState(null)
  const [anneeSelectionnee, setAnneeSelectionnee] = useState(new Date().getFullYear().toString())
  const [telechargementAnnuel, setTelechargementAnnuel] = useState(false)

  useEffect(() => {
    api.bilanMensuel()
      .then((b) => setBilan(b.slice().reverse()))
      .catch((err) => setErreur(err.message))
  }, [])

  async function telecharger(mois) {
    setTelechargementEnCours(mois)
    try {
      const blob = await api.telechargerBilanPdf(mois)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bilan-${mois}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      showToast('Bilan PDF téléchargé.')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setTelechargementEnCours(null)
    }
  }

  async function telechargerAnnuel() {
    setTelechargementAnnuel(true)
    try {
      const blob = await api.telechargerRapportAnnuelPdf(anneeSelectionnee)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rapport-annuel-${anneeSelectionnee}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      showToast('Rapport annuel téléchargé.')
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setTelechargementAnnuel(false)
    }
  }

  const anneesDisponibles = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString())

  if (erreur) return <Layout title="Rapports"><p className="text-clay-600">{erreur}</p></Layout>
  if (!bilan) {
    return (
      <Layout title="Rapports">
        <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
      </Layout>
    )
  }

  return (
    <Layout title="Rapports" subtitle="Bilans mensuels exportables pour la transparence financière">
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5">
          <h2 className="font-display text-lg text-ink-950">Bilans mensuels</h2>
        </div>
        <div className="woven-rule mx-6 mt-5" />
        <table className="w-full mt-2">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-ink-700/50 font-mono">
              <th className="px-6 py-3 font-semibold">Mois</th>
              <th className="px-6 py-3 font-semibold text-right">Entrées</th>
              <th className="px-6 py-3 font-semibold text-right">Charges</th>
              <th className="px-6 py-3 font-semibold text-right">Solde</th>
              <th className="px-6 py-3 font-semibold text-right">Export</th>
            </tr>
          </thead>
          <tbody>
            {bilan.map((b) => {
              const solde = b.entrees - b.charges
              const [annee, mois] = b.mois.split('-')
              return (
                <tr key={b.mois} className="border-t border-ink-950/5 hover:bg-parchment-50">
                  <td className="px-6 py-3.5 text-sm font-medium text-ink-950">{nomsMois[mois] || mois} {annee}</td>
                  <td className="px-6 py-3.5 text-sm text-right font-tabular text-leaf-600">{formatFC(b.entrees)}</td>
                  <td className="px-6 py-3.5 text-sm text-right font-tabular text-clay-600">{formatFC(b.charges)}</td>
                  <td className="px-6 py-3.5 text-sm text-right font-tabular font-semibold text-gold-600">{formatFC(solde)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <button
                      onClick={() => telecharger(b.mois)}
                      disabled={telechargementEnCours === b.mois}
                      className="inline-flex items-center gap-1.5 text-sm text-ink-800 hover:text-ink-950 font-medium disabled:opacity-50"
                    >
                      {telechargementEnCours === b.mois ? <Loader2 size={15} className="animate-spin" /> : <FileDown size={15} />} PDF
                    </button>
                  </td>
                </tr>
              )
            })}
            {bilan.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-sm text-ink-700/50">Aucune donnée pour le moment.</td></tr>
            )}
          </tbody>
        </table>
        <div className="h-4" />
      </div>

      <div className="mt-6 bg-ink-950 text-parchment-100 rounded-2xl shadow-card p-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <FileText className="text-gold-500" size={22} />
          <div>
            <p className="font-display text-lg">Rapport de transparence annuel</p>
            <p className="text-sm text-ink-600">Finances, présence aux cultes, courrier et annonces — pour le conseil de l'église</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={anneeSelectionnee}
            onChange={(e) => setAnneeSelectionnee(e.target.value)}
            className="bg-ink-900 border border-white/10 text-parchment-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50"
          >
            {anneesDisponibles.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <button
            onClick={telechargerAnnuel}
            disabled={telechargementAnnuel}
            className="flex items-center gap-2 bg-gold-500 text-ink-950 rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-gold-400 transition-colors whitespace-nowrap disabled:opacity-60"
          >
            {telechargementAnnuel ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />} Générer
          </button>
        </div>
      </div>
    </Layout>
  )
}
