import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, Tooltip, Legend,
} from 'chart.js'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../api/axiosConfig'
import { formatCurrency, formatDate } from '../utils/helpers'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

// ── Savings keyword check (mirrors backend) ───────────────────
const SAVINGS_KW = ['saving', 'savings', 'savings deposit', 'save']
const isSavingsCategory = (cat) => SAVINGS_KW.some((kw) => String(cat || '').toLowerCase().includes(kw))

// ── Motivational message by progress % ───────────────────────
function savingsMessage(pct) {
  if (pct >= 100) return { text: 'Congratulations! Goal achieved 🎉', color: 'text-emerald-300' }
  if (pct >= 76)  return { text: 'Very close to your goal 🎯',        color: 'text-sky-300' }
  if (pct >= 51)  return { text: 'Almost there! Keep going 🔥',       color: 'text-indigo-300' }
  if (pct >= 26)  return { text: 'Making solid progress 🚀',          color: 'text-indigo-300' }
  return               { text: 'Good start! Keep saving 💪',          color: 'text-slate-300' }
}

const baseOpts = {
  responsive: true, maintainAspectRatio: false,
  animation: { duration: 800, easing: 'easeInOutQuart' },
  plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
  scales: {
    x: { grid: { color: 'rgba(148,163,184,0.07)' }, ticks: { color: '#94a3b8', font: { size: 11 } } },
    y: { grid: { color: 'rgba(148,163,184,0.07)' }, ticks: { color: '#94a3b8', font: { size: 11 } }, beginAtZero: true },
  },
}
const donutOpts = {
  responsive: true, maintainAspectRatio: false,
  animation: { duration: 900, easing: 'easeInOutQuart' },
  plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', boxWidth: 10, padding: 10, font: { size: 11 } } } },
  cutout: '68%',
}
const CAT_COLORS = ['#818cf8','#38bdf8','#f472b6','#fb7185','#34d399','#fbbf24','#a855f7','#60a5fa']

// ── Shared card ───────────────────────────────────────────────
function Card({ children, className = '', hover = false }) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-slate-900/70 backdrop-blur-sm transition-all duration-200
      ${hover ? 'hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(99,102,241,0.12)] hover:border-indigo-500/20' : ''}
      ${className}`}>
      {children}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ title, value, icon, colorClass, sub, subUp }) {
  return (
    <Card hover className="flex items-center gap-3 px-4 py-4">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base ${colorClass}`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-slate-400">{title}</p>
        <p className="text-lg font-bold text-white leading-tight">{value}</p>
        {sub && (
          <p className={`mt-0.5 text-[11px] font-medium ${subUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {subUp ? '↑' : '↓'} {sub}
          </p>
        )}
      </div>
    </Card>
  )
}

// ── EXPENSE-ONLY budget alert (never fires for savings) ───────
function BudgetAlertCard({ budget }) {
  if (isSavingsCategory(budget.category)) return null   // ← savings never alert
  const spent = Number(budget.spentAmount ?? 0)
  const limit = Number(budget.limit ?? 0)
  const pct   = limit > 0 ? Math.round((spent / limit) * 100) : 0
  if (pct < 80) return null
  const over = pct >= 100
  return (
    <div className={`alert-pulse rounded-2xl border px-4 py-3
      ${over ? 'border-rose-500/40 bg-rose-950/30' : 'border-amber-500/30 bg-amber-950/20'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm">{over ? '🚨' : '⚠️'}</span>
          <p className="text-sm font-semibold text-white">{budget.category}</p>
        </div>
        <span className={`text-xs font-bold ${over ? 'text-rose-300' : 'text-amber-300'}`}>{pct}%</span>
      </div>
      <p className={`text-xs ${over ? 'text-rose-300' : 'text-amber-300'}`}>
        {over ? `Over budget by ${formatCurrency(spent - limit)}` : `${formatCurrency(limit - spent)} remaining`}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
        <div className={`h-full rounded-full ${over ? 'bg-rose-400' : 'bg-amber-400'}`}
          style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  )
}

// ── Savings Achievement card (positive, green/blue) ───────────
function SavingsAchievementCard({ goal }) {
  const pct     = Number(goal.progress ?? 0)
  const saved   = Number(goal.savedAmount ?? 0)
  const target  = Number(goal.targetAmount ?? 0)
  const remaining = Number(goal.remainingAmount ?? 0)
  const msg     = savingsMessage(pct)
  const isComplete = pct >= 100

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl border p-4 transition-all duration-200
        ${isComplete
          ? 'border-emerald-500/40 bg-emerald-950/30 shadow-[0_0_24px_rgba(52,211,153,0.12)]'
          : 'border-indigo-500/25 bg-indigo-950/20 shadow-[0_0_20px_rgba(99,102,241,0.08)]'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-0.5">Savings Goal</p>
          <p className="text-sm font-semibold text-white">{goal.goalName}</p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold
          ${isComplete ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/15 text-indigo-300'}`}>
          {pct}%
        </span>
      </div>

      {/* Animated progress bar */}
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-700/60 mb-3">
        <motion.div
          className={`h-full rounded-full ${isComplete
            ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
            : 'bg-gradient-to-r from-indigo-500 to-sky-400'}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(pct, 100)}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>

      {/* Amounts */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg bg-slate-800/50 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Saved</p>
          <p className="text-sm font-bold text-emerald-400">{formatCurrency(saved)}</p>
        </div>
        <div className="rounded-lg bg-slate-800/50 px-3 py-2">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">Target</p>
          <p className="text-sm font-bold text-white">{formatCurrency(target)}</p>
        </div>
      </div>

      {/* Status line */}
      {isComplete ? (
        <p className="text-xs font-semibold text-emerald-300">✅ Goal completed successfully!</p>
      ) : (
        <p className="text-xs text-slate-400">
          <span className="text-sky-300 font-medium">{formatCurrency(remaining)}</span> more to reach your goal
        </p>
      )}

      {/* Motivational message */}
      <p className={`mt-1.5 text-[11px] font-medium ${msg.color}`}>{msg.text}</p>
    </motion.div>
  )
}

// ── Goal completion banner (100%+) ────────────────────────────
function GoalCompletedBanner({ goalName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-emerald-500/40 bg-emerald-950/30 px-5 py-4
        shadow-[0_0_32px_rgba(52,211,153,0.15)] flex items-center gap-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
        bg-emerald-500/20 text-xl animate-bounce">
        🎉
      </div>
      <div>
        <p className="text-sm font-bold text-emerald-300">Savings Goal Achieved!</p>
        <p className="text-xs text-slate-400 mt-0.5">
          <span className="text-white font-medium">{goalName}</span> — Congratulations on reaching your target!
        </p>
      </div>
      <div className="ml-auto shrink-0 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300">
        100% ✓
      </div>
    </motion.div>
  )
}

function Empty() {
  return <div className="flex h-full items-center justify-center text-slate-500 text-xs">No data yet</div>
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const load = () => {
    setLoading(true)
    api.get('/analytics/summary')
      .then((r) => setSummary(r.data || null))
      .catch((e) => setError(e?.response?.data?.message || e.message || 'Failed'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="text-sm text-slate-400">Loading dashboard…</p>
      </div>
    </div>
  )
  if (error) return <div className="py-16 text-center text-rose-300 text-sm">{error}</div>
  if (!summary) return (
    <div className="py-16 text-center text-slate-400 text-sm">
      No data yet. <Link to="/transactions" className="text-indigo-400 underline">Add your first transaction.</Link>
    </div>
  )

  const income  = Number(summary.income_total  || 0)
  const expense = Number(summary.expense_total || 0)
  const balance = Number(summary.balance       || 0)

  // Savings from backend (sum of all savings transactions)
  const savingsTotal      = Number(summary.savings_total      || 0)
  const savingsThisMonth  = Number(summary.savings_this_month || 0)
  const goalsSummary      = Array.isArray(summary.goals_summary) ? summary.goals_summary : []
  const dailySuggestion   = summary.daily_savings_suggestion || null

  const monthlyLabels   = summary.monthly?.labels   || []
  const monthlyExpenses = summary.monthly?.expenses || []
  const monthlyIncome   = summary.monthly?.income   || []
  const dailyLabels     = summary.daily_expenses?.labels   || []
  const dailyExpenses   = summary.daily_expenses?.expenses || []

  const catEntries = Object.entries(summary.category_breakdown || {})
  const catLabels  = catEntries.map(([k]) => k)
  const catValues  = catEntries.map(([, v]) => v)
  const colors     = CAT_COLORS.slice(0, catLabels.length)

  const recentTx = summary.recent_transactions || []
  const budgets  = Array.isArray(summary.budget_summary) ? summary.budget_summary : []

  // Only non-savings budgets trigger alerts
  const alertBudgets = budgets.filter((b) => {
    if (isSavingsCategory(b.category)) return false
    const p = Number(b.limit) > 0 ? (Number(b.spentAmount) / Number(b.limit)) * 100 : 0
    return p >= 80
  })

  // Completed goals (for banner)
  const completedGoals = goalsSummary.filter((g) => Number(g.progress) >= 100)
  // Active (incomplete) goals for insights
  const activeGoals = goalsSummary.filter((g) => Number(g.progress) < 100)

  const barData = {
    labels: monthlyLabels,
    datasets: [
      { label: 'Expenses', data: monthlyExpenses, backgroundColor: 'rgba(251,113,133,0.75)', borderRadius: 6 },
      { label: 'Income',   data: monthlyIncome,   backgroundColor: 'rgba(52,211,153,0.65)',  borderRadius: 6 },
    ],
  }
  const barOptsGrouped = {
    ...baseOpts,
    plugins: {
      legend: { display: true, labels: { color: '#94a3b8', boxWidth: 10, font: { size: 11 } } },
      tooltip: { mode: 'index', intersect: false },
    },
  }
  const lineData = {
    labels: dailyLabels,
    datasets: [{ data: dailyExpenses, borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.07)',
      borderWidth: 2, pointRadius: 3, tension: 0.4, fill: true }],
  }
  const donutData = {
    labels: catLabels,
    datasets: [{ data: catValues, backgroundColor: colors, borderWidth: 0 }],
  }

  return (
    <div className="space-y-4">

      {/* ── Goal completion banners (100%+) ── */}
      <AnimatePresence>
        {completedGoals.map((g) => (
          <GoalCompletedBanner key={g._id} goalName={g.goalName} />
        ))}
      </AnimatePresence>

      {/* ── Expense-only budget alerts ── */}
      {alertBudgets.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {alertBudgets.map((b) => <BudgetAlertCard key={b._id ?? b.category} budget={b} />)}
        </motion.div>
      )}

      {/* ── 5-card stat row ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard title="Balance"  value={formatCurrency(balance)}      icon="₹" colorClass="bg-indigo-500/15 text-indigo-300"  sub="current" subUp={balance >= 0} />
        <StatCard title="Income"   value={formatCurrency(income)}       icon="↑" colorClass="bg-emerald-500/15 text-emerald-300" sub="total earned" subUp={true} />
        <StatCard title="Expenses" value={formatCurrency(expense)}      icon="↓" colorClass="bg-rose-500/15 text-rose-300"       sub="total spent"  subUp={false} />
        <StatCard title="Saved"    value={formatCurrency(savingsTotal)} icon="🏦" colorClass="bg-sky-500/15 text-sky-300"         sub={savingsTotal > 0 ? 'total saved' : 'start saving'} subUp={savingsTotal > 0} />
        <StatCard title="Goals"    value={`${goalsSummary.length} active`} icon="🎯" colorClass="bg-violet-500/15 text-violet-300" sub={completedGoals.length > 0 ? `${completedGoals.length} completed` : 'in progress'} subUp={completedGoals.length > 0} />
      </motion.div>

      {/* ── Savings Achievement cards (one per goal) ── */}
      {goalsSummary.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">✨ Savings Insights</p>
            <Link to="/goals" className="text-[11px] text-indigo-400 hover:text-indigo-300 transition">View all →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {goalsSummary.map((g) => (
              <SavingsAchievementCard key={g._id} goal={g} />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Daily savings suggestion ── */}
      {dailySuggestion && dailySuggestion.amountNeeded > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 rounded-2xl border border-sky-500/20 bg-sky-950/20 px-5 py-3">
          <span className="text-xl shrink-0">💡</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-sky-300">Smart Savings Tip</p>
            <p className="text-xs text-slate-400 mt-0.5">
              To reach <span className="text-white font-medium">{dailySuggestion.goalName}</span> in{' '}
              <span className="text-white font-medium">{dailySuggestion.daysLeft} days</span>, save{' '}
              <span className="text-sky-300 font-bold">{formatCurrency(dailySuggestion.perDay)}/day</span>
              {' '}({formatCurrency(dailySuggestion.amountNeeded)} remaining).
            </p>
          </div>
          {savingsThisMonth > 0 && (
            <div className="shrink-0 text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">This month</p>
              <p className="text-sm font-bold text-emerald-400">{formatCurrency(savingsThisMonth)}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* ── Charts row ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.9fr_0.9fr]">
        <Card hover className="p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">Monthly Overview</p>
          <div className="h-44">{monthlyLabels.length ? <Bar data={barData} options={barOptsGrouped} /> : <Empty />}</div>
        </Card>
        <Card hover className="p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">7-Day Spend</p>
          <div className="h-44">{dailyLabels.length ? <Line data={lineData} options={baseOpts} /> : <Empty />}</div>
        </Card>
        <Card hover className="p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">By Category</p>
          <div className="h-44">{catLabels.length ? <Doughnut data={donutData} options={donutOpts} /> : <Empty />}</div>
        </Card>
      </motion.div>

      {/* ── Bottom row ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.8fr]">

        {/* Recent transactions */}
        <Card>
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Recent Transactions</p>
            <Link to="/transactions" className="rounded-lg bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/30 transition">
              + Add
            </Link>
          </div>
          {recentTx.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">No transactions yet.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentTx.map((tx) => {
                const isSavings = isSavingsCategory(tx.category) || isSavingsCategory(tx.title)
                return (
                  <div key={tx._id} className="flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.025] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs
                        ${isSavings ? 'bg-sky-500/15 text-sky-300'
                          : tx.type === 'income' ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-rose-500/15 text-rose-300'}`}>
                        {isSavings ? '🏦' : tx.type === 'income' ? '↑' : '↓'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{tx.title}</p>
                        <p className="text-[11px] text-slate-400">{tx.category} · {formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold
                      ${isSavings ? 'text-sky-400'
                        : tx.type === 'income' ? 'text-emerald-400'
                        : 'text-rose-400'}`}>
                      {isSavings ? '🏦' : tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Right column: budget status (expense budgets only) */}
        <div className="flex flex-col gap-4">
          <Card hover className="flex-1">
            <div className="border-b border-white/5 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Budget Status</p>
            </div>
            {budgets.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                <Link to="/budget" className="text-indigo-400 underline">Set budgets</Link> to track limits.
              </div>
            ) : (
              <div className="space-y-3 p-4">
                {budgets.slice(0, 5).map((b) => {
                  const isSavings = isSavingsCategory(b.category)
                  const spent     = Number(b.spentAmount ?? 0)
                  const limit     = Number(b.limit ?? 0)
                  const pct       = limit > 0 ? Math.min(isSavings ? 999 : 100, Math.round((spent / limit) * 100)) : 0
                  const displayPct = Math.min(pct, 100)
                  const isOver    = !isSavings && pct >= 100
                  const isWarn    = !isSavings && pct >= 80
                  const remaining = Math.max(limit - spent, 0)

                  // Savings budget: green achievement bar; expense budget: normal warning colors
                  const barColor = isSavings
                    ? (pct >= 100 ? 'bg-emerald-400' : 'bg-gradient-to-r from-sky-400 to-indigo-400')
                    : (isOver ? 'bg-rose-400' : isWarn ? 'bg-amber-400' : 'bg-indigo-400')

                  return (
                    <div key={b._id ?? b.category}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {isSavings && <span className="text-[10px]">🏦</span>}
                          <p className="text-xs font-medium text-white">{b.category}</p>
                        </div>
                        <p className={`text-[11px] font-semibold ${isSavings ? 'text-sky-300' : 'text-slate-400'}`}>
                          {pct}%
                        </p>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-700">
                        <div className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${displayPct}%` }} />
                      </div>
                      <p className={`mt-0.5 text-[10px] ${isSavings ? 'text-sky-400' : 'text-slate-500'}`}>
                        {isSavings
                          ? (pct >= 100 ? '✅ Target reached!' : `${formatCurrency(remaining)} to go`)
                          : (isOver ? `Over by ${formatCurrency(spent - limit)}` : `${formatCurrency(remaining)} remaining`)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
