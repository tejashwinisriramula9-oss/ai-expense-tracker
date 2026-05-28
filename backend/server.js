import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import { config } from './config/config.js'
import authRoutes from './routes/authRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import budgetRoutes from './routes/budgetRoutes.js'
import goalRoutes from './routes/goalRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import aiInsightsRoutes from './routes/aiInsightsRoutes.js'
import receiptRoutes from './routes/receiptRoutes.js'
import errorHandler from './middleware/errorHandler.js'

const app = express()

// Allow requests from the configured frontend URL(s).
// Covers:
//   - exact FRONTEND_URL (production Vercel URL)
//   - all Vercel preview URLs  (*.vercel.app)
//   - localhost for local dev
const allowedOrigins = [
  config.frontendUrl,          // e.g. https://ai-expense-tracker.vercel.app
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean)

// Also allow any *.vercel.app subdomain (preview deployments)
const vercelPreviewRegex = /^https:\/\/[a-z0-9-]+-[a-z0-9]+-[a-z0-9]+\.vercel\.app$/

function isOriginAllowed(origin) {
  if (!origin) return true                                    // curl / Postman / Render health checks
  if (allowedOrigins.includes(origin)) return true           // exact match
  if (origin.endsWith('.vercel.app')) return true            // all vercel.app subdomains
  if (vercelPreviewRegex.test(origin)) return true           // vercel preview pattern
  return false
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) return callback(null, true)
      console.warn(`[CORS] Blocked origin: ${origin}`)
      callback(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
  }),
)
app.use(express.json())

const uriHasPlaceholder =
  config.mongodbUri.includes('<username>') ||
  config.mongodbUri.includes('<password>') ||
  config.mongodbUri.includes('user:password')

const jwtHasPlaceholder =
  config.jwtSecret === 'your_secret_key_here' || config.jwtSecret.includes('your_super_secret_jwt_key_change_in_production')

if (uriHasPlaceholder) {
  console.warn('⚠️ MONGODB_URI looks like a placeholder. MongoDB connection will fail until you update backend/.env.')
}
if (jwtHasPlaceholder) {
  console.warn('⚠️ JWT_SECRET looks like a placeholder. Update backend/.env for real auth.')
}

console.log('Connecting to MongoDB Atlas...')
mongoose
  .connect(config.mongodbUri)
  .then(() => {
    console.log('MongoDB Connected Successfully')
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error?.message || error)
    process.exit(1)
  })

app.get('/', (req, res) => {
  res.json({ status: 'alive', message: 'AI Enhanced Expense Tracker API' })
})

// Health check endpoint — test at /health in browser
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  })
})

app.use('/auth', authRoutes)
app.use('/transactions', transactionRoutes)
app.use('/budgets', budgetRoutes)
app.use('/goals', goalRoutes)
app.use('/analytics', analyticsRoutes)
app.use('/ai-insights', aiInsightsRoutes)
app.use('/receipt-upload', receiptRoutes)

// 404 handler for unknown API routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

app.use(errorHandler)

const PORT = config.port
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${config.nodeEnv}`)
  console.log(`CORS origin: ${config.frontendUrl}`)
})

server.on('error', (err) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT to a free port.`)
  } else {
    console.error('HTTP server error:', err?.message || err)
  }
  process.exit(1)
})

// Graceful shutdown to avoid orphan listeners during nodemon restarts.
const shutdown = async (signal) => {
  console.log(`🛑 Received ${signal}. Shutting down server...`)

  // Stop accepting new requests.
  server.close(async () => {
    try {
      console.log('HTTP server closed.')
      await mongoose.connection.close(false)
      console.log('MongoDB connection closed.')
      process.exit(0)
    } catch (error) {
      console.error('Shutdown error:', error)
      process.exit(1)
    }
  })

  // Force exit if shutdown hangs.
  setTimeout(() => {
    console.error('Shutdown timed out; forcing exit.')
    process.exit(1)
  }, 10000).unref()
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
