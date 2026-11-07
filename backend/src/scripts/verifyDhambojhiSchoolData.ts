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
  SubjectAllocation,
  TimetableSlot,
  SchoolPeriod,
  TimetableTemplate,
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
  Subscription,
  StudentDeviceProfile,
} from '../models';

export interface VerificationResult {
  passed: boolean;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  summary: Record<string, any>;
  errors: string[];
}

export async function verifyDhambojhiSchoolData(): Promise<VerificationResult> {
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🔍 VERIFYING DHAMBOJHI HIGHER SECONDARY SCHOOL DATA INTEGRITY');
  console.log('══════════════════════════════════════════════════════════════════');

  const errors: string[] = [];
  let totalChecks = 0;
  let passedChecks = 0;

  const assertCheck = (name: string, condition: boolean, detail: string) => {
    totalChecks++;
    if (condition) {
      passedChecks++;
      console.log(`  ✅ [PASS] ${name}: ${detail}`);
    } else {
      errors.push(`${name}: ${detail}`);
      console.error(`  ❌ [FAIL] ${name}: ${detail}`);
    }
  };

  // 1. Institution Verification
  console.log('\n[1/10] Verifying Institution Record...');
  const inst = await Institution.findOne({ emisCode: '570010001' });
  assertCheck('Institution Exists', !!inst, inst ? `Found ${inst.name}` : 'Institution not found');
  if (!inst) {
    return {
      passed: false,
      totalChecks,
      passedChecks,
      failedChecks: totalChecks - passedChecks,
      summary: {},
      errors: ['Institution not found'],
    };
  }

  assertCheck('Institution Type', inst.type === 'COMMUNITY', `Type: ${inst.type}`);
  assertCheck('Institution Province', inst.province === 'Lumbini Province', `Province: ${inst.province}`);
  assertCheck('Institution District', inst.district === 'Banke', `District: ${inst.district}`);
  assertCheck('Institution Active', inst.status === 'ACTIVE', `Status: ${inst.status}`);

  // 2. Academic Year Verification
  console.log('\n[2/10] Verifying Academic Year...');
  const academicYear = await AcademicYear.findOne({ institutionId: inst._id, name: '2083' });
  assertCheck('Academic Year 2083', !!academicYear, academicYear ? `Found ${academicYear.name} (isCurrent: ${academicYear.isCurrent})` : 'Academic Year not found');
  assertCheck('Academic Year Current Flag', academicYear?.isCurrent === true, `isCurrent: ${academicYear?.isCurrent}`);

  // 3. User Accounts Verification
  console.log('\n[3/10] Verifying Administrator, Principal, Teachers & Students...');
  const admin = await User.findOne({ username: 'dhambojhi_admin', institutionId: inst._id });
  assertCheck('School Admin Account', !!admin && admin.role === 'SCHOOL_ADMIN', `Admin: ${admin?.fullName} (${admin?.username})`);

  const principal = await User.findOne({ username: 'dhambojhi_principal', institutionId: inst._id });
  assertCheck('Principal Account', !!principal && principal.role === 'PRINCIPAL', `Principal: ${principal?.fullName} (${principal?.username})`);

  const teachers = await User.find({ institutionId: inst._id, role: 'TEACHER' });
  assertCheck('Teacher Roster Count', teachers.length >= 25, `Found ${teachers.length} teachers (expected >= 25)`);

  const students = await User.find({ institutionId: inst._id, role: 'STUDENT' });
  assertCheck('Student Population Count', students.length >= 240, `Found ${students.length} students (expected >= 240)`);

  // 4. Classes & Sections Verification
  console.log('\n[4/10] Verifying Classes, Streams & Sections...');
  const classes = await Class.find({ institutionId: inst._id });
  assertCheck('Class Count', classes.length === 14, `Found ${classes.length} classes (Grades 1-10 General, 11-12 Science, 11-12 Management)`);

  const classIds = classes.map((c) => c._id);
  const sections = await Section.find({ classId: { $in: classIds } });
  assertCheck('Section Count', sections.length === 28, `Found ${sections.length} sections across 14 classes (2 per class)`);

  const unassignedSections = sections.filter((s) => !s.classTeacherId);
  assertCheck('Class Teacher Allocations', unassignedSections.length === 0, `${sections.length - unassignedSections.length}/${sections.length} sections have designated Class Teachers`);

  // 5. Enrollments & Device Profiles Verification
  console.log('\n[5/10] Verifying Enrollments and Device Profiles...');
  const enrollments = await StudentEnrollment.find({ studentId: { $in: students.map((s) => s._id) } });
  assertCheck('Enrollment Count Matches Students', enrollments.length === students.length, `${enrollments.length} enrollments for ${students.length} students`);

  const enrolledSectionIds = new Set(enrollments.map((e) => e.sectionId.toString()));
  assertCheck('All Sections Have Enrolled Students', enrolledSectionIds.size === sections.length, `Students enrolled across ${enrolledSectionIds.size}/${sections.length} sections`);

  const deviceProfiles = await StudentDeviceProfile.find({ institutionId: inst._id });
  assertCheck('Device Profiles Populated', deviceProfiles.length === students.length, `${deviceProfiles.length} device profiles created`);

  // 6. Subject Allocations Verification
  console.log('\n[6/10] Verifying Curriculum Subject Allocations...');
  const allocations = await SubjectAllocation.find({ sectionId: { $in: sections.map((s) => s._id) } });
  assertCheck('Subject Allocations Present', allocations.length >= 100, `Found ${allocations.length} subject allocations across sections`);

  // Check no broken foreign keys in allocations
  const teacherIdSet = new Set(teachers.map((t) => t._id.toString()));
  const brokenAllocations = allocations.filter((a) => !teacherIdSet.has(a.teacherId.toString()));
  assertCheck('Allocations Reference Valid Teachers', brokenAllocations.length === 0, `${allocations.length - brokenAllocations.length}/${allocations.length} allocations valid`);

  // 7. Timetable Verification & Conflict Detection
  console.log('\n[7/10] Verifying Timetable Structure & Conflict Detection...');
  const periods = await SchoolPeriod.find({ institutionId: inst._id });
  assertCheck('School Periods Defined', periods.length >= 7, `Found ${periods.length} periods and breaks`);

  const timetableEntries = await TimetableEntry.find({ institutionId: inst._id });
  assertCheck('Timetable Entries Populated', timetableEntries.length > 500, `Found ${timetableEntries.length} timetable entries`);

  // Detect conflict: teacher double-booking on same day and period
  const teacherScheduleMap = new Map<string, string>();
  let conflictCount = 0;
  for (const entry of timetableEntries) {
    const key = `${entry.teacherId.toString()}_${entry.dayOfWeek}_${entry.periodNumber}`;
    if (teacherScheduleMap.has(key)) {
      conflictCount++;
    } else {
      teacherScheduleMap.set(key, entry.sectionId.toString());
    }
  }
  assertCheck('Zero Timetable Teacher Conflicts', conflictCount === 0, `Teacher double-booking conflicts: ${conflictCount}`);

  // 8. Examinations, Assessments & CDC 2078 Marks Verification
  console.log('\n[8/10] Verifying Examinations, Assessments & CDC 2078 Marks...');
  const exams = await Examination.find({ institutionId: inst._id });
  assertCheck('Examinations Present', exams.length >= 3, `Found ${exams.length} examinations (Term 1, Term 2, Final)`);

  const assessments = await ExamAssessment.find({ institutionId: inst._id });
  assertCheck('Assessments Present', assessments.length >= 100, `Found ${assessments.length} exam assessments`);

  const marks = await StudentMark.find({ institutionId: inst._id });
  assertCheck('Student Marks Populated', marks.length >= 500, `Found ${marks.length} CDC 2078 student marks`);

  // Check grading accuracy: totalMarks === theory + practical
  let marksArithmeticMismatch = 0;
  let validGradeCount = 0;
  const validGrades = new Set(['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'NG']);

  for (const m of marks) {
    const computedTotal = (m.theoryMarks ?? m.marksTheory ?? 0) + (m.practicalMarks ?? m.marksPractical ?? 0);
    if (Math.abs((m.totalMarks ?? m.marksObtained ?? 0) - computedTotal) > 0.01) {
      marksArithmeticMismatch++;
    }
    if (validGrades.has(m.grade)) {
      validGradeCount++;
    }
  }
  assertCheck('Marks Theory + Practical Sum Check', marksArithmeticMismatch === 0, `${marks.length - marksArithmeticMismatch}/${marks.length} marks consistent`);
  assertCheck('CDC 2078 Letter Grades Valid', validGradeCount === marks.length, `${validGradeCount}/${marks.length} valid CDC 2078 letter grades`);

  // 9. Attendance Verification
  console.log('\n[9/10] Verifying Attendance Sessions & Records...');
  const attendanceSessions = await AttendanceSession.find({ institutionId: inst._id });
  assertCheck('Attendance Sessions Created', attendanceSessions.length >= 30, `Found ${attendanceSessions.length} attendance sessions over 30 school days`);

  const attendanceRecords = await AttendanceRecord.find({ institutionId: inst._id });
  assertCheck('Attendance Records Created', attendanceRecords.length >= 30, `Found ${attendanceRecords.length} multi-student attendance records`);

  // 10. Assignments, Submissions & Announcements
  console.log('\n[10/10] Verifying Assignments, Submissions, Announcements & Notifications...');
  const assignments = await Assignment.find({ institutionId: inst._id });
  assertCheck('Assignments Created', assignments.length >= 3, `Found ${assignments.length} assignments`);

  const submissions = await AssignmentSubmission.find({ institutionId: inst._id });
  assertCheck('Student Submissions Created', submissions.length >= 5, `Found ${submissions.length} student submissions`);

  const announcements = await SchoolAnnouncement.find({ institutionId: inst._id });
  assertCheck('School Announcements Created', announcements.length >= 4, `Found ${announcements.length} announcements`);

  const notifications = await Notification.find({ institutionId: inst._id });
  assertCheck('In-App Notifications Created', notifications.length >= 3, `Found ${notifications.length} notifications`);

  // Summary Table
  const summary: Record<string, any> = {
    'Institution Name': inst.name,
    'EMIS Code': inst.emisCode,
    'Province': inst.province,
    'District': inst.district,
    'Academic Year': academicYear?.name,
    'Classes (1-12)': classes.length,
    'Sections': sections.length,
    'Teachers': teachers.length,
    'Students': students.length,
    'Device Profiles': deviceProfiles.length,
    'Subject Allocations': allocations.length,
    'Timetable Entries': timetableEntries.length,
    'Timetable Conflicts': conflictCount,
    'Examinations': exams.length,
    'Exam Assessments': assessments.length,
    'Student Marks': marks.length,
    'Attendance Sessions': attendanceSessions.length,
    'Assignments': assignments.length,
    'Submissions': submissions.length,
    'Announcements': announcements.length,
    'Notifications': notifications.length,
  };

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('📊 DHAMBOJHI DEMO SCHOOL VERIFICATION SUMMARY');
  console.log('══════════════════════════════════════════════════════════════════');
  console.table(summary);

  const passed = errors.length === 0;
  console.log(`\nVerification Result: ${passed ? '✅ ALL CHECKS PASSED' : '❌ VERIFICATION FAILED'}`);
  console.log(`Checks Passed: ${passedChecks}/${totalChecks} (${Math.round((passedChecks / totalChecks) * 100)}%)`);

  return {
    passed,
    totalChecks,
    passedChecks,
    failedChecks: totalChecks - passedChecks,
    summary,
    errors,
  };
}

// Standalone execution support
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      const result = await verifyDhambojhiSchoolData();
      await disconnectDB();
      process.exit(result.passed ? 0 : 1);
    } catch (err) {
      console.error('❌ Error executing Dhambojhi verification:', err);
      process.exit(1);
    }
  })();
}

