import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { SubscriptionsService } from '../../modules/subscriptions/subscriptions.service';

/**
 * Middleware enforcing grade-level subscription entitlements.
 * Checks whether the institution's package includes the requested grade.
 */
export const requireGradeEntitlement = (gradeSource: 'param' | 'query' | 'body' = 'param', gradeKey = 'grade') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Super Admin bypasses all institutional entitlement checks
      if (req.user?.role === 'SUPER_ADMIN') {
        return next();
      }

      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        return next();
      }

      let rawGrade = req.params[gradeKey] || req.query[gradeKey] || (req.body && req.body[gradeKey]);
      if (!rawGrade) {
        return next();
      }

      const gradeNumber = parseInt(String(rawGrade), 10);
      if (isNaN(gradeNumber)) {
        return next();
      }

      const isEntitled = await SubscriptionsService.isGradeEntitled(institutionId.toString(), gradeNumber);
      if (!isEntitled) {
        res.status(403).json({
          success: false,
          error: {
            code: 'GRADE_NOT_ENTITLED',
            message: `Class ${gradeNumber} is not included in your institution's subscription package. Please upgrade to the Middle School, Secondary or K-12 package.`,
            details: { gradeNumber, institutionId },
          },
        });
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * Middleware enforcing feature/module entitlements (e.g. AI Assistant, Smart Board, Simulations).
 */
export const requireFeatureEntitlement = (feature: 'SIMULATIONS' | 'SMARTBOARD' | 'AI' | 'ACADEMIC' | 'ANALYTICS') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role === 'SUPER_ADMIN') {
        return next();
      }

      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        return next();
      }

      const entitlements = await SubscriptionsService.getInstitutionEntitlements(institutionId.toString());

      if (entitlements.isExpired && !entitlements.inGracePeriod) {
        res.status(403).json({
          success: false,
          error: {
            code: 'SUBSCRIPTION_EXPIRED',
            message: 'Your institution subscription has expired. Please renew your subscription to access this feature.',
            details: { institutionId, expiresAt: entitlements.expiresAt },
          },
        });
        return;
      }

      let hasFeature = true;
      if (feature === 'SIMULATIONS' && !entitlements.hasSimulations) hasFeature = false;
      if (feature === 'SMARTBOARD' && !entitlements.hasSmartBoard) hasFeature = false;
      if (feature === 'AI' && !entitlements.isAiAssistantEnabled) hasFeature = false;
      if (feature === 'ANALYTICS' && !entitlements.isAnalyticsEnabled) hasFeature = false;

      if (!hasFeature) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FEATURE_NOT_ENTITLED',
            message: `The ${feature} module is not included in your institution's current subscription plan.`,
            details: { feature, institutionId },
          },
        });
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};
