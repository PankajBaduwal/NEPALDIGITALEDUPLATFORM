# KPRIET Dashboard Discovery Report
## Complete Source-to-Destination Architectural Analysis

**Inspection Timestamp**: November 3, 2026  
**Destination Project**: Nepal Digital Education Platform (`C:\Users\Admin\Desktop\NEPALEDUPLATFROM`)  
**Reference Source Project**: KPRIET Eduverse Platform (`C:\Users\Admin\Desktop\KPRIET`)  
**Source Access Mode**: **STRICTLY READ-ONLY (No changes made to Project A)**

---

## 1. Project Root Identifications

| Attribute | Project A (Master Blueprint / Reference) | Project B (Destination Implementation) |
|---|---|---|
| **Project Name** | KPRIET Eduverse Academic Platform & Smart Board Lab | Nepal Digital Education Platform |
| **Absolute Root Path** | `C:\Users\Admin\Desktop\KPRIET` | `C:\Users\Admin\Desktop\NEPALEDUPLATFROM` |
| **Dashboard Path** | `C:\Users\Admin\Desktop\KPRIET\dashboard` | `C:\Users\Admin\Desktop\NEPALEDUPLATFROM` |
| **Frontend Root** | `C:\Users\Admin\Desktop\KPRIET\dashboard\frontend` | `C:\Users\Admin\Desktop\NEPALEDUPLATFROM\frontend` |
| **Backend Root** | `C:\Users\Admin\Desktop\KPRIET\dashboard\backend` | `C:\Users\Admin\Desktop\NEPALEDUPLATFROM\backend` |
| **Smart Board Path** | `C:\Users\Admin\Desktop\KPRIET\smart-board-my-version` | `C:\Users\Admin\Desktop\NEPALEDUPLATFROM\smartboard` |
| **Simulations Path** | `C:\Users\Admin\Desktop\KPRIET\smart-board-my-version\src\tools` | `C:\Users\Admin\Desktop\NEPALEDUPLATFROM\simulations` |
| **Curriculum Data** | CBCS Engineering Regulation R2021 & R2025 | Nepal National CDC Curriculum (Class 1-12, English & Nepali) |
| **Access Permission** | **READ ONLY** | **READ AND WRITE** |

---

## 2. Frontend Structure Comparison

### A. KPRIET Frontend
- **Framework & Build**: React 19.3.0, TypeScript 7.0.2, Vite 8.3.0, Tailwind CSS v4.3.3 (`@tailwindcss/vite`).
- **State & Data Fetching**: TanStack React Query v5.103.2, React Hook Form v7.88.0 + Zod v3.25.76.
- **Routing**: React Router (`react-router` v8.4.0) with centralized paths in `src/router/paths.ts` and route definitions in `src/router/index.tsx`.
- **Layout Architecture**: Centralized `DashboardLayout.tsx` (811 lines) providing:
  - Collapsible responsive sidebar (w-64 expanded, w-18 collapsed).
  - Role-specific categorized navigation groups (`STUDENT_NAV`, `TEACHER_NAV`, `HOD_NAV`, `PRINCIPAL_NAV`, `ADMIN_NAV`, `PLATFORM_NAV`).
  - Unified Top Navigation Bar (institution indicator, global search hint, notification bell popover with unread counter, theme toggle, and user avatar dropdown).
- **Core Dashboard Pages**:
  - `TeacherDashboardPage.tsx` (6,004 lines): Faculty profile header, Next class, Today's schedule, My Classes, Weekly timetable, My Workload, Assigned courses, Student counts, Pending submissions, Attendance summary, Subject workspaces, Notes, Materials, Videos, Presentations, Quiz Studio, Assignment Studio, Marks and Results, Academic Monitoring, Smart Board, Simulations.
  - `HODDashboardPage.tsx` (3,061 lines): Department overview, Faculty management, Student management, Enrollment requests, Subject allocation, Department timetable, Workload, Academic monitoring, Analytics, Announcements, Audit.
  - `StudentDashboardPage.tsx` (2,721 lines): Overview, Enrolled subjects, Timetable, Attendance, Results, Assignments, Quizzes, Notes, Materials, Videos, Presentations, Progress ring, AI Doubt solver, Smart Board launch.
  - `PrincipalDashboardPage.tsx` (91 lines) + `CollegeAdminPage.tsx` (949 lines): High-level institutional KPI cards, department matrices, academic years, sections, approval center, bulk import.
  - `AdminDashboardPage.tsx` (120 KB): College Admin institution controls, departments, structure, faculty, timetable center.
  - `PlatformPage.tsx` (14 KB): Super Admin multi-institution management, approvals, billing.

### B. Nepal Digital Education Platform Frontend
- **Framework & Build**: React 19.3.1, TypeScript 7.0.2, Vite 8.3.5, CSS Variables + Tailwind tokens, Lucide icons.
- **Routing**: `react-router-dom` v7.18.5 (`App.tsx` defining `/teacher/*`, `/principal/*`, `/school-admin/*`, `/super-admin/*`, `/student/*`).
- **Existing Strengths to Preserve**:
  - `PdfReaderModal.tsx` utilizing `pdfjs-dist` with dual English & Nepali CDC textbooks.
  - `SimulationViewerModal.tsx` & `SmartBoardModal.tsx` running standalone canvas simulation engines.
  - Institution registration & status tracking workflow (`/register`, `/institution-registration-status`).
  - School Admin management panels (Class Teacher assignments, subject allocations, student import, timetable generation).

---

## 3. Backend Structure Comparison

### A. KPRIET Backend
- **Engine**: Express.js + TypeScript, MongoDB with Mongoose.
- **Authentication**: JWT token in HTTP-only cookies / Authorization Bearer headers.
- **Role Hierarchy**: `SUPER_ADMIN`, `ADMIN`, `PRINCIPAL`, `HOD`, `TEACHER`, `STUDENT`.
- **Services & Controllers**:
  - `academic.routes.ts`: Departments, semesters, subjects, enrollments, teacher assignments.
  - `timetable.routes.ts`: Timetable generation, slot assignment, conflict resolution, room allocations.
  - `assignment.routes.ts` & `quiz.routes.ts`: Assignment creation, rubrics, submissions, automated quiz grading.
  - `tracking.routes.ts`: Attendance tracking, student risk monitoring, progress calculations.
  - `academic-risk.routes.ts` & `attendance-alert.routes.ts`: Intelligent early warning system.
  - `college.routes.ts` & `institution.routes.ts`: Multi-college tenant isolation and principal read-only oversight.

### B. Nepal Digital Education Platform Backend
- **Engine**: Express.js + TypeScript, MongoDB with Mongoose.
- **Authentication**: JWT tokens, bcrypt password hashing, `requireAuth`, `requireRole`, `tenantFilter`.
- **Dual Academic Model Support**:
  - **School Hierarchy**: Institution -> AcademicYear -> Class (Grades 1-12) -> Section -> CentralSubject -> SubjectAllocation -> TimetableSlot -> StudentEnrollment.
  - **College/Higher Secondary Structure**: Institution -> AcademicYear -> Department / Stream (Science, Management, Humanities) -> Semester / Class -> Section -> SubjectAllocation.
- **Existing Backend Modules**:
  - `academic`, `academic-materials`, `academic-planning`, `admin`, `ai`, `analytics`, `assessment`, `assignment`, `auth`, `class-teacher`, `curriculum`, `feature-access`, `institutions`, `notifications`, `quiz`, `school-admin`, `simulation-activity`, `smartboard`, `student`, `subscriptions`, `teacher`, `timetable`.
  - Comprehensive seed data: Dhambojhi Higher Secondary School (Banke, Lumbini Province) with active Principal, School Admin, Class Teachers, Subject Teachers, and Students.

---

## 4. Key Discovery Findings & Migration Strategy

1. **Design System Cloning**:
   The KPRIET visual identity is driven by:
   - Base background: `#f8fafc` (slate-50) and elevated surface cards `#ffffff` with subtle borders (`#e2e8f0` / `#cbd5e1`).
   - Primary Brand: Deep Forest Emerald (`#047857` / `#0F5132`), which harmoniously matches Nepal Platform's official primary brand.
   - Sidebar: Clean categorized navigation grouped by intent (Academic, Teaching, Timetable, Insights, Tools/Smart Board, Communication).
   - Component typography: Crisp Inter/Plus Jakarta Sans headers, high-contrast badges, micro-metric cards, and unified data tables.

2. **Dashboard Role Mapping**:
   - **Faculty Dashboard -> Teacher Dashboard**: Full 1:1 migration of the rich KPRIET faculty layout, schedule widgets, subject workspace tabs (Notes, Materials, Videos, Presentations, Quizzes, Assignments, Results, Attendance, Progress), connected to Nepal Platform's allocations.
   - **HOD Dashboard -> HOD Dashboard**: Cloned for departments/streams with department-scoped filtering, faculty workload monitoring, and curriculum management.
   - **Class Teacher Dashboard**: Dedicated experience inheriting Teacher features while surfacing class roster, terminal report cards, consolidated attendance, and all-subject marks oversight.
   - **Principal Dashboard**: Visual clone of KPRIET Principal / College Admin overview, adapted for institution-wide monitoring of classes, teachers, and student progress.
   - **Student Dashboard**: 1:1 clone of KPRIET Student dashboard, connected to enrolled grade/section, attendance, marks, CDC textbooks, and interactive labs.
   - **School Admin & Super Admin**: Upgraded to the KPRIET design language while strictly preserving all existing administrative, subscription, and provisioning workflows.

3. **Protection Verification**:
   - Zero modifications to `C:\Users\Admin\Desktop\KPRIET`.
   - All adaptations, layout components, and route integrations will be executed strictly within `C:\Users\Admin\Desktop\NEPALEDUPLATFROM`.

