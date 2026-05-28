import express from 'express'
import authMiddleware from '../middleware/auth.js'
import * as goalController from '../controllers/goalController.js'

const router = express.Router()

router.get('/', authMiddleware, goalController.getGoals)
router.post('/', authMiddleware, goalController.createGoal)
router.put('/:id', authMiddleware, goalController.updateGoal)
router.delete('/:id', authMiddleware, goalController.deleteGoal)

export default router
