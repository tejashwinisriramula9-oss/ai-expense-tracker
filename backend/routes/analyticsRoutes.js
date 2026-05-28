import express from 'express'
import authMiddleware from '../middleware/auth.js'
import * as analyticsController from '../controllers/analyticsController.js'

const router = express.Router()

router.get('/summary', authMiddleware, analyticsController.getAnalyticsSummary)
router.get('/forecast', authMiddleware, analyticsController.getAnalyticsForecast)

export default router
