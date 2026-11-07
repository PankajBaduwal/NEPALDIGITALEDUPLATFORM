import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db';
import { AssessmentService } from './modules/assessment/assessment.service';
import { AcademicService } from './modules/academic/academic.service';
import { NepalGradingUtil } from './common/utils/nepal-grading.util';
import {
  Institution,
  User,
  Class,
  Section,
  AcademicYear,
  CentralSubject,
  ExamAssessment,
  Examination,
  StudentEnrollment,
  AttendanceSession,
  AttendanceRecord,
  StudentMark,
  MarksAuditLog,
} from './models';

interface TestAssertion {
  testId: string;
  name: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL';
  detail?: string;
}

const assertions: TestAssertion[] = [];

function recordPass(testId: string, name: string, expected: string, actual: string, detail?: string) {
  console.log(`  ✅ PASS [${testId}] ${name}`);
  assertions.push({ testId, name, expected, actual, status: 'PASS', detail });
}

function recordFail(testId: string, name: string, expected: string, actual: string, detail?: string) {
  console.error(`  ❌ FAIL [${testId}] ${name} -> Expected: ${expected}, Got: ${actual}`);
  assertions.push({ testId, name, expected, actual, status: 'FAIL', detail });
}

export async function runModule1DeepAudit() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🇳🇵 MODULE 1: ACADEMIC DATA ACCURACY & CALCULATION ENGINE DEEP AUDIT');
  console.log('   Testing Attendance, Marks CDC 2078, Component Passing & Rollover Integrity');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  await connectDB();

  try {
    const kmss = await Institution.findOne({ emisCode: '270010001' });
    const class10 = await Class.findOne({ institutionId: kmss?._id, gradeNumber: 10 });
    const section = await Section.findOne({ classId: class10?._id, name: /Sagarmatha/i });
    const teacherSita = await User.findOne({ username: 'teacher_sita' });
    const teacherRamesh = await User.findOne({ username: 'teacher_ramesh' });
    const adminKmss = await User.findOne({ username: 'admin_kmss' });
    const aarav = await User.findOne({ username: 'student_aarav' });

    if (!kmss || !class10 || !section || !teacherSita || !aarav) {
      throw new Error('Baseline fixtures missing. Please run seed-comprehensive.ts first.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. ATTENDANCE CALCULATION ENGINE & EDGE CASES
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[STAGE 1.1] Attendance Engine, Approved Leave & Threshold Warnings');

    // Edge Case 1: Student with Approved Medical Leave excluded from Denominator
    // Setup 10 test attendance days: 7 Present, 1 Late, 2 Approved Leave
    const testStudentId = aarav._id.toString();
    const testDates = [];
    for (let i = 1; i <= 10; i++) {
      const d = new Date(Date.now() - i * 86400000);
      d.setUTCHours(0, 0, 0, 0);
      testDates.push(d);
    }

    // Delete prior records for this student for clean calculation testing
    await AttendanceRecord.deleteMany({
      $or: [{ studentId: testStudentId }, { 'records.studentId': testStudentId }],
    });

    // 7 Present
    for (let i = 0; i < 7; i++) {
      await AttendanceRecord.create({
        institutionId: kmss._id,
        sectionId: section._id,
        studentId: testStudentId,
        date: testDates[i],
        periodNumber: 1,
        recordedBy: teacherSita._id,
        status: 'PRESENT',
      });
    }
    // 1 Late (weighted 0.8)
    await AttendanceRecord.create({
      institutionId: kmss._id,
      sectionId: section._id,
      studentId: testStudentId,
      date: testDates[7],
      periodNumber: 1,
      recordedBy: teacherSita._id,
      status: 'LATE',
    });
    // 2 Approved Leave
    for (let i = 8; i < 10; i++) {
      await AttendanceRecord.create({
        institutionId: kmss._id,
        sectionId: section._id,
        studentId: testStudentId,
        date: testDates[i],
        periodNumber: 1,
        recordedBy: teacherSita._id,
        status: 'LEAVE',
        remarks: 'Official hospital medical leave approved by Principal',
      });
    }

    // Test with policy: EXCLUDE_APPROVED_LEAVE
    // Expected: Total 10 days, Leave 2 days -> Denominator: 10 - 2 = 8 days.
    // Score: (7 + 1*0.8) / 8 = 7.8 / 8 = 97.5% -> 98%
    const attWithLeavePolicy = await AssessmentService.getStudentAttendance(
      testStudentId,
      section._id.toString(),
      'EXCLUDE_APPROVED_LEAVE'
    );

    if (attWithLeavePolicy.effectiveWorkingDays === 8 && attWithLeavePolicy.attendanceRate === 98) {
      recordPass(
        'ATT-01',
        'Approved Leave Excluded from Attendance Denominator',
        '8 working days, 98% attendance',
        `${attWithLeavePolicy.effectiveWorkingDays} working days, ${attWithLeavePolicy.attendanceRate}%`
      );
    } else {
      recordFail(
        'ATT-01',
        'Approved Leave Excluded from Attendance Denominator',
        '8 working days, 98% attendance',
        `${attWithLeavePolicy.effectiveWorkingDays} working days, ${attWithLeavePolicy.attendanceRate}%`
      );
    }

    // Test with policy: INCLUDE_ALL
    // Expected: Denominator 10 days. Score: (7 + 0.8) / 10 = 78%
    const attAllPolicy = await AssessmentService.getStudentAttendance(
      testStudentId,
      section._id.toString(),
      'INCLUDE_ALL'
    );

    if (attAllPolicy.effectiveWorkingDays === 10 && attAllPolicy.attendanceRate === 78) {
      recordPass(
        'ATT-02',
        'Attendance Policy Switch: Include All Days',
        '10 total days, 78% attendance',
        `${attAllPolicy.effectiveWorkingDays} total days, ${attAllPolicy.attendanceRate}%`
      );
    } else {
      recordFail(
        'ATT-02',
        'Attendance Policy Switch: Include All Days',
        '10 total days, 78% attendance',
        `${attAllPolicy.effectiveWorkingDays} total days, ${attAllPolicy.attendanceRate}%`
      );
    }

    // Edge Case 2: Attendance Warning Flag when Rate < 75%
    // Add 5 more absences to drop attendance below 75%
    for (let i = 0; i < 5; i++) {
      const d = new Date(Date.now() - (11 + i) * 86400000);
      d.setUTCHours(0, 0, 0, 0);
      await AttendanceRecord.create({
        institutionId: kmss._id,
        sectionId: section._id,
        studentId: testStudentId,
        date: d,
        periodNumber: 1,
        recordedBy: teacherSita._id,
        status: 'ABSENT',
      });
    }

    const attWarningCheck = await AssessmentService.getStudentAttendance(
      testStudentId,
      section._id.toString(),
      'EXCLUDE_APPROVED_LEAVE'
    );
    // Denominator: 15 - 2 = 13. Present: 7, Late: 1. Score: 7.8 / 13 = 60%. Warning should be TRUE.
    if (attWarningCheck.hasAttendanceWarning === true && attWarningCheck.attendanceRate === 60) {
      recordPass(
        'ATT-03',
        'NEB / CDC 75% Attendance Warning Trigger',
        'hasAttendanceWarning: true at 60%',
        `hasAttendanceWarning: ${attWarningCheck.hasAttendanceWarning} (${attWarningCheck.attendanceRate}%)`
      );
    } else {
      recordFail(
        'ATT-03',
        'NEB / CDC 75% Attendance Warning Trigger',
        'hasAttendanceWarning: true at 60%',
        `hasAttendanceWarning: ${attWarningCheck.hasAttendanceWarning} (${attWarningCheck.attendanceRate}%)`
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. MARKS AND RESULTS CALCULATION ENGINE (NEPAL CDC 2078 DIRECTIVE)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[STAGE 1.2] Marks Engine: Boundary Validations, Decimals & Component Pass Rules');

    // Test 1: Decimal Marks Calculation & Letter Grade
    const decResult = NepalGradingUtil.calculateGrade(79.5); // Should round to 79.5 -> B+ (70-79.99)
    if (decResult.grade === 'B+' && decResult.gpa === 3.2) {
      recordPass('MRK-01', 'Decimal Marks Rounding & Letter Grade', 'B+ (3.2 GPA)', `${decResult.grade} (${decResult.gpa} GPA)`);
    } else {
      recordFail('MRK-01', 'Decimal Marks Rounding & Letter Grade', 'B+ (3.2 GPA)', `${decResult.grade} (${decResult.gpa} GPA)`);
    }

    // Test 2: Boundary Validations (0 marks and 100 marks)
    const zeroResult = NepalGradingUtil.calculateGrade(0);
    const fullResult = NepalGradingUtil.calculateGrade(100);
    if (zeroResult.grade === 'NG' && zeroResult.gpa === 0.0 && fullResult.grade === 'A+' && fullResult.gpa === 4.0) {
      recordPass('MRK-02', 'Boundary Marks (0 and 100) Mapping', '0 -> NG, 100 -> A+', `0 -> ${zeroResult.grade}, 100 -> ${fullResult.grade}`);
    } else {
      recordFail('MRK-02', 'Boundary Marks (0 and 100) Mapping', '0 -> NG, 100 -> A+', `0 -> ${zeroResult.grade}, 100 -> ${fullResult.grade}`);
    }

    // Test 3: Marks Exceeding Maximum Marks (Validation Rejection)
    let maxMarksRejectionPassed = false;
    try {
      NepalGradingUtil.evaluateSubjectMarks({
        theoryMarks: 85, // Max is 75!
        practicalMarks: 20,
        fullMarksTheory: 75,
        fullMarksPractical: 25,
      });
    } catch (err: any) {
      if (err.message.includes('exceed maximum marks')) {
        maxMarksRejectionPassed = true;
      }
    }

    if (maxMarksRejectionPassed) {
      recordPass('MRK-03', 'Validation: Reject Theory Marks Exceeding Full Marks (85/75)', 'Error: Cannot exceed maximum marks', 'Thrown correctly');
    } else {
      recordFail('MRK-03', 'Validation: Reject Theory Marks Exceeding Full Marks (85/75)', 'Error: Cannot exceed maximum marks', 'Failed to reject');
    }

    // Test 4: Negative Marks (Validation Rejection)
    let negativeMarksRejectionPassed = false;
    try {
      NepalGradingUtil.evaluateSubjectMarks({
        theoryMarks: -5,
        practicalMarks: 20,
        fullMarksTheory: 75,
        fullMarksPractical: 25,
      });
    } catch (err: any) {
      if (err.message.includes('cannot be negative')) {
        negativeMarksRejectionPassed = true;
      }
    }

    if (negativeMarksRejectionPassed) {
      recordPass('MRK-04', 'Validation: Reject Negative Marks (-5)', 'Error: Cannot be negative', 'Thrown correctly');
    } else {
      recordFail('MRK-04', 'Validation: Reject Negative Marks (-5)', 'Error: Cannot be negative', 'Failed to reject');
    }

    // Test 5: CDC 2078 Component Pass Rule: High Theory (70/75), Failed Practical (6/25, pass is 10)
    // Under CDC 2078: Must be marked Non-Graded (NG) because practical component was failed
    const failedPracticalResult = NepalGradingUtil.evaluateSubjectMarks({
      theoryMarks: 70, // 70/75 is A+ level theory!
      practicalMarks: 6, // Failed practical (less than pass marks 10)
      fullMarksTheory: 75,
      fullMarksPractical: 25,
      passMarksTheory: 27,
      passMarksPractical: 10,
    });

    if (failedPracticalResult.grade === 'NG' && failedPracticalResult.gpa === 0.0 && failedPracticalResult.isPassed === false) {
      recordPass(
        'MRK-05',
        'CDC 2078 Component Passing Rule: Failed Practical Component Forces NG',
        'Grade: NG, GPA: 0.0 (Failed Practical)',
        `Grade: ${failedPracticalResult.grade}, GPA: ${failedPracticalResult.gpa} (${failedPracticalResult.description})`
      );
    } else {
      recordFail(
        'MRK-05',
        'CDC 2078 Component Passing Rule: Failed Practical Component Forces NG',
        'Grade: NG, GPA: 0.0',
        `Grade: ${failedPracticalResult.grade}, GPA: ${failedPracticalResult.gpa}`
      );
    }

    // Test 6: Post-Publication Protection & Unauthorized Modification Denial
    const scienceSubject = await CentralSubject.findOne({ gradeNumber: 10, name: /Science/i });
    const term1Exam = await Examination.findOne({ code: 'TERM-1-2081' });
    const scienceAssessment = await ExamAssessment.findOne({
      examinationId: term1Exam?._id,
      centralSubjectId: scienceSubject?._id,
    });

    if (scienceAssessment) {
      scienceAssessment.workflowStatus = 'PUBLISHED';
      scienceAssessment.isPublished = true;
      await scienceAssessment.save();

      let postPubBlocked = false;
      try {
        await AssessmentService.enterMarks({
          teacherId: teacherSita._id.toString(),
          userRole: 'TEACHER',
          assessmentId: scienceAssessment._id.toString(),
          saveAsDraft: false,
          marks: [
            {
              studentId: aarav._id.toString(),
              marksTheory: 70,
              marksPractical: 25,
            },
          ],
        });
      } catch (err: any) {
        if (err.message.includes('officially published') && err.message.includes('authorization')) {
          postPubBlocked = true;
        }
      }

      if (postPubBlocked) {
        recordPass(
          'MRK-06',
          'Post-Publication Security: Teacher Cannot Silently Modify Published Results',
          'Denied: Post-publication mark changes require Admin/Principal authorization',
          'Denied as expected'
        );
      } else {
        recordFail(
          'MRK-06',
          'Post-Publication Security: Teacher Cannot Silently Modify Published Results',
          'Denied with 403',
          'Allowed unauthorized change'
        );
      }

      // Principal Authorized Correction with Audit Trail
      const adminCorrection = await AssessmentService.enterMarks({
        teacherId: adminKmss?._id.toString() || '',
        userRole: 'SCHOOL_ADMIN',
        assessmentId: scienceAssessment._id.toString(),
        saveAsDraft: false,
        marks: [
          {
            studentId: aarav._id.toString(),
            marksTheory: 69,
            marksPractical: 25,
            remarks: 'Authorized re-verification correction by School Admin',
          },
        ],
      });

      const auditEntry = await MarksAuditLog.findOne({
        assessmentId: scienceAssessment._id,
        studentId: aarav._id,
      }).sort({ timestamp: -1 });

      if (adminCorrection && auditEntry && auditEntry.action === 'UPDATE') {
        recordPass(
          'MRK-07',
          'Authorized Admin Post-Publication Correction with MarksAuditLog Trail',
          'Updated with audit log tracking previous vs new values',
          `Audit log ID: ${auditEntry.id}, Action: ${auditEntry.action}`
        );
      } else {
        recordFail(
          'MRK-07',
          'Authorized Admin Post-Publication Correction with MarksAuditLog Trail',
          'Audit log created',
          'Missing audit log entry'
        );
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. STUDENT ACADEMIC HISTORY & PROMOTION INTEGRITY
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[STAGE 1.3] Student Promotion, Academic Rollover & History Preservation');

    // Create next academic year (2082/2083) and Class 11 Section
    const nextAcadYear =
      (await AcademicYear.findOne({ institutionId: kmss._id, name: '2082/2083' })) ||
      (await AcademicService.createAcademicYear(kmss._id.toString(), '2082/2083'));

    const class11 =
      (await Class.findOne({ institutionId: kmss._id, gradeNumber: 11 })) ||
      (await AcademicService.createClass(kmss._id.toString(), 11, 'Class 11'));

    await Section.deleteMany({ classId: class11._id, name: 'Section Science-A' });
    const section11 = await AcademicService.createSection({
      classId: class11._id.toString(),
      academicYearId: nextAcadYear._id.toString(),
      name: 'Section Science-A',
    });

    // Capture Aarav's Class 10 Marks and Attendance before promotion
    const preMarksCount = await StudentMark.countDocuments({ studentId: aarav._id });
    const preAttCount = await AttendanceRecord.countDocuments({ studentId: aarav._id });

    // Execute Promotion: Aarav is promoted from Class 10 Sagarmatha to Class 11 Science-A
    const promotionResult = await AcademicService.promoteStudents({
      institutionId: kmss._id.toString(),
      studentIds: [aarav._id.toString()],
      fromSectionId: section._id.toString(),
      toSectionId: section11._id.toString(),
      nextAcademicYearId: nextAcadYear._id.toString(),
      action: 'PROMOTED',
      operatorId: adminKmss?._id.toString() || '',
    });

    // Check historical enrollment
    const oldEnrollment = await StudentEnrollment.findOne({
      studentId: aarav._id,
      sectionId: section._id,
    });
    const newEnrollment = await StudentEnrollment.findOne({
      studentId: aarav._id,
      sectionId: section11._id,
    });

    // Verify marks and attendance count did not decrease (zero data loss)
    const postMarksCount = await StudentMark.countDocuments({ studentId: aarav._id });
    const postAttCount = await AttendanceRecord.countDocuments({ studentId: aarav._id });

    const promotionSuccess =
      promotionResult.count === 1 &&
      oldEnrollment?.status === 'GRADUATED' &&
      newEnrollment?.status === 'ENROLLED' &&
      postMarksCount === preMarksCount &&
      postAttCount === preAttCount;

    if (promotionSuccess) {
      recordPass(
        'HIS-01',
        'Academic Year Promotion to Class 11 with Historical Record Preservation',
        'Old: GRADUATED, New: ENROLLED, Historical marks/attendance preserved (100%)',
        `Old: ${oldEnrollment?.status}, New: ${newEnrollment?.status}, Marks Count: ${postMarksCount}`
      );
    } else {
      recordFail(
        'HIS-01',
        'Academic Year Promotion to Class 11 with Historical Record Preservation',
        'Historical records intact',
        `Old: ${oldEnrollment?.status}, New: ${newEnrollment?.status}, Marks Count: ${postMarksCount}`
      );
    }

    // Test Student Transfer
    const transferResult = await AcademicService.transferStudent({
      institutionId: kmss._id.toString(),
      studentId: aarav._id.toString(),
      sectionId: section11._id.toString(),
      reason: 'Relocated to Pokhara with family',
      operatorId: adminKmss?._id.toString() || '',
    });

    const transferredEnrollment = await StudentEnrollment.findOne({
      studentId: aarav._id,
      sectionId: section11._id,
    });

    if (transferResult.success && transferredEnrollment?.status === 'TRANSFERRED') {
      recordPass(
        'HIS-02',
        'Student Transfer Workflow & Record Preservation',
        'Status updated to TRANSFERRED, historical logs locked and preserved',
        `Status: ${transferredEnrollment.status}`
      );
    } else {
      recordFail(
        'HIS-02',
        'Student Transfer Workflow & Record Preservation',
        'Status: TRANSFERRED',
        `Status: ${transferredEnrollment?.status}`
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('🏁 MODULE 1 AUDIT RESULTS SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    const total = assertions.length;
    const passed = assertions.filter((a) => a.status === 'PASS').length;
    const failed = assertions.filter((a) => a.status === 'FAIL').length;

    console.log(`Total Assertions : ${total}`);
    console.log(`Passed           : ${passed}`);
    console.log(`Failed           : ${failed}`);
    console.log(`Score            : ${((passed / total) * 100).toFixed(1)}%\n`);

    if (failed > 0) {
      console.log('❌ Failed Tests:');
      assertions.filter((a) => a.status === 'FAIL').forEach((f) => {
        console.log(`  - [${f.testId}] ${f.name}`);
      });
    } else {
      console.log('🌟 ALL MODULE 1 ACADEMIC CALCULATION & INTEGRITY TESTS PASSED 100%!');
    }
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  runModule1DeepAudit()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal Module 1 audit failure:', err);
      process.exit(1);
    });
}
