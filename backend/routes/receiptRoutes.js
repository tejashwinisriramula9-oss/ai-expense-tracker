import express from 'express'
import multer from 'multer'
import authMiddleware from '../middleware/auth.js'
import { uploadReceipt } from '../controllers/receiptController.js'

const router = express.Router()

// Use in-memory storage; replace with S3/disk storage later if needed.
const upload = multer({ storage: multer.memoryStorage() })

// POST /receipt-upload
// Expects multipart/form-data with `file` field.
router.post('/', authMiddleware, upload.single('file'), uploadReceipt)

export default router

