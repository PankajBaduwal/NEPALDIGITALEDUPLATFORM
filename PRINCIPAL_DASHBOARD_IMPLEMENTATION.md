# Principal Dashboard Implementation

## Overview
The Principal Dashboard serves as the academic and institutional supervisory authority for the Nepal Education Platform. Designed with a clean, light-theme aesthetic matching the faculty workspace, it provides institutional leaders with complete oversight over curriculum execution, faculty performance, student progress, assessments, examinations, and institutional compliance.

---

## 1. Header & Navigation Structure
- **Institution Header**:
  - School Crest / Logo and Name (*Dhambojhi Higher Secondary School*).
  - Official EMIS code badge (*570010001*).
  - Designation (*Principal / Academic Head*).
  - Academic year (*2083 BS*).
  - Quick action: **Launch Smart Board**.
  - Refresh button with live sync status.
  - Principal profile and secure Sign Out.

- **Navigation Groups**:
  - **Overview & Leadership**:
    - `OVERVIEW`: Institutional Profile card, 8 real-time KPI metric cards, letter grade distribution chart (CDC 8-point scale), daily attendance trend chart, academic alerts, and grade-by-grade summary.
    - `INSTITUTION_PROFILE`: Affiliation, EMIS sync, contacts, leadership.
    - `ACADEMIC_CALENDAR`: School calendar, examination windows, vacations.
  - **Academic Supervision**:
    - `ACADEMIC_PERFORMANCE`: Comprehensive GPA analysis across grades 1–12, pass percentages.
    - `CURRICULUM_COVERAGE`: CDC curriculum pacing, units/chapters completed vs planned, bilingual (English/Nepali) medium tracking.
    - `CLASS_PERFORMANCE`: Class & section comparison table with average marks, GPAs, attendance, and student count.
    - `SUBJECT_PERFORMANCE`: Theory vs practical balance, highest/lowest performing subjects.
    - `TIMETABLE_OVERVIEW`: Master timetable view with conflict detection.
  - **Faculty & Workload**:
    - `TEACHERS`: All faculty with staff ID, subjects, classes, student counts, weekly periods, workload badge (`NORMAL`, `HEAVY`), evaluation progress.
    - `TEACHER_WORKLOAD`: Period allocation per teacher, conflict check, overloaded faculty detection (>24 periods/week).
  - **Student Monitoring**:
    - `STUDENTS`: Filterable student roster with class, section, medium, attendance, marks.
    - `AT_RISK_STUDENTS`: Evidence-based at-risk detector (GPA < 2.0, failing subjects, attendance < 75%) with risk level, reasons, and intervention logging.
    - `STUDENT_ATTENDANCE`: Student attendance logs, trends, absence patterns.
  - **Assessments & Studios**:
    - `ASSIGNMENTS_OVERVIEW`: Complete institutional assignment oversight: total assignments, active, draft, submissions, pending evaluations, late submissions, copy detection similarity flags, question inspection, rubric score inspection.
    - `QUIZ_OVERVIEW`: Institutional quiz oversight: total quizzes, published, active, student attempts, pass percentage, proctoring security configuration (fullscreen, tab-switch, warnings logged), question inspector.
    - `EXAM_RESULTS`: Terminal exam results, marks entry status across subjects.
    - `EVALUATION_PROGRESS`: Teacher evaluation progress tracker (graded vs pending submissions).
  - **Governance & Reports**:
    - `APPROVALS`: Terminal examination result publication approval (`SUBMITTED` $\rightarrow$ `APPROVED` $\rightarrow$ `PUBLISHED`), Timetable approvals.
    - `REPORTS`: Institutional reports with CSV export (Students, Teachers, Assignments, Quizzes, Attendance, Curriculum).
    - `ANNOUNCEMENTS`: Official circulars creator and broadcast viewer.

---

## 2. Real-Time Data Integration
The Principal Dashboard integrates with the following backend services:
- `GET /api/v1/analytics/principal`: Aggregates core KPIs, letter grade distribution, daily attendance, class performance, syllabus pace, teacher workloads, at-risk students, and academic alerts.
- `GET /api/v1/assignments/institution`: Provides institutional assignment oversight, submission stats, pending evaluations count, and copy detection flags.
- `GET /api/v1/quizzes/institution`: Provides institutional quiz oversight, attempt counts, pass rates, and proctoring security configurations.
- `GET /api/v1/assessment/principal/dashboard`: Tracks pending terminal exam approvals.
- `POST /api/v1/assessment/examinations/:id/publish`: Seals and publishes terminal examination results.

