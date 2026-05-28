import express from 'express'
import {
  register,
  login,
  verifyOTP,
  resendOTP,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
} from '../controllers/authController.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.post('/register',         register)
router.post('/login',            login)
router.post('/verify-otp',       verifyOTP)
router.post('/resend-otp',       resendOTP)
router.post('/forgot-password',  forgotPassword)
router.post('/reset-password',   resetPassword)

// Protected routes
router.get('/profile',  authMiddleware, getProfile)
router.put('/profile',  authMiddleware, updateProfile)

export default router
