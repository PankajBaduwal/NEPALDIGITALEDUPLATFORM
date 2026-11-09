# Backend test scripts — status (6 Nov 2026)

Run against a **copy** of the database. Set both `MONGODB_URI` and `MONGO_URI` to the copy, because the `test_module5`–`test_module12` scripts read `MONGO_URI` and default to the real database.

```
MONGODB_URI=mongodb://127.0.0.1:27017/nepal_edu_test MONGO_URI=mongodb://127.0.0.1:27017/nepal_edu_test npx tsx src/test_<name>.ts
```

## Pass (no failing checks)
test_feature_access, test_module3_smartboard, test_module4_ai_rag, test_module5_exam_quiz, test_module6_subscriptions, test_module7_feature_config, test_module9_backup, test_module10_notifications, test_phase11, test_phase12, test_phase7, test_public_auth, test_school_admin (25 checks), test_superadmin_direct (17 checks).

## Fail because the test is out of date (not a product bug)
| Script | Why |
| --- | --- |
| test_api, test_superadmin | Import the app without connecting to the database first (login times out). |
| test_migrated_features | Expects demo student `dhambojhi_s_001`, which no longer exists. |
| test_module1_academic, test_module2_tenant_security, test_module12_audit_log | Expect old seed fixtures or call services without the institution the services now require (`INSTITUTION_CONTEXT_REQUIRED`). |
| test_module11_concurrency | Marks entry now requires the full class roster and locks submitted marks (`INVALID_MARKS_ROSTER`, `MARKS_ALREADY_SUBMITTED`), so the old scenario no longer applies. The duplicate-submission checks pass. |
| test_module8_low_bandwidth | Requests the PDF without logging in (401). With a login, the server returns `206 Partial Content`, `Content-Range` and `Accept-Ranges: bytes`. |
| test_phase4, test_phase6, test_phase8, test_phase9, test_timetable_e2e | Depend on removed fixtures or newer rules (`TEXTBOOK_MISMATCH`, `INVALID_ATTENDANCE_ROSTER`). |
| test_system_e2e_audit (4 checks) | Assignment submission is disabled by the school's own policy setting; textbook medium check; feature persona and subscription fixtures. |
| test_phase10 (1 check) | Flags Sunday periods; Sunday is a working day in Nepal. The teacher-clash checks now pass (0 clashes after the timetable repair). |

To bring these back, update their fixtures to the current demo school (`dhambojhi_*` users) and pass the institution id.

## Create / edit / delete smoke test (6 Nov 2026)
`backend/src/scripts/crudSmoke.js` runs real API lifecycles as teacher, student, principal, school admin and super admin against a **copy** of the database (second backend on port 5056 started with `MONGODB_URI` pointing at the copy). Result: 39 of 40 checks pass. The one "failure" is a correct refusal: allocating a subject that is already allocated to another teacher returns 409.

Covered: quiz create → edit → publish → student sees and submits it; assignment create → edit → student submits → teacher grades; attendance record and history; announcements; notifications mark read; calendar create → edit → delete; school admin creates a teacher and a student, deactivates and reactivates the teacher; the HOD allocation and subject endpoints; super admin institution and registration lists; the AI index status page and its 403 for students.
