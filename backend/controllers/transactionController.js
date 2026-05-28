import { Transaction } from '../models/Transaction.js'

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 })
    res.json(transactions)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: error.message })
  }
}

export const createTransaction = async (req, res) => {
  try {
    const { title, amount, category, type, description, date } = req.body
    if (!title || !amount || !category || !type) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    const transaction = new Transaction({
      userId: req.userId,
      title,
      amount,
      category,
      type,
      description,
      date: date || new Date(),
    })
    await transaction.save()
    res.status(201).json({ message: 'Transaction created', transaction })
  } catch (error) {
    res.status(500).json({ message: 'Failed to create transaction', error: error.message })
  }
}

export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params
    const { title, amount, category, type, description, date } = req.body
    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { title, amount, category, type, description, date },
      { new: true }
    )
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }
    res.json({ message: 'Transaction updated', transaction })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update transaction', error: error.message })
  }
}

export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params
    const transaction = await Transaction.findOneAndDelete({ _id: id, userId: req.userId })
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }
    res.json({ message: 'Transaction deleted' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete transaction', error: error.message })
  }
}
