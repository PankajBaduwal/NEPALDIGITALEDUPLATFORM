import { Router } from 'express';
import { TeacherAssistantController } from './teacher-assistant.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { rateLimit } from '../../common/middleware/rate-limit.middleware';

const router = Router();

// Strict Teacher-Only authorization guard
const teacherOnly = authorize(
  'TEACHER',
  'PRINCIPAL',
  'SCHOOL_ADMIN',
  'COLLEGE_ADMIN',
  'HOD',
  'SUPER_ADMIN'
);

// Teacher-Only AI Assistant Endpoints
router.post(
  '/ask',
  authMiddleware,
  teacherOnly,
  rateLimit('teacher-ai-ask', 30, 60_000),
  TeacherAssistantController.ask
);

router.get(
  '/conversations',
  authMiddleware,
  teacherOnly,
  TeacherAssistantController.listConversations
);

router.get(
  '/conversations/:id',
  authMiddleware,
  teacherOnly,
  TeacherAssistantController.getConversation
);

router.delete(
  '/conversations/:id',
  authMiddleware,
  teacherOnly,
  TeacherAssistantController.archiveConversation
);

router.post(
  '/smartboard-export',
  authMiddleware,
  teacherOnly,
  TeacherAssistantController.exportSmartBoard
);

export const teacherAssistantRoutes = router;
