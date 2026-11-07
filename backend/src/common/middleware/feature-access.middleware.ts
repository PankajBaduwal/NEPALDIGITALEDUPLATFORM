import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { FeatureKey, FEATURE_DEFINITIONS } from '../../models/FeatureAccess';
import { FeatureAccessService } from '../../modules/feature-access/feature-access.service';
import { Assignment } from '../../models/Assessment';
import { Quiz } from '../../models/Quiz';
import { AcademicMaterial } from '../../models/AcademicMaterial';
import mongoose from 'mongoose';

/**
 * Express middleware that checks whether the requested feature is enabled for
 * the current user / context (institution, class, section, student).
 */
export const requireFeatureAccess = (
  featureKey: FeatureKey,
  options?: {
    extractFrom?: 'body' | 'params' | 'query';
    classKey?: string;
    sectionKey?: string;
    studentKey?: string;
    resource?: 'assignment' | 'quiz' | 'material';
  }
) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Super Admin always bypasses school-level access toggles
      if (req.user?.role === 'SUPER_ADMIN') {
        return next();
      }

      const institutionId = req.institutionId || req.user?.institutionId;
      if (!institutionId) {
        res.status(403).json({
          success: false,
          error: { code: 'INSTITUTION_CONTEXT_REQUIRED', message: 'Institution context is required for feature access.' },
        });
        return;
      }

      const source = options?.extractFrom || 'body';
      const container = source === 'params' ? req.params : source === 'query' ? req.query : req.body;

      let classId = container?.[options?.classKey || 'classId'] || req.params.classId;
      let sectionId = container?.[options?.sectionKey || 'sectionId'] || req.params.sectionId;
      let studentId = container?.[options?.studentKey || 'studentId'] || req.params.studentId;
      let resourceClassId: string | undefined;
      let resourceSectionId: string | undefined;

      if (options?.resource) {
        const resourceId = req.params.id;
        if (!resourceId || !mongoose.isValidObjectId(resourceId)) {
          res.status(400).json({
            success: false,
            error: { code: 'INVALID_RESOURCE_ID', message: 'A valid learning resource ID is required.' },
          });
          return;
        }
        const resourceModel = options.resource === 'assignment'
          ? Assignment
          : options.resource === 'quiz'
            ? Quiz
            : AcademicMaterial;
        const resource = await resourceModel.findOne({ _id: resourceId, institutionId }).select('classId sectionId');
        if (!resource) {
          res.status(404).json({ success: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Learning resource not found.' } });
          return;
        }
        resourceClassId = resource.classId?.toString();
        resourceSectionId = resource.sectionId?.toString();
        classId = resourceClassId || classId;
        sectionId = resourceSectionId || sectionId;
      }

      // Resolve student feature context from the authenticated identity, never client-supplied IDs.
      if (req.user?.role === 'STUDENT') {
        studentId = req.user.userId;
        classId = undefined;
        sectionId = undefined;
      }

      const resolution = await FeatureAccessService.resolveFeatureAccess({
        institutionId: institutionId.toString(),
        classId: classId ? classId.toString() : undefined,
        sectionId: sectionId ? sectionId.toString() : undefined,
        studentId: studentId ? studentId.toString() : undefined,
        featureKey,
      });

      if (req.user?.role === 'STUDENT' && (!resolution.sectionId || !resolution.classId)) {
        res.status(403).json({
          success: false,
          error: { code: 'ENROLLMENT_CONTEXT_REQUIRED', message: 'An active enrollment is required to access this feature.' },
        });
        return;
      }

      if (
        req.user?.role === 'STUDENT' &&
        resourceClassId &&
        (resolution.classId !== resourceClassId ||
          (resourceSectionId && resolution.sectionId !== resourceSectionId))
      ) {
        res.status(403).json({
          success: false,
          error: { code: 'RESOURCE_ACCESS_DENIED', message: 'This resource is not assigned to your active enrollment.' },
        });
        return;
      }

      if (!resolution.effectiveEnabled) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FEATURE_ACCESS_DISABLED',
            message: `${FEATURE_DEFINITIONS[featureKey]?.name || featureKey} is currently disabled by your school administrator.`,
            details: {
              featureKey,
              source: resolution.source,
              reason: resolution.reason || 'Restricted by school feature configuration policy',
            },
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
