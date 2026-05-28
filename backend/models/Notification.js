import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    unread: { type: Boolean, default: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const Notification = mongoose.model('Notification', notificationSchema)
