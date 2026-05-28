import { generateInsightFromTransactions } from '../utils/ai.js'
import { Transaction } from '../models/Transaction.js'

export const queryInsight = async (req, res) => {
  try {
    const { question } = req.body || {}
    if (!question || !String(question).trim()) {
      return res.status(400).json({ message: 'Missing question' })
    }

    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 }).limit(400)
    const response = generateInsightFromTransactions(question, transactions)
    res.json(response)
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate insight', error: error.message })
  }
}

