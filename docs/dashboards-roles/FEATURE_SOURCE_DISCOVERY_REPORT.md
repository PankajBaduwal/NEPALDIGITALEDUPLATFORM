# Multi-Project Feature Discovery & Inspection Report

**Generated:** 2026-11-02  
**Platform:** Nepal Education Platform (Destination)  
**Source A:** `piyushdhara latest` (Read-Only)  
**Source B:** `KPRIET` (Read-Only)  

---

## 1. Project Identification

| Attribute | Project A: Piyushdhara Latest (Source) | Project B: KPRIET (Source) | Project C: Nepal Education Platform (Destination) |
|---|---|---|---|
| **Role** | Source for PDF Reader & Viewer | Source for Dashboards & Academic Features | Primary Destination (All code changes strictly here) |
| **Absolute Path** | `C:\Users\Admin\Desktop\piyushdhara latest\piyushdhara` | `C:\Users\Admin\Desktop\KPRIET\dashboard` | `C:\Users\Admin\Desktop\NEPALEDUPLATFROM` |
| **Technology Stack** | React 18, Vite, Express, MongoDB (Mongoose), pdfjs-dist | React, TypeScript, Vite, Express, TypeScript, MongoDB (Mongoose), TanStack Query | React 18, Vite, TypeScript, Tailwind CSS, Node.js, Express, TypeScript, MongoDB, Prisma, pdfjs-dist |
| **Frontend Entry** | `frontend/src/main.jsx` (`frontend/src/App.jsx`) | `dashboard/frontend/src/main.tsx` (`src/App.tsx`) | `frontend/src/main.tsx` (`frontend/src/App.tsx`) |
| **Backend Entry** | `backend/server.js` | `dashboard/backend/src/server.ts` | `backend/src/server.ts` (`backend/src/app.ts`) |
| **Database Config** | `backend/config/` / Mongoose connection in `server.js` | `dashboard/backend/src/config/database.ts` | `backend/src/config/db.ts` (`mongodb://127.0.0.1:27017/nepal_edu_ecosystem`) |
| **Auth Implementation** | JWT with bcrypt & optional Firebase Auth | JWT with RBAC (`auth.middleware.ts`, `UserRole`: STUDENT, TEACHER, HOD, ADMIN) | JWT with RBAC & Tenant Isolation (`auth.middleware.ts`, `tenant.middleware.ts`, `rbac.middleware.ts`) |
| **Key Feature Folders** | `frontend/src/components/reader/`, `frontend/src/components/classroom/` | `dashboard/backend/src/controllers/`, `dashboard/frontend/src/pages/quiz/`, `pages/assignment/` | `backend/src/modules/`, `backend/src/models/`, `frontend/src/pages/`, `frontend/src/components/`, `smartboard/` |

---

## 2. Source Inspection: Project A (`piyushdhara latest`)

### 2.1 PDF Reader Architecture & Implementation
* **Primary Components:**
  * `frontend/src/components/reader/BookReader.jsx` (480 lines): The top-level reader container managing book layout, zoom levels (`0.5x` to `3.0x`), page navigation, spreads, toolbar controls, sound playback, and responsive rendering.
  * `frontend/src/components/reader/FlipBook.jsx` (339 lines): Realistic two-page spread / single-page flip canvas renderer with page turn animation, touch swipe gestures, and shadow effects.
  * `frontend/src/components/reader/pdfDocument.js` (220 lines): Core PDF handling via `pdfjs-dist`. Implements on-demand page rendering, canvas image generation, LRU page caching (`PageImageCache`), cancellation of in-flight renders, and error classification (`unauthorized`, `missing`, `invalid`, `network`).
  * `frontend/src/components/reader/bookLayout.js` (64 lines): Pure functions calculating single vs. two-page spreads, first page of spread, pages to preload, and spread labels.
  * `frontend/src/components/reader/readerPrefs.js` (88 lines): Audio synthesizer / Web Audio API generator for realistic page-flip sound effect, local preference storage (sound on/off, view mode, last read page).
  * `frontend/src/components/reader/BookReader.css` (229 lines): Styling for reader chrome, dark backdrop, responsive layout, controls toolbar, page shadows, and mobile layout.
  * `frontend/src/components/classroom/PdfViewer.jsx` (275 lines): Classroom-adapted PDF viewer with page jump, thumbnail strip, and split-screen readiness.

### 2.2 Strengths & Migration Targets
* Real canvas rendering using `pdfjs-dist` (version 4.x / ESM worker).
* High performance: lazy rendering, page preloading buffer (previous, current, next 2 spreads).
* Single-page mode (mobile / portrait) and two-page spread mode (desktop / landscape).
* Realistic page turn audio synthesis using Web Audio API without needing external MP3 assets.
* Fullscreen toggle, zoom levels (50% to 300%), bookmarking, and page jump inputs.
* Direct integration point for Nepal Platform's existing Smart Board launcher.

---

## 3. Source Inspection: Project B (`KPRIET`)

### 3.1 Quiz Engine
* **Backend:**
  * `controllers/quiz.controller.ts`: Endpoints for quiz CRUD, subject quizzes, drafts, question banks, AI quiz generation, attempt submission, and analytics.
  * `services/quiz.service.ts` & `services/ai-quiz.service.ts`: Domain-grounded question generator supporting MCQs, multi-correct, true/false, fill-in-blanks, numerical, and short-answer questions.
  * `models/Quiz.ts` (614 lines): Complete Mongoose schema including question types, options, scoring rubrics, time limits, Bloom's taxonomy tags, and attempt submissions.
* **Frontend:**
  * `pages/quiz/QuizBuilderModal.tsx` (1,571 lines): Full-featured quiz builder with question authoring, MCQ choices, question reordering, score weightage, and draft saving.
  * `pages/quiz/AiQuizGeneratorModal.tsx` (1,052 lines): AI generation wizard with curriculum chapter selection, question count, difficulty levels (EASY, MEDIUM, HARD), question type filters, preview, inline editing, and approval workflow.
  * `pages/quiz/StudentQuizPage.tsx` (1,259 lines): Timed quiz examination interface for students with question navigation grid, flag for review, auto-save, and instant submission.
  * `pages/quiz/QuizAnalyticsModal.tsx` (999 lines): Teacher view of student scores, score distribution, question difficulty statistics, and item-by-item analysis.

### 3.2 Assignment Engine
* **Backend:**
  * `controllers/assignment.controller.ts`: Creation, update, publish, AI generation, submission, and grading endpoints.
  * `services/assignment.service.ts` & `services/ai-assignment.service.ts`: Assignment lifecycle management, rubric criteria configuration, deadline enforcement, and late submission rules.
  * `models/Assignment.ts` (919 lines): Full schema with rubric criteria, auto-evaluation settings, attachment links, student submissions, and feedback.
* **Frontend:**
  * `pages/assignment/AssignmentBuilderModal.tsx` (1,849 lines): Assignment creator supporting title, instructions, maximum score, deadlines, file attachments, and rubric criteria.
  * `pages/assignment/StudentAssignmentModal.tsx` (628 lines): Student portal to read instructions, download reference documents, enter submission notes, upload assignment files, and review evaluation feedback.
  * `pages/assignment/AssignmentGradingModal.tsx` (652 lines): Teacher evaluation console for reviewing student submissions, awarding marks, providing qualitative feedback, and returning graded work.

### 3.3 Study Material & Notes Sharing
* **Backend:**
  * `controllers/file.controller.ts`: Secure file upload, mime validation, and role-based file access.
  * `services/academic-file.service.ts`: Metadata attachment (subject, semester/grade, unit/chapter, uploader, confidentiality), security validation.
  * `models/AcademicFile.ts`: Mongoose schema with categories (`SUBJECT_RESOURCE`, `LECTURE_NOTE`, `PRESENTATION`, `GENERAL_DOCUMENT`).

---

## 4. Destination Analysis: Project C (`NEPALEDUPLATFROM`)

### 4.1 Existing Architecture
* **Multi-tenant Backend:**
  * Tenant isolation via `Institution` schema and `tenant.middleware.ts`.
  * Role-based access control (`SUPER_ADMIN`, `SCHOOL_ADMIN`, `PRINCIPAL`, `TEACHER`, `STUDENT`, `PARENT`) via `rbac.middleware.ts`.
  * Central curriculum library (`ICentralSubject`, `ITextbook`, `ITextbookChapter`) mapped to Nepal's National Curriculum Framework (Grades 1 to 12).
  * Smart Board subsystem located in `/smartboard` running interactive simulations, drawing canvas, and tools.
  * Existing models in `models/Assessment.ts` contain base schemas for `IAssignment` and `IAssignmentSubmission`.

### 4.2 Integration Plan & Scope
1. **PDF Reader Engine Migration:**
   * Port `BookReader.jsx`, `FlipBook.jsx`, `pdfDocument.js`, `bookLayout.js`, `readerPrefs.js`, and `BookReader.css` into TypeScript/React in `frontend/src/components/reader/`.
   * Replace the basic iframe in `PdfReaderModal.tsx` with the high-fidelity `BookReader` engine while retaining Nepal CDC textbook metadata, chapter jump drawer, bookmarks, and the Smart Board launcher.
2. **Quiz Management Migration:**
   * Add `backend/src/models/Quiz.ts` with tenant isolation (`institutionId`), class, section, subject, and chapter linking.
   * Add `backend/src/modules/quiz/` with controllers, services, routes, and AI generation grounded in Nepal curriculum textbooks.
   * Add Teacher and Student Quiz interfaces in `TeacherDashboard.tsx` and `StudentDashboard.tsx`.
3. **Assignment Management Migration:**
   * Extend `backend/src/models/Assessment.ts` with class, medium, chapter, and AI generation fields.
   * Add dedicated `backend/src/modules/assignment/` controller, service, and routes supporting manual creation, AI generation, student submission, and teacher evaluation.
   * Add Teacher and Student Assignment interfaces in `TeacherDashboard.tsx` and `StudentDashboard.tsx`.
4. **Notes & Study Material Sharing Migration:**
   * Create `backend/src/models/AcademicMaterial.ts` with file uploads, subject, class, section, medium, and chapter metadata.
   * Add `backend/src/modules/academic-materials/` with secure file storage in `backend/uploads/materials/`.
   * Integrate sharing into Teacher Dashboard and access into Student Dashboard.
5. **Permissions & Institutional Boundaries:**
   * Enforce tenant isolation on every API endpoint.
   * Restrict teachers to assigned subjects and sections.
   * Restrict students to enrolled class, section, and medium.
6. **Smart Board & Timetable Synergy:**
   * Ensure the PDF reader can directly launch the Smart Board session with the current textbook and page.
   * Ensure timetable and academic modules remain fully intact.

