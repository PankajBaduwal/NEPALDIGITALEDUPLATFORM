import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { ApiResponse } from '../../common/utils/response.util';
import { PlatformService } from './platform.service';

const wrap = (fn: (req: AuthenticatedRequest) => Promise<{ data: any; message: string; status?: number }>) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const r = await fn(req);
    return ApiResponse.success(res, r.data, r.message, r.status || 200);
  } catch (e) {
    next(e);
  }
};
const me = (req: AuthenticatedRequest) => ({ userId: req.user!.userId, username: req.user!.username });

export const PlatformController = {
  health: wrap(async (req) => ({ data: await PlatformService.health(req.query as any), message: 'Institution health loaded' })),
  aiUsage: wrap(async (req) => ({ data: await PlatformService.aiUsage(req.query.days), message: 'AI usage loaded' })),
  sendAnnouncement: wrap(async (req) => ({ data: await PlatformService.sendAnnouncement(me(req), req.body), message: 'Announcement sent', status: 201 })),
  listAnnouncements: wrap(async () => ({ data: await PlatformService.listAnnouncements(), message: 'Announcements loaded' })),
  withdrawAnnouncement: wrap(async (req) => ({ data: await PlatformService.withdrawAnnouncement(me(req), req.params.batchId), message: 'Announcement withdrawn' })),
  listSubscriptions: wrap(async (req) => ({ data: await PlatformService.listSubscriptions(req.query as any), message: 'Subscriptions loaded' })),
  bulkSubscriptions: wrap(async (req) => ({ data: await PlatformService.bulkSubscriptions(me(req), req.body), message: 'Bulk action finished' })),
  impersonate: wrap(async (req) => {
    if (req.user?.impersonatedBy) throw { status: 403, message: 'You are already viewing as another user. Exit that view first.', code: 'ALREADY_IMPERSONATING' };
    return { data: await PlatformService.impersonate(me(req), req.body, req.ip), message: 'Viewing as the school administrator' };
  }),
};
