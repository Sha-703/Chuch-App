import { useEffect, useState } from 'react'
import { Church, Wallet, TrendingUp, Loader2 } from 'lucide-react'
import CommunauteLayout from '../components/CommunauteLayout'
import StatCard from '../components/StatCard'
import { api } from '../lib/api'
import { formatFC } from '../lib/mockData'

export default function CommunauteDashboard() {
  const [donnees, setDonnees] = useState(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    api.communauteDashboard().then(setDonnees).catch((err) => setErreur(err.message))
  }, [])

  if (erreur) return <CommunauteLayout title="Vue d'ensemble"><p className="text-clay-600">{erreur}</p></CommunauteLayout>
  if (!donnees) {
    return (
      <CommunauteLayout title="Vue d'ensemble">
        <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
      </CommunauteLayout>
    )
  }

  return (
    <CommunauteLayout title="Vue d'ensemble" subtitle="La situation de toutes vos églises, en un coup d'œil">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Églises rattachées" value={String(donnees.nbEglises)} icon={Church} accent="ink" />
        <StatCard label="Total dû" value={formatFC(donnees.totalDu)} icon={Wallet} accent="gold" />
        <StatCard label="Total encaissé" value={formatFC(donnees.totalPaye)} icon={Wallet} accent="leaf" />
        <StatCard
          label="Taux de recouvrement"
          value={`${donnees.tauxRecouvrement}%`}
          delta={formatFC(donnees.totalRestantDu) + ' restant dû'}
          deltaPositive={donnees.totalRestantDu === 0}
          icon={TrendingUp}
          accent="clay"
        />
      </div>
    </CommunauteLayout>
  )
}
