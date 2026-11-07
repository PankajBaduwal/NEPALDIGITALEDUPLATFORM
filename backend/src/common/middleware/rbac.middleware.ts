import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ApiResponse } from '../utils/response.util';
import { UserRole } from '../constants/roles';

export function authorize(...allowedRoles: (UserRole | string)[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required', 401, 'AUTH_REQUIRED');
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return ApiResponse.error(
        res,
        `Access denied: Role '${userRole}' is not authorized for this resource`,
        403,
        'FORBIDDEN_ROLE'
      );
    }

    next();
  };
}

