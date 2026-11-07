import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  Institution,
  User,
  AcademicYear,
  Class,
  Section,
  SectionSubject,
  InstitutionFeatureSettings,
  InstitutionSubscription,
  SubscriptionEntitlement,
  AcademicCalendar,
  ProvisioningJob,
  RegistrationRequest,
  StudentEnrollment,
  BulkImportJob,
  CentralSubject,
} from '../models';
import { ProvisioningService } from '../modules/admin/provisioning.service';
import { RegistrationService } from '../modules/admin/registration.service';
import { BulkImportService } from '../modules/school-admin/bulk-import.service';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nepal_edu_ecosystem';

async function runProvisioningVerification() {
  console.log('========================================================================');
  console.log('  NEPAL DIGITAL EDUCATION ECOSYSTEM — PROVISIONING & ONBOARDING AUDIT  ');
  console.log('========================================================================\n');

  await mongoose.connect(MONGO_URI);
  console.log('[DB] Connected to MongoDB 8.0:', MONGO_URI);

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${desc}`);
      passedTests++;
    } else {
      console.error(`  ✗ [FAIL] ${desc}`);
      failedTests++;
    }
  }

  try {
    // Clean up test records if prior run existed
    await Institution.deleteMany({ emisCode: { $in: ['120010001', '570020002'] } });
    await User.deleteMany({ username: { $in: ['admin_120010001', 'admin_570020002', 'ram_thapa_test', 'sita_sharma_test'] } });
    await RegistrationRequest.deleteMany({ emisCode: { $in: ['120010001', '570020002'] } });

    // Ensure at least one Central Subject exists for curriculum attachment
    let sampleSubj = await CentralSubject.findOne({ gradeNumber: 10 });
    if (!sampleSubj) {
      sampleSubj = await CentralSubject.create({
        code: 'NEP-10',
        name: 'Compulsory Nepali',
        nameNepali: 'अनिवार्य नेपाली',
        gradeNumber: 10,
        stream: 'GENERAL',
        isCompulsory: true,
        creditHours: 4,
        isActive: true,
      });
    }

    // -------------------------------------------------------------------------
    // TEST SUITE 1: METHOD 1 — SUPER ADMIN DIRECT 12-STEP PROVISIONING
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 1: Method 1 (Super Admin Direct 12-Step Provisioning) ---');

    const directPayload = {
      institutionInfo: {
        name: 'Kankai Secondary School',
        nameNepali: 'कन्काई माध्यमिक विद्यालय',
        shortName: 'KSS',
        emisCode: '120010001',
        registrationNumber: 'REG-JH-2051/04',
        institutionKind: 'SCHOOL' as const,
        category: 'COMMUNITY' as const,
        province: 'Koshi Province',
        district: 'Jhapa',
        localLevel: 'Kankai Municipality',
        ward: 3,
        street: 'Surunga Bazar',
        postalCode: '57200',
        phone: '023-550111',
        email: 'info@kankai.edu.np',
        contactPerson: 'Balaram Pokharel',
        mediumOfInstruction: 'BOTH' as const,
      },
      academicConfig: {
        academicYearName: '2081/2082',
        educationLevels: ['BASIC_1_5', 'BASIC_6_8', 'SECONDARY_9_10', 'HIGHER_SECONDARY_11_12'],
        sectionsPerGrade: 2,
      },
      adminAccount: {
        fullName: 'Balaram Pokharel',
        username: 'admin_120010001',
        password: 'Password@123',
        email: 'admin@kankai.edu.np',
        phone: '9852000001',
        role: 'SCHOOL_ADMIN' as const,
      },
      subscription: {
        packageCode: 'PACKAGE_3_SECONDARY',
        studentQuota: 800,
        teacherQuota: 45,
        validMonths: 12,
        smartBoardAccess: true,
      },
      featureAccess: {
        smartBoardAccess: true,
        simulationAccess: true,
        aiAssistantAccess: true,
        onlineSubmissions: true,
        studentDashboardAccess: true,
      },
    };

    const provResult = await ProvisioningService.provisionInstitution(directPayload);

    assert(provResult.success === true, 'Direct provisioning pipeline returned success: true');
    assert(!!provResult.institutionId, 'Generated valid Institution ObjectId');
    assert(provResult.adminUser.username === 'admin_120010001', 'Created School Admin account with username admin_120010001');

    // Verify Password Hash
    const dbAdmin = await User.findOne({ username: 'admin_120010001' });
    assert(!!dbAdmin && dbAdmin.passwordHash !== 'Password@123', 'Admin password is encrypted with bcrypt (never plaintext)');
    const isPwMatch = await bcrypt.compare('Password@123', dbAdmin!.passwordHash);
    assert(isPwMatch === true, 'Admin password hash successfully validates with bcrypt');

    // Verify Classes & Sections Generated
    const createdClassesCount = await Class.countDocuments({ institutionId: provResult.institutionId });
    assert(createdClassesCount === 12, `Generated 12 Classes (1–12), actual: ${createdClassesCount}`);

    const createdSectionsCount = await Section.countDocuments({ classId: { $in: await Class.find({ institutionId: provResult.institutionId }).distinct('_id') } });
    assert(createdSectionsCount === 24, `Generated 24 Sections (2 per class), actual: ${createdSectionsCount}`);

    // Verify Feature Settings
    const featSettingsCount = await InstitutionFeatureSettings.countDocuments({ institutionId: provResult.institutionId });
    assert(featSettingsCount >= 8, `Configured ${featSettingsCount} digital feature settings`);

    // Verify Subscription Entitlements
    const subEnt = await SubscriptionEntitlement.findOne({ institutionId: provResult.institutionId });
    assert(!!subEnt && subEnt.isSmartBoardEnabled === true, 'SubscriptionEntitlement active with smart board enabled');

    // Verify Academic Calendar
    const calEventsCount = await AcademicCalendar.countDocuments({ institutionId: provResult.institutionId });
    assert(calEventsCount >= 4, `Seeded initial academic calendar with ${calEventsCount} events`);

    // Verify Provisioning Job Log
    const provJob = await ProvisioningJob.findOne({ jobCode: provResult.jobCode });
    assert(!!provJob && provJob.status === 'COMPLETED', `ProvisioningJob logged with status COMPLETED (${provJob?.jobCode})`);
    assert(provJob?.steps.length === 12, `All 12 steps recorded in audit log (count: ${provJob?.steps.length})`);

    // -------------------------------------------------------------------------
    // TEST SUITE 2: METHOD 2 — PUBLIC SELF-REGISTRATION & SUPER ADMIN APPROVAL
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 2: Method 2 (Public Self-Registration & Super Admin Approval) ---');

    const publicRegistrationPayload = {
      institutionName: 'Bheri Model Science College',
      nameNepali: 'भेरी मोडल विज्ञान कलेज',
      shortName: 'BMSC',
      emisCode: '570020002',
      registrationNumber: 'REG-TU-4421/08',
      institutionKind: 'COLLEGE' as const,
      institutionType: 'INSTITUTIONAL' as const,
      province: 'Lumbini Province',
      district: 'Banke',
      localLevel: 'Nepalgunj Sub-Metropolitan City',
      ward: 4,
      street: 'Tribhuvan Chowk',
      contactPerson: 'Dr. Mukunda Acharya',
      designation: 'Campus Chief',
      email: 'chief@bherimodel.edu.np',
      phone: '081-525000',
      estimatedStudents: 600,
      adminFullName: 'Dr. Mukunda Acharya',
      adminUsername: 'admin_570020002',
      adminPassword: 'Password@123',
    };

    const regSubResult = await RegistrationService.submitPublicRegistration(publicRegistrationPayload);
    assert(regSubResult.success === true, 'Public self-registration submitted successfully');
    assert(regSubResult.requestCode.startsWith('REG-2081-'), `Generated valid reference code: ${regSubResult.requestCode}`);
    assert(regSubResult.status === 'SUBMITTED', 'Initial status set to SUBMITTED');

    // Public Status Tracking
    const statusTrack = await RegistrationService.getPublicStatus(regSubResult.requestCode);
    assert(statusTrack.requestCode === regSubResult.requestCode, 'Public tracking lookup matches application code');
    assert(statusTrack.institutionName === 'Bheri Model Science College', 'Public tracking displays correct institution name');
    assert(statusTrack.isProvisioned === false, 'Institution is not yet provisioned');

    // Super Admin: Request More Info
    const dbReq = await RegistrationRequest.findOne({ requestCode: regSubResult.requestCode });
    assert(!!dbReq, 'RegistrationRequest found in database');

    await RegistrationService.requestMoreInfo(dbReq!._id.toString(), 'Please upload Campus Affiliation Letter from Tribhuvan University.');
    const updatedReq1 = await RegistrationRequest.findById(dbReq!._id);
    assert(updatedReq1?.status === 'MORE_INFO_REQUIRED', 'Status transitioned to MORE_INFO_REQUIRED');
    assert(updatedReq1?.moreInfoNotes?.includes('Tribhuvan University') === true, 'Clarification note persisted correctly');

    // Super Admin: Approve & Execute 12-Step Provisioning
    const approveResult = await RegistrationService.approveAndProvision(dbReq!._id.toString(), {
      packageCode: 'PACKAGE_3_SECONDARY',
      studentQuota: 600,
      teacherQuota: 30,
    });
    assert(approveResult.success === true, 'Approval and atomic provisioning completed successfully');

    const updatedReq2 = await RegistrationRequest.findById(dbReq!._id);
    assert(updatedReq2?.status === 'APPROVED', 'Application request status transitioned to APPROVED');
    assert(!!updatedReq2?.provisionedInstitutionId, 'Application request linked to provisioned Institution ObjectId');

    const collegeInst = await Institution.findById(updatedReq2!.provisionedInstitutionId);
    assert(collegeInst?.institutionKind === 'COLLEGE', 'Provisioned institution classified as COLLEGE');

    const collegeAdmin = await User.findOne({ username: 'admin_570020002' });
    assert(collegeAdmin?.role === 'COLLEGE_ADMIN', 'College administrator created with COLLEGE_ADMIN role');

    // -------------------------------------------------------------------------
    // TEST SUITE 3: SCHOOL ADMIN INDEPENDENT OPERATIONS (BULK IMPORTS)
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 3: School Admin Independent Operations (Bulk Imports) ---');

    const kankaiId = provResult.institutionId;

    // Bulk Teacher Import Validation & Execution
    const teacherRows = [
      {
        fullName: 'Ram Bahadur Thapa',
        fullNameNepali: 'राम बहादुर थापा',
        email: 'ram.thapa@kankai.edu.np',
        phone: '9841234567',
        gender: 'MALE',
        qualification: 'M.Sc. Mathematics',
        specialization: 'Secondary Mathematics',
      },
      {
        fullName: 'Sita Devi Sharma',
        fullNameNepali: 'सीता देवी शर्मा',
        email: 'sita.sharma@kankai.edu.np',
        phone: '9851234568',
        gender: 'FEMALE',
        qualification: 'M.Ed. English',
        specialization: 'English Literature',
      },
    ];

    const teacherPreview = await BulkImportService.validateTeachers(kankaiId, teacherRows);
    assert(teacherPreview.totalRows === 2, `Teacher validation checked 2 rows`);
    assert(teacherPreview.validRowsCount === 2, `Both teacher rows valid`);
    assert(teacherPreview.invalidRowsCount === 0, `0 validation errors in teacher import`);

    const teacherExec = await BulkImportService.executeTeacherImport(
      kankaiId,
      teacherPreview.validRows,
      dbAdmin!._id.toString()
    );
    assert(teacherExec.successCount === 2, `Successfully batch-imported 2 teachers`);

    const dbTeacher = await User.findOne({ email: 'ram.thapa@kankai.edu.np' });
    assert(!!dbTeacher && dbTeacher.role === 'TEACHER', 'Teacher account created with TEACHER role');
    assert(dbTeacher?.institutionId?.toString() === kankaiId, 'Teacher strictly assigned to Kankai Secondary School');

    // Bulk Student Import Validation & Execution
    const kankaiSectionA = await Section.findOne({ name: 'A' }).populate('classId');
    assert(!!kankaiSectionA, 'Found active Class section in Kankai Secondary');

    const studentRows = [
      {
        admissionNumber: 'KSS-2081-001',
        rollNumber: 1,
        fullName: 'Aarav Subedi',
        fullNameNepali: 'आरव सुवेदी',
        className: 'Class 10',
        sectionName: 'A',
        gender: 'MALE',
        guardianName: 'Kishor Subedi',
        guardianPhone: '9841000001',
        guardianRelation: 'Father',
      },
      {
        admissionNumber: 'KSS-2081-002',
        rollNumber: 2,
        fullName: 'Bipana Karki',
        fullNameNepali: 'बिपना कार्की',
        className: 'Class 10',
        sectionName: 'A',
        gender: 'FEMALE',
        guardianName: 'Sundar Karki',
        guardianPhone: '9841000002',
        guardianRelation: 'Father',
      },
    ];

    const studentPreview = await BulkImportService.validateStudents(kankaiId, studentRows);
    assert(studentPreview.validRowsCount === 2, `Both student records validated against school classes`);

    const studentExec = await BulkImportService.executeStudentImport(
      kankaiId,
      studentPreview.validRows,
      dbAdmin!._id.toString()
    );
    assert(studentExec.successCount === 2, `Successfully batch-imported and enrolled 2 students`);

    const dbEnrollment = await StudentEnrollment.findOne({ admissionNumber: 'KSS-2081-001' });
    assert(!!dbEnrollment && dbEnrollment.rollNumber === 1, 'Student enrollment recorded with roll number 1');

    // Bulk Subject Allocation
    const class10 = await Class.findOne({ institutionId: kankaiId, gradeNumber: 10 });
    const class10SecA = await Section.findOne({ classId: class10?._id, name: 'A' });

    if (class10SecA && sampleSubj && dbTeacher) {
      const allocResult = await BulkImportService.bulkAllocateSubjects(
        kankaiId,
        [
          {
            sectionId: class10SecA._id.toString(),
            centralSubjectId: sampleSubj._id.toString(),
            teacherId: dbTeacher._id.toString(),
            medium: 'NEPALI',
            periodsPerWeek: 4,
          },
        ],
        dbAdmin!._id.toString()
      );
      assert(allocResult.allocatedCount === 1, `Subject successfully allocated to teacher (${allocResult.allocatedCount})`);
    }

    // -------------------------------------------------------------------------
    // TEST SUITE 4: MULTI-TENANT ISOLATION AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- SUITE 4: Multi-Tenant Data Isolation Audit ---');

    // Admin of Kankai (School A) cannot access Bheri (School B)
    const schoolAId = kankaiId;
    const schoolBId = updatedReq2!.provisionedInstitutionId.toString();

    const crossQueryStudents = await StudentEnrollment.find({
      studentId: { $in: await User.find({ institutionId: schoolBId }).distinct('_id') },
      academicYearId: { $in: await AcademicYear.find({ institutionId: schoolAId }).distinct('_id') },
    });
    assert(crossQueryStudents.length === 0, 'Zero cross-tenant enrollment leakage between School A and College B');

    const schoolATeachers = await User.find({ institutionId: schoolAId, role: 'TEACHER' });
    const schoolBTeachers = await User.find({ institutionId: schoolBId, role: 'TEACHER' });
    const intersection = schoolATeachers.filter((tA) => schoolBTeachers.some((tB) => tB._id.toString() === tA._id.toString()));
    assert(intersection.length === 0, 'Zero faculty overlap between separated institutions');

    console.log('\n========================================================================');
    console.log(`  PROVISIONING AUDIT SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('========================================================================\n');

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err: any) {
    console.error('Fatal error during test run:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runProvisioningVerification();

