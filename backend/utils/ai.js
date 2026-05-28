// Insight generator based on real MongoDB transactions (no hardcoded financial numbers).

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0)
}

function monthKeyUTC(d) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export function generateInsightFromTransactions(question = '', transactions = []) {
  const normalized = String(question).trim().toLowerCase()
  const txs = Array.isArray(transactions) ? transactions : []

  if (txs.length === 0) {
    return {
      insight: 'No transactions found yet. Add your first income/expense to unlock insights.',
      recommendations: [
        'Add at least 5 transactions to get category and trend analytics.',
        'Start by logging recurring bills and your main income source.',
      ],
    }
  }

  const now = new Date()
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const thisMonth = txs.filter((t) => new Date(t.date) >= startOfMonth)

  const monthExpense = sum(thisMonth.filter((t) => t.type === 'expense').map((t) => Number(t.amount || 0)))
  const monthIncome = sum(thisMonth.filter((t) => t.type === 'income').map((t) => Number(t.amount || 0)))

  const byCategory = {}
  for (const t of txs.filter((x) => x.type === 'expense')) {
    const key = t.category || 'Uncategorized'
    byCategory[key] = (byCategory[key] || 0) + Number(t.amount || 0)
  }
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0]

  // last 30 days trend
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setUTCDate(now.getUTCDate() - 30)
  const last30 = txs.filter((t) => t.type === 'expense' && new Date(t.date) >= thirtyDaysAgo)
  const last30Total = sum(last30.map((t) => Number(t.amount || 0)))

  if (normalized.includes('highest') || normalized.includes('category')) {
    return {
      insight: topCategory
        ? `Your highest expense category so far is "${topCategory}".`
        : 'You do not have any expense categories yet.',
      recommendations: [
        'Set a budget limit for your top category and track weekly progress.',
        'Review the last 10 transactions and identify one cut you can make this week.',
      ],
    }
  }

  if (normalized.includes('spend this month') || normalized.includes('spent this month') || normalized.includes('this month')) {
    return {
      insight: `This month totals: income ${monthIncome.toFixed(2)}, expenses ${monthExpense.toFixed(2)}.`,
      recommendations: [
        topCategory ? `If you reduce "${topCategory}" spending by 10%, you’ll improve your balance.` : 'Categorize your expenses to see where to cut.',
        'Add missing transactions (cash, subscriptions) for accurate totals.',
      ],
    }
  }

  if (normalized.includes('saving') || normalized.includes('suggestion')) {
    return {
      insight: `In the last 30 days you spent ${last30Total.toFixed(2)} on expenses.`,
      recommendations: [
        'Identify your top 1–2 categories and set budgets for them.',
        'Move a fixed amount to savings right after income transactions.',
      ],
    }
  }

  if (normalized.includes('predict') || normalized.includes('forecast')) {
    // simple projection: last 30 days total * 1.05
    const projected = last30Total * 1.05
    return {
      insight: `Projected next 30-day expenses (based on your last 30 days): ${projected.toFixed(2)}.`,
      recommendations: [
        'If projection feels high, set tighter category budgets and track weekly.',
        'Log transactions consistently for a more accurate forecast.',
      ],
    }
  }

  // default: overall snapshot
  const allExpense = sum(txs.filter((t) => t.type === 'expense').map((t) => Number(t.amount || 0)))
  const allIncome = sum(txs.filter((t) => t.type === 'income').map((t) => Number(t.amount || 0)))
  const months = new Set(txs.map((t) => monthKeyUTC(new Date(t.date))))

  return {
    insight: `You have ${txs.length} transactions across ${months.size} month(s). Total income ${allIncome.toFixed(2)}, total expenses ${allExpense.toFixed(2)}.`,
    recommendations: [
      topCategory ? `Watch "${topCategory}" closely — it’s your biggest expense bucket.` : 'Add categories to unlock category insights.',
      'Use the Transactions page to add and review entries; dashboards update automatically.',
    ],
  }
}

