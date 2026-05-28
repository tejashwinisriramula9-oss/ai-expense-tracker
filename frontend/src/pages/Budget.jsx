import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import api from '../api/axiosConfig'
import { formatCurrency } from '../utils/helpers'
import ConfirmModal from '../components/ConfirmModal'

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  )
}

export default function Budget() {
  const [budgetData, setBudgetData] = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [editingId, setEditingId]   = useState(null)
  const [editingSpent, setEditingSpent] = useState(0)
  const [form, setForm] = useState({ category: '', limit: '' })

  // Confirm modal
  const [confirmOpen, setConfirmOpen]   = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      const r = await api.get('/budgets')
      setBudgetData(Array.isArray(r.data) ? r.data : [])
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchBudgets() }, [])

  const reset = () => { setEditingId(null); setEditingSpent(0); setForm({ category: '', limit: '' }); setError('') }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const category = form.category.trim()
    const limit = Number(form.limit)
    if (!category || !Number.isFinite(limit) || limit <= 0) { setError('Category and valid limit required.'); return }
    try {
      if (editingId) {
        await api.put(`/budgets/${editingId}`, { category, limit, spentAmount: editingSpent })
        toast.success('Budget updated!')
      } else {
        await api.post('/budgets', { category, limit })
        toast.success('Budget added!')
      }
      reset()
      fetchBudgets()
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Save failed'
      setError(msg); toast.error(msg)
    }
  }

  const onEdit = (b) => {
    setEditingId(b._id ?? b.id)
    setEditingSpent(Number(b.spentAmount ?? b.spent ?? 0))
    setForm({ category: b.category || '', limit: String(b.limit ?? '') })
  }

  const onDelete = (b) => {
    setPendingDelete(b)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setConfirmOpen(false)
    try {
      await api.delete(`/budgets/${pendingDelete._id ?? pendingDelete.id}`)
      toast.success('Budget deleted.')
      fetchBudgets()
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Delete failed')
    } finally { setPendingDelete(null) }
  }

  const inp = 'w-full rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-white outline-none placeholder-slate-500 focus:border-indigo-500 transition'

  return (
    <>
      <ConfirmModal
        open={confirmOpen}
        message={`Delete budget for "${pendingDelete?.category}"?`}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDelete(null) }}
      />

      <div className="space-y-4">
        {/* Info banner */}
        <div className="flex items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
          <span className="mt-0.5 text-base">💡</span>
          <p className="text-xs text-slate-400 leading-relaxed">
            Budget progress updates automatically from your transactions.
            Create a budget with category <span className="text-indigo-300 font-medium">"Savings"</span> to track savings transactions,
            or any other category to track expense transactions.
          </p>
        </div>

        {/* Form */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {editingId ? 'Edit budget' : 'Add budget'}
            </p>
            {editingId && (
              <button onClick={reset} className="text-xs text-slate-400 hover:text-white transition">✕ Cancel</button>
            )}
          </div>
          <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <input className={inp} placeholder="Category" value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} required />
            <input type="number" step="0.01" min="0" className={inp} placeholder="Limit amount" value={form.limit} onChange={(e) => setForm((s) => ({ ...s, limit: e.target.value }))} required />
            <button type="submit" disabled={loading} className="col-span-2 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 py-2 text-sm font-semibold text-slate-950 hover:brightness-110 transition disabled:opacity-60">
              {editingId ? 'Update' : '+ Add budget'}
            </button>
          </form>
          {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
        </Card>

        {/* Budget cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          </div>
        ) : budgetData.length === 0 ? (
          <Card><div className="py-10 text-center text-sm text-slate-500">No budgets yet. Add one above.</div></Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {budgetData.map((b) => {
              const spent     = Number(b.spentAmount ?? b.spent ?? 0)
              const limit     = Number(b.limit ?? 0)
              const pct       = b.progress !== undefined
                ? Number(b.progress)
                : Math.min(100, limit > 0 ? Math.round((spent / limit) * 100) : 0)
              const remaining = b.remainingAmount !== undefined
                ? Number(b.remainingAmount)
                : Math.max(limit - spent, 0)
              const isOver    = pct >= 100
              const isWarn    = pct >= 80
              const isSafe    = pct < 50

              // Dynamic bar color: green → yellow → red
              const barColor = isOver ? 'bg-rose-400' : isWarn ? 'bg-amber-400' : isSafe ? 'bg-emerald-400' : 'bg-indigo-400'
              const badgeColor = isOver
                ? 'bg-rose-500/15 text-rose-300'
                : isWarn
                ? 'bg-amber-500/15 text-amber-300'
                : 'bg-emerald-500/15 text-emerald-300'

              return (
                <div
                  key={b._id ?? b.id}
                  className="rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-sm p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(99,102,241,0.1)] hover:border-indigo-500/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{b.category}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatCurrency(spent)} <span className="text-slate-600">of</span> {formatCurrency(limit)}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeColor}`}>
                      {pct}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 overflow-hidden rounded-full bg-slate-700/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Remaining amount */}
                  <p className={`mt-1.5 text-[11px] ${isOver ? 'text-rose-400' : 'text-slate-500'}`}>
                    {isOver
                      ? `Over by ${formatCurrency(spent - limit)}`
                      : `${formatCurrency(remaining)} remaining`}
                  </p>

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(b)}
                      className="rounded-lg border border-white/10 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-indigo-500 hover:text-white transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(b)}
                      className="rounded-lg border border-rose-700/40 bg-rose-950/20 px-2.5 py-1 text-[11px] text-rose-300 hover:border-rose-400 transition"
                    >
                      Delete
                    </button>
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
