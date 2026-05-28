import { useEffect, useState } from 'react'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Tooltip, Legend,
} from 'chart.js'
import { motion } from 'framer-motion'
import api from '../api/axiosConfig'
import { formatCurrency } from '../utils/helpers'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

const chartOpts = () => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 800, easing: 'easeInOutQuart' },
  plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
  scales: {
    x: { grid: { color: 'rgba(148,163,184,0.07)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    y: { grid: { color: 'rgba(148,163,184,0.07)' }, ticks: { color: '#94a3b8', font: { size: 11 } }, beginAtZero: true },
  },
})

const donutOpts = {
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 900, easing: 'easeInOutQuart' },
  plugins: { legend: { position: 'right', labels: { color: '#94a3b8', boxWidth: 10, font: { size: 11 }, padding: 8 } } },
  cutout: '65%',
}

const CAT_COLORS = ['#818cf8','#38bdf8','#f472b6','#fb7185','#34d399','#fbbf24','#a855f7','#60a5fa']

function Card({ children, className = '', hover = false }) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-sm transition-all duration-200 ${hover ? 'hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(99,102,241,0.1)] hover:border-indigo-500/20' : ''} ${className}`}>
      {children}
    </div>
  )
}

function StatBadge({ title, value, color }) {
  return (
    <div className={`rounded-xl border ${color} px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(99,102,241,0.08)]`}>
      <p className="text-[11px] uppercase tracking-wider text-slate-400">{title}</p>
      <p className="mt-0.5 text-base font-bold text-white">{value}</p>
    </div>
  )
}

function Empty() {
  return <div className="flex h-full items-center justify-center text-slate-500 text-sm">No data</div>
}

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    setLoading(true)
    api.get('/analytics/summary')
      .then((r) => setSummary(r.data || null))
      .catch((e) => setError(e?.response?.data?.message || e.message || 'Failed'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="text-sm text-slate-400">Loading analytics…</p>
      </div>
    </div>
  )
  if (error)   return <div className="py-12 text-center text-rose-300 text-sm">{error}</div>
  if (!summary) return <div className="py-12 text-center text-slate-500 text-sm">No analytics data yet.</div>

  const income  = Number(summary.income_total  || 0)
  const expense = Number(summary.expense_total || 0)
  const balance = Number(summary.balance       || 0)

  const monthlyLabels   = summary.monthly?.labels   || []
  const monthlyExpenses = summary.monthly?.expenses || []
  const monthlyIncome   = summary.monthly?.income   || []
  const dailyLabels     = summary.daily_expenses?.labels   || []
  const dailyExpenses   = summary.daily_expenses?.expenses || []

  const catEntries = Object.entries(summary.category_breakdown || {})
  const catLabels  = catEntries.map(([k]) => k)
  const catValues  = catEntries.map(([, v]) => v)
  const colors     = CAT_COLORS.slice(0, catLabels.length)

  // Top spending category
  const topCat = catEntries.length > 0
    ? catEntries.reduce((a, b) => (b[1] > a[1] ? b : a))
    : null

  const barExpense = {
    labels: monthlyLabels,
    datasets: [{ label: 'Expense', data: monthlyExpenses, backgroundColor: 'rgba(251,113,133,0.75)', borderRadius: 6 }],
  }
  const barIncome = {
    labels: monthlyLabels,
    datasets: [{ label: 'Income', data: monthlyIncome, backgroundColor: 'rgba(52,211,153,0.75)', borderRadius: 6 }],
  }
  const lineData = {
    labels: dailyLabels,
    datasets: [{ data: dailyExpenses, borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.06)', borderWidth: 2, tension: 0.4, fill: true, pointRadius: 3 }],
  }
  const donutData = {
    labels: catLabels,
    datasets: [{ data: catValues, backgroundColor: colors, borderWidth: 0 }],
  }

  return (
    <div className="space-y-4">
      {/* Stat row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        <StatBadge title="Total income"  value={formatCurrency(income)}  color="border-emerald-500/20" />
        <StatBadge title="Total expense" value={formatCurrency(expense)} color="border-rose-500/20" />
        <StatBadge title="Balance"       value={formatCurrency(balance)} color="border-indigo-500/20" />
        <StatBadge title="Categories"    value={catLabels.length}        color="border-sky-500/20" />
      </motion.div>

      {/* Top Spending Category card */}
      {topCat && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(251,191,36,0.1)]">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-lg">🏆</div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Top Spending Category</p>
                <p className="text-base font-bold text-white">{topCat[0]}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-amber-300">{formatCurrency(topCat[1])}</p>
              <p className="text-[11px] text-slate-500">
                {expense > 0 ? `${Math.round((topCat[1] / expense) * 100)}% of total` : ''}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Row 1: expense + income bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <Card hover className="p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Monthly Expenses</p>
          <div className="h-44">
            {monthlyLabels.length ? <Bar data={barExpense} options={chartOpts()} /> : <Empty />}
          </div>
        </Card>
        <Card hover className="p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Monthly Income</p>
          <div className="h-44">
            {monthlyLabels.length ? <Bar data={barIncome} options={chartOpts()} /> : <Empty />}
          </div>
        </Card>
      </motion.div>

      {/* Row 2: 7-day line + category donut */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        <Card hover className="p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">7-Day Spend Trend</p>
          <div className="h-44">
            {dailyLabels.length ? <Line data={lineData} options={chartOpts()} /> : <Empty />}
          </div>
        </Card>
        <Card hover className="p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Category Breakdown</p>
          <div className="h-44">
            {catLabels.length ? <Doughnut data={donutData} options={donutOpts} /> : <Empty />}
          </div>
        </Card>
      </motion.div>

      {/* Category list */}
      {catLabels.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="border-b border-white/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Spending by Category</p>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
              {catEntries.sort((a, b) => b[1] - a[1]).map(([cat, val], i) => {
                const pct = expense > 0 ? Math.round((val / expense) * 100) : 0
                return (
                  <div
                    key={cat}
                    className="rounded-xl border border-white/5 bg-slate-800/40 p-3 transition-all duration-150 hover:bg-slate-800/60 hover:border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: CAT_COLORS[i % CAT_COLORS.length] }} />
                        <p className="text-sm font-medium text-white">{cat}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-200">{formatCurrency(val)}</p>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: CAT_COLORS[i % CAT_COLORS.length] }}
                      />
                    </div>
                    <p className="mt-1 text-right text-[10px] text-slate-500">{pct}% of expenses</p>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
