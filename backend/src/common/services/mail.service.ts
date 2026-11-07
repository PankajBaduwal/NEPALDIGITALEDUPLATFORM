import nodemailer, { Transporter } from 'nodemailer';
import { ENV } from '../../config/env';

/**
 * Outgoing email. Configure SMTP in backend/.env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM).
 * Without SMTP_HOST nothing is sent: the message is written to the server log (development) and the caller
 * is told so, instead of pretending that an email went out.
 */
let transporter: Transporter | null = null;

const configured = () => !!ENV.SMTP_HOST;

function getTransport() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_SECURE,
      auth: ENV.SMTP_USER ? { user: ENV.SMTP_USER, pass: ENV.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export const MailService = {
  isConfigured: configured,

  async send(to: string, subject: string, text: string, html?: string): Promise<{ sent: boolean; reason?: string }> {
    if (!to) return { sent: false, reason: 'no recipient address' };
    if (!configured()) {
      if (ENV.NODE_ENV !== 'production') console.log(`[mail:not-configured] To: ${to} | ${subject}\n${text}`);
      return { sent: false, reason: 'SMTP is not configured' };
    }
    try {
      await getTransport().sendMail({ from: ENV.MAIL_FROM, to, subject, text, html: html || undefined });
      return { sent: true };
    } catch (e: any) {
      console.error('[mail] send failed:', e?.message || e);
      return { sent: false, reason: 'the mail server rejected the message' };
    }
  },

  async sendPasswordReset(to: string, name: string, token: string) {
    const link = `${ENV.APP_URL.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;
    const text = `Namaste ${name || ''},\n\nWe received a request to reset your Nepal Education Platform password.\nOpen this link within 1 hour to choose a new password:\n\n${link}\n\nIf you did not ask for this, ignore this email; your password stays the same.`;
    const html = `<p>Namaste ${name || ''},</p><p>We received a request to reset your Nepal Education Platform password.</p><p><a href="${link}">Choose a new password</a> (valid for 1 hour).</p><p>If you did not ask for this, ignore this email; your password stays the same.</p>`;
    return this.send(to, 'Reset your Nepal Education Platform password', text, html);
  },
};
