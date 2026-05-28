import nodemailer from 'nodemailer'
import { config } from '../config/config.js'

// ─────────────────────────────────────────────────────────────
// EMAIL PROVIDER SELECTION
//
// The system auto-detects which provider to use based on env vars:
//
// OPTION A — Brevo (recommended, free 300 emails/day, no App Password needed)
//   SMTP_HOST=smtp-relay.brevo.com
//   SMTP_PORT=587
//   SMTP_USER=your-brevo-login@email.com
//   SMTP_PASS=your-brevo-smtp-key
//   EMAIL_FROM=noreply@yourdomain.com  (or your Brevo sender email)
//
// OPTION B — Gmail App Password
//   EMAIL_USER=your@gmail.com
//   EMAIL_PASS=16charapppassword  (from myaccount.google.com/apppasswords)
//
// If SMTP_HOST is set → uses Brevo/custom SMTP
// If EMAIL_USER is set → uses Gmail
// ─────────────────────────────────────────────────────────────

function buildTransporter() {
  const smtpHost = config.smtpHost?.trim()
  const smtpPort = Number(config.smtpPort) || 587
  const smtpUser = config.smtpUser?.trim()
  const smtpPass = config.smtpPass?.trim()

  const gmailUser = config.emailUser?.trim()
  const gmailPass = config.emailPass?.trim().replace(/\s+/g, '')

  // Brevo / custom SMTP
  if (smtpHost && smtpUser && smtpPass) {
    console.log(`[EMAIL] Using custom SMTP: ${smtpHost}:${smtpPort}`)
    return nodemailer.createTransport({
      host:   smtpHost,
      port:   smtpPort,
      secure: smtpPort === 465,
      auth:   { user: smtpUser, pass: smtpPass },
      connectionTimeout: 15000,
      greetingTimeout:   15000,
      socketTimeout:     20000,
    })
  }

  // Gmail fallback
  if (gmailUser && gmailPass) {
    console.log(`[EMAIL] Using Gmail SMTP for ${gmailUser}`)
    return nodemailer.createTransport({
      host:   'smtp.gmail.com',
      port:   465,
      secure: true,
      auth:   { user: gmailUser, pass: gmailPass },
      connectionTimeout: 15000,
      greetingTimeout:   15000,
      socketTimeout:     20000,
    })
  }

  return null
}

function getSenderAddress() {
  if (config.emailFrom?.trim()) return config.emailFrom.trim()
  if (config.smtpUser?.trim())  return config.smtpUser.trim()
  if (config.emailUser?.trim()) return config.emailUser.trim()
  return 'noreply@ai-expense-tracker.app'
}

function isEmailConfigured() {
  const hasBrevo = config.smtpHost && config.smtpUser && config.smtpPass
  const hasGmail = config.emailUser && config.emailPass
  return Boolean(hasBrevo || hasGmail)
}

// ── Startup verification ──────────────────────────────────────
export async function verifyEmailTransporter() {
  console.log('[EMAIL] === Email Configuration Check ===')
  console.log('[EMAIL] SMTP_HOST :', config.smtpHost  || 'not set')
  console.log('[EMAIL] SMTP_USER :', config.smtpUser  || 'not set')
  console.log('[EMAIL] SMTP_PASS :', config.smtpPass  ? `set (${config.smtpPass.length} chars)` : 'not set')
  console.log('[EMAIL] EMAIL_USER:', config.emailUser || 'not set')
  console.log('[EMAIL] EMAIL_PASS:', config.emailPass ? `set (${config.emailPass.replace(/\s+/g,'').length} chars)` : 'not set')
  console.log('[EMAIL] EMAIL_FROM:', config.emailFrom || 'not set (will use sender address)')

  if (!isEmailConfigured()) {
    console.warn('[EMAIL] ⚠️  No email provider configured — OTP emails disabled')
    console.warn('[EMAIL] Set SMTP_HOST+SMTP_USER+SMTP_PASS (Brevo) OR EMAIL_USER+EMAIL_PASS (Gmail) in Render')
    return false
  }

  const transporter = buildTransporter()
  if (!transporter) {
    console.error('[EMAIL] ❌ Could not build transporter')
    return false
  }

  try {
    await transporter.verify()
    console.log(`[EMAIL] ✅ SMTP verified — emails will send from ${getSenderAddress()}`)
    return true
  } catch (err) {
    console.error('[EMAIL] ❌ SMTP verify failed:', err.message.split('\n')[0])
    if (err.code === 'EAUTH') {
      if (config.smtpHost) {
        console.error('[EMAIL] Fix: Check SMTP_USER and SMTP_PASS in Render env vars')
      } else {
        console.error('[EMAIL] Fix: Gmail App Password rejected')
        console.error('[EMAIL] → Go to https://myaccount.google.com/apppasswords')
        console.error('[EMAIL] → Generate a NEW App Password → update EMAIL_PASS in Render')
        console.error('[EMAIL] → OR switch to Brevo (free): set SMTP_HOST=smtp-relay.brevo.com')
      }
    }
    return false
  }
}

// ── OTP helpers ───────────────────────────────────────────────
export function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function otpExpiryDate() {
  return new Date(Date.now() + 10 * 60 * 1000)
}

export { isEmailConfigured }

// ── Send with one retry ───────────────────────────────────────
async function sendWithRetry(mailOptions, attempt = 1) {
  const transporter = buildTransporter()
  if (!transporter) throw new Error('No email provider configured')

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(`[EMAIL] ✅ Sent to ${mailOptions.to} — messageId: ${info.messageId}`)
    return info
  } catch (err) {
    console.error(`[EMAIL] ❌ Attempt ${attempt} failed (${mailOptions.to}): ${err.message.split('\n')[0]}`)

    if (err.code === 'EAUTH') {
      throw new Error('Email authentication failed. Check SMTP credentials in Render environment variables.')
    }

    if (attempt < 2) {
      console.log('[EMAIL] Retrying in 3s…')
      await new Promise(r => setTimeout(r, 3000))
      return sendWithRetry(mailOptions, 2)
    }
    throw err
  }
}

// ── Send verification OTP ─────────────────────────────────────
export async function sendVerificationEmail(toEmail, name, otp) {
  console.log(`[EMAIL] Sending OTP to ${toEmail}`)
  const from = `"AI Expense Tracker" <${getSenderAddress()}>`
  await sendWithRetry({
    from,
    to:      toEmail,
    subject: 'Your verification code — AI Expense Tracker',
    text:    `Hi ${name},\n\nYour verification code is: ${otp}\n\nExpires in 10 minutes.\n\nIf you didn't sign up, ignore this.`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#020617;font-family:ui-sans-serif,system-ui,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:16px;border:1px solid rgba(255,255,255,0.08);padding:40px 32px;max-width:480px;width:100%">
<tr><td>
  <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#6366f1;font-weight:600">AI Expense Tracker</p>
  <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#f1f5f9">Verify your email</h1>
  <p style="margin:0 0 28px;font-size:14px;color:#94a3b8">Hi <strong style="color:#f1f5f9">${name}</strong>, enter this code to activate your account:</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;border:1px solid rgba(99,102,241,.3);margin-bottom:28px">
  <tr><td align="center" style="padding:28px">
    <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:#94a3b8">Verification Code</p>
    <p style="margin:0;font-size:44px;font-weight:800;letter-spacing:.25em;color:#818cf8">${otp}</p>
  </td></tr></table>
  <p style="margin:0 0 8px;font-size:13px;color:#64748b">Expires in <strong style="color:#f1f5f9">10 minutes</strong>.</p>
  <p style="margin:0;font-size:13px;color:#64748b">Didn't sign up? Ignore this email.</p>
</td></tr></table>
</td></tr></table>
</body></html>`,
  })
}

// ── Send password reset email ─────────────────────────────────
export async function sendPasswordResetEmail(toEmail, name, resetUrl) {
  console.log(`[EMAIL] Sending reset link to ${toEmail}`)
  const from = `"AI Expense Tracker" <${getSenderAddress()}>`
  await sendWithRetry({
    from,
    to:      toEmail,
    subject: 'Reset your password — AI Expense Tracker',
    text:    `Hi ${name},\n\nReset your password:\n${resetUrl}\n\nExpires in 1 hour.\n\nIgnore if you didn't request this.`,
    html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#020617;font-family:ui-sans-serif,system-ui,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:16px;border:1px solid rgba(255,255,255,0.08);padding:40px 32px;max-width:480px;width:100%">
<tr><td>
  <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.1em;color:#6366f1;font-weight:600">AI Expense Tracker</p>
  <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#f1f5f9">Reset your password</h1>
  <p style="margin:0 0 28px;font-size:14px;color:#94a3b8">Hi <strong style="color:#f1f5f9">${name}</strong>, click below to set a new password.</p>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
  <tr><td align="center">
    <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#38bdf8);color:#0f172a;font-weight:700;font-size:15px;padding:16px 40px;border-radius:50px;text-decoration:none">Reset Password</a>
  </td></tr></table>
  <p style="margin:0 0 8px;font-size:13px;color:#64748b">Expires in <strong style="color:#f1f5f9">1 hour</strong>.</p>
  <p style="margin:0 0 12px;font-size:13px;color:#64748b">Or copy: <span style="color:#6366f1;word-break:break-all">${resetUrl}</span></p>
  <p style="margin:0;font-size:13px;color:#64748b">Ignore if you didn't request this.</p>
</td></tr></table>
</td></tr></table>
</body></html>`,
  })
}
