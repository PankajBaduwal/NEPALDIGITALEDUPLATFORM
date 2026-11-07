import mongoose from 'mongoose';
import {
  Activity,
  ActivityQuestion,
  ActivityAssignment,
  ActivityAttempt,
  User,
  Institution,
  Class,
  Section,
  CentralSubject,
} from './models';
import { SimulationActivityService } from './modules/simulation-activity/simulation-activity.service';
import { StudentService } from './modules/student/student.service';
import { Assignment, AssignmentSubmission } from './models/Assessment';
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

async function runModule5Tests() {
  console.log('\n===============================================================');
  console.log(' MODULE 5: EXAMINATION, QUIZ AND ASSIGNMENT ENGINE DEEP AUDIT ');
  console.log('===============================================================\n');

  await mongoose.connect(MONGO_URI);

  // 1. Setup Test Fixtures
  let inst = await Institution.findOne({ emisCode: '270010001' });
  if (!inst) {
    inst = await Institution.findOne();
  }
  if (!inst) {
    throw new Error('No institution found in database');
  }

  let teacher = await User.findOne({ email: 'science.teacher@sunrise.edu.np' });
  if (!teacher) {
    teacher = await User.create({
      fullName: 'Bishnu Prasad Pokhrel',
      email: 'science.teacher@sunrise.edu.np',
      username: 'bpokhrel',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role: 'TEACHER',
      institutionId: inst._id,
      roles: ['TEACHER'],
    });
  }

  let student = await User.findOne({ email: 'exam.student@sunrise.edu.np' });
  if (!student) {
    student = await User.create({
      fullName: 'Aarav Subedi',
      email: 'exam.student@sunrise.edu.np',
      username: 'aarav_subedi',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role: 'STUDENT',
      institutionId: inst._id,
      roles: ['STUDENT'],
    });
  }

  let testClass = await Class.findOne({ institutionId: inst._id, gradeNumber: 10 });
  if (!testClass) {
    testClass = await Class.findOne({ institutionId: inst._id });
  }
  if (!testClass) {
    throw new Error('No class found for institution');
  }

  let testSection = await Section.findOne({ classId: testClass._id });
  if (!testSection) {
    throw new Error('No section found for class');
  }

  // Ensure feature access for student assignment submission
  await FeatureAccessService.updateInstitutionSetting({
    institutionId: inst._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS,
    enabled: true,
    userId: teacher._id.toString(),
  });
  await FeatureAccessService.updateInstitutionSetting({
    institutionId: inst._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
    enabled: true,
    userId: teacher._id.toString(),
  });

  // ── TEST SUITE 1: Automated Question Evaluation (MCQ, Numerical, Tolerance) ──
  console.log('\n--- 1. Automated Question Evaluation (MCQ & Numerical) ---');
  let activity = await Activity.findOne({ title: 'Physics Formative Quiz - Gravitation' });
  if (!activity) {
    activity = await Activity.create({
      code: 'ACT-QUIZ-GRAV-10',
      title: 'Physics Formative Quiz - Gravitation',
      description: 'Class 10 Unit 1 Gravitation Assessment',
      type: 'MCQ',
      subjectId: new mongoose.Types.ObjectId(),
      gradeLevels: [10],
      passingScore: 5,
    });
  }

  await ActivityQuestion.deleteMany({ activityId: activity._id });

  // Question 1: MCQ
  const qMcq = await ActivityQuestion.create({
    activityId: activity._id,
    questionNumber: 1,
    type: 'MCQ',
    prompt: 'What is the acceleration due to gravity on Earth?',
    points: 2,
    explanation: 'Acceleration due to gravity on Earth is approximately 9.8 m/s²',
    data: {
      options: [
        { id: 'opt_a', text: '8.9 m/s²', isCorrect: false },
        { id: 'opt_b', text: '9.8 m/s²', isCorrect: true },
        { id: 'opt_c', text: '10.8 m/s²', isCorrect: false },
      ],
    },
  });

  // Question 2: Numerical with Tolerance (9.8 +/- 0.2)
  const qNum = await ActivityQuestion.create({
    activityId: activity._id,
    questionNumber: 2,
    type: 'NUMERICAL',
    prompt: 'Enter the acceleration due to gravity value at sea level:',
    points: 3,
    explanation: 'Calculated g value is 9.8 m/s² with tolerance of 0.2 m/s²',
    data: {
      correctValue: 9.8,
      tolerance: 0.2,
    },
  });

  // Test 1a: Accurate Numerical Answer within Tolerance (9.75)
  const attemptResult1 = await SimulationActivityService.submitAttempt({
    studentId: student._id.toString(),
    studentName: student.fullName,
    institutionId: inst._id.toString(),
    classId: testClass._id.toString(),
    sectionId: testSection._id.toString(),
    activityId: activity._id.toString(),
    answers: [
      { questionId: qMcq._id.toString(), studentAnswer: 'opt_b' },
      { questionId: qNum._id.toString(), studentAnswer: '9.75' }, // within 9.8 +/- 0.2
    ],
    timeSpentSeconds: 120,
  });

  assertTest(
    'MCQ and Numerical Grading within Tolerance (9.75 for 9.8 ± 0.2)',
    'Score 5/5, passed true',
    `Score ${attemptResult1.totalScore}/${attemptResult1.maxScore}, passed ${attemptResult1.passed}`,
    attemptResult1.totalScore === 5 && attemptResult1.passed === true
  );

  // Test 1b: Numerical Answer Outside Tolerance (10.15)
  const attemptResult2 = await SimulationActivityService.submitAttempt({
    studentId: student._id.toString(),
    studentName: student.fullName,
    institutionId: inst._id.toString(),
    classId: testClass._id.toString(),
    sectionId: testSection._id.toString(),
    activityId: activity._id.toString(),
    answers: [
      { questionId: qMcq._id.toString(), studentAnswer: 'opt_b' }, // 2 pts
      { questionId: qNum._id.toString(), studentAnswer: '10.15' }, // outside 9.8 +/- 0.2 -> 0 pts
    ],
    timeSpentSeconds: 140,
  });

  assertTest(
    'Numerical Outside Tolerance Correctly Marked Wrong (10.15 for 9.8 ± 0.2)',
    'Score 2/5, passed false',
    `Score ${attemptResult2.totalScore}/${attemptResult2.maxScore}, passed ${attemptResult2.passed}`,
    attemptResult2.totalScore === 2 && attemptResult2.passed === false
  );

  // ── TEST SUITE 2: Quiz Attempt Limits Enforced ──
  console.log('\n--- 2. Quiz Attempt Limits Enforced ---');
  await ActivityAttempt.deleteMany({ studentId: student._id });

  const assignmentMaxAttempts = await SimulationActivityService.createAssignment(
    teacher._id.toString(),
    inst._id.toString(),
    {
      activityId: activity._id.toString(),
      classId: testClass._id.toString(),
      sectionId: testSection._id.toString(),
      maxAttempts: 2,
    }
  );

  // Attempt 1 of 2
  const att1 = await SimulationActivityService.submitAttempt({
    studentId: student._id.toString(),
    studentName: student.fullName,
    institutionId: inst._id.toString(),
    classId: testClass._id.toString(),
    sectionId: testSection._id.toString(),
    activityId: activity._id.toString(),
    assignmentId: assignmentMaxAttempts._id.toString(),
    answers: [{ questionId: qMcq._id.toString(), studentAnswer: 'opt_b' }],
  });

  assertTest(
    'Assignment Attempt 1: First attempt allowed',
    'Attempt recorded successfully',
    `Attempt recorded (ID: ${att1._id})`,
    att1._id !== undefined
  );

  // Attempt 2 of 2
  const att2 = await SimulationActivityService.submitAttempt({
    studentId: student._id.toString(),
    studentName: student.fullName,
    institutionId: inst._id.toString(),
    classId: testClass._id.toString(),
    sectionId: testSection._id.toString(),
    activityId: activity._id.toString(),
    assignmentId: assignmentMaxAttempts._id.toString(),
    answers: [{ questionId: qMcq._id.toString(), studentAnswer: 'opt_b' }],
  });

  assertTest(
    'Assignment Attempt 2: Second attempt allowed (at limit)',
    'Attempt recorded successfully',
    `Attempt recorded (ID: ${att2._id})`,
    att2._id !== undefined
  );

  // Attempt 3 of 2 (should be rejected)
  let attempt3Error = '';
  try {
    await SimulationActivityService.submitAttempt({
      studentId: student._id.toString(),
      studentName: student.fullName,
      institutionId: inst._id.toString(),
      classId: testClass._id.toString(),
      sectionId: testSection._id.toString(),
      activityId: activity._id.toString(),
      assignmentId: assignmentMaxAttempts._id.toString(),
      answers: [{ questionId: qMcq._id.toString(), studentAnswer: 'opt_b' }],
    });
  } catch (err: any) {
    attempt3Error = err.message || '';
  }

  assertTest(
    'Assignment Attempt 3: Rejected when maxAttempts (2) exceeded',
    'MAX_ATTEMPTS_EXCEEDED error thrown',
    attempt3Error,
    attempt3Error.includes('MAX_ATTEMPTS_EXCEEDED')
  );

  // ── TEST SUITE 3: Timer Expiry Handling ──
  console.log('\n--- 3. Timer Expiry Handling ---');
  const timedOutAttempt = await SimulationActivityService.submitAttempt({
    studentId: student._id.toString(),
    studentName: student.fullName,
    institutionId: inst._id.toString(),
    classId: testClass._id.toString(),
    sectionId: testSection._id.toString(),
    activityId: activity._id.toString(),
    answers: [{ questionId: qMcq._id.toString(), studentAnswer: 'opt_b' }],
    timeSpentSeconds: 1800,
    isTimedOut: true,
  });

  assertTest(
    'Timer Expiry Status Flag Recorded as TIMED_OUT',
    'status: TIMED_OUT',
    `status: ${timedOutAttempt.status}`,
    timedOutAttempt.status === 'TIMED_OUT'
  );

  // ── TEST SUITE 4: File Format and Assignment Policy Validations ──
  console.log('\n--- 4. Online Assignment Submission Rules & Validation ---');
  await Assignment.deleteMany({ institutionId: inst._id, title: { $regex: 'Term 1 Science' } });

  let centralSub = await CentralSubject.findOne({ grade: 10 });
  if (!centralSub) {
    centralSub = await CentralSubject.findOne();
  }
  const centralSubId = centralSub ? centralSub._id : new mongoose.Types.ObjectId();

  const validDueDate = new Date(Date.now() + 86400000 * 3); // 3 days ahead
  const expiredDueDate = new Date(Date.now() - 86400000 * 2); // 2 days ago

  const regularAssignment = await Assignment.create({
    institutionId: inst._id,
    teacherId: teacher._id,
    classId: testClass._id,
    sectionId: testSection._id,
    centralSubjectId: centralSubId,
    title: 'Term 1 Science Report',
    subject: 'Science',
    description: 'Submit Newton laws experimental report',
    dueDate: validDueDate,
    allowLateSubmission: false,
    maxScore: 100,
    academicYear: '2081',
  });

  // Test 4a: Permitted file type (.pdf)
  const pdfSub = await StudentService.submitAssignment(
    student._id.toString(),
    inst._id.toString(),
    regularAssignment._id.toString(),
    {
      content: 'Here is my physics report with observations.',
      fileUrl: 'https://cloud.nepalschool.edu/uploads/physics_report.pdf',
    }
  );

  assertTest(
    'Allowed Document Extension (.pdf) Successfully Accepted',
    'status SUBMITTED',
    `status ${pdfSub.status}`,
    pdfSub.status === 'SUBMITTED'
  );

  // Test 4b: Forbidden file extension (.exe or .sh)
  let fileExtError = '';
  try {
    await StudentService.submitAssignment(
      student._id.toString(),
      inst._id.toString(),
      regularAssignment._id.toString(),
      {
        content: 'Report with script attached.',
        fileUrl: 'https://cloud.nepalschool.edu/uploads/hack_tool.exe',
      }
    );
  } catch (err: any) {
    fileExtError = err.code || err.message;
  }

  assertTest(
    'Dangerous File Extension (.exe) Rejected',
    'INVALID_FILE_TYPE error',
    fileExtError,
    fileExtError === 'INVALID_FILE_TYPE'
  );

  // Test 4c: Deadline Passed with allowLateSubmission = false
  const strictExpiredAssignment = await Assignment.create({
    institutionId: inst._id,
    teacherId: teacher._id,
    classId: testClass._id,
    sectionId: testSection._id,
    centralSubjectId: centralSubId,
    title: 'Term 1 Science Strict Deadline',
    subject: 'Science',
    description: 'Class strict deadline practical',
    dueDate: expiredDueDate,
    allowLateSubmission: false,
    maxScore: 100,
    academicYear: '2081',
  });

  let deadlineError = '';
  try {
    await StudentService.submitAssignment(
      student._id.toString(),
      inst._id.toString(),
      strictExpiredAssignment._id.toString(),
      {
        content: 'Late physics work.',
        fileUrl: 'https://cloud.nepalschool.edu/uploads/late_report.pdf',
      }
    );
  } catch (err: any) {
    deadlineError = err.code || err.message;
  }

  assertTest(
    'Submission Past Deadline when Late Submission Prohibited is Rejected',
    'DEADLINE_PASSED error',
    deadlineError,
    deadlineError === 'DEADLINE_PASSED'
  );

  // Test 4d: Deadline Passed with allowLateSubmission = true -> Marked LATE
  const lenientExpiredAssignment = await Assignment.create({
    institutionId: inst._id,
    teacherId: teacher._id,
    classId: testClass._id,
    sectionId: testSection._id,
    centralSubjectId: centralSubId,
    title: 'Term 1 Science Lenient Deadline',
    subject: 'Science',
    description: 'Class lenient deadline practical',
    dueDate: expiredDueDate,
    allowLateSubmission: true,
    maxScore: 100,
    academicYear: '2081',
  });

  const lateSub = await StudentService.submitAssignment(
    student._id.toString(),
    inst._id.toString(),
    lenientExpiredAssignment._id.toString(),
    {
      content: 'Late physics work allowed.',
      fileUrl: 'https://cloud.nepalschool.edu/uploads/late_report.pdf',
    }
  );

  assertTest(
    'Submission Past Deadline when Late Submission Allowed is Marked LATE',
    'status: LATE',
    `status: ${lateSub.status}`,
    lateSub.status === 'LATE'
  );

  // Test 4e: Resubmission Over Already Graded Assignment is Prevented
  await AssignmentSubmission.findOneAndUpdate(
    { assignmentId: regularAssignment._id, studentId: student._id },
    { status: 'GRADED', score: 92, feedback: 'Excellent practical insights.' }
  );

  let gradedOverwriteError = '';
  try {
    await StudentService.submitAssignment(
      student._id.toString(),
      inst._id.toString(),
      regularAssignment._id.toString(),
      {
        content: 'Trying to sneak a corrected version.',
        fileUrl: 'https://cloud.nepalschool.edu/uploads/new_report.pdf',
      }
    );
  } catch (err: any) {
    gradedOverwriteError = err.code || err.message;
  }

  assertTest(
    'Resubmission on Already-Graded Assignment is Prevented',
    'ALREADY_GRADED error',
    gradedOverwriteError,
    gradedOverwriteError === 'ALREADY_GRADED'
  );

  // ── FINAL SUMMARY ──
  console.log('\n===============================================================');
  console.log('                 MODULE 5 AUDIT RESULTS SUMMARY                ');
  console.log('===============================================================');
  const passedCount = testResults.filter((r) => r.status === 'PASSED').length;
  console.log(`TOTAL AUDIT CHECKS: ${testResults.length}`);
  console.log(`PASSED: ${passedCount} (${((passedCount / testResults.length) * 100).toFixed(1)}%)`);
  console.log(`FAILED: ${testResults.length - passedCount}`);

  await mongoose.disconnect();
  process.exit(passedCount === testResults.length ? 0 : 1);
}

runModule5Tests().catch((err) => {
  console.error('Fatal Module 5 Test Error:', err);
  process.exit(1);
});
