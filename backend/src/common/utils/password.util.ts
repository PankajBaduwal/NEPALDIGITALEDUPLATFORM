import crypto from 'crypto';

// No look-alike characters (0/O, 1/l/I) so passwords can be read out or typed from a printed sheet.
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Cryptographically random one-time password, e.g. "Kq7mTz4x@2081" style strength without a guessable pattern. */
export function generateTempPassword(length = 10): string {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}
