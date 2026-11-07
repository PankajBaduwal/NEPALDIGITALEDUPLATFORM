import { Router } from 'express';
import { SchoolAdminController, SchoolAdminOverviewController } from './school-admin.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { UserRole } from '../../common/constants/roles';
import { requireSchoolAcademicContext } from '../../common/middleware/school-context.middleware';

const router = Router();

// Protect ALL school-admin routes: Authentication + Strict Tenant Isolation + Role Verification
router.use(authMiddleware);
router.use(tenantMiddleware);
// Announcements are shared with teachers (scoped inside the service), so register them before the admin-only gate
router.get('/announcements', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.SUPER_ADMIN), SchoolAdminController.getAnnouncements);
router.post('/announcements', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.PRINCIPAL, UserRole.TEACHER, UserRole.SUPER_ADMIN), SchoolAdminController.createAnnouncement);

router.use(authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN));

// 1. Dashboard Overview
router.get('/overview', SchoolAdminController.getOverview);
router.get('/allocations', SchoolAdminOverviewController.getAllocations);
router.get('/subjects', SchoolAdminOverviewController.getSubjectOverview);
router.get('/dashboard', SchoolAdminController.getDashboard);

// 2. Profile
router.get('/profile', SchoolAdminController.getProfile);
router.put('/profile', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN), SchoolAdminController.updateProfile);

// 3. Academic Structure (Classes, Sections, Subjects)
router.get('/structure', SchoolAdminController.getAcademicStructure);
router.get('/classes', SchoolAdminController.getClasses);
router.post('/classes', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN), SchoolAdminController.createClass);
router.post('/sections', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN), SchoolAdminController.createSection);

// 4. Teachers & Bulk Teacher Import
router.get('/teachers/import/template', SchoolAdminController.downloadTeacherTemplate);
router.post('/teachers/import/validate', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN), SchoolAdminController.validateTeacherImport);
router.post('/teachers/import/execute', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN), SchoolAdminController.executeTeacherImport);
router.get('/teachers', SchoolAdminController.getTeachers);
router.post('/teachers', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN), SchoolAdminController.createTeacher);
router.patch('/teachers/:teacherId/status', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN), SchoolAdminController.toggleTeacherStatus);

// 5. Students & Bulk Student Import
router.get('/students/import/template', SchoolAdminController.downloadStudentTemplate);
router.post('/students/import/validate', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN), SchoolAdminController.validateStudentImport);
router.post('/students/import/execute', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN), SchoolAdminController.executeStudentImport);
router.get('/students', SchoolAdminController.getStudents);
router.post('/students', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.SUPER_ADMIN), SchoolAdminController.registerStudent);

// 6. Allocations & Class Teachers
router.post('/allocations/bulk', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN), requireSchoolAcademicContext({ write: true }), SchoolAdminController.bulkAllocateSubjects);
router.post('/allocations', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN), requireSchoolAcademicContext({ write: true }), SchoolAdminController.allocateSubject);
router.post('/sections/:sectionId/class-teacher', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN), SchoolAdminController.assignClassTeacher);

// 7. Timetable
router.get('/timetable', SchoolAdminController.getTimetable);
router.post('/timetable', authorize(UserRole.SCHOOL_ADMIN, UserRole.COLLEGE_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN), requireSchoolAcademicContext({ write: true }), SchoolAdminController.createTimetableSlot);

// 8. Announcements

export const schoolAdminRoutes = router;
