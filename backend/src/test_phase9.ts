import mongoose from 'mongoose';
import { connectDB } from './config/db';
import {
  Institution,
  User,
  AcademicYear,
  Class,
  Section,
  CentralSubject,
  SubjectAllocation,
  AttendanceSession,
  AttendanceRecord,
  Examination,
  ExamAssessment,
  StudentMark,
  MarksAuditLog,
  GradingScheme,
} from './models';
import { AssessmentService } from './modules/assessment/assessment.service';
import { NepalGradingUtil } from './common/utils/nepal-grading.util';
import { SocketService } from './common/services/socket.service';

async function runPhase9Tests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🇳🇵 NEPAL DIGITAL EDUCATION PLATFORM — PHASE 9 TEST SUITE');
  console.log('   Attendance, Marks Workflow & Examination Management');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB.');

    // ── SETUP: Resolve Institutional Context ─────────────────────────
    console.log('\n[SETUP] Setting Up Test Academic Context...');
    let institution = await Institution.findOne();
    if (!institution) {
      institution = await Institution.create({
        name: 'Kathmandu Model Higher Secondary School',
        emisCode: 'KMSS-001',
        province: 'Bagmati',
        district: 'Kathmandu',
        localLevel: 'Kathmandu Metropolitan',
        type: 'COMMUNITY_SCHOOL',
        status: 'ACTIVE',
      });
    }

    let academicYear = await AcademicYear.findOne({ institutionId: institution._id, isCurrent: true });
    if (!academicYear) {
      academicYear = await AcademicYear.create({
        institutionId: institution._id,
        name: '2081/2082',
        startDate: new Date('2024-04-14'),
        endDate: new Date('2025-04-13'),
        isCurrent: true,
      });
    }

    let testClass = await Class.findOne({ institutionId: institution._id, gradeNumber: 10 });
    if (!testClass) {
      testClass = await Class.create({
        institutionId: institution._id,
        academicYearId: academicYear._id,
        name: 'Class 10',
        gradeNumber: 10,
        board: 'SEE',
      });
    }

    let section = await Section.findOne({ classId: testClass._id, name: 'Sagarmatha A' });
    if (!section) {
      section = await Section.create({
        institutionId: institution._id,
        academicYearId: academicYear._id,
        classId: testClass._id,
        name: 'Sagarmatha A',
        capacity: 45,
      });
    }

    // Resolve Subject (Science)
    let subject = await CentralSubject.findOne({ code: 'SCI-10' });
    if (!subject) {
      subject = await CentralSubject.create({
        name: 'Science & Technology',
        nameNepali: 'विज्ञान तथा प्रविधि',
        code: 'SCI-10',
        gradeLevel: 10,
        creditHours: 4,
      });
    }

    // Resolve Teachers & Students
    let teacher = await User.findOne({ email: 'science.teacher@kmss.edu.np' });
    if (!teacher) {
      teacher = await User.create({
        username: 'science.teacher',
        email: 'science.teacher@kmss.edu.np',
        passwordHash: 'dummyhash',
        fullName: 'Bishnu Prasad Sharma',
        role: 'TEACHER',
        institutionId: institution._id,
        status: 'ACTIVE',
      });
    }

    let classTeacher = await User.findOne({ email: 'class.teacher@kmss.edu.np' });
    if (!classTeacher) {
      classTeacher = await User.create({
        username: 'class.teacher',
        email: 'class.teacher@kmss.edu.np',
        passwordHash: 'dummyhash',
        fullName: 'Radhika Koirala',
        role: 'TEACHER',
        institutionId: institution._id,
        status: 'ACTIVE',
      });
    }
    // Designate class teacher
    section.classTeacherId = classTeacher._id as any;
    await section.save();

    let unauthorizedTeacher = await User.findOne({ email: 'history.teacher@kmss.edu.np' });
    if (!unauthorizedTeacher) {
      unauthorizedTeacher = await User.create({
        username: 'history.teacher',
        email: 'history.teacher@kmss.edu.np',
        passwordHash: 'dummyhash',
        fullName: 'Gopal Thapa',
        role: 'TEACHER',
        institutionId: institution._id,
        status: 'ACTIVE',
      });
    }

    let principal = await User.findOne({ role: 'PRINCIPAL', institutionId: institution._id });
    if (!principal) {
      principal = await User.create({
        username: 'principal.user',
        email: 'principal@kmss.edu.np',
        passwordHash: 'dummyhash',
        fullName: 'Dr. Narayan Prasad Lamsal',
        role: 'PRINCIPAL',
        institutionId: institution._id,
        status: 'ACTIVE',
      });
    }

    // Create 3 Test Students
    const studentUsers = [];
    for (let i = 1; i <= 3; i++) {
      let st = await User.findOne({ email: `student${i}.p9@kmss.edu.np` });
      if (!st) {
        st = await User.create({
          username: `student${i}.p9`,
          email: `student${i}.p9@kmss.edu.np`,
          passwordHash: 'dummyhash',
          fullName: i === 1 ? 'Anish Thapa' : i === 2 ? 'Binita Gurung' : 'Chirag Shrestha',
          role: 'STUDENT',
          institutionId: institution._id,
          status: 'ACTIVE',
        });
      }
      studentUsers.push(st);
    }

    // Subject Allocation for science teacher
    await SubjectAllocation.findOneAndUpdate(
      { sectionId: section._id, centralSubjectId: subject._id },
      {
        $set: {
          institutionId: institution._id,
          academicYearId: academicYear._id,
          teacherId: teacher._id,
          periodsPerWeek: 5,
        },
      },
      { upsert: true }
    );

    console.log(`  🏫 Institution: ${institution.name}`);
    console.log(`  👨‍🏫 Subject Teacher: ${teacher.fullName}`);
    console.log(`  👩‍🏫 Class Teacher: ${classTeacher.fullName} (Section: ${section.name})`);
    console.log(`  👔 Principal: ${principal.fullName}`);
    console.log(`  🎒 Students Enrolled: ${studentUsers.map((s) => s.fullName).join(', ')}`);
    console.log('  ✅ Academic context configured successfully.');

    // ── TEST 1: Subject Attendance with Bulk Marking (Present, Absent, Late, Leave)
    console.log('\n[TEST 1] Testing Attendance Session & Bulk Marking...');
    const attendanceDate = new Date('2026-11-02');

    const session = await AssessmentService.recordAttendanceSession({
      institutionId: String(institution._id),
      actorRole: 'TEACHER',
      academicYearId: String(academicYear._id),
      classId: String(testClass._id),
      sectionId: String(section._id),
      centralSubjectId: String(subject._id),
      periodNumber: 2,
      date: attendanceDate,
      takenBy: String(teacher._id),
      records: [
        { studentId: String(studentUsers[0]._id), status: 'PRESENT' },
        { studentId: String(studentUsers[1]._id), status: 'ABSENT', remarks: 'Fever' },
        { studentId: String(studentUsers[2]._id), status: 'LEAVE', remarks: 'Family event' },
      ],
      remarks: 'Science Lab Period 2: Ray Optics Experiment',
    });

    console.log(`  📝 Attendance Session Created: ID ${session.id}`);
    console.log(`     Total: ${session.totalStudents} | Present: ${session.presentCount} | Absent: ${session.absentCount} | Leave: ${session.leaveCount}`);
    if (session.presentCount !== 1 || session.absentCount !== 1 || session.leaveCount !== 1) {
      throw new Error('Attendance count calculation failed');
    }

    // Verify personal student attendance calculation
    const anishAttendance = await AssessmentService.getStudentAttendance(
      String(studentUsers[0]._id),
      String(institution._id)
    );
    const binitaAttendance = await AssessmentService.getStudentAttendance(
      String(studentUsers[1]._id),
      String(institution._id)
    );
    console.log(`  📊 Student 1 (Anish) Attendance Rate: ${anishAttendance.attendanceRate}%`);
    console.log(`  📊 Student 2 (Binita) Absent Days: ${binitaAttendance.absent}`);
    if (anishAttendance.present < 1 || binitaAttendance.absent < 1) {
      throw new Error('Student attendance metrics verification failed');
    }
    console.log('  ✅ Subject attendance session and bulk marking verified.');

    // ── TEST 2: Examination Management across Diverse Exam Types ─────
    console.log('\n[TEST 2] Testing Examination Configuration across Types...');
    const examTypes: any[] = ['TERMINAL', 'UNIT_TEST', 'MONTHLY_TEST', 'FINAL', 'PRACTICAL', 'INTERNAL_ASSESSMENT', 'CUSTOM'];

    await Examination.deleteMany({ institutionId: institution._id, code: { $regex: '^EXAM-P9-' } });

    for (const t of examTypes) {
      const ex = await AssessmentService.createExamination({
        institutionId: String(institution._id),
        academicYearId: String(academicYear._id),
        name: `Test ${t} 2081`,
        code: `EXAM-P9-${t}`,
        examType: t,
        startDate: new Date('2026-11-10'),
        endDate: new Date('2026-11-20'),
        applicableGrades: [10],
        weightagePercentage: t === 'TERMINAL' ? 25 : t === 'FINAL' ? 50 : 10,
      });
      console.log(`  📋 Configured Exam [${ex.examType}]: "${ex.name}" (Code: ${ex.code})`);
    }

    const allExams = await AssessmentService.listExaminations(String(institution._id));
    console.log(`  📊 Total Active Examinations in Institution: ${allExams.length}`);
    if (allExams.length < examTypes.length) {
      throw new Error('Examination configuration count mismatch');
    }
    console.log('  ✅ Examination configuration and catalog verified.');

    // ── TEST 3: Marks Entry with Theory + Practical & CDC Grade Computation ──
    console.log('\n[TEST 3] Testing Marks Entry & Automatic Nepal CDC Grading...');
    const terminalExam = allExams.find((e) => e.examType === 'TERMINAL')!;

    // Create Subject Assessment
    await ExamAssessment.deleteMany({ sectionId: section._id, centralSubjectId: subject._id, name: 'Class 10 Science - Terminal 1' });
    const scienceAssessment = await AssessmentService.createAssessment({
      institutionId: String(institution._id),
      actorId: String(teacher._id),
      actorRole: 'TEACHER',
      academicYearId: String(academicYear._id),
      examinationId: String(terminalExam._id),
      classId: String(testClass._id),
      sectionId: String(section._id),
      centralSubjectId: String(subject._id),
      assignedTeacherId: String(teacher._id),
      name: 'Class 10 Science - Terminal 1',
      examType: 'TERMINAL',
      fullMarksTheory: 75,
      passMarksTheory: 27,
      fullMarksPractical: 25,
      passMarksPractical: 10,
      totalMarks: 100,
      passMarks: 40,
    });
    console.log(`  📑 Created Subject Assessment: "${scienceAssessment.name}" (Total: ${scienceAssessment.totalMarks})`);

    // Verify Unauthorized Teacher Rejection
    let rejected = false;
    try {
      await AssessmentService.enterMarks({
        teacherId: String(unauthorizedTeacher._id),
        userRole: 'TEACHER',
        assessmentId: scienceAssessment.id,
        saveAsDraft: true,
        marks: [{ studentId: String(studentUsers[0]._id), marksObtained: 95 }],
      });
    } catch (err: any) {
      rejected = true;
      console.log(`  🛡️ Intercepted Unauthorized Marks Entry: "${err.message}"`);
    }
    if (!rejected) {
      throw new Error('Security check failed: Unauthorized teacher was allowed to enter marks');
    }

    // Authorized Teacher Enters Draft Marks
    const draftEntry = await AssessmentService.enterMarks({
      teacherId: String(teacher._id),
      userRole: 'TEACHER',
      assessmentId: scienceAssessment.id,
      saveAsDraft: true,
      marks: [
        { studentId: String(studentUsers[0]._id), marksTheory: 70, marksPractical: 24 }, // 94% -> A+ (4.0)
        { studentId: String(studentUsers[1]._id), marksTheory: 58, marksPractical: 22 }, // 80% -> A (3.6)
        { studentId: String(studentUsers[2]._id), marksTheory: 20, marksPractical: 10 }, // 30% -> NG (0.0)
      ],
    });

    console.log(`  💾 Saved Draft Marks: ${draftEntry.marks.length} students recorded.`);
    console.log(`     - Student 1 (94%): Grade ${draftEntry.marks[0].grade} | GPA ${draftEntry.marks[0].gpa}`);
    console.log(`     - Student 2 (80%): Grade ${draftEntry.marks[1].grade} | GPA ${draftEntry.marks[1].gpa}`);
    console.log(`     - Student 3 (30%): Grade ${draftEntry.marks[2].grade} | GPA ${draftEntry.marks[2].gpa}`);

    if (draftEntry.marks[0].grade !== 'A+' || draftEntry.marks[0].gpa !== 4.0) {
      throw new Error('CDC Grade calculation for 94% did not yield A+ 4.0');
    }
    if (draftEntry.marks[2].grade !== 'NG' || draftEntry.marks[2].gpa !== 0.0) {
      throw new Error('CDC Grade calculation for 30% did not yield NG 0.0');
    }
    console.log('  ✅ Marks entry, authorization check & Nepal CDC grade calculation verified.');

    // ── TEST 4: Marks Workflow State Machine & Audit History ─────────
    console.log('\n[TEST 4] Testing Workflow Transition: Draft -> Submitted -> Reviewed -> Approved -> Published...');
    
    // Step A: Teacher Submits
    const submittedAsm = await AssessmentService.transitionWorkflow({
      assessmentId: scienceAssessment.id,
      targetStatus: 'SUBMITTED',
      actorId: String(teacher._id),
      actorRole: 'TEACHER',
      reason: 'All student practical and theory marks verified by teacher',
    });
    console.log(`  1️⃣ Step 1: Teacher Submitted Assessment (Status: ${submittedAsm.workflowStatus})`);

    // Step B: Class Teacher Reviews
    const reviewedAsm = await AssessmentService.transitionWorkflow({
      assessmentId: scienceAssessment.id,
      targetStatus: 'REVIEWED',
      actorId: String(classTeacher._id),
      actorRole: 'TEACHER',
      reason: 'Class teacher reviewed section score distribution',
    });
    console.log(`  2️⃣ Step 2: Class Teacher Endorsed Assessment (Status: ${reviewedAsm.workflowStatus})`);

    // Step C: Principal Approves
    const approvedAsm = await AssessmentService.transitionWorkflow({
      assessmentId: scienceAssessment.id,
      targetStatus: 'APPROVED',
      actorId: String(principal._id),
      actorRole: 'PRINCIPAL',
      reason: 'School administration approved marks for final release',
    });
    console.log(`  3️⃣ Step 3: Principal Approved Assessment (Status: ${approvedAsm.workflowStatus})`);

    // Verify Audit Trail for this assessment
    const auditLogs = await MarksAuditLog.find({ assessmentId: scienceAssessment._id }).sort({ timestamp: 1 });
    console.log(`  📜 Audit Trail Events Logged for Assessment: ${auditLogs.length}`);
    auditLogs.forEach((l) => console.log(`     - [${l.action}] by ${l.userRole}: "${l.reason}"`));
    if (auditLogs.length < 4) {
      throw new Error('Audit log event count is less than expected workflow transitions');
    }
    console.log('  ✅ Marks state machine transitions & change audit logging verified.');

    // ── TEST 5: Class Teacher Console & Consolidated Marksheet ───────
    console.log('\n[TEST 5] Testing Class Teacher Console & Consolidated Marksheet...');
    const sectionOverview = await AssessmentService.getSectionExamOverview(
      String(institution._id),
      String(section._id),
      String(terminalExam._id),
      String(classTeacher._id),
      'TEACHER'
    );
    console.log(`  🏫 Section Subjects Checked: ${sectionOverview.totalSubjects}`);
    console.log(`     All Submitted: ${sectionOverview.allSubmitted} | All Reviewed: ${sectionOverview.allReviewed}`);

    const consolidated = await AssessmentService.getConsolidatedResults(
      String(institution._id),
      String(section._id),
      String(terminalExam._id),
      String(classTeacher._id),
      'TEACHER'
    );
    console.log(`  📊 Consolidated Class Marksheet Generated (${consolidated.results.length} students):`);
    consolidated.results.forEach((s) => {
      console.log(`     Rank ${s.classRank}: ${s.student?.fullName} | Score: ${s.totalMarksObtained} | GPA: ${s.overallGPA} (${s.overallGrade})`);
    });

    if (
      consolidated.results[0].classRank !== 1 ||
      (consolidated.results[0].overallGPA ?? 0) < (consolidated.results[1].overallGPA ?? 0)
    ) {
      throw new Error('Consolidated marksheet ranking calculation failed');
    }
    console.log('  ✅ Class Teacher console & consolidated marksheet ranking verified.');

    // ── TEST 6: Student Isolation & Published vs Unpublished Privacy ──
    console.log('\n[TEST 6] Testing Student Results Privacy (Unpublished vs Published)...');
    
    // Before publishing: Student query must return 0 results
    const prePublishResults = await AssessmentService.getStudentPublishedResults(
      String(studentUsers[0]._id),
      String(institution._id)
    );
    console.log(`  🔒 Pre-publish student query results: ${prePublishResults.length} exams visible`);
    if (prePublishResults.length > 0) {
      throw new Error('Privacy violation: Unpublished exam results were exposed to student');
    }
    console.log('  🛡️ Privacy check passed: Student cannot access unapproved/unpublished marks.');

    // Step D: Principal Publishes Examination
    console.log('\n  📢 Principal Publishing Examination Results...');
    await AssessmentService.publishExamination(terminalExam.id, String(principal._id));

    // After publishing: Student query returns official report card
    const postPublishResults = await AssessmentService.getStudentPublishedResults(
      String(studentUsers[0]._id),
      String(institution._id)
    );
    console.log(`  🎓 Post-publish student query results: ${postPublishResults.length} exams visible`);
    if (postPublishResults.length === 0) {
      throw new Error('Student could not access officially published report card');
    }
    console.log(`     - Exam: "${postPublishResults[0].examination.name}"`);
    console.log(`     - Subject: ${postPublishResults[0].marks[0].subject} (${postPublishResults[0].marks[0].grade}, GPA ${postPublishResults[0].marks[0].gpa})`);
    console.log(`     - Overall GPA: ${postPublishResults[0].overallGPA}`);
    console.log('  ✅ Official publication and student report card access verified.');

    // ── TEST 7: Principal Dashboard & Institutional Progress ─────────
    console.log('\n[TEST 7] Testing Principal & School Admin Operational Dashboard...');
    const principalDash = await AssessmentService.getPrincipalDashboard(String(institution._id));
    console.log(`  📈 Total Examinations: ${principalDash.totalExaminations}`);
    console.log(`  📋 Active Exams: ${principalDash.activeExams.length}`);
    console.log(`  📊 Assessment Submission Rate: ${principalDash.assessmentProgress.submissionRate}%`);
    console.log(`  ✅ Published Subjects: ${principalDash.assessmentProgress.published}`);
    console.log(`  📅 Today's Attendance Sessions: ${principalDash.todayAttendanceSessions.length}`);

    if (principalDash.assessmentProgress.published < 1) {
      throw new Error('Principal dashboard failed to reflect published assessments');
    }
    console.log('  ✅ Principal monitoring dashboard verified.');

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎉 ALL PHASE 9 TESTS PASSED SUCCESSFULLY! (100% OK)');
    console.log('   Attendance, Marks Workflow, Audit Logs & Results Live');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (err: any) {
    console.error('\n❌ Phase 9 Test Failure:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  }
}

runPhase9Tests();
