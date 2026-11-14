import { Router } from 'express';
import { FeatureAccessController } from './feature-access.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { UserRole } from '../../common/constants/roles';

// Access control belongs to the Super Admin only. Schools (principals, school admins, teachers) cannot change or
// even read these settings; they only receive the result through /my-features.
const router = Router();

// Public / Authenticated Registry
router.get('/registry', authMiddleware, FeatureAccessController.getRegistry);

// Features switched off for the signed-in student / teacher (drives menu hiding)
router.get('/my-features', authMiddleware, tenantMiddleware, authorize(UserRole.STUDENT, UserRole.TEACHER), FeatureAccessController.getMyFeatures);

// Permission Resolution (used by frontend and backend API checks)
router.post(
  '/resolve',
  authMiddleware,
  tenantMiddleware,
  FeatureAccessController.resolveAccess
);

// Class 1–12 Configuration Matrix
router.get(
  '/matrix',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  FeatureAccessController.getClassMatrix
);

// Institution Defaults
router.get(
  '/institution',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  FeatureAccessController.getInstitutionSettings
);
router.put(
  '/institution',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  FeatureAccessController.updateInstitutionSetting
);

// Class-wise Settings
router.get(
  '/classes/:classId',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  FeatureAccessController.getClassSettings
);
router.put(
  '/classes/:classId',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  FeatureAccessController.updateClassSetting
);
router.post(
  '/classes/bulk',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  FeatureAccessController.bulkUpdateClassSettings
);

// Section-wise Settings
router.get(
  '/sections/:sectionId',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  FeatureAccessController.getSectionSettings
);
router.put(
  '/sections/:sectionId',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  FeatureAccessController.updateSectionSetting
);

// Student Overrides
router.post(
  '/students/:studentId/override',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  FeatureAccessController.setStudentOverride
);

// Reset Overrides
router.post(
  '/reset',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  FeatureAccessController.resetOverrides
);

// Student Device Profiles
router.get(
  '/device-profiles',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  FeatureAccessController.getDeviceProfiles
);
router.put(
  '/device-profiles',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  FeatureAccessController.upsertDeviceProfile
);

// Audit History (Super Admin only)
router.get(
  '/history',
  authMiddleware,
  tenantMiddleware,
  authorize(UserRole.SUPER_ADMIN),
  FeatureAccessController.getConfigurationHistory
);

export const featureAccessRoutes = router;
