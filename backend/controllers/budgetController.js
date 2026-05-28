import { Budget } from '../models/Budget.js'
import { Transaction } from '../models/Transaction.js'

// Keywords that identify a savings transaction (case-insensitive)
const SAVINGS_KEYWORDS = ['saving', 'savings', 'savings deposit', 'save']

function isSavingsKeyword(str) {
  const s = String(str || '').toLowerCase().trim()
  return SAVINGS_KEYWORDS.some((kw) => s.includes(kw))
}

/**
 * Build a spending map from transactions.
 * - For regular expense categories: sum expense transactions by category.
 * - For savings-type budget categories: sum ALL transactions (income or expense)
 *   whose category OR title matches savings keywords.
 */
function buildSpentMap(transactions, budgetCategories) {
  const spentByCategory = {}

  // Identify which budget categories are savings-type
  const savingsBudgetCategories = budgetCategories.filter(isSavingsKeyword)

  for (const t of transactions) {
    const cat = t.category || 'Uncategorized'

    // Check if this transaction is a savings transaction
    const txIsSavings = isSavingsKeyword(cat) || isSavingsKeyword(t.title)

    if (txIsSavings) {
      // Credit this transaction toward every savings-type budget category
      for (const bc of savingsBudgetCategories) {
        spentByCategory[bc] = (spentByCategory[bc] || 0) + Number(t.amount || 0)
      }
    } else if (t.type === 'expense') {
      // Regular expense: credit toward matching budget category
      spentByCategory[cat] = (spentByCategory[cat] || 0) + Number(t.amount || 0)
    }
  }

  return spentByCategory
}

export const getBudgets = async (req, res) => {
  try {
    const budgets      = await Budget.find({ userId: req.userId })
    const transactions = await Transaction.find({ userId: req.userId })

    const budgetCategories = budgets.map((b) => b.category || 'Uncategorized')
    const spentByCategory  = buildSpentMap(transactions, budgetCategories)

    const hydrated = budgets.map((b) => {
      const cat       = b.category || 'Uncategorized'
      const spent     = spentByCategory[cat] || 0
      const limit     = Number(b.limit || 0)
      const progress  = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0
      const remaining = Math.max(limit - spent, 0)

      return {
        ...b.toObject(),
        spentAmount:     spent,
        progress,
        remainingAmount: remaining,
      }
    })

    res.json(hydrated)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch budgets', error: error.message })
  }
}

export const createBudget = async (req, res) => {
  try {
    const { category, limit } = req.body
    if (!category || !limit) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    const budget = new Budget({
      userId: req.userId,
      category,
      limit,
      spentAmount: 0,
    })
    await budget.save()
    res.status(201).json({ message: 'Budget created', budget })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create budget', error: error.message })
  }
}

export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params
    const { category, limit, spentAmount } = req.body
    const budget = await Budget.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { category, limit, spentAmount },
      { new: true }
    )
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' })
    }
    res.json({ message: 'Budget updated', budget })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update budget', error: error.message })
  }
}

export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params
    const budget = await Budget.findOneAndDelete({ _id: id, userId: req.userId })
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' })
    }
    res.json({ message: 'Budget deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete budget', error: error.message })
  }
}
