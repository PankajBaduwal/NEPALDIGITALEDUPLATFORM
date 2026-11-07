import mongoose from 'mongoose';
import { Institution, User, Class, Section, StudentEnrollment } from './models';
import {
  FeatureKey,
  InstitutionFeatureSettings,
  ClassFeatureSettings,
  SectionFeatureSettings,
  StudentFeatureOverride,
} from './models/FeatureAccess';
import { FeatureAccessService } from './modules/feature-access/feature-access.service';
import { SubscriptionsService } from './modules/subscriptions/subscriptions.service';
import { SubscriptionPlan } from './models/Subscription';

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

async function runModule7Tests() {
  console.log('\n===============================================================');
  console.log(' MODULE 7: SCHOOL FEATURE CONFIGURATION & DEVICE ACCESS AUDIT  ');
  console.log('===============================================================\n');

  await mongoose.connect(MONGO_URI);

  // 1. Setup Test Fixtures
  let inst = await Institution.findOne({ emisCode: '270010001' });
  if (!inst) inst = await Institution.findOne();
  if (!inst) throw new Error('No institution found');

  let adminUser = await User.findOne({ role: 'SCHOOL_ADMIN', institutionId: inst._id });
  if (!adminUser) adminUser = await User.findOne({ institutionId: inst._id });
  const adminId = adminUser ? adminUser._id.toString() : new mongoose.Types.ObjectId().toString();

  // Ensure K-12 subscription is active so upper bound subscription does not mask hierarchy
  const k12Plan = await SubscriptionPlan.findOne({ code: 'K12_ALL' });
  if (k12Plan) {
    await SubscriptionsService.assignSubscription({
      institutionId: inst._id.toString(),
      planId: k12Plan._id.toString(),
      billingCycle: 'ANNUAL',
      assignedBy: adminId,
    });
  }

  // Classes & Sections
  let class8 = await Class.findOne({ institutionId: inst._id, gradeNumber: 8 });
  if (!class8) {
    class8 = await Class.create({
      institutionId: inst._id,
      name: 'Class 8',
      gradeNumber: 8,
      stream: 'GENERAL',
      academicYear: '2081',
    });
  }

  let class10 = await Class.findOne({ institutionId: inst._id, gradeNumber: 10 });
  if (!class10) {
    class10 = await Class.create({
      institutionId: inst._id,
      name: 'Class 10',
      gradeNumber: 10,
      stream: 'GENERAL',
      academicYear: '2081',
    });
  }

  let sec8A = await Section.findOne({ classId: class8._id, name: 'Section 8-A' });
  if (!sec8A) {
    sec8A = await Section.create({
      institutionId: inst._id,
      classId: class8._id,
      name: 'Section 8-A',
      academicYearId: new mongoose.Types.ObjectId(),
    });
  }

  let sec8B = await Section.findOne({ classId: class8._id, name: 'Section 8-B' });
  if (!sec8B) {
    sec8B = await Section.create({
      institutionId: inst._id,
      classId: class8._id,
      name: 'Section 8-B',
      academicYearId: new mongoose.Types.ObjectId(),
    });
  }

  // Student Enrollment
  let studentUser = await User.findOne({ email: 'aarav.featuretest@sunrise.edu.np' });
  if (!studentUser) {
    studentUser = await User.create({
      fullName: 'Aarav Subedi Test',
      email: 'aarav.featuretest@sunrise.edu.np',
      username: 'aarav_ftest',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role: 'STUDENT',
      institutionId: inst._id,
      roles: ['STUDENT'],
    });
  }

  let enrollment = await StudentEnrollment.findOne({ studentId: studentUser._id });
  if (!enrollment) {
    enrollment = await StudentEnrollment.create({
      studentId: studentUser._id,
      institutionId: inst._id,
      academicYearId: new mongoose.Types.ObjectId(),
      sectionId: sec8B._id,
      admissionNumber: 'ADM-2081-0812',
      rollNumber: 12,
      enrollmentStatus: 'ACTIVE',
      admissionDate: new Date('2024-04-15'),
    });
  }

  // Clear previous test settings
  await InstitutionFeatureSettings.deleteMany({ institutionId: inst._id });
  await ClassFeatureSettings.deleteMany({ institutionId: inst._id });
  await SectionFeatureSettings.deleteMany({ institutionId: inst._id });
  await StudentFeatureOverride.deleteMany({ institutionId: inst._id });

  // ── TEST SUITE 1: 5-Level Inheritance Resolution ──
  console.log('\n--- 1. 5-Level Hierarchy Precedence ---');

  // Level 1: Default from Platform Registry
  const resL1 = await FeatureAccessService.resolveFeatureAccess({
    institutionId: inst._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
  });
  assertTest(
    'Level 1: Platform Registry Fallback Applied',
    'source: PLATFORM_DEFAULT',
    `source: ${resL1.source}, enabled: ${resL1.effectiveEnabled}`,
    resL1.source === 'PLATFORM_DEFAULT'
  );

  // Level 2: Institution-Wide Default
  await FeatureAccessService.updateInstitutionSetting({
    institutionId: inst._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
    enabled: true,
    userId: adminId,
  });

  const resL2 = await FeatureAccessService.resolveFeatureAccess({
    institutionId: inst._id.toString(),
    classId: class10._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
  });
  assertTest(
    'Level 2: Institution Default Inherited by Class 10',
    'source: INSTITUTION_DEFAULT, enabled: true',
    `source: ${resL2.source}, enabled: ${resL2.effectiveEnabled}`,
    resL2.source === 'INSTITUTION_DEFAULT' && resL2.effectiveEnabled === true
  );

  // Level 3: Class-Wise Override (Class 8 disables online submissions)
  await FeatureAccessService.updateClassSetting({
    institutionId: inst._id.toString(),
    classId: class8._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
    enabled: false,
    userId: adminId,
    reason: 'Class 8 smartphone restriction policy',
  });

  const resL3 = await FeatureAccessService.resolveFeatureAccess({
    institutionId: inst._id.toString(),
    classId: class8._id.toString(),
    sectionId: sec8A._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
  });
  assertTest(
    'Level 3: Class 8 Override Overrules Institution Default',
    'source: CLASS_OVERRIDE, enabled: false',
    `source: ${resL3.source}, enabled: ${resL3.effectiveEnabled}`,
    resL3.source === 'CLASS_OVERRIDE' && resL3.effectiveEnabled === false
  );

  // Level 4: Section Override (Section 8-B grants exception for computer lab trials)
  await FeatureAccessService.updateSectionSetting({
    institutionId: inst._id.toString(),
    sectionId: sec8B._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
    enabled: true,
    userId: adminId,
    reason: 'Section 8-B computer lab pilot section',
  });

  const resL4 = await FeatureAccessService.resolveFeatureAccess({
    institutionId: inst._id.toString(),
    classId: class8._id.toString(),
    sectionId: sec8B._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
  });
  assertTest(
    'Level 4: Section 8-B Override Overrules Class 8 Default',
    'source: SECTION_OVERRIDE, enabled: true',
    `source: ${resL4.source}, enabled: ${resL4.effectiveEnabled}`,
    resL4.source === 'SECTION_OVERRIDE' && resL4.effectiveEnabled === true
  );

  // Level 5: Individual Student Override (Student Aarav in 8-B has a personal restriction)
  await FeatureAccessService.setStudentOverride({
    institutionId: inst._id.toString(),
    studentId: enrollment._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
    enabled: false,
    reason: 'Parent request: no personal device usage',
    userId: adminId,
  });

  const resL5 = await FeatureAccessService.resolveFeatureAccess({
    institutionId: inst._id.toString(),
    classId: class8._id.toString(),
    sectionId: sec8B._id.toString(),
    studentId: enrollment._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
  });
  assertTest(
    'Level 5: Student Override (Highest Precedence) Overrules Section Setting',
    'source: STUDENT_OVERRIDE, enabled: false',
    `source: ${resL5.source}, enabled: ${resL5.effectiveEnabled}`,
    resL5.source === 'STUDENT_OVERRIDE' && resL5.effectiveEnabled === false
  );

  // ── TEST SUITE 2: Reset Overrides Back to Inherited ──
  console.log('\n--- 2. Reset Overrides to Parent Hierarchy ---');
  await FeatureAccessService.resetOverrides({
    institutionId: inst._id.toString(),
    scope: 'STUDENT',
    targetId: enrollment._id.toString(),
    userId: adminId,
  });

  const resAfterStudentReset = await FeatureAccessService.resolveFeatureAccess({
    institutionId: inst._id.toString(),
    classId: class8._id.toString(),
    sectionId: sec8B._id.toString(),
    studentId: enrollment._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
  });
  assertTest(
    'Student Override Reset Restores Section-Level Setting (true)',
    'source: SECTION_OVERRIDE, enabled: true',
    `source: ${resAfterStudentReset.source}, enabled: ${resAfterStudentReset.effectiveEnabled}`,
    resAfterStudentReset.source === 'SECTION_OVERRIDE' && resAfterStudentReset.effectiveEnabled === true
  );

  // ── TEST SUITE 3: 4 Learning Modes Configuration ──
  console.log('\n--- 3. 4 School Learning Modes ---');

  // Mode A: SMARTBOARD_ONLY
  await FeatureAccessService.applyLearningMode({
    institutionId: inst._id.toString(),
    learningMode: 'SMARTBOARD_ONLY',
    userId: adminId,
  });

  const smartboardCheck = await FeatureAccessService.resolveFeatureAccess({
    institutionId: inst._id.toString(),
    featureKey: FeatureKey.SMARTBOARD,
  });
  const studentDashboardCheck = await FeatureAccessService.resolveFeatureAccess({
    institutionId: inst._id.toString(),
    featureKey: FeatureKey.STUDENT_DASHBOARD,
  });
  const studentOnlineSubCheck = await FeatureAccessService.resolveFeatureAccess({
    institutionId: inst._id.toString(),
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
  });

  assertTest(
    'SMARTBOARD_ONLY Mode Enables Smart Board Hub',
    'enabled: true',
    `enabled: ${smartboardCheck.effectiveEnabled}`,
    smartboardCheck.effectiveEnabled === true
  );

  assertTest(
    'SMARTBOARD_ONLY Mode Disables Student Personal Dashboard',
    'enabled: false',
    `enabled: ${studentDashboardCheck.effectiveEnabled}`,
    studentDashboardCheck.effectiveEnabled === false
  );

  assertTest(
    'SMARTBOARD_ONLY Mode Disables Student Online Submissions',
    'enabled: false',
    `enabled: ${studentOnlineSubCheck.effectiveEnabled}`,
    studentOnlineSubCheck.effectiveEnabled === false
  );

  // Mode B: FULL_DIGITAL
  await FeatureAccessService.applyLearningMode({
    institutionId: inst._id.toString(),
    learningMode: 'FULL_DIGITAL',
    userId: adminId,
  });

  const digitalStudentDash = await FeatureAccessService.resolveFeatureAccess({
    institutionId: inst._id.toString(),
    featureKey: FeatureKey.STUDENT_DASHBOARD,
  });
  const digitalAiStudent = await FeatureAccessService.resolveFeatureAccess({
    institutionId: inst._id.toString(),
    featureKey: FeatureKey.AI_STUDENT_ACCESS,
  });

  assertTest(
    'FULL_DIGITAL Mode Enables Student Dashboard and AI Tutor',
    'Dashboard: true, AI: true',
    `Dashboard: ${digitalStudentDash.effectiveEnabled}, AI: ${digitalAiStudent.effectiveEnabled}`,
    digitalStudentDash.effectiveEnabled === true && digitalAiStudent.effectiveEnabled === true
  );

  // Mode C: OFFLINE_FIRST
  await FeatureAccessService.applyLearningMode({
    institutionId: inst._id.toString(),
    learningMode: 'OFFLINE_FIRST',
    userId: adminId,
  });

  const offlineTextbook = await FeatureAccessService.resolveFeatureAccess({
    institutionId: inst._id.toString(),
    featureKey: FeatureKey.DIGITAL_TEXTBOOKS,
  });
  const offlineAi = await FeatureAccessService.resolveFeatureAccess({
    institutionId: inst._id.toString(),
    featureKey: FeatureKey.AI_STUDENT_ACCESS,
  });

  assertTest(
    'OFFLINE_FIRST Mode Retains Textbooks while Disabling AI Student Access',
    'Textbook: true, AI: false',
    `Textbook: ${offlineTextbook.effectiveEnabled}, AI: ${offlineAi.effectiveEnabled}`,
    offlineTextbook.effectiveEnabled === true && offlineAi.effectiveEnabled === false
  );

  // ── FINAL SUMMARY ──
  console.log('\n===============================================================');
  console.log('                 MODULE 7 AUDIT RESULTS SUMMARY                ');
  console.log('===============================================================');
  const passedCount = testResults.filter((r) => r.status === 'PASSED').length;
  console.log(`TOTAL AUDIT CHECKS: ${testResults.length}`);
  console.log(`PASSED: ${passedCount} (${((passedCount / testResults.length) * 100).toFixed(1)}%)`);
  console.log(`FAILED: ${testResults.length - passedCount}`);

  await mongoose.disconnect();
  process.exit(passedCount === testResults.length ? 0 : 1);
}

runModule7Tests().catch((err) => {
  console.error('Fatal Module 7 Test Error:', err);
  process.exit(1);
});
