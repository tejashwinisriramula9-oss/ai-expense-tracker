import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import { config } from './config/config.js'
import authRoutes        from './routes/authRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import budgetRoutes      from './routes/budgetRoutes.js'
import goalRoutes        from './routes/goalRoutes.js'
import analyticsRoutes   from './routes/analyticsRoutes.js'
import aiInsightsRoutes  from './routes/aiInsightsRoutes.js'
import receiptRoutes     from './routes/receiptRoutes.js'
import errorHandler      from './middleware/errorHandler.js'

// ── Global crash protection ───────────────────────────────────
// Prevents silent exits from unhandled promise rejections or
// unexpected exceptions — both show up in Render logs.
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err?.message || err)
  console.error(err?.stack || '')
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('[FATAL] Unhandled Promise Rejection:', reason?.message || reason)
  process.exit(1)
})

// ── Startup environment validation ───────────────────────────
console.log('='.repeat(50))
console.log('AI Expense Tracker — Backend Starting')
console.log('='.repeat(50))
console.log(`NODE_ENV  : ${config.nodeEnv}`)
console.log(`PORT      : ${config.port}`)
console.log(`FRONTEND  : ${config.frontendUrl}`)
console.log(`MONGO URI : ${config.mongodbUri ? config.mongodbUri.replace(/:([^@]+)@/, ':***@') : 'NOT SET'}`)
console.log(`JWT SET   : ${config.jwtSecret && config.jwtSecret !== 'your_secret_key_here' ? 'yes' : 'NO — update JWT_SECRET'}`)
console.log('='.repeat(50))

// Warn about placeholder values but don't crash — let MongoDB error speak for itself
if (!config.mongodbUri || config.mongodbUri.includes('user:password') || config.mongodbUri.includes('<username>')) {
  console.error('[ERROR] MONGODB_URI is missing or is a placeholder. Set it in Render environment variables.')
}
if (!config.jwtSecret || config.jwtSecret === 'your_secret_key_here') {
  console.warn('[WARN] JWT_SECRET is not set or is a placeholder. Auth will be insecure.')
}

// ── Express app ───────────────────────────────────────────────
const app = express()

// ── CORS ──────────────────────────────────────────────────────
// Allows: exact FRONTEND_URL, all *.vercel.app subdomains, localhost
const allowedOrigins = [
  config.frontendUrl,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
].filter(Boolean)

function isOriginAllowed(origin) {
  if (!origin) return true                          // curl / Postman / Render health checks
  if (allowedOrigins.includes(origin)) return true  // exact match
  if (origin.endsWith('.vercel.app')) return true   // all Vercel preview + production URLs
  return false
}

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) return callback(null, true)
    console.warn(`[CORS] Blocked: ${origin}`)
    callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Health / root endpoints ───────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ status: 'alive', message: 'AI Enhanced Expense Tracker API', timestamp: new Date().toISOString() })
})

app.get('/health', (_req, res) => {
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting']
  res.json({
    status: 'ok',
    environment: config.nodeEnv,
    database: dbState[mongoose.connection.readyState] ?? 'unknown',
    timestamp: new Date().toISOString(),
  })
})

// ── Routes ────────────────────────────────────────────────────
app.use('/auth',           authRoutes)
app.use('/transactions',   transactionRoutes)
app.use('/budgets',        budgetRoutes)
app.use('/goals',          goalRoutes)
app.use('/analytics',      analyticsRoutes)
app.use('/ai-insights',    aiInsightsRoutes)
app.use('/receipt-upload', receiptRoutes)

// ── 404 ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` })
})

// ── Error handler ─────────────────────────────────────────────
app.use(errorHandler)

// ── MongoDB connection ────────────────────────────────────────
console.log('[DB] Connecting to MongoDB Atlas…')
mongoose.connect(config.mongodbUri, {
  serverSelectionTimeoutMS: 10000,  // fail fast if Atlas unreachable
  socketTimeoutMS: 45000,
})
  .then(() => console.log('[DB] MongoDB connected successfully'))
  .catch((err) => {
    console.error('[DB] MongoDB connection failed:', err?.message || err)
    // Exit so Render restarts the service — a DB-less backend is useless
    process.exit(1)
  })

mongoose.connection.on('disconnected', () => console.warn('[DB] MongoDB disconnected'))
mongoose.connection.on('reconnected',  () => console.log('[DB] MongoDB reconnected'))
mongoose.connection.on('error',        (err) => console.error('[DB] MongoDB error:', err?.message))

// ── HTTP server ───────────────────────────────────────────────
const PORT = Number(config.port) || 10000

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Listening on 0.0.0.0:${PORT}`)
  console.log(`[SERVER] Environment : ${config.nodeEnv}`)
  console.log(`[SERVER] CORS origin : ${config.frontendUrl}`)
  console.log('[SERVER] Ready to accept requests')
})

server.on('error', (err) => {
  if (err?.code === 'EADDRINUSE') {
    console.error(`[SERVER] Port ${PORT} already in use`)
  } else {
    console.error('[SERVER] HTTP error:', err?.message || err)
  }
  process.exit(1)
})

// ── Graceful shutdown ─────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`[SERVER] ${signal} received — shutting down gracefully`)
  server.close(async () => {
    try {
      await mongoose.connection.close(false)
      console.log('[SERVER] Shutdown complete')
      process.exit(0)
    } catch (err) {
      console.error('[SERVER] Shutdown error:', err?.message)
      process.exit(1)
    }
  })
  // Force exit after 10 s if graceful shutdown hangs
  setTimeout(() => { console.error('[SERVER] Shutdown timeout — forcing exit'); process.exit(1) }, 10000).unref()
}

process.on('SIGINT',  () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
