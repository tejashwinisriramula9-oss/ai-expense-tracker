import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    profile: {
      bio:    { type: String, default: 'AI finance enthusiast' },
      mobile: { type: String, default: '' },
    },
  },
  { timestamps: true },
)

export const User = mongoose.model('User', userSchema)
