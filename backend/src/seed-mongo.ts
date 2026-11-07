import bcrypt from 'bcryptjs';
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
} from './models';

async function seedMongo() {
  console.log('🌱 Starting MongoDB Nepal Digital Education Ecosystem Seeder...');
  await connectDB();

  // Clear existing collections
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
  ]);

  const defaultPasswordHash = await bcrypt.hash('Nepal@1234', 10);
  const superAdminPasswordHash = await bcrypt.hash('NepalSuperAdmin@2081', 10);

  // 1. Super Admin
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

  // 2. Demo School (Kathmandu Model Secondary School)
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
  console.log(`  ✅ Seeded Institution: ${kmss.name} (EMIS: ${kmss.emisCode})`);

  // 3. School Admin & Principal
  const schoolAdmin = await User.create({
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

  const principal = await User.create({
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
  console.log('  ✅ Seeded KMSS Administrator and Principal');

  // 4. Academic Year & Classes
  const acadYear = await AcademicYear.create({
    institutionId: kmss._id,
    name: '2081/2082',
    nameNepali: '२०८१/२०८२',
    isCurrent: true,
    startDate: new Date('2024-04-14'),
    endDate: new Date('2025-04-13'),
  });

  const class10 = await Class.create({
    institutionId: kmss._id,
    gradeNumber: 10,
    name: 'Class 10 (Secondary Level)',
    board: 'Nepal CDC',
  });

  const sectionSagarmatha = await Section.create({
    classId: class10._id,
    academicYearId: acadYear._id,
    name: 'Section Sagarmatha',
    medium: 'BILINGUAL',
    capacity: 45,
  });

  // 5. Teachers
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

  // Assign Class Teacher
  sectionSagarmatha.classTeacherId = teacherRamesh._id as any;
  await sectionSagarmatha.save();
  console.log('  ✅ Seeded Teachers & designated Section Class Teacher');

  // 6. Student & Enrollment
  const studentAarav = await User.create({
    institutionId: kmss._id,
    username: 'student_aarav',
    email: 'aarav@kmss.edu.np',
    passwordHash: defaultPasswordHash,
    role: 'STUDENT',
    fullName: 'Aarav Shrestha',
    fullNameNepali: 'आरभ श्रेष्ठ',
    status: 'ACTIVE',
  });

  await StudentEnrollment.create({
    studentId: studentAarav._id,
    sectionId: sectionSagarmatha._id,
    academicYearId: acadYear._id,
    rollNumber: 1,
    admissionNumber: 'ADM-2081-001',
    guardianName: 'Dipak Shrestha',
    guardianPhone: '9841223344',
    guardianRelation: 'Father',
  });
  console.log('  ✅ Seeded Student with enrollment & guardian records');

  // 7. Central CDC Subjects & Textbooks
  const mathSub = await CentralSubject.create({
    code: 'MATH-10',
    name: 'Compulsory Mathematics',
    nameNepali: 'अनिवार्य गणित',
    gradeNumber: 10,
    creditHours: 4,
    isCompulsory: true,
  });

  const scienceSub = await CentralSubject.create({
    code: 'SCI-10',
    name: 'Science and Technology',
    nameNepali: 'विज्ञान तथा प्रविधि',
    gradeNumber: 10,
    creditHours: 4,
    isCompulsory: true,
  });

  await Textbook.create({
    subjectId: mathSub._id,
    title: 'Grade 10 Compulsory Mathematics (English Medium)',
    titleNepali: 'कक्षा १० अनिवार्य गणित',
    medium: 'ENGLISH',
    pdfPath: '/books/grade10_math_en.pdf',
    pageCount: 312,
  });

  await SimulationCatalog.create({
    subjectId: scienceSub._id,
    title: 'Light Reflection & Refraction (Geometric Optics)',
    titleNepali: 'प्रकाशको परावर्तन र अपवर्तन',
    domain: 'PHYSICS',
    simulationType: 'HTML5_CANVAS',
    entryUrl: '/simulations/physics/optics.html',
    gradeLevels: [9, 10],
  });

  // 8. Subject Allocations
  await SubjectAllocation.create({
    sectionId: sectionSagarmatha._id,
    centralSubjectId: mathSub._id,
    teacherId: teacherRamesh._id,
  });

  await SubjectAllocation.create({
    sectionId: sectionSagarmatha._id,
    centralSubjectId: scienceSub._id,
    teacherId: teacherSita._id,
  });
  console.log('  ✅ Seeded Subject Allocations & CDC Curriculum resources');

  console.log('\n🎉 MongoDB database successfully seeded with Nepal Digital Education records!');
  await disconnectDB();
}

seedMongo().catch((err) => {
  console.error('Seeder error:', err);
  process.exit(1);
});

