import { Router } from 'express';
import { TeacherController } from './teacher.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { UserRole } from '../../common/constants/roles';
import { teacherToolsRoutes } from './teacher-tools.routes';

const router = Router();

// Enforce authentication, teacher role, and tenant isolation
router.use(authMiddleware);
router.use(authorize(UserRole.TEACHER, UserRole.SUPER_ADMIN));
router.use(tenantMiddleware);

// Teaching diary and student dossier (every teacher, own classes only)
router.use(teacherToolsRoutes);

// Overview & Classes
router.get('/overview', TeacherController.getOverview);
router.get('/classes', TeacherController.getAssignedClasses);

// Subject Workspace
router.get('/workspace/:sectionId/:centralSubjectId', TeacherController.getSubjectWorkspace);

// Syllabus progress
router.get('/syllabus/:sectionId/:centralSubjectId', TeacherController.getSyllabus);
router.post('/syllabus', TeacherController.saveSyllabusProgress);

// Student insights and remarks
router.get('/insights/:sectionId', TeacherController.getInsights);
router.post('/remarks', TeacherController.addRemark);
router.get('/remarks/:sectionId', TeacherController.listRemarks);

// Attendance
router.post('/attendance', TeacherController.recordAttendance);
router.get('/attendance/:sectionId', TeacherController.getAttendanceHistory);

// Assessments & Marks
router.post('/assessments', TeacherController.createAssessment);
router.get('/assessments/:sectionId', TeacherController.getAssessments);
router.post('/marks', TeacherController.recordMarks);
router.get('/marks/:assessmentId', TeacherController.getMarks);

// Assignments
router.post('/assignments', TeacherController.createAssignment);
router.get('/assignments/:sectionId', TeacherController.getAssignments);
router.get('/assignments/:assignmentId/submissions', TeacherController.getSubmissions);
router.patch('/assignments/submissions/:submissionId/grade', TeacherController.gradeSubmission);

export const teacherRoutes = router;
