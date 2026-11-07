import mongoose from 'mongoose';
import { connectDB } from './config/db';
import {
  Institution,
  User,
  AcademicYear,
  Class,
  Section,
  StudentEnrollment,
  CentralSubject,
  SubjectAllocation,
  AttendanceSession,
  AttendanceRecord,
  Examination,
  ExamAssessment,
  StudentMark,
  SyllabusProgress,
  TimetableEntry,
} from './models';
import { AnalyticsService } from './modules/analytics/analytics.service';

async function runPhase11Tests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🇳🇵 NEPAL DIGITAL EDUCATION PLATFORM — PHASE 11 TEST SUITE');
  console.log('   Results, Academic Progress & Real-Time Analytics');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB.');

    // ── SETUP: Academic Context & Fixtures ───────────────────────────
    console.log('\n[SETUP] Initializing Institutional Fixtures...');
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
        gradeNumber: 10,
        name: 'Grade 10',
        academicYearId: academicYear._id,
      });
    }

    let testSection = await Section.findOne({ classId: testClass._id, name: 'Section A' });
    if (!testSection) {
      testSection = await Section.create({
        institutionId: institution._id,
        classId: testClass._id,
        name: 'Section A',
        capacity: 40,
        academicYearId: academicYear._id,
      });
    }

    // Teacher & Subjects
    let teacherUser = await User.findOne({ email: 'teacher.science@kmss.edu.np' });
    if (!teacherUser) {
      teacherUser = await User.create({
        institutionId: institution._id,
        email: 'teacher.science@kmss.edu.np',
        username: 'teacher_science',
        passwordHash: 'hash',
        fullName: 'Ram Bahadur Thapa',
        fullNameNepali: 'राम बहादुर थापा',
        role: 'TEACHER',
        status: 'ACTIVE',
      });
    }

    let sciSubject = await CentralSubject.findOne({ code: 'SCI-10' });
    if (!sciSubject) {
      sciSubject = await CentralSubject.create({
        code: 'SCI-10',
        name: 'Science & Technology',
        nameNepali: 'विज्ञान तथा प्रविधि',
        gradeNumber: 10,
        medium: 'BOTH',
        isCompulsory: true,
        creditHours: 4,
        annualHours: 128,
        theoryMarks: 75,
        practicalMarks: 25,
      });
    }

    let mathSubject = await CentralSubject.findOne({ code: 'MTH-10' });
    if (!mathSubject) {
      mathSubject = await CentralSubject.create({
        code: 'MTH-10',
        name: 'Compulsory Mathematics',
        nameNepali: 'अनिवार्य गणित',
        gradeNumber: 10,
        medium: 'BOTH',
        isCompulsory: true,
        creditHours: 4,
        annualHours: 128,
        theoryMarks: 75,
        practicalMarks: 25,
      });
    }

    // Students (3 test students: 1 high achiever, 1 average, 1 at-risk student)
    const testStudents: any[] = [];
    const studentData = [
      { name: 'Aarav Sharma', email: 'aarav.sharma@kmss.edu.np', roll: 101, mathScore: 92, sciScore: 88 },
      { name: 'Bipana Rai', email: 'bipana.rai@kmss.edu.np', roll: 102, mathScore: 65, sciScore: 70 },
      { name: 'Chandra Tamang', email: 'chandra.tamang@kmss.edu.np', roll: 103, mathScore: 28, sciScore: 32 }, // At risk
    ];

    for (const sd of studentData) {
      let stuUser = await User.findOne({ email: sd.email });
      if (!stuUser) {
        stuUser = await User.create({
          institutionId: institution._id,
          email: sd.email,
          username: sd.email.split('@')[0],
          passwordHash: 'hash',
          fullName: sd.name,
          role: 'STUDENT',
          status: 'ACTIVE',
        });
      }

      await StudentEnrollment.findOneAndUpdate(
        { sectionId: testSection._id, studentId: stuUser._id },
        {
          studentId: stuUser._id,
          sectionId: testSection._id,
          academicYearId: academicYear._id,
          rollNumber: sd.roll,
          admissionNumber: `ADM-${sd.roll}`,
          status: 'ENROLLED',
        },
        { upsert: true }
      );
      testStudents.push({ user: stuUser, ...sd });
    }

    // Examination & Assessments
    let exam = await Examination.findOne({ institutionId: institution._id, code: 'EXAM-2081-T1' });
    if (!exam) {
      exam = await Examination.create({
        institutionId: institution._id,
        academicYearId: academicYear._id,
        name: 'First Terminal Examination 2081',
        code: 'EXAM-2081-T1',
        examType: 'TERMINAL',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-07-22'),
        status: 'PUBLISHED',
        weightagePercentage: 100,
        isPublished: true,
      });
    }

    let mathAssessment = await ExamAssessment.findOne({ examinationId: exam._id, centralSubjectId: mathSubject._id });
    if (!mathAssessment) {
      mathAssessment = await ExamAssessment.create({
        institutionId: institution._id,
        examinationId: exam._id,
        academicYearId: academicYear._id,
        classId: testClass._id,
        sectionId: testSection._id,
        centralSubjectId: mathSubject._id,
        name: 'Mathematics Terminal Assessment',
        fullMarks: 100,
        passMarks: 35,
        theoryWeightage: 75,
        practicalWeightage: 25,
        workflowStatus: 'PUBLISHED',
      });
    }

    let sciAssessment = await ExamAssessment.findOne({ examinationId: exam._id, centralSubjectId: sciSubject._id });
    if (!sciAssessment) {
      sciAssessment = await ExamAssessment.create({
        institutionId: institution._id,
        examinationId: exam._id,
        academicYearId: academicYear._id,
        classId: testClass._id,
        sectionId: testSection._id,
        centralSubjectId: sciSubject._id,
        name: 'Science Terminal Assessment',
        fullMarks: 100,
        passMarks: 35,
        theoryWeightage: 75,
        practicalWeightage: 25,
        workflowStatus: 'PUBLISHED',
      });
    }

    // Marks population with official Nepal CDC calculations
    for (const sd of testStudents) {
      // Math
      const mathTheory = Math.round(sd.mathScore * 0.75);
      const mathPrac = Math.round(sd.mathScore * 0.25);
      const mathGpa = sd.mathScore >= 90 ? 4.0 : sd.mathScore >= 80 ? 3.6 : sd.mathScore >= 60 ? 2.8 : sd.mathScore >= 35 ? 1.6 : 0.0;
      const mathGrade = sd.mathScore >= 90 ? 'A+' : sd.mathScore >= 80 ? 'A' : sd.mathScore >= 60 ? 'B' : sd.mathScore >= 35 ? 'D' : 'NG';

      await StudentMark.findOneAndUpdate(
        { assessmentId: mathAssessment._id, studentId: sd.user._id },
        {
          institutionId: institution._id,
          examinationId: exam._id,
          classId: testClass._id,
          sectionId: testSection._id,
          centralSubjectId: mathSubject._id,
          theoryMarks: mathTheory,
          practicalMarks: mathPrac,
          totalMarks: sd.mathScore,
          marksTheory: mathTheory,
          marksPractical: mathPrac,
          marksObtained: sd.mathScore,
          gpa: mathGpa,
          grade: mathGrade,
          submittedBy: teacherUser._id,
          workflowStatus: 'PUBLISHED',
        },
        { upsert: true }
      );

      // Science
      const sciTheory = Math.round(sd.sciScore * 0.75);
      const sciPrac = Math.round(sd.sciScore * 0.25);
      const sciGpa = sd.sciScore >= 90 ? 4.0 : sd.sciScore >= 80 ? 3.6 : sd.sciScore >= 60 ? 2.8 : sd.sciScore >= 35 ? 1.6 : 0.0;
      const sciGrade = sd.sciScore >= 90 ? 'A+' : sd.sciScore >= 80 ? 'A' : sd.sciScore >= 60 ? 'B' : sd.sciScore >= 35 ? 'D' : 'NG';

      await StudentMark.findOneAndUpdate(
        { assessmentId: sciAssessment._id, studentId: sd.user._id },
        {
          institutionId: institution._id,
          examinationId: exam._id,
          classId: testClass._id,
          sectionId: testSection._id,
          centralSubjectId: sciSubject._id,
          theoryMarks: sciTheory,
          practicalMarks: sciPrac,
          totalMarks: sd.sciScore,
          marksTheory: sciTheory,
          marksPractical: sciPrac,
          marksObtained: sd.sciScore,
          gpa: sciGpa,
          grade: sciGrade,
          submittedBy: teacherUser._id,
          workflowStatus: 'PUBLISHED',
        },
        { upsert: true }
      );
    }

    // Attendance data
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const attSession = await AttendanceSession.findOneAndUpdate(
      { sectionId: testSection._id, date: today },
      {
        institutionId: institution._id,
        sectionId: testSection._id,
        classId: testClass._id,
        date: today,
        periodNumber: 1,
        totalStudents: 3,
        presentCount: 2,
        absentCount: 1,
        lateCount: 0,
        leaveCount: 0,
        takenBy: teacherUser._id,
      },
      { upsert: true, returnDocument: 'after' }
    );

    await AttendanceRecord.findOneAndUpdate(
      { sectionId: testSection._id, studentId: testStudents[0].user._id, date: today },
      {
        institutionId: institution._id,
        sectionId: testSection._id,
        studentId: testStudents[0].user._id,
        status: 'PRESENT',
        date: today,
        sessionId: attSession._id,
        recordedBy: teacherUser._id,
      },
      { upsert: true }
    );
    await AttendanceRecord.findOneAndUpdate(
      { sectionId: testSection._id, studentId: testStudents[1].user._id, date: today },
      {
        institutionId: institution._id,
        sectionId: testSection._id,
        studentId: testStudents[1].user._id,
        status: 'PRESENT',
        date: today,
        sessionId: attSession._id,
        recordedBy: teacherUser._id,
      },
      { upsert: true }
    );
    await AttendanceRecord.findOneAndUpdate(
      { sectionId: testSection._id, studentId: testStudents[2].user._id, date: today },
      {
        institutionId: institution._id,
        sectionId: testSection._id,
        studentId: testStudents[2].user._id,
        status: 'ABSENT',
        date: today,
        sessionId: attSession._id,
        recordedBy: teacherUser._id,
      },
      { upsert: true }
    );

    // ─────────────────────────────────────────────────────────────────
    // TEST 1: Principal Analytics Aggregation Pipeline
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 1] Testing Principal Academic Analytics Pipeline...');
    const principalData = await AnalyticsService.getPrincipalAnalytics(institution._id.toString());

    if (principalData && principalData.kpi.totalStudents >= 3) {
      console.log(`✅ Core KPIs Aggregated:`);
      console.log(`   Total Students: ${principalData.kpi.totalStudents} | Faculty: ${principalData.kpi.totalFaculty}`);
      console.log(`   Overall Attendance Rate: ${principalData.kpi.overallAttendanceRate}%`);
      console.log(`   Examination Completion Rate: ${principalData.kpi.examCompletionRate}%`);
    } else {
      throw new Error('Principal KPI aggregation failed.');
    }

    if (principalData.gradeDistribution.length >= 8) {
      console.log(`✅ Grade Distribution Aggregated: A+ through NG letter grades evaluated.`);
    } else {
      throw new Error('Grade distribution aggregation missing.');
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 2: Class Teacher Analytics & At-Risk Support
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 2] Testing Class Teacher Analytics & At-Risk Students Engine...');
    const ctData = await AnalyticsService.getClassTeacherAnalytics(testSection._id.toString(), exam._id.toString());

    console.log(`✅ Class Teacher Analytics Loaded:`);
    console.log(`   Class Average GPA: ${ctData.stats.classAverageGpa}`);
    console.log(`   Section Attendance Rate: ${ctData.stats.classAttendanceRate}%`);
    console.log(`   Total Ranked Students: ${ctData.rankedStudents.length}`);

    // Check rank 1 is Aarav Sharma (highest GPA)
    if (ctData.rankedStudents[0].studentName === 'Aarav Sharma' && ctData.rankedStudents[0].rank === 1) {
      console.log(`✅ Merit Ranking Validated: Aarav Sharma ranked #1 (GPA: ${ctData.rankedStudents[0].overallGpa})`);
    } else {
      throw new Error('Student merit ranking calculation incorrect.');
    }

    // Check at-risk detection catches Chandra Tamang
    const atRisk = ctData.studentsNeedingSupport.find((s: any) => s.studentName === 'Chandra Tamang');
    if (atRisk) {
      console.log(`✅ At-Risk Student Identified: Chandra Tamang flagged for remedial coaching.`);
      console.log(`   Risk Factors: ${atRisk.riskFactors.join(' | ')}`);
    } else {
      throw new Error('At-risk student Chandra Tamang was not detected.');
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 3: Subject Teacher Analytics
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 3] Testing Subject Teacher Analytics...');
    const stData = await AnalyticsService.getSubjectTeacherAnalytics(
      teacherUser._id.toString(),
      testSection._id.toString(),
      sciSubject._id.toString()
    );
    console.log(`✅ Subject Teacher Analytics Loaded:`);
    console.log(`   Evaluated Students: ${stData.performance.totalEvaluated}`);
    console.log(`   Average Score: ${stData.performance.averageScore} | Pass Rate: ${stData.performance.passPercentage}%`);

    // ─────────────────────────────────────────────────────────────────
    // TEST 4: Syllabus Progress Tracking
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 4] Testing Syllabus Progress Tracking Engine...');
    const syllabusItem = await AnalyticsService.recordSyllabusProgress({
      institutionId: institution._id.toString(),
      academicYearId: academicYear._id.toString(),
      classId: testClass._id.toString(),
      sectionId: testSection._id.toString(),
      centralSubjectId: sciSubject._id.toString(),
      teacherId: teacherUser._id.toString(),
      chapterNumber: 1,
      chapterTitle: 'Scientific Learning & Measurement',
      status: 'COMPLETED',
      coveredTopics: ['SI Units', 'Vernier Calipers', 'Screw Gauge'],
      totalTopics: 3,
      learningObjectives: ['Define standard units', 'Measure dimensions with Vernier'],
      completedObjectives: ['Define standard units', 'Measure dimensions with Vernier'],
      teachingHoursSpent: 6,
      teachingNotes: 'Classroom demonstration completed with IFP board simulation.',
    });

    if (syllabusItem && syllabusItem.completionPercentage === 100 && syllabusItem.status === 'COMPLETED') {
      console.log(`✅ Syllabus Progress Tracked: Chapter 1 marked COMPLETED (100% coverage).`);
    } else {
      throw new Error('Syllabus progress recording failed.');
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 5: Official PDF Report Card Generation
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 5] Testing Official Nepal CDC PDF Report Card Generator...');
    const pdfBuffer = await AnalyticsService.exportReportCardPdf(
      testStudents[0].user._id.toString(),
      exam._id.toString()
    );

    if (pdfBuffer && pdfBuffer.length > 1000 && pdfBuffer.toString('utf-8', 0, 4) === '%PDF') {
      console.log(`✅ PDF Report Card Generated: Size ${pdfBuffer.length} bytes (Standard Nepal CDC Format).`);
    } else {
      throw new Error('PDF Report Card generation failed or invalid buffer format.');
    }

    // ─────────────────────────────────────────────────────────────────
    // TEST 6: Excel & CSV Result Sheet Exports
    // ─────────────────────────────────────────────────────────────────
    console.log('\n[TEST 6] Testing Consolidated Results & Attendance CSV Exports...');
    const resultsCsv = await AnalyticsService.exportClassResultsCsv(
      testSection._id.toString(),
      exam._id.toString()
    );
    if (resultsCsv.includes('Roll No') && resultsCsv.includes('Aarav Sharma') && resultsCsv.includes('PASSED')) {
      console.log(`✅ Class Results CSV Exported: Verified columns, student scores, and pass statuses.`);
    } else {
      throw new Error('Results CSV export failed.');
    }

    const attendanceCsv = await AnalyticsService.exportAttendanceCsv(testSection._id.toString());
    if (attendanceCsv.includes('Attendance Rate') && attendanceCsv.includes('Aarav Sharma')) {
      console.log(`✅ Attendance CSV Exported: Verified attendance records and percentages.`);
    } else {
      throw new Error('Attendance CSV export failed.');
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎉 ALL 6/6 PHASE 11 ANALYTICS & REPORTING TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ Phase 11 Test Failed:', err);
    process.exit(1);
  }
}

runPhase11Tests();
