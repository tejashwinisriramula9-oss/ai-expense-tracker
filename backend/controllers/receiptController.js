import { parseReceipt } from '../utils/ocr.js'

export const uploadReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Receipt file is required' })
    }
    if (!req.file.mimetype?.startsWith('image/')) {
      return res.status(400).json({ message: 'Receipt upload must be an image file' })
    }

    // parseReceipt is a stub right now; it ignores the image bytes.
    const receiptData = parseReceipt(req.file.originalname, req.file.buffer)

    // Optionally keep userId linkage in real implementation.
    return res.json(receiptData)
  } catch (error) {
    res.status(500).json({ message: 'Receipt upload failed', error: error.message })
  }
}

