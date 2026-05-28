export default function InsightCard({ title, value, detail }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.35em] text-slate-400">{title}</p>
      <h3 className="mt-4 text-2xl font-semibold text-white">{value}</h3>
      <p className="mt-3 text-sm text-slate-300">{detail}</p>
    </div>
  )
}
