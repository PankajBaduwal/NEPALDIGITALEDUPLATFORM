import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { NotificationService } from './notification.service';
import { ApiResponse } from '../../common/utils/response.util';
import { Notification, SchoolAnnouncement, User } from '../../models';

export class NotificationController {
  static async getMyNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const institutionId = req.user?.institutionId || req.institutionId;

      if (!userId) {
        return ApiResponse.error(res, 'Authentication required', 401);
      }

      // If user has no institutionId, get from User record
      let effectiveInstId = institutionId;
      if (!effectiveInstId) {
        const u = await User.findById(userId);
        effectiveInstId = u?.institutionId?.toString();
      }

      // Query notifications for this user (or system-wide)
      const query: any = { recipientId: userId };
      if (effectiveInstId) {
        query.institutionId = effectiveInstId;
      }

      const items = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      const unreadCount = await Notification.countDocuments({
        ...query,
        isRead: false,
      });

      return ApiResponse.success(res, { items, unreadCount }, 'Notifications loaded successfully');
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const { id } = req.params;

      if (!userId) {
        return ApiResponse.error(res, 'Authentication required', 401);
      }

      const success = await NotificationService.markAsRead(id, userId);
      return ApiResponse.success(res, { success }, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const institutionId = req.user?.institutionId || req.institutionId;

      if (!userId) {
        return ApiResponse.error(res, 'Authentication required', 401);
      }

      let effectiveInstId = institutionId;
      if (!effectiveInstId) {
        const u = await User.findById(userId);
        effectiveInstId = u?.institutionId?.toString();
      }

      const modifiedCount = await NotificationService.markAllAsRead(userId, effectiveInstId || '');
      return ApiResponse.success(res, { modifiedCount }, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async sendNotification(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { recipientId, type, title, message, priority, metadata } = req.body;
      const institutionId = req.user?.institutionId || req.institutionId;

      // Only staff may send notifications to other users
      const staffRoles = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'PRINCIPAL', 'TEACHER'];
      if (recipientId && String(recipientId) !== String(req.user?.userId) && !staffRoles.includes(req.user?.role || '')) {
        return ApiResponse.error(res, 'Not authorized to notify other users', 403, 'FORBIDDEN_ROLE');
      }
      if (recipientId && req.user?.role !== 'SUPER_ADMIN') {
        const target = await User.findById(recipientId, 'institutionId').lean();
        if (!target || String(target.institutionId) !== String(institutionId)) {
          return ApiResponse.error(res, 'Recipient not found in your institution', 404);
        }
      }

      if (!title || !message) {
        return ApiResponse.error(res, 'Title and message are required', 400);
      }

      const notif = await NotificationService.sendNotification({
        recipientId: recipientId || req.user?.userId,
        institutionId: institutionId || '',
        type: type || 'SYSTEM_ALERT',
        title,
        message,
        priority: priority || 'NORMAL',
        metadata,
      });

      return ApiResponse.success(res, notif, 'Notification dispatched successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}

