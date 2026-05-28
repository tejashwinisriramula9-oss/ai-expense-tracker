import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { config } from '../config/config.js'

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
    const user = new User({
      name:     name.trim(),
      email:    email.toLowerCase(),
      password: hashedPassword,
    })
    await user.save()

    const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '90d' })
    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error('[AUTH] register error:', error.message)
    res.status(500).json({ message: 'Registration failed.', error: error.message })
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

    const token = jwt.sign({ userId: user._id }, config.jwtSecret, { expiresIn: '90d' })
    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error('[AUTH] login error:', error.message)
    res.status(500).json({ message: 'Login failed.', error: error.message })
  }
}

// ── GET PROFILE ───────────────────────────────────────────────
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password')
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
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile.', error: error.message })
  }
}

