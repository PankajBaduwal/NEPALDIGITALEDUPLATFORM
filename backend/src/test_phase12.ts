import mongoose from 'mongoose';
import {
  Institution,
  User,
  SubscriptionPlan,
  InstitutionSubscription,
  SubscriptionEntitlement,
  Invoice,
  Payment,
  SubscriptionHistory,
  Class,
  StudentEnrollment,
} from './models';
import { SubscriptionsService } from './modules/subscriptions/subscriptions.service';
import { PaymentGatewayFactory } from './common/services/payment-gateway';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nepal_edu_ecosystem';

async function runPhase12Tests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🇳🇵 NEPAL DIGITAL EDUCATION PLATFORM — PHASE 12 TEST SUITE');
  console.log('   Subscription, Packages, Entitlements & Licensing Engine');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB.');
    }

    // ─────────────────────────────────────────────────────────────────
    // SETUP: Fixtures & Super Admin
    // ─────────────────────────────────────────────────────────────────
    console.log('[SETUP] Initializing Fixtures & Seeding Default Packages...');
    let superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    if (!superAdmin) {
      superAdmin = await User.create({
        email: 'superadmin.licensing@nepaledu.gov.np',
        username: 'superadmin_licensing',
        passwordHash: 'hash',
        fullName: 'Nepal Licensing Officer',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      });
    }

    let institution = await Institution.findOne({ emisCode: 'P12-LIC-001' });
    if (!institution) {
      institution = await Institution.create({
        name: 'Shree Himalaya Secondary School',
        emisCode: 'P12-LIC-001',
        province: 'Koshi Province',
        district: 'Sankhuwasabha',
        localLevel: 'Khandbari Municipality',
        type: 'COMMUNITY',
        status: 'ACTIVE',
      });
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 1: Configurable Packages (Foundation, Middle School, Secondary)
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 1] Testing Subscription Packages (Foundation, Middle School, Secondary)...');
    await SubscriptionsService.seedDefaultNepalPlans();

    const plans = await SubscriptionsService.listPlans();
    const foundationPlan = plans.find((p) => p.code === 'FOUNDATION');
    const middlePlan = plans.find((p) => p.code === 'MIDDLE_SCHOOL');
    const secondaryPlan = plans.find((p) => p.code === 'SECONDARY');

    if (!foundationPlan || !middlePlan || !secondaryPlan) {
      throw new Error('Mandatory Nepal CDC subscription packages not found.');
    }

    console.log(`✅ Default Nepal Packages Verified:`);
    console.log(`   1. ${foundationPlan.name}: Classes ${foundationPlan.applicableGrades.join(', ')} (NPR ${foundationPlan.pricing.annualPriceNpr}/yr)`);
    console.log(`   2. ${middlePlan.name}: Classes ${middlePlan.applicableGrades.join(', ')} (NPR ${middlePlan.pricing.annualPriceNpr}/yr)`);
    console.log(`   3. ${secondaryPlan.name}: Classes ${secondaryPlan.applicableGrades.join(', ')} (NPR ${secondaryPlan.pricing.annualPriceNpr}/yr)`);

    // Verify non-hardcoded pricing: Super Admin updates Foundation pricing
    const newPrice = 38500;
    const updatedFoundation = await SubscriptionsService.updatePlan(foundationPlan.id, {
      pricing: { ...foundationPlan.pricing, annualPriceNpr: newPrice },
    });

    if (updatedFoundation.pricing.annualPriceNpr === newPrice) {
      console.log(`✅ Dynamic Pricing Verified: Super Admin updated Foundation price to NPR ${newPrice}.`);
    } else {
      throw new Error('Plan pricing update failed.');
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 2: Subscription Assignment & Automatic Invoice Generation
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 2] Testing Subscription Assignment & Invoice Generation...');
    const assignResult = await SubscriptionsService.assignSubscription({
      institutionId: institution._id.toString(),
      planId: foundationPlan._id.toString(),
      durationMonths: 12,
      billingCycle: 'ANNUAL',
      assignedBy: superAdmin._id.toString(),
      notes: 'Pilot grant for primary block Classes 1–5',
    });

    const activeSub = assignResult.subscription;
    const autoInvoice = assignResult.invoice;

    if (activeSub && activeSub.status === 'ACTIVE' && autoInvoice) {
      console.log(`✅ Subscription Assigned: ${activeSub.planCode} (Status: ${activeSub.status})`);
      console.log(`   Start: ${activeSub.startDate.toISOString().split('T')[0]} | End: ${activeSub.endDate.toISOString().split('T')[0]}`);
      console.log(`   Grace Period End: ${activeSub.gracePeriodEndDate.toISOString().split('T')[0]}`);
      console.log(`✅ Automatic Invoice Generated: ${autoInvoice.invoiceNumber} (Total: NPR ${autoInvoice.totalAmountNpr})`);
    } else {
      throw new Error('Subscription assignment or invoice generation failed.');
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 3: Subscription Entitlements Engine & Grade Access Control
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 3] Testing Backend Entitlement Checks & Grade Access Control...');
    const entitlements = await SubscriptionsService.getInstitutionEntitlements(institution._id.toString());

    console.log(`✅ Entitlements Loaded:`);
    console.log(`   Included Grades: [${entitlements.allowedGrades.join(', ')}]`);
    console.log(`   Days Remaining: ${entitlements.daysRemaining} days`);
    console.log(`   Simulations: ${entitlements.hasSimulations} | Smart Board: ${entitlements.hasSmartBoard}`);

    // Grade 3 check -> Must be TRUE (in Classes 1–5)
    const grade3Entitled = await SubscriptionsService.isGradeEntitled(institution._id.toString(), 3);
    if (grade3Entitled) {
      console.log(`✅ Grade Entitlement: Class 3 access GRANTED (Included in Foundation).`);
    } else {
      throw new Error('Class 3 should be entitled under Foundation plan.');
    }

    // Grade 10 check -> Must be FALSE (Grade 10 requires Secondary or K12)
    const grade10Entitled = await SubscriptionsService.isGradeEntitled(institution._id.toString(), 10);
    if (!grade10Entitled) {
      console.log(`✅ Grade Entitlement: Class 10 access DENIED (Requires Secondary Package).`);
    } else {
      throw new Error('Class 10 should NOT be entitled under Foundation plan.');
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 4: Provider-Agnostic Payment Integration (Khalti & eSewa)
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 4] Testing Provider-Agnostic Payment Gateways & Verification...');

    // 4A: Khalti Initiation
    const khaltiInit = await SubscriptionsService.initiatePayment({
      invoiceId: autoInvoice._id.toString(),
      gateway: 'KHALTI',
      customerEmail: 'principal.himalaya@nepaledu.gov.np',
      returnUrl: 'https://nepaledu.gov.np/payment/callback',
    });

    if (khaltiInit.payment && khaltiInit.initResult.paymentUrl?.includes('khalti.com')) {
      console.log(`✅ Khalti Gateway Initialized:`);
      console.log(`   Payment Reference: ${khaltiInit.payment.paymentReference}`);
      console.log(`   Redirect URL: ${khaltiInit.initResult.paymentUrl}`);
    } else {
      throw new Error('Khalti payment initiation failed.');
    }

    // 4B: eSewa Initiation
    const esewaGateway = PaymentGatewayFactory.getGateway('ESEWA');
    const esewaInit = await esewaGateway.initiatePayment({
      invoiceId: autoInvoice._id.toString(),
      amountNpr: autoInvoice.totalAmountNpr,
      paymentReference: `PAY-ESEWA-${Date.now()}`,
      institutionName: institution.name,
    });

    if (esewaInit.additionalData?.signature) {
      console.log(`✅ eSewa Gateway Initialized: Verified HMAC-SHA256 signature generation.`);
    } else {
      throw new Error('eSewa payment initiation failed.');
    }

    // 4C: Backend Payment Callback Verification
    const verifyResult = await SubscriptionsService.verifyPayment({
      paymentReference: khaltiInit.payment.paymentReference,
      gatewayTransactionId: 'KHALTI_TXN_88492019',
      verifiedBy: superAdmin._id.toString(),
    });

    if (verifyResult.isSuccess && verifyResult.payment.status === 'COMPLETED') {
      const refreshedInvoice = await Invoice.findById(autoInvoice._id);
      if (refreshedInvoice?.status === 'PAID') {
        console.log(`✅ Backend Payment Verified: Payment reference ${verifyResult.payment.paymentReference} marked COMPLETED.`);
        console.log(`✅ Invoice Paid: Status transitioned to PAID on ${refreshedInvoice.paidDate?.toISOString().split('T')[0]}.`);
      } else {
        throw new Error('Invoice status did not transition to PAID.');
      }
    } else {
      throw new Error('Payment verification failed.');
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 5: Super Admin Lifecycle Actions (Extend, Suspend, Reactivate)
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 5] Testing Super Admin Subscription Lifecycle Controls...');

    // 5A: Extend by 6 months
    const extendedSub = await SubscriptionsService.extendSubscription({
      subscriptionId: activeSub._id.toString(),
      additionalMonths: 6,
      reason: 'Term extension granted by Ministry of Education',
      performedBy: superAdmin._id.toString(),
    });
    console.log(`✅ Subscription Extended: New End Date ${extendedSub.endDate.toISOString().split('T')[0]}`);

    // 5B: Suspend
    const suspendedSub = await SubscriptionsService.suspendSubscription({
      subscriptionId: activeSub._id.toString(),
      reason: 'Administrative compliance audit pending',
      performedBy: superAdmin._id.toString(),
    });
    if (suspendedSub.status === 'SUSPENDED') {
      console.log(`✅ Subscription Suspended: Reason: "${suspendedSub.suspendedReason}"`);
    } else {
      throw new Error('Subscription suspension failed.');
    }

    // 5C: Reactivate
    const reactivatedSub = await SubscriptionsService.activateSubscription({
      subscriptionId: activeSub._id.toString(),
      reason: 'Compliance verified by Super Admin',
      performedBy: superAdmin._id.toString(),
    });
    if (reactivatedSub.status === 'ACTIVE') {
      console.log(`✅ Subscription Reactivated: Status restored to ACTIVE.`);
    } else {
      throw new Error('Subscription reactivation failed.');
    }

    // 5D: Renewal Monitoring Dashboard
    const renewalDash = await SubscriptionsService.getRenewalDashboard();
    console.log(`✅ Renewal Dashboard Loaded: Active: ${renewalDash.activeCount} | Grace Period: ${renewalDash.gracePeriodCount} | Expired: ${renewalDash.expiredCount}`);

    // ─────────────────────────────────────────────────────────────────
    // TEST 6: Grace Period & Student Account Preservation
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 6] Testing Grace Period Handling & Student Data Preservation...');

    // Create a student in this institution
    let studentUser = await User.findOne({ email: 'student.preserved@himalaya.edu.np' });
    if (!studentUser) {
      studentUser = await User.create({
        institutionId: institution._id,
        email: 'student.preserved@himalaya.edu.np',
        username: 'student_preserved',
        passwordHash: 'hash',
        fullName: 'Milan Shrestha',
        role: 'STUDENT',
        status: 'ACTIVE',
      });
    }

    // Simulate expired subscription
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 20); // 20 days ago (past 15 days grace period)

    await InstitutionSubscription.findByIdAndUpdate(activeSub._id, {
      endDate: pastDate,
      gracePeriodEndDate: new Date(pastDate.getTime() + 15 * 86400000), // also past
      status: 'EXPIRED',
    });

    const expiredEntitlements = await SubscriptionsService.getInstitutionEntitlements(institution._id.toString());
    if (expiredEntitlements.isExpired) {
      console.log(`✅ Expiry Detection: Subscription marked EXPIRED after grace period elapsed.`);
    } else {
      throw new Error('Subscription was not detected as expired.');
    }

    // VERIFY CRITICAL REQUIREMENT: Student records MUST NOT BE DELETED
    const preservedStudent = await User.findById(studentUser._id);
    if (preservedStudent && preservedStudent.status === 'ACTIVE') {
      console.log(`✅ Account Preservation Validated: Student ${preservedStudent.fullName} record is preserved! (NOT DELETED).`);
    } else {
      throw new Error('CRITICAL ERROR: Student record was deleted or corrupted on subscription expiry!');
    }

    // Restore subscription to active for live platform usage
    await SubscriptionsService.activateSubscription({
      subscriptionId: activeSub._id.toString(),
      reason: 'Test suite cleanup: restored to active',
      performedBy: superAdmin._id.toString(),
    });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎉 ALL 6/6 PHASE 12 SUBSCRIPTION & LICENSING TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ Phase 12 Test Failed:', err);
    process.exit(1);
  }
}

runPhase12Tests();
