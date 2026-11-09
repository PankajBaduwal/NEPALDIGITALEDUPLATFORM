# Module 1: Academic Data Accuracy and Calculation Engine Report

**Audit Type**: Deep Quality & Mathematical Calculation Engine Audit  
**Module**: Academic Calculations, Marks Engine, Attendance Engine & Student History  
**Standards Evaluated**: Nepal Curriculum Development Centre (CDC 2078) Secondary Education Letter Grading Directive, National Examination Board (NEB) 75% Attendance Regulation  
**Test Suite**: `backend/src/test_module1_academic.ts`  
**Result**: 12 / 12 Passed (100.0%)  

---

## 1. Executive Summary

This audit deeply verified the academic calculation engine for Nepalese schools (Classes 1–12), focusing on edge cases in attendance formulas, CDC 2078 component passing requirements, boundary marks validations, post-publication result integrity, and student academic year rollover preservation.

All identified deficiencies (e.g., absence of marks upper-bound validation, lack of CDC component-failure enforcement, and inaccurate batch attendance matching) were corrected at the root cause and regression tested.

---

## 2. Test Execution & Assertion Matrix

| Test ID | Scenario & Expected Behavior | Test Data / Parameters | Actual Output | Status |
| :---: | :--- | :--- | :--- | :---: |
| **ATT-01** | **Approved Medical Leave Excluded from Denominator**<br>Approved medical leave should not penalize attendance percentage when `EXCLUDE_APPROVED_LEAVE` policy is selected. | 10 total days (7 Present, 1 Late @ 0.8 weight, 2 Approved Leave). Denominator = 8 days. | Total Days: 10, Working Days: 8, Score: (7 + 0.8)/8 = 97.5% $\rightarrow$ **98%** | **PASS** |
| **ATT-02** | **Attendance Policy: Include All Days**<br>When policy is set to `INCLUDE_ALL`, all 10 calendar days are counted in the denominator. | 10 total days, 7 Present, 1 Late. Denominator = 10 days. | Working Days: 10, Score: (7 + 0.8)/10 = **78%** | **PASS** |
| **ATT-03** | **NEB / CDC 75% Attendance Warning Trigger**<br>Students falling below the statutory 75% threshold must be flagged with `hasAttendanceWarning: true` and formal notice. | Additional 5 unexcused absences (7 Present, 1 Late out of 13 working days = 60%). | `hasAttendanceWarning: true`, `attendanceRate: 60%`, NEB warning notice generated. | **PASS** |
| **MRK-01** | **Decimal Marks Rounding & Grade Mapping**<br>Decimal percentages (e.g. 79.5%) must round to 1 decimal place and map to CDC letter grade. | Percentage: 79.5% | Mapped to **Grade B+**, **GPA 3.2** ('Very Good') | **PASS** |
| **MRK-02** | **Boundary Marks (0 and 100)**<br>Boundary limits must accurately produce `NG (0.0)` for 0 and `A+ (4.0)` for 100. | 0% and 100% | 0% $\rightarrow$ **NG (0.0)**, 100% $\rightarrow$ **A+ (4.0)** | **PASS** |
| **MRK-03** | **Validation: Reject Marks Exceeding Maximum**<br>System must reject theory marks exceeding full marks with a descriptive error. | Theory Marks: 85, Full Marks: 75 | Threw: `Theory marks (85) cannot be negative or exceed maximum marks (75)` | **PASS** |
| **MRK-04** | **Validation: Reject Negative Marks**<br>System must reject negative marks (e.g. -5) on all assessments. | Theory Marks: -5 | Threw: `Theory marks (-5) cannot be negative or exceed maximum marks (75)` | **PASS** |
| **MRK-05** | **CDC 2078 Component Passing Rule: Failed Practical**<br>Under CDC 2078 directive, a student failing either component (theory < 27 or practical < 10) must be Non-Graded (NG) regardless of total percentage. | Theory: 70/75 (High A+), Practical: 6/25 (Failed, pass mark is 10). Total = 76%. | Overall Grade: **NG**, GPA: **0.0**, Reason: `Failed in Practical component` | **PASS** |
| **MRK-06** | **Post-Publication Result Protection**<br>Subject teachers cannot silently overwrite marks once results are published. | Assessment status `PUBLISHED`; Teacher attempts update. | Blocked with: `Unauthorized: Assessment results have been officially published` | **PASS** |
| **MRK-07** | **Authorized Post-Publication Correction with Audit Trail**<br>School Admin can authorize corrections, recording before/after values in `MarksAuditLog`. | School Admin corrects Theory marks from 68 to 69 with remark. | Update allowed; `MarksAuditLog` created with previous and new values. | **PASS** |
| **HIS-01** | **Academic Year Rollover & Promotion with Record Preservation**<br>Promoting student to Class 11 must mark old enrollment as `GRADUATED`, create new enrollment in 2082/2083, and retain 100% of Class 10 marks and attendance. | Student Aarav promoted from Class 10 Sagarmatha to Class 11 Science-A. | Old: `GRADUATED`, New: `ENROLLED`. Class 10 Marks count and Attendance records unchanged (100% preserved). | **PASS** |
| **HIS-02** | **Student Transfer Workflow & Record Locking**<br>Transferring a student must set status to `TRANSFERRED` while preserving all historical academic records. | Student transfer with relocation reason. | Status: `TRANSFERRED`, Historical records locked and preserved. | **PASS** |

---

## 3. Discovered Defects & Fixes Implemented

1. **Defect**: `getStudentAttendance` selected `r.records[0]?.status` in batch attendance documents, attributing student 0's status to all students in the batch.
   - **Fix**: Implemented exact matching `r.records.find(rec => rec.studentId === studentId)`.
2. **Defect**: Missing marks boundary validation allowed inputting 150/75 or -10 marks.
   - **Fix**: Added strict boundary validation in `NepalGradingUtil.evaluateSubjectMarks` throwing errors on negative marks or scores exceeding `fullMarksTheory`/`fullMarksPractical`.
3. **Defect**: Students with 70/75 in theory but 5/25 in practical received `B+` instead of `NG`.
   - **Fix**: Implemented the official CDC 2078 component passing logic forcing `NG (0.0 GPA)` whenever either component falls below pass marks.
4. **Defect**: Academic promotion overwrote active enrollment rather than archiving it.
   - **Fix**: Implemented `AcademicService.promoteStudents` which transitions the past year enrollment to `GRADUATED` and creates a new enrollment record for the next academic year.

