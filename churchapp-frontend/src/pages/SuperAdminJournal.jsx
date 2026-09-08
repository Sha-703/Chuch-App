import { useEffect, useState } from 'react'
import { Loader2, ScrollText } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import { superAdminApi } from '../lib/superAdminApi'

export default function SuperAdminJournal() {
  const [entrees, setEntrees] = useState(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    superAdminApi.listerJournal().then(setEntrees).catch((err) => setErreur(err.message))
  }, [])

  if (erreur) return <SuperAdminLayout title="Journal d'activité"><p className="text-clay-600">{erreur}</p></SuperAdminLayout>

  return (
    <SuperAdminLayout title="Journal d'activité" subtitle="Qui a fait quoi, dans tout le système">
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {!entrees ? (
          <div className="flex items-center gap-2 text-ink-700/60 px-6 py-10"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
        ) : entrees.length === 0 ? (
          <div className="p-10 text-center text-ink-700/50 text-sm">
            <ScrollText className="mx-auto mb-3 text-ink-950/20" size={26} />
            Aucune activité enregistrée pour l'instant.
          </div>
        ) : (
          <div className="divide-y divide-ink-950/5">
            {entrees.map((e) => (
              <div key={e.id} className="px-6 py-3.5 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-ink-950">{e.details}</p>
                  <p className="text-xs text-ink-700/50 font-mono mt-0.5">
                    {e.egliseNom ? `${e.egliseNom} · ` : ''}{e.utilisateurNom || '—'}
                  </p>
                </div>
                <span className="text-xs text-ink-700/50 font-mono whitespace-nowrap">
                  {new Date(e.createdAt).toLocaleString('fr-FR')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </SuperAdminLayout>
  )
}
