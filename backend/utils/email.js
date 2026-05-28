import nodemailer from 'nodemailer'
import { config } from '../config/config.js'

// ── Transporter ───────────────────────────────────────────────
// Uses Gmail SMTP. Set EMAIL_USER and EMAIL_PASS in Render env vars.
// For Gmail: enable 2FA and create an App Password at
//   https://myaccount.google.com/apppasswords
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
  })
}

// ── OTP generator ─────────────────────────────────────────────
export function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000)) // 6-digit
}

// ── OTP expiry: 10 minutes from now ──────────────────────────
export function otpExpiryDate() {
  return new Date(Date.now() + 10 * 60 * 1000)
}

// ── Send verification OTP ─────────────────────────────────────
export async function sendVerificationEmail(toEmail, name, otp) {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"AI Expense Tracker" <${config.emailUser}>`,
    to: toEmail,
    subject: 'Verify your email — AI Expense Tracker',
    html: `
      <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto;background:#0f172a;color:#f1f5f9;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.08)">
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#fff">Verify your email</h2>
        <p style="margin:0 0 24px;color:#94a3b8;font-size:14px">Hi ${name}, use the code below to verify your account.</p>
        <div style="background:#1e293b;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;border:1px solid rgba(99,102,241,0.3)">
          <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8">Your OTP</p>
          <p style="margin:0;font-size:40px;font-weight:800;letter-spacing:0.2em;color:#818cf8">${otp}</p>
        </div>
        <p style="margin:0 0 8px;font-size:13px;color:#64748b">This code expires in <strong style="color:#f1f5f9">10 minutes</strong>.</p>
        <p style="margin:0;font-size:13px;color:#64748b">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  })
}

// ── Send password reset email ─────────────────────────────────
export async function sendPasswordResetEmail(toEmail, name, resetUrl) {
  const transporter = createTransporter()
  await transporter.sendMail({
    from: `"AI Expense Tracker" <${config.emailUser}>`,
    to: toEmail,
    subject: 'Reset your password — AI Expense Tracker',
    html: `
      <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto;background:#0f172a;color:#f1f5f9;border-radius:16px;padding:32px;border:1px solid rgba(255,255,255,0.08)">
        <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#fff">Reset your password</h2>
        <p style="margin:0 0 24px;color:#94a3b8;font-size:14px">Hi ${name}, click the button below to reset your password.</p>
        <div style="text-align:center;margin-bottom:24px">
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#38bdf8);color:#0f172a;font-weight:700;font-size:14px;padding:14px 32px;border-radius:50px;text-decoration:none">
            Reset Password
          </a>
        </div>
        <p style="margin:0 0 8px;font-size:13px;color:#64748b">This link expires in <strong style="color:#f1f5f9">1 hour</strong>.</p>
        <p style="margin:0 0 8px;font-size:13px;color:#64748b">Or copy this URL into your browser:</p>
        <p style="margin:0;font-size:12px;color:#6366f1;word-break:break-all">${resetUrl}</p>
        <p style="margin:16px 0 0;font-size:13px;color:#64748b">If you didn't request a password reset, ignore this email.</p>
      </div>
    `,
  })
}
