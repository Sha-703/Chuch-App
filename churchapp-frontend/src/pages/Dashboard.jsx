import { useEffect, useState } from 'react'
import { Wallet, TrendingDown, Users, CalendarCheck, Loader2, Bell, CalendarDays } from 'lucide-react'
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import Layout from '../components/Layout'
import StatCard from '../components/StatCard'
import { api } from '../lib/api'
import { formatFC } from '../lib/mockData'

const nomsMois = { '01': 'Jan', '02': 'Fév', '03': 'Mars', '04': 'Avr', '05': 'Mai', '06': 'Juin', '07': 'Juil', '08': 'Août', '09': 'Sept', 10: 'Oct', 11: 'Nov', 12: 'Déc' }

export default function Dashboard() {
  const [bilan, setBilan] = useState(null)
  const [cultes, setCultes] = useState(null)
  const [prochains, setProchains] = useState(null)
  const [rappels, setRappels] = useState([])
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    Promise.all([api.bilanMensuel(), api.listerCultes(), api.prochainsEvenements(), api.rappelsActifs()])
      .then(([b, c, p, r]) => {
        setBilan(b.map((m) => ({ ...m, moisLabel: nomsMois[m.mois.slice(5, 7)] || m.mois })))
        setCultes(c)
        setProchains(p)
        setRappels(r)
      })
      .catch((err) => setErreur(err.message))
  }, [])

  if (erreur) return <Layout title="Vue d'ensemble"><p className="text-clay-600">{erreur}</p></Layout>
  if (!bilan || !cultes || !prochains) {
    return (
      <Layout title="Vue d'ensemble">
        <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
      </Layout>
    )
  }

  const dernierMois = bilan[bilan.length - 1] || { entrees: 0, charges: 0 }
  const moisPrecedent = bilan[bilan.length - 2]
  const solde = dernierMois.entrees - dernierMois.charges
  const dernierCulte = cultes[0]

  const variation = (actuel, precedent) =>
    precedent ? `${(((actuel - precedent) / precedent) * 100).toFixed(1)}% vs mois précédent` : null

  return (
    <Layout title="Vue d'ensemble" subtitle="Résumé financier et fréquentation de l'église">
      {rappels.length > 0 && (
        <div className="bg-gold-500/10 border border-gold-500/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <Bell size={18} className="text-gold-700 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-950 mb-1">
              {rappels.length === 1 ? 'Un rappel' : `${rappels.length} rappels`} à ne pas oublier
            </p>
            {rappels.map((r) => (
              <p key={r.id} className="text-sm text-ink-700/70">
                {r.titre} — <span className="font-mono">{r.date}{r.heure ? ` à ${r.heure}` : ''}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Entrées (ce mois)" value={formatFC(dernierMois.entrees)} delta={moisPrecedent && variation(dernierMois.entrees, moisPrecedent.entrees)} icon={Wallet} accent="leaf" />
        <StatCard label="Charges (ce mois)" value={formatFC(dernierMois.charges)} delta={moisPrecedent && variation(dernierMois.charges, moisPrecedent.charges)} icon={TrendingDown} accent="clay" />
        <StatCard label="Solde du mois" value={formatFC(solde)} delta={solde >= 0 ? 'Excédent' : 'Déficit'} deltaPositive={solde >= 0} icon={Wallet} accent="gold" />
        <StatCard
          label="Dernier culte"
          value={dernierCulte ? `${dernierCulte.presentiel + dernierCulte.enLigne} participants` : '—'}
          delta={dernierCulte ? `${dernierCulte.presentiel} présentiel · ${dernierCulte.enLigne} en ligne` : ''}
          icon={Users}
          accent="ink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-display text-lg text-ink-950">Entrées &amp; charges</h2>
            <span className="text-xs text-ink-700/50">par mois</span>
          </div>
          <div className="woven-rule w-16 mb-5" />
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={bilan} margin={{ left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B2A4A0f" vertical={false} />
              <XAxis dataKey="moisLabel" tick={{ fontSize: 12, fill: '#284370' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#28437099' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip formatter={(v) => formatFC(v)} contentStyle={{ borderRadius: 10, border: '1px solid #1B2A4A1a', fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="entrees" name="Entrées" fill="#C9A227" radius={[5, 5, 0, 0]} barSize={22} />
              <Line type="monotone" dataKey="charges" name="Charges" stroke="#B5502F" strokeWidth={2.5} dot={{ r: 3.5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-ink-950 text-parchment-100 rounded-2xl shadow-card p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck size={16} className="text-gold-500" />
            <h2 className="font-display text-lg">Derniers cultes</h2>
          </div>
          <div className="woven-rule w-16 mb-5" />
          <div className="space-y-3.5 flex-1">
            {cultes.slice(0, 4).map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm border-b border-white/10 pb-3 last:border-0">
                <div>
                  <p className="font-medium text-parchment-50">{c.type}</p>
                  <p className="text-ink-600 text-xs mt-0.5">{c.date}</p>
                </div>
                <div className="text-right font-tabular">
                  <p className="text-gold-400 font-semibold">{c.presentiel + c.enLigne}</p>
                  <p className="text-ink-600 text-xs">{c.presentiel} + {c.enLigne} en ligne</p>
                </div>
              </div>
            ))}
            {cultes.length === 0 && <p className="text-ink-600 text-sm">Aucun culte enregistré pour l'instant.</p>}
          </div>
        </div>
      </div>

      {prochains.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-6 mt-5">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={16} className="text-gold-600" />
            <h2 className="font-display text-lg text-ink-950">Les 7 prochains jours</h2>
          </div>
          <div className="woven-rule w-16 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {prochains.map((e) => (
              <div key={e.id} className="border border-ink-950/10 rounded-xl p-3.5">
                <p className="text-sm font-semibold text-ink-950">{e.titre}</p>
                <p className="text-xs text-ink-700/60 font-mono mt-1">{e.date}{e.heure ? ` · ${e.heure}` : ''}</p>
                {(e.responsable?.nom || e.responsableLibre) && (
                  <p className="text-xs text-ink-700/50 mt-1">Responsable : {e.responsable?.nom || e.responsableLibre}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}
