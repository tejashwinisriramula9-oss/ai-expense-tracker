import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    description: { type: String, default: '' },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const Transaction = mongoose.model('Transaction', transactionSchema)
