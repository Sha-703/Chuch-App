import { useEffect, useState } from 'react'
import { Loader2, Trash2, Church } from 'lucide-react'
import SuperAdminLayout from '../components/SuperAdminLayout'
import { superAdminApi } from '../lib/superAdminApi'

export default function SuperAdminAnnonces() {
  const [annonces, setAnnonces] = useState(null)
  const [erreur, setErreur] = useState('')

  function recharger() {
    superAdminApi.listerAnnonces().then(setAnnonces).catch((err) => setErreur(err.message))
  }

  useEffect(recharger, [])

  async function supprimer(a) {
    if (!window.confirm(`Retirer l'annonce "${a.titre}" ?`)) return
    try {
      await superAdminApi.supprimerAnnonce(a.id)
      recharger()
    } catch (err) {
      setErreur(err.message)
    }
  }

  if (erreur) return <SuperAdminLayout title="Annonces"><p className="text-clay-600">{erreur}</p></SuperAdminLayout>

  return (
    <SuperAdminLayout title="Annonces" subtitle="Modération du mur d'annonces partagé entre toutes les églises">
      {!annonces ? (
        <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Chargement...</div>
      ) : annonces.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-ink-700/50 text-sm">Aucune annonce publiée.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {annonces.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl shadow-card overflow-hidden flex flex-col">
              {a.photoUrl ? (
                <img src={a.photoUrl} alt={a.titre} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-ink-950 flex items-center justify-center text-gold-500">
                  <Church size={22} />
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <p className="font-display text-base text-ink-950 mb-1">{a.titre}</p>
                <p className="text-xs text-ink-700/60 mb-3 flex-1 line-clamp-3">{a.contenu}</p>
                <div className="flex items-center justify-between text-xs text-ink-700/50">
                  <span>{a.Eglise?.nom}</span>
                  <button onClick={() => supprimer(a)} className="text-clay-600 font-semibold hover:underline inline-flex items-center gap-1">
                    <Trash2 size={12} /> Retirer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </SuperAdminLayout>
  )
}
