import express from 'express'
import authMiddleware from '../middleware/auth.js'
import * as transactionController from '../controllers/transactionController.js'

const router = express.Router()

router.get('/', authMiddleware, transactionController.getTransactions)
router.post('/', authMiddleware, transactionController.createTransaction)
router.put('/:id', authMiddleware, transactionController.updateTransaction)
router.delete('/:id', authMiddleware, transactionController.deleteTransaction)

export default router
