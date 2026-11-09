# Nepal Digital Education Ecosystem — System Bug Report & Defect Catalog

**Version**: 2.0.0  
**Audit Period**: Final Phase Comprehensive Audit  
**Status**: All Identified Defects Resolved & Verified  

---

## Defect Inventory Overview

During the exhaustive end-to-end audit, 8 concrete defects were identified across data seeding, schema validation, multi-tier feature inheritance resolution, API parameter mapping, and date calculation. Each bug was systematically analyzed, reproduced, fixed at the root cause, and retested.

---

### BUG-01: Hardcoded Historical Subscription Dates Triggering Premature Expiration
- **Severity**: Critical
- **Module**: Subscription & Licensing Engine (`backend/src/modules/subscriptions/`)
- **Symptoms**:
  - `FeatureAccessService.isFeatureAllowed` unexpectedly returned `false` for Persona 1 (Aarav Shrestha) on features like `AI_ASSISTANT`.
  - Entitlement queries reported `status: 'EXPIRED'` even though the institution had just been seeded.
- **Root Cause**:
  - `seed-comprehensive.ts` initially seeded subscriptions with hardcoded dates: `startDate: '2024-04-14'` and `endDate: '2025-04-13'`, with `gracePeriodEndDate: '2025-04-28'`.
  - When running in the current year (2026), `now > activeSub.gracePeriodEndDate` evaluated to `true`, causing `refreshEntitlements` to automatically transition the subscription to `EXPIRED` and disable all paid module entitlements.
- **Reproduction**:
  - Run seeder and query `SubscriptionsService.getInstitutionEntitlements(kmssId)`. Check `isAiAssistantEnabled`.
- **Fix Applied**:
  - Updated `seed-comprehensive.ts` to compute dynamic dates relative to `Date.now()`:
    - `startDate`: 30 days in the past (`Date.now() - 30 * 86400 * 1000`)
    - `endDate`: 335 days in the future (`Date.now() + 335 * 86400 * 1000`)
    - `gracePeriodEndDate`: 350 days in the future (`Date.now() + 350 * 86400 * 1000`)
- **Verification Result**: `PASS` — KMSS subscription immediately evaluated to `status: 'ACTIVE'`, `hasActiveSubscription: true`, and all feature entitlements unlocked.

---

### BUG-02: Student ID Ambiguity in Feature Access Inheritance Engine
- **Severity**: Critical
- **Module**: Feature Access Resolution (`backend/src/modules/feature-access/feature-access.service.ts`)
- **Symptoms**:
  - Persona 5 (`student_smartboardonly`) and Persona 6 (`student_noai`) overrides failed to apply; `resolveFeatureAccess` fell back to institution defaults.
- **Root Cause**:
  - In MERN architecture, authenticated API requests inject the `User._id` into `req.user.id`.
  - However, `StudentEnrollment` stores a separate document ID (`_id`), referencing `studentId: user._id`.
  - `StudentFeatureOverride` schema references `StudentEnrollment` via `studentId: { type: ObjectId, ref: 'StudentEnrollment' }`.
  - `FeatureAccessService.resolveFeatureAccess` performed a direct query `StudentFeatureOverride.findOne({ studentId })`. When passed the `User._id`, it failed to match the enrollment ID, preventing individual overrides from triggering.
- **Reproduction**:
  - Call `FeatureAccessService.isFeatureAllowed(user._id, FeatureKey.STUDENT_DASHBOARD, institutionId)` for Persona 5.
- **Fix Applied**:
  - In `FeatureAccessService.resolveFeatureAccess`, added automatic resolution of `StudentEnrollment` by either `_id: studentId` or `studentId: studentId`:
    ```typescript
    let enrollmentDoc = await StudentEnrollment.findOne({
      $or: [{ _id: studentId }, { studentId: studentId }],
    }).populate('sectionId').lean();
    ```
  - In Step 2 (Student Override), checked against all resolved candidate IDs:
    ```typescript
    studentId: { $in: [studentId, enrollmentDoc?._id, enrollmentDoc?.studentId].filter(Boolean) }
    ```
- **Verification Result**: `PASS` — Persona 5 `STUDENT_DASHBOARD` correctly resolved to `false`, Persona 6 `AI_ASSISTANT` resolved to `false`, and Persona 7 `ASSIGNMENTS_ONLINE_SUBMISSION` resolved to `false`.

---

### BUG-03: Missing Institution Feature Settings for Online Submission Policy
- **Severity**: High
- **Module**: Student Assignment Submission Pipeline (`backend/src/modules/student/student.service.ts`)
- **Symptoms**:
  - Calling `StudentService.submitAssignment` for Aarav (Persona 1) threw `403 Forbidden: "Online assignment submission is disabled by your school policy"`.
- **Root Cause**:
  - In `models/FeatureAccess.ts`, `FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION` is configured with `defaultEnabled: false` (to safeguard offline-only schools in rural Nepal).
  - The seeder had reset `InstitutionFeatureSettings` without explicitly provisioning the policy settings for Kathmandu Model Secondary School (a Blended Learning school where online submissions are enabled).
- **Reproduction**:
  - Attempt student assignment submission from a newly seeded tenant without prior policy configuration.
- **Fix Applied**:
  - In `seed-comprehensive.ts`, explicitly seeded `InstitutionFeatureSettings` for KMSS enabling `ASSIGNMENTS_ONLINE_SUBMISSION: true`, `STUDENT_DASHBOARD: true`, `AI_ASSISTANT: true`, and `SIMULATIONS: true`.
  - Explicitly configured Himalayan Public School with `STUDENT_DASHBOARD: false` and `ASSIGNMENTS_ONLINE_SUBMISSION: false` to represent the Smart Board Only learning mode.
- **Verification Result**: `PASS` — Persona 1 (Aarav) submitted work successfully; Persona 7 (Gita) remained blocked due to individual override.

---

### BUG-04: Parameter Inversion in Teacher Assignment Submission Grading Method
- **Severity**: Medium
- **Module**: Teacher Academic Services (`backend/src/modules/teacher/teacher.service.ts`)
- **Symptoms**:
  - `TeacherService.gradeAssignmentSubmission` failed with `404: "Submission not found"`.
- **Root Cause**:
  - The function signature in `teacher.service.ts` was:
    ```typescript
    static async gradeAssignmentSubmission(
      teacherId: string,
      submissionId: string,
      marksObtained: number,
      feedback: string | undefined,
      institutionId: string
    )
    ```
  - Calling code inverted parameter order by passing `(teacherId, institutionId, submissionId, { marksObtained, feedback })`.
  - As a result, `institutionId` was queried as the MongoDB `_id` of the submission, yielding null.
- **Reproduction**:
  - Grade a submission by passing `institutionId` as the second argument.
- **Fix Applied**:
  - Corrected call sites to strictly supply `(teacherId, submissionId, marksObtained, feedback, institutionId)`.
- **Verification Result**: `PASS` — Submission status updated to `GRADED`, marks recorded as `20/20`, and feedback persisted.

---

### BUG-05: Registration Request Field Aliasing & Response Envelope
- **Severity**: Medium
- **Module**: Authentication & Public Registration (`backend/src/modules/auth/auth.service.ts`)
- **Symptoms**:
  - `AuthService.registerInstitution` threw `"Please fill in all mandatory institution onboarding fields"` when callers provided `contactEmail` or `contactPhone`.
  - `reviewRegistrationRequest` caller attempted to access `.request.status` on an unnested return value.
- **Root Cause**:
  - `registerInstitution` required `email` and `phone`, but client forms and test payloads sent `contactEmail` and `contactPhone`.
  - `reviewRegistrationRequest` returned the raw `request` document, whereas callers expected a wrapped `{ request }` envelope.
- **Reproduction**:
  - Submit an onboarding request with `{ contactEmail: '...', contactPhone: '...' }`.
- **Fix Applied**:
  - Added flexible field aliasing in `registerInstitution`:
    ```typescript
    const email = data.email || data.contactEmail;
    const phone = data.phone || data.contactPhone;
    ```
  - Updated review call site to inspect `reviewRes.status === 'APPROVED'`.
- **Verification Result**: `PASS` — Registration request submitted and approved with Super Admin review audit log.

---

### BUG-06: Central Textbook Model Schema Validation Mismatch in Seeder
- **Severity**: High
- **Module**: Curriculum & Textbook Ingestion (`backend/src/seed-comprehensive.ts`)
- **Symptoms**:
  - `seed-comprehensive.ts` crashed with Mongoose ValidationError: `pdfPath is required`, `subjectId is required`, `'BILINGUAL' is not a valid enum value for medium`.
- **Root Cause**:
  - `seed-comprehensive.ts` attempted to create `Textbook` using fields from legacy code (`centralSubjectId`, `pdfUrl`, `medium: 'BILINGUAL'`).
  - `Curriculum.ts` defines `TextbookSchema` requiring `subjectId: ObjectId`, `pdfPath: string`, and `medium: enum ['NEPALI', 'ENGLISH']`.
- **Reproduction**:
  - Run initial `seed-comprehensive.ts` against a fresh MongoDB instance.
- **Fix Applied**:
  - Updated textbook seeding to pass `subjectId: subScience10._id`, `pdfPath: '/uploads/textbooks/grade10_science.pdf'`, and `medium: 'ENGLISH'`.
- **Verification Result**: `PASS` — CDC Grade 10 Science and Mathematics textbooks created and published.

---

### BUG-07: Timetable Slot Day-of-Week Case Mismatch
- **Severity**: Medium
- **Module**: Timetable & Academic Scheduling (`backend/src/models/Timetable.ts`)
- **Symptoms**:
  - Seeder crashed with ValidationError: `dayOfWeek: 'Sunday' is not a valid enum value for path dayOfWeek`.
- **Root Cause**:
  - `TimetableEntrySchema` enforces uppercase enum: `['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']`.
  - The seeder iterated through title-cased array `['Sunday', 'Monday', ...]`.
- **Reproduction**:
  - Create a timetable slot with `dayOfWeek: 'Sunday'`.
- **Fix Applied**:
  - Updated days array in `seed-comprehensive.ts` to uppercase constants: `['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const`.
  - Also standardized field `roomNumber` instead of `room`.
- **Verification Result**: `PASS` — All 18 weekly timetable slots for Section Sagarmatha seeded cleanly.

---

### BUG-08: Dark Sidebar UI Inconsistency in Dashboards
- **Severity**: Low (UX / Accessibility)
- **Module**: Frontend Navigation Components (`SuperAdminDashboard.tsx`, `SchoolAdminDashboard.tsx`, `TeacherDashboard.tsx`, `StudentDashboard.tsx`)
- **Symptoms**:
  - Sidebars rendered with dark backgrounds (`#0f172a` / slate-900) while the user specification required a uniform, modern, minimalist light-themed SaaS design system.
- **Root Cause**:
  - Legacy dark Tailwind classes (`bg-slate-900`, `text-slate-300`, `border-slate-800`) remained in the sidebar layout wrappers.
- **Reproduction**:
  - Navigate to any dashboard portal; observe dark sidebar contrasting abruptly with white main panels.
- **Fix Applied**:
  - Refactored all 4 dashboard sidebars to crisp white (`#ffffff` / `bg-white`) with light border (`border-slate-200` / `#e2e8f0`), dark slate typography (`text-slate-700`), and subtle blue accent indicator pills (`bg-blue-50 text-blue-700`).
- **Verification Result**: `PASS` — Uniform light SaaS visual identity established across the entire platform.

