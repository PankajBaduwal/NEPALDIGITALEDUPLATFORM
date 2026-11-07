# Multi-Tenant Role-Based Access Control (RBAC) & Permission Matrix

## Nepal Digital Education Ecosystem (नेपाल डिजिटल शिक्षा प्रणाली)
**Scope:** Super Admin, School Admin, College Admin, Principal, Teacher, Student  
**Architecture:** Multi-Tenant Isolation with Tenant Filtering Middleware (`tenantMiddleware`)

---

## 1. Role Definitions
- **`SUPER_ADMIN`:** Platform owner, Ministry of Education tech directorate, CDC administrators. Operates globally across all institutions.
- **`SCHOOL_ADMIN`:** Principal or school-appointed administrative officer. Operates with full autonomy within their own school.
- **`COLLEGE_ADMIN`:** Campus Chief or college administrative officer. Operates with full autonomy within their college campus.
- **`PRINCIPAL`:** Head of school. Academic leadership, timetable approval, and exam results validation within their school.
- **`TEACHER`:** Faculty member. Class teaching, subject assignments, marks entry, timetable viewing, and smart board presentation.
- **`STUDENT`:** Learner. Personal dashboard, digital textbooks, 3D simulations, AI tutor, homework submission, and exam report cards.

---

## 2. Platform Permission Matrix

| Module / Operation | Super Admin | School Admin | College Admin | Principal | Teacher | Student |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Central Platform & National Registry** |
| Register / Provision Any School Directly | **Yes** | No | No | No | No | No |
| Review / Approve Self-Registration Requests | **Yes** | No | No | No | No | No |
| View Global Provisioning Audit Logs | **Yes** | No | No | No | No | No |
| Manage National CDC Curriculum & Textbooks | **Yes** | No | No | No | No | No |
| Configure Commercial Subscription Pricing | **Yes** | No | No | No | No | No |
| **Institutional Governance & Profile** |
| View Institution Profile & Metrics | **Yes** (All) | **Yes** (Own) | **Yes** (Own) | **Yes** (Own) | View Basic | View Basic |
| Update School Timings & Contact Info | **Yes** | **Yes** | **Yes** | **Yes** | No | No |
| View Institutional Invoices & Packages | **Yes** | **Yes** | **Yes** | **Yes** | No | No |
| **Faculty & Staff Operations** |
| Add / Create Single Faculty Account | **Yes** | **Yes** | **Yes** | **Yes** | No | No |
| Bulk Import Faculty via CSV | **Yes** | **Yes** | **Yes** | **Yes** | No | No |
| Toggle Faculty Status (Active/Suspended) | **Yes** | **Yes** | **Yes** | **Yes** | No | No |
| View Faculty Workload & Allocation | **Yes** | **Yes** | **Yes** | **Yes** | View Own | No |
| **Student Registry & Admissions** |
| Enroll Single Student | **Yes** | **Yes** | **Yes** | **Yes** | No | No |
| Bulk Import & Enroll Students (CSV) | **Yes** | **Yes** | **Yes** | **Yes** | No | No |
| View Full Student Roster & Roll Numbers | **Yes** | **Yes** | **Yes** | **Yes** | View Class | View Own |
| **Curriculum Offerings & Faculty Allocations** |
| Create Classes & Sections | **Yes** | **Yes** | **Yes** | **Yes** | No | No |
| Assign Primary Class Teacher to Section | **Yes** | **Yes** | **Yes** | **Yes** | No | No |
| Allocate Subjects to Teachers (Matrix) | **Yes** | **Yes** | **Yes** | **Yes** | No | No |
| Bulk Subject Allocation Matrix | **Yes** | **Yes** | **Yes** | **Yes** | No | No |
| **Timetable & Scheduling** |
| Create Timetable Slots | Auth Only* | **Yes** | **Yes** | **Yes** | No | No |
| View Class Weekly Timetable | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |
| View Teacher Personal Schedule | **Yes** | **Yes** | **Yes** | **Yes** | View Own | No |
| **Examinations, Marks & Report Cards** |
| Schedule School Examinations | **Yes** | **Yes** | **Yes** | **Yes** | View Only | View Only |
| Enter Subject Examination Marks | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** (Alloc) | No |
| Verify & Publish Terminal Results | **Yes** | **Yes** | **Yes** | **Yes** | No | No |
| View & Download Official Report Cards | **Yes** | **Yes** | **Yes** | **Yes** | View Class | View Own |
| **Digital Features & Learning Access** |
| Access Smart Board Mode | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | If Enabled |
| Access 3D Science & Math Simulations | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | If Enabled |
| Interact with AI Learning Assistant | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | If Enabled |
| Read Official CDC Digital Textbooks | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** | **Yes** |
| Create Homework & Assignments | No | **Yes** | **Yes** | **Yes** | **Yes** | No |
| Submit Online Homework Files | No | No | No | No | No | **Yes** |

*\* Note on Timetable Super Admin Access: Super Admin may edit a school's timetable only if the school has explicitly authorized `academicSettings.superAdminTimetableAccess: true` in its institutional profile.*

---

## 3. Strict Multi-Tenant Isolation Guarantees
1. **Database Query Scoping:** Every institutional operation executes within the scope of `req.institutionId`, resolved from the authenticated JWT session or verified tenant header.
2. **Zero Cross-Tenant Leakage:** A School Admin from School A receives a `403 Forbidden` if attempting to query, read, or modify teachers, students, or marks belonging to School B.
3. **Audit Log Independence:** Each institution maintains its own bulk import history and academic calendars.

