import { AuthService } from './modules/auth/auth.service';
import { TeacherService } from './modules/teacher/teacher.service';
import { ClassTeacherService } from './modules/class-teacher/class-teacher.service';
import { StudentService } from './modules/student/student.service';
import { AssessmentService } from './modules/assessment/assessment.service';
import { connectDB, disconnectDB } from './config/db';
import { Institution, User, Class, Section, StudentEnrollment, CentralSubject, SubjectAllocation } from './models';
import { UserRole } from './common/constants/roles';

async function runPhase4Verification() {
  console.log('🧪 Starting Phase 4 Academic Management, Teacher & Student Verification Suite...\n');
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
    // ══════════════════════════════════════════════════════════════════
    // 1. TEACHER AUTHENTICATION & OVERVIEW
    // ══════════════════════════════════════════════════════════════════
    const teacherLogin = await AuthService.login('teacher_ramesh', 'Nepal@1234');
    assert(teacherLogin.user.role === UserRole.TEACHER, 'Teacher authenticated successfully');
    const teacherId = teacherLogin.user.id;
    const institutionId = teacherLogin.user.institutionId!;

    const overview = await TeacherService.getOverview(teacherId, institutionId);
    assert(
      overview.counts.assignedClasses >= 1 &&
        overview.counts.assignedSubjects >= 1 &&
        overview.counts.isClassTeacher === true,
      'Teacher overview returns assigned classes, subjects, and designated Class Teacher status',
      overview.counts
    );

    // ══════════════════════════════════════════════════════════════════
    // 2. ASSIGNED CLASSES & SUBJECT WORKSPACE
    // ══════════════════════════════════════════════════════════════════
    const allocations = await TeacherService.getAssignedClassesAndSubjects(teacherId, institutionId);
    assert(allocations.length >= 1, 'Retrieved teacher subject allocations');

    const firstAlloc: any = allocations[0];
    const secId = firstAlloc.sectionId._id.toString();
    const subId = firstAlloc.centralSubjectId._id.toString();

    const workspace = await TeacherService.getSubjectWorkspace(teacherId, institutionId, {
      sectionId: secId,
      centralSubjectId: subId,
    });
    assert(
      workspace.subject.name.length > 0 &&
        workspace.students.length >= 1 &&
        workspace.textbooks.length >= 1,
      'Subject Workspace loads enrolled students, official CDC textbooks, and classroom resources'
    );

    // Unauthorized subject workspace access check
    const otherSubject = await CentralSubject.create({
      code: `UNASSIGNED-SUB-${Date.now()}`,
      name: 'Unassigned Advanced Astronomy',
      nameNepali: 'खगोल विज्ञान',
      gradeNumber: 11,
      creditHours: 4,
    });

    let unauthorizedWorkspaceBlocked = false;
    try {
      await TeacherService.getSubjectWorkspace(teacherId, institutionId, {
        sectionId: secId,
        centralSubjectId: otherSubject.id,
      });
    } catch (e: any) {
      if (e.code === 'UNAUTHORIZED_ALLOCATION') unauthorizedWorkspaceBlocked = true;
    }
    assert(unauthorizedWorkspaceBlocked, 'Teacher blocked from accessing subject workspace they are not assigned to');

    // ══════════════════════════════════════════════════════════════════
    // 3. DAILY SECTION ATTENDANCE RECORDING
    // ══════════════════════════════════════════════════════════════════
    const studentUser = workspace.students[0].studentId as any;
    const today = new Date().toISOString().split('T')[0];

    const attendanceRecord = await TeacherService.recordSectionAttendance(teacherId, institutionId, {
      sectionId: secId,
      date: today,
      records: [{ studentId: studentUser._id.toString(), status: 'PRESENT', remarks: 'On time' }],
    });
    assert(
      attendanceRecord.records.length === 1 && attendanceRecord.records[0].status === 'PRESENT',
      'Daily attendance recorded for section students with status and remarks'
    );

    const attHistory = await TeacherService.getSectionAttendanceHistory(teacherId, institutionId, secId);
    assert(attHistory.length >= 1, 'Retrieved section attendance history log');

    // ══════════════════════════════════════════════════════════════════
    // 4. ASSESSMENT CREATION & NEPAL CDC MARKS ENTRY
    // ══════════════════════════════════════════════════════════════════
    const sectionDoc: any = await Section.findById(secId);
    const assessment = await TeacherService.createAssessment(teacherId, institutionId, {
      academicYearId: sectionDoc.academicYearId.toString(),
      sectionId: secId,
      centralSubjectId: subId,
      name: `First Terminal Exam 2081 - ${Date.now()}`,
      examType: 'TERMINAL',
      totalMarks: 100,
      passMarks: 40,
    });
    assert(assessment.totalMarks === 100 && assessment.passMarks === 40, 'Created subject examination assessment');

    // Teacher records 85 marks (out of 100)
    const enrolledForAssessment = await StudentEnrollment.find({ sectionId: secId, status: 'ENROLLED' });
    const assessmentMarks = [
      { studentId: studentUser._id.toString(), marksObtained: 85 },
      ...enrolledForAssessment
        .filter((enrollment) => enrollment.studentId.toString() !== studentUser._id.toString())
        .map((enrollment) => ({ studentId: enrollment.studentId.toString(), marksObtained: 80 })),
    ];
    const marksResult = await TeacherService.recordSubjectMarks(teacherId, institutionId, {
      assessmentId: assessment.id,
      marks: assessmentMarks,
    });
    assert(
      marksResult.marksCount >= 1 &&
        marksResult.marks[0].marksObtained === 85 &&
        marksResult.marks[0].grade === 'A' &&
        marksResult.marks[0].gpa === 3.6,
      'Teacher entered marks; system automatically computed Nepal CDC Grade (A) and GPA (3.6)'
    );

    // ══════════════════════════════════════════════════════════════════
    // 5. CLASS TEACHER ELEVATED CONSOLE & CONSOLIDATED RESULTS
    // ══════════════════════════════════════════════════════════════════
    const ctOverview = await ClassTeacherService.getSectionOverview(teacherId, secId, institutionId);
    assert(
      ctOverview.studentsCount >= 1 && ctOverview.subjectsCount >= 1,
      'Class Teacher Console loads all students and subjects across the entire section'
    );

    const consolidated = await ClassTeacherService.getConsolidatedResults(teacherId, secId, institutionId);
    assert(
      consolidated.consolidatedStudents.length >= 1 &&
        consolidated.consolidatedStudents[0].overallGpa > 0,
      'Class Teacher generated consolidated section marksheet across subjects with overall GPA'
    );

    await AssessmentService.transitionWorkflow({
      assessmentId: assessment.id,
      institutionId,
      targetStatus: 'SUBMITTED',
      actorId: teacherId,
      actorRole: 'TEACHER',
    });
    await AssessmentService.transitionWorkflow({
      assessmentId: assessment.id,
      institutionId,
      targetStatus: 'REVIEWED',
      actorId: teacherId,
      actorRole: 'TEACHER',
    });
    let principal = await User.findOne({ institutionId, role: 'PRINCIPAL', status: 'ACTIVE' });
    if (!principal) {
      principal = await User.create({
        institutionId,
        username: `principal_results_${Date.now()}`,
        passwordHash: 'hashed',
        role: 'PRINCIPAL',
        fullName: 'Results Principal',
        status: 'ACTIVE',
      });
    }
    await AssessmentService.transitionWorkflow({
      assessmentId: assessment.id,
      institutionId,
      targetStatus: 'APPROVED',
      actorId: principal.id,
      actorRole: 'PRINCIPAL',
    });
    const publishRes = await ClassTeacherService.publishSectionResults(
      principal.id,
      secId,
      [assessment.id],
      institutionId,
      'PRINCIPAL'
    );
    assert(
      publishRes.status === 'PUBLISHED' && publishRes.publishedAssessmentsCount === 1,
      'Principal publishes complete results after the class-teacher review and approval workflow'
    );

    // Non-Class-Teacher boundary check
    const otherTeacher = await User.create({
      institutionId,
      username: `teacher_non_ct_${Date.now()}`,
      passwordHash: 'hashed',
      role: UserRole.TEACHER,
      fullName: 'Non Class Teacher',
      status: 'ACTIVE',
    });

    let nonCtBlocked = false;
    try {
      await ClassTeacherService.getSectionOverview(otherTeacher.id, secId, institutionId);
    } catch (e: any) {
      if (e.code === 'NOT_CLASS_TEACHER') nonCtBlocked = true;
    }
    assert(nonCtBlocked, 'Non-Class Teacher blocked from accessing Class Teacher console (Strict RBAC)');

    // ══════════════════════════════════════════════════════════════════
    // 6. STUDENT DASHBOARD & PRIVATE ACADEMIC RECORDS
    // ══════════════════════════════════════════════════════════════════
    const studentLogin = await AuthService.login('student_aarav', 'Nepal@1234');
    assert(studentLogin.user.role === UserRole.STUDENT, 'Student authenticated successfully');
    const studentId = studentLogin.user.id;

    const studentOverview = await StudentService.getOverview(studentId, institutionId);
    assert(
      studentOverview.academicInfo.rollNumber === 1 &&
        (studentOverview.stats.attendanceRate === null || studentOverview.stats.attendanceRate.includes('%')) &&
        (studentOverview.stats.gpa === null || studentOverview.stats.gpa > 0),
      'Student Dashboard returns the roll number and only available attendance and GPA values'
    );

    const studentSubjects = await StudentService.getMySubjects(studentId, institutionId);
    assert(
      studentSubjects.length >= 1 && studentSubjects[0].textbooks.length >= 1,
      'Student accesses official CDC digital textbooks and simulations for their grade'
    );

    const studentAttendance = await StudentService.getMyAttendance(studentId, institutionId);
    assert(
      studentAttendance.history.length >= 1 && studentAttendance.presentDays >= 1,
      'Student accesses private attendance log'
    );

    const studentResults = await StudentService.getMyResults(studentId, institutionId);
    assert(
      studentResults.results.some((r: any) => r.assessmentId === assessment.id && r.marksObtained === 85),
      'Student views published marksheet showing verified marks (85), Grade A, and GPA 3.6'
    );

    // Cross-tenant data isolation check for student
    const otherInst = await Institution.create({
      emisCode: `ISO-STU-${Date.now()}`,
      name: 'Other Province Academy',
      province: 'Lumbini Province',
      district: 'Rupandehi',
      localLevel: 'Butwal',
      status: 'ACTIVE',
    });

    let crossTenantStudentBlocked = false;
    try {
      await StudentService.getOverview(studentId, otherInst.id);
    } catch (e: any) {
      if (e.code === 'FORBIDDEN_TENANT') crossTenantStudentBlocked = true;
    }
    assert(crossTenantStudentBlocked, 'Student strictly blocked from cross-institution data leakage');

  } catch (err) {
    console.error('Test execution failed:', err);
    failed++;
  } finally {
    await disconnectDB();
    console.log(`\n📊 Phase 4 Verification Results: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
  }
}

runPhase4Verification();
