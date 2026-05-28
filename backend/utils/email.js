import nodemailer from 'nodemailer'
import { config } from '../config/config.js'

// ─────────────────────────────────────────────────────────────
// Gmail SMTP — requires a valid App Password
//
// SETUP (do this if emails fail):
//   1. Go to https://myaccount.google.com/security
//   2. Confirm "2-Step Verification" is ON
//   3. Go to https://myaccount.google.com/apppasswords
//   4. Click "Create app password"
//   5. Name it anything (e.g. "Render")
//   6. Copy the 16-char code shown — NO spaces
//   7. Set EMAIL_PASS=<that code> in Render environment variables
//   8. Redeploy Render service
//
// Common failure: 535 5.7.8 BadCredentials
//   → App Password is wrong, revoked, or 2FA was turned off
//   → Generate a NEW App Password and update Render env var
// ─────────────────────────────────────────────────────────────

function buildTransporter() {
  const user = config.emailUser?.trim()
  const pass = config.emailPass?.trim().replace(/\s+/g, '') // strip any accidental spaces

  return nodemailer.createTransport({
    host:   'smtp.gmail.com',
    port:   465,
    secure: true,
    auth:   { user, pass },
    connectionTimeout: 15000,
    greetingTimeout:   15000,
    socketTimeout:     20000,
  })
}

// ── Startup verification ──────────────────────────────────────
export async function verifyEmailTransporter() {
  const user = config.emailUser?.trim()
  const pass = config.emailPass?.trim()

  console.log('[EMAIL] EMAIL_USER:', user || 'NOT SET')
  console.log('[EMAIL] EMAIL_PASS:', pass ? `SET (${pass.replace(/\s+/g,'').length} chars)` : 'NOT SET')

  if (!user || !pass) {
    console.warn('[EMAIL] ⚠️  EMAIL_USER or EMAIL_PASS missing — email disabled')
    return false
  }

  try {
    await buildTransporter().verify()
    console.log(`[EMAIL] ✅ SMTP verified — sending from ${user}`)
    return true
  } catch (err) {
    console.error('[EMAIL] ❌ SMTP verify failed:', err.message)
    if (err.code === 'EAUTH') {
      console.error('[EMAIL] FIX: Go to https://myaccount.google.com/apppasswords')
      console.error('[EMAIL] FIX: Generate a NEW App Password and update EMAIL_PASS in Render')
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

// ── Send with one retry ───────────────────────────────────────
async function sendWithRetry(mailOptions, attempt = 1) {
  try {
    const info = await buildTransporter().sendMail(mailOptions)
    console.log(`[EMAIL] ✅ Delivered to ${mailOptions.to} — id: ${info.messageId}`)
    return info
  } catch (err) {
    console.error(`[EMAIL] ❌ Attempt ${attempt} failed (${mailOptions.to}): ${err.message}`)

    if (err.code === 'EAUTH') {
      // Auth errors won't be fixed by retrying — throw immediately with clear message
      const e = new Error('Gmail authentication failed. Check EMAIL_PASS in Render environment variables.')
      e.code = 'EAUTH'
      throw e
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
  await sendWithRetry({
    from:    `"AI Expense Tracker" <${config.emailUser?.trim()}>`,
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
  await sendWithRetry({
    from:    `"AI Expense Tracker" <${config.emailUser?.trim()}>`,
    to:      toEmail,
    subject: 'Reset your password — AI Expense Tracker',
    text:    `Hi ${name},\n\nReset your password here:\n${resetUrl}\n\nExpires in 1 hour.\n\nIgnore if you didn't request this.`,
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
