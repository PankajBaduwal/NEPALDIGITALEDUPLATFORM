import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { ApiResponse } from '../utils/response.util';
import { Institution } from '../../models';

/**
 * School-level academic changes (offerings, allocations, timetables).
 * Principals and School Admins act on their own school. A Super Admin may act only on a
 * school that has explicitly enabled `academicSettings.superAdminTimetableAccess`, and
 * must name it with the x-institution-id header.
 */
export function requireSchoolAcademicContext(opts: { write: boolean }) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const role = req.user?.role;
      if (role === 'SUPER_ADMIN') {
        if (!req.institutionId) return ApiResponse.error(res, 'Select a school (x-institution-id) first', 400, 'INSTITUTION_REQUIRED');
        if (opts.write) {
          const inst: any = await Institution.findById(req.institutionId, 'academicSettings');
          if (!inst?.academicSettings?.superAdminTimetableAccess) {
            return ApiResponse.error(res, 'This school has not authorised Super Admin changes to its academic schedule', 403, 'SUPER_ADMIN_NOT_AUTHORISED');
          }
        }
        return next();
      }
      if (!req.institutionId) return ApiResponse.error(res, 'User has no assigned institution', 403, 'TENANT_NOT_ASSIGNED');
      next();
    } catch (err) {
      next(err);
    }
  };
}
