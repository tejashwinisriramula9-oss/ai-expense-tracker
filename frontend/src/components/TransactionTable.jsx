import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency, formatDate } from '../utils/helpers'

export default function TransactionTable({ transactions = [], onEdit, onDelete }) {
  const [search, setSearch] = useState('')
  const query = search.toLowerCase()
  const filtered = transactions.filter((tx) => {
    const title = String(tx.title || '').toLowerCase()
    const category = String(tx.category || '').toLowerCase()
    return title.includes(query) || category.includes(query)
  })

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-soft">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Recent transactions</p>
          <h3 className="text-xl font-semibold text-white">Manage your flow</h3>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
          placeholder="Search by title or category"
        />
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        <motion.table initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="min-w-full table-auto text-left text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Type</th>
              {(onEdit || onDelete) && <th className="px-4 py-3">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx) => (
              <tr key={tx._id ?? tx.id} className="border-b border-slate-800 hover:bg-slate-900/70">
                <td className="px-4 py-4 text-slate-300">{formatDate(tx.date)}</td>
                <td className="px-4 py-4 text-white">{tx.title}</td>
                <td className="px-4 py-4 text-slate-300">{tx.category}</td>
                <td className={`px-4 py-4 font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrency(tx.amount)}
                </td>
                <td className="px-4 py-4 text-slate-300">{tx.type}</td>
                {(onEdit || onDelete) && (
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {onEdit && (
                        <button
                          className="rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-1 text-xs text-slate-200 transition hover:border-indigo-500 hover:text-white"
                          onClick={() => onEdit(tx)}
                          type="button"
                        >
                          Edit
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="rounded-2xl border border-rose-700 bg-rose-950/20 px-3 py-1 text-xs text-rose-200 transition hover:border-rose-400"
                          onClick={() => onDelete(tx)}
                          type="button"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </motion.table>
      </div>
    </div>
  )
}
