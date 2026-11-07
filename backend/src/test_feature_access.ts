import mongoose from 'mongoose';
import {
  Institution,
  User,
  Class,
  Section,
  StudentEnrollment,
  SubscriptionPlan,
  InstitutionSubscription,
  InstitutionFeatureSettings,
  ClassFeatureSettings,
  SectionFeatureSettings,
  StudentFeatureOverride,
  StudentDeviceProfile,
  FeatureConfigurationHistory,
  FeatureKey,
} from './models';
import { FeatureAccessService } from './modules/feature-access/feature-access.service';
import { SubscriptionsService } from './modules/subscriptions/subscriptions.service';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nepal_edu_ecosystem';

async function runFeatureAccessTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🇳🇵 NEPAL DIGITAL EDUCATION PLATFORM — FEATURE CONFIGURATION TEST');
  console.log('   School-Wise & Class-Wise Access Control Engine (Section 19)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to MongoDB.');
    }

    // ─────────────────────────────────────────────────────────────────
    // SETUP: Institutions, Classes, Sections, Students & Packages
    // ─────────────────────────────────────────────────────────────────
    console.log('[SETUP] Initializing School Test Fixtures...');

    // Institution A (Main Test School)
    let schoolA = await Institution.findOne({ emisCode: 'EMIS-FA-001' });
    if (!schoolA) {
      schoolA = await Institution.create({
        name: 'Janata Secondary School, Morang',
        emisCode: 'EMIS-FA-001',
        type: 'COMMUNITY',
        province: 'Koshi',
        district: 'Morang',
        localLevel: 'Biratnagar Metropolitan',
        status: 'ACTIVE',
      });
    }

    // Institution B (Cross-Tenant School)
    let schoolB = await Institution.findOne({ emisCode: 'EMIS-FA-002' });
    if (!schoolB) {
      schoolB = await Institution.create({
        name: 'Bhanu Model Secondary School, Tanahun',
        emisCode: 'EMIS-FA-002',
        type: 'COMMUNITY',
        province: 'Gandaki',
        district: 'Tanahun',
        localLevel: 'Bhanu Municipality',
        status: 'ACTIVE',
      });
    }

    // Admin User
    let adminUser = await User.findOne({ username: 'admin_fa_test' });
    if (!adminUser) {
      adminUser = await User.create({
        email: 'admin.featureaccess@janataschool.edu.np',
        username: 'admin_fa_test',
        passwordHash: 'dummyhash',
        role: 'SCHOOL_ADMIN',
        fullName: 'Bishnu Prasad Pokharel',
        status: 'ACTIVE',
        institutionId: schoolA._id,
      });
    }

    // Classes 1 to 12 for School A
    const classesA: Record<number, any> = {};
    for (let g = 1; g <= 12; g++) {
      let cls = await Class.findOne({ institutionId: schoolA._id, gradeNumber: g });
      if (!cls) {
        cls = await Class.create({
          institutionId: schoolA._id,
          gradeNumber: g,
          name: `Class ${g}`,
          board: 'Nepal CDC',
          stream: g >= 11 ? 'SCIENCE' : 'GENERAL',
        });
      }
      classesA[g] = cls;
    }

    // Sections for Class 8 (Section A & Section B)
    let sec8A = await Section.findOne({ institutionId: schoolA._id, classId: classesA[8]._id, name: 'Sagarmatha' });
    if (!sec8A) {
      sec8A = await Section.create({
        institutionId: schoolA._id,
        classId: classesA[8]._id,
        academicYearId: new mongoose.Types.ObjectId(),
        name: 'Sagarmatha',
        medium: 'NEPALI',
        capacity: 45,
      });
    }

    let sec8B = await Section.findOne({ institutionId: schoolA._id, classId: classesA[8]._id, name: 'Annapurna' });
    if (!sec8B) {
      sec8B = await Section.create({
        institutionId: schoolA._id,
        classId: classesA[8]._id,
        academicYearId: new mongoose.Types.ObjectId(),
        name: 'Annapurna',
        medium: 'NEPALI',
        capacity: 45,
      });
    }

    // Student in Section 8A
    let studentUser = await User.findOne({ username: 'student_fa_milano' });
    if (!studentUser) {
      studentUser = await User.create({
        username: 'student_fa_milano',
        fullName: 'Milan Thapa',
        role: 'STUDENT',
        status: 'ACTIVE',
        institutionId: schoolA._id,
        passwordHash: 'dummy',
      });
    }

    let studentEnrollment = await StudentEnrollment.findOne({ studentId: studentUser._id });
    if (!studentEnrollment) {
      studentEnrollment = await StudentEnrollment.create({
        institutionId: schoolA._id,
        studentId: studentUser._id,
        sectionId: sec8A._id,
        academicYearId: sec8A.academicYearId,
        rollNumber: 15,
        admissionNumber: 'ADM-FA-2081-15',
        status: 'ENROLLED',
      });
    }

    // Clean up test feature overrides for pristine testing
    await InstitutionFeatureSettings.deleteMany({ institutionId: { $in: [schoolA._id, schoolB._id] } });
    await ClassFeatureSettings.deleteMany({ institutionId: { $in: [schoolA._id, schoolB._id] } });
    await SectionFeatureSettings.deleteMany({ institutionId: { $in: [schoolA._id, schoolB._id] } });
    await StudentFeatureOverride.deleteMany({ institutionId: { $in: [schoolA._id, schoolB._id] } });
    await InstitutionSubscription.deleteMany({ institutionId: { $in: [schoolA._id, schoolB._id] } });

    // Seed plans and assign K-12 to School A & B for initial tests
    await SubscriptionsService.seedDefaultNepalPlans();
    const k12Plan = await SubscriptionPlan.findOne({ tier: 'K12' });
    if (k12Plan) {
      await SubscriptionsService.assignSubscription({
        institutionId: schoolA._id.toString(),
        planId: k12Plan._id.toString(),
        assignedBy: adminUser._id.toString(),
      });
      await SubscriptionsService.assignSubscription({
        institutionId: schoolB._id.toString(),
        planId: k12Plan._id.toString(),
        assignedBy: adminUser._id.toString(),
      });
    }

    console.log('✅ Fixtures initialized successfully.\n');

    // ─────────────────────────────────────────────────────────────────
    // TEST 1: School-wide Student Dashboard Disabled
    // ─────────────────────────────────────────────────────────────────
    console.log('[TEST 1] Testing School-wide Student Dashboard Disabled...');
    await FeatureAccessService.updateInstitutionSetting({
      institutionId: schoolA._id.toString(),
      featureKey: FeatureKey.STUDENT_DASHBOARD,
      enabled: false,
      userId: adminUser._id.toString(),
      reason: 'Testing school-wide student dashboard lockdown',
    });

    const resT1 = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolA._id.toString(),
      featureKey: FeatureKey.STUDENT_DASHBOARD,
      classId: classesA[1]._id.toString(),
    });

    if (resT1.effectiveEnabled === false && resT1.source === 'INSTITUTION_DEFAULT') {
      console.log('✅ Test 1 Passed: School-wide student dashboard is disabled at root institution level.');
    } else {
      throw new Error(`Test 1 Failed: Expected disabled from INSTITUTION_DEFAULT, got ${resT1.effectiveEnabled} from ${resT1.source}`);
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 2: Class 5 Dashboard Disabled while Class 10 Dashboard Enabled
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 2] Testing Class 5 Dashboard Disabled while Class 10 Dashboard Enabled...');
    // Re-enable institution default to true
    await FeatureAccessService.updateInstitutionSetting({
      institutionId: schoolA._id.toString(),
      featureKey: FeatureKey.STUDENT_DASHBOARD,
      enabled: true,
      userId: adminUser._id.toString(),
    });

    // Disable for Class 5
    await FeatureAccessService.updateClassSetting({
      institutionId: schoolA._id.toString(),
      classId: classesA[5]._id.toString(),
      featureKey: FeatureKey.STUDENT_DASHBOARD,
      enabled: false,
      userId: adminUser._id.toString(),
      reason: 'Class 5 students do not have personal digital device access',
    });

    // Enable for Class 10
    await FeatureAccessService.updateClassSetting({
      institutionId: schoolA._id.toString(),
      classId: classesA[10]._id.toString(),
      featureKey: FeatureKey.STUDENT_DASHBOARD,
      enabled: true,
      userId: adminUser._id.toString(),
      reason: 'Class 10 SEE preparation portal enabled',
    });

    const resClass5 = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolA._id.toString(),
      classId: classesA[5]._id.toString(),
      featureKey: FeatureKey.STUDENT_DASHBOARD,
    });

    const resClass10 = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolA._id.toString(),
      classId: classesA[10]._id.toString(),
      featureKey: FeatureKey.STUDENT_DASHBOARD,
    });

    if (resClass5.effectiveEnabled === false && resClass10.effectiveEnabled === true) {
      console.log('✅ Test 2 Passed: Class 5 dashboard is DISABLED while Class 10 dashboard is ENABLED.');
    } else {
      throw new Error(`Test 2 Failed: Class 5=${resClass5.effectiveEnabled}, Class 10=${resClass10.effectiveEnabled}`);
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 3: Section A Assignment Enabled while Section B Assignment Disabled
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 3] Testing Section A Assignment Enabled while Section B Assignment Disabled...');
    // Enable for Section 8A (Sagarmatha)
    await FeatureAccessService.updateSectionSetting({
      institutionId: schoolA._id.toString(),
      sectionId: sec8A._id.toString(),
      featureKey: FeatureKey.ASSIGNMENTS,
      enabled: true,
      userId: adminUser._id.toString(),
      reason: 'Section 8A online assignment pilot active',
    });

    // Disable for Section 8B (Annapurna)
    await FeatureAccessService.updateSectionSetting({
      institutionId: schoolA._id.toString(),
      sectionId: sec8B._id.toString(),
      featureKey: FeatureKey.ASSIGNMENTS,
      enabled: false,
      userId: adminUser._id.toString(),
      reason: 'Section 8B offline classroom homework only',
    });

    const resSec8A = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolA._id.toString(),
      sectionId: sec8A._id.toString(),
      featureKey: FeatureKey.ASSIGNMENTS,
    });

    const resSec8B = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolA._id.toString(),
      sectionId: sec8B._id.toString(),
      featureKey: FeatureKey.ASSIGNMENTS,
    });

    if (resSec8A.effectiveEnabled === true && resSec8B.effectiveEnabled === false) {
      console.log('✅ Test 3 Passed: Section 8A assignments ENABLED, Section 8B assignments DISABLED.');
    } else {
      throw new Error(`Test 3 Failed: Sec8A=${resSec8A.effectiveEnabled}, Sec8B=${resSec8B.effectiveEnabled}`);
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 4: Online Submission Disabled but Classroom Assignment Enabled
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 4] Testing Online Submission Disabled but Classroom Assignment Enabled...');
    // For Class 7: Assignments enabled, but online submission disabled
    await FeatureAccessService.updateClassSetting({
      institutionId: schoolA._id.toString(),
      classId: classesA[7]._id.toString(),
      featureKey: FeatureKey.ASSIGNMENTS,
      enabled: true,
      userId: adminUser._id.toString(),
    });

    await FeatureAccessService.updateClassSetting({
      institutionId: schoolA._id.toString(),
      classId: classesA[7]._id.toString(),
      featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
      enabled: false,
      userId: adminUser._id.toString(),
      reason: 'Class 7 submits homework in physical copy to teacher',
    });

    const resClass7Assign = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolA._id.toString(),
      classId: classesA[7]._id.toString(),
      featureKey: FeatureKey.ASSIGNMENTS,
    });

    const resClass7Submit = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolA._id.toString(),
      classId: classesA[7]._id.toString(),
      featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
    });

    if (resClass7Assign.effectiveEnabled === true && resClass7Submit.effectiveEnabled === false) {
      console.log('✅ Test 4 Passed: Classroom assignments ENABLED (true) while online digital submission is DISABLED (false).');
    } else {
      throw new Error(`Test 4 Failed: Assign=${resClass7Assign.effectiveEnabled}, Submit=${resClass7Submit.effectiveEnabled}`);
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 5: Student AI Disabled while Teacher AI Remains Enabled
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 5] Testing Student AI Disabled while Teacher AI Remains Enabled...');
    await FeatureAccessService.updateInstitutionSetting({
      institutionId: schoolA._id.toString(),
      featureKey: FeatureKey.AI_STUDENT_ACCESS,
      enabled: false,
      userId: adminUser._id.toString(),
      reason: 'Student AI restricted during exam term',
    });

    await FeatureAccessService.updateInstitutionSetting({
      institutionId: schoolA._id.toString(),
      featureKey: FeatureKey.AI_TEACHER_ACCESS,
      enabled: true,
      userId: adminUser._id.toString(),
      reason: 'Teacher lesson planning AI assistant active',
    });

    const resStudentAI = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolA._id.toString(),
      featureKey: FeatureKey.AI_STUDENT_ACCESS,
    });

    const resTeacherAI = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolA._id.toString(),
      featureKey: FeatureKey.AI_TEACHER_ACCESS,
    });

    if (resStudentAI.effectiveEnabled === false && resTeacherAI.effectiveEnabled === true) {
      console.log('✅ Test 5 Passed: Student AI is DISABLED while Teacher AI Co-Pilot remains fully ENABLED.');
    } else {
      throw new Error(`Test 5 Failed: StudentAI=${resStudentAI.effectiveEnabled}, TeacherAI=${resTeacherAI.effectiveEnabled}`);
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 6: Smart Board Enabled without Student Dashboard Access
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 6] Testing Smart Board Enabled without Student Dashboard Access...');
    // For Class 3: Student Dashboard is OFF, but Smart Board is ON
    await FeatureAccessService.updateClassSetting({
      institutionId: schoolA._id.toString(),
      classId: classesA[3]._id.toString(),
      featureKey: FeatureKey.STUDENT_DASHBOARD,
      enabled: false,
      userId: adminUser._id.toString(),
    });

    await FeatureAccessService.updateClassSetting({
      institutionId: schoolA._id.toString(),
      classId: classesA[3]._id.toString(),
      featureKey: FeatureKey.SMARTBOARD,
      enabled: true,
      userId: adminUser._id.toString(),
    });

    const resClass3Dash = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolA._id.toString(),
      classId: classesA[3]._id.toString(),
      featureKey: FeatureKey.STUDENT_DASHBOARD,
    });

    const resClass3Smart = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolA._id.toString(),
      classId: classesA[3]._id.toString(),
      featureKey: FeatureKey.SMARTBOARD,
    });

    if (resClass3Dash.effectiveEnabled === false && resClass3Smart.effectiveEnabled === true) {
      console.log('✅ Test 6 Passed: Smart Board teaching is ENABLED independently while student portal is DISABLED.');
    } else {
      throw new Error(`Test 6 Failed: Dash=${resClass3Dash.effectiveEnabled}, SmartBoard=${resClass3Smart.effectiveEnabled}`);
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 7: Subscription Restriction Preventing Feature Activation (Ceiling)
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 7] Testing Subscription Restriction Preventing Feature Activation...');
    // Assign Foundation Package (Classes 1–5 only) to School A
    await SubscriptionsService.seedDefaultNepalPlans();
    const foundationPlan = await SubscriptionPlan.findOne({ tier: 'FOUNDATION' });
    if (foundationPlan) {
      await SubscriptionsService.assignSubscription({
        institutionId: schoolA._id.toString(),
        planId: foundationPlan._id.toString(),
        assignedBy: adminUser._id.toString(),
      });
    }

    // Admin tries to enable Class 11 simulations or dashboard
    const resBlockedGrade = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolA._id.toString(),
      classId: classesA[11]._id.toString(),
      featureKey: FeatureKey.SIMULATIONS,
    });

    if (resBlockedGrade.effectiveEnabled === false && resBlockedGrade.source === 'PLATFORM_SUBSCRIPTION_LIMITATION') {
      console.log('✅ Test 7 Passed: Subscription package boundary enforced! Class 11 blocked under Foundation tier.');
      console.log(`   Reason: ${resBlockedGrade.reason}`);
    } else {
      throw new Error(`Test 7 Failed: Expected PLATFORM_SUBSCRIPTION_LIMITATION, got ${resBlockedGrade.source}`);
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 8: Individual Student Override
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 8] Testing Individual Student Override...');
    // Re-assign K-12 to School A so Class 8 is authorized under package
    if (k12Plan) {
      await SubscriptionsService.assignSubscription({
        institutionId: schoolA._id.toString(),
        planId: k12Plan._id.toString(),
        assignedBy: adminUser._id.toString(),
      });
    }

    // Section 8A has AI disabled by default
    await FeatureAccessService.updateSectionSetting({
      institutionId: schoolA._id.toString(),
      sectionId: sec8A._id.toString(),
      featureKey: FeatureKey.AI_STUDENT_ACCESS,
      enabled: false,
      userId: adminUser._id.toString(),
    });

    // Grant special exception override for Milan Thapa
    await FeatureAccessService.setStudentOverride({
      institutionId: schoolA._id.toString(),
      studentId: studentEnrollment._id.toString(),
      featureKey: FeatureKey.AI_STUDENT_ACCESS,
      enabled: true,
      reason: 'National STEM Olympiad participant exception',
      userId: adminUser._id.toString(),
    });

    const resStudentOverride = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolA._id.toString(),
      sectionId: sec8A._id.toString(),
      studentId: studentEnrollment._id.toString(),
      featureKey: FeatureKey.AI_STUDENT_ACCESS,
    });

    if (resStudentOverride.effectiveEnabled === true && resStudentOverride.source === 'STUDENT_OVERRIDE') {
      console.log('✅ Test 8 Passed: Individual student override takes highest precedence (STUDENT_OVERRIDE).');
      console.log(`   Exception reason: ${resStudentOverride.reason}`);
    } else {
      throw new Error(`Test 8 Failed: Expected STUDENT_OVERRIDE, got ${resStudentOverride.source}`);
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 9: Inherited Configuration Resolution
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 9] Testing Inherited Configuration Resolution...');
    // Set Institution default for DIGITAL_TEXTBOOKS to true
    await FeatureAccessService.updateInstitutionSetting({
      institutionId: schoolA._id.toString(),
      featureKey: FeatureKey.DIGITAL_TEXTBOOKS,
      enabled: true,
      userId: adminUser._id.toString(),
    });

    // Resolve for Class 2 which has no explicit override
    const resInherited = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolA._id.toString(),
      classId: classesA[2]._id.toString(),
      featureKey: FeatureKey.DIGITAL_TEXTBOOKS,
    });

    if (resInherited.effectiveEnabled === true && resInherited.source === 'INSTITUTION_DEFAULT' && resInherited.inherited === true) {
      console.log('✅ Test 9 Passed: Class 2 cleanly inherits true from INSTITUTION_DEFAULT (inherited: true).');
    } else {
      throw new Error(`Test 9 Failed: Expected inherited INSTITUTION_DEFAULT, got ${resInherited.source}`);
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 10: Cross-Institution Data Isolation
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 10] Testing Cross-Institution Data Isolation...');
    // School B configures Quizzes to false
    await FeatureAccessService.updateInstitutionSetting({
      institutionId: schoolB._id.toString(),
      featureKey: FeatureKey.QUIZZES,
      enabled: false,
      userId: adminUser._id.toString(),
    });

    // School A configures Quizzes to true
    await FeatureAccessService.updateInstitutionSetting({
      institutionId: schoolA._id.toString(),
      featureKey: FeatureKey.QUIZZES,
      enabled: true,
      userId: adminUser._id.toString(),
    });

    const resSchoolA = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolA._id.toString(),
      featureKey: FeatureKey.QUIZZES,
    });

    const resSchoolB = await FeatureAccessService.resolveFeatureAccess({
      institutionId: schoolB._id.toString(),
      featureKey: FeatureKey.QUIZZES,
    });

    if (resSchoolA.effectiveEnabled === true && resSchoolB.effectiveEnabled === false) {
      console.log('✅ Test 10 Passed: Strict cross-tenant isolation verified between School A and School B.');
    } else {
      throw new Error(`Test 10 Failed: School A=${resSchoolA.effectiveEnabled}, School B=${resSchoolB.effectiveEnabled}`);
    }

    // ─────────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎉 ALL 10/10 FEATURE CONFIGURATION & ACCESS CONTROL TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (err: any) {
    console.error('\n❌ Test Suite Failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runFeatureAccessTests();
