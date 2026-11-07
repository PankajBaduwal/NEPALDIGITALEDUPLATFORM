import { Router } from 'express';
import { SmartBoardController } from './smartboard.controller';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';

const teacherOnly = authorize('TEACHER', 'SUPER_ADMIN');

const router = Router();

// ── Classroom Sessions ────────────────────────────────────────
router.post('/sessions', authMiddleware, tenantMiddleware, teacherOnly, SmartBoardController.startSession);
router.put('/sessions/:id', authMiddleware, tenantMiddleware, teacherOnly, SmartBoardController.updateSession);
router.post('/sessions/:id/end', authMiddleware, tenantMiddleware, teacherOnly, SmartBoardController.endSession);
router.get('/sessions/active', authMiddleware, tenantMiddleware, SmartBoardController.getActiveSession);
router.get('/sessions/history', authMiddleware, tenantMiddleware, SmartBoardController.listSessions);

// ── Annotation Sessions ───────────────────────────────────────
router.post('/annotations', authMiddleware, tenantMiddleware, teacherOnly, SmartBoardController.saveAnnotation);
router.get('/annotations', authMiddleware, tenantMiddleware, SmartBoardController.listAnnotations);
router.get('/annotations/:id', authMiddleware, tenantMiddleware, SmartBoardController.getAnnotation);
router.delete('/annotations/:id', authMiddleware, tenantMiddleware, teacherOnly, SmartBoardController.deleteAnnotation);

// ── Activities & Simulations ──────────────────────────────────
router.get('/activities', authMiddleware, SmartBoardController.listActivities);
router.get('/simulations', authMiddleware, SmartBoardController.listSimulations);

// Legacy routes kept for backward compatibility with existing Smart Board scripts
router.post('/share-notes', authMiddleware, tenantMiddleware, teacherOnly, SmartBoardController.shareNotes);

export const smartboardRoutes = router;

// ── Academic Context & Simulations Legacy Sub-Routers ─────────
const academicRouter = Router();
academicRouter.get('/subjects/:id/smartboard-context', authMiddleware, SmartBoardController.getContext);
academicRouter.post('/smartboard/share-notes', authMiddleware, teacherOnly, SmartBoardController.shareNotes);
export const smartboardAcademicRoutes = academicRouter;

const simRouter = Router();
simRouter.get('/entitlements', authMiddleware, SmartBoardController.getSimulationEntitlements);
simRouter.get('/:id/access', authMiddleware, SmartBoardController.checkSimulationAccess);
export const simulationRoutes = simRouter;
