import { Router } from 'express';
import { SubscriptionsController } from './subscriptions.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { UserRole } from '../../common/constants/roles';

const router = Router();

// ── 1. Public / Authenticated Plan Catalog ────────────────────────
// Public catalog, but identify the caller when a token is present so Super Admin can pass ?all=true
const optionalAuth = (req: any, res: any, next: any) =>
  req.headers.authorization ? authMiddleware(req, res, next) : next();

router.get('/packages', optionalAuth, SubscriptionsController.listPlans);
router.get('/plans', optionalAuth, SubscriptionsController.listPlans);
router.get('/plans/:id', SubscriptionsController.getPlanById);

// ── 2. Super Admin Package Management ─────────────────────────────
router.post('/plans', authMiddleware, authorize(UserRole.SUPER_ADMIN), SubscriptionsController.createPlan);
router.put('/plans/:id', authMiddleware, authorize(UserRole.SUPER_ADMIN), SubscriptionsController.updatePlan);

// ── 3. Subscriptions Lifecycle ────────────────────────────────────
router.post(
  '/assign',
  authMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  SubscriptionsController.assignSubscription
);

router.post(
  '/:id/extend',
  authMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  SubscriptionsController.extendSubscription
);

router.post(
  '/:id/suspend',
  authMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  SubscriptionsController.suspendSubscription
);

router.post(
  '/:id/activate',
  authMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  SubscriptionsController.activateSubscription
);

// ── 4. Entitlements ───────────────────────────────────────────────
router.get('/my-entitlements', authMiddleware, tenantMiddleware, SubscriptionsController.getMyEntitlements);
router.get(
  '/institution/:institutionId/entitlements',
  authMiddleware,
  authorize(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN),
  SubscriptionsController.getInstitutionEntitlements
);

// ── 5. Invoices & Billing ─────────────────────────────────────────
router.get(
  '/invoices',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN),
  SubscriptionsController.listInvoices
);

router.get(
  '/invoices/:id',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN),
  SubscriptionsController.getInvoiceById
);

// ── 6. Payment Architecture ───────────────────────────────────────
router.post(
  '/payments/initiate',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN),
  SubscriptionsController.initiatePayment
);

router.post(
  '/payments/verify',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN),
  SubscriptionsController.verifyPayment
);

// ── 7. Renewals & History ─────────────────────────────────────────
router.get(
  '/renewals/dashboard',
  authMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  SubscriptionsController.getRenewalDashboard
);

router.get(
  '/history',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN, UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN),
  SubscriptionsController.getSubscriptionHistory
);

export const subscriptionRoutes = router;
