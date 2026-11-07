import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db';
import {
  Institution,
  User,
  AcademicYear,
  Class,
  Section,
  StudentEnrollment,
  CentralSubject,
  Textbook,
  SimulationCatalog,
  SubjectAllocation,
  TimetableSlot,
  SubscriptionPlan,
  Subscription,
  ExamAssessment,
  Examination,
  StudentMark,
  GradingScheme,
  AttendanceSession,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  SchoolAnnouncement,
  SystemAnnouncement,
  InstitutionFeatureSettings,
  ClassFeatureSettings,
  SectionFeatureSettings,
  StudentFeatureOverride,
  StudentDeviceProfile,
  FeatureConfigurationHistory,
  RegistrationRequest,
} from './models';
import { SubscriptionsService } from './modules/subscriptions/subscriptions.service';
import { FeatureKey, DeviceAccessType } from './models/FeatureAccess';

export async function runComprehensiveSeed() {
  console.log('🌱 Starting Comprehensive Nepal Digital Education Ecosystem Seeder...');
  await connectDB();

  // Clear existing collections safely for a repeatable clean testbed
  console.log('  🧹 Resetting test collections...');
  await Promise.all([
    Institution.deleteMany({}),
    User.deleteMany({}),
    AcademicYear.deleteMany({}),
    Class.deleteMany({}),
    Section.deleteMany({}),
    StudentEnrollment.deleteMany({}),
    CentralSubject.deleteMany({}),
    Textbook.deleteMany({}),
    SimulationCatalog.deleteMany({}),
    SubjectAllocation.deleteMany({}),
    TimetableSlot.deleteMany({}),
    SubscriptionPlan.deleteMany({}),
    Subscription.deleteMany({}),
    ExamAssessment.deleteMany({}),
    Examination.deleteMany({}),
    StudentMark.deleteMany({}),
    GradingScheme.deleteMany({}),
    AttendanceSession.deleteMany({}),
    AttendanceRecord.deleteMany({}),
    Assignment.deleteMany({}),
    AssignmentSubmission.deleteMany({}),
    SchoolAnnouncement.deleteMany({}),
    SystemAnnouncement.deleteMany({}),
    InstitutionFeatureSettings.deleteMany({}),
    ClassFeatureSettings.deleteMany({}),
    SectionFeatureSettings.deleteMany({}),
    StudentFeatureOverride.deleteMany({}),
    StudentDeviceProfile.deleteMany({}),
    FeatureConfigurationHistory.deleteMany({}),
    RegistrationRequest.deleteMany({}),
  ]);

  const defaultPasswordHash = await bcrypt.hash('Nepal@1234', 10);
  const superAdminPasswordHash = defaultPasswordHash;

  // ═════════════════════════════════════════════════════════════════════════
  // 1. SUPER ADMIN ACCOUNT
  // ═════════════════════════════════════════════════════════════════════════
  const superAdmin = await User.create({
    username: 'superadmin',
    email: 'superadmin@nepaledu.gov.np',
    passwordHash: superAdminPasswordHash,
    role: 'SUPER_ADMIN',
    fullName: 'Central System Administrator',
    fullNameNepali: 'केन्द्रीय प्रणाली प्रशासक',
    phone: '9800000000',
    status: 'ACTIVE',
  });
  console.log('  ✅ Seeded Super Admin: superadmin');

  // ═════════════════════════════════════════════════════════════════════════
  // 2. SUBSCRIPTION PLANS (FOUNDATION, MIDDLE, SECONDARY, K-12)
  // ═════════════════════════════════════════════════════════════════════════
  await SubscriptionsService.seedDefaultNepalPlans();
  const planFoundation = await SubscriptionPlan.findOne({ code: 'FOUNDATION' });
  const planMiddle = await SubscriptionPlan.findOne({ code: 'MIDDLE_SCHOOL' });
  const planSecondary = await SubscriptionPlan.findOne({ code: 'SECONDARY' });
  const planK12 = await SubscriptionPlan.findOne({ code: 'K12_ALL' });
  console.log('  ✅ Seeded 4 Configurable Nepal Subscription Packages (Foundation, Middle, Secondary, K12)');

  // ═════════════════════════════════════════════════════════════════════════
  // 3. 3 DISTINCT REALISTIC SCHOOL INSTITUTIONS
  // ═════════════════════════════════════════════════════════════════════════
  // School 1: Kathmandu Model Secondary School (Full K-12, Blended Mode)
  const kmss = await Institution.create({
    emisCode: '270010001',
    name: 'Kathmandu Model Secondary School',
    nameNepali: 'काठमाडौँ मोडल माध्यमिक विद्यालय',
    type: 'COMMUNITY',
    province: 'Bagmati Province',
    district: 'Kathmandu',
    localLevel: 'Kathmandu Metropolitan City',
    ward: 10,
    status: 'ACTIVE',
    email: 'info@kmss.edu.np',
    phone: '01-4412345',
    currentAcademicYear: '2081/2082',
  });

  // School 2: Sunrise Secondary School (Classes 6-12, Full Digital Mode)
  const sunrise = await Institution.create({
    emisCode: '280020002',
    name: 'Sunrise Secondary School',
    nameNepali: 'सनराइज माध्यमिक विद्यालय',
    type: 'INSTITUTIONAL',
    province: 'Gandaki Province',
    district: 'Kaski',
    localLevel: 'Pokhara Metropolitan City',
    ward: 8,
    status: 'ACTIVE',
    email: 'admin@sunriseschool.edu.np',
    phone: '061-520111',
    currentAcademicYear: '2081/2082',
  });

  // School 3: Himalayan Public School (Classes 1-5 only, Smart Board Only Mode)
  const himalayan = await Institution.create({
    emisCode: '390030003',
    name: 'Himalayan Public School',
    nameNepali: 'हिमालयन पब्लिक स्कुल',
    type: 'COMMUNITY',
    province: 'Karnali Province',
    district: 'Jumla',
    localLevel: 'Chandannath Municipality',
    ward: 3,
    status: 'ACTIVE',
    email: 'contact@himalayan.edu.np',
    phone: '087-520022',
    currentAcademicYear: '2081/2082',
  });
  console.log('  ✅ Seeded 3 Institutional Tenants: KMSS, Sunrise, Himalayan');

  // ═════════════════════════════════════════════════════════════════════════
  // 4. INSTITUTION SUBSCRIPTIONS (ACTIVE CURRENT PERIOD)
  // ═════════════════════════════════════════════════════════════════════════
  const oneMonthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const oneYearLater = new Date(Date.now() + 335 * 24 * 3600 * 1000);
  const gracePeriod = new Date(Date.now() + 350 * 24 * 3600 * 1000);

  await Subscription.create({
    institutionId: kmss._id,
    planId: planSecondary._id,
    packageId: planSecondary._id,
    planCode: planSecondary.code,
    status: 'ACTIVE',
    startDate: oneMonthAgo,
    endDate: oneYearLater,
    gracePeriodEndDate: gracePeriod,
    billingCycle: 'ANNUAL',
  });

  await Subscription.create({
    institutionId: sunrise._id,
    planId: planSecondary._id,
    packageId: planSecondary._id,
    planCode: planSecondary.code,
    status: 'ACTIVE',
    startDate: oneMonthAgo,
    endDate: oneYearLater,
    gracePeriodEndDate: gracePeriod,
    billingCycle: 'ANNUAL',
  });

  await Subscription.create({
    institutionId: himalayan._id,
    planId: planFoundation._id,
    packageId: planFoundation._id,
    planCode: planFoundation.code,
    status: 'ACTIVE',
    startDate: oneMonthAgo,
    endDate: oneYearLater,
    gracePeriodEndDate: gracePeriod,
    billingCycle: 'ANNUAL',
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 5. SCHOOL ADMINISTRATORS & PRINCIPALS
  // ═════════════════════════════════════════════════════════════════════════
  const kmssAdmin = await User.create({
    institutionId: kmss._id,
    username: 'admin_kmss',
    email: 'admin@kmss.edu.np',
    passwordHash: defaultPasswordHash,
    role: 'SCHOOL_ADMIN',
    fullName: 'Bishnu Prasad Sharma',
    fullNameNepali: 'विष्णु प्रसाद शर्मा',
    phone: '9851000001',
    status: 'ACTIVE',
  });

  const kmssPrincipal = await User.create({
    institutionId: kmss._id,
    username: 'principal_kmss',
    email: 'principal@kmss.edu.np',
    passwordHash: defaultPasswordHash,
    role: 'PRINCIPAL',
    fullName: 'Dr. Narayan Karki',
    fullNameNepali: 'डा. नारायण कार्की',
    phone: '9851000002',
    status: 'ACTIVE',
  });

  const sunriseAdmin = await User.create({
    institutionId: sunrise._id,
    username: 'admin_sunrise',
    email: 'admin@sunriseschool.edu.np',
    passwordHash: defaultPasswordHash,
    role: 'SCHOOL_ADMIN',
    fullName: 'Sunil Shakya',
    fullNameNepali: 'सुनिल शाक्य',
    phone: '9856000001',
    status: 'ACTIVE',
  });

  const himalayanAdmin = await User.create({
    institutionId: himalayan._id,
    username: 'admin_himalayan',
    email: 'admin@himalayan.edu.np',
    passwordHash: defaultPasswordHash,
    role: 'SCHOOL_ADMIN',
    fullName: 'Karma Gurung',
    fullNameNepali: 'कर्मा गुरुङ',
    phone: '9858000001',
    status: 'ACTIVE',
  });
  console.log('  ✅ Seeded School Admins & Principals across all 3 institutions');

  // ═════════════════════════════════════════════════════════════════════════
  // 5B. INSTITUTION FEATURE SETTINGS (BLENDED VS SMART BOARD ONLY MODES)
  // ═════════════════════════════════════════════════════════════════════════
  // KMSS: Blended Learning Mode -> Online Submissions & Student Dashboard Enabled
  await InstitutionFeatureSettings.create({
    institutionId: kmss._id,
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
    enabled: true,
    updatedBy: kmssAdmin._id,
  });

  await InstitutionFeatureSettings.create({
    institutionId: kmss._id,
    featureKey: FeatureKey.STUDENT_DASHBOARD,
    enabled: true,
    updatedBy: kmssAdmin._id,
  });

  await InstitutionFeatureSettings.create({
    institutionId: kmss._id,
    featureKey: FeatureKey.AI_ASSISTANT,
    enabled: true,
    updatedBy: kmssAdmin._id,
  });

  await InstitutionFeatureSettings.create({
    institutionId: kmss._id,
    featureKey: FeatureKey.SIMULATIONS,
    enabled: true,
    updatedBy: kmssAdmin._id,
  });

  await InstitutionFeatureSettings.create({
    institutionId: kmss._id,
    featureKey: FeatureKey.DIGITAL_TEXTBOOKS,
    enabled: true,
    updatedBy: kmssAdmin._id,
  });

  // Himalayan Public School: Smart Board Only Mode -> Student Dashboard Disabled
  await InstitutionFeatureSettings.create({
    institutionId: himalayan._id,
    featureKey: FeatureKey.STUDENT_DASHBOARD,
    enabled: false,
    updatedBy: superAdmin._id,
  });

  await InstitutionFeatureSettings.create({
    institutionId: himalayan._id,
    featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
    enabled: false,
    updatedBy: superAdmin._id,
  });
  console.log('  ✅ Seeded Institution Learning Mode Configurations (Blended vs Smart Board Only)');

  // ═════════════════════════════════════════════════════════════════════════
  // 6. ACADEMIC YEARS & CLASSES (CLASSES 1-12)
  // ═════════════════════════════════════════════════════════════════════════
  const acadYearKmss = await AcademicYear.create({
    institutionId: kmss._id,
    name: '2081/2082',
    nameNepali: '२०८१/२०८२',
    isCurrent: true,
    startDate: new Date('2024-04-14'),
    endDate: new Date('2025-04-13'),
  });

  // Create Classes 1 to 12 in KMSS
  const classesKmss: Record<number, any> = {};
  for (let g = 1; g <= 12; g++) {
    classesKmss[g] = await Class.create({
      institutionId: kmss._id,
      gradeNumber: g,
      name: `Class ${g} (${g <= 5 ? 'Foundation' : g <= 8 ? 'Middle' : 'Secondary'})`,
      board: 'Nepal CDC',
    });
  }

  // Create Sections for Class 10 (Sagarmatha and Annapurna)
  const sectionSagarmatha = await Section.create({
    classId: classesKmss[10]._id,
    academicYearId: acadYearKmss._id,
    name: 'Section Sagarmatha',
    medium: 'BILINGUAL',
    capacity: 45,
  });

  const sectionAnnapurna = await Section.create({
    classId: classesKmss[10]._id,
    academicYearId: acadYearKmss._id,
    name: 'Section Annapurna',
    medium: 'ENGLISH',
    capacity: 40,
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 7. CENTRAL CURRICULUM SUBJECTS & CDC TEXTBOOKS
  // ═════════════════════════════════════════════════════════════════════════
  const subScience10 = await CentralSubject.create({
    code: 'SCI10',
    name: 'Science and Technology',
    nameNepali: 'विज्ञान तथा प्रविधि',
    gradeNumber: 10,
    medium: 'BILINGUAL',
    curriculumYear: '2080',
    isElective: false,
    theoryFullMarks: 75,
    practicalFullMarks: 25,
    totalCreditHours: 4,
  });

  const subMath10 = await CentralSubject.create({
    code: 'MTH10',
    name: 'Compulsory Mathematics',
    nameNepali: 'अनिवार्य गणित',
    gradeNumber: 10,
    medium: 'BILINGUAL',
    curriculumYear: '2080',
    isElective: false,
    theoryFullMarks: 75,
    practicalFullMarks: 25,
    totalCreditHours: 4,
  });

  const subEnglish10 = await CentralSubject.create({
    code: 'ENG10',
    name: 'Compulsory English',
    nameNepali: 'अनिवार्य अंग्रेजी',
    gradeNumber: 10,
    medium: 'ENGLISH',
    curriculumYear: '2080',
    isElective: false,
    theoryFullMarks: 75,
    practicalFullMarks: 25,
    totalCreditHours: 4,
  });

  // CDC Textbooks
  await Textbook.create({
    subjectId: subScience10._id,
    title: 'Grade 10 Science & Technology',
    titleNepali: 'कक्षा १० विज्ञान तथा प्रविधि',
    gradeNumber: 10,
    medium: 'ENGLISH',
    edition: '2080 Edition (CDC Approved)',
    pdfPath: '/uploads/textbooks/grade10_science.pdf',
    pageCount: 320,
    status: 'PUBLISHED',
    isApprovedByCDC: true,
  });

  await Textbook.create({
    subjectId: subMath10._id,
    title: 'Grade 10 Compulsory Mathematics',
    titleNepali: 'कक्षा १० अनिवार्य गणित',
    gradeNumber: 10,
    medium: 'ENGLISH',
    edition: '2080 Edition (CDC Approved)',
    pdfPath: '/uploads/textbooks/grade10_math.pdf',
    pageCount: 280,
    status: 'PUBLISHED',
    isApprovedByCDC: true,
  });
  console.log('  ✅ Seeded Central Subjects & CDC Textbooks');

  // ═════════════════════════════════════════════════════════════════════════
  // 8. TEACHERS & SUBJECT ALLOCATIONS
  // ═════════════════════════════════════════════════════════════════════════
  const teacherRamesh = await User.create({
    institutionId: kmss._id,
    username: 'teacher_ramesh',
    email: 'ramesh@kmss.edu.np',
    passwordHash: defaultPasswordHash,
    role: 'TEACHER',
    fullName: 'Ramesh Adhikari',
    fullNameNepali: 'रमेश अधिकारी',
    phone: '9841000001',
    status: 'ACTIVE',
  });

  const teacherSita = await User.create({
    institutionId: kmss._id,
    username: 'teacher_sita',
    email: 'sita@kmss.edu.np',
    passwordHash: defaultPasswordHash,
    role: 'TEACHER',
    fullName: 'Sita Kumari Thapa',
    fullNameNepali: 'सीता कुमारी थापा',
    phone: '9841000002',
    status: 'ACTIVE',
  });

  const teacherHari = await User.create({
    institutionId: kmss._id,
    username: 'teacher_hari',
    email: 'hari@kmss.edu.np',
    passwordHash: defaultPasswordHash,
    role: 'TEACHER',
    fullName: 'Hari Krishna Bhattarai',
    fullNameNepali: 'हरि कृष्ण भट्टराई',
    phone: '9841000003',
    status: 'ACTIVE',
  });

  // Assign Class Teacher to Section Sagarmatha
  sectionSagarmatha.classTeacherId = teacherRamesh._id as any;
  await sectionSagarmatha.save();

  // Subject Allocations
  await SubjectAllocation.create({
    institutionId: kmss._id,
    teacherId: teacherRamesh._id,
    sectionId: sectionSagarmatha._id,
    centralSubjectId: subMath10._id,
  });

  await SubjectAllocation.create({
    institutionId: kmss._id,
    teacherId: teacherSita._id,
    sectionId: sectionSagarmatha._id,
    centralSubjectId: subScience10._id,
  });

  await SubjectAllocation.create({
    institutionId: kmss._id,
    teacherId: teacherHari._id,
    sectionId: sectionSagarmatha._id,
    centralSubjectId: subEnglish10._id,
  });
  console.log('  ✅ Seeded Teachers, designated Section Class Teacher & Subject Allocations');

  // ═════════════════════════════════════════════════════════════════════════
  // 9. TIMETABLE SCHEDULE
  // ═════════════════════════════════════════════════════════════════════════
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'] as const;
  for (const day of days) {
    await TimetableSlot.create({
      institutionId: kmss._id,
      sectionId: sectionSagarmatha._id,
      centralSubjectId: subMath10._id,
      teacherId: teacherRamesh._id,
      dayOfWeek: day,
      periodNumber: 1,
      startTime: '10:00',
      endTime: '10:45',
      roomNumber: 'Room 101',
    });

    await TimetableSlot.create({
      institutionId: kmss._id,
      sectionId: sectionSagarmatha._id,
      centralSubjectId: subScience10._id,
      teacherId: teacherSita._id,
      dayOfWeek: day,
      periodNumber: 2,
      startTime: '10:45',
      endTime: '11:30',
      roomNumber: 'Science Lab 1',
    });

    await TimetableSlot.create({
      institutionId: kmss._id,
      sectionId: sectionSagarmatha._id,
      centralSubjectId: subEnglish10._id,
      teacherId: teacherHari._id,
      dayOfWeek: day,
      periodNumber: 3,
      startTime: '11:30',
      endTime: '12:15',
      roomNumber: 'Room 101',
    });
  }
  console.log('  ✅ Seeded Conflict-Free Class Timetable Entries');

  // ═════════════════════════════════════════════════════════════════════════
  // 10. 8 DISTINCT STUDENT LEARNING-ACCESS PERSONAS
  // ═════════════════════════════════════════════════════════════════════════
  const studentPersonas = [
    {
      username: 'student_fulldigital',
      fullName: 'Aarav Shrestha (Persona 1: Full Digital Access)',
      fullNameNepali: 'आरभ श्रेष्ठ',
      email: 'aarav@kmss.edu.np',
      deviceType: 'PERSONAL_SMARTPHONE' as const,
      hasInternetAtHome: true,
      overrideFeature: null,
    },
    {
      username: 'student_smartphone',
      fullName: 'Bipana Karki (Persona 2: Smartphone Access)',
      fullNameNepali: 'बिपना कार्की',
      email: 'bipana@kmss.edu.np',
      deviceType: 'PERSONAL_SMARTPHONE' as const,
      hasInternetAtHome: true,
      overrideFeature: null,
    },
    {
      username: 'student_shareddevice',
      fullName: 'Chirag Adhikari (Persona 3: Shared School Device)',
      fullNameNepali: 'चिराग अधिकारी',
      email: 'chirag@kmss.edu.np',
      deviceType: 'SHARED_DEVICE' as const,
      hasInternetAtHome: false,
      overrideFeature: null,
    },
    {
      username: 'student_nodevice',
      fullName: 'Dawa Tamang (Persona 4: No Personal Device)',
      fullNameNepali: 'दावा तामाङ',
      email: 'dawa@kmss.edu.np',
      deviceType: 'NO_INDIVIDUAL_DEVICE' as const,
      hasInternetAtHome: false,
      overrideFeature: null,
    },
    {
      username: 'student_smartboardonly',
      fullName: 'Elina Gurung (Persona 5: Smart Board Only Learning)',
      fullNameNepali: 'एलिना गुरुङ',
      email: 'elina@kmss.edu.np',
      deviceType: 'NO_INDIVIDUAL_DEVICE' as const,
      hasInternetAtHome: false,
      overrideFeature: { featureKey: FeatureKey.STUDENT_DASHBOARD, enabled: false },
    },
    {
      username: 'student_noai',
      fullName: 'Firoj Khan (Persona 6: Textbooks Enabled, AI Disabled)',
      fullNameNepali: 'फिरोज खान',
      email: 'firoj@kmss.edu.np',
      deviceType: 'PERSONAL_SMARTPHONE' as const,
      hasInternetAtHome: true,
      overrideFeature: { featureKey: FeatureKey.AI_ASSISTANT, enabled: false },
    },
    {
      username: 'student_noonline_sub',
      fullName: 'Gita Sharma (Persona 7: Restricted Online Submissions)',
      fullNameNepali: 'गीता शर्मा',
      email: 'gita@kmss.edu.np',
      deviceType: 'SCHOOL_COMPUTER' as const,
      hasInternetAtHome: true,
      overrideFeature: { featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION, enabled: false },
    },
    {
      username: 'student_override',
      fullName: 'Hari Thapa (Persona 8: Individual Feature Override)',
      fullNameNepali: 'हरि थापा',
      email: 'hari.student@kmss.edu.np',
      deviceType: 'PERSONAL_SMARTPHONE' as const,
      hasInternetAtHome: true,
      overrideFeature: { featureKey: FeatureKey.SIMULATIONS, enabled: false },
    },
  ];

  const seededStudents: Record<string, any> = {};
  for (let idx = 0; idx < studentPersonas.length; idx++) {
    const p = studentPersonas[idx];
    const user = await User.create({
      institutionId: kmss._id,
      username: p.username,
      email: p.email,
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
      fullName: p.fullName,
      fullNameNepali: p.fullNameNepali,
      status: 'ACTIVE',
    });

    const enrollment = await StudentEnrollment.create({
      studentId: user._id,
      sectionId: sectionSagarmatha._id,
      academicYearId: acadYearKmss._id,
      rollNumber: idx + 1,
      admissionNumber: `KMSS-2081-${1000 + idx + 1}`,
      status: 'ENROLLED',
    });

    // Create Device Profile
    await StudentDeviceProfile.create({
      institutionId: kmss._id,
      studentId: enrollment._id,
      classId: classesKmss[10]._id,
      sectionId: sectionSagarmatha._id,
      deviceType: p.deviceType,
      internetAvailability: p.hasInternetAtHome ? 'BROADBAND' : 'SCHOOL_ONLY',
      notes: `Test Persona: ${p.fullName}`,
      updatedBy: kmssAdmin._id,
    });

    // Explicit student override if present
    if (p.overrideFeature) {
      await StudentFeatureOverride.create({
        institutionId: kmss._id,
        studentId: enrollment._id,
        classId: classesKmss[10]._id,
        sectionId: sectionSagarmatha._id,
        featureKey: p.overrideFeature.featureKey,
        enabled: p.overrideFeature.enabled,
        reason: `Explicit persona test override: ${p.overrideFeature.featureKey} set to ${p.overrideFeature.enabled}`,
        updatedBy: kmssAdmin._id,
      });
    }

    seededStudents[p.username] = user;
  }

  // Also seed default student `student_aarav` for backward demo compatibility
  const studentAarav = seededStudents['student_fulldigital'];
  await User.findOneAndUpdate({ _id: studentAarav._id }, { username: 'student_aarav' });
  seededStudents['student_aarav'] = studentAarav;
  console.log('  ✅ Seeded 8 Distinct Student Personas with Device Profiles & Feature Overrides');

  // ═════════════════════════════════════════════════════════════════════════
  // 11. ASSIGNMENTS & STUDENT SUBMISSIONS
  // ═════════════════════════════════════════════════════════════════════════
  const assignScience = await Assignment.create({
    institutionId: kmss._id,
    sectionId: sectionSagarmatha._id,
    centralSubjectId: subScience10._id,
    teacherId: teacherSita._id,
    title: 'Newtonian Gravitation & Free Fall Proofs',
    description: 'Solve textbook page 45 numericals 1 through 5 and explain gravitational acceleration g variation.',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'ACTIVE',
  });

  const assignMath = await Assignment.create({
    institutionId: kmss._id,
    sectionId: sectionSagarmatha._id,
    centralSubjectId: subMath10._id,
    teacherId: teacherRamesh._id,
    title: 'Compound Interest & Depreciation Project',
    description: 'Calculate semi-annual compound interest on NPR 500,000 for 3 years at 10% p.a.',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    status: 'ACTIVE',
  });

  // Submit student work for Aarav
  await AssignmentSubmission.create({
    assignmentId: assignScience._id,
    studentId: studentAarav._id,
    institutionId: kmss._id,
    content: 'Completed proofs for F = G(m1*m2)/d^2 and g = GM/R^2. Numericals 1 to 5 attached.',
    fileUrl: '/uploads/submissions/aarav_science_hw1.pdf',
    submittedAt: new Date(),
    status: 'GRADED',
    marksObtained: 19,
    feedback: 'Excellent derivations and clear unit annotations. Full marks on question 4.',
    gradedBy: teacherSita._id,
    gradedAt: new Date(),
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 12. ATTENDANCE SESSIONS & RECORDS
  // ═════════════════════════════════════════════════════════════════════════
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendSession = await AttendanceSession.create({
    institutionId: kmss._id,
    academicYearId: acadYearKmss._id,
    classId: classesKmss[10]._id,
    sectionId: sectionSagarmatha._id,
    centralSubjectId: subScience10._id,
    periodNumber: 2,
    date: today,
    takenBy: teacherSita._id,
    totalStudents: 8,
    presentCount: 7,
    absentCount: 1,
    lateCount: 0,
    leaveCount: 0,
    status: 'SUBMITTED',
  });

  const attendanceItems = studentPersonas.map((p, idx) => ({
    studentId: seededStudents[p.username]._id,
    status: (idx === 3 ? 'ABSENT' : 'PRESENT') as any,
    remarks: idx === 3 ? 'Medical leave requested' : 'Regular attendance',
  }));

  await AttendanceRecord.create({
    sessionId: attendSession._id,
    institutionId: kmss._id,
    academicYearId: acadYearKmss._id,
    classId: classesKmss[10]._id,
    sectionId: sectionSagarmatha._id,
    centralSubjectId: subScience10._id,
    periodNumber: 2,
    date: today,
    recordedBy: teacherSita._id,
    records: attendanceItems,
  });
  console.log('  ✅ Seeded Daily Attendance Session & Student Records');

  // ═════════════════════════════════════════════════════════════════════════
  // 13. EXAMINATIONS, ASSESSMENTS & MARKS (NEPAL LETTER GRADING 4.0 GPA)
  // ═════════════════════════════════════════════════════════════════════════
  const gradingScheme = await GradingScheme.create({
    institutionId: kmss._id,
    name: 'Nepal Secondary Letter Grading Framework (CDC 2078)',
    code: 'NEPAL_LETTER_GRADING_4_0',
    isDefault: true,
    intervals: [
      { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0, description: 'Outstanding' },
      { grade: 'A', minPercentage: 80, maxPercentage: 89.99, gpa: 3.6, description: 'Excellent' },
      { grade: 'B+', minPercentage: 70, maxPercentage: 79.99, gpa: 3.2, description: 'Very Good' },
      { grade: 'B', minPercentage: 60, maxPercentage: 69.99, gpa: 2.8, description: 'Good' },
      { grade: 'C+', minPercentage: 50, maxPercentage: 59.99, gpa: 2.4, description: 'Satisfactory' },
      { grade: 'C', minPercentage: 40, maxPercentage: 49.99, gpa: 2.0, description: 'Acceptable' },
      { grade: 'D', minPercentage: 35, maxPercentage: 39.99, gpa: 1.6, description: 'Basic' },
      { grade: 'NG', minPercentage: 0, maxPercentage: 34.99, gpa: 0.0, description: 'Non-Graded' },
    ],
  });

  const term1Exam = await Examination.create({
    institutionId: kmss._id,
    academicYearId: acadYearKmss._id,
    name: 'First Terminal Examination 2081',
    nameNepali: 'प्रथम त्रैमासिक परीक्षा २०८१',
    code: 'TERM-1-2081',
    examType: 'TERMINAL',
    status: 'PUBLISHED',
    startDate: new Date('2024-07-15'),
    endDate: new Date('2024-07-25'),
    gradingSchemeId: gradingScheme._id,
  });

  const scienceAssessment = await ExamAssessment.create({
    examinationId: term1Exam._id,
    institutionId: kmss._id,
    academicYearId: acadYearKmss._id,
    classId: classesKmss[10]._id,
    sectionId: sectionSagarmatha._id,
    centralSubjectId: subScience10._id,
    assignedTeacherId: teacherSita._id,
    examType: 'TERMINAL',
    name: 'Science 10 Term 1 Assessment',
    fullMarksTheory: 75,
    passMarksTheory: 27,
    fullMarksPractical: 25,
    passMarksPractical: 10,
    totalMarks: 100,
    passMarks: 40,
    workflowStatus: 'PUBLISHED',
    isPublished: true,
  });

  const mathAssessment = await ExamAssessment.create({
    examinationId: term1Exam._id,
    institutionId: kmss._id,
    academicYearId: acadYearKmss._id,
    classId: classesKmss[10]._id,
    sectionId: sectionSagarmatha._id,
    centralSubjectId: subMath10._id,
    assignedTeacherId: teacherRamesh._id,
    examType: 'TERMINAL',
    name: 'Mathematics 10 Term 1 Assessment',
    fullMarksTheory: 75,
    passMarksTheory: 27,
    fullMarksPractical: 25,
    passMarksPractical: 10,
    totalMarks: 100,
    passMarks: 40,
    workflowStatus: 'PUBLISHED',
    isPublished: true,
  });

  await StudentMark.create({
    assessmentId: scienceAssessment._id,
    examinationId: term1Exam._id,
    institutionId: kmss._id,
    studentId: studentAarav._id,
    marksObtained: 92,
    marksTheory: 68,
    marksPractical: 24,
    theoryMarks: 68,
    practicalMarks: 24,
    totalMarks: 92,
    percentage: 92,
    grade: 'A+',
    gpa: 4.0,
    workflowStatus: 'PUBLISHED',
    submittedBy: teacherSita._id,
  });

  await StudentMark.create({
    assessmentId: mathAssessment._id,
    examinationId: term1Exam._id,
    institutionId: kmss._id,
    studentId: studentAarav._id,
    marksObtained: 88,
    marksTheory: 65,
    marksPractical: 23,
    theoryMarks: 65,
    practicalMarks: 23,
    totalMarks: 88,
    percentage: 88,
    grade: 'A',
    gpa: 3.6,
    workflowStatus: 'PUBLISHED',
    submittedBy: teacherRamesh._id,
  });
  console.log('  ✅ Seeded Terminal Examination, Assessments, Student Marks & Nepal GPA 4.0 Letter Grades');

  // ═════════════════════════════════════════════════════════════════════════
  // 14. INSTITUTION ANNOUNCEMENTS
  // ═════════════════════════════════════════════════════════════════════════
  await SchoolAnnouncement.create({
    institutionId: kmss._id,
    title: 'First Terminal Examination 2081 Results Published',
    content: 'Students and guardians can now review official letter-graded report cards with GPA on the learning portal.',
    targetAudience: 'ALL',
    publishedBy: kmssPrincipal._id,
  });

  console.log('✨ Comprehensive Nepal Digital Education Ecosystem Seeding Completed Successfully!\n');
  await disconnectDB();
}

if (require.main === module) {
  runComprehensiveSeed().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}
