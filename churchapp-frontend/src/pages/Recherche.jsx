import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Loader2, Users2, Mail, Megaphone, SearchX } from 'lucide-react'
import Layout from '../components/Layout'
import { api } from '../lib/api'

export default function Recherche() {
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim().toLowerCase()
  const [donnees, setDonnees] = useState(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    if (!q) return
    setDonnees(null)
    Promise.all([api.listerMembres(), api.listerCorrespondances(), api.listerAnnonces()])
      .then(([membres, correspondances, annonces]) => setDonnees({ membres, correspondances, annonces }))
      .catch((err) => setErreur(err.message))
  }, [q])

  if (!q) {
    return (
      <Layout title="Recherche">
        <p className="text-ink-700/60 text-sm">Tapez un mot-clé dans la barre de recherche en haut de l'écran.</p>
      </Layout>
    )
  }
  if (erreur) return <Layout title="Recherche"><p className="text-clay-600">{erreur}</p></Layout>
  if (!donnees) {
    return (
      <Layout title="Recherche">
        <div className="flex items-center gap-2 text-ink-700/60"><Loader2 className="animate-spin" size={18} /> Recherche en cours...</div>
      </Layout>
    )
  }

  const membres = donnees.membres.filter((m) => m.nom.toLowerCase().includes(q))
  const correspondances = donnees.correspondances.filter(
    (c) => c.objet.toLowerCase().includes(q) || c.correspondantExterne?.toLowerCase().includes(q) || c.egliseCorrespondante?.nom.toLowerCase().includes(q)
  )
  const annonces = donnees.annonces.filter((a) => a.titre.toLowerCase().includes(q) || a.contenu.toLowerCase().includes(q))
  const total = membres.length + correspondances.length + annonces.length

  return (
    <Layout title="Résultats de recherche" subtitle={`${total} résultat${total !== 1 ? 's' : ''} pour « ${params.get('q')} »`}>
      {total === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center">
          <SearchX className="mx-auto text-ink-700/30 mb-3" size={28} />
          <p className="text-ink-700/60 text-sm">Aucun résultat trouvé.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {membres.length > 0 && (
            <Section titre="Membres" icon={Users2} count={membres.length} lienTout="/membres">
              {membres.slice(0, 5).map((m) => (
                <Link key={m.id} to="/membres" className="flex items-center justify-between px-5 py-3 hover:bg-parchment-50 border-b border-ink-950/5 last:border-0">
                  <span className="text-sm font-medium text-ink-950">{m.nom}</span>
                  <span className="text-xs text-ink-700/50">{m.role}</span>
                </Link>
              ))}
            </Section>
          )}

          {correspondances.length > 0 && (
            <Section titre="Correspondance" icon={Mail} count={correspondances.length} lienTout="/correspondance">
              {correspondances.slice(0, 5).map((c) => (
                <Link key={c.id} to="/correspondance" className="flex items-center justify-between px-5 py-3 hover:bg-parchment-50 border-b border-ink-950/5 last:border-0">
                  <span className="text-sm font-medium text-ink-950 truncate max-w-[70%]">{c.objet}</span>
                  <span className="text-xs text-ink-700/50 font-mono">{c.dateReception}</span>
                </Link>
              ))}
            </Section>
          )}

          {annonces.length > 0 && (
            <Section titre="Annonces" icon={Megaphone} count={annonces.length} lienTout="/annonces">
              {annonces.slice(0, 5).map((a) => (
                <Link key={a.id} to="/annonces" className="flex items-center justify-between px-5 py-3 hover:bg-parchment-50 border-b border-ink-950/5 last:border-0">
                  <span className="text-sm font-medium text-ink-950 truncate max-w-[70%]">{a.titre}</span>
                  <span className="text-xs text-ink-700/50">{a.Eglise?.nom}</span>
                </Link>
              ))}
            </Section>
          )}
        </div>
      )}
    </Layout>
  )
}

function Section({ titre, icon: Icon, count, lienTout, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="font-display text-lg text-ink-950 flex items-center gap-2">
          <Icon size={16} className="text-gold-600" /> {titre}
          <span className="text-xs font-normal text-ink-700/50 font-mono">({count})</span>
        </h2>
        <Link to={lienTout} className="text-xs font-semibold text-gold-700 hover:underline">Voir tout</Link>
      </div>
      <div className="border-t border-ink-950/5">{children}</div>
    </div>
  )
}
