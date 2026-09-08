export default function Footer() {
  return (
    <footer className="mt-10">
      <div className="woven-rule mx-6 md:mx-10 mb-4" />
      <div className="px-6 md:px-10 pb-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-700/50 font-mono">
        <span>© {new Date().getFullYear()} ChurchApp</span>
        <span>Fait pour les églises de la RDC</span>
      </div>
    </footer>
  )
}
