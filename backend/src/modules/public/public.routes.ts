import { Router } from 'express';
import { Institution, User, CentralSubject, Textbook } from '../../models';
import { ApiResponse } from '../../common/utils/response.util';
import { rateLimit } from '../../common/middleware/rate-limit.middleware';

/** Read-only, anonymous figures for the public homepage. Counts only: no names, contacts or other personal data. */
const router = Router();
let cache: { at: number; data: any } | null = null;
const TTL = 5 * 60 * 1000;

router.get('/overview', rateLimit('public-overview', 60, 60 * 1000), async (_req, res, next) => {
  try {
    if (!cache || Date.now() - cache.at > TTL) {
      const [institutions, students, teachers, districts, subjects, textbooks] = await Promise.all([
        Institution.countDocuments({ status: 'ACTIVE' }),
        User.countDocuments({ role: 'STUDENT', status: { $nin: ['INACTIVE', 'SUSPENDED'] } }),
        User.countDocuments({ role: 'TEACHER', status: { $nin: ['INACTIVE', 'SUSPENDED'] } }),
        Institution.distinct('district', { status: 'ACTIVE', district: { $nin: [null, ''] } }),
        CentralSubject.countDocuments({ isActive: true }),
        Textbook.countDocuments({ isActive: true, status: 'PUBLISHED' }),
      ]);
      cache = { at: Date.now(), data: { institutions, students, teachers, districts: districts.length, subjects, textbooks, asOf: new Date().toISOString() } };
    }
    return ApiResponse.success(res, cache.data, 'Platform overview');
  } catch (e) { next(e); }
});

export const publicRoutes = router;
