import fs from 'fs';
import path from 'path';

const MAX_BYTES = 2 * 1024 * 1024;
const EXT: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

/**
 * Saves an institution logo sent as a data URL (PNG / JPEG / WebP, max 2 MB) under uploads/logos
 * and returns its public path. SVG is refused on purpose (scripts can hide in SVG).
 */
export function saveLogoDataUrl(dataUrl: string, key: string): string {
  const m = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=\s]+)$/.exec(String(dataUrl || ''));
  if (!m) throw { status: 400, message: 'Logo must be a PNG, JPG or WebP image', code: 'INVALID_LOGO' };
  const buf = Buffer.from(m[2].replace(/\s/g, ''), 'base64');
  if (buf.length === 0 || buf.length > MAX_BYTES) throw { status: 400, message: 'Logo must be smaller than 2 MB', code: 'LOGO_TOO_LARGE' };
  const dir = path.resolve(process.cwd(), 'uploads/logos');
  fs.mkdirSync(dir, { recursive: true });
  const safe = String(key).replace(/[^a-zA-Z0-9_-]/g, '_');
  const name = `${safe}-${Date.now()}.${EXT[m[1]]}`;
  fs.writeFileSync(path.join(dir, name), buf);
  return `/uploads/logos/${name}`;
}
