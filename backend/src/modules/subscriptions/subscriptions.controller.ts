import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { SubscriptionsService } from './subscriptions.service';
import { UserRole } from '../../common/constants/roles';
import { Invoice, Payment } from '../../models/Subscription';

/** Non-super-admins may only touch invoices/payments of their own institution. */
function sameInstitution(req: AuthenticatedRequest, institutionId: any): boolean {
  if (req.user?.role === UserRole.SUPER_ADMIN) return true;
  const own = req.institutionId || req.user?.institutionId;
  return !!own && String(institutionId?._id || institutionId) === String(own);
}

export class SubscriptionsController {
  // ── Plans / Packages ───────────────────────────────────────────
  static async listPlans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.user?.role === UserRole.SUPER_ADMIN && req.query.all === 'true';
      const plans = await SubscriptionsService.listPlans(includeInactive);
      res.json({ success: true, data: plans });
    } catch (err) {
      next(err);
    }
  }

  static async getPlanById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plan = await SubscriptionsService.getPlanById(req.params.id);
      res.json({ success: true, data: plan });
    } catch (err) {
      next(err);
    }
  }

  static async createPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plan = await SubscriptionsService.createPlan(req.body);
      res.status(201).json({ success: true, data: plan });
    } catch (err) {
      next(err);
    }
  }

  static async updatePlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plan = await SubscriptionsService.updatePlan(req.params.id, req.body);
      res.json({ success: true, data: plan });
    } catch (err) {
      next(err);
    }
  }

  // ── Subscriptions Lifecycle ────────────────────────────────────
  static async assignSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await SubscriptionsService.assignSubscription({
        ...req.body,
        assignedBy: req.user?.userId,
      });
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async extendSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sub = await SubscriptionsService.extendSubscription({
        subscriptionId: req.params.id,
        additionalMonths: Number(req.body.additionalMonths) || 12,
        reason: req.body.reason,
        performedBy: req.user?.userId,
      });
      res.json({ success: true, data: sub });
    } catch (err) {
      next(err);
    }
  }

  static async suspendSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sub = await SubscriptionsService.suspendSubscription({
        subscriptionId: req.params.id,
        reason: req.body.reason || 'Suspended by Super Admin',
        performedBy: req.user?.userId,
      });
      res.json({ success: true, data: sub });
    } catch (err) {
      next(err);
    }
  }

  static async activateSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sub = await SubscriptionsService.activateSubscription({
        subscriptionId: req.params.id,
        reason: req.body.reason,
        performedBy: req.user?.userId,
      });
      res.json({ success: true, data: sub });
    } catch (err) {
      next(err);
    }
  }

  // ── Entitlements ───────────────────────────────────────────────
  static async getMyEntitlements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        return res.status(400).json({ success: false, error: { message: 'Institution ID required' } });
      }
      const entitlements = await SubscriptionsService.getInstitutionEntitlements(institutionId.toString());
      res.json({ success: true, data: entitlements });
    } catch (err) {
      next(err);
    }
  }

  static async getInstitutionEntitlements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const entitlements = await SubscriptionsService.getInstitutionEntitlements(req.params.institutionId);
      res.json({ success: true, data: entitlements });
    } catch (err) {
      next(err);
    }
  }

  // ── Invoices & Payments ────────────────────────────────────────
  static async listInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
      const institutionId = isSuperAdmin ? (req.query.institutionId as string) : (req.user?.institutionId || undefined);
      const status = req.query.status as string;

      const invoices = await SubscriptionsService.listInvoices(institutionId, status);
      res.json({ success: true, data: invoices });
    } catch (err) {
      next(err);
    }
  }

  static async getInvoiceById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const invoice: any = await SubscriptionsService.getInvoiceById(req.params.id);
      if (!sameInstitution(req, invoice.institutionId)) {
        return res.status(404).json({ success: false, message: 'Invoice not found' }) as any;
      }
      res.json({ success: true, data: invoice });
    } catch (err) {
      next(err);
    }
  }

  static async initiatePayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const inv: any = await Invoice.findById(req.body.invoiceId, 'institutionId status');
      if (!inv || !sameInstitution(req, inv.institutionId)) {
        return res.status(404).json({ success: false, message: 'Invoice not found' }) as any;
      }
      const result = await SubscriptionsService.initiatePayment({
        invoiceId: req.body.invoiceId,
        gateway: req.body.gateway || 'KHALTI',
        returnUrl: req.body.returnUrl,
        customerEmail: req.body.customerEmail || (req.user as any)?.email,
        customerPhone: req.body.customerPhone,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async verifyPayment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const pay: any = await Payment.findOne({ paymentReference: req.body.paymentReference }, 'institutionId gateway');
      if (!pay || !sameInstitution(req, pay.institutionId)) {
        return res.status(404).json({ success: false, message: 'Payment transaction not found' }) as any;
      }
      // Bank transfers are confirmed by a human; the manual gateway always reports success,
      // so only a Super Admin may trigger that verification.
      if (['BANK_TRANSFER', 'MANUAL'].includes(pay.gateway) && req.user?.role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({ success: false, message: 'Bank transfers must be verified by the platform administrator' }) as any;
      }
      const result = await SubscriptionsService.verifyPayment({
        paymentReference: req.body.paymentReference,
        gatewayTransactionId: req.body.gatewayTransactionId,
        pidx: req.body.pidx,
        token: req.body.token,
        callbackPayload: req.body,
        verifiedBy: req.user?.userId,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ── Renewals & History ─────────────────────────────────────────
  static async getRenewalDashboard(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dashboard = await SubscriptionsService.getRenewalDashboard();
      res.json({ success: true, data: dashboard });
    } catch (err) {
      next(err);
    }
  }

  static async getSubscriptionHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const isSuperAdmin = req.user?.role === UserRole.SUPER_ADMIN;
      const institutionId = isSuperAdmin ? (req.query.institutionId as string) : (req.user?.institutionId || undefined);
      const history = await SubscriptionsService.getSubscriptionHistory(institutionId);
      res.json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  }

  // ── Backward-compatible Aliases ────────────────────────────────
  static async listPackages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    return SubscriptionsController.listPlans(req, res, next);
  }

  static async assign(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    return SubscriptionsController.assignSubscription(req, res, next);
  }
}
