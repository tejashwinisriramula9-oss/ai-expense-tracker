import { Goal } from '../models/Goal.js'
import { Transaction } from '../models/Transaction.js'

// Keywords that identify a savings transaction (case-insensitive)
const SAVINGS_KEYWORDS = ['saving', 'savings', 'savings deposit', 'save']

/**
 * Returns true if a transaction's category OR title matches any savings keyword.
 */
function isSavingsTransaction(tx) {
  const cat   = String(tx.category || '').toLowerCase().trim()
  const title = String(tx.title    || '').toLowerCase().trim()
  return SAVINGS_KEYWORDS.some((kw) => cat.includes(kw) || title.includes(kw))
}

/**
 * Compute total savings amount from all transactions for a user.
 * Counts both income and expense transactions that match savings keywords.
 */
async function computeTotalSaved(userId) {
  const txs = await Transaction.find({ userId })
  return txs
    .filter(isSavingsTransaction)
    .reduce((sum, t) => sum + Number(t.amount || 0), 0)
}

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId })

    // Compute total saved from savings transactions
    const totalSaved = await computeTotalSaved(req.userId)

    // Distribute saved amount across goals proportionally by target,
    // or if only one goal, assign all savings to it.
    // Each goal gets: min(totalSaved, targetAmount) distributed in order of creation.
    let remaining = totalSaved
    const hydrated = goals.map((g) => {
      const target    = Number(g.targetAmount || 0)
      const allocated = Math.min(remaining, target)
      remaining       = Math.max(remaining - allocated, 0)

      const savedAmount   = allocated
      const progress      = target > 0 ? Math.min(100, Math.round((savedAmount / target) * 100)) : 0
      const remainingAmt  = Math.max(target - savedAmount, 0)

      return {
        ...g.toObject(),
        savedAmount,
        progress,
        remainingAmount: remainingAmt,
      }
    })

    res.json(hydrated)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch goals', error: error.message })
  }
}

export const createGoal = async (req, res) => {
  try {
    const { goalName, targetAmount, savedAmount, targetDate } = req.body
    if (!goalName || !targetAmount || !targetDate) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    const goal = new Goal({
      userId: req.userId,
      goalName,
      targetAmount,
      savedAmount: savedAmount || 0,
      targetDate,
    })
    await goal.save()
    res.status(201).json({ message: 'Goal created', goal })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create goal', error: error.message })
  }
}

export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params
    const { goalName, targetAmount, savedAmount, targetDate } = req.body
    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { goalName, targetAmount, savedAmount, targetDate },
      { new: true }
    )
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' })
    }
    res.json({ message: 'Goal updated', goal })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update goal', error: error.message })
  }
}

export const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params
    const goal = await Goal.findOneAndDelete({ _id: id, userId: req.userId })
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' })
    }
    res.json({ message: 'Goal deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete goal', error: error.message })
  }
}
