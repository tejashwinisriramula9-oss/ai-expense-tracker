// ESM test script — run: node test-smtp.mjs
import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Manually parse .env (avoid dotenv ESM issues)
function loadEnv() {
  const envPath = path.join(__dirname, '.env')
  const lines = readFileSync(envPath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    const val = trimmed.slice(eq + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

const host = process.env.SMTP_HOST
const port = Number(process.env.SMTP_PORT) || 587
const user = process.env.SMTP_USER
const pass = process.env.SMTP_PASS
const from = process.env.EMAIL_FROM || user
const to   = process.env.EMAIL_FROM || user

console.log('=== BREVO SMTP LIVE TEST ===')
console.log('Host :', host)
console.log('Port :', port)
console.log('User :', user)
console.log('Pass :', pass ? `${pass.length} chars — ${pass.slice(0, 15)}...` : 'MISSING')
console.log('From :', from)
console.log('To   :', to)
console.log('')

if (!host || !user || !pass) {
  console.error('ABORT: SMTP_HOST, SMTP_USER or SMTP_PASS missing')
  process.exit(1)
}

import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  connectionTimeout: 15000,
  greetingTimeout:   15000,
  socketTimeout:     20000,
})

console.log('Step 1 — verify() SMTP connection...')
try {
  await transporter.verify()
  console.log('✅ VERIFY OK — Brevo SMTP authenticated successfully')
} catch (err) {
  console.error('❌ VERIFY FAILED')
  console.error('  code    :', err.code)
  console.error('  message :', err.message.split('\n')[0])
  if (err.code === 'EAUTH') {
    if (err.message.includes('Unauthorized IP') || err.message.includes('525')) {
      console.error('')
      console.error('FIX: Your IP address is not authorized in Brevo.')
      console.error('  Option A (recommended for Render):')
      console.error('    1. Go to app.brevo.com → your name → SMTP & API → SMTP tab')
      console.error('    2. Under "Authorized IPs", click "Add an IP"')
      console.error('    3. Add your current IP OR leave empty to allow all IPs')
      console.error('  Option B (allow all IPs — easier):')
      console.error('    1. Go to app.brevo.com → your name → SMTP & API → SMTP tab')
      console.error('    2. Remove all IP restrictions (leave the list empty)')
    } else {
      console.error('')
      console.error('FIX: SMTP_PASS is wrong.')
      console.error('  1. Go to app.brevo.com → your name → SMTP & API → SMTP tab')
      console.error('  2. Copy the full password (starts with xsmtpsib-, ~70+ chars)')
      console.error('  3. Paste it as a SINGLE LINE in .env and in Render env vars')
    }
  }
  process.exit(1)
}

console.log('')
console.log('Step 2 — sendMail() real test email to', to, '...')
try {
  const info = await transporter.sendMail({
    from: `"AI Expense Tracker" <${from}>`,
    to,
    subject: 'OTP Test — AI Expense Tracker',
    text: 'Your test OTP is: 847291\n\nBrevo SMTP is working correctly.',
    html: `<div style="font-family:sans-serif;padding:24px;background:#0f172a;color:#f1f5f9;border-radius:12px">
      <h2 style="color:#818cf8">Test OTP</h2>
      <p style="font-size:36px;font-weight:800;letter-spacing:6px;color:#818cf8">847291</p>
      <p style="color:#94a3b8">Brevo SMTP is working. OTP emails will deliver.</p>
    </div>`,
  })
  console.log('')
  console.log('=== ✅ TEST PASSED ===')
  console.log('messageId :', info.messageId)
  console.log('response  :', info.response)
  console.log('')
  console.log('📬 Check inbox of', to)
  console.log('   Also check Spam and Promotions folders.')
} catch (err) {
  console.error('❌ SEND FAILED')
  console.error('  code    :', err.code)
  console.error('  message :', err.message.split('\n')[0])
  process.exit(1)
}
