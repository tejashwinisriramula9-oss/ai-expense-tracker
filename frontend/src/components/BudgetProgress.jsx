export default function BudgetProgress({ category, spent, limit }) {
  const progress = Math.min(100, Math.round((spent / Math.max(limit, 1)) * 100))
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{category}</p>
          <p className="mt-2 text-xl font-semibold text-white">{spent.toFixed(0)} / {limit.toFixed(0)}</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate-300">
          {progress}%
        </span>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
