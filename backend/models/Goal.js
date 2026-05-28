import mongoose from 'mongoose'

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    goalName: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    savedAmount: { type: Number, default: 0 },
    targetDate: { type: Date, required: true },
  },
  { timestamps: true }
)

export const Goal = mongoose.model('Goal', goalSchema)
