import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Church, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { api } from '../lib/api'

const steps = ['Église', 'Pasteur', 'Administrateur']

const champsVides = {
  eglise: { nom: '', denomination: '', ville: '' },
  pasteur: { nom: '', email: '', telephone: '' },
  administrateur: { nom: '', email: '' },
}

export default function CreateChurch() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(champsVides)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState(null)
  const [communauteId, setCommunauteId] = useState('')
  const [communautes, setCommunautes] = useState([])
  const [chargementCommunes, setChargementCommunes] = useState(true)
  const [erreurCommunes, setErreurCommunes] = useState('')

  // Charger les communautés via endpoint PUBLIC
  useEffect(() => {
    console.log('[CreateChurch] Chargement communautés (public)...')
    api.listerCommunautes()
      .then((cs) => {
        console.log('[CreateChurch] Communautés reçues:', cs)
        setCommunautes(cs || [])
      })
      .catch((err) => {
        console.error('[CreateChurch] Erreur chargement communautés:', err)
        setCommunautes([])
        setErreurCommunes('Impossible de charger les communautés pour le moment.')
      })
      .finally(() => setChargementCommunes(false))
  }, [])

  function setChamp(section, champ, valeur) {
    setForm((f) => ({ ...f, [section]: { ...f[section], [champ]: valeur } }))
  }

  async function next() {
    if (step < steps.length - 1) {
      setStep(step + 1)
      return
    }
    setErreur('')
    setChargement(true)
    try {
      const data = await api.creerEglise({
        ...form,
        ...(communauteId ? { communauteId } : {}),
      })
      setSucces(data)
    } catch (err) {
      setErreur(err.message)
    } finally {
      setChargement(false)
    }
  }

  if (succes) {
    return (
      <div className="min-h-screen bg-parchment-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8 text-center">
          <CheckCircle2 className="mx-auto text-leaf-600 mb-4" size={40} />
          <h1 className="font-display text-2xl text-ink-950 mb-2">Église créée avec succès</h1>
          <p className="text-sm text-ink-700/70 mb-6">
            Les comptes du pasteur et de l'administrateur ont été créés pour{' '}
            <strong>{succes.eglise.nom}</strong>. Chacun a reçu un code OTP à usage unique.
          </p>
          <div className="bg-parchment-100 rounded-lg p-4 text-left text-sm space-y-2 mb-6">
            {succes.comptes.map((c) => (
              <div key={c.email} className="pb-2 border-b border-ink-950/5 last:border-0 last:pb-0">
                <p><span className="text-ink-700/60">{c.role} :</span> {c.email}</p>
                <p className="text-xs text-ink-700/50">{c.otp ? <>Code OTP : <strong className="text-ink-950">{c.otp}</strong></> : 'Code envoyé par e-mail ✉️'}</p>
              </div>
            ))}
          </div>
          <Link to="/" className="inline-flex items-center gap-2 bg-ink-950 text-parchment-50 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-ink-900 transition-colors">
            Aller à la connexion <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-ink-950 text-gold-500 mx-auto flex items-center justify-center mb-4">
            <Church size={22} strokeWidth={1.75} />
          </div>
          <h1 className="font-display text-2xl text-ink-950">Inscrire votre église sur ChurchApp</h1>
          <p className="text-sm text-ink-700/70 mt-1">Deux comptes seront créés : le pasteur et l'administrateur.</p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-1.5 rounded-full ${i <= step ? 'bg-gold-500' : 'bg-ink-950/10'}`} />
              <p className={`text-xs mt-2 font-medium ${i === step ? 'text-ink-950' : 'text-ink-700/50'}`}>{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-card p-7">
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Nom de l'église" placeholder="Ex. CEC Bethel Mbanza-Ngungu" value={form.eglise.nom} onChange={(v) => setChamp('eglise', 'nom', v)} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Dénomination" placeholder="Ex. Communauté des Églises de..." value={form.eglise.denomination} onChange={(v) => setChamp('eglise', 'denomination', v)} />
                <Field label="Ville / territoire" placeholder="Ex. Mbanza-Ngungu, Kongo-Central" value={form.eglise.ville} onChange={(v) => setChamp('eglise', 'ville', v)} />
              </div>
              {chargementCommunes ? (
                <div className="flex items-center gap-2 text-ink-700/60 text-sm py-1">
                  <Loader2 size={14} className="animate-spin" /> Chargement des communautés...
                </div>
              ) : erreurCommunes ? (
                <div>
                  <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2">⚠️ {erreurCommunes}</p>
                  <p className="text-xs text-ink-700/40 mt-1">Vérifie ta session Super Admin (Ctrl+Maj+R pour rafraîchir)</p>
                </div>
              ) : communautes.length > 0 ? (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">Communauté (optionnel)</label>
                  <select
                    value={communauteId}
                    onChange={(e) => setCommunauteId(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-ink-950/15 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 bg-white"
                  >
                    <option value="">— Aucune (église indépendante) —</option>
                    {communautes.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Nom complet du pasteur" placeholder="Ex. Past. Jean-Pierre Kibambe" value={form.pasteur.nom} onChange={(v) => setChamp('pasteur', 'nom', v)} />
              <Field label="E-mail du pasteur" placeholder="pasteur@monteglise.cd" type="email" value={form.pasteur.email} onChange={(v) => setChamp('pasteur', 'email', v)} />
              <Field label="Téléphone" placeholder="+243 8xx xxx xxx" value={form.pasteur.telephone} onChange={(v) => setChamp('pasteur', 'telephone', v)} />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <Field label="Nom complet de l'administrateur" placeholder="Ex. Sr. Grace Nsimba" value={form.administrateur.nom} onChange={(v) => setChamp('administrateur', 'nom', v)} />
              <Field label="E-mail de l'administrateur" placeholder="admin@monteglise.cd" type="email" value={form.administrateur.email} onChange={(v) => setChamp('administrateur', 'email', v)} />
              <p className="text-xs text-ink-700/60 bg-parchment-100 rounded-lg p-3">
                Les identifiants provisoires seront envoyés par e-mail aux deux comptes.
              </p>
            </div>
          )}

          {erreur && <p className="text-sm text-clay-600 bg-clay-500/10 rounded-lg px-3 py-2 mt-4">{erreur}</p>}

          <div className="flex items-center justify-between mt-7">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              className={`flex items-center gap-1.5 text-sm font-medium text-ink-700/70 hover:text-ink-950 ${step === 0 ? 'invisible' : ''}`}
            >
              <ArrowLeft size={15} /> Retour
            </button>
            <button
              onClick={next}
              disabled={chargement}
              className="flex items-center gap-2 bg-ink-950 text-parchment-50 rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-ink-900 transition-colors disabled:opacity-60"
            >
              {chargement ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>{step === steps.length - 1 ? 'Créer l\u2019église' : 'Continuer'} <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>

        <p className="text-sm text-ink-700/70 mt-6 text-center">
          Déjà inscrit ?{' '}
          <Link to="/" className="text-gold-600 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

function Field({ label, placeholder, type = 'text', value, onChange }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-ink-700/60">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-ink-950/15 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
      />
    </div>
  )
}
