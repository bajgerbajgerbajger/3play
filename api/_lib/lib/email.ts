import { Resend } from 'resend'

let resend: Resend | null = null

if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY)
}

export async function sendVerificationEmail(email: string, code: string) {
  if (!resend) {
    console.log(`[Email Mock] To: ${email}, Code: ${code}`)
    return false
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  try {
    await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Your 3Play Verification Code',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to 3Play!</h2>
          <p>Your verification code is:</p>
          <h1 style="background: #f4f4f5; padding: 20px; text-align: center; letter-spacing: 10px; border-radius: 8px;">${code}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}
