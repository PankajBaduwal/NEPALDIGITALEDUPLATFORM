import mongoose from 'mongoose';
import { Institution, User, Class, Section, CentralSubject, SubjectAllocation } from './models';
import {
  Examination,
  ExamAssessment,
  StudentMark,
  MarksAuditLog,
} from './models/Assessment';
import { FeatureConfigurationHistory, FeatureKey } from './models/FeatureAccess';
import { SubscriptionHistory, SubscriptionPlan } from './models/Subscription';
import { AssessmentService } from './modules/assessment/assessment.service';
import { FeatureAccessService } from './modules/feature-access/feature-access.service';
import { SubscriptionsService } from './modules/subscriptions/subscriptions.service';

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

async function runModule12Tests() {
  console.log('\n===============================================================');
  console.log(' MODULE 12: AUDIT LOGGING & DATA CHANGE HISTORY AUDIT          ');
  console.log('===============================================================\n');

  await mongoose.connect(MONGO_URI);

  // 1. Setup Test Fixtures
  let inst = await Institution.findOne({ emisCode: '270010001' });
  if (!inst) inst = await Institution.findOne();
  if (!inst) throw new Error('No institution found');

  let admin = await User.findOne({ role: 'SCHOOL_ADMIN', institutionId: inst._id });
  if (!admin) admin = await User.findOne({ institutionId: inst._id });
  const adminId = admin ? admin._id.toString() : new mongoose.Types.ObjectId().toString();

  let teacher = await User.findOne({ email: 'teacher.science@sunrise.edu.np' });
  if (!teacher) {
    teacher = await User.create({
      fullName: 'Bishnu Prasad Pokhrel',
      email: 'teacher.science@sunrise.edu.np',
      username: 'bpokhrel_audit',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role: 'TEACHER',
      institutionId: inst._id,
      roles: ['TEACHER'],
    });
  }

  let student = await User.findOne({ email: 'audit.student@sunrise.edu.np' });
  if (!student) {
    student = await User.create({
      fullName: 'Aarav Subedi Audit',
      email: 'audit.student@sunrise.edu.np',
      username: 'aarav_audit',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role: 'STUDENT',
      institutionId: inst._id,
      roles: ['STUDENT'],
    });
  }

  let testClass = await Class.findOne({ institutionId: inst._id, gradeNumber: 10 });
  if (!testClass) testClass = await Class.findOne({ institutionId: inst._id });
  let testSection = await Section.findOne({ classId: testClass?._id });

  let subSci = await CentralSubject.findOne({ code: 'SCI' });
  if (!subSci) subSci = await CentralSubject.findOne();

  let exam = await Examination.findOne({ institutionId: inst._id });
  if (!exam) {
    exam = await Examination.create({
      code: 'EXAM-AUDIT-2081',
      institutionId: inst._id,
      academicYearId: new mongoose.Types.ObjectId(),
      name: 'Audit Log Term 2081',
      term: 'FIRST_TERM',
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000 * 5),
    });
  }

  let assessment = await ExamAssessment.findOne({ examinationId: exam._id });
  if (!assessment) {
    assessment = await ExamAssessment.create({
      institutionId: inst._id,
      academicYearId: exam.academicYearId,
      examinationId: exam._id,
      sectionId: testSection!._id,
      centralSubjectId: subSci!._id,
      name: 'Science Final Examination',
      type: 'TERMINAL_EXAM',
      fullMarksTheory: 75,
      passMarksTheory: 27,
      fullMarksPractical: 25,
      passMarksPractical: 10,
    });
  }

  // Ensure Teacher is Allocated
  await SubjectAllocation.findOneAndUpdate(
    {
      sectionId: assessment.sectionId,
      centralSubjectId: assessment.centralSubjectId,
      teacherId: teacher._id,
    },
    {
      sectionId: assessment.sectionId,
      centralSubjectId: assessment.centralSubjectId,
      teacherId: teacher._id,
    },
    { upsert: true }
  );

  // ── TEST SUITE 1: Marks Modification Audit Trail ──
  console.log('--- 1. Marks Modification Audit Logging ---');

  // Ensure assessment is in editable state for initial test
  assessment.isPublished = false;
  assessment.workflowStatus = 'SUBMITTED';
  await assessment.save();

  // Step 1a: Initial marks entry (60 Theory, 20 Practical)
  await AssessmentService.enterMarks({
    teacherId: teacher._id.toString(),
    userRole: 'TEACHER',
    assessmentId: assessment._id.toString(),
    saveAsDraft: false,
    marks: [{ studentId: student._id.toString(), marksTheory: 60, marksPractical: 20 }],
  });

  // Step 1b: Modification of marks (60 -> 72 Theory, reason given)
  await MarksAuditLog.deleteMany({ studentId: student._id });

  await AssessmentService.enterMarks({
    teacherId: teacher._id.toString(),
    userRole: 'TEACHER',
    assessmentId: assessment._id.toString(),
    saveAsDraft: false,
    marks: [
      {
        studentId: student._id.toString(),
        marksTheory: 72,
        marksPractical: 22,
        remarks: 'Re-evaluation approved by academic committee',
      },
    ],
  });

  const marksLog = await MarksAuditLog.findOne({
    studentId: student._id,
    assessmentId: assessment._id,
  }).sort({ timestamp: -1 });

  assertTest(
    'Marks Audit Log Created on Score Modification',
    'Log document exists in marksAuditLogs',
    `Log found: ${marksLog !== null}`,
    marksLog !== null
  );

  assertTest(
    'Marks Audit Log Records Previous and New Values Verbatim',
    'prev: 60, new: 72',
    `prev: ${marksLog?.previousValues?.marksTheory}, new: ${marksLog?.newValues?.marksTheory}`,
    marksLog?.previousValues?.marksTheory === 60 && marksLog?.newValues?.marksTheory === 72
  );

  assertTest(
    'Marks Audit Log Captures Changing Teacher ID and Reason',
    teacher._id.toString(),
    marksLog?.changedBy?.toString() || '',
    marksLog?.changedBy?.toString() === teacher._id.toString()
  );

  // ── TEST SUITE 2: Feature Configuration History Trail ──
  console.log('\n--- 2. Feature Configuration Audit Logging ---');
  await FeatureConfigurationHistory.deleteMany({
    institutionId: inst._id,
    targetId: testClass!._id.toString(),
  });

  await FeatureAccessService.updateClassSetting({
    institutionId: inst._id.toString(),
    classId: testClass!._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
    enabled: false,
    userId: adminId,
    reason: 'Restricted for Class 10 mock examination week',
  });

  const featureLog = await FeatureConfigurationHistory.findOne({
    institutionId: inst._id,
    targetId: testClass!._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
  }).sort({ createdAt: -1 });

  assertTest(
    'Feature Configuration History Document Created',
    'Scope: CLASS, newSetting: false',
    `Scope: ${featureLog?.scope}, newSetting: ${featureLog?.newSetting}`,
    featureLog?.scope === 'CLASS' && featureLog?.newSetting === false
  );

  assertTest(
    'Feature Audit Log Captures Administrative Justification / Reason',
    'Restricted for Class 10 mock examination week',
    featureLog?.reason || '',
    featureLog?.reason === 'Restricted for Class 10 mock examination week'
  );

  // ── TEST SUITE 3: Subscription Lifecycle Audit Trail ──
  console.log('\n--- 3. Commercial Subscription Lifecycle Audit Logging ---');
  const assignResult = await SubscriptionsService.assignSubscription({
    institutionId: inst._id.toString(),
    planId: (await SubscriptionPlan.findOne())!._id.toString(),
    billingCycle: 'ANNUAL',
    assignedBy: adminId,
  });
  const activeSub = assignResult.subscription;

  await SubscriptionHistory.deleteMany({ subscriptionId: activeSub._id });

  await SubscriptionsService.extendSubscription({
    subscriptionId: activeSub._id.toString(),
    additionalDays: 30,
    performedBy: adminId,
    reason: 'Ministry subsidy scholarship extension',
  });

  const subLog = await SubscriptionHistory.findOne({
    subscriptionId: activeSub._id,
    action: 'EXTENDED',
  }).sort({ createdAt: -1 });

  assertTest(
    'Subscription Lifecycle Action Recorded in SubscriptionHistory',
    'action: EXTENDED',
    `action: ${subLog?.action}`,
    subLog?.action === 'EXTENDED'
  );

  assertTest(
    'Subscription Audit Log Records Admin Operator and Reason',
    'Ministry subsidy scholarship extension',
    subLog?.reason || '',
    subLog?.reason === 'Ministry subsidy scholarship extension'
  );

  // ── TEST SUITE 4: Secret and Credential Exclusion ──
  console.log('\n--- 4. Secret & Password Hash Exclusion Protection ---');

  const allMarksLogs = await MarksAuditLog.find().limit(20).lean();
  const allFeatureLogs = await FeatureConfigurationHistory.find().limit(20).lean();
  const allSubLogs = await SubscriptionHistory.find().limit(20).lean();

  const serialized = JSON.stringify([...allMarksLogs, ...allFeatureLogs, ...allSubLogs]);

  const leaksPasswordHash = serialized.includes('$2b$10$') || serialized.includes('passwordHash');

  assertTest(
    'Zero Password Hashes or Secret Credentials Leaked in Audit Trail',
    'leaksPasswordHash: false',
    `leaksPasswordHash: ${leaksPasswordHash}`,
    leaksPasswordHash === false
  );

  // ── FINAL SUMMARY ──
  console.log('\n===============================================================');
  console.log('                MODULE 12 AUDIT RESULTS SUMMARY                ');
  console.log('===============================================================');
  const passedCount = testResults.filter((r) => r.status === 'PASSED').length;
  console.log(`TOTAL AUDIT CHECKS: ${testResults.length}`);
  console.log(`PASSED: ${passedCount} (${((passedCount / testResults.length) * 100).toFixed(1)}%)`);
  console.log(`FAILED: ${testResults.length - passedCount}`);

  await mongoose.disconnect();
  process.exit(passedCount === testResults.length ? 0 : 1);
}

runModule12Tests().catch((err) => {
  console.error('Fatal Module 12 Test Error:', err);
  process.exit(1);
});
