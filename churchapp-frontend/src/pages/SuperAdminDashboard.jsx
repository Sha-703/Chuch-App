import { useEffect, useState } from 'react'
import { Church, Users2, Megaphone, AlertTriangle, Building2, Loader2 } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import StatCard from '../components/StatCard'
import { superAdminApi } from '../lib/superAdminApi'

export default function SuperAdminDashboard() {
  const [donnees, setDonnees] = useState(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    superAdminApi.dashboard().then(setDonnees).catch((err) => setErreur(err.message))
  }, [])

  if (erreur) return <SuperAdminLayout title="Vue d'ensemble"><p className="text-clay-600">{erreur}</p></SuperAdminLayout>
  if (!donnees) {
    return (
      <SuperAdminLayout title="Vue d'ensemble">
        <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
      </SuperAdminLayout>
    )
  }

  return (
    <SuperAdminLayout title="Vue d'ensemble" subtitle="Toutes les églises du système, en un coup d'œil">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Communautés" value={String(donnees.nbCommunautes)} icon={Building2} accent="gold" />
        <StatCard
          label="Églises inscrites"
          value={String(donnees.nbEglises)}
          delta={`${donnees.nbEglisesActives} actives · ${donnees.nbEglisesSuspendues} suspendues`}
          deltaPositive={donnees.nbEglisesSuspendues === 0}
          icon={Church}
          accent="gold"
        />
        <StatCard label="Membres au total" value={String(donnees.nbMembres)} icon={Users2} accent="ink" />
        <StatCard label="Annonces publiées" value={String(donnees.nbAnnonces)} icon={Megaphone} accent="leaf" />
        <StatCard
          label="Courriers en retard"
          value={String(donnees.nbCorrespondancesEnRetard)}
          delta={donnees.nbCorrespondancesEnRetard > 0 ? 'À surveiller' : 'Tout est à jour'}
          deltaPositive={donnees.nbCorrespondancesEnRetard === 0}
          icon={AlertTriangle}
          accent="clay"
        />
      </div>
    </SuperAdminLayout>
  )
}
