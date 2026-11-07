import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { UserRole } from '../../common/constants/roles';
import { rateLimit } from '../../common/middleware/rate-limit.middleware';

const router = Router();

router.post('/login', rateLimit('auth-login', 30, 5 * 60_000), AuthController.login);
router.post('/2fa/verify', rateLimit('auth-2fa', 10, 5 * 60_000), AuthController.verifyTwoFactor);
router.get('/2fa/status', authMiddleware, AuthController.twoFactorStatus);
router.post('/2fa/setup', authMiddleware, AuthController.twoFactorSetup);
router.post('/2fa/enable', authMiddleware, rateLimit('auth-2fa-enable', 10, 5 * 60_000), AuthController.twoFactorEnable);
router.post('/2fa/disable', authMiddleware, rateLimit('auth-2fa-disable', 10, 5 * 60_000), AuthController.twoFactorDisable);
router.post('/demo-login', AuthController.demoLogin);
router.get('/institutions', AuthController.getPublicInstitutions);
router.post('/register-institution', AuthController.registerInstitution);
router.get('/institution-registration-status/:code', AuthController.getInstitutionRegistrationStatus);
router.post('/forgot-password', rateLimit('auth-forgot', 5, 15 * 60_000), AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

router.get('/me', authMiddleware, AuthController.getMe);
router.get('/preferences', authMiddleware, AuthController.getPreferences);
router.put('/preferences', authMiddleware, AuthController.updatePreferences);
router.post('/change-password', authMiddleware, AuthController.changePassword);
router.patch('/profile', authMiddleware, AuthController.updateProfile);
router.post('/refresh', AuthController.refresh);
router.post('/smartboard-session', authMiddleware, AuthController.createSmartboardSession);

// Admin review for registration requests
router.get(
  '/registration-requests',
  authMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  AuthController.getRegistrationRequests
);
router.patch(
  '/registration-requests/:id/review',
  authMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  AuthController.reviewRegistrationRequest
);

export const authRoutes = router;

