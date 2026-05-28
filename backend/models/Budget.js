import mongoose from 'mongoose'

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    limit: { type: Number, required: true },
    spentAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export const Budget = mongoose.model('Budget', budgetSchema)
