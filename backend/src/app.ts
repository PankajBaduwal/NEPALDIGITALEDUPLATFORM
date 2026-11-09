import express from 'express';
import cors from 'cors';
import path from 'path';
import { ENV } from './config/env';
import { authRoutes } from './modules/auth/auth.routes';
import { institutionRoutes } from './modules/institutions/institutions.routes';
import { subscriptionRoutes } from './modules/subscriptions/subscriptions.routes';
import { curriculumRoutes } from './modules/curriculum/curriculum.routes';
import { academicRoutes } from './modules/academic/academic.routes';
import { smartboardRoutes, smartboardAcademicRoutes, simulationRoutes } from './modules/smartboard/smartboard.routes';
import { simulationActivityRoutes } from './modules/simulation-activity/simulation-activity.routes';
import { aiRoutes } from './modules/ai/ai.routes';
import { assessmentRoutes } from './modules/assessment/assessment.routes';
import { timetableRoutes } from './modules/timetable/timetable.routes';
import { academicPlanningRoutes } from './modules/academic-planning/academic-planning.routes';
import { analyticsRouter } from './modules/analytics/analytics.routes';
import { featureAccessRoutes } from './modules/feature-access/feature-access.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { schoolAdminRoutes } from './modules/school-admin/school-admin.routes';
import { teacherRoutes } from './modules/teacher/teacher.routes';
import { classTeacherRoutes } from './modules/class-teacher/class-teacher.routes';
import { principalToolsRoutes } from './modules/principal-tools/principal-tools.routes';
import { publicRoutes } from './modules/public/public.routes';
import { studentRoutes } from './modules/student/student.routes';
import { quizRoutes } from './modules/quiz/quiz.routes';
import { virtualLabRoutes } from './modules/virtual-lab/virtual-lab.routes';
import { simulationLaunchRoutes, simulationPlayRedirect } from './modules/simulation-activity/simulation-launch.routes';
import { assignmentRoutes } from './modules/assignment/assignment.routes';
import { academicMaterialRoutes } from './modules/academic-materials/material.routes';
import { notificationRoutes } from './modules/notifications/notification.routes';
import { calendarRoutes } from './modules/calendar/calendar.routes';
import { errorHandler } from './common/middleware/error.middleware';

export function createApp() {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // The simulation pages now live in /smartboard/simulations/. Old links (database entries, bookmarks) still work:
  // /smartboard/<name>-simulation.html  →  /smartboard/simulations/<name>-simulation.html  (query string kept)
  app.get(/^\/smartboard\/([a-z0-9]+-simulation\.html)$/i, (req, res) => {
    const q = req.url.indexOf('?');
    res.redirect(302, `/smartboard/simulations/${req.params[0]}${q >= 0 ? req.url.slice(q) : ''}`);
  });

  // Serve existing Smart Board as static files with correct base path
  app.use('/smartboard', express.static(ENV.SMARTBOARD_PATH));

  // Serve Interactive Curriculum Simulations
  const simulationsPath = path.resolve(__dirname, '../../simulations');
  // Page the Smart Board embeds for a ported simulation: /simulations/<id>/play  → simulation host page
  app.get('/simulations/:id/play', simulationPlayRedirect);
  app.use('/simulations', express.static(simulationsPath));

  // Serve Uploads Directory (Textbooks, Materials, Assignment Submissions)
  const uploadsPath = path.resolve(process.cwd(), 'uploads');
  const publicUploads = express.static(uploadsPath);
  app.use('/uploads', (req, res, next) => {
    let uploadPath: string;
    try {
      uploadPath = decodeURIComponent(req.path).replace(/\\/g, '/').toLowerCase();
    } catch {
      res.status(400).end();
      return;
    }

    if (
      uploadPath === '/materials' ||
      uploadPath.startsWith('/materials/') ||
      uploadPath === '/assignments' ||
      uploadPath.startsWith('/assignments/')
    ) {
      res.status(404).end();
      return;
    }
    publicUploads(req, res, next);
  });

  // Serve React Production Build from frontend/dist
  const reactDistPath = path.resolve(__dirname, '../../frontend/dist');
  app.use(express.static(reactDistPath));

  // The old standalone /admin and /school static consoles were removed: the React app (/super-admin, /school-admin)
  // replaces them and they duplicated features without the newer permission checks.

  // Health check
  app.get(['/health', '/api/health', '/api/v1/health'], (req, res) => {
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      ecosystem: 'Nepal Digital Education Platform',
    });
  });

  // Mount API v1 Routes
  const v1 = express.Router();
  v1.use('/auth', authRoutes);
  v1.use('/admin', adminRoutes);
  v1.use('/school-admin', schoolAdminRoutes);
  v1.use('/school', schoolAdminRoutes);
  v1.use('/teacher', teacherRoutes);
  v1.use('/class-teacher', classTeacherRoutes);
  v1.use('/principal-tools', principalToolsRoutes);
  v1.use('/public', publicRoutes);
  v1.use('/student', studentRoutes);
  v1.use('/institutions', institutionRoutes);
  v1.use('/subscriptions', subscriptionRoutes);
  v1.use('/curriculum', curriculumRoutes);
  v1.use('/academic', academicRoutes);
  v1.use('/academic', smartboardAcademicRoutes);
  v1.use('/smartboard', smartboardRoutes);
  v1.use('/simulations', simulationRoutes);
  v1.use('/simulation-activity', simulationActivityRoutes);
  v1.use('/simulations', simulationLaunchRoutes);
  v1.use('/ai', aiRoutes);
  v1.use('/assessment', assessmentRoutes);
  v1.use('/timetable', timetableRoutes);
  v1.use('/academic-planning', academicPlanningRoutes);
  v1.use('/analytics', analyticsRouter);
  v1.use('/feature-access', featureAccessRoutes);
  v1.use('/quizzes', quizRoutes);
  v1.use('/virtual-labs', virtualLabRoutes);
  v1.use('/assignments', assignmentRoutes);
  v1.use('/academic-materials', academicMaterialRoutes);
  v1.use('/notifications', notificationRoutes);
  v1.use('/calendar', calendarRoutes);

  app.use('/api/v1', v1);
  // Fallback for Smart Board client compatibility
  app.use('/api', v1);

  // Global Error Handler
  app.use(errorHandler);

  // React SPA routing fallback for unmatched client routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/smartboard')) {
      return next();
    }
    const indexHtml = path.resolve(reactDistPath, 'index.html');
    res.sendFile(indexHtml);
  });

  return app;
}
