import dotenv from 'dotenv'
dotenv.config()

export const config = {
  mongodbUri:  process.env.MONGODB_URI  || 'mongodb+srv://user:password@cluster.mongodb.net/fintech',
  jwtSecret:   process.env.JWT_SECRET   || 'your_secret_key_here',
  port:        process.env.PORT         || 5000,
  nodeEnv:     process.env.NODE_ENV     || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
}

export default config
