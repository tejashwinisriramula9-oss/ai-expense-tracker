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
  emailStatus,
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
router.get('/email-status',      emailStatus)   // diagnostic — no auth

// Protected routes
router.get('/profile',  authMiddleware, getProfile)
router.put('/profile',  authMiddleware, updateProfile)

export default router
