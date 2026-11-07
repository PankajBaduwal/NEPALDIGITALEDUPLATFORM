import { Router } from 'express';
import { AcademicController } from './academic.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { UserRole } from '../../common/constants/roles';
import { requireSchoolAcademicContext } from '../../common/middleware/school-context.middleware';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

// School Admin & Principal routes
router.post('/years', authorize(UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN), AcademicController.createYear);
router.post('/classes', authorize(UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN), AcademicController.createClass);
router.post('/sections', authorize(UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN), AcademicController.createSection);
router.post('/sections/:sectionId/class-teacher', authorize(UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN), AcademicController.assignClassTeacher);
router.post('/allocations', authorize(UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN), requireSchoolAcademicContext({ write: true }), AcademicController.assignSubject);
router.post('/enrollments', authorize(UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN), AcademicController.enrollStudent);

// Teacher routes
router.get('/my-allocations', authorize(UserRole.TEACHER, UserRole.SUPER_ADMIN), AcademicController.getMyAllocations);
router.get('/my-class-teacher-sections', authorize(UserRole.TEACHER, UserRole.SUPER_ADMIN), AcademicController.getMyClassTeacherSections);
router.get('/sections/:sectionId/students', authorize(UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.PRINCIPAL, UserRole.SUPER_ADMIN), AcademicController.getSectionStudents);
router.post('/attendance', authorize(UserRole.TEACHER, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN), AcademicController.recordAttendance);
router.post('/assessments/:assessmentId/marks', authorize(UserRole.TEACHER, UserRole.SUPER_ADMIN), AcademicController.recordMarks);

// Class Teacher & Principal result publication
router.post('/assessments/:assessmentId/publish', authorize(UserRole.TEACHER, UserRole.PRINCIPAL, UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN), AcademicController.publishResults);

// Student routes
router.get('/my-results', authorize(UserRole.STUDENT), AcademicController.getMyResults);

export const academicRoutes = router;

