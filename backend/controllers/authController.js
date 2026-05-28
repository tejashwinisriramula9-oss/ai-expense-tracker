import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { User } from '../models/User.js'
import { config } from '../config/config.js'
import {
  generateOTP,
  otpExpiryDate,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from '../utils/email.js'

// ── helpers ───────────────────────────────────────────────────
const emailConfigured = () => Boolean(config.emailUser && config.emailPass)

// ── REGISTER ─────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const otp    = generateOTP()
    const expiry = otpExpiryDate()

    const user = new User({
      name:            name.trim(),
      email:           email.toLowerCase(),
      password:        hashedPassword,
      isVerified:      false,
      verificationOTP: otp,
      otpExpiry:       expiry,
    })
    await user.save()

    // Send OTP email if email service is configured
    if (emailConfigured()) {
      try {
        await sendVerificationEmail(user.email, user.name, otp)
        console.log(`[AUTH] Verification OTP sent to ${user.email}`)
      } catch (emailErr) {
        console.error('[AUTH] Failed to send verification email:', emailErr.message)
        // Account is created but email failed — tell the frontend so user can resend
        return res.status(201).json({
          message: 'Account created but verification email failed to send. Use "Resend OTP" on the next page.',
          userId: user._id,
          email: user.email,
          emailError: true,
        })
      }
    } else {
      console.warn(`[AUTH] Email not configured — skipping send. OTP for ${user.email}: ${otp}`)
    }

    res.status(201).json({
      message: 'Account created. Please check your email for the verification OTP.',
      userId: user._id,
      email: user.email,
      // In dev without email configured, return OTP so you can test
      ...(config.nodeEnv !== 'production' && !emailConfigured() ? { devOtp: otp } : {}),
    })
  } catch (error) {
    console.error('[AUTH] register error:', error.message)
    res.status(500).json({ message: 'Registration failed.', error: error.message })
  }
}

// ── VERIFY OTP ────────────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified.' })
    }
    if (!user.verificationOTP || user.verificationOTP !== String(otp).trim()) {
      return res.status(400).json({ message: 'Invalid OTP.' })
    }
    if (!user.otpExpiry || new Date() > user.otpExpiry) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' })
    }

    user.isVerified      = true
    user.verificationOTP = null
    user.otpExpiry       = null
    await user.save()

    res.json({ message: 'Email verified successfully. You can now log in.' })
  } catch (error) {
    console.error('[AUTH] verifyOTP error:', error.message)
    res.status(500).json({ message: 'Verification failed.', error: error.message })
  }
}

// ── RESEND OTP ────────────────────────────────────────────────
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required.' })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(404).json({ message: 'User not found.' })
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified.' })

    const otp    = generateOTP()
    const expiry = otpExpiryDate()
    user.verificationOTP = otp
    user.otpExpiry       = expiry
    await user.save()

    if (emailConfigured()) {
      try {
        await sendVerificationEmail(user.email, user.name, otp)
        console.log(`[AUTH] Resent OTP to ${user.email}`)
      } catch (emailErr) {
        console.error('[AUTH] Failed to resend OTP:', emailErr.message)
        return res.status(500).json({ message: 'Failed to send OTP email. Please try again in a moment.' })
      }
    } else {
      console.warn(`[AUTH] Email not configured — OTP for ${user.email}: ${otp}`)
    }

    res.json({
      message: 'New OTP sent to your email.',
      ...(config.nodeEnv !== 'production' && !emailConfigured() ? { devOtp: otp } : {}),
    })
  } catch (error) {
    console.error('[AUTH] resendOTP error:', error.message)
    res.status(500).json({ message: 'Failed to resend OTP.', error: error.message })
  }
}

// ── LOGIN ─────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' })
    }

    // Block login if email not verified (only when email service is configured)
    if (!user.isVerified && emailConfigured()) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        needsVerification: true,
        email: user.email,
      })
    }

    const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '90d' })
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, isVerified: user.isVerified },
    })
  } catch (error) {
    console.error('[AUTH] login error:', error.message)
    res.status(500).json({ message: 'Login failed.', error: error.message })
  }
}

// ── FORGOT PASSWORD ───────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ message: 'Email is required.' })

    const user = await User.findOne({ email: email.toLowerCase() })
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent.' })
    }

    const token  = crypto.randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    user.resetPasswordToken  = token
    user.resetPasswordExpiry = expiry
    await user.save()

    const resetUrl = `${config.frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`

    if (emailConfigured()) {
      try {
        await sendPasswordResetEmail(user.email, user.name, resetUrl)
        console.log(`[AUTH] Password reset email sent to ${user.email}`)
      } catch (emailErr) {
        console.error('[AUTH] Failed to send reset email:', emailErr.message)
        return res.status(500).json({ message: 'Failed to send reset email. Please try again.' })
      }
    } else {
      console.warn('[AUTH] Email not configured — reset URL:', resetUrl)
    }

    res.json({
      message: 'If that email exists, a reset link has been sent.',
      ...(config.nodeEnv !== 'production' && !emailConfigured() ? { devResetUrl: resetUrl } : {}),
    })
  } catch (error) {
    console.error('[AUTH] forgotPassword error:', error.message)
    res.status(500).json({ message: 'Failed to process request.', error: error.message })
  }
}

// ── RESET PASSWORD ────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body
    if (!email || !token || !newPassword) {
      return res.status(400).json({ message: 'Email, token and new password are required.' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user || user.resetPasswordToken !== token) {
      return res.status(400).json({ message: 'Invalid or expired reset link.' })
    }
    if (!user.resetPasswordExpiry || new Date() > user.resetPasswordExpiry) {
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' })
    }

    user.password            = await bcrypt.hash(newPassword, 12)
    user.resetPasswordToken  = null
    user.resetPasswordExpiry = null
    user.isVerified          = true  // auto-verify on password reset
    await user.save()

    res.json({ message: 'Password reset successfully. You can now log in.' })
  } catch (error) {
    console.error('[AUTH] resetPassword error:', error.message)
    res.status(500).json({ message: 'Password reset failed.', error: error.message })
  }
}

// ── GET PROFILE ───────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -verificationOTP -resetPasswordToken')
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile.', error: error.message })
  }
}

// ── UPDATE PROFILE ────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: 'User not found.' })

    if (name?.trim()) user.name = name.trim()
    if (email?.trim()) {
      const emailLower = email.trim().toLowerCase()
      const existing = await User.findOne({ email: emailLower, _id: { $ne: req.userId } })
      if (existing) return res.status(400).json({ message: 'Email already in use by another account.' })
      user.email = emailLower
    }
    if (password && password.length >= 6) {
      user.password = await bcrypt.hash(password, 12)
    }

    await user.save()
    res.json({
      message: 'Profile updated successfully.',
      user: { id: user._id, name: user.name, email: user.email, isVerified: user.isVerified },
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile.', error: error.message })
  }
}
