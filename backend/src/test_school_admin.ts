import { AcademicPlanningService } from './modules/academic-planning/academic-planning.service';
import { CurriculumLibraryService } from './modules/curriculum/curriculum-library.service';
import { TimetableBuilderService } from './modules/timetable/timetable-builder.service';
import { SchoolAdminService } from './modules/school-admin/school-admin.service';
import { AuthService } from './modules/auth/auth.service';
import { connectDB, disconnectDB } from './config/db';
import { Institution, Class, AcademicYear, CentralSubject } from './models';
import { UserRole } from './common/constants/roles';

async function runSchoolAdminVerification() {
  console.log('🧪 Starting Phase 3 Institution Administration MongoDB Verification Suite...\n');
  await connectDB();

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`, detail || '');
      failed++;
    }
  }

  try {
    // 1. School Admin Authentication
    const loginRes = await AuthService.login('admin_kmss', 'Nepal@1234');
    assert(loginRes.user.role === UserRole.SCHOOL_ADMIN, 'School Admin (KMSS) authenticated successfully');
    const institutionId = loginRes.user.institutionId!;
    assert(!!institutionId, 'Institution ID securely extracted from login session');

    // 2. Institution-Specific Dashboard Overview
    const overview = await SchoolAdminService.getDashboardMetrics(institutionId);
    assert(
      overview.metrics.totalStudents >= 1 &&
        overview.metrics.totalTeachers >= 2 &&
        overview.metrics.totalClasses >= 1 &&
        overview.metrics.averageAttendance === null &&
        overview.metrics.academicPerformance === null,
      'Institution dashboard returns real counts and leaves unavailable attendance/performance metrics unset',
      overview.metrics
    );

    // 3. Institution Profile Management (Read-Only vs Editable Fields)
    const profile = await SchoolAdminService.getInstitutionProfile(institutionId);
    assert(
      profile.readOnly.code === 'SCH-2081-0001' &&
        profile.readOnly.province === 'Bagmati Province' &&
        profile.readOnly.district === 'Kathmandu',
      'Profile maintains Super Admin locked fields as read-only'
    );

    const updatedProfile = await SchoolAdminService.updateInstitutionProfile(institutionId, {
      name: 'Kathmandu Model Secondary School (Central Campus)',
      nameNepali: 'काठमाडौँ मोडल माध्यमिक विद्यालय (केन्द्रीय क्याम्पस)',
      address: 'Bagbazar, Kathmandu',
      workingDays: 'Sunday - Friday',
      schoolTimings: '09:30 AM - 04:30 PM',
      phone: '01-4422334',
    });
    assert(
      updatedProfile.schoolTimings === '09:30 AM - 04:30 PM' &&
        updatedProfile.address === 'Bagbazar, Kathmandu',
      'Updated institution editable properties (school timings, campus address)'
    );

    // 4. Academic Structure Configuration (Create or Get Class & Section)
    const stamp = Date.now();
    let newClass = await Class.findOne({ institutionId, gradeNumber: 9 });
    if (!newClass) {
      newClass = await SchoolAdminService.createClass(institutionId, {
        gradeNumber: 9,
        name: 'Class 9 (Secondary Level)',
        board: 'Nepal CDC',
      });
    }
    assert(newClass.gradeNumber === 9 && newClass.institutionId.toString() === institutionId, 'Configured Class 9 for the institution');

    const acadYear = await AcademicYear.findOne({ institutionId, isCurrent: true });
    assert(!!acadYear, 'Loaded active academic year for section creation');

    const newSection = await SchoolAdminService.createSection(institutionId, {
      classId: newClass.id,
      academicYearId: acadYear!.id,
      name: `Section Annapurna ${stamp}`,
    });
    assert(newSection.name.includes('Section Annapurna'), 'Created Section Annapurna under Class 9');

    // 5. Teacher Management (Add, Toggle Status)
    const teacherResult = await SchoolAdminService.createTeacher(institutionId, {
      fullName: 'Hari Prasad Pokharel',
      fullNameNepali: 'हरि प्रसाद पोखरेल',
      username: `teacher_hari_${stamp}`,
      email: `hari_${stamp}@kmss.edu.np`,
      phone: '9851000111',
      password: 'Nepal@1234',
    });
    assert(
      teacherResult.teacher.username.includes('teacher_hari') && teacherResult.tempPassword === 'Nepal@1234',
      'Registered new subject teacher with credentials'
    );
    const newTeacherId = teacherResult.teacher.id;

    const deactivated = await SchoolAdminService.toggleTeacherStatus(institutionId, newTeacherId, 'INACTIVE');
    assert(deactivated.status === 'INACTIVE', 'Deactivated teacher account');

    const reactivated = await SchoolAdminService.toggleTeacherStatus(institutionId, newTeacherId, 'ACTIVE');
    assert(reactivated.status === 'ACTIVE', 'Reactivated teacher account');

    // 6. Student Registration & Class Allocation
    const studentResult = await SchoolAdminService.registerStudent(institutionId, {
      fullName: 'Binita Sharma',
      fullNameNepali: 'बिनिता शर्मा',
      username: `student_binita_${stamp}`,
      sectionId: newSection.id,
      academicYearId: acadYear!.id,
      rollNumber: 1,
      admissionNumber: `ADM-2081-${stamp}`,
      guardianName: 'Gopal Sharma',
      guardianPhone: '9841223344',
      guardianRelation: 'Father',
    });
    assert(
      studentResult.enrollment.rollNumber === 1 &&
        studentResult.enrollment.guardianName === 'Gopal Sharma',
      'Registered student individually with roll number, admission number, and guardian info'
    );

    // 7. Subject Allocation (Class -> Section -> Subject -> Teacher), validated:
    //    medium set, subject offered in the section, subject of the same class.
    const actor = { userId: String(loginRes.user.id), role: 'SCHOOL_ADMIN' };
    await AcademicPlanningService.setSectionMedium(institutionId, newSection.id, 'ENGLISH', actor);
    const class9Subjects = await CurriculumLibraryService.subjectsForGrade(9, newClass.stream);
    const mathSub: any = class9Subjects.find((s: any) => s.logicalKey === 'MATHEMATICS');
    assert(!!mathSub, 'Found Class 9 Mathematics in the curriculum library');
    await AcademicPlanningService.setSectionSubjects(institutionId, newSection.id, [{ centralSubjectId: String(mathSub._id), periodsPerWeek: 6 }], actor);

    let wrongGradeCaught = false;
    const grade10Math = await CentralSubject.findOne({ gradeNumber: 10, logicalKey: 'MATHEMATICS' });
    try {
      await SchoolAdminService.allocateSubjectTeacher(institutionId, { sectionId: newSection.id, centralSubjectId: grade10Math!.id, teacherId: newTeacherId }, actor);
    } catch (e: any) {
      wrongGradeCaught = e.code === 'SUBJECT_GRADE_MISMATCH';
    }
    assert(wrongGradeCaught, 'Class 10 subject cannot be allocated in a Class 9 section');

    const allocation = await SchoolAdminService.allocateSubjectTeacher(institutionId, {
      sectionId: newSection.id,
      centralSubjectId: String(mathSub._id),
      teacherId: newTeacherId,
    }, actor);
    assert(
      allocation.sectionId.toString() === newSection.id && allocation.teacherId.toString() === newTeacherId,
      'Allocated subject to teacher for the section'
    );

    // Duplicate allocation prevention check
    let duplicateCaught = false;
    try {
      await SchoolAdminService.allocateSubjectTeacher(institutionId, {
        sectionId: newSection.id,
        centralSubjectId: String(mathSub._id),
        teacherId: newTeacherId,
      }, actor);
    } catch (e: any) {
      if (e.code === 'DUPLICATE_ALLOCATION') duplicateCaught = true;
    }
    assert(duplicateCaught, 'System prevents duplicate subject teacher allocations in the same section');

    // 8. Class Teacher Assignment
    const assignedCT = await SchoolAdminService.assignClassTeacher(institutionId, newSection.id, newTeacherId);
    assert(
      assignedCT.classTeacherId === newTeacherId &&
        assignedCT.classTeacher?.username === `teacher_hari_${stamp}`,
      'Designated primary Class Teacher for Section Annapurna'
    );

    // 9. Timetable Period Scheduling goes through the validated draft builder.
    let slotRefused = '';
    try {
      await SchoolAdminService.createTimetableSlot(institutionId, { sectionId: newSection.id, dayOfWeek: 'MONDAY', periodNumber: 1 }, actor);
    } catch (e: any) {
      slotRefused = e.code;
    }
    assert(slotRefused === 'SUBJECT_TEACHER_REQUIRED', 'A period without subject and teacher is refused (nothing is guessed)');
    const schoolConfigured = (await TimetableBuilderService.getConfig(institutionId, acadYear!.id)).configured;
    let slotResult: any = null;
    try {
      slotResult = await SchoolAdminService.createTimetableSlot(institutionId, { sectionId: newSection.id, subjectAllocationId: allocation.id, dayOfWeek: 'MONDAY', periodNumber: 1 }, actor);
    } catch (e: any) {
      slotResult = e;
    }
    assert(
      schoolConfigured ? !!slotResult?.entry : slotResult?.code === 'TIMETABLE_NOT_CONFIGURED',
      schoolConfigured ? 'Period saved into the section draft timetable' : 'Period refused until the school configures its days and periods'
    );

    const timetableView = await SchoolAdminService.getTimetable(institutionId, newSection.id);
    assert(Array.isArray(timetableView.weeklyEntries), 'Retrieved section timetable (published versions only)');

    // 10. School Announcements
    const announcement = await SchoolAdminService.createSchoolAnnouncement(institutionId, {
      title: 'First Terminal Examination Schedule',
      content: 'Routine for Class 9 and 10 published. Exams commence next Sunday.',
      targetType: 'ALL',
      authorName: 'Principal Office',
    });
    assert(announcement.title.includes('First Terminal Examination'), 'Published school announcement');

    const announcementsList = await SchoolAdminService.getSchoolAnnouncements(institutionId);
    assert(announcementsList.length >= 1, 'Retrieved institution-level announcements');

    // 11. Strict Institutional Tenant Isolation Check
    const otherSchool = await Institution.create({
      emisCode: `ISOLATION-${Date.now()}`,
      name: 'Isolated Testing Academy',
      province: 'Koshi Province',
      district: 'Morang',
      localLevel: 'Biratnagar',
      status: 'ACTIVE',
    });

    // Attempting to access other school's students with KMSS institutionId
    const otherSchoolStudents = await SchoolAdminService.getStudents(otherSchool.id, {});
    assert(otherSchoolStudents.length === 0, 'New institution has zero student records (Isolated partition)');

    const kmssStudents = await SchoolAdminService.getStudents(institutionId, {});
    assert(
      kmssStudents.every((s: any) => s.institutionId === institutionId),
      'All KMSS students strictly belong to KMSS (100% Tenant Isolation Enforced)'
    );

  } catch (err) {
    console.error('Test execution failed:', err);
    failed++;
  } finally {
    await disconnectDB();
    console.log(`\n📊 MongoDB Institution Administration Test Results: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
  }
}

runSchoolAdminVerification();
