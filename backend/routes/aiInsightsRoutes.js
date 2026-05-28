import express from 'express'
import authMiddleware from '../middleware/auth.js'
import { queryInsight } from '../controllers/aiInsightsController.js'

const router = express.Router()

// POST /ai-insights/query
router.post('/query', authMiddleware, queryInsight)

export default router

