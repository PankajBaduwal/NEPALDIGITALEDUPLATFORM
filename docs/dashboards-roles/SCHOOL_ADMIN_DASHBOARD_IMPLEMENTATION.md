# School Admin Dashboard Implementation

## Overview
The School Admin Dashboard represents the highest operational management authority within the institution on the Nepal Education Platform. It enables school administrators to manage teacher accounts, student enrollments, timetable builders, CDC curriculum configuration, examinations, digital textbook access, billing, and feature access toggles.

---

## 1. Upgraded Sections & Navigation
- **Header**:
  - School Crest / Logo and Name (*Dhambojhi Higher Secondary School*).
  - Admin designation (*School Admin*).
  - Academic year (*2083 BS*).
  - Direct Smart Board launcher button.
  - Notification count and profile menu.

- **Sidebar Navigation Groups**:
  - **Overview**:
    - `OVERVIEW`: Real-time operational statistics (students, teachers, classes, sections, active subjects, timetables, active assignments, active quizzes, overall attendance), quick actions, and operational alerts.
  - **Institution Setup**:
    - `INSTITUTION_SETUP`: Institutional information (EMIS code, province, district, municipality), medium configuration (English and Nepali medium toggles), academic year calendar (2083 BS), and school holiday windows.
  - **User Management**:
    - `TEACHERS`: Full faculty directory with Staff ID, subjects taught, assigned classes, weekly teaching periods, status, and account creation modal.
    - `STUDENTS`: Enrolled student registry, search bar, section assignment, roll numbers, admission numbers, promotion, and individual admission modal.
    - `Bulk Imports`: `BulkTeacherImportModal` and `BulkStudentImportModal` supporting CSV and XLSX templates with validation, duplicate detection, and batch processing.
  - **Academic Configuration**:
    - `ALLOCATION`: Academic curriculum & subjects management via `AcademicCurriculumPanel`. Enables subject offerings from the national CDC library and teacher-subject-section allocations.
    - `Bulk Subject Allocation`: `BulkSubjectAllocationModal` for bulk assignment of subjects to faculty.
  - **Timetable**:
    - `TIMETABLE`: Interactive timetable management via `TimetableManagementPanel`. Supports versioned builder, period configurations, clash/conflict validation (teacher, room, class), and timetable publishing.
  - **Assessment Management**:
    - `ASSIGNMENTS_ADMIN`: Institutional assignment oversight with status filters, submission counts, pending evaluation counters, copy detection flags, and modal inspection.
    - `QUIZ_ADMIN`: Institutional quiz oversight with proctoring flags, attempts, pass rates, and question inspection.
    - `EXAMINATIONS`: Terminal examination configuration, exam dates, marks workflow (`DRAFT`, `SUBMITTED`, `REVIEWED`, `APPROVED`, `PUBLISHED`), and audit logs.
  - **Learning Resources**:
    - `RESOURCES`: Official CDC Digital Textbooks (Classes 1–12) with grade and medium filters, chapter counts, page counts, and integrated `PdfReaderModal` powered by PDF.js.
  - **Institutional Settings**:
    - `FEATURE_ACCESS`: School-wide and class-wise feature configuration matrix, device access profiles, and audit history.
    - `SUBSCRIPTION`: Entitlements, package tier, invoice history, and integrated digital payment gateways (Khalti, eSewa, Bank Transfer).
    - `ANNOUNCEMENTS`: Institutional circulars and bulletins broadcaster.
    - `ANALYTICS`: Academic analytics, syllabus completion rates, and grade distribution.

---

## 2. Shared Source of Truth
The School Admin Dashboard shares verified backend models and APIs with the Principal Dashboard and Teacher Dashboard:
- `Institution`, `User`, `Class`, `Section`, `CentralSubject`, `SubjectAllocation`, `TimetableEntry`, `AttendanceRecord`, `Examination`, `ExamAssessment`, `StudentMark`, `Assignment`, `AssignmentSubmission`, `Quiz`, and `QuizAttempt`.

