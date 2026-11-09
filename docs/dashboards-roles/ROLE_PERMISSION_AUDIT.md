# Role and Permission Audit

**Status:** Source inspection; endpoint behavior still requires integration testing  
**Scope:** Six in-scope dashboards only. HOD is excluded and remains unchanged.

## Current route-level role model

| Role | Current frontend route | Existing backend role/source | Audit notes |
|---|---|---|---|
| Super Admin | `/super-admin/*` | `SUPER_ADMIN` | Platform provisioning and administration routes are protected by Super Admin authorization. |
| Admin | `/school-admin/*` | `SCHOOL_ADMIN`, `COLLEGE_ADMIN` | Institution administration routes include tenant middleware and role checks. |
| Principal | `/principal/*`; also allowed on `/school-admin/*` | `PRINCIPAL` | Several shared school operations exist; class-wise feature-setting write routes currently omit Principal. |
| Teacher | `/teacher/*` | `TEACHER` | Teacher workspace APIs require authentication, teacher role and tenant middleware. |
| Class Teacher | `/class-teacher/*` | Existing teacher with `Section.classTeacherId` | No separate Class Teacher account/model is needed for the current school structure. Service checks the assigned section for teacher views. |
| Student | `/student/*` | `STUDENT` | Student APIs are role-protected and apply a dashboard feature check; ownership and active enrollment need endpoint-level testing. |

## Findings

### Confirmed patterns

- `ProtectedRoute` enforces authentication and frontend role visibility; backend middleware is also present and remains authoritative.
- `tenantMiddleware` derives institutional user scope from the verified token and rejects mismatched institution identifiers.
- School Admin routes use authentication, tenant middleware and role authorization; write operations are selectively guarded.
- Teacher, Student and Class Teacher API routers each apply authentication, tenant scope and role restrictions.
- Class Teacher is implemented as an additional responsibility on a teacher, stored through `Section.classTeacherId`.
- Class Teacher service checks that the current teacher is designated for the requested section before returning class data.
- Student data is intended to be limited to the authenticated student and their enrollment.

### Gaps and regressions to address

1. **Principal feature configuration:** `feature-access` write routes for class, section and institution configuration authorize Super Admin and School Admin but not Principal. The prompt requires Admin and Principal parity for this academic configuration.
2. **Content feature enforcement:** Quiz, assignment and academic-material routes do not consistently invoke `requireFeatureAccess`; hiding a menu item would not enforce the class policy.
3. **Student feature context lookup:** `requireFeatureAccess` queries the enrollment with the wrong field name (`user` rather than `studentId`) and a model-unsupported institution field, so student-context feature resolution can miss the enrollment.
4. **Class Teacher result publication:** the route admits Principal/Super Admin, but the service publication method calls its class-teacher verifier without passing the role. Verify the intended approval policy and correct authorization before enabling this route for those roles.
5. **HOD role mismatch (regression protection only):** the frontend route permits an `HOD` role, but the backend role enum and User schema omit it. HOD is explicitly excluded; do not make HOD changes during this implementation.
6. **Tenant/year boundaries:** source code contains institution-scoped models and middleware, but each read/write operation still needs tests proving the queried section, assignment, textbook, enrollment and academic year belong to the authenticated tenant.
7. **Student history:** enrollment retrieval must consistently select the active/current academic-year enrollment and deny access to another student's records.

## Required permission rules for implementation

- Admin and Principal may perform the same institution-scoped academic setup operations covered by the prompt.
- Teacher writes must be constrained to their active subject allocation and section.
- Class Teacher visibility must be constrained to the designated section; marks from other subject teachers remain read-only unless separately authorized.
- Students must resolve context from their own active enrollment, never from untrusted client-supplied student, section or class identifiers.
- Super Admin cross-tenant access remains an explicit platform-level exception; institution users remain tenant-scoped.
- Every class-wise feature restriction must be checked by backend APIs for both publishing and student access.

## Not yet verified

No live cross-tenant attack tests or complete role-by-role API integration suite was executed in this phase. The findings above are source-level observations, not a claim that every route is exploitable or that the full permission system has been certified.
