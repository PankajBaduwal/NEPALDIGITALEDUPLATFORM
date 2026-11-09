# Academic Workflow Implementation Plan

**Status:** In progress; audit findings inform the sequence below  
**Non-negotiable boundary:** Work only in this Nepal platform. Do not modify HOD, KPRIET or `piyusdharalatest`.

## Delivery order

| Phase | Work | Acceptance evidence |
|---|---|---|
| 1. Architecture audit | Record the current routes, models, services, role boundaries, test commands and verified gaps. | Audit reports distinguish source inspection from executed tests. |
| 2. Role and institution architecture | Repair only confirmed permission/context gaps; preserve HOD route and behavior. | Focused tests for Admin/Principal/Teacher/Class Teacher/Student and tenant boundaries. |
| 3. Enrollment and academic setup | Verify individual and bulk imports, duplicate handling, classes/sections and active academic year. | Enrollment/import persistence tests. |
| 4. Subject allocation | Ensure the database allocation is the only source of teacher subjects and correctly scopes workspace data. | Assign → refresh/re-login → teacher sees exactly the assigned workspace. |
| 5. Timetables | Verify draft/revision/conflict/publish workflow and teacher/student projections. | Conflict and published-schedule integration tests. |
| 6. Textbooks | Recheck `Nepal data/`, mapping coverage and PDF permissions; retain the existing reader. | Class/medium/subject mapping and signed PDF access tests. |
| 7. Feature configuration | Add required class-level content controls and enforce them at publish and student-read endpoints. Preserve core attendance, marks, timetable and authorized Smart Board/simulation access. | Enabled/disabled API tests for Admin/Principal, Teacher and Student. |
| 8. Teacher dashboard | Use real assignments and data; implement subject workspace/resource organization and dedicated simulation exploration. | Teacher role workflow and responsive UI checks. |
| 9. Student dashboard | Use own active enrollment, published resources and correct textbook; remove fabricated academic values. | Student privacy, content visibility and reader tests. |
| 10. Principal/Admin dashboards | Provide shared institution-level operations without duplicate records; remove static operational data. | Parity/persistence tests for both roles. |
| 11. Class Teacher dashboard | Enforce assigned section, read-only other-teacher marks and result approval workflow; use truthful empty states. | Class Teacher access and report tests. |
| 12. Smart Board/simulations | Pass authorized class, subject and curriculum context through the existing launcher; preserve return path. | Launch/exit integration test. |
| 13. Complete validation | Run builds, focused scripts, role/tenant tests and browser checks; report failures and blockers. | Actual command output and final reports. |

## Initial implementation order from the audit

1. Repair feature access context resolution and add Principal permission parity.
2. Define class-wise controls for required learning content and wire backend checks to content publishing and student access.
3. Replace fake Student/Class Teacher/Principal summary values with API-backed empty states.
4. Correct active academic-year and tenant scoping in enrollment and subject synchronization.
5. Verify and repair simulation launch return behavior, timetable publication propagation and result approval.

## Reporting requirements

Maintain the requested audit, mapping, integration, test and progress reports as evidence accumulates. A feature or phase is not marked complete based only on a visible UI element or a prior report. Record the exact source changes, tests executed, failures, and remaining blockers. HOD is excluded from implementation and progress reporting.
