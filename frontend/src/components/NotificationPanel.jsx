export default function NotificationPanel({ items = [] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft">
      <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Notification center</p>
      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <p className="text-slate-400">No notifications yet. Your dashboard will keep you updated.</p>
        ) : (
          items.map((note) => (
            <div key={note.id} className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-white">{note.title}</p>
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">{note.unread ? 'New' : 'Viewed'}</span>
              </div>
              <p className="mt-2 text-slate-300">{note.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
