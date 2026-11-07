import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';

/** Small per-user sliding-window limiter (AI calls cost money and quota). */
const buckets = new Map<string, number[]>();

export function rateLimit(name: string, max: number, windowMs: number) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const key = `${name}:${req.user?.userId || req.ip}`;
    const now = Date.now();
    const hits = (buckets.get(key) || []).filter((t) => now - t < windowMs);
    if (hits.length >= max) {
      res.setHeader('Retry-After', Math.ceil((windowMs - (now - hits[0])) / 1000));
      res.status(429).json({ success: false, error: 'You are asking too quickly. Please wait a moment and try again.' });
      return;
    }
    hits.push(now);
    buckets.set(key, hits);
    if (buckets.size > 5000) for (const [k, v] of buckets) if (!v.length || now - v[v.length - 1] > windowMs) buckets.delete(k);
    next();
  };
}
