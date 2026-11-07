import mongoose from 'mongoose';
import { Institution, User, Class, Section, CentralSubject, SubjectAllocation } from './models';
import {
  Examination,
  ExamAssessment,
  StudentMark,
  Assignment,
  AssignmentSubmission,
  AttendanceSession,
  AttendanceRecord,
} from './models/Assessment';
import { AssessmentService } from './modules/assessment/assessment.service';
import { StudentService } from './modules/student/student.service';
import { FeatureAccessService } from './modules/feature-access/feature-access.service';
import { FeatureKey } from './models/FeatureAccess';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nepal_edu_ecosystem';

interface TestResult {
  title: string;
  expected: string;
  actual: string;
  status: 'PASSED' | 'FAILED';
  notes?: string;
}

const testResults: TestResult[] = [];

function assertTest(title: string, expected: string, actual: string, condition: boolean, notes?: string) {
  const status = condition ? 'PASSED' : 'FAILED';
  testResults.push({ title, expected, actual, status, notes });
  const icon = condition ? '✅' : '❌';
  console.log(`${icon} [${status}] ${title}`);
  if (!condition) {
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual:   ${actual}`);
  }
}

async function runModule11Tests() {
  console.log('\n===============================================================');
  console.log(' MODULE 11: CONCURRENT USERS & DATA CONSISTENCY AUDIT          ');
  console.log('===============================================================\n');

  await mongoose.connect(MONGO_URI);

  // 1. Setup Test Fixtures
  let inst = await Institution.findOne({ emisCode: '270010001' });
  if (!inst) inst = await Institution.findOne();
  if (!inst) throw new Error('No institution found');

  let teacherScience = await User.findOne({ email: 'teacher.science@sunrise.edu.np' });
  if (!teacherScience) {
    teacherScience = await User.create({
      fullName: 'Bishnu Prasad Pokhrel',
      email: 'teacher.science@sunrise.edu.np',
      username: 'bpokhrel_sci',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role: 'TEACHER',
      institutionId: inst._id,
      roles: ['TEACHER'],
    });
  }

  let teacherMath = await User.findOne({ email: 'teacher.math@sunrise.edu.np' });
  if (!teacherMath) {
    teacherMath = await User.create({
      fullName: 'Hari Krishna Sharma',
      email: 'teacher.math@sunrise.edu.np',
      username: 'hsharma_math',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role: 'TEACHER',
      institutionId: inst._id,
      roles: ['TEACHER'],
    });
  }

  let student = await User.findOne({ email: 'concurrency.student@sunrise.edu.np' });
  if (!student) {
    student = await User.create({
      fullName: 'Aarav Subedi Concurrency',
      email: 'concurrency.student@sunrise.edu.np',
      username: 'aarav_concur',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role: 'STUDENT',
      institutionId: inst._id,
      roles: ['STUDENT'],
    });
  }

  let testClass = await Class.findOne({ institutionId: inst._id, gradeNumber: 10 });
  if (!testClass) testClass = await Class.findOne({ institutionId: inst._id });

  let testSection = await Section.findOne({ classId: testClass?._id });

  // Ensure features enabled
  await FeatureAccessService.updateInstitutionSetting({
    institutionId: inst._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS,
    enabled: true,
    userId: teacherScience._id.toString(),
  });
  await FeatureAccessService.updateInstitutionSetting({
    institutionId: inst._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
    enabled: true,
    userId: teacherScience._id.toString(),
  });

  // Subjects
  let subSci = await CentralSubject.findOne({ code: 'SCI' });
  if (!subSci) subSci = await CentralSubject.findOne();
  let subMath = await CentralSubject.findOne({ code: 'MATH' });
  if (!subMath) subMath = await CentralSubject.findOne();

  // ── TEST SUITE 1: Compound Indexes Verification ──
  console.log('--- 1. Database Compound Unique Indexes Verification ---');
  await StudentMark.syncIndexes();
  await AssignmentSubmission.syncIndexes();

  const markIndexes = await StudentMark.collection.indexes();
  const hasMarkCompoundIndex = markIndexes.some(
    (idx) => idx.key.assessmentId === 1 && idx.key.studentId === 1 && idx.unique === true
  );

  assertTest(
    'StudentMark Collection Has Compound Unique Index on (assessmentId, studentId)',
    'Unique index on { assessmentId: 1, studentId: 1 }',
    hasMarkCompoundIndex ? 'Compound unique index exists' : 'Index missing',
    hasMarkCompoundIndex === true
  );

  const asgnIndexes = await AssignmentSubmission.collection.indexes();
  const hasAsgnCompoundIndex = asgnIndexes.some(
    (idx) => idx.key.assignmentId === 1 && idx.key.studentId === 1 && idx.unique === true
  );

  assertTest(
    'AssignmentSubmission Collection Has Compound Unique Index on (assignmentId, studentId)',
    'Unique index on { assignmentId: 1, studentId: 1 }',
    hasAsgnCompoundIndex ? 'Compound unique index exists' : 'Index missing',
    hasAsgnCompoundIndex === true
  );

  // ── TEST SUITE 2: Concurrent Marks Entry by Multiple Subject Teachers ──
  console.log('\n--- 2. Simultaneous Marks Entry Across Subjects ---');

  let exam = await Examination.findOne({ institutionId: inst._id, name: 'Concurrency Test Term 2081' });
  if (!exam) {
    exam = await Examination.create({
      code: 'EXAM-CONCUR-2081',
      institutionId: inst._id,
      academicYearId: new mongoose.Types.ObjectId(),
      name: 'Concurrency Test Term 2081',
      term: 'FIRST_TERM',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 5),
    });
  }

  let assessSci = await ExamAssessment.findOne({ examinationId: exam._id, name: 'Science Theory' });
  if (!assessSci) {
    assessSci = await ExamAssessment.create({
      institutionId: inst._id,
      academicYearId: exam.academicYearId,
      examinationId: exam._id,
      sectionId: testSection!._id,
      centralSubjectId: subSci!._id,
      name: 'Science Theory',
      type: 'TERMINAL_EXAM',
      fullMarksTheory: 75,
      passMarksTheory: 27,
      fullMarksPractical: 25,
      passMarksPractical: 10,
    });
  }

  let assessMath = await ExamAssessment.findOne({ examinationId: exam._id, name: 'Mathematics Theory' });
  if (!assessMath) {
    assessMath = await ExamAssessment.create({
      institutionId: inst._id,
      academicYearId: exam.academicYearId,
      examinationId: exam._id,
      sectionId: testSection!._id,
      centralSubjectId: subMath!._id,
      name: 'Mathematics Theory',
      type: 'TERMINAL_EXAM',
      fullMarksTheory: 75,
      passMarksTheory: 27,
      fullMarksPractical: 25,
      passMarksPractical: 10,
    });
  }

  // Ensure Teachers are Allocated to the exact assessment section and subject
  await SubjectAllocation.findOneAndUpdate(
    {
      sectionId: assessSci.sectionId,
      centralSubjectId: assessSci.centralSubjectId,
      teacherId: teacherScience._id,
    },
    {
      sectionId: assessSci.sectionId,
      centralSubjectId: assessSci.centralSubjectId,
      teacherId: teacherScience._id,
    },
    { upsert: true }
  );

  await SubjectAllocation.findOneAndUpdate(
    {
      sectionId: assessMath.sectionId,
      centralSubjectId: assessMath.centralSubjectId,
      teacherId: teacherMath._id,
    },
    {
      sectionId: assessMath.sectionId,
      centralSubjectId: assessMath.centralSubjectId,
      teacherId: teacherMath._id,
    },
    { upsert: true }
  );

  // Clear marks for this test
  await StudentMark.deleteMany({
    assessmentId: { $in: [assessSci._id, assessMath._id] },
    studentId: student._id,
  });

  // Launch simultaneous concurrent marks update requests (3 for Science, 3 for Math)
  const concurrentMarksPromises = [
    // Teacher Science entries
    AssessmentService.enterMarks({
      teacherId: teacherScience._id.toString(),
      userRole: 'TEACHER',
      institutionId: inst._id.toString(),
      assessmentId: assessSci._id.toString(),
      saveAsDraft: false,
      marks: [{ studentId: student._id.toString(), marksTheory: 65, marksPractical: 22 }],
    }),
    AssessmentService.enterMarks({
      teacherId: teacherScience._id.toString(),
      userRole: 'TEACHER',
      institutionId: inst._id.toString(),
      assessmentId: assessSci._id.toString(),
      saveAsDraft: false,
      marks: [{ studentId: student._id.toString(), marksTheory: 68, marksPractical: 23 }],
    }),
    AssessmentService.enterMarks({
      teacherId: teacherScience._id.toString(),
      userRole: 'TEACHER',
      institutionId: inst._id.toString(),
      assessmentId: assessSci._id.toString(),
      saveAsDraft: false,
      marks: [{ studentId: student._id.toString(), marksTheory: 70, marksPractical: 24 }],
    }),
    // Teacher Math entries
    AssessmentService.enterMarks({
      teacherId: teacherMath._id.toString(),
      userRole: 'TEACHER',
      institutionId: inst._id.toString(),
      assessmentId: assessMath._id.toString(),
      saveAsDraft: false,
      marks: [{ studentId: student._id.toString(), marksTheory: 72, marksPractical: 25 }],
    }),
    AssessmentService.enterMarks({
      teacherId: teacherMath._id.toString(),
      userRole: 'TEACHER',
      institutionId: inst._id.toString(),
      assessmentId: assessMath._id.toString(),
      saveAsDraft: false,
      marks: [{ studentId: student._id.toString(), marksTheory: 74, marksPractical: 25 }],
    }),
    AssessmentService.enterMarks({
      teacherId: teacherMath._id.toString(),
      userRole: 'TEACHER',
      institutionId: inst._id.toString(),
      assessmentId: assessMath._id.toString(),
      saveAsDraft: false,
      marks: [{ studentId: student._id.toString(), marksTheory: 75, marksPractical: 25 }],
    }),
  ];

  const results = await Promise.allSettled(concurrentMarksPromises);
  const allFulfilled = results.every((r) => r.status === 'fulfilled');

  assertTest(
    'Simultaneous Concurrent Marks Submissions Resolve Without Deadlocks or Crashes',
    'All promises fulfilled',
    allFulfilled ? 'All fulfilled' : 'Failures detected',
    allFulfilled === true
  );

  const sciMarksCount = await StudentMark.countDocuments({
    assessmentId: assessSci._id,
    studentId: student._id,
  });
  const mathMarksCount = await StudentMark.countDocuments({
    assessmentId: assessMath._id,
    studentId: student._id,
  });

  assertTest(
    'Atomic Upsert Guarantees Exactly 1 Science Mark Document for Student',
    'Count: 1',
    `Count: ${sciMarksCount}`,
    sciMarksCount === 1
  );

  assertTest(
    'Atomic Upsert Guarantees Exactly 1 Math Mark Document for Student',
    'Count: 1',
    `Count: ${mathMarksCount}`,
    mathMarksCount === 1
  );

  // ── TEST SUITE 3: Concurrent Rapid Assignment Submissions ──
  console.log('\n--- 3. Rapid Duplicate Assignment Submissions Prevention ---');

  let assignment = await Assignment.findOne({ title: 'Concurrent Physics Assignment' });
  if (!assignment) {
    assignment = await Assignment.create({
      institutionId: inst._id,
      teacherId: teacherScience._id,
      classId: testClass!._id,
      sectionId: testSection!._id,
      centralSubjectId: subSci!._id,
      title: 'Concurrent Physics Assignment',
      subject: 'Science',
      description: 'Test rapid concurrent submissions',
      dueDate: new Date(Date.now() + 86400000 * 5),
      allowLateSubmission: false,
      maxScore: 100,
      academicYear: '2081',
    });
  }

  await AssignmentSubmission.deleteMany({ assignmentId: assignment._id, studentId: student._id });

  // Student rapidly clicks "Submit" 5 times at the exact same millisecond
  const rapidSubmissions = [1, 2, 3, 4, 5].map((i) =>
    StudentService.submitAssignment(
      student._id.toString(),
      inst._id.toString(),
      assignment!._id.toString(),
      {
        content: `Submission attempt #${i}`,
        fileUrl: `https://storage.cloud/submission_${i}.pdf`,
      }
    )
  );

  const subResults = await Promise.allSettled(rapidSubmissions);
  const successfulSubmissions = subResults.filter((r) => r.status === 'fulfilled');

  assertTest(
    'Rapid Duplicate Submissions Handled Gracefully',
    'At least 1 successfully recorded',
    `Fulfilled: ${successfulSubmissions.length}`,
    successfulSubmissions.length >= 1
  );

  const finalSubCount = await AssignmentSubmission.countDocuments({
    assignmentId: assignment._id,
    studentId: student._id,
  });

  assertTest(
    'Final Assignment Submissions in DB Strictly Equals 1 (Zero Duplicate Rows)',
    'Document count: 1',
    `Document count: ${finalSubCount}`,
    finalSubCount === 1
  );

  // ── FINAL SUMMARY ──
  console.log('\n===============================================================');
  console.log('                MODULE 11 AUDIT RESULTS SUMMARY                ');
  console.log('===============================================================');
  const passedCount = testResults.filter((r) => r.status === 'PASSED').length;
  console.log(`TOTAL AUDIT CHECKS: ${testResults.length}`);
  console.log(`PASSED: ${passedCount} (${((passedCount / testResults.length) * 100).toFixed(1)}%)`);
  console.log(`FAILED: ${testResults.length - passedCount}`);

  await mongoose.disconnect();
  process.exit(passedCount === testResults.length ? 0 : 1);
}

runModule11Tests().catch((err) => {
  console.error('Fatal Module 11 Test Error:', err);
  process.exit(1);
});
