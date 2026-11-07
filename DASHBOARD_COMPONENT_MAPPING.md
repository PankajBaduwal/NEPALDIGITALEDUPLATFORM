# Dashboard Component Mapping Guide
## KPRIET UI Design System to Nepal Platform Component Architecture

**Reference Project**: KPRIET Eduverse (`C:\Users\Admin\Desktop\KPRIET\dashboard\frontend`)  
**Destination Project**: Nepal Digital Education Platform (`C:\Users\Admin\Desktop\NEPALEDUPLATFROM\frontend`)

---

## 1. Design Token and Visual Style Mapping

| Token / Visual Element | KPRIET Implementation | Nepal Platform Adaptation |
|---|---|---|
| **Base Background** | `var(--background): #f8fafc` | `#f8fafc` (Slate 50) |
| **Card Surface** | `var(--card): #ffffff`, border `#e2e8f0` | `#ffffff` with `border border-slate-200 shadow-sm rounded-xl` |
| **Primary Brand Green** | `var(--primary): #047857`, hover `#065f46` | `#0F5132` (Nepal Primary Green) / `#047857` |
| **Primary Soft Surface** | `var(--primary-soft): #ecfdf5`, border `#a7f3d0` | `bg-emerald-50 text-emerald-800 border-emerald-200` |
| **Sidebar Background** | High-contrast white `#ffffff` or slate-900 `#0f172a` | Clean white `#ffffff` with slate borders and emerald active accents |
| **Active Nav Link** | `bg-primary/10 text-primary font-semibold border-r-4 border-primary` | `bg-emerald-50 text-emerald-700 font-semibold border-r-4 border-emerald-600` |
| **Inactive Nav Link** | `text-slate-600 hover:bg-slate-100 hover:text-slate-900` | `text-slate-600 hover:bg-slate-100 hover:text-slate-900 rounded-lg` |
| **Stat Card Numbers** | `text-2xl font-bold text-slate-900 tracking-tight` | `text-2xl font-bold text-slate-900 tracking-tight` |
| **Border Radius** | `rounded-xl` (12px) for cards, `rounded-lg` (8px) for inputs/buttons | Exact match: 12px card corners, 8px input/button radius |
| **Elevation / Shadow** | `shadow-sm` on rest, `shadow-md` on hover | `shadow-sm` on rest, `shadow-md transition-shadow` on hover |

---

## 2. Shared Foundation Components

| KPRIET Source Component | Source Path | Nepal Platform Target Component | Status & Mapping Strategy |
|---|---|---|---|
| `DashboardLayout.tsx` | `src/layouts/DashboardLayout.tsx` | `frontend/src/layouts/KprietDashboardLayout.tsx` | Core layout: Sidebar + Header + Notification Center + Active Role Navigation groups. |
| `Card`, `CardHeader`, `CardTitle`, `CardContent` | `src/components/ui/Card.tsx` | `frontend/src/components/ui/Card.tsx` | Reusable card primitives with hoverable options. |
| `StatCard` | `src/components/ui/StatCard.tsx` | `frontend/src/components/ui/StatCard.tsx` | Metric indicator with icon, trend badge, and label. |
| `Button`, `buttonClasses` | `src/components/ui/Button.tsx` | `frontend/src/components/ui/Button.tsx` | Variants: `primary`, `secondary`, `outline`, `ghost`, `danger`. |
| `Badge` | `src/components/ui/Badge.tsx` | `frontend/src/components/ui/Badge.tsx` | Semantic status badges (`success`, `warning`, `error`, `neutral`, `info`). |
| `PageHeader` | `src/components/ui/PageHeader.tsx` | `frontend/src/components/ui/PageHeader.tsx` | Unified eyebrow, title, description, and action button bar. |
| `States` (`LoadingState`, `EmptyState`, `ErrorState`) | `src/components/ui/States.tsx` | `frontend/src/components/ui/States.tsx` | Standardized async data states with retry actions. |
| `ProgressRing` | `src/components/ui/ProgressRing.tsx` | `frontend/src/components/ui/ProgressRing.tsx` | Circular attendance and syllabus completion indicator. |
| `NotificationCenter` | `src/components/notifications/NotificationCenter.tsx` | `frontend/src/components/notifications/NotificationCenter.tsx` | Popover drawer with unread counter, filter tabs, and mark-as-read. |

---

## 3. Workspaces, Modals, and Studios

| KPRIET Component / Modal | Source Path | Nepal Platform Target | Integration Notes |
|---|---|---|---|
| `AssignmentBuilderModal` | `src/pages/assignment/AssignmentBuilderModal.tsx` | `frontend/src/components/assignment/AssignmentBuilderModal.tsx` | Create assignment with title, description, due date, max marks, attachments. |
| `AssignmentGradingModal` | `src/pages/assignment/AssignmentGradingModal.tsx` | `frontend/src/components/assignment/AssignmentGradingModal.tsx` | Teacher submission review, rubric scoring, and feedback entry. |
| `SideBySideComparisonModal` | `src/pages/assignment/SideBySideComparisonModal.tsx` | `frontend/src/components/assignment/SideBySideComparisonModal.tsx` | Comparative submission analysis. |
| `AttendanceManagerModal` | `src/pages/attendance/AttendanceManagerModal.tsx` | `frontend/src/components/attendance/AttendanceManagerModal.tsx` | Fast daily attendance grid (Present, Absent, Late, Excused) with one-click "Mark All Present". |
| `QuizBuilderModal` | `src/pages/quiz/QuizBuilderModal.tsx` | `frontend/src/components/quiz/QuizBuilderModal.tsx` | Online quiz creator with question bank and timer settings. |
| `AiQuizGeneratorModal` | `src/pages/quiz/AiQuizGeneratorModal.tsx` | `frontend/src/components/quiz/AiQuizGeneratorModal.tsx` | AI-assisted quiz question generator from chapter syllabus. |
| `SubjectMarksEntryModal` | `src/components/teacher/SubjectMarksEntryModal.tsx` | `frontend/src/components/teacher/SubjectMarksEntryModal.tsx` | Terminal and continuous assessment marks entry grid with automatic grade point calculation. |
| `ChiefMentorWorkspace` | `src/components/chief-mentor/ChiefMentorWorkspace.tsx` | `frontend/src/components/academic/ClassTeacherSectionPanel.tsx` | Class Teacher console: section roster, terminal report cards, consolidated attendance. |
| `StudentsRequiringAttention` | `src/components/attendance-alerts/StudentsRequiringAttention.tsx` | `frontend/src/components/attendance/StudentsRequiringAttention.tsx` | Attendance warning widget (<75% threshold). |
| `MathematicsWorkspacePage` | `src/pages/math-workspace/MathematicsWorkspacePage.tsx` | `frontend/src/pages/tools/MathematicsWorkspacePage.tsx` | Interactive math canvas with formula typing and graphing. |
| `PdfReaderModal` (Nepal Platform) | `frontend/src/components/PdfReaderModal.tsx` | Retained and linked to subject materials | Official CDC English & Nepali textbooks integration. |
| `SimulationViewerModal` (Nepal Platform) | `frontend/src/components/SimulationViewerModal.tsx` | Retained and linked to simulation cards | Standalone HTML5/JS interactive science & tech labs. |
| `SmartBoardModal` (Nepal Platform) | `frontend/src/components/SmartBoardModal.tsx` | Retained and linked to TopNav & Sidebar | Touch/stylus-friendly interactive smart board. |

---

## 4. Role-Specific Dashboards Architecture

1. **Teacher Dashboard**:
   - Layout: `KprietDashboardLayout` with `TEACHER_NAV`.
   - Content: Profile banner with Staff ID, Status, Official Email; Schedule widgets (Next Class, Today's Timetable); My Classes card grid; Tabbed subject workspaces (Notes, Materials, Videos, Presentations, Quizzes, Assignments, Results, Attendance, Progress); Class Teacher tab when assigned.
2. **HOD Dashboard**:
   - Layout: `KprietDashboardLayout` with `HOD_NAV`.
   - Content: Department KPI summary, Faculty roster with workload indicators, Student enrollment lists, Subject allocations matrix, Department timetable overview, and Academic analytics.
3. **Class Teacher Dashboard**:
   - Dedicated view accessible via `/teacher/class-teacher` or `/class-teacher/dashboard` with class-level overview cards, full student roster, consolidated attendance, terminal report cards, and subject-wise marks oversight.
4. **Principal Dashboard**:
   - Layout: `KprietDashboardLayout` with `PRINCIPAL_NAV`.
   - Content: High-level institutional KPI cards, Classes & Sections directory, Teacher monitoring, Institutional attendance analytics, and Terminal exam result approvals.
5. **Student Dashboard**:
   - Layout: `KprietDashboardLayout` with `STUDENT_NAV`.
   - Content: Enrolled class & section details, Today's schedule, Attendance health ring, Terminal marks & report cards, Homework submissions, Quizzes, CDC textbook chapters, and simulation launchers.
6. **School Admin Dashboard**:
   - Unified under the KPRIET design language with `ADMIN_NAV`, housing Institution configuration, Teacher & Student management, Timetable engine, and Feature access.
7. **Super Admin Dashboard**:
   - Unified under the KPRIET design language with `PLATFORM_NAV`, housing Institution approvals, EMIS registrations, Subscription plans, and Central CDC curriculum library.

