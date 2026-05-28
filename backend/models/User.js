import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    // ── Email verification ──────────────────────────────────
    isVerified:       { type: Boolean, default: false },
    verificationOTP:  { type: String,  default: null },
    otpExpiry:        { type: Date,    default: null },

    // ── Password reset ──────────────────────────────────────
    resetPasswordToken:  { type: String, default: null },
    resetPasswordExpiry: { type: Date,   default: null },

    profile: {
      bio:    { type: String, default: 'AI finance enthusiast' },
      mobile: { type: String, default: '' },
    },
  },
  { timestamps: true },
)

// Index for fast OTP and reset-token lookups
userSchema.index({ verificationOTP: 1 })
userSchema.index({ resetPasswordToken: 1 })

export const User = mongoose.model('User', userSchema)
