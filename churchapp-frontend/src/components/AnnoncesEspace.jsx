import { useEffect, useState } from 'react'
import { Megaphone, Loader2, Lock, Church } from 'lucide-react'
import { api } from '../lib/api'

// Annonces affichées dans les ESPACES PRIVÉS (ouvrier, chef de département) :
//  1. les annonces INTERNES de leur église (portée "ouvriers") d'abord,
//  2. puis le mur réseau public (portée "reseau").
// L'API renvoie déjà uniquement le réseau + les internes de MA propre église —
// aucune annonce interne d'une autre église ne peut apparaître ici.
// Rendu identique au mur des Annonces (photo pleine largeur incluse).
export default function AnnoncesEspace() {
  const [annonces, setAnnonces] = useState(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    api.listerAnnonces().then(setAnnonces).catch((err) => setErreur(err.message))
  }, [])

  if (erreur) return <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2 mb-4">{erreur}</p>
  if (!annonces) {
    return (
      <div className="flex items-center gap-2 text-ink-700/60 text-sm">
        <Loader2 className="animate-spin" size={16} /> Chargement des annonces...
      </div>
    )
  }

  const internes = annonces.filter((a) => a.portee === 'ouvriers')
  const reseau = annonces.filter((a) => a.portee !== 'ouvriers')

  if (annonces.length === 0) {
    return <p className="text-sm text-ink-700/50">Aucune annonce pour le moment.</p>
  }

  return (
    <div className="space-y-7">
      <Bloc titre="Annonces de mon église" icone={Lock} annonces={internes} interne />
      <Bloc titre="Réseau ChurchApp" icone={Megaphone} annonces={reseau} />
    </div>
  )
}

function Bloc({ titre, icone: Icon, annonces, interne }) {
  if (annonces.length === 0) return null
  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={15} className={interne ? 'text-gold-600' : 'text-ink-700/50'} />
        <h3 className="text-xs font-mono uppercase tracking-wide font-semibold text-ink-700/60">{titre}</h3>
        <span className="text-[11px] text-ink-700/40 font-tabular">({annonces.length})</span>
      </div>
      <div className="woven-rule w-12 mb-3" />

      <div className="space-y-3">
        {annonces.map((a) => (
          <article
            key={a.id}
            className={`bg-white rounded-2xl shadow-card overflow-hidden ${interne ? 'border-l-4 border-gold-500' : ''}`}
          >
            {/* Photo de l'annonce — même rendu que le mur des Annonces */}
            {a.photoUrl && (
              <img src={a.photoUrl} alt={a.titre} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3 mb-1">
                <h4 className="font-semibold text-sm text-ink-950">{a.titre}</h4>
                {interne && (
                  <span className="shrink-0 inline-block px-2 py-0.5 rounded-full bg-gold-500/15 text-gold-700 text-[10px] font-semibold font-mono">
                    Interne
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-700/70 mb-3 whitespace-pre-line">{a.contenu}</p>
              <div className="woven-rule mb-2.5" />
              <div className="flex items-center justify-between text-[11px] text-ink-700/50">
                <span className="inline-flex items-center gap-1.5 font-medium text-ink-800">
                  <Church size={11} /> {a.Eglise?.nom || 'Mon église'}
                </span>
                <span>Jusqu'au {a.dateFin}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
