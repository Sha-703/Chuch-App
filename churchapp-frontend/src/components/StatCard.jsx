export default function StatCard({ label, value, delta, deltaPositive = true, icon: Icon, accent = 'gold' }) {
  const accents = {
    gold: 'text-gold-600 bg-gold-500/10',
    leaf: 'text-leaf-600 bg-leaf-500/10',
    clay: 'text-clay-600 bg-clay-500/10',
    ink: 'text-ink-800 bg-ink-800/10',
  }
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-700/60 font-mono">{label}</span>
        {Icon && (
          <span className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${accents[accent]}`}>
            <Icon size={17} strokeWidth={1.75} />
          </span>
        )}
      </div>
      <div>
        <p className="font-display text-2xl text-ink-950 font-tabular">{value}</p>
        {delta && (
          <p className={`text-xs mt-1 font-mono font-medium ${deltaPositive ? 'text-leaf-600' : 'text-clay-600'}`}>
            {delta}
          </p>
        )}
      </div>
    </div>
  )
}
