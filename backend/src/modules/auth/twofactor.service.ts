import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { ENV } from '../../config/env';
import { User } from '../../models';

/**
 * Optional time-based one-time-password (authenticator app) sign-in.
 * The secret is stored encrypted (AES-256-GCM) in user.metadata.twoFactor; recovery codes are stored hashed.
 */
authenticator.options = { window: 1 }; // accept the previous/next 30-second code to tolerate clock drift

const KEY = crypto.createHash('sha256').update(`${ENV.JWT_SECRET}:2fa`).digest();
const enc = (plain: string) => {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const body = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return [iv.toString('hex'), c.getAuthTag().toString('hex'), body.toString('hex')].join('.');
};
const dec = (packed: string) => {
  const [iv, tag, body] = packed.split('.');
  const d = crypto.createDecipheriv('aes-256-gcm', KEY, Buffer.from(iv, 'hex'));
  d.setAuthTag(Buffer.from(tag, 'hex'));
  return Buffer.concat([d.update(Buffer.from(body, 'hex')), d.final()]).toString('utf8');
};
const sha = (s: string) => crypto.createHash('sha256').update(s).digest('hex');
const norm = (c: string) => String(c || '').replace(/\s|-/g, '');

const err = (status: number, message: string, code: string) => ({ status, message, code });

export const TwoFactorService = {
  isEnabled: (user: any) => !!user?.metadata?.twoFactor?.enabled,

  async status(userId: string) {
    const u: any = await User.findById(userId);
    if (!u) throw err(404, 'User not found', 'USER_NOT_FOUND');
    const tf = u.metadata?.twoFactor;
    return { enabled: !!tf?.enabled, recoveryCodesLeft: tf?.recoveryHashes?.length || 0, enabledAt: tf?.enabledAt || null };
  },

  /** Step 1: create a secret and QR code. Nothing is switched on until a code from the app is confirmed. */
  async setup(userId: string) {
    const u: any = await User.findById(userId);
    if (!u) throw err(404, 'User not found', 'USER_NOT_FOUND');
    if (u.metadata?.twoFactor?.enabled) throw err(409, 'Two-factor sign-in is already on.', 'ALREADY_ENABLED');
    const secret = authenticator.generateSecret();
    u.metadata = { ...(u.metadata || {}), twoFactor: { enabled: false, pending: enc(secret) } };
    u.markModified('metadata');
    await u.save();
    const otpauthUrl = authenticator.keyuri(u.username, 'Nepal Education Platform', secret);
    return { secret, otpauthUrl, qrDataUrl: await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 220 }) };
  },

  /** Step 2: confirm with a code from the app; returns one-time recovery codes. */
  async enable(userId: string, code: string) {
    const u: any = await User.findById(userId);
    const pending = u?.metadata?.twoFactor?.pending;
    if (!pending) throw err(400, 'Start the setup first.', 'NO_SETUP');
    if (!authenticator.check(norm(code), dec(pending))) throw err(400, 'That code is not correct. Check the code in your authenticator app and try again.', 'INVALID_CODE');
    const recoveryCodes = Array.from({ length: 8 }, () => crypto.randomBytes(5).toString('hex').toUpperCase().replace(/(.{5})(.{5})/, '$1-$2'));
    u.metadata = { ...u.metadata, twoFactor: { enabled: true, secret: pending, recoveryHashes: recoveryCodes.map((c) => sha(norm(c))), enabledAt: new Date().toISOString() } };
    u.markModified('metadata');
    await u.save();
    return { recoveryCodes };
  },

  /** True when the code is a valid app code, or an unused recovery code (which is then burned). */
  async verifyCode(u: any, rawCode: string): Promise<boolean> {
    const tf = u?.metadata?.twoFactor;
    if (!tf?.enabled || !tf.secret) return false;
    const code = norm(rawCode);
    if (/^\d{6}$/.test(code)) {
      try {
        return authenticator.check(code, dec(tf.secret));
      } catch {
        return false;
      }
    }
    const h = sha(code.toUpperCase());
    if (tf.recoveryHashes?.includes(h)) {
      u.metadata = { ...u.metadata, twoFactor: { ...tf, recoveryHashes: tf.recoveryHashes.filter((x: string) => x !== h) } };
      u.markModified('metadata');
      await u.save();
      return true;
    }
    return false;
  },

  async disable(userId: string, code: string) {
    const u: any = await User.findById(userId);
    if (!u?.metadata?.twoFactor?.enabled) throw err(400, 'Two-factor sign-in is not on.', 'NOT_ENABLED');
    if (!(await this.verifyCode(u, code))) throw err(400, 'That code is not correct.', 'INVALID_CODE');
    const meta = { ...u.metadata };
    delete meta.twoFactor;
    u.metadata = meta;
    u.markModified('metadata');
    await u.save();
    return { enabled: false };
  },

  /** Short-lived token proving the password step passed; exchanged together with a code for a real session. */
  challenge(userId: string) {
    return jwt.sign({ uid: userId, purpose: '2fa' }, ENV.JWT_SECRET, { expiresIn: '5m' });
  },
  readChallenge(token: string): string {
    try {
      const p: any = jwt.verify(token, ENV.JWT_SECRET);
      if (p.purpose !== '2fa') throw new Error('wrong purpose');
      return String(p.uid);
    } catch {
      throw err(401, 'This sign-in attempt expired. Please sign in again.', 'CHALLENGE_EXPIRED');
    }
  },
};
