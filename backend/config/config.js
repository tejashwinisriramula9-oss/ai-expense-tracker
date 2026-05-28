import dotenv from 'dotenv'
dotenv.config()

export const config = {
  mongodbUri:  process.env.MONGODB_URI  || 'mongodb+srv://user:password@cluster.mongodb.net/fintech',
  jwtSecret:   process.env.JWT_SECRET   || 'your_secret_key_here',
  port:        process.env.PORT         || 5000,
  nodeEnv:     process.env.NODE_ENV     || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // ── Email provider A: Brevo / custom SMTP (recommended) ──
  // Set these in Render for reliable delivery:
  //   SMTP_HOST = smtp-relay.brevo.com
  //   SMTP_PORT = 587
  //   SMTP_USER = your-brevo-login@email.com
  //   SMTP_PASS = your-brevo-smtp-key
  //   EMAIL_FROM = noreply@yourdomain.com  (optional, defaults to SMTP_USER)
  smtpHost:  process.env.SMTP_HOST  || '',
  smtpPort:  process.env.SMTP_PORT  || '587',
  smtpUser:  process.env.SMTP_USER  || '',
  smtpPass:  process.env.SMTP_PASS  || '',
  emailFrom: process.env.EMAIL_FROM || '',

  // ── Email provider B: Gmail App Password (fallback) ──────
  emailUser: process.env.EMAIL_USER || '',
  emailPass: process.env.EMAIL_PASS || '',
}

export default config
