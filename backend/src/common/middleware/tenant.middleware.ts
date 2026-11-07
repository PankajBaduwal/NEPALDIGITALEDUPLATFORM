import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ApiResponse } from '../utils/response.util';
import { UserRole } from '../constants/roles';

export function tenantMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return ApiResponse.error(res, 'Authentication required for tenant verification', 401, 'AUTH_REQUIRED');
  }

  // Super Admin can access any tenant or override via header/params
  if (req.user.role === UserRole.SUPER_ADMIN) {
    const targetInstitutionId = (req.headers['x-institution-id'] as string) || req.params.institutionId || req.body?.institutionId;
    if (targetInstitutionId) {
      req.institutionId = targetInstitutionId;
    }
    return next();
  }

  // Regular institution users MUST have an assigned institutionId
  if (!req.user.institutionId) {
    return ApiResponse.error(res, 'User has no assigned institution', 403, 'TENANT_NOT_ASSIGNED');
  }

  // Set the tenant context securely from the verified token
  req.institutionId = req.user.institutionId;

  // Strict tenant boundary check: if an institutionId parameter is in URL, body, or query, it MUST match the user's institution
  const requestedInstId =
    req.params.institutionId ||
    req.body?.institutionId ||
    (req.query?.institutionId as string) ||
    (req.headers['x-institution-id'] as string);

  if (requestedInstId && requestedInstId !== req.user.institutionId) {
    return ApiResponse.error(
      res,
      'Access denied: Tenant cross-contamination prohibited across institutional boundaries',
      403,
      'CROSS_TENANT_FORBIDDEN'
    );
  }

  next();
}

