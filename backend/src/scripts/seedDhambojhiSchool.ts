import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import {
  Institution,
  User,
  AcademicYear,
  Class,
  Section,
  StudentEnrollment,
  CentralSubject,
  Textbook,
  SubjectAllocation,
  SectionSubject,
  TimetableSlot,
  SchoolPeriod,
  TimetableTemplate,
  Timetable,
  TimetableEntry,
  AcademicCalendar,
  Examination,
  ExamAssessment,
  StudentMark,
  GradingScheme,
  AttendanceSession,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  SchoolAnnouncement,
  Notification,
  SubscriptionPlan,
  Subscription,
  StudentDeviceProfile,
} from '../models';
import { SubscriptionsService } from '../modules/subscriptions/subscriptions.service';
import { FeatureAccessService } from '../modules/feature-access/feature-access.service';
import { NepalGradingUtil } from '../common/utils/nepal-grading.util';
import { resetDhambojhiDemoData } from './resetDhambojhiDemoData';

export async function seedDhambojhiSchool() {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🇳🇵 SEEDING COMPLETE DEMO INSTITUTION: DHAMBOJHI SECONDARY SCHOOL (CLASSES 1–12)');
  console.log('══════════════════════════════════════════════════════════════════');

  // Step 0: Ensure database connection & safe tenant-isolated reset
  await connectDB();
  await resetDhambojhiDemoData();

  const demoPassword = process.env.DEMO_USER_PASSWORD || 'DemoPass123!';
  const passwordHash = await bcrypt.hash(demoPassword, 10);

  // ══════════════════════════════════════════════════════════════════
  // 1. INSTITUTION RECORD
  // ══════════════════════════════════════════════════════════════════
  console.log('\n[1/12] Creating Institution profile: Dhambojhi Secondary School...');
  const dhambojhi = await Institution.create({
    emisCode: '570010001',
    name: 'Dhambojhi Secondary School',
    nameNepali: 'धम्बोझी माध्यमिक विद्यालय',
    shortName: 'DSS Nepalgunj',
    registrationNumber: 'BANK-NPG-2083-001',
    description: 'Premier community secondary school in Nepalgunj, Banke offering CDC accredited Classes 1–12 in English and Nepali mediums.',
    institutionKind: 'SCHOOL',
    type: 'COMMUNITY',
    category: 'COMMUNITY',
    province: 'Lumbini Province',
    district: 'Banke',
    localLevel: 'Nepalgunj Sub-Metropolitan City',
    ward: 1,
    status: 'ACTIVE',
    email: 'info@dhambojhi.edu.np.test',
    phone: '081-520111',
    currentAcademicYear: '2083',
    educationLevels: ['PRIMARY', 'BASIC', 'SECONDARY', 'HIGHER_SECONDARY'],
    mediumOfInstruction: 'BOTH',
    provisioningStatus: 'PROVISIONED',
    schoolTimings: {
      startTime: '10:00',
      endTime: '16:00',
      periodDurationMinutes: 45,
      breakTime: '13:00 - 13:45',
    },
    workingDays: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
  });
  console.log(`  ✅ Institution created: ${dhambojhi.name} (EMIS: ${dhambojhi.emisCode}, ID: ${dhambojhi._id})`);

  // ══════════════════════════════════════════════════════════════════
  // 2. ACADEMIC YEAR 2083 BS
  // ══════════════════════════════════════════════════════════════════
  console.log('\n[2/12] Creating Academic Year 2083 BS...');
  const academicYear2083 = await AcademicYear.create({
    institutionId: dhambojhi._id,
    name: '2083',
    nameNepali: '२०८३',
    isCurrent: true,
    startDate: new Date('2026-04-14'), // Baisakh 1, 2083
    endDate: new Date('2027-04-13'),   // Chaitra 30, 2083
  });
  console.log(`  ✅ Academic Year 2083 created (ID: ${academicYear2083._id})`);

  // ══════════════════════════════════════════════════════════════════
  // 3. SUBSCRIPTION & FEATURE ACCESS
  // ══════════════════════════════════════════════════════════════════
  console.log('\n[3/12] Setting up K-12 Comprehensive Subscription & Full Digital Access...');
  await SubscriptionsService.seedDefaultNepalPlans();
  let k12Plan = await SubscriptionPlan.findOne({ code: 'K12_ALL' });
  if (!k12Plan) {
    k12Plan = await SubscriptionPlan.findOne({ code: 'SECONDARY' }) || await SubscriptionPlan.findOne({});
  }

  if (k12Plan) {
    await Subscription.create({
      institutionId: dhambojhi._id,
      planId: k12Plan._id,
      planCode: k12Plan.code,
      status: 'ACTIVE',
      startDate: new Date('2026-04-14'),
      endDate: new Date('2027-04-13'),
      gracePeriodEndDate: new Date('2027-05-13'),
      studentQuota: 2000,
      teacherQuota: 100,
      featuresIncluded: {
        gradesCovered: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        isTextbooksIncluded: true,
        isSimulationsIncluded: true,
        isActivitiesIncluded: true,
        isSmartBoardIncluded: true,
        isAiAssistantIncluded: true,
        isAcademicManagementIncluded: true,
        isAnalyticsIncluded: true,
      },
    });
    await SubscriptionsService.refreshEntitlements(dhambojhi._id.toString());
  }

  // ══════════════════════════════════════════════════════════════════
  // 4. ADMINISTRATIVE ACCOUNTS (School Admin & Principal)
  // ══════════════════════════════════════════════════════════════════
  console.log('\n[4/12] Creating School Administrator and Principal accounts...');
  const schoolAdmin = await User.create({
    institutionId: dhambojhi._id,
    username: 'dhambojhi_admin',
    email: 'admin@dhambojhi.edu.np.test',
    passwordHash,
    role: 'SCHOOL_ADMIN',
    fullName: 'Ram Chandra Sharma',
    fullNameNepali: 'रामचन्द्र शर्मा',
    phone: '9848011222',
    status: 'ACTIVE',
  });

  const principal = await User.create({
    institutionId: dhambojhi._id,
    username: 'dhambojhi_principal',
    email: 'principal@dhambojhi.edu.np.test',
    passwordHash,
    role: 'PRINCIPAL',
    fullName: 'Dr. Shailesh Kumar Verma',
    fullNameNepali: 'डा. शैलेश कुमार वर्मा',
    phone: '9858022333',
    status: 'ACTIVE',
  });
  console.log(`  ✅ School Admin: dhambojhi_admin (ID: ${schoolAdmin._id})`);
  console.log(`  ✅ Principal: dhambojhi_principal (ID: ${principal._id})`);

  // Activate FULL_DIGITAL mode across institution
  await FeatureAccessService.applyLearningMode({
    institutionId: dhambojhi._id.toString(),
    learningMode: 'FULL_DIGITAL',
    userId: schoolAdmin._id.toString(),
  });

  // ══════════════════════════════════════════════════════════════════
  // 5. CDC CENTRAL CURRICULUM SUBJECTS (Classes 1–12)
  // ══════════════════════════════════════════════════════════════════
  console.log('\n[5/12] Ensuring CDC Curriculum Central Subjects for Classes 1–12...');
  const cdcSubjectsData = [
    // Primary (1-5)
    { code: 'NEP1', name: 'Compulsory Nepali', nameNepali: 'अनिवार्य नेपाली', gradeNumber: 1, stream: 'GENERAL', creditHours: 5 },
    { code: 'ENG1', name: 'Compulsory English', nameNepali: 'अनिवार्य अङ्ग्रेजी', gradeNumber: 1, stream: 'GENERAL', creditHours: 5 },
    { code: 'MTH1', name: 'Mathematics', nameNepali: 'गणित', gradeNumber: 1, stream: 'GENERAL', creditHours: 5 },
    { code: 'SER1', name: 'Our Surrounding', nameNepali: 'हाम्रो सेरोफेरो', gradeNumber: 1, stream: 'GENERAL', creditHours: 5 },

    { code: 'NEP2', name: 'Compulsory Nepali', nameNepali: 'अनिवार्य नेपाली', gradeNumber: 2, stream: 'GENERAL', creditHours: 5 },
    { code: 'ENG2', name: 'Compulsory English', nameNepali: 'अनिवार्य अङ्ग्रेजी', gradeNumber: 2, stream: 'GENERAL', creditHours: 5 },
    { code: 'MTH2', name: 'Mathematics', nameNepali: 'गणित', gradeNumber: 2, stream: 'GENERAL', creditHours: 5 },
    { code: 'SER2', name: 'Our Surrounding', nameNepali: 'हाम्रो सेरोफेरो', gradeNumber: 2, stream: 'GENERAL', creditHours: 5 },

    { code: 'NEP3', name: 'Compulsory Nepali', nameNepali: 'अनिवार्य नेपाली', gradeNumber: 3, stream: 'GENERAL', creditHours: 5 },
    { code: 'ENG3', name: 'Compulsory English', nameNepali: 'अनिवार्य अङ्ग्रेजी', gradeNumber: 3, stream: 'GENERAL', creditHours: 5 },
    { code: 'MTH3', name: 'Mathematics', nameNepali: 'गणित', gradeNumber: 3, stream: 'GENERAL', creditHours: 5 },
    { code: 'SER3', name: 'Our Surrounding', nameNepali: 'हाम्रो सेरोफेरो', gradeNumber: 3, stream: 'GENERAL', creditHours: 5 },

    { code: 'NEP4', name: 'Compulsory Nepali', nameNepali: 'अनिवार्य नेपाली', gradeNumber: 4, stream: 'GENERAL', creditHours: 5 },
    { code: 'ENG4', name: 'Compulsory English', nameNepali: 'अनिवार्य अङ्ग्रेजी', gradeNumber: 4, stream: 'GENERAL', creditHours: 5 },
    { code: 'MTH4', name: 'Mathematics', nameNepali: 'गणित', gradeNumber: 4, stream: 'GENERAL', creditHours: 5 },
    { code: 'SCI4', name: 'Science & Technology', nameNepali: 'विज्ञान तथा प्रविधि', gradeNumber: 4, stream: 'GENERAL', creditHours: 4 },
    { code: 'SOC4', name: 'Social Studies & Human Values', nameNepali: 'सामाजिक अध्ययन तथा मानव मूल्य', gradeNumber: 4, stream: 'GENERAL', creditHours: 4 },

    { code: 'NEP5', name: 'Compulsory Nepali', nameNepali: 'अनिवार्य नेपाली', gradeNumber: 5, stream: 'GENERAL', creditHours: 5 },
    { code: 'ENG5', name: 'Compulsory English', nameNepali: 'अनिवार्य अङ्ग्रेजी', gradeNumber: 5, stream: 'GENERAL', creditHours: 5 },
    { code: 'MTH5', name: 'Mathematics', nameNepali: 'गणित', gradeNumber: 5, stream: 'GENERAL', creditHours: 5 },
    { code: 'SCI5', name: 'Science & Technology', nameNepali: 'विज्ञान तथा प्रविधि', gradeNumber: 5, stream: 'GENERAL', creditHours: 4 },
    { code: 'SOC5', name: 'Social Studies & Human Values', nameNepali: 'सामाजिक अध्ययन तथा मानव मूल्य', gradeNumber: 5, stream: 'GENERAL', creditHours: 4 },

    // Lower Secondary (6-8)
    { code: 'NEP6', name: 'Compulsory Nepali', nameNepali: 'अनिवार्य नेपाली', gradeNumber: 6, stream: 'GENERAL', creditHours: 5 },
    { code: 'ENG6', name: 'Compulsory English', nameNepali: 'अनिवार्य अङ्ग्रेजी', gradeNumber: 6, stream: 'GENERAL', creditHours: 5 },
    { code: 'MTH6', name: 'Compulsory Mathematics', nameNepali: 'अनिवार्य गणित', gradeNumber: 6, stream: 'GENERAL', creditHours: 5 },
    { code: 'SCI6', name: 'Science & Technology', nameNepali: 'विज्ञान तथा प्रविधि', gradeNumber: 6, stream: 'GENERAL', creditHours: 5 },
    { code: 'SOC6', name: 'Social Studies & Human Values', nameNepali: 'सामाजिक अध्ययन तथा मानव मूल्य', gradeNumber: 6, stream: 'GENERAL', creditHours: 5 },

    { code: 'NEP7', name: 'Compulsory Nepali', nameNepali: 'अनिवार्य नेपाली', gradeNumber: 7, stream: 'GENERAL', creditHours: 5 },
    { code: 'ENG7', name: 'Compulsory English', nameNepali: 'अनिवार्य अङ्ग्रेजी', gradeNumber: 7, stream: 'GENERAL', creditHours: 5 },
    { code: 'MTH7', name: 'Compulsory Mathematics', nameNepali: 'अनिवार्य गणित', gradeNumber: 7, stream: 'GENERAL', creditHours: 5 },
    { code: 'SCI7', name: 'Science & Technology', nameNepali: 'विज्ञान तथा प्रविधि', gradeNumber: 7, stream: 'GENERAL', creditHours: 5 },
    { code: 'SOC7', name: 'Social Studies & Human Values', nameNepali: 'सामाजिक अध्ययन तथा मानव मूल्य', gradeNumber: 7, stream: 'GENERAL', creditHours: 5 },

    { code: 'NEP8', name: 'Compulsory Nepali', nameNepali: 'अनिवार्य नेपाली', gradeNumber: 8, stream: 'GENERAL', creditHours: 5 },
    { code: 'ENG8', name: 'Compulsory English', nameNepali: 'अनिवार्य अङ्ग्रेजी', gradeNumber: 8, stream: 'GENERAL', creditHours: 5 },
    { code: 'MTH8', name: 'Compulsory Mathematics', nameNepali: 'अनिवार्य गणित', gradeNumber: 8, stream: 'GENERAL', creditHours: 5 },
    { code: 'SCI8', name: 'Science & Technology', nameNepali: 'विज्ञान तथा प्रविधि', gradeNumber: 8, stream: 'GENERAL', creditHours: 5 },
    { code: 'SOC8', name: 'Social Studies & Human Values', nameNepali: 'सामाजिक अध्ययन तथा मानव मूल्य', gradeNumber: 8, stream: 'GENERAL', creditHours: 5 },

    // Secondary (9-10)
    { code: 'NEP9', name: 'Compulsory Nepali', nameNepali: 'अनिवार्य नेपाली', gradeNumber: 9, stream: 'GENERAL', creditHours: 5 },
    { code: 'ENG9', name: 'Compulsory English', nameNepali: 'अनिवार्य अङ्ग्रेजी', gradeNumber: 9, stream: 'GENERAL', creditHours: 5 },
    { code: 'MTH9', name: 'Compulsory Mathematics', nameNepali: 'अनिवार्य गणित', gradeNumber: 9, stream: 'GENERAL', creditHours: 5 },
    { code: 'SCI9', name: 'Compulsory Science & Technology', nameNepali: 'अनिवार्य विज्ञान तथा प्रविधि', gradeNumber: 9, stream: 'GENERAL', creditHours: 5 },
    { code: 'SOC9', name: 'Compulsory Social Studies', nameNepali: 'अनिवार्य सामाजिक अध्ययन', gradeNumber: 9, stream: 'GENERAL', creditHours: 4 },

    { code: 'NEP10', name: 'Compulsory Nepali', nameNepali: 'अनिवार्य नेपाली', gradeNumber: 10, stream: 'GENERAL', creditHours: 5 },
    { code: 'ENG10', name: 'Compulsory English', nameNepali: 'अनिवार्य अङ्ग्रेजी', gradeNumber: 10, stream: 'GENERAL', creditHours: 5 },
    { code: 'MTH10', name: 'Compulsory Mathematics', nameNepali: 'अनिवार्य गणित', gradeNumber: 10, stream: 'GENERAL', creditHours: 5 },
    { code: 'SCI10', name: 'Compulsory Science & Technology', nameNepali: 'अनिवार्य विज्ञान तथा प्रविधि', gradeNumber: 10, stream: 'GENERAL', creditHours: 5 },
    { code: 'SOC10', name: 'Compulsory Social Studies', nameNepali: 'अनिवार्य सामाजिक अध्ययन', gradeNumber: 10, stream: 'GENERAL', creditHours: 4 },

    // Higher Secondary - Science (11-12)
    { code: 'ENG11S', name: 'Compulsory English', nameNepali: 'अनिवार्य अङ्ग्रेजी', gradeNumber: 11, stream: 'SCIENCE', creditHours: 4 },
    { code: 'NEP11S', name: 'Compulsory Nepali', nameNepali: 'अनिवार्य नेपाली', gradeNumber: 11, stream: 'SCIENCE', creditHours: 4 },
    { code: 'PHY11', name: 'Physics', nameNepali: 'भौतिकशास्त्र', gradeNumber: 11, stream: 'SCIENCE', creditHours: 5 },
    { code: 'CHM11', name: 'Chemistry', nameNepali: 'रसायनशास्त्र', gradeNumber: 11, stream: 'SCIENCE', creditHours: 5 },
    { code: 'BIO11', name: 'Biology', nameNepali: 'जीवविज्ञान', gradeNumber: 11, stream: 'SCIENCE', creditHours: 5 },
    { code: 'MTH11S', name: 'Mathematics', nameNepali: 'गणित', gradeNumber: 11, stream: 'SCIENCE', creditHours: 5 },

    { code: 'ENG12S', name: 'Compulsory English', nameNepali: 'अनिवार्य अङ्ग्रेजी', gradeNumber: 12, stream: 'SCIENCE', creditHours: 4 },
    { code: 'NEP12S', name: 'Compulsory Nepali', nameNepali: 'अनिवार्य नेपाली', gradeNumber: 12, stream: 'SCIENCE', creditHours: 4 },
    { code: 'PHY12', name: 'Physics', nameNepali: 'भौतिकशास्त्र', gradeNumber: 12, stream: 'SCIENCE', creditHours: 5 },
    { code: 'CHM12', name: 'Chemistry', nameNepali: 'रसायनशास्त्र', gradeNumber: 12, stream: 'SCIENCE', creditHours: 5 },
    { code: 'BIO12', name: 'Biology', nameNepali: 'जीवविज्ञान', gradeNumber: 12, stream: 'SCIENCE', creditHours: 5 },
    { code: 'MTH12S', name: 'Mathematics', nameNepali: 'गणित', gradeNumber: 12, stream: 'SCIENCE', creditHours: 5 },

    // Higher Secondary - Management (11-12)
    { code: 'ENG11M', name: 'Compulsory English', nameNepali: 'अनिवार्य अङ्ग्रेजी', gradeNumber: 11, stream: 'MANAGEMENT', creditHours: 4 },
    { code: 'NEP11M', name: 'Compulsory Nepali', nameNepali: 'अनिवार्य नेपाली', gradeNumber: 11, stream: 'MANAGEMENT', creditHours: 4 },
    { code: 'ACC11', name: 'Principles of Accounting', nameNepali: 'लेखाविधि सिद्धान्त', gradeNumber: 11, stream: 'MANAGEMENT', creditHours: 5 },
    { code: 'ECO11', name: 'Economics', nameNepali: 'अर्थशास्त्र', gradeNumber: 11, stream: 'MANAGEMENT', creditHours: 5 },
    { code: 'BST11', name: 'Business Studies', nameNepali: 'व्यवसाय अध्ययन', gradeNumber: 11, stream: 'MANAGEMENT', creditHours: 5 },
    { code: 'BMT11', name: 'Business Mathematics', nameNepali: 'व्यावसायिक गणित', gradeNumber: 11, stream: 'MANAGEMENT', creditHours: 5 },

    { code: 'ENG12M', name: 'Compulsory English', nameNepali: 'अनिवार्य अङ्ग्रेजी', gradeNumber: 12, stream: 'MANAGEMENT', creditHours: 4 },
    { code: 'NEP12M', name: 'Compulsory Nepali', nameNepali: 'अनिवार्य नेपाली', gradeNumber: 12, stream: 'MANAGEMENT', creditHours: 4 },
    { code: 'ACC12', name: 'Principles of Accounting II', nameNepali: 'लेखाविधि सिद्धान्त २', gradeNumber: 12, stream: 'MANAGEMENT', creditHours: 5 },
    { code: 'ECO12', name: 'Economics II', nameNepali: 'अर्थशास्त्र २', gradeNumber: 12, stream: 'MANAGEMENT', creditHours: 5 },
    { code: 'BST12', name: 'Business Studies II', nameNepali: 'व्यवसाय अध्ययन २', gradeNumber: 12, stream: 'MANAGEMENT', creditHours: 5 },
    { code: 'BMT12', name: 'Business Mathematics II', nameNepali: 'व्यावसायिक गणित २', gradeNumber: 12, stream: 'MANAGEMENT', creditHours: 5 },
  ];

  const centralSubjectsMap = new Map<string, any>();
  for (const s of cdcSubjectsData) {
    const doc = await CentralSubject.findOneAndUpdate(
      { code: s.code },
      { $set: s },
      { upsert: true, returnDocument: 'after' }
    );
    centralSubjectsMap.set(s.code, doc);
  }
  console.log(`  ✅ Synced ${centralSubjectsMap.size} Central Curriculum Subjects`);

  // Query all published CDC textbooks to link directly into timetables
  const allTextbooks = await Textbook.find({ status: 'PUBLISHED' }).select('_id title gradeNumber medium subjectId');
  console.log(`  📚 Loaded ${allTextbooks.length} published CDC Textbooks for timetable attachments`);

  // ══════════════════════════════════════════════════════════════════
  // 6. CLASSES (14 total) & SECTIONS (28 total: Section A English, Section B Nepali)
  // ══════════════════════════════════════════════════════════════════
  console.log('\n[6/12] Creating 14 Classes and 28 Sections (Section A English, Section B Nepali)...');
  interface ClassDef {
    gradeNumber: number;
    name: string;
    stream: string;
    testStudentUsername: string;
    testStudentName: string;
    testStudentNameNepali: string;
  }

  const classDefs: ClassDef[] = [
    { gradeNumber: 1, name: 'Grade 1', stream: 'GENERAL', testStudentUsername: 'dhambojhi_s_g01', testStudentName: 'Aarav Sharma', testStudentNameNepali: 'आरभ शर्मा' },
    { gradeNumber: 2, name: 'Grade 2', stream: 'GENERAL', testStudentUsername: 'dhambojhi_s_g02', testStudentName: 'Bikash Thapa', testStudentNameNepali: 'विकास थापा' },
    { gradeNumber: 3, name: 'Grade 3', stream: 'GENERAL', testStudentUsername: 'dhambojhi_s_g03', testStudentName: 'Rohan Chaudhary', testStudentNameNepali: 'रोहन चौधरी' },
    { gradeNumber: 4, name: 'Grade 4', stream: 'GENERAL', testStudentUsername: 'dhambojhi_s_g04', testStudentName: 'Ayush Yadav', testStudentNameNepali: 'आयुष यादव' },
    { gradeNumber: 5, name: 'Grade 5', stream: 'GENERAL', testStudentUsername: 'dhambojhi_s_g05', testStudentName: 'Nishan Magar', testStudentNameNepali: 'निशान मगर' },
    { gradeNumber: 6, name: 'Grade 6', stream: 'GENERAL', testStudentUsername: 'dhambojhi_s_g06', testStudentName: 'Saroj Shrestha', testStudentNameNepali: 'सरोज श्रेष्ठ' },
    { gradeNumber: 7, name: 'Grade 7', stream: 'GENERAL', testStudentUsername: 'dhambojhi_s_g07', testStudentName: 'Bibek Adhikari', testStudentNameNepali: 'विवेक अधिकारी' },
    { gradeNumber: 8, name: 'Grade 8', stream: 'GENERAL', testStudentUsername: 'dhambojhi_s_g08', testStudentName: 'Dipendra KC', testStudentNameNepali: 'दिपेन्द्र केसी' },
    { gradeNumber: 9, name: 'Grade 9', stream: 'GENERAL', testStudentUsername: 'dhambojhi_s_g09', testStudentName: 'Manish Karki', testStudentNameNepali: 'मनिष कार्की' },
    { gradeNumber: 10, name: 'Grade 10', stream: 'GENERAL', testStudentUsername: 'dhambojhi_s_g10', testStudentName: 'Kiran Verma', testStudentNameNepali: 'किरण वर्मा' },
    { gradeNumber: 11, name: 'Grade 11 - Science', stream: 'SCIENCE', testStudentUsername: 'dhambojhi_s_g11s', testStudentName: 'Prabin Joshi', testStudentNameNepali: 'प्रविन जोशी' },
    { gradeNumber: 11, name: 'Grade 11 - Management', stream: 'MANAGEMENT', testStudentUsername: 'dhambojhi_s_g11m', testStudentName: 'Santosh Gautam', testStudentNameNepali: 'सन्तोष गौतम' },
    { gradeNumber: 12, name: 'Grade 12 - Science', stream: 'SCIENCE', testStudentUsername: 'dhambojhi_s_g12s', testStudentName: 'Ananya Tharu', testStudentNameNepali: 'अनन्या थारू' },
    { gradeNumber: 12, name: 'Grade 12 - Management', stream: 'MANAGEMENT', testStudentUsername: 'dhambojhi_s_g12m', testStudentName: 'Pooja Shah', testStudentNameNepali: 'पूजा शाह' },
  ];

  const createdClasses: any[] = [];
  const createdSections: any[] = [];

  for (const cDef of classDefs) {
    const classDoc = await Class.create({
      institutionId: dhambojhi._id,
      gradeNumber: cDef.gradeNumber,
      name: cDef.name,
      board: 'Nepal CDC',
      stream: cDef.stream,
    });
    createdClasses.push({ ...classDoc.toObject(), _id: classDoc._id, testMeta: cDef });

    // Section A = ENGLISH, Section B = NEPALI
    for (const secDef of [
      { name: 'Section A', medium: 'ENGLISH' as const },
      { name: 'Section B', medium: 'NEPALI' as const },
    ]) {
      const sectionDoc = await Section.create({
        classId: classDoc._id,
        academicYearId: academicYear2083._id,
        name: secDef.name,
        medium: secDef.medium,
        capacity: 45,
      });
      createdSections.push(sectionDoc);
    }
  }
  console.log(`  ✅ Created ${createdClasses.length} Classes and ${createdSections.length} Sections (Dual-Medium)`);

  // ══════════════════════════════════════════════════════════════════
  // 7. 30 FICTIONAL TEACHERS & CLASS TEACHER ALLOCATIONS (ALL 28 SECTIONS)
  // ══════════════════════════════════════════════════════════════════
  console.log('\n[7/12] Creating 30 Fictional Teachers and allocating designated Class Teachers for all 28 sections...');
  const teacherRosterData = [
    { username: 'dhambojhi_t_01', name: 'Bishnu Prasad Thapa', nameNp: 'विष्णु प्रसाद थापा', phone: '9848100001', spec: 'Science & Physics', qual: 'M.Sc. Physics' },
    { username: 'dhambojhi_t_02', name: 'Sita Kumari Gurung', nameNp: 'सीता कुमारी गुरुङ', phone: '9848100002', spec: 'Compulsory Nepali', qual: 'M.A. Nepali' },
    { username: 'dhambojhi_t_03', name: 'Ramesh Chandra Adhikari', nameNp: 'रमेश चन्द्र अधिकारी', phone: '9848100003', spec: 'Compulsory Mathematics', qual: 'M.Sc. Mathematics' },
    { username: 'dhambojhi_t_04', name: 'Saraswati Shrestha', nameNp: 'सरस्वती श्रेष्ठ', phone: '9848100004', spec: 'Compulsory English', qual: 'M.A. English' },
    { username: 'dhambojhi_t_05', name: 'Hari Prasad Kandel', nameNp: 'हरि प्रसाद कँडेल', phone: '9848100005', spec: 'Social Studies & History', qual: 'M.A. Sociology' },
    { username: 'dhambojhi_t_06', name: 'Anjali Kumari Chaudhary', nameNp: 'अञ्जली कुमारी चौधरी', phone: '9848100006', spec: 'Chemistry', qual: 'M.Sc. Chemistry' },
    { username: 'dhambojhi_t_07', name: 'Binod Kumar Yadav', nameNp: 'विनोद कुमार यादव', phone: '9848100007', spec: 'Biology & Environmental Science', qual: 'M.Sc. Zoology' },
    { username: 'dhambojhi_t_08', name: 'Gita Pokharel', nameNp: 'गीता पोखरेल', phone: '9848100008', spec: 'Primary Education & Surrounding', qual: 'B.Ed. Primary' },
    { username: 'dhambojhi_t_09', name: 'Deepak Shah', nameNp: 'दीपक शाह', phone: '9848100009', spec: 'Principles of Accounting', qual: 'M.B.S. Accountancy' },
    { username: 'dhambojhi_t_10', name: 'Kalpana Gautam', nameNp: 'कल्पना गौतम', phone: '9848100010', spec: 'Economics & Business Studies', qual: 'M.A. Economics' },
    { username: 'dhambojhi_t_11', name: 'Narayan Prasad Joshi', nameNp: 'नारायण प्रसाद जोशी', phone: '9848100011', spec: 'Business Mathematics & Stats', qual: 'M.Sc. Statistics' },
    { username: 'dhambojhi_t_12', name: 'Mina Tamang', nameNp: 'मिना तामाङ', phone: '9848100012', spec: 'Primary English & Arts', qual: 'B.Ed. English' },
    { username: 'dhambojhi_t_13', name: 'Santosh Acharya', nameNp: 'सन्तोष आचार्य', phone: '9848100013', spec: 'Science & Computer Tech', qual: 'M.Sc. IT' },
    { username: 'dhambojhi_t_14', name: 'Rupa Magar', nameNp: 'रूपा मगर', phone: '9848100014', spec: 'Health & Creative Arts', qual: 'B.Ed. Health' },
    { username: 'dhambojhi_t_15', name: 'Arjun Basnet', nameNp: 'अर्जुन बस्नेत', phone: '9848100015', spec: 'Secondary Mathematics', qual: 'M.Sc. Math' },
    { username: 'dhambojhi_t_16', name: 'Manisha KC', nameNp: 'मनिषा केसी', phone: '9848100016', spec: 'Secondary Science', qual: 'M.Sc. Botany' },
    { username: 'dhambojhi_t_17', name: 'Suresh Bhattarai', nameNp: 'सुरेश भट्टराई', phone: '9848100017', spec: 'Secondary English', qual: 'M.A. English' },
    { username: 'dhambojhi_t_18', name: 'Sunita Pandey', nameNp: 'सुनिता पाण्डे', phone: '9848100018', spec: 'Primary Mathematics & Nepali', qual: 'B.Ed. Math' },
    { username: 'dhambojhi_t_19', name: 'Prakash Regmi', nameNp: 'प्रकाश रेग्मी', phone: '9848100019', spec: 'Higher Sec Physics', qual: 'M.Sc. Physics' },
    { username: 'dhambojhi_t_20', name: 'Rashmi Maharjan', nameNp: 'रश्मि महर्जन', phone: '9848100020', spec: 'Higher Sec Chemistry', qual: 'M.Sc. Chemistry' },
    { username: 'dhambojhi_t_21', name: 'Krishna Giri', nameNp: 'कृष्ण गिरी', phone: '9848100021', spec: 'Social Studies & Moral Edu', qual: 'M.A. Sociology' },
    { username: 'dhambojhi_t_22', name: 'Jamuna Rijal', nameNp: 'जमुना रिजाल', phone: '9848100022', spec: 'Primary Education', qual: 'B.Ed. Primary' },
    { username: 'dhambojhi_t_23', name: 'Tilak Bahadur BK', nameNp: 'तिलक बहादुर वि.क.', phone: '9848100023', spec: 'Accountancy & Taxation', qual: 'M.B.S. Finance' },
    { username: 'dhambojhi_t_24', name: 'Sabina Bohara', nameNp: 'सविना बोहरा', phone: '9848100024', spec: 'Higher Sec Biology', qual: 'M.Sc. Zoology' },
    { username: 'dhambojhi_t_25', name: 'Maheshwor Jha', nameNp: 'महेश्वर झा', phone: '9848100025', spec: 'Higher Sec English & Lit', qual: 'M.A. English' },
    { username: 'dhambojhi_t_26', name: 'Umesh Neupane', nameNp: 'उमेश न्यौपाने', phone: '9848100026', spec: 'Higher Sec Mathematics', qual: 'M.Sc. Math' },
    { username: 'dhambojhi_t_27', name: 'Bindu Karki', nameNp: 'विन्दु कार्की', phone: '9848100027', spec: 'English Language & Lit', qual: 'M.A. English' },
    { username: 'dhambojhi_t_28', name: 'Lokendra Rawal', nameNp: 'लोकेन्द्र रावल', phone: '9848100028', spec: 'Physics & Applied Sciences', qual: 'M.Sc. Physics' },
    { username: 'dhambojhi_t_29', name: 'Sarita Gautam', nameNp: 'सरिता गौतम', phone: '9848100029', spec: 'Business Management & Banking', qual: 'M.B.S. Finance' },
    { username: 'dhambojhi_t_30', name: 'Govinda Poudel', nameNp: 'गोविन्द पौडेल', phone: '9848100030', spec: 'Social Studies & Nepalese Society', qual: 'M.A. Sociology' },
  ];

  const createdTeachers: any[] = [];
  for (const t of teacherRosterData) {
    const tUser = await User.create({
      institutionId: dhambojhi._id,
      username: t.username,
      email: `${t.username}@dhambojhi.edu.np.test`,
      passwordHash,
      role: 'TEACHER',
      fullName: t.name,
      fullNameNepali: t.nameNp,
      phone: t.phone,
      status: 'ACTIVE',
      metadata: {
        specialization: t.spec,
        qualification: t.qual,
      },
    });
    createdTeachers.push(tUser);
  }
  console.log(`  ✅ Created ${createdTeachers.length} Fictional Teachers`);

  // Assign designated Class Teacher to each section
  for (let i = 0; i < createdSections.length; i++) {
    const assignedTeacher = createdTeachers[i % createdTeachers.length];
    createdSections[i].classTeacherId = assignedTeacher._id;
    await createdSections[i].save();
  }
  console.log(`  ✅ Assigned designated Class Teachers for all ${createdSections.length} Sections`);

  // Helper to find applicable subjects for a class
  const getSubjectsForClass = (gradeNumber: number, stream: string) => {
    return Array.from(centralSubjectsMap.values()).filter(
      (s) => s.gradeNumber === gradeNumber && s.stream === stream
    );
  };

  // ══════════════════════════════════════════════════════════════════
  // 8. SECTION SUBJECTS & TEACHER ALLOCATIONS
  // ══════════════════════════════════════════════════════════════════
  console.log('\n[8/12] Configuring Section Subjects & Allocations across all 28 Sections...');
  const subjectAllocations: any[] = [];
  const sectionSubjects: any[] = [];
  const existingAllocMap = new Map<string, any>();

  for (let sIdx = 0; sIdx < createdSections.length; sIdx++) {
    const section = createdSections[sIdx];
    const parentClass = createdClasses.find((c) => c._id.toString() === section.classId.toString());
    if (!parentClass) continue;

    const subjects = getSubjectsForClass(parentClass.gradeNumber, parentClass.stream);
    for (let k = 0; k < subjects.length; k++) {
      const subject = subjects[k];
      const teacher = createdTeachers[(sIdx + k * 3) % createdTeachers.length];

      // 1. Create SectionSubject offering
      const secSub = await SectionSubject.create({
        institutionId: dhambojhi._id,
        academicYearId: academicYear2083._id,
        classId: parentClass._id,
        sectionId: section._id,
        centralSubjectId: subject._id,
        medium: section.medium,
        periodsPerWeek: 5,
        practicalPeriodsPerWeek: parentClass.stream === 'SCIENCE' ? 2 : 0,
        isOptional: false,
        isActive: true,
        configuredBy: schoolAdmin._id,
      });
      sectionSubjects.push(secSub);

      // 2. Create SubjectAllocation
      const allocKey = `${section._id.toString()}_${subject._id.toString()}_${teacher._id.toString()}`;
      if (!existingAllocMap.has(allocKey)) {
        const alloc = await SubjectAllocation.create({
          sectionId: section._id,
          centralSubjectId: subject._id,
          teacherId: teacher._id,
        });
        existingAllocMap.set(allocKey, alloc);
        subjectAllocations.push(alloc);
      }
    }
  }
  console.log(`  ✅ Created ${sectionSubjects.length} Section Subjects and ${subjectAllocations.length} Subject Allocations`);

  // ══════════════════════════════════════════════════════════════════
  // 9. 252 STUDENTS ENROLLED (14 TEST ACCOUNTS + 238 COHORTS)
  // ══════════════════════════════════════════════════════════════════
  console.log('\n[9/12] Creating 252 Fictional Students, Enrollments & Device Profiles (14 Test Accounts)...');

  const firstNamesM = ['Aarav', 'Bikash', 'Rohan', 'Ayush', 'Nishan', 'Saroj', 'Bibek', 'Dipendra', 'Manish', 'Kiran', 'Prabin', 'Santosh'];
  const firstNamesF = ['Ananya', 'Puja', 'Pratima', 'Sweta', 'Pooja', 'Aayusha', 'Sujata', 'Kritika', 'Manisha', 'Priyanka', 'Sunita', 'Karishma'];
  const firstNamesMNp = ['आरभ', 'विकास', 'रोहन', 'आयुष', 'निशान', 'सरोज', 'विवेक', 'दिपेन्द्र', 'मनिष', 'किरण', 'प्रविन', 'सन्तोष'];
  const firstNamesFNp = ['अनन्या', 'पूजा', 'प्रतिमा', 'श्वेता', 'पुजा', 'आयुषा', 'सुजाता', 'कृतिका', 'मनिषा', 'प्रियङ्का', 'सुनिता', 'करिश्मा'];
  const lastNames = ['Chaudhary', 'Tharu', 'Yadav', 'Shah', 'Verma', 'Thapa', 'Magar', 'Shrestha', 'Adhikari', 'KC', 'Karki', 'Sharma'];
  const lastNamesNp = ['चौधरी', 'थारू', 'यादव', 'शाह', 'वर्मा', 'थापा', 'मगर', 'श्रेष्ठ', 'अधिकारी', 'केसी', 'कार्की', 'शर्मा'];

  const enrolledStudents: any[] = [];
  let studentCounter = 1;

  for (const section of createdSections) {
    const parentClass = createdClasses.find((c) => c._id.toString() === section.classId.toString());
    const isSectionA = section.name.includes('A');
    const studentsPerSection = 9; // 28 sections * 9 = 252 students

    for (let r = 1; r <= studentsPerSection; r++) {
      let username: string;
      let fullName: string;
      let fullNameNepali: string;

      // Use predictable test student account for Roll 1 of Section A in each class
      if (isSectionA && r === 1 && parentClass?.testMeta) {
        username = parentClass.testMeta.testStudentUsername;
        fullName = parentClass.testMeta.testStudentName;
        fullNameNepali = parentClass.testMeta.testStudentNameNepali;
      } else {
        username = `dhambojhi_s_${String(studentCounter).padStart(3, '0')}`;
        const isFemale = (studentCounter + r) % 2 === 0;
        const fnList = isFemale ? firstNamesF : firstNamesM;
        const fnNpList = isFemale ? firstNamesFNp : firstNamesMNp;
        const fName = fnList[(studentCounter + r) % fnList.length];
        const fNameNp = fnNpList[(studentCounter + r) % fnNpList.length];
        const lName = lastNames[(studentCounter + r) % lastNames.length];
        const lNameNp = lastNamesNp[(studentCounter + r) % lastNamesNp.length];
        fullName = `${fName} ${lName}`;
        fullNameNepali = `${fNameNp} ${lNameNp}`;
      }

      const email = `${username}@dhambojhi.edu.np.test`;
      const admissionNumber = `DH-2083-${String(studentCounter).padStart(4, '0')}`;

      const studentUser = await User.create({
        institutionId: dhambojhi._id,
        username,
        email,
        passwordHash,
        role: 'STUDENT',
        fullName,
        fullNameNepali,
        phone: `9848${String(100000 + studentCounter).slice(1)}`,
        status: 'ACTIVE',
      });

      const guardianName = `${lastNames[(studentCounter * 3) % lastNames.length]} Prasad ${lastNames[(studentCounter + r) % lastNames.length]}`;
      const enrollment = await StudentEnrollment.create({
        studentId: studentUser._id,
        sectionId: section._id,
        academicYearId: academicYear2083._id,
        rollNumber: r,
        admissionNumber,
        guardianName,
        guardianPhone: `9808${String(200000 + studentCounter).slice(1)}`,
        guardianRelation: r % 3 === 0 ? 'MOTHER' : 'FATHER',
        status: 'ENROLLED',
      });

      // Realistic device profiles distribution
      let deviceType: 'PERSONAL_SMARTPHONE' | 'SHARED_DEVICE' | 'SCHOOL_COMPUTER' | 'NO_INDIVIDUAL_DEVICE' = 'PERSONAL_SMARTPHONE';
      let internetAvailability: 'BROADBAND' | 'MOBILE_DATA' | 'SCHOOL_ONLY' | 'NONE' = 'BROADBAND';

      if (studentCounter % 4 === 1) {
        deviceType = 'SHARED_DEVICE';
        internetAvailability = 'MOBILE_DATA';
      } else if (studentCounter % 8 === 2) {
        deviceType = 'SCHOOL_COMPUTER';
        internetAvailability = 'SCHOOL_ONLY';
      } else if (studentCounter % 15 === 0) {
        deviceType = 'NO_INDIVIDUAL_DEVICE';
        internetAvailability = 'NONE';
      }

      await StudentDeviceProfile.create({
        institutionId: dhambojhi._id,
        academicYearId: academicYear2083._id,
        classId: parentClass._id,
        sectionId: section._id,
        studentId: studentUser._id,
        deviceType,
        internetAvailability,
        updatedBy: schoolAdmin._id,
      });

      enrolledStudents.push({
        user: studentUser,
        enrollment,
        section,
        parentClass,
      });

      studentCounter++;
    }
  }
  console.log(`  ✅ Successfully created and enrolled ${enrolledStudents.length} Students (including all 14 test student accounts)`);

  // ══════════════════════════════════════════════════════════════════
  // 10. SCHOOL PERIODS, PUBLISHED TIMETABLES & ACADEMIC CALENDAR
  // ══════════════════════════════════════════════════════════════════
  console.log('\n[10/12] Building Published Timetable Structure, Weekly Entries & Academic Calendar...');

  const periodDefs = [
    { periodNumber: 1, name: 'Period 1', startTime: '10:00', endTime: '10:45', isBreak: false, breakType: 'NONE' },
    { periodNumber: 2, name: 'Period 2', startTime: '10:45', endTime: '11:30', isBreak: false, breakType: 'NONE' },
    { periodNumber: 3, name: 'Period 3', startTime: '11:30', endTime: '12:15', isBreak: false, breakType: 'NONE' },
    { periodNumber: 4, name: 'Period 4', startTime: '12:15', endTime: '13:00', isBreak: false, breakType: 'NONE' },
    { periodNumber: 0, name: 'Lunch Break / Tiffin', startTime: '13:00', endTime: '13:45', isBreak: true, breakType: 'LUNCH' },
    { periodNumber: 5, name: 'Period 5', startTime: '13:45', endTime: '14:30', isBreak: false, breakType: 'NONE' },
    { periodNumber: 6, name: 'Period 6', startTime: '14:30', endTime: '15:15', isBreak: false, breakType: 'NONE' },
    { periodNumber: 7, name: 'Period 7', startTime: '15:15', endTime: '16:00', isBreak: false, breakType: 'NONE' },
  ];

  const createdPeriods: any[] = [];
  for (const p of periodDefs) {
    const periodDoc = await SchoolPeriod.create({
      institutionId: dhambojhi._id,
      academicYearId: academicYear2083._id,
      name: p.name,
      periodNumber: p.periodNumber,
      startTime: p.startTime,
      endTime: p.endTime,
      durationMinutes: 45,
      isBreak: p.isBreak,
      breakType: p.breakType,
    });
    createdPeriods.push(periodDoc);
  }

  const timetableTemplate = await TimetableTemplate.create({
    institutionId: dhambojhi._id,
    academicYearId: academicYear2083._id,
    name: 'Dhambojhi Standard Academic Timetable 2083',
    workingDays: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    schoolStartTime: '10:00',
    schoolEndTime: '16:00',
    isDefault: true,
    status: 'ACTIVE',
  });

  const academicDays: any[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  const academicPeriods = createdPeriods.filter((p) => !p.isBreak);

  let timetableEntryCount = 0;
  let publishedTimetableCount = 0;

  for (let sIdx = 0; sIdx < createdSections.length; sIdx++) {
    const sec = createdSections[sIdx];
    const parentClass = createdClasses.find((c) => c._id.toString() === sec.classId.toString());
    const subjects = getSubjectsForClass(parentClass.gradeNumber, parentClass.stream);
    const roomNumber = `Room ${101 + sIdx}`;

    // 1. Create a published Timetable document for each section
    const timetableDoc = await Timetable.create({
      institutionId: dhambojhi._id,
      academicYearId: academicYear2083._id,
      classId: parentClass._id,
      sectionId: sec._id,
      medium: sec.medium,
      version: 1,
      status: 'PUBLISHED',
      createdBy: schoolAdmin._id,
      publishedBy: principal._id,
      publishedAt: new Date('2026-04-14'),
    });
    publishedTimetableCount++;

    for (let d = 0; d < academicDays.length; d++) {
      const day = academicDays[d];
      for (let pIdx = 0; pIdx < academicPeriods.length; pIdx++) {
        const period = academicPeriods[pIdx];
        const k = (pIdx + d) % subjects.length;
        const subject = subjects[k];
        const teacher = createdTeachers[(sIdx + k * 3) % createdTeachers.length];

        // Find matching CDC Textbook for this grade, medium & subject
        const matchingTextbook = allTextbooks.find((tb) => {
          const matchesGrade = tb.gradeNumber === parentClass.gradeNumber;
          const matchesMedium = tb.medium === sec.medium || tb.medium === 'BOTH';
          const matchesSubject = tb.subjectId?.toString() === subject._id.toString() ||
            tb.title?.toLowerCase().includes(subject.name?.toLowerCase().slice(0, 4));
          return matchesGrade && matchesMedium && matchesSubject;
        }) || allTextbooks.find((tb) => tb.gradeNumber === parentClass.gradeNumber && (tb.medium === sec.medium || tb.medium === 'BOTH'));

        // TimetableEntry
        await TimetableEntry.create({
          institutionId: dhambojhi._id,
          academicYearId: academicYear2083._id,
          templateId: timetableTemplate._id,
          timetableId: timetableDoc._id,
          classId: parentClass._id,
          sectionId: sec._id,
          medium: sec.medium,
          textbookId: matchingTextbook?._id,
          dayOfWeek: day,
          periodNumber: period.periodNumber,
          periodId: period._id,
          startTime: period.startTime,
          endTime: period.endTime,
          centralSubjectId: subject._id,
          teacherId: teacher._id,
          roomNumber,
        });

        // TimetableSlot (legacy compatibility)
        await TimetableSlot.create({
          sectionId: sec._id,
          centralSubjectId: subject._id,
          teacherId: teacher._id,
          dayOfWeek: day,
          periodNumber: period.periodNumber,
          startTime: period.startTime,
          endTime: period.endTime,
          roomNumber,
        });

        timetableEntryCount++;
      }
    }
  }
  console.log(`  ✅ Generated ${publishedTimetableCount} Published Timetables & ${timetableEntryCount} conflict-free weekly timetable slots`);

  // Academic Calendar Events
  await AcademicCalendar.insertMany([
    {
      institutionId: dhambojhi._id,
      academicYearId: academicYear2083._id,
      title: 'Baisakh Academic Session Opening 2083',
      eventType: 'ACADEMIC',
      startDate: new Date('2026-04-14'),
      endDate: new Date('2026-04-14'),
      isHoliday: false,
      description: 'Orientation and start of regular classes for academic year 2083 BS',
    },
    {
      institutionId: dhambojhi._id,
      academicYearId: academicYear2083._id,
      title: 'First Terminal Examination 2083',
      eventType: 'EXAMINATION',
      startDate: new Date('2026-07-15'),
      endDate: new Date('2026-07-25'),
      isHoliday: false,
      description: 'First Term Examination across Classes 1–12',
    },
    {
      institutionId: dhambojhi._id,
      academicYearId: academicYear2083._id,
      title: 'Dashain Festival Vacation',
      eventType: 'VACATION',
      startDate: new Date('2026-10-10'),
      endDate: new Date('2026-10-25'),
      isHoliday: true,
      description: 'National Festival Holiday for Bijaya Dashami',
    },
    {
      institutionId: dhambojhi._id,
      academicYearId: academicYear2083._id,
      title: 'Second Terminal Examination 2083',
      eventType: 'EXAMINATION',
      startDate: new Date('2026-12-15'),
      endDate: new Date('2026-12-24'),
      isHoliday: false,
      description: 'Second Term Examination across Classes 1–12',
    },
    {
      institutionId: dhambojhi._id,
      academicYearId: academicYear2083._id,
      title: 'Annual Sports & Cultural Week',
      eventType: 'EVENT',
      startDate: new Date('2027-01-10'),
      endDate: new Date('2027-01-15'),
      isHoliday: false,
      description: 'Inter-house athletic competitions and literary symposium',
    },
    {
      institutionId: dhambojhi._id,
      academicYearId: academicYear2083._id,
      title: 'Annual Final Examination 2083',
      eventType: 'EXAMINATION',
      startDate: new Date('2027-03-10'),
      endDate: new Date('2027-03-24'),
      isHoliday: false,
      description: 'Year-end Board & Institutional final assessments',
    },
  ]);
  console.log('  ✅ Seeded Academic Calendar events and holidays');

  // ══════════════════════════════════════════════════════════════════
  // 11. EXAMINATIONS, ASSESSMENTS & REALISTIC MARKS (CDC 2078 GRADING)
  // ══════════════════════════════════════════════════════════════════
  console.log('\n[11/12] Creating Examinations, Assessments, and realistic CDC 2078 Marks (Term 1 & Term 2)...');

  const gradingScheme = await GradingScheme.create({
    institutionId: dhambojhi._id,
    name: 'Nepal CDC 2078 Grading Scheme',
    code: 'CDC_2078',
    isDefault: true,
    intervals: [
      { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0, description: 'Outstanding' },
      { grade: 'A', minPercentage: 80, maxPercentage: 89.9, gpa: 3.6, description: 'Excellent' },
      { grade: 'B+', minPercentage: 70, maxPercentage: 79.9, gpa: 3.2, description: 'Very Good' },
      { grade: 'B', minPercentage: 60, maxPercentage: 69.9, gpa: 2.8, description: 'Good' },
      { grade: 'C+', minPercentage: 50, maxPercentage: 59.9, gpa: 2.4, description: 'Satisfactory' },
      { grade: 'C', minPercentage: 40, maxPercentage: 49.9, gpa: 2.0, description: 'Acceptable' },
      { grade: 'D', minPercentage: 35, maxPercentage: 39.9, gpa: 1.6, description: 'Basic' },
      { grade: 'NG', minPercentage: 0, maxPercentage: 34.9, gpa: 0.0, description: 'Non-Graded' },
    ],
  });

  const term1Exam = await Examination.create({
    institutionId: dhambojhi._id,
    academicYearId: academicYear2083._id,
    name: 'First Terminal Examination 2083',
    code: 'TERM1_2083',
    examType: 'TERMINAL',
    startDate: new Date('2026-07-15'),
    endDate: new Date('2026-07-25'),
    applicableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    gradingSchemeId: gradingScheme._id,
    weightagePercentage: 25,
    status: 'PUBLISHED',
    isPublished: true,
    publishedAt: new Date('2026-08-01'),
    publishedBy: principal._id,
  });

  const term2Exam = await Examination.create({
    institutionId: dhambojhi._id,
    academicYearId: academicYear2083._id,
    name: 'Second Terminal Examination 2083',
    code: 'TERM2_2083',
    examType: 'TERMINAL',
    startDate: new Date('2026-12-15'),
    endDate: new Date('2026-12-24'),
    applicableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    gradingSchemeId: gradingScheme._id,
    weightagePercentage: 25,
    status: 'PUBLISHED',
    isPublished: true,
    publishedAt: new Date('2026-12-30'),
    publishedBy: principal._id,
  });

  await Examination.create({
    institutionId: dhambojhi._id,
    academicYearId: academicYear2083._id,
    name: 'Annual Final Examination 2083',
    code: 'FINAL_2083',
    examType: 'FINAL',
    startDate: new Date('2027-03-10'),
    endDate: new Date('2027-03-24'),
    applicableGrades: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    gradingSchemeId: gradingScheme._id,
    weightagePercentage: 50,
    status: 'SCHEDULED',
    isPublished: false,
  });

  let assessmentCount = 0;
  let marksCount = 0;

  // Generate Assessments & Marks for Term 1 across all 28 sections & all students
  for (const sec of createdSections) {
    const parentClass = createdClasses.find((c) => c._id.toString() === sec.classId.toString());
    const subjects = getSubjectsForClass(parentClass.gradeNumber, parentClass.stream);
    const secStudents = enrolledStudents.filter((e) => e.section._id.toString() === sec._id.toString());

    for (const sub of subjects) {
      const assessment = await ExamAssessment.create({
        institutionId: dhambojhi._id,
        academicYearId: academicYear2083._id,
        examinationId: term1Exam._id,
        classId: parentClass._id,
        sectionId: sec._id,
        centralSubjectId: sub._id,
        name: `${sub.name} - First Term Assessment`,
        examType: 'TERMINAL',
        fullMarksTheory: 75,
        passMarksTheory: 27,
        fullMarksPractical: 25,
        passMarksPractical: 10,
        totalMarks: 100,
        passMarks: 40,
        workflowStatus: 'PUBLISHED',
        isPublished: true,
        submittedAt: new Date('2026-07-28'),
        submittedBy: sec.classTeacherId || createdTeachers[0]._id,
        approvedAt: new Date('2026-07-30'),
        approvedBy: principal._id,
        publishedAt: new Date('2026-08-01'),
        publishedBy: principal._id,
      });
      assessmentCount++;

      // Seed Student Marks with varied realistic performance distribution
      for (const st of secStudents) {
        const roll = st.enrollment.rollNumber;
        let isAbsent = false;
        let thMarks = 50;
        let prMarks = 20;

        if (roll === 1 || roll === 2) {
          thMarks = Math.min(75, 62 + (roll * 4) + ((sub.name.length % 5)));
          prMarks = 23 + (roll % 3);
        } else if (roll === 3 || roll === 4 || roll === 5) {
          thMarks = 50 + (roll * 2) + ((sub.name.length % 4));
          prMarks = 19 + (roll % 5);
        } else if (roll === 6 || roll === 7) {
          thMarks = 38 + (roll * 2) + ((sub.name.length % 3));
          prMarks = 16 + (roll % 4);
        } else if (roll === 8) {
          thMarks = 28 + (sub.name.length % 5);
          prMarks = 12 + (sub.name.length % 3);
        } else if (roll === 9) {
          if (sub.name.includes('Math') || sub.name.includes('Physics')) {
            thMarks = 20; // below theory pass mark of 27 -> NG
            prMarks = 14;
          } else {
            thMarks = 32;
            prMarks = 15;
          }
        }

        const evalResult = NepalGradingUtil.evaluateSubjectMarks({
          theoryMarks: thMarks,
          practicalMarks: prMarks,
          fullMarksTheory: 75,
          fullMarksPractical: 25,
          passMarksTheory: 27,
          passMarksPractical: 10,
          totalMarks: 100,
          isAbsent,
        });

        await StudentMark.create({
          institutionId: dhambojhi._id,
          examinationId: term1Exam._id,
          classId: parentClass._id,
          sectionId: sec._id,
          centralSubjectId: sub._id,
          assessmentId: assessment._id,
          studentId: st.user._id,
          marksTheory: thMarks,
          marksPractical: prMarks,
          marksObtained: thMarks + prMarks,
          theoryMarks: thMarks,
          practicalMarks: prMarks,
          totalMarks: thMarks + prMarks,
          percentage: thMarks + prMarks,
          grade: evalResult.grade,
          gpa: evalResult.gpa,
          isAbsent,
          submittedBy: sec.classTeacherId || createdTeachers[0]._id,
          workflowStatus: 'PUBLISHED',
          isVerifiedByClassTeacher: true,
          remarks: evalResult.isPassed ? 'Satisfactory performance' : 'Requires remedial attention',
        });
        marksCount++;
      }
    }
  }
  console.log(`  ✅ Generated ${assessmentCount} Assessments and ${marksCount} CDC 2078 Student Marks across all 28 sections`);

  // ══════════════════════════════════════════════════════════════════
  // 12. ATTENDANCE (30 DAYS ACROSS ALL 28 SECTIONS), ASSIGNMENTS, ANNOUNCEMENTS
  // ══════════════════════════════════════════════════════════════════
  console.log('\n[12/12] Generating Attendance (30 days across all 28 sections), Assignments & Announcements...');

  let attendanceRecordsCount = 0;
  const now = new Date();

  // Generate 25 past school days for all 28 sections
  for (const sec of createdSections) {
    const secStudents = enrolledStudents.filter((e) => e.section._id.toString() === sec._id.toString());
    const parentClass = createdClasses.find((c) => c._id.toString() === sec.classId.toString());
    const subjects = getSubjectsForClass(parentClass.gradeNumber, parentClass.stream);
    const sub = subjects[0];

    for (let dayOffset = 30; dayOffset >= 1; dayOffset--) {
      const attDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const dayOfWeek = attDate.getDay();
      if (dayOfWeek === 6) continue; // Skip Saturday

      const studentStatuses: any[] = [];
      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;
      let leaveCount = 0;

      for (const st of secStudents) {
        const roll = st.enrollment.rollNumber;
        let status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' = 'PRESENT';

        if (roll === 9 && dayOffset % 4 === 0) {
          status = 'ABSENT';
          absentCount++;
        } else if (roll === 8 && dayOffset % 5 === 0) {
          status = 'LATE';
          lateCount++;
        } else if (roll === 7 && dayOffset % 10 === 0) {
          status = 'LEAVE';
          leaveCount++;
        } else {
          status = 'PRESENT';
          presentCount++;
        }

        studentStatuses.push({
          studentId: st.user._id,
          status,
          remarks: status === 'LATE' ? 'Late due to transport' : undefined,
        });
      }

      const session = await AttendanceSession.create({
        institutionId: dhambojhi._id,
        academicYearId: academicYear2083._id,
        classId: parentClass._id,
        sectionId: sec._id,
        centralSubjectId: sub._id,
        periodNumber: 1,
        date: attDate,
        takenBy: sec.classTeacherId || createdTeachers[0]._id,
        totalStudents: secStudents.length,
        presentCount,
        absentCount,
        lateCount,
        leaveCount,
        status: 'SUBMITTED',
      });

      await AttendanceRecord.create({
        institutionId: dhambojhi._id,
        academicYearId: academicYear2083._id,
        classId: parentClass._id,
        sectionId: sec._id,
        centralSubjectId: sub._id,
        periodNumber: 1,
        date: attDate,
        sessionId: session._id,
        recordedBy: sec.classTeacherId || createdTeachers[0]._id,
        records: studentStatuses,
      });

      attendanceRecordsCount++;
    }
  }
  console.log(`  ✅ Generated ${attendanceRecordsCount} Daily Attendance Sessions & Multi-Student Records across all 28 sections`);

  // Realistic Assignments & Submissions
  const assignment1 = await Assignment.create({
    institutionId: dhambojhi._id,
    sectionId: createdSections[18]._id, // Grade 10 Section A
    centralSubjectId: centralSubjectsMap.get('SCI10')._id,
    teacherId: createdTeachers[0]._id,
    title: "Newton's Laws of Motion & Gravitational Fields Numerical Set",
    description: 'Solve the 5 problems on page 42 of the CDC Science Textbook. Show step-by-step vector calculations.',
    dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
    maxScore: 25,
    allowLateSubmission: true,
    status: 'ACTIVE',
  });

  const assignment2 = await Assignment.create({
    institutionId: dhambojhi._id,
    sectionId: createdSections[20]._id, // Grade 11 Science Section A
    centralSubjectId: centralSubjectsMap.get('PHY11')._id,
    teacherId: createdTeachers[0]._id,
    title: 'Lab Report: Determination of Acceleration due to Gravity by Simple Pendulum',
    description: 'Submit detailed experimental observations, percentage error calculation, and graph of T^2 vs L.',
    dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    maxScore: 20,
    allowLateSubmission: false,
    status: 'ACTIVE',
  });

  const assignment3 = await Assignment.create({
    institutionId: dhambojhi._id,
    sectionId: createdSections[22]._id, // Grade 11 Mgmt Section A
    centralSubjectId: centralSubjectsMap.get('ACC11')._id,
    teacherId: createdTeachers[8]._id,
    title: 'Journal Entries & Three-Column Cash Book Practical Case Study',
    description: 'Record the transactions of Himal Trading Concern for Baisakh 2083 and prepare ledger accounts.',
    dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
    maxScore: 30,
    allowLateSubmission: true,
    status: 'ACTIVE',
  });

  // Sample Submissions for Assignment 1
  const sec10Students = enrolledStudents.filter((e) => e.section._id.toString() === createdSections[18]._id.toString());
  for (let idx = 0; idx < Math.min(5, sec10Students.length); idx++) {
    const st = sec10Students[idx];
    await AssignmentSubmission.create({
      assignmentId: assignment1._id,
      studentId: st.user._id,
      institutionId: dhambojhi._id,
      content: `Completed numerical calculations for Gravitational constant G = 6.67e-11 and free fall on Earth. Solutions verified.`,
      status: 'GRADED',
      marksObtained: 22 + (idx % 4),
      feedback: 'Excellent derivation and unit conversions. Keep up the high standard.',
      gradedBy: createdTeachers[0]._id,
      gradedAt: new Date(),
    });
  }
  console.log('  ✅ Seeded Assignments with realistic student submissions & graded feedback');

  // School Announcements
  await SchoolAnnouncement.insertMany([
    {
      institutionId: dhambojhi._id,
      title: 'Welcome to Academic Session 2083 BS at Dhambojhi Secondary School',
      content: 'We welcome all parents, students, and faculty members to the new academic year. Please inspect your assigned timetables and digital learning materials in your portal.',
      targetAudience: 'ALL',
      publishedBy: principal._id,
      publishedAt: new Date('2026-04-14'),
    },
    {
      institutionId: dhambojhi._id,
      title: 'First Terminal Examination 2083 Schedule & Seat Plan',
      content: 'The First Terminal Examination will commence on 2083-04-01. Admit cards and seating plans are now available. Students must clear library dues.',
      targetAudience: 'ALL',
      publishedBy: schoolAdmin._id,
      publishedAt: new Date('2026-07-01'),
    },
    {
      institutionId: dhambojhi._id,
      title: 'Science and Technology Exhibition 2083 (Lumbini Province Level)',
      content: 'Dhambojhi Secondary School is hosting the regional Robotics and STEM exhibition. Participating classes 8–12 must register project teams by Friday.',
      targetAudience: 'STUDENTS',
      publishedBy: createdTeachers[0]._id,
      publishedAt: new Date('2026-09-05'),
    },
    {
      institutionId: dhambojhi._id,
      title: 'Faculty Academic Council & Curriculum Progress Review',
      content: 'All department heads and subject teachers are requested to attend the monthly academic audit meeting in Conference Hall B.',
      targetAudience: 'TEACHERS',
      publishedBy: principal._id,
      publishedAt: new Date('2026-11-01'),
    },
  ]);

  // Notifications
  await Notification.insertMany([
    {
      recipientId: schoolAdmin._id,
      institutionId: dhambojhi._id,
      type: 'SYSTEM_ALERT',
      title: 'Academic Session 2083 Initialized',
      message: 'All 28 sections and 252 student enrollments have been verified with complete CDC curriculum mappings.',
      priority: 'NORMAL',
      isRead: true,
      readAt: new Date(),
    },
    {
      recipientId: createdTeachers[0]._id,
      institutionId: dhambojhi._id,
      type: 'ASSIGNMENT_DEADLINE',
      title: 'Submissions Received for Physics Assignment',
      message: '5 students have submitted work for Gravitational Fields Numerical Set.',
      priority: 'NORMAL',
      isRead: false,
    },
    {
      recipientId: sec10Students[0].user._id,
      institutionId: dhambojhi._id,
      type: 'MARKS_PUBLISHED',
      title: 'First Terminal Examination Results Published',
      message: 'Your official CDC 2078 Grade-sheet is now accessible with Grade Point Average.',
      priority: 'HIGH',
      isRead: false,
    },
  ]);
  console.log('  ✅ Seeded School Announcements & In-App Notifications');

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('🎉 DHAMBOJHI SECONDARY SCHOOL SEEDING COMPLETED SUCCESSFULLY!');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log(`• Institution: ${dhambojhi.name} (EMIS: ${dhambojhi.emisCode}, ID: ${dhambojhi._id})`);
  console.log(`• Academic Year: 2083 BS (${academicYear2083.name})`);
  console.log(`• Classes: ${createdClasses.length} (Grades 1–10 General; 11–12 Science; 11–12 Management)`);
  console.log(`• Sections: ${createdSections.length} (Section A English & Section B Nepali with designated Class Teachers)`);
  console.log(`• Teachers: ${createdTeachers.length} (Staff accounts: dhambojhi_t_01 to dhambojhi_t_30)`);
  console.log(`• Students: ${enrolledStudents.length} (Accounts: 14 test students dhambojhi_s_g01..g12m + dhambojhi_s_001..252)`);
  console.log(`• Section Subjects: ${sectionSubjects.length}`);
  console.log(`• Subject Allocations: ${subjectAllocations.length}`);
  console.log(`• Published Timetables: ${publishedTimetableCount} section timetables (${timetableEntryCount} weekly slots)`);
  console.log(`• Assessments & Marks: ${assessmentCount} assessments, ${marksCount} CDC 2078 marks`);
  console.log(`• Attendance Sessions: ${attendanceRecordsCount} daily records over 30 school days across all 28 sections`);
  console.log(`• Standard Demo Password: ${demoPassword}`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  return {
    institution: dhambojhi,
    academicYear: academicYear2083,
    classes: createdClasses,
    sections: createdSections,
    teachers: createdTeachers,
    students: enrolledStudents,
    admin: schoolAdmin,
    principal,
  };
}

// Standalone execution support
if (require.main === module) {
  (async () => {
    try {
      await seedDhambojhiSchool();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error seeding Dhambojhi Secondary School:', err);
      process.exit(1);
    }
  })();
}
