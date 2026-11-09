import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DialogsProvider } from './components/common/Dialogs';
import { ImpersonationBanner } from './components/common/ImpersonationBanner';
import { PublicHomePage } from './pages/public/PublicHomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SuperAdminLoginPage } from './pages/auth/SuperAdminLoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';
import { ThemeToggle } from './components/common/ThemeToggle';

// Dashboards and registration pages load only when their route is opened, so the public homepage stays light.
const InstitutionRegistrationPage = lazy(() => import('./pages/public/InstitutionRegistrationPage').then((m) => ({ default: m.InstitutionRegistrationPage })));
const InstitutionRegistrationStatusPage = lazy(() => import('./pages/public/InstitutionRegistrationStatusPage').then((m) => ({ default: m.InstitutionRegistrationStatusPage })));
const Launchpad = lazy(() => import('./pages/Launchpad').then((m) => ({ default: m.Launchpad })));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard').then((m) => ({ default: m.SuperAdminDashboard })));
const SchoolAdminDashboard = lazy(() => import('./pages/SchoolAdminDashboard').then((m) => ({ default: m.SchoolAdminDashboard })));
const PrincipalDashboard = lazy(() => import('./pages/PrincipalDashboard').then((m) => ({ default: m.PrincipalDashboard })));
const HODDashboard = lazy(() => import('./pages/HODDashboard').then((m) => ({ default: m.HODDashboard })));
const ClassTeacherDashboard = lazy(() => import('./pages/ClassTeacherDashboard').then((m) => ({ default: m.ClassTeacherDashboard })));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard').then((m) => ({ default: m.TeacherDashboard })));
const EmbeddedSimulationPage = lazy(() => import('./pages/EmbeddedSimulationPage').then((m) => ({ default: m.EmbeddedSimulationPage })));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then((m) => ({ default: m.StudentDashboard })));

const RouteLoading: React.FC = () => (
  <div role="status" aria-live="polite" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: '#64748b', fontSize: 14 }}>Loading…</div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DialogsProvider>
      <ImpersonationBanner />
      <BrowserRouter>
        <NetworkStatusBanner />
        <ThemeToggle />
        <Suspense fallback={<RouteLoading />}>
        <Routes>
          {/* Public & Authentication Routes */}
          <Route path="/" element={<PublicHomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/super-admin-login" element={<SuperAdminLoginPage />} />
          <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
          <Route path="/register" element={<InstitutionRegistrationPage />} />
          <Route path="/register-school" element={<InstitutionRegistrationPage />} />
          <Route path="/register-institution" element={<InstitutionRegistrationPage />} />
          <Route path="/institution-registration-status" element={<InstitutionRegistrationStatusPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/launchpad" element={<Navigate to="/login" replace />} />
          {/* Bare page the Smart Board embeds to run a platform simulation (any signed-in user) */}
          <Route path="/embed/simulation/:key" element={<ProtectedRoute><EmbeddedSimulationPage /></ProtectedRoute>} />

          {/* Protected Role Dashboards */}
          <Route
            path="/super-admin/*"
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/principal/*"
            element={
              <ProtectedRoute allowedRoles={['PRINCIPAL', 'SUPER_ADMIN']}>
                <PrincipalDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school-admin/*"
            element={
              <ProtectedRoute allowedRoles={['SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'PRINCIPAL']}>
                <SchoolAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/hod/*"
            element={
              <ProtectedRoute allowedRoles={['HOD', 'PRINCIPAL', 'SUPER_ADMIN']}>
                <HODDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/class-teacher/*"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'PRINCIPAL', 'SUPER_ADMIN']}>
                <ClassTeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/*"
            element={
              <ProtectedRoute allowedRoles={['TEACHER']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/*"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
      </DialogsProvider>
    </AuthProvider>
  );
};

export default App;
