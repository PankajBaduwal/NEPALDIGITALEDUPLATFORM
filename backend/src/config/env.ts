import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const resolveExistingDir = (preferred: string[], fallback: string) => {
  for (const candidate of preferred) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return fallback;
};

const rootNepalData = path.resolve(__dirname, '../../../Nepal data');
const cwdNepalData = path.resolve(process.cwd(), 'Nepal data');
const parentNepalData = path.resolve(process.cwd(), '../Nepal data');

const IS_PRODUCTION = (process.env.NODE_ENV || 'development') === 'production';
if (IS_PRODUCTION && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set when NODE_ENV=production');
}

export const ENV = {
  // Demo shortcuts (public demo-login, shared demo passwords, reset token in response)
  // are on in development and OFF in production unless DEMO_MODE=true is set explicitly.
  DEMO_MODE: IS_PRODUCTION ? process.env.DEMO_MODE === 'true' : process.env.DEMO_MODE !== 'false',
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'nepal_eduverse_jwt_secret_key_2081_super_secure_key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SMARTBOARD_PATH: path.resolve(process.cwd(), process.env.SMARTBOARD_PATH || '../smartboard'),
  // Outgoing email (password reset). Leave SMTP_HOST empty to disable sending.
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  MAIL_FROM: process.env.MAIL_FROM || 'Nepal Education Platform <no-reply@localhost>',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  // Guardian text messages. Leave SMS_PROVIDER empty to disable sending.
  SMS_PROVIDER: (process.env.SMS_PROVIDER || '').toLowerCase(),
  SMS_TOKEN: process.env.SMS_TOKEN || '',
  SMS_SENDER: process.env.SMS_SENDER || '',
  SMS_API_URL: process.env.SMS_API_URL || '',
  // Gemini — server-side only. Models are configurable so they can change without code edits.
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_TEXT_MODEL: process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash',
  GEMINI_MULTIMODAL_MODEL: process.env.GEMINI_MULTIMODAL_MODEL || process.env.GEMINI_TEXT_MODEL || 'gemini-3.5-flash',
  GEMINI_EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
  GEMINI_EMBEDDING_DIMENSIONS: parseInt(process.env.GEMINI_EMBEDDING_DIMENSIONS || '768', 10),
  NEPAL_DATA_PATH: resolveExistingDir([rootNepalData, cwdNepalData, parentNepalData], rootNepalData),
};

