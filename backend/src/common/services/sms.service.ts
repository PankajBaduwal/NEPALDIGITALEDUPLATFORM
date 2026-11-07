import { ENV } from '../../config/env';

/**
 * Text messages to guardians. Configure ONE provider in backend/.env:
 *   SMS_PROVIDER=sparrow   SMS_TOKEN=...   SMS_SENDER=...                (Sparrow SMS)
 *   SMS_PROVIDER=webhook   SMS_API_URL=https://...  SMS_TOKEN=...        (any gateway that accepts a JSON POST)
 * With no provider, nothing is sent and callers are told so (the message is only "prepared").
 */
export const SmsService = {
  isConfigured: () => !!ENV.SMS_PROVIDER && (ENV.SMS_PROVIDER === 'webhook' ? !!ENV.SMS_API_URL : !!ENV.SMS_TOKEN),

  /** Nepal mobile numbers: 98XXXXXXXX or 97XXXXXXXX, optionally with +977 / 977. Returns 10 digits or null. */
  normalize(raw?: string | null): string | null {
    const digits = String(raw || '').replace(/\D/g, '');
    const local = digits.startsWith('977') && digits.length === 13 ? digits.slice(3) : digits;
    return /^9[78]\d{8}$/.test(local) ? local : null;
  },

  mask(raw?: string | null): string {
    const n = this.normalize(raw);
    return n ? `${n.slice(0, 2)}******${n.slice(-2)}` : raw ? '(invalid number)' : '(no number)';
  },

  async send(to: string, text: string): Promise<{ ok: boolean; error?: string }> {
    if (!this.isConfigured()) return { ok: false, error: 'SMS is not configured on this server' };
    try {
      if (ENV.SMS_PROVIDER === 'sparrow') {
        const body = new URLSearchParams({ token: ENV.SMS_TOKEN, from: ENV.SMS_SENDER || 'InfoSMS', to, text });
        const r = await fetch('https://api.sparrowsms.com/v2/sms/', { method: 'POST', body, signal: AbortSignal.timeout(15000) });
        const j: any = await r.json().catch(() => ({}));
        return r.ok && (j.response_code === 200 || j.response_code === undefined) ? { ok: true } : { ok: false, error: String(j.response || `HTTP ${r.status}`).slice(0, 160) };
      }
      const r = await fetch(ENV.SMS_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(ENV.SMS_TOKEN ? { Authorization: `Bearer ${ENV.SMS_TOKEN}` } : {}) },
        body: JSON.stringify({ to, text, sender: ENV.SMS_SENDER || undefined }),
        signal: AbortSignal.timeout(15000),
      });
      return r.ok ? { ok: true } : { ok: false, error: `Gateway answered HTTP ${r.status}` };
    } catch (e: any) {
      return { ok: false, error: String(e?.message || 'Could not reach the SMS gateway').slice(0, 160) };
    }
  },
};
