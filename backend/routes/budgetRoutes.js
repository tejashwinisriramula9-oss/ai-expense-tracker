import express from 'express'
import authMiddleware from '../middleware/auth.js'
import * as budgetController from '../controllers/budgetController.js'

const router = express.Router()

router.get('/', authMiddleware, budgetController.getBudgets)
router.post('/', authMiddleware, budgetController.createBudget)
router.put('/:id', authMiddleware, budgetController.updateBudget)
router.delete('/:id', authMiddleware, budgetController.deleteBudget)

export default router
