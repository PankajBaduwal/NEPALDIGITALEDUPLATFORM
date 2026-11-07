import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', NotificationController.getMyNotifications);
router.patch('/:id/read', NotificationController.markAsRead);
router.post('/mark-all-read', NotificationController.markAllAsRead);
router.post('/', NotificationController.sendNotification);

export const notificationRoutes = router;

