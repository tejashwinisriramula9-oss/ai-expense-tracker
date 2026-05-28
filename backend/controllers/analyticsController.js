import { Transaction } from '../models/Transaction.js'
import { Budget } from '../models/Budget.js'
import { Goal } from '../models/Goal.js'

// Shared savings keyword helper
const SAVINGS_KW = ['saving', 'savings', 'savings deposit', 'save']
const isSavingsKw = (s) => SAVINGS_KW.some((kw) => String(s || '').toLowerCase().includes(kw))
const isSavingsTx = (t) => isSavingsKw(t.category) || isSavingsKw(t.title)

const monthKeyUTC = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`

const formatMonthLabel = (d) =>
  d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })

const formatDayLabel = (d) => d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })

export const getAnalyticsSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
    const budgets = await Budget.find({ userId: req.userId })
    const goals   = await Goal.find({ userId: req.userId })

    const sorted = transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date))

    const income_total = sorted
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const expense_total = sorted
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const balance = income_total - expense_total

    // Category breakdown (expenses only)
    const category_breakdown = {}
    for (const t of sorted.filter((x) => x.type === 'expense')) {
      const key = t.category || 'Uncategorized'
      category_breakdown[key] = (category_breakdown[key] || 0) + Number(t.amount || 0)
    }

    // Monthly aggregates for last 6 months (UTC)
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
      months.push({ key: monthKeyUTC(d), label: formatMonthLabel(d) })
    }

    const monthly_income = months.map(() => 0)
    const monthly_expenses = months.map(() => 0)

    for (const t of sorted) {
      const d = new Date(t.date)
      const key = monthKeyUTC(d)
      const idx = months.findIndex((m) => m.key === key)
      if (idx === -1) continue
      if (t.type === 'income') monthly_income[idx] += Number(t.amount || 0)
      if (t.type === 'expense') monthly_expenses[idx] += Number(t.amount || 0)
    }

    // Recent spending trends: last 7 days expenses (UTC)
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i))
      days.push({ iso: d.toISOString().slice(0, 10), label: formatDayLabel(d) })
    }
    const daily_expenses = days.map(() => 0)
    for (const t of sorted.filter((x) => x.type === 'expense')) {
      const d = new Date(t.date)
      const iso = d.toISOString().slice(0, 10)
      const idx = days.findIndex((x) => x.iso === iso)
      if (idx !== -1) daily_expenses[idx] += Number(t.amount || 0)
    }

    // Budgets: recompute spentAmount from transactions so UI stays in sync.
    // Savings-type budget categories also count savings transactions (any type).
    const budgetCategories = budgets.map((b) => b.category || 'Uncategorized')
    const savingsBudgetCats = budgetCategories.filter(isSavingsKw)

    const spentByCategory = {}
    for (const t of sorted) {
      const cat = t.category || 'Uncategorized'
      const txIsSavings = isSavingsTx(t)
      if (txIsSavings) {
        for (const bc of savingsBudgetCats) {
          spentByCategory[bc] = (spentByCategory[bc] || 0) + Number(t.amount || 0)
        }
      } else if (t.type === 'expense') {
        spentByCategory[cat] = (spentByCategory[cat] || 0) + Number(t.amount || 0)
      }
    }

    const budget_summary = budgets.map((b) => {
      const cat       = b.category || 'Uncategorized'
      const spent     = spentByCategory[cat] || 0
      const limit     = Number(b.limit || 0)
      const remaining = Math.max(limit - spent, 0)
      const isSavings = isSavingsKw(cat)
      return {
        ...b.toObject(),
        spentAmount:     spent,
        remainingAmount: remaining,
        isSavings,
      }
    })

    // ── Savings summary ──────────────────────────────────────────
    // Total saved = sum of all savings-keyword transactions
    const savings_total = sorted
      .filter(isSavingsTx)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)

    // This month's savings
    const nowMonth = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
    const savings_this_month = sorted
      .filter((t) => isSavingsTx(t) && monthKeyUTC(new Date(t.date)) === nowMonth)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)

    // Hydrate goals with savings data (same logic as goalController)
    let remainingSavings = savings_total
    const goals_summary = goals.map((g) => {
      const target    = Number(g.targetAmount || 0)
      const allocated = Math.min(remainingSavings, target)
      remainingSavings = Math.max(remainingSavings - allocated, 0)
      const pct = target > 0 ? Math.round((allocated / target) * 100) : 0
      return {
        _id:            g._id,
        goalName:       g.goalName,
        targetAmount:   target,
        savedAmount:    allocated,
        remainingAmount: Math.max(target - allocated, 0),
        progress:       pct,
        targetDate:     g.targetDate,
        isSavings:      true,
      }
    })

    // Daily savings suggestion: pick the closest incomplete goal
    const activeGoal = goals_summary.find((g) => g.progress < 100) || null
    let daily_savings_suggestion = null
    if (activeGoal) {
      const daysLeft = Math.max(
        1,
        Math.ceil((new Date(activeGoal.targetDate) - now) / (1000 * 60 * 60 * 24))
      )
      daily_savings_suggestion = {
        goalName:    activeGoal.goalName,
        amountNeeded: activeGoal.remainingAmount,
        daysLeft,
        perDay: Math.ceil(activeGoal.remainingAmount / daysLeft),
      }
    }

    // Deterministic "prediction": use last 30 days average daily expense * 30.
    const thirtyDaysAgo = new Date(now)
    thirtyDaysAgo.setUTCDate(now.getUTCDate() - 30)
    const expensesLast30 = sorted
      .filter((t) => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const spending_prediction = Math.max((expensesLast30 / 30) * 30, 0) * 1.06

    res.json({
      income_total,
      expense_total,
      balance,
      category_breakdown,
      budget_summary,
      spending_prediction,
      savings_total,
      savings_this_month,
      goals_summary,
      daily_savings_suggestion,
      monthly: {
        labels: months.map((m) => m.label),
        income: monthly_income,
        expenses: monthly_expenses,
      },
      daily_expenses: {
        labels: days.map((d) => d.label),
        expenses: daily_expenses,
      },
      recent_transactions: sorted.slice(0, 6),
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message })
  }
}

export const getAnalyticsForecast = async (req, res) => {
  try {
    // Forecast endpoint kept deterministic (no external AI): average daily expense in last 14 days.
    const transactions = await Transaction.find({ userId: req.userId })
    const sorted = transactions.slice().sort((a, b) => new Date(a.date) - new Date(b.date))
    const now = new Date()
    const fourteenDaysAgo = new Date(now)
    fourteenDaysAgo.setUTCDate(now.getUTCDate() - 14)

    const expensesLast14 = sorted
      .filter((t) => t.type === 'expense' && new Date(t.date) >= fourteenDaysAgo)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const avgDaily = expensesLast14 / 14

    const forecast = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + i))
      forecast.push({
        date: d.toISOString().slice(0, 10),
        spending: Math.max(avgDaily, 0),
      })
    }

    res.json({ forecast })
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch forecast', error: error.message })
  }
}
