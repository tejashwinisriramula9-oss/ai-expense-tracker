export default function GoalCard({ name, saved, target, date }) {
  const progress = Math.min(100, Math.round((saved / Math.max(target, 1)) * 100))
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft">
      <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{name}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-white">{Math.round((saved / Math.max(target, 1)) * 100)}%</h3>
          <p className="mt-2 text-sm text-slate-300">Saved {saved.toFixed(0)} of {target.toFixed(0)} by {date}</p>
        </div>
        <span className="rounded-3xl bg-slate-800 px-4 py-2 text-xs text-slate-300">Target</span>
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
