# NOTIFICATIONS AND INSTITUTION COMMUNICATION AUDIT REPORT
**Platform:** Nepal Digital Education Management Ecosystem (MERN + TypeScript)  
**Curriculum Scope:** Nepal CDC / NEB Classes 1–12  
**Audit Module:** Module 10 — In-App Notifications, Role Scoping, and Communication Triggers  
**Execution Date:** November 2026  
**Auditor:** Specialized Deep System Testing Agent  

---

## 1. Executive Summary

This report delivers a comprehensive audit of the **Institutional Notification and Communication Engine**. Timely, targeted communication keeps students, parents, and teachers aligned regarding academic deadlines, National Examination Board (NEB) attendance eligibility, and official examination results.

All **8 deep audit assertions passed with a 100.0% success rate**. The implementation verified automatic high-priority attendance alerts when a student dips below the mandatory 75% NEB threshold, scoped audience broadcasting (filtered strictly by active section enrollment), individual/bulk read status state changes, and tenant isolation preventing cross-school notification leaks.

---

## 2. Scope of Testing & Audit Areas

1. **Targeted Academic Alerts:**
   - Automated attendance warnings triggered when a student's attendance falls below the NEB 75% threshold.
   - High-priority flag assignment (`priority: 'HIGH'`) and bilingual advisory content.
2. **Scoped Audience Broadcasting:**
   - Examination marks publication notices broadcast strictly to enrolled students in the target class section.
   - Assignment deadline reminders reaching only active students within the assigned section.
3. **Unread Count & Badge Counters:**
   - Real-time unread counter calculation for UI badge displays.
4. **Lifecycle State Modifications:**
   - Single notification mark-as-read tracking timestamp (`readAt`).
   - Bulk mark-all-as-read clearing unread counts to 0.
5. **Multi-Tenant Isolation:**
   - Verification that students in Institution B never receive notifications emitted by Institution A.

---

## 3. Discovered Vulnerabilities & Implemented Enhancements

### Enhancement 10.1: Implementation of `Notification` Model & `NotificationService`
- **Observation:** Prior to this audit, notification models were missing, leaving institutional notifications reliant solely on static system announcements.
- **Implementation:** Created `backend/src/models/Notification.ts` and `backend/src/modules/notifications/notification.service.ts` supporting full multi-tenant schema with `recipientId`, `institutionId`, `type`, `priority`, `metadata`, and indexed read states.
- **Status:** Implemented & Verified.

### Issue 10.2: Section Enrollment Schema Mismatch in Broadcast Queries
- **Root Cause:** Early iteration queried `{ enrollmentStatus: 'ACTIVE', institutionId }` against `StudentEnrollment`. The actual schema uses `status: { type: String, enum: ['ENROLLED', 'TRANSFERRED', 'GRADUATED'] }` with institutional scoping derived via section relationships.
- **Fix:** Refined `NotificationService.broadcastNotification` to query `StudentEnrollment.find({ sectionId, status: { $in: ['ENROLLED', 'ACTIVE'] } })`.
- **Status:** Resolved & Verified.

---

## 4. Test Matrix & Verification Results

| # | Test Scenario | Expected Behaviour | Actual Behaviour | Result |
|---|---------------|--------------------|------------------|:------:|
| 1 | **Attendance Warning Priority** | `priority: HIGH`, `type: ATTENDANCE_WARNING` | Priority: `HIGH`, Type: `ATTENDANCE_WARNING` | **PASSED** |
| 2 | **Attendance Warning Content** | Cites exact percentage ($68.5\%$) and NEB rule | Message contains $68.5\%$ and NEB | **PASSED** |
| 3 | **Marks Published Scoped Delivery** | Broadcast delivered to Section 10-A students | Delivered to 2 enrolled students | **PASSED** |
| 4 | **Assignment Deadline Reminder** | Scoped reminder delivered to Section 10-A | Delivered to 2 enrolled students | **PASSED** |
| 5 | **Unread Counter Calculation** | Exactly 3 unread items reflected in counter | `items: 3`, `unreadCount: 3` | **PASSED** |
| 6 | **Single Notification Mark-as-Read** | Counter decrements to 2, `readAt` set | `readSuccess: true`, `unreadCount: 2` | **PASSED** |
| 7 | **Bulk Mark-All-as-Read** | All unread cleared, counter drops to 0 | `modified: 2`, `unreadCount: 0` | **PASSED** |
| 8 | **Cross-Tenant Isolation** | Student in School B receives 0 alerts from School A | `unreadCount: 0`, `items: 0` | **PASSED** |

---

## 5. Regression Test Automation

- **Test Suite:** `backend/src/test_module10_notifications.ts`
- **Total Assertions:** 8
- **Passed:** 8 (100.0%)
- **Failed:** 0
- **Execution Log:**
  ```text
  ===============================================================
   MODULE 10: NOTIFICATIONS & INSTITUTION COMMUNICATION AUDIT    
  ===============================================================
  --- 1. Attendance Warning Notification ---
  ✅ [PASSED] Attendance Warning Notification Created with High Priority
  ✅ [PASSED] Attendance Notification Message Contains Exact Percentage and NEB Rule

  --- 2. Scoped Audience Broadcast (Marks Published) ---
  ✅ [PASSED] Marks Published Broadcast Sent to All Enrolled Section 10-A Students

  --- 3. Assignment Deadline Reminder ---
  ✅ [PASSED] Assignment Deadline Reminder Delivered to Section Students

  --- 4. Unread Notification Counts & Query Filtering ---
  ✅ [PASSED] Student 1 Has Exactly 3 Unread Notifications

  --- 5. Single Notification Mark-As-Read ---
  ✅ [PASSED] Single Notification Marked as Read Decrements Unread Counter to 2

  --- 6. Bulk Mark-All-As-Read ---
  ✅ [PASSED] Mark All As Read Clears All Remaining Unread Notifications (unreadCount: 0)

  --- 7. Cross-Tenant Notification Isolation ---
  ✅ [PASSED] Student in Institution B Receives Zero Notifications from Institution A

  TOTAL AUDIT CHECKS: 8
  PASSED: 8 (100.0%)
  FAILED: 0
  ```

---

## 6. Conclusion

The notification service delivers dependable communication channels across all school cohorts. Attendance warnings actively safeguard students from sudden examination disqualification, while scoped broadcasts eliminate communication noise across unrelated classes and sections.

