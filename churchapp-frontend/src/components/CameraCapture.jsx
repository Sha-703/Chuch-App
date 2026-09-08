import { useEffect, useRef, useState } from 'react'
import { Camera, X, RotateCcw, Check, AlertTriangle } from 'lucide-react'

// Ouvre la caméra du téléphone/ordinateur, permet de cadrer un document et
// de "capturer" une photo qui sera transmise comme un fichier normal
// (même flux que l'upload classique côté API).
export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [erreur, setErreur] = useState('')
  const [photo, setPhoto] = useState(null) // dataURL de l'aperçu avant validation
  const [pret, setPret] = useState(false)

  useEffect(() => {
    let annule = false
    async function demarrer() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        })
        if (annule) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => setPret(true)
        }
      } catch (err) {
        setErreur(
          err.name === 'NotAllowedError'
            ? "Accès à la caméra refusé. Autorisez l'accès dans les réglages de votre navigateur, ou choisissez un fichier."
            : "Impossible d'accéder à la caméra sur cet appareil. Choisissez un fichier à la place."
        )
      }
    }
    demarrer()
    return () => {
      annule = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  function capturer() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    setPhoto(canvas.toDataURL('image/jpeg', 0.92))
  }

  function reprendre() {
    setPhoto(null)
  }

  function valider() {
    canvasRef.current.toBlob(
      (blob) => {
        const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' })
        onCapture(file)
      },
      'image/jpeg',
      0.92
    )
  }

  return (
    <div className="fixed inset-0 bg-ink-950/80 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-950/5">
          <h3 className="font-display text-lg text-ink-950 flex items-center gap-2">
            <Camera size={18} /> Scanner un document
          </h3>
          <button onClick={onClose} className="text-ink-700/50 hover:text-ink-950"><X size={18} /></button>
        </div>

        <div className="bg-ink-950 aspect-[3/4] relative flex items-center justify-center">
          {erreur ? (
            <div className="text-center p-6">
              <AlertTriangle className="text-clay-500 mx-auto mb-3" size={28} />
              <p className="text-parchment-100 text-sm">{erreur}</p>
            </div>
          ) : photo ? (
            <img src={photo} alt="Aperçu du document scanné" className="w-full h-full object-contain" />
          ) : (
            <>
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              {pret && (
                <div className="absolute inset-6 border-2 border-gold-500/70 rounded-lg pointer-events-none" />
              )}
            </>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <div className="p-4 flex items-center justify-center gap-3">
          {erreur ? (
            <button onClick={onClose} className="text-sm font-semibold text-ink-800 px-4 py-2">Fermer</button>
          ) : photo ? (
            <>
              <button
                onClick={reprendre}
                className="flex items-center gap-1.5 border border-ink-950/15 text-ink-800 rounded-lg px-4 py-2.5 text-sm font-semibold hover:border-gold-500/60"
              >
                <RotateCcw size={15} /> Reprendre
              </button>
              <button
                onClick={valider}
                className="flex items-center gap-1.5 bg-ink-950 text-parchment-50 rounded-lg px-4 py-2.5 text-sm font-semibold hover:bg-ink-900"
              >
                <Check size={15} /> Utiliser cette photo
              </button>
            </>
          ) : (
            <button
              onClick={capturer}
              disabled={!pret}
              className="w-16 h-16 rounded-full border-4 border-gold-500 bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Prendre la photo"
            />
          )}
        </div>
      </div>
    </div>
  )
}
