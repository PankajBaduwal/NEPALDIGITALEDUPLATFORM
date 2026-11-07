# Academic Workflow Gap Report

**Status:** Source fixes, frontend type-check, and production builds verified; database/browser verification is still pending  
**Scope:** Six requested dashboards; HOD excluded.

## Workflow status summary

| Workflow | Existing foundation | Verified gap / evidence | Status |
|---|---|---|---|
| Institution provisioning and leadership assignment | Super Admin routes, provisioning services and invitation-related documentation exist. | Secure activation, reassignment authorization and tenant provisioning were not exercised in this phase. | Present; runtime verification pending |
| Teacher/student enrollment | Individual create and bulk-import endpoints/components exist. | Validation/import history and persistence across refresh/re-login were not tested. | Present; runtime verification pending |
| Classes, sections and academic year | Mongoose academic models and class/section APIs exist. | Academic-year scoping across every operation needs verification; college department/program/semester parity is not demonstrated by the school-focused models inspected. | Partial / verify college path |
| Subject allocation → Teacher Dashboard | Subject cards, workspace groups, roster, attendance history, and resources now use allocation/workspace APIs. The timetable view uses the published teacher timetable API. | API authorization, data persistence, and timetable behavior still need a signed-in browser/database test. | Implemented; runtime verification pending |
| Timetable creation and publishing | Versioned timetable builder has draft, validation, submit, publish, archive and history endpoints. | Admin/Principal concurrent edit conflicts and audit/revision behavior need an integration test. Timetable propagation to both dashboards is not fully proven. | Present; runtime verification pending |
| Official textbook PDFs | Central textbook records, logical subject/grade/medium matching, scoped access and signed PDF streaming exist; School Admin now shows API data or an explicit empty state instead of seeded textbook rows. | Existing mapping report is not a current recursive inventory verification; dashboard resource distinction and reader behavior need role-based browser checks. | Present; verification pending |
| Class-wise feature settings | Class and section setting models, registry, School Admin matrix and Principal class-access controls include Notes, Materials, Presentations and Videos. Principal write access is enabled for institution, class, bulk and section settings; class/section updates validate institution ownership. | Section-level controls are still only available through the existing School Admin UI; feature enforcement on ID-only operations relies on request context and needs runtime authorization tests. | Partial |
| Teacher resources and content publishing | Academic material, quiz, assignment, and Smart Board APIs/components exist. Teacher resources and Assignment Studio attachments upload through APIs; assignment/submission file reads and detail, submission-list, and grading operations are institution- and record-scoped. | End-to-end upload/publish and scoped download behavior still need runtime verification. | Implemented; runtime verification pending |
| Student workspace | Student APIs and components exist for subjects, attendance, results, materials, quizzes, and assignments. Student views use unwrapped API payloads and no longer display sample quizzes/assignments when data is missing. Assignment and quiz details/submissions now require an active enrollment and active/published content. | Current-year enrollment and resource authorization need database/browser testing. | Partial |
| Explore Simulations | Teacher dashboard imports `ExploreSimulationsPanel`; published simulations load from the API, and Teacher launch now creates a class/section/subject-scoped Smart Board session. | Session launch and return behavior still need runtime verification; student preview remains available without exposing the teacher launch action. | Partial / runtime verification pending |
| Class Teacher monitoring | Section assignment, overview, consolidated results, and the sequential review/approval/publication workflow exist. Empty values are no longer filled with invented attendance/results. | Role authorization and publication require database-backed workflow tests. | Implemented; runtime verification pending |
| Principal and Admin parity | School Admin and Principal use institutional API data for counts and analytics; Principal feature-control UI and feature-setting routes are wired. Missing analytics render as unavailable rather than invented percentages; class performance and at-risk panels have truthful empty states. | Principal/Admin feature settings and analytics require tenant-isolation and browser tests. | Partial |
| Super Admin dashboard | Provisioning, institution, user, audit, and simulation-management endpoints/components exist. Simulation lists and creation now handle the API client’s unwrapped payload. | Secure invitation activation and leadership reassignment were not exercised in this phase. | Present; runtime verification pending |
| HOD dashboard | Existing route/component remains present. | Explicitly out of scope. No HOD implementation changes are planned. | Excluded |

## Highest-priority gaps

1. Verify feature settings, Teacher allocations, Student enrollment, and resources against an isolated tenant database.
2. Verify result publication, timetable conflict/revision behavior, assignment file access, and Smart Board simulation launch/return in the browser.
3. Run existing backend workflow tests against an isolated test database; no database-mutating test was run in this pass.

## Changes completed in this pass

- Added first-class Notes, Materials, Presentations and Videos feature keys and registry definitions.
- Included those keys in the class feature matrix and School Admin matrix toggles.
- Enabled Principal authorization for institution, class, bulk and section feature-setting writes.
- Added institution ownership checks to class and section setting updates.
- Added a Principal class learning access matrix with toggles for Notes, Materials, Presentations and Videos.
- Enforced assignment and quiz feature settings on their create/update/publish and student list/detail/submission routes.
- Added a Video learning-material category and feature-aware teacher uploads; student resource lists use the enrolled class and omit disabled categories.
- Updated the Phase 4 student dashboard assertion to accept absent attendance/GPA rather than requiring fabricated values.
- Corrected Teacher Smart Board session creation to call `POST /smartboard/sessions`, require an actual allocation, use the backend-provided session launcher URL, and surface launch failures instead of silently opening an untracked board.
- Passed assigned class/section/subject context to simulation launches; simulation exploration no longer invents fallback simulations when the published-simulation API is empty or unavailable.
- Replaced the Teacher Dashboard's six hardcoded subject cards and teaching-group list with actual allocations and removed fabricated room/period/student details from the cards.
- Replaced the fabricated Teacher roster and attendance history with workspace/attendance API data, removed default marks, and routed attendance/mark actions to persisted teacher API operations.
- Wired the legacy Teacher resource upload/list to multipart academic-material endpoints instead of generating local-only success records.
- Corrected API response handling in Teacher, Student, School Admin, Super Admin, and learning-resource/quiz/assignment screens so they consume the API client's unwrapped payloads and don't wait for an envelope that is no longer returned.
- Removed fabricated Student quizzes/assignments, Teacher quizzes/assignments/allocations/resources, placeholder AI questions/curriculum chapters, and Principal attendance/performance/at-risk values. Empty and unavailable states are shown instead.
- Replaced the Teacher's hardcoded timetable with the published timetable view and removed the fallback Smart Board subject code.
- Replaced Assignment Studio's simulated file URLs and seeded questions with actual multipart upload and an empty question editor; assignment updates now accept multipart files.
- Removed public static serving for assignment uploads and added authenticated file downloads scoped to the owning institution and assignment/submission record.
- Removed the School Admin's hardcoded textbook cards and outdated 2081 exam defaults; examination creation now requires configured academic-year context.
- Scoped assignment and quiz detail lookups to the authenticated institution; teachers can only open their own resources, while student access requires active enrollment and active/published content.
- Scoped assignment submission lists and grading to the owning teacher or an authorized institution administrator, and required institution context for assignment submissions and quiz attempts.
- Removed simulated OCR text, hard-coded assignment score suggestions, and related UI claims; file submissions remain available for manual teacher review.
- Updated the School Admin dashboard test assertion to accept intentionally unavailable attendance/performance metrics rather than requiring invented percentages.
- Removed the remaining hardcoded examination grade chart values and fallback subject-grade selection; data loading errors no longer silently become empty timetable or simulation data.
- Added institution filters to student assignment submission and quiz attempt lookups.
- Updated the frontend TypeScript path mapping for TypeScript 7, fixed the resulting compile errors, and corrected the Subject Workspace resource tab and AI form bindings.
- Backend TypeScript build, frontend TypeScript check, and frontend production build pass. Database/browser workflow tests were not run: `MONGODB_URI` is absent from both the backend `.env` and the process environment, so test commands would target the fallback `nepal_edu_ecosystem` database. No signed-in browser test session is available in this workspace.

## Verification caveat

The existing root documentation contains earlier claims of full completion and passing test suites. Those documents are useful discovery leads but are not accepted as current verification evidence until their referenced commands are executed against the current source and test environment. Existing backend workflow scripts write database records and were not run because the workspace has no `MONGODB_URI` test target. Role-based browser checks also remain pending.
