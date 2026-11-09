# Role & Permission Matrix

This document defines the clear division of responsibilities, operational boundaries, and backend permission policies across the Nepal Education Platform.

---

## 1. Governance Separation Summary

- **Super Admin (Central CDC / Ministry)**: National platform authority. Manages central curriculum frameworks, bilingual textbook uploads, platform-level subscriptions, institution onboarding & approval, and global audit logging.
- **Principal (Academic Supervisory Authority)**: Institutional academic leader. Monitors student performance, teacher workloads, curriculum implementation, attendance trends, assessment outcomes, and at-risk students. Approves and publishes terminal examination results and timetables.
- **School Admin (Operational Management Authority)**: Routine institutional operator. Manages user accounts (teachers, students), bulk imports, classes & sections, teacher-subject allocations, timetable creation & publishing, examination scheduling, feature toggles, and billing.
- **Teacher (Instructional & Evaluative Authority)**: Classroom and subject lead. Manages subject workspaces, curriculum units, student attendance, assignments (via Assignment Studio), quizzes (via Quiz Studio), marks entry, student evaluation, and Smart Board classroom delivery.
- **Student (Learner)**: Consumes learning resources, attends Smart Board sessions, submits assignments, takes proctored quizzes, tracks attendance, and reviews academic report cards.

---

## 2. Permission Matrix

| Capability / Action | Super Admin | Principal | School Admin | Teacher | Student |
|---|:---:|:---:|:---:|:---:|:---:|
| **Central Curriculum Management** | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Institution Provisioning & Registration Approval** | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **Manage Global Subscriptions & Pricing** | ✅ Full | ❌ | ❌ | ❌ | ❌ |
| **View Institutional Academic Overview** | ✅ Nationwide | ✅ School-wide | ✅ School-wide | ❌ Assigned Only | ❌ Own Only |
| **Manage Teacher Accounts (Create, Edit, Status)** | ✅ | 👁️ Oversight | ✅ Full | ❌ | ❌ |
| **Manage Student Accounts (Create, Import, Enroll)** | ✅ | 👁️ Oversight | ✅ Full | ❌ | ❌ |
| **Configure Classes & Sections** | ✅ | 👁️ View | ✅ Full | ❌ | ❌ |
| **Configure CDC Subject Offerings & Allocation** | ✅ | 👁️ Review | ✅ Full | ❌ | ❌ |
| **Create & Edit Timetable** | ✅ | 👁️ Review | ✅ Full | ❌ | ❌ |
| **Approve & Publish Master Timetable** | ✅ | ✅ Approval Seal | ✅ Publication | 👁️ View Assigned | 👁️ View Class |
| **Create & Author Assignments (Assignment Studio)** | ❌ | ❌ | ❌ (Authorized only) | ✅ Assigned Subjects | ❌ |
| **Create & Author Quizzes (Quiz Studio)** | ❌ | ❌ | ❌ (Authorized only) | ✅ Assigned Subjects | ❌ |
| **Supervise Institutional Assignments & Quizzes** | ✅ | ✅ Full | ✅ Full | 👁️ Assigned Subjects | ❌ |
| **Submit Coursework & Homework** | ❌ | ❌ | ❌ | ❌ | ✅ Own Class |
| **Take Quizzes with Proctoring Security** | ❌ | ❌ | ❌ | ❌ | ✅ Own Class |
| **Grade Submissions with Rubric & OCR** | ❌ | ❌ | ❌ | ✅ Assigned Subjects | ❌ |
| **Enter Terminal Examination Marks** | ❌ | ❌ | ❌ | ✅ Subject Teacher | ❌ |
| **Verify Terminal Marks as Class Teacher** | ❌ | ❌ | ❌ | ✅ Class Teacher | ❌ |
| **Approve & Seal Examination Publication** | ❌ | ✅ Principal Seal | ❌ | ❌ | ❌ |
| **Identify At-Risk Students & Log Interventions** | ❌ | ✅ Full | 👁️ Admin scope | ✅ Class Teacher | ❌ |
| **Access CDC Digital Textbooks (Classes 1–12)** | ✅ Full | ✅ Full | ✅ Full | ✅ Full | ✅ Full |
| **Launch Interactive Smart Board** | ✅ | ✅ | ✅ | ✅ Full Session | 👁️ Viewer Mode |
| **Configure School-Wise Feature Toggles** | ✅ Global | ❌ | ✅ Package-limited | ❌ | ❌ |
| **Pay Institutional Invoices (Khalti/eSewa)** | ❌ | ❌ | ✅ Full | ❌ | ❌ |
| **Generate & Export Institutional CSV Reports** | ✅ Global | ✅ School-wide | ✅ School-wide | 👁️ Subject-level | ❌ |

