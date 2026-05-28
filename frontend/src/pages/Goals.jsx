import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import api from '../api/axiosConfig'
import { formatCurrency, formatDate } from '../utils/helpers'
import ConfirmModal from '../components/ConfirmModal'

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  )
}

export default function Goals() {
  const [goals, setGoals]         = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingSaved, setEditingSaved] = useState(0)
  const [form, setForm] = useState({ goalName: '', targetAmount: '', targetDate: '' })
  const [showForm, setShowForm]   = useState(false)

  // Confirm modal
  const [confirmOpen, setConfirmOpen]     = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const r = await api.get('/goals')
      setGoals(Array.isArray(r.data) ? r.data : [])
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchGoals() }, [])

  const reset = () => {
    setEditingId(null); setEditingSaved(0)
    setForm({ goalName: '', targetAmount: '', targetDate: '' })
    setError(''); setShowForm(false)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const goalName     = form.goalName.trim()
    const targetAmount = Number(form.targetAmount)
    const targetDate   = form.targetDate ? new Date(form.targetDate).toISOString() : undefined
    if (!goalName || !Number.isFinite(targetAmount) || targetAmount <= 0 || !targetDate) {
      setError('Goal name, target amount > 0, and date required.')
      return
    }
    try {
      if (editingId) {
        await api.put(`/goals/${editingId}`, { goalName, targetAmount, savedAmount: editingSaved, targetDate })
        toast.success('Goal updated!')
      } else {
        await api.post('/goals', { goalName, targetAmount, targetDate, savedAmount: 0 })
        toast.success('Goal added!')
      }
      reset()
      fetchGoals()
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Save failed'
      setError(msg); toast.error(msg)
    }
  }

  const onEdit = (g) => {
    setEditingId(g._id ?? g.id)
    setEditingSaved(Number(g.savedAmount ?? 0))
    setForm({
      goalName: g.goalName || '',
      targetAmount: String(g.targetAmount ?? ''),
      targetDate: g.targetDate ? new Date(g.targetDate).toISOString().slice(0, 10) : '',
    })
    setShowForm(true)
  }

  const onDelete = (g) => {
    setPendingDelete(g)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setConfirmOpen(false)
    try {
      await api.delete(`/goals/${pendingDelete._id ?? pendingDelete.id}`)
      toast.success('Goal deleted.')
      fetchGoals()
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Delete failed')
    } finally { setPendingDelete(null) }
  }

  const inp = 'w-full rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-white outline-none placeholder-slate-500 focus:border-indigo-500 transition'

  return (
    <>
      <ConfirmModal
        open={confirmOpen}
        message={`Delete goal "${pendingDelete?.goalName || pendingDelete?.name}"?`}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDelete(null) }}
      />

      <div className="space-y-4">
        {/* Header action */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Savings Goals</h2>
          <button
            onClick={() => { reset(); setShowForm((s) => !s) }}
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:brightness-110 transition"
          >
            {showForm ? '✕ Close' : '+ Add Goal'}
          </button>
        </div>

        {/* Info banner — how savings connect */}
        <div className="flex items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
          <span className="mt-0.5 text-base">💡</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Goals are funded automatically from your <span className="text-indigo-300 font-medium">Savings</span> transactions.
            Add a transaction with category <span className="text-indigo-300 font-medium">"Savings"</span> and the saved amount
            will update here in real time.
          </p>
        </div>

        {/* Form (collapsible) */}
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {editingId ? 'Edit goal' : 'New goal'}
              </p>
              <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <input className={inp} placeholder="Goal name" value={form.goalName} onChange={(e) => setForm((s) => ({ ...s, goalName: e.target.value }))} required />
                <input type="number" step="0.01" min="0" className={inp} placeholder="Target amount (₹)" value={form.targetAmount} onChange={(e) => setForm((s) => ({ ...s, targetAmount: e.target.value }))} required />
                <input type="date" className={inp} value={form.targetDate} onChange={(e) => setForm((s) => ({ ...s, targetDate: e.target.value }))} required />
                <button type="submit" disabled={loading} className="rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 py-2 text-sm font-semibold text-slate-950 hover:brightness-110 transition disabled:opacity-60">
                  {editingId ? 'Update' : 'Add'}
                </button>
              </form>
              {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
            </Card>
          </motion.div>
        )}

        {/* Goal cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : goals.length === 0 ? (
          <Card><div className="py-10 text-center text-sm text-slate-500">No goals yet. Click "+ Add Goal" to start.</div></Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {goals.map((g) => {
              // Use backend-computed values; fall back to local calculation if needed
              const target    = Number(g.targetAmount ?? 0)
              const saved     = Number(g.savedAmount  ?? 0)
              const pct       = g.progress !== undefined
                ? Number(g.progress)
                : (target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0)
              const remaining = g.remainingAmount !== undefined
                ? Number(g.remainingAmount)
                : Math.max(target - saved, 0)
              const isComplete = pct >= 100

              return (
                <div
                  key={g._id ?? g.id}
                  className="rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-sm p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(99,102,241,0.1)] hover:border-indigo-500/20"
                >
                  {/* Title + badge */}
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm font-semibold text-white leading-snug">{g.goalName ?? g.name}</p>
                    <span className={`ml-2 shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${isComplete ? 'bg-emerald-500/15 text-emerald-300' : 'bg-indigo-500/15 text-indigo-300'}`}>
                      {pct}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-700/60 mb-3">
                    <motion.div
                      className={`h-full rounded-full ${isComplete ? 'bg-emerald-400' : 'bg-gradient-to-r from-indigo-500 to-sky-400'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Amounts row */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="rounded-lg bg-slate-800/50 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Saved</p>
                      <p className="text-sm font-semibold text-emerald-400">{formatCurrency(saved)}</p>
                    </div>
                    <div className="rounded-lg bg-slate-800/50 px-3 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Target</p>
                      <p className="text-sm font-semibold text-white">{formatCurrency(target)}</p>
                    </div>
                  </div>

                  {/* Remaining / deadline */}
                  {isComplete ? (
                    <p className="text-[11px] text-emerald-400 mb-3 font-medium">🎉 Goal reached!</p>
                  ) : (
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[11px] text-slate-400">
                        <span className="text-rose-300 font-medium">{formatCurrency(remaining)}</span> remaining
                      </p>
                      <p className="text-[11px] text-slate-500">by {formatDate(g.targetDate ?? g.date)}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(g)} className="rounded-lg border border-white/10 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-indigo-500 hover:text-white transition">Edit</button>
                    <button onClick={() => onDelete(g)} className="rounded-lg border border-rose-700/40 bg-rose-950/20 px-2.5 py-1 text-[11px] text-rose-300 hover:border-rose-400 transition">Delete</button>
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </div>
    </>
  )
}
