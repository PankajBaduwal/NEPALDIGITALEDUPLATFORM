import { Router } from 'express';
import { AdminController } from './admin.controller';
import { PlatformController } from './platform.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { UserRole } from '../../common/constants/roles';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Protect ALL admin routes: Only Super Admin
router.use(authMiddleware);
router.use(authorize(UserRole.SUPER_ADMIN));

// 1. Dashboard Overview & Analytics
router.get('/overview', AdminController.getOverview);

// 2. Institution Management & Direct Provisioning
router.get('/institutions', AdminController.getInstitutions);
router.post('/institutions/provision', AdminController.provisionInstitution);
router.get('/institutions/:id', AdminController.getInstitutionDetails);
router.patch('/institutions/:id/assign-leadership', AdminController.assignLeadership);
router.post('/institutions', AdminController.createInstitution);
router.put('/institutions/:id', AdminController.updateInstitution);
router.put('/institutions/:id/logo', AdminController.updateInstitutionLogo);
router.patch('/institutions/:id/status', AdminController.setInstitutionStatus);
router.post('/institutions/:id/admin', AdminController.provisionAdministrator);

// 2b. Provisioning History & Job Status
router.get('/provisioning-history', AdminController.getProvisioningHistory);
router.get('/provisioning-history/:jobCode', AdminController.getProvisioningJobStatus);

// 2c. Registration Requests (Self-Registration Approvals)
router.get('/registration-requests', AdminController.getRegistrationRequests);
router.get('/registration-requests/:id', AdminController.getRegistrationRequestDetails);
router.put('/registration-requests/:id', AdminController.updateRegistrationRequest);
router.patch('/registration-requests/:id/approve', AdminController.approveRegistrationRequest);
router.patch('/registration-requests/:id/reject', AdminController.rejectRegistrationRequest);
router.patch('/registration-requests/:id/request-info', AdminController.requestMoreInfoForRegistration);

// 3. Bulk Import
router.get('/institutions/import/template', AdminController.downloadImportTemplate);
router.post('/institutions/import/validate', upload.single('file'), AdminController.validateBulkImport);
router.post('/institutions/import/execute', AdminController.executeBulkImport);

// 4. Central User Management
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.setUserStatus);
router.post('/users/:id/reset-password', AdminController.resetUserPassword);

// 5. Global Content & Curriculum
router.get('/content/summary', AdminController.getContentSummary);

// 6. Audit Logs, Announcements
router.get('/audit-logs/export', AdminController.exportAuditLogs);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/announcements', AdminController.getAnnouncements);
router.post('/announcements', AdminController.createAnnouncement);

// 7. Platform operations: school health, AI usage, announcements, bulk subscriptions, view-as
router.get('/platform/health', PlatformController.health);
router.get('/platform/ai-usage', PlatformController.aiUsage);
router.get('/platform/announcements', PlatformController.listAnnouncements);
router.post('/platform/announcements', PlatformController.sendAnnouncement);
router.delete('/platform/announcements/:batchId', PlatformController.withdrawAnnouncement);
router.get('/platform/subscriptions', PlatformController.listSubscriptions);
router.post('/platform/subscriptions/bulk', PlatformController.bulkSubscriptions);
router.post('/platform/impersonate', PlatformController.impersonate);

export const adminRoutes = router;

