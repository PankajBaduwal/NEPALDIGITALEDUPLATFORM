# Academic Platform Architecture Audit

**Status:** Preliminary source audit; runtime and database verification remain in progress  
**Scope:** Super Admin, Admin, Principal, Teacher, Class Teacher, and Student. HOD is excluded from implementation.

## Project boundary

The destination workspace is `NEPALEDUPLATFROM`, with `frontend/`, `backend/`, `smartboard/`, `simulations/`, and `Nepal data/` at its root. Changes for this task must remain inside this workspace. The KPRIET and `piyusdharalatest` projects are read-only references and were not modified.

## Current architecture

| Layer | Existing implementation | Evidence |
|---|---|---|
| Frontend | React 19, TypeScript, Vite, React Router. Role dashboards are rendered from a single SPA. | `frontend/src/App.tsx`, `frontend/package.json` |
| API | Express + TypeScript with REST modules mounted under `/api/v1`; `/api` is also mounted for Smart Board compatibility. | `backend/src/app.ts` |
| Database | Application models use Mongoose/MongoDB. Prisma dependencies and a Prisma SQLite database also exist; their production role was not established by this source audit. | `backend/src/models/`, `backend/prisma/`, `backend/package.json` |
| Authentication | JWT-backed auth middleware, frontend auth context, role checks and tenant middleware. | `frontend/src/context/AuthContext.tsx`, `backend/src/common/middleware/` |
| Academic records | Academic year, class, section, student enrollment, central subject, subject allocation and timetable records already exist. | `backend/src/models/Academic.ts`, `Allocation.ts`, `Curriculum.ts`, `Timetable.ts` |
| Textbooks | Central textbook records are matched by logical subject, grade and medium; signed PDF access is implemented through the existing reader integration. | `backend/src/modules/curriculum/textbook-access.service.ts`, `frontend/src/components/PdfReaderModal.tsx` |
| Teaching tools | Teacher, student, class-teacher, quiz, assignment, learning-material, timetable, simulation/activity and Smart Board API modules are mounted. | `backend/src/app.ts`, `backend/src/modules/` |
| Realtime | Socket.IO infrastructure exists; this audit has not verified that each academic mutation invalidates or broadcasts dashboard data. | `backend/src/common/services/socket.service.ts`, `frontend/src/services/realtime.ts` |

## Dashboard routes

`frontend/src/App.tsx` routes to Super Admin, Principal, School Admin, HOD, Class Teacher, Teacher and Student dashboard components. The HOD route and component are pre-existing and explicitly out of scope. The Teacher route is limited to `TEACHER`; the Class Teacher dashboard is another view for a teacher account, consistent with the existing `Section.classTeacherId` relationship.

Backend routes are mounted for `/admin`, `/school-admin`, `/teacher`, `/class-teacher`, `/student`, `/timetable`, `/curriculum`, `/feature-access`, `/quizzes`, `/assignments`, `/academic-materials`, `/simulation-activity`, and `/smartboard`.

## Existing workflow foundations

- Institution provisioning and leadership assignment endpoints exist in the Super Admin module.
- School Admin routes include individual and bulk teacher/student enrollment, class and section creation, subject allocation, class-teacher assignment, timetable slot creation, and announcements.
- Timetable builder endpoints include draft, validation, submit, publish, archive and history operations; teacher and student schedule endpoints also exist.
- Teacher assignment retrieval and subject workspace APIs exist.
- Student enrollment is used to retrieve subjects, textbook mappings, attendance, results and assignments.
- Class/section feature-setting records and a feature registry already exist.
- A textbook resource service and PDF access endpoint already exist.
- Simulation/activity catalog and launch endpoints and the existing Smart Board application are present.

These are source-level findings, not proof of end-to-end behavior or MongoDB persistence. Existing root-level progress and verification reports contain completion claims that must be checked against current code and executable tests before being treated as acceptance evidence.

## Source-audit risks requiring implementation or runtime verification

1. Learning feature configuration does not yet cover the required Notes, Materials, Presentations and Videos controls; corresponding feature keys are absent from `FeatureKey`.
2. Class-wise feature access is not consistently enforced at content APIs. Quiz, assignment and academic-material routes do not attach the existing feature-access middleware. The simulation activity attempt route currently checks assignment online-submission access.
3. Feature-setting write routes permit `SCHOOL_ADMIN` but not `PRINCIPAL`, despite Principal being an in-scope academic administrator.
4. The feature-access middleware attempts to find a student's enrollment using a `user` field, while the actual enrollment model uses `studentId`; the fallback also supplies an institution filter not defined on that model.
5. Student dashboard service defaults can represent missing attendance as 100% and missing marks as GPA 3.6. Class-teacher overview defaults missing attendance history to 95%. These are not database-backed empty states.
6. Principal dashboard initializes assignments and chart data with sample values. Teacher dashboard also contains a hardcoded canonical subject catalogue and auto-opens the first allocation during initial load. Verify that only API-backed records are presented as actual teacher assignments.
7. Backend `UserRole` and the Mongoose User model do not include `HOD`, although the frontend route allows it. HOD is excluded; preserve this existing behavior and do not change the HOD dashboard as part of this work.
8. Student enrollment lookups and a number of academic queries need verification for active academic year and institution scoping, not just user or section identifiers.
9. Timetable versioning and publication are present, but simultaneous Admin/Principal edit conflict handling and audit history need end-to-end verification.
10. Curriculum mapping reports exist and `Nepal data/` is present, but the current PDF inventory and text-level mappings have not yet been revalidated against every source file.

## Verification performed in this phase

- Frontend production build: passed (`npm run build` in `frontend/`).
- Backend TypeScript build: passed (`npm run build` in `backend/`).
- MongoDB-backed end-to-end workflows: not run in this audit phase.
- Browser verification of all roles and HOD regression behavior: not run in this audit phase.

## Audit conclusion

The platform has a substantial existing academic foundation; this is not a greenfield implementation. The largest verified gaps are feature-configuration coverage/enforcement, placeholder dashboard data, and unverified year/tenant synchronization. Continue implementation against the existing Mongoose models and API modules rather than introducing parallel records or services.
