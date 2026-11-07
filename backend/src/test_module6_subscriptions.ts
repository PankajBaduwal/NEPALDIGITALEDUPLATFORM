import mongoose from 'mongoose';
import { Institution, User } from './models';
import {
  SubscriptionPlan,
  InstitutionSubscription,
  SubscriptionEntitlement,
} from './models/Subscription';
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

async function runModule6Tests() {
  console.log('\n===============================================================');
  console.log(' MODULE 6: SUBSCRIPTION & FEATURE ENTITLEMENT ENGINE AUDIT     ');
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

  let adminUser = await User.findOne({ role: 'SUPER_ADMIN' });
  if (!adminUser) {
    adminUser = await User.findOne();
  }
  const adminId = adminUser ? adminUser._id.toString() : new mongoose.Types.ObjectId().toString();

  // ── TEST SUITE 1: Package Tiers & Seeding ──
  console.log('\n--- 1. Package Tiers and Applicable Grades Verification ---');
  await SubscriptionsService.seedDefaultNepalPlans();

  const foundationPlan = await SubscriptionPlan.findOne({ code: 'FOUNDATION' });
  const middlePlan = await SubscriptionPlan.findOne({ code: 'MIDDLE_SCHOOL' });
  const secondaryPlan = await SubscriptionPlan.findOne({ code: 'SECONDARY' });
  const k12Plan = await SubscriptionPlan.findOne({ code: 'K12_ALL' });

  const numSort = (arr: number[]) => [...arr].sort((a, b) => a - b);

  assertTest(
    'Foundation Plan Applicable Grades (Classes 1–5)',
    '1,2,3,4,5',
    numSort(foundationPlan?.applicableGrades || []).join(','),
    JSON.stringify(numSort(foundationPlan?.applicableGrades || [])) === JSON.stringify([1, 2, 3, 4, 5])
  );

  assertTest(
    'Middle School Plan Applicable Grades (Classes 6–8)',
    '6,7,8',
    numSort(middlePlan?.applicableGrades || []).join(','),
    JSON.stringify(numSort(middlePlan?.applicableGrades || [])) === JSON.stringify([6, 7, 8])
  );

  assertTest(
    'Secondary Plan Applicable Grades (Classes 9–12)',
    '9,10,11,12',
    numSort(secondaryPlan?.applicableGrades || []).join(','),
    JSON.stringify(numSort(secondaryPlan?.applicableGrades || [])) === JSON.stringify([9, 10, 11, 12])
  );

  assertTest(
    'K-12 Comprehensive Plan Applicable Grades (Classes 1–12)',
    '1,2,3,4,5,6,7,8,9,10,11,12',
    numSort(k12Plan?.applicableGrades || []).join(','),
    (k12Plan?.applicableGrades || []).length === 12
  );

  // ── TEST SUITE 2: Grade Entitlement Boundaries ──
  console.log('\n--- 2. Grade Entitlement Enforcement ---');
  // Clear prior subscriptions for clean test
  await InstitutionSubscription.deleteMany({ institutionId: inst._id });
  await SubscriptionEntitlement.deleteMany({ institutionId: inst._id });

  // Assign Foundation Plan
  await SubscriptionsService.assignSubscription({
    institutionId: inst._id.toString(),
    planId: foundationPlan!._id.toString(),
    billingCycle: 'ANNUAL',
    assignedBy: adminId,
  });

  const isClass3Allowed = await SubscriptionsService.isGradeEntitled(inst._id.toString(), 3);
  const isClass10Blocked = await SubscriptionsService.isGradeEntitled(inst._id.toString(), 10);

  assertTest(
    'Foundation Plan Grants Access to Class 3 (Within 1–5)',
    'true',
    String(isClass3Allowed),
    isClass3Allowed === true
  );

  assertTest(
    'Foundation Plan Blocks Access to Class 10 (Outside 1–5)',
    'false',
    String(isClass10Blocked),
    isClass10Blocked === false
  );

  // Switch to Secondary Plan
  await InstitutionSubscription.deleteMany({ institutionId: inst._id });
  await SubscriptionsService.assignSubscription({
    institutionId: inst._id.toString(),
    planId: secondaryPlan!._id.toString(),
    billingCycle: 'ANNUAL',
    assignedBy: adminId,
  });

  const isClass10SecondaryAllowed = await SubscriptionsService.isGradeEntitled(inst._id.toString(), 10);
  const isClass4SecondaryBlocked = await SubscriptionsService.isGradeEntitled(inst._id.toString(), 4);

  assertTest(
    'Secondary Plan Grants Access to Class 10 (Within 9–12)',
    'true',
    String(isClass10SecondaryAllowed),
    isClass10SecondaryAllowed === true
  );

  assertTest(
    'Secondary Plan Blocks Access to Class 4 (Outside 9–12)',
    'false',
    String(isClass4SecondaryBlocked),
    isClass4SecondaryBlocked === false
  );

  // ── TEST SUITE 3: Grace Period Mid-Session Expiration Handling ──
  console.log('\n--- 3. Grace Period Mid-Session Expiry Safety ---');
  // Set subscription where endDate is 2 days ago, but grace period is 5 days ahead
  const pastEndDate = new Date(Date.now() - 2 * 86400000);
  const futureGraceDate = new Date(Date.now() + 5 * 86400000);

  await InstitutionSubscription.findOneAndUpdate(
    { institutionId: inst._id },
    {
      endDate: pastEndDate,
      gracePeriodEndDate: futureGraceDate,
      status: 'ACTIVE',
    }
  );

  const graceEntitlements = await SubscriptionsService.getInstitutionEntitlements(inst._id.toString());

  assertTest(
    'Expired End Date within Grace Window Enters GRACE_PERIOD Status',
    'status: GRACE_PERIOD, inGracePeriod: true',
    `status: ${graceEntitlements.status}, inGracePeriod: ${graceEntitlements.inGracePeriod}`,
    graceEntitlements.status === 'GRACE_PERIOD' && graceEntitlements.inGracePeriod === true
  );

  assertTest(
    'Grace Period Maintains Active Service Without Disruption',
    'hasActiveSubscription: true, isExpired: false',
    `hasActiveSubscription: ${graceEntitlements.hasActiveSubscription}, isExpired: ${graceEntitlements.isExpired}`,
    graceEntitlements.hasActiveSubscription === true && graceEntitlements.isExpired === false
  );

  // ── TEST SUITE 4: Hard Expiration Safety & Historical Preservation ──
  console.log('\n--- 4. Hard Expiry (Past Grace Period) Safety ---');
  const deepPastGraceDate = new Date(Date.now() - 3 * 86400000);

  await InstitutionSubscription.findOneAndUpdate(
    { institutionId: inst._id },
    {
      endDate: new Date(Date.now() - 10 * 86400000),
      gracePeriodEndDate: deepPastGraceDate,
    }
  );

  const expiredEntitlements = await SubscriptionsService.getInstitutionEntitlements(inst._id.toString());
  const isClass10Expired = await SubscriptionsService.isGradeEntitled(inst._id.toString(), 10);

  assertTest(
    'Past Grace Period Enters EXPIRED Status and Blocks Content',
    'status: EXPIRED, isExpired: true, isGradeEntitled: false',
    `status: ${expiredEntitlements.status}, isExpired: ${expiredEntitlements.isExpired}, isGradeEntitled: ${isClass10Expired}`,
    expiredEntitlements.status === 'EXPIRED' &&
      expiredEntitlements.isExpired === true &&
      isClass10Expired === false
  );

  const rawEntitlementDoc = await SubscriptionEntitlement.findOne({ institutionId: inst._id });
  assertTest(
    'Academic History & Records Retained During Full Expiry (Zero Student Data Deletion)',
    'isAcademicManagementEnabled: true',
    `isAcademicManagementEnabled: ${rawEntitlementDoc?.isAcademicManagementEnabled}`,
    rawEntitlementDoc?.isAcademicManagementEnabled === true
  );

  // ── TEST SUITE 5: Super Admin Extension & Suspension Lifecycle ──
  console.log('\n--- 5. Subscription Extension, Suspension & Reactivation ---');
  const activeSub = await InstitutionSubscription.findOne({ institutionId: inst._id });

  // 5a. Extension
  const extendedSub = await SubscriptionsService.extendSubscription({
    subscriptionId: activeSub!._id.toString(),
    additionalDays: 45,
    performedBy: adminId,
  });

  const extendedEntitlements = await SubscriptionsService.getInstitutionEntitlements(inst._id.toString());

  assertTest(
    'Subscription Extended by 45 Days Restores ACTIVE Status',
    'status: ACTIVE, isExpired: false, daysRemaining >= 40',
    `status: ${extendedEntitlements.status}, isExpired: ${extendedEntitlements.isExpired}, daysRemaining: ${extendedEntitlements.daysRemaining}`,
    extendedEntitlements.status === 'ACTIVE' &&
      extendedEntitlements.isExpired === false &&
      extendedEntitlements.daysRemaining >= 40
  );

  // 5b. Suspension
  await SubscriptionsService.suspendSubscription({
    subscriptionId: activeSub!._id.toString(),
    reason: 'Annual school compliance review pending',
    performedBy: adminId,
  });

  const suspendedEntitlements = await SubscriptionsService.getInstitutionEntitlements(inst._id.toString());
  assertTest(
    'Suspended Subscription Disables Entitlements',
    'status: SUSPENDED',
    `status: ${suspendedEntitlements.status}`,
    suspendedEntitlements.status === 'SUSPENDED'
  );

  // 5c. Reactivation
  await SubscriptionsService.activateSubscription({
    subscriptionId: activeSub!._id.toString(),
    performedBy: adminId,
  });

  const reactivatedEntitlements = await SubscriptionsService.getInstitutionEntitlements(inst._id.toString());
  assertTest(
    'Reactivated Subscription Successfully Restores Service',
    'status: ACTIVE',
    `status: ${reactivatedEntitlements.status}`,
    reactivatedEntitlements.status === 'ACTIVE'
  );

  // ── FINAL SUMMARY ──
  console.log('\n===============================================================');
  console.log('                 MODULE 6 AUDIT RESULTS SUMMARY                ');
  console.log('===============================================================');
  const passedCount = testResults.filter((r) => r.status === 'PASSED').length;
  console.log(`TOTAL AUDIT CHECKS: ${testResults.length}`);
  console.log(`PASSED: ${passedCount} (${((passedCount / testResults.length) * 100).toFixed(1)}%)`);
  console.log(`FAILED: ${testResults.length - passedCount}`);

  await mongoose.disconnect();
  process.exit(passedCount === testResults.length ? 0 : 1);
}

runModule6Tests().catch((err) => {
  console.error('Fatal Module 6 Test Error:', err);
  process.exit(1);
});
