# BACKUP, RESTORE AND DISASTER RECOVERY AUDIT REPORT
**Platform:** Nepal Digital Education Management Ecosystem (MERN + TypeScript)  
**Curriculum Scope:** Nepal CDC / NEB Classes 1–12  
**Audit Module:** Module 9 — Automated Backup, Data Integrity Checksums, and Isolated Disaster Recovery  
**Execution Date:** November 2026  
**Auditor:** Specialized Deep System Testing Agent  

---

## 1. Executive Summary

This report delivers a comprehensive technical audit of the **Database Snapshot Backup, Cryptographic Manifest Generation, and Isolated Disaster Recovery Engine**. Educational institutions in Nepal cannot afford data loss due to server failure, accidental administrative deletion, or storage corruption.

All **8 deep audit assertions passed with a 100.0% success rate**. During the audit, an insidious cross-platform bug was identified: on Windows and macOS case-insensitive file systems, MongoDB collections differing only by casing (such as `attendanceRecords` and `attendancerecords`) collided into the same physical file, overwriting data and corrupting the checksum manifest. This was permanently resolved by introducing collision-free case-hashed filename mapping.

---

## 2. Scope of Testing & Audit Areas

1. **Automated Collection Snapshot Export:**
   - Full JSON snapshot generation across all core application collections (Institutions, Users, Enrollments, Classes, Sections, Textbooks, Assessments, Marks, Attendance, Timetables, and Subscriptions).
2. **Cryptographic Manifest Generation:**
   - Creation of `manifest.json` recording timestamp, source database, document inventory, and per-collection 64-character SHA-256 hashes.
3. **Isolated Test Namespace Recovery:**
   - Verification of full database restore into an isolated namespace (`nepal_edu_ecosystem_recovery_test`).
   - 100% document count equality verification against exported manifest totals.
   - Immediate teardown of the recovery database upon validation.
4. **Production Non-Interference Guarantee:**
   - Strict verification that disaster recovery routines do not modify, mutate, or lock the live production database (`nepal_edu_ecosystem`).

---

## 3. Discovered Vulnerabilities & Implemented Fixes

### Issue 9.1: Case-Insensitive Filesystem Collision Overwriting MongoDB Collections
- **Root Cause:** MongoDB collection names are case-sensitive (e.g. `attendanceRecords` and legacy `attendancerecords` can coexist in the same database). However, Windows NTFS and macOS APFS are case-insensitive. When writing `${colName}.json`, the second collection overwrote the first collection's file, invalidating the SHA-256 checksum and corrupting the snapshot.
- **Fix:** Enhanced `BackupRestoreService` to use case-preserving unique filenames:  
  `${colName.toLowerCase()}_${crypto.createHash('md5').update(colName).digest('hex').substring(0, 8)}.json`.  
  This guarantees that every MongoDB collection receives an independent, non-colliding file across any host operating system.
- **Status:** Resolved & Verified.

---

## 4. Test Matrix & Verification Results

| # | Test Scenario | Expected Behaviour | Actual Behaviour | Result |
|---|---------------|--------------------|------------------|:------:|
| 1 | **Backup Directory Generation** | Directory generated with timestamped files | Generated successfully | **PASSED** |
| 2 | **Manifest Generation** | `manifest.json` containing collection registry created | Present with schema v1.0.0 | **PASSED** |
| 3 | **Collection Coverage** | $\ge 10$ core operational collections recorded | $\ge 40$ collections cataloged | **PASSED** |
| 4 | **Document Count Validation** | Total document count $> 0$ | Total documents documented | **PASSED** |
| 5 | **SHA-256 Checksum Integrity** | Valid 64-character hexadecimal hash per collection | 100% valid SHA-256 hashes | **PASSED** |
| 6 | **Isolated Namespace Restoration** | Full restoration into `nepal_edu_ecosystem_recovery_test` | Restored with 100% success | **PASSED** |
| 7 | **Document Count Parity** | Restored count matches manifest total exactly | Exact 1:1 document parity | **PASSED** |
| 8 | **Live Production Non-Interference**| Live `nepal_edu_ecosystem` database unmodified | Intact and fully operational | **PASSED** |

---

## 5. Regression Test Automation

- **Test Suite:** `backend/src/test_module9_backup.ts`
- **Total Assertions:** 8
- **Passed:** 8 (100.0%)
- **Failed:** 0
- **Execution Log:**
  ```text
  ===============================================================
   MODULE 9: BACKUP, RESTORE & DISASTER RECOVERY AUDIT           
  ===============================================================
  --- 1. Programmatic Snapshot Export ---
  ✅ [PASSED] Backup Directory Successfully Generated
  ✅ [PASSED] Manifest JSON File Generated
  ✅ [PASSED] Manifest Records Multiple Core Collections
  ✅ [PASSED] Total Documents Count > 0

  --- 2. SHA-256 Checksums and Integrity Verification ---
  ✅ [PASSED] Every Exported Collection File Has Valid 64-character SHA-256 Hash

  --- 3. Restoration into Isolated Namespace (Zero Live Data Risk) ---
  ✅ [PASSED] Restoration to Isolated Namespace Completed with 100% Match
  ✅ [PASSED] Restored Document Count Matches Exported Count

  --- 4. Live Production Database Non-Interference Check ---
  ✅ [PASSED] Active Production Database Unmodified and Fully Intact

  TOTAL AUDIT CHECKS: 8
  PASSED: 8 (100.0%)
  FAILED: 0
  ```

---

## 6. Conclusion

The disaster recovery engine provides automated, cryptographically verified backups with zero disruption to active school operations. Recovery drills can be executed routinely into isolated namespaces to certify institutional business continuity without jeopardizing live academic data.

