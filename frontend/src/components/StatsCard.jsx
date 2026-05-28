export default function StatsCard({ title, value, trend, icon, className = '' }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className="h-14 w-14 rounded-3xl bg-gradient-to-br from-indigo-500 to-sky-400 p-4 text-2xl text-slate-950 shadow-soft">
          {icon}
        </div>
      </div>
      {trend && <p className="mt-4 text-sm text-slate-400">{trend}</p>}
    </div>
  )
}
