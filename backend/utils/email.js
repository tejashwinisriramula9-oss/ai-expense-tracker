import nodemailer from 'nodemailer'
import { config } from '../config/config.js'

// ─────────────────────────────────────────────────────────────
// Gmail SMTP configuration
//
// REQUIRED Render environment variables:
//   EMAIL_USER = your-gmail@gmail.com
//   EMAIL_PASS = 16-character App Password (NOT your Gmail login password)
//
// How to get an App Password:
//   1. Go to https://myaccount.google.com/security
//   2. Enable "2-Step Verification" if not already on
//   3. Go to https://myaccount.google.com/apppasswords
//   4. Select app: Mail  |  device: Other → type "Render"
//   5. Copy the 16-char password (no spaces) → paste as EMAIL_PASS
// ─────────────────────────────────────────────────────────────

// Use explicit host/port instead of service:'gmail' shorthand —
// more reliable on Linux/Render environments.
function buildTransporter() {
  return nodemailer.createTransport({
    host:   'smtp.gmail.com',
    port:   465,
    secure: true,           // SSL on port 465
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
    // Increase timeouts for Render's network
    connectionTimeout: 10000,
    greetingTimeout:   10000,
    socketTimeout:     15000,
    logger: false,          // set true temporarily to debug SMTP conversation
    debug:  false,
  })
}

// ── Verify transporter once at startup ───────────────────────
// Called from server.js so any misconfiguration shows in Render logs immediately.
export async function verifyEmailTransporter() {
  if (!config.emailUser || !config.emailPass) {
    console.warn('[EMAIL] ⚠️  EMAIL_USER or EMAIL_PASS not set — email delivery disabled.')
    return false
  }
  try {
    const t = buildTransporter()
    await t.verify()
    console.log(`[EMAIL] ✅ SMTP transporter verified — ready to send from ${config.emailUser}`)
    return true
  } catch (err) {
    console.error('[EMAIL] ❌ SMTP verification failed:', err.message)
    console.error('[EMAIL] Check: EMAIL_USER is a Gmail address, EMAIL_PASS is a 16-char App Password (not your Gmail password)')
    return false
  }
}

// ── OTP helpers ───────────────────────────────────────────────
export function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function otpExpiryDate() {
  return new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
}

// ── Internal send with one retry ─────────────────────────────
async function sendWithRetry(mailOptions, attempt = 1) {
  const transporter = buildTransporter()
  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(`[EMAIL] ✅ Sent to ${mailOptions.to} — messageId: ${info.messageId}`)
    return info
  } catch (err) {
    console.error(`[EMAIL] ❌ Send attempt ${attempt} failed to ${mailOptions.to}:`, err.message)
    if (attempt < 2) {
      console.log('[EMAIL] Retrying in 3s…')
      await new Promise((r) => setTimeout(r, 3000))
      return sendWithRetry(mailOptions, attempt + 1)
    }
    throw err // re-throw after 2 failed attempts
  }
}

// ── Send verification OTP ─────────────────────────────────────
export async function sendVerificationEmail(toEmail, name, otp) {
  console.log(`[EMAIL] Sending OTP to ${toEmail}…`)
  await sendWithRetry({
    from:    `"AI Expense Tracker" <${config.emailUser}>`,
    to:      toEmail,
    subject: 'Your verification code — AI Expense Tracker',
    // Plain-text fallback (important for deliverability)
    text: `Hi ${name},\n\nYour verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't create an account, ignore this email.`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#020617;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:40px 16px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:16px;border:1px solid rgba(255,255,255,0.08);padding:40px 32px;max-width:480px;width:100%">
        <tr><td>
          <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#6366f1;font-weight:600">AI Expense Tracker</p>
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#f1f5f9">Verify your email</h1>
          <p style="margin:0 0 28px;font-size:14px;color:#94a3b8;line-height:1.6">Hi <strong style="color:#f1f5f9">${name}</strong>, use the code below to verify your account.</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:12px;border:1px solid rgba(99,102,241,0.3);margin-bottom:28px">
            <tr><td align="center" style="padding:28px">
              <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#94a3b8">Your OTP</p>
              <p style="margin:0;font-size:44px;font-weight:800;letter-spacing:0.25em;color:#818cf8;font-variant-numeric:tabular-nums">${otp}</p>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;font-size:13px;color:#64748b">⏱ This code expires in <strong style="color:#f1f5f9">10 minutes</strong>.</p>
          <p style="margin:0;font-size:13px;color:#64748b">If you didn't create an account, you can safely ignore this email.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}

// ── Send password reset email ─────────────────────────────────
export async function sendPasswordResetEmail(toEmail, name, resetUrl) {
  console.log(`[EMAIL] Sending password reset to ${toEmail}…`)
  await sendWithRetry({
    from:    `"AI Expense Tracker" <${config.emailUser}>`,
    to:      toEmail,
    subject: 'Reset your password — AI Expense Tracker',
    text: `Hi ${name},\n\nClick the link below to reset your password:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request a password reset, ignore this email.`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#020617;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#020617;padding:40px 16px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:16px;border:1px solid rgba(255,255,255,0.08);padding:40px 32px;max-width:480px;width:100%">
        <tr><td>
          <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#6366f1;font-weight:600">AI Expense Tracker</p>
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#f1f5f9">Reset your password</h1>
          <p style="margin:0 0 28px;font-size:14px;color:#94a3b8;line-height:1.6">Hi <strong style="color:#f1f5f9">${name}</strong>, click the button below to set a new password.</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
            <tr><td align="center">
              <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#38bdf8);color:#0f172a;font-weight:700;font-size:15px;padding:16px 40px;border-radius:50px;text-decoration:none">
                Reset Password
              </a>
            </td></tr>
          </table>

          <p style="margin:0 0 8px;font-size:13px;color:#64748b">⏱ This link expires in <strong style="color:#f1f5f9">1 hour</strong>.</p>
          <p style="margin:0 0 16px;font-size:13px;color:#64748b">Or copy this URL into your browser:</p>
          <p style="margin:0 0 16px;font-size:12px;color:#6366f1;word-break:break-all">${resetUrl}</p>
          <p style="margin:0;font-size:13px;color:#64748b">If you didn't request this, ignore this email — your password won't change.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}
