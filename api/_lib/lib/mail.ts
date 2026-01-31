import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

const FROM_EMAIL = '3Play <noreply@3play.dev>' // Replace with your verified domain in production

export async function sendVerificationEmail(email: string, code: string) {
  if (!resend) {
    console.log('[Dev] Email would be sent to', email, 'with code', code)
    return { success: true, id: 'dev-mock' }
  }

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Ověř svůj email na 3Play',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Vítej v 3Play!</h1>
          <p>Pro dokončení registrace zadej tento kód:</p>
          <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px;">${code}</span>
          </div>
          <p>Kód je platný 10 minut.</p>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">Pokud jsi tento kód nevyžádal/a, můžeš tento email ignorovat.</p>
        </div>
      `
    })
    return { success: true, id: data.data?.id }
  } catch (error) {
    console.error('Failed to send email:', error)
    return { success: false, error }
  }
}
