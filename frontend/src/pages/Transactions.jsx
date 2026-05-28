import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { CSVLink } from 'react-csv'
import api from '../api/axiosConfig'
import { formatCurrency, formatDate } from '../utils/helpers'
import ConfirmModal from '../components/ConfirmModal'

const CATEGORIES = ['Food','Housing','Transport','Health','Shopping','Education','Entertainment','Travel','Fuel','Utilities','Savings','Income','General','Cash','Other']
const PAGE_SIZE  = 10

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-sm ${className}`}>
      {children}
    </div>
  )
}

const inp = 'w-full rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-white outline-none placeholder-slate-500 focus:border-indigo-500 transition'

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [search, setSearch]       = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy]       = useState('date-desc')
  const [page, setPage]           = useState(1)

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ title: '', amount: '', category: 'Food', type: 'expense', description: '', date: '' })

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const fetchTransactions = async () => {
    setLoading(true)
    setError('')
    try {
      const r = await api.get('/transactions')
      setTransactions(Array.isArray(r.data) ? r.data : [])
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Failed to load')
      setTransactions([])
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchTransactions() }, [])

  const resetForm = () => {
    setEditingId(null)
    setForm({ title: '', amount: '', category: 'Food', type: 'expense', description: '', date: '' })
    setError('')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const payload = {
      title: form.title.trim(),
      amount: Number(form.amount),
      category: form.category.trim(),
      type: form.type,
      description: form.description.trim(),
      date: form.date ? new Date(form.date).toISOString() : undefined,
    }
    if (!payload.title || !Number.isFinite(payload.amount) || payload.amount <= 0 || !payload.category) {
      setError('Title, amount > 0, and category are required.')
      return
    }
    try {
      if (editingId) {
        await api.put(`/transactions/${editingId}`, payload)
        toast.success('Transaction updated!')
      } else {
        await api.post('/transactions', payload)
        toast.success('Transaction added!')
      }
      await fetchTransactions()
      resetForm()
      setPage(1)
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || 'Save failed'
      setError(msg)
      toast.error(msg)
    }
  }

  const onEdit = (tx) => {
    setEditingId(tx._id ?? tx.id)
    setForm({
      title: tx.title || '',
      amount: tx.amount ?? '',
      category: tx.category || 'Food',
      type: tx.type || 'expense',
      description: tx.description || '',
      date: tx.date ? new Date(tx.date).toISOString().slice(0, 10) : '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Show confirm modal instead of window.confirm
  const onDelete = (tx) => {
    setPendingDelete(tx)
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setConfirmOpen(false)
    try {
      await api.delete(`/transactions/${pendingDelete._id ?? pendingDelete.id}`)
      toast.success('Transaction deleted.')
      await fetchTransactions()
      if (editingId === (pendingDelete._id ?? pendingDelete.id)) resetForm()
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || 'Delete failed')
    } finally {
      setPendingDelete(null)
    }
  }

  // Filter → sort → paginate
  const query = search.toLowerCase()
  let filtered = transactions.filter((tx) => {
    const ms = String(tx.title || '').toLowerCase().includes(query) || String(tx.category || '').toLowerCase().includes(query)
    const mt = filterType === 'all' || tx.type === filterType
    return ms && mt
  })

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'date-desc')   return new Date(b.date) - new Date(a.date)
    if (sortBy === 'date-asc')    return new Date(a.date) - new Date(b.date)
    if (sortBy === 'amount-desc') return Number(b.amount) - Number(a.amount)
    if (sortBy === 'amount-asc')  return Number(a.amount) - Number(b.amount)
    return 0
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // CSV data
  const csvData = transactions.map((tx) => ({
    title: tx.title,
    category: tx.category,
    amount: tx.amount,
    type: tx.type,
    date: tx.date ? new Date(tx.date).toLocaleDateString() : '',
  }))
  const csvHeaders = [
    { label: 'Title',    key: 'title' },
    { label: 'Category', key: 'category' },
    { label: 'Amount',   key: 'amount' },
    { label: 'Type',     key: 'type' },
    { label: 'Date',     key: 'date' },
  ]

  return (
    <>
      <ConfirmModal
        open={confirmOpen}
        message={`Are you sure you want to delete "${pendingDelete?.title}"?`}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDelete(null) }}
      />

      <div className="space-y-4">
        {/* ── Add / Edit form ── */}
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {editingId ? '✏ Edit transaction' : '+ Add transaction'}
            </p>
            <div className="flex items-center gap-2">
              {editingId && (
                <button type="button" onClick={resetForm} className="text-xs text-slate-400 hover:text-white transition">
                  ✕ Cancel
                </button>
              )}
              {/* Export CSV */}
              {transactions.length > 0 && (
                <CSVLink
                  data={csvData}
                  headers={csvHeaders}
                  filename="transactions.csv"
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
                  onClick={() => toast.success('CSV exported!')}
                >
                  ↓ Export CSV
                </CSVLink>
              )}
            </div>
          </div>

          <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <input className={inp} placeholder="Title" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} required />
            <input type="number" step="0.01" min="0" className={inp} placeholder="Amount (₹)" value={form.amount} onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))} required />
            <select className={inp} value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className={inp} value={form.type} onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input type="date" className={inp} value={form.date} onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))} />
            <button type="submit" className="rounded-xl bg-gradient-to-r from-indigo-500 to-sky-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:brightness-110 transition">
              {editingId ? 'Update' : '+ Add'}
            </button>
          </form>
          {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
        </Card>

        {/* ── Table card ── */}
        <Card>
          {/* Search + filter + sort */}
          <div className="flex flex-wrap items-center gap-3 border-b border-white/5 px-4 py-3">
            <input
              className="flex-1 min-w-[150px] rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-white outline-none placeholder-slate-500 focus:border-indigo-500 transition"
              placeholder="🔍 Search…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
            <select
              className="rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition"
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setPage(1) }}
            >
              <option value="all">All types</option>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <select
              className="rounded-xl border border-white/10 bg-slate-800/70 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500 transition"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1) }}
            >
              <option value="date-desc">Date ↓</option>
              <option value="date-asc">Date ↑</option>
              <option value="amount-desc">Amount ↓</option>
              <option value="amount-asc">Amount ↑</option>
            </select>
            <span className="text-xs text-slate-500 whitespace-nowrap">{filtered.length} entries</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          ) : paginated.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              {transactions.length === 0 ? 'No transactions yet. Add one above.' : 'No results found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm">
                  <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-slate-500">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <motion.tbody initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {paginated.map((tx) => (
                    <tr key={tx._id ?? tx.id} className="border-b border-white/5 hover:bg-white/[0.025] transition-colors">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(tx.date)}</td>
                      <td className="px-4 py-3 font-medium text-white max-w-[180px] truncate">{tx.title}</td>
                      <td className="px-4 py-3 text-slate-300">{tx.category}</td>
                      <td className={`px-4 py-3 font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onEdit(tx)}
                            className="rounded-lg border border-white/10 bg-slate-800/60 px-2.5 py-1 text-[11px] text-slate-300 hover:border-indigo-500 hover:text-white transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(tx)}
                            className="rounded-lg border border-rose-700/40 bg-rose-950/20 px-2.5 py-1 text-[11px] text-rose-300 hover:border-rose-400 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
              <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-white/10 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 hover:text-white disabled:opacity-40 transition"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-white/10 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 hover:text-white disabled:opacity-40 transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
