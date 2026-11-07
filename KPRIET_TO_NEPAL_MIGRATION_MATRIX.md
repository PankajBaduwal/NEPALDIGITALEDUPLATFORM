# KPRIET to Nepal Platform Migration Matrix
## Complete Functional and Data Mapping Architecture

**Source Blueprint**: KPRIET Eduverse (`C:\Users\Admin\Desktop\KPRIET`)  
**Destination Platform**: Nepal Digital Education Platform (`C:\Users\Admin\Desktop\NEPALEDUPLATFROM`)

---

## 1. Role and Navigation Migration Matrix

| KPRIET Role & View | Nepal Platform Destination | Route in Nepal Platform | Primary Functional Scope & Adaptations |
|---|---|---|---|
| **Faculty Dashboard** (`TeacherDashboardPage.tsx`) | **Teacher Dashboard** | `/teacher/dashboard` | Assigned classes & subjects, today's schedule, weekly timetable, workload gauge, subject workspaces (Notes, Materials, Videos, Presentations, Quizzes, Assignments, Results, Attendance, Progress), Smart Board & CDC textbook launcher. |
| **Faculty Chief Mentor Workspace** | **Class Teacher Dashboard** | `/teacher/class-teacher` or `/class-teacher/dashboard` | Roster of assigned section, consolidated attendance, terminal exam report cards (1st, 2nd, Final), subject-wise marks overview (read-only for non-taught subjects), student academic tracking. |
| **HOD Dashboard** (`HODDashboardPage.tsx`) | **HOD Dashboard** | `/hod/dashboard` | Department overview, faculty monitoring, subject allocations, department timetable, student academic analytics, department announcements, department audit. Enabled for secondary/college streams. |
| **Principal Dashboard** (`PrincipalDashboardPage.tsx`) | **Principal Dashboard** | `/principal` | Read-only institutional oversight: all classes, sections, teachers, attendance analytics, terminal exam results approval, institutional notices. |
| **College Admin Page** (`CollegeAdminPage.tsx`) | **School Admin Dashboard** | `/school-admin/*` | Converted to KPRIET design language: manages teachers, students, class sections, subject allocations, timetable engine, feature permissions, and bulk Excel import. |
| **Platform Page** (`PlatformPage.tsx`) | **Super Admin Dashboard** | `/super-admin/*` | Converted to KPRIET design language: platform overview, school/college registration applications, approval & provisioning, subscription tiers, central curriculum library, simulation assets. |
| **Student Dashboard** (`StudentDashboardPage.tsx`) | **Student Dashboard** | `/student/dashboard` | Student overview, enrolled class & section subjects, weekly timetable, personal attendance, terminal marks & results, CDC textbook reader, simulation lab, homework & quizzes. |

---

## 2. Academic Model and Data Field Mapping

| KPRIET Model (College CBCS) | Nepal Platform Model (School & College) | Mapping Details & Field Conversions |
|---|---|---|
| `Institution` (`code`, `name`, `type: 'COLLEGE'`) | `Institution` (`emisCode`, `name`, `institutionKind: 'SCHOOL' \| 'COLLEGE'`) | Unique EMIS code or college code; multi-tenant isolation via `institutionId`. |
| `Department` / `Programme` | `Stream` / `Department` / `Level` | e.g., General Basic (1-8), Secondary (9-10), Higher Secondary (11-12: Science, Management, Humanities, Education). |
| `Semester` (e.g., Sem 1 - 8) | `Class` (Grade 1 - 12) | Maps semester numeric sequence to Grade/Class while supporting collegiate semesters where applicable. |
| `Section` (`name`, `capacity`) | `Section` (`name`, `medium`, `classTeacherId`, `capacity`) | Supports English & Nepali mediums with assigned Class Teacher per academic year. |
| `Subject` (`code`, `name`, `credits`, `syllabusUnits`) | `CentralSubject` + `SectionSubject` | References Nepal CDC curriculum code, credit hours, English/Nepali medium, syllabus chapters. |
| `TeacherAssignment` (`facultyId`, `subjectId`) | `SubjectAllocation` (`teacherId`, `centralSubjectId`, `sectionId`) | Direct mapping of teacher to class section and central subject. |
| `TimetableSlot` (`day`, `period`, `room`) | `TimetableSlot` (`dayOfWeek`, `periodNumber`, `startTime`, `endTime`, `roomNumber`) | Nepali school week (Sunday-Friday or Monday-Saturday) timetable engine. |
| `StudentEnrollment` (`regNo`, `rollNo`) | `StudentEnrollment` (`admissionNumber`, `rollNumber`, `guardianName`) | Student class-section enrollment record. |
| `Attendance` / `AttendanceAlert` | `Attendance` / `AttendanceRecord` | Subject-level and section-level daily attendance tracking. |
| `Assignment` & `AssignmentSubmission` | `Assessment` (`type: 'ASSIGNMENT'`) | Due dates, grading rubrics, student file uploads and grading status. |
| `Quiz` & `QuizAttempt` | `Quiz` (`questions`, `timeLimitMinutes`) | Centralized question bank, multiple choice, auto-grading, student score recording. |
| `AcademicMaterial` (Notes, Videos, Slides) | `AcademicMaterial` | Digital curriculum resources associated with subject chapters. |

---

## 3. Sidebar & Navigation Blueprint

### A. Teacher (Faculty) Navigation
- **Academic**:
  - Overview (`tab=overview`)
  - My Classes & Subjects (`tab=mySubjects`)
  - Attendance Manager (`tab=attendance`)
  - Marks & Results (`tab=results`)
- **Timetable**:
  - Today's Schedule (`/my-timetable?view=today`)
  - Weekly Timetable (`/my-timetable?view=week`)
  - My Workload (`/my-timetable?view=workload`)
- **Teaching Studio**:
  - Notes (`tab=notes`)
  - CDC Materials & Textbooks (`tab=materials`)
  - Video Lectures (`tab=videos`)
  - Presentations (`tab=presentations`)
  - Quiz Studio (`tab=quizzes`)
  - Assignment Studio (`tab=assignments`)
- **Insights & Mentoring**:
  - Academic Monitoring (`tab=academicMonitoring`)
  - Student Progress (`tab=studentProgress`)
  - Class Teacher Console (`tab=chiefMentor`)
- **Tools**:
  - Interactive Smart Board (`/smartboard/index.html`)
  - Simulation Lab (`/simulations`)
  - Mathematics Workspace (`/math-workspace`)
- **Communication**:
  - Announcements (`tab=announcements`)

### B. Student Navigation
- **Academic**:
  - Dashboard Overview (`tab=overview`)
  - My Timetable (`/my-timetable`)
  - Attendance Status (`tab=attendance`)
  - Terminal Results & Report Cards (`tab=results`)
  - Homework & Assignments (`tab=assignments`)
  - Online Quizzes (`tab=quizzes`)
- **Learning Hub**:
  - Notes (`tab=notes`)
  - CDC Textbooks & Chapters (`tab=materials`)
  - Video Lessons (`tab=videos`)
  - Presentations (`tab=presentations`)
- **Insights & Growth**:
  - Academic Health & Alerts (`tab=progress`)
  - Academic AI Assistant (`tab=aiDoubt`)
- **Interactive Tools**:
  - Launch Smart Board (`/smartboard/index.html`)
  - Simulation Player (`/simulations`)
  - Mathematics Workspace (`/math-workspace`)
- **Communication**:
  - School Notices (`tab=notices`)

### C. Principal Navigation
- **Overview**: Principal Dashboard KPI Summary (`/principal`)
- **Academic Oversight**:
  - Institutional Analytics (`/principal?tab=analytics`)
  - Classes & Sections Directory (`/principal?tab=sections`)
  - Teachers & Workload Review (`/principal?tab=teachers`)
  - Consolidated Attendance Oversight (`/principal?tab=attendance`)
  - Terminal Exam Results & Grade Approvals (`/principal?tab=approvals`)
  - Academic Early Warning / Risk Monitoring (`/principal?tab=monitoring`)
- **Administration & Timetables**:
  - Institution Timetable Matrix (`/timetable`)
  - Institutional Announcements (`/principal?tab=announcements`)

---

## 4. Security, Isolation, and Tenant Invariants

1. **Strict Multi-Tenancy**:
   - Every read and write query in institution dashboards must enforce `institutionId: req.user.institutionId`.
   - No user can access or view students, teachers, or marks of another institution.

2. **Role Boundaries**:
   - Teachers can only grade and enter marks for subjects and sections they are assigned to.
   - Class Teachers can view all subject marks for their assigned section, but cannot edit marks belonging to other subject teachers unless specifically authorized.
   - Principals hold read-only oversight across all classes and approval authority for published results.
   - Super Admins manage platform registration and curriculum templates, with optional tenant-delegated read access.

