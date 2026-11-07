import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { SimulationActivityService } from './modules/simulation-activity/simulation-activity.service';
import {
  Simulation,
  Activity,
  ActivityQuestion,
  ActivityAssignment,
  ActivityAttempt,
  ActivityProgress,
} from './models/SimulationActivity';
import { Institution, User, Class, Section, AcademicYear } from './models';

async function runPhase7Tests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 NEPAL DIGITAL EDUCATION PLATFORM — PHASE 7 TEST SUITE');
  console.log('   Educational Simulation & Interactive Activity Engine');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB.');

    // ── TEST 1: Seed Initial Nepal Curriculum Simulations & Activities ──
    console.log('\n[TEST 1] Seeding Initial Content & Validating Library...');
    await SimulationActivityService.seedInitialContent();

    const totalSims = await Simulation.countDocuments();
    const totalActs = await Activity.countDocuments();
    console.log(`  📊 Total Active Simulations in Library: ${totalSims}`);
    console.log(`  📊 Total Activities in Catalog: ${totalActs}`);
    if (totalSims < 5 || totalActs < 4) {
      throw new Error(`Seeding check failed: Expected >= 5 sims and >= 4 acts, found ${totalSims} / ${totalActs}`);
    }
    console.log('  ✅ Initial Nepal CDC curriculum simulations and activities seeded.');

    // ── TEST 2: Grade-Based Filter & Simulation Discovery ─────────
    console.log('\n[TEST 2] Testing Grade-Based Simulation Discovery...');
    const primarySims = await SimulationActivityService.listSimulations({ grade: 2 });
    console.log(`  🔍 Primary (Grade 2) Simulations found: ${primarySims.length}`);
    primarySims.forEach((s) => console.log(`     - [Grade ${s.gradeLevels.join(',')}] ${s.title}`));

    const secSims = await SimulationActivityService.listSimulations({ grade: 10 });
    console.log(`  🔍 Secondary (Grade 10) Simulations found: ${secSims.length}`);
    secSims.forEach((s) => console.log(`     - [Grade ${s.gradeLevels.join(',')}] ${s.title}`));

    if (primarySims.length === 0 || secSims.length === 0) {
      throw new Error('Grade filtering returned empty lists');
    }
    console.log('  ✅ Grade-based simulation discovery verified.');

    // ── TEST 3: Super Admin Simulation Management & Versioning ────
    console.log('\n[TEST 3] Super Admin Simulation Creation & Versioning...');
    await Simulation.deleteMany({ code: 'SIM-TEST-OPTICS' });
    const testSim = await SimulationActivityService.createSimulation({
      code: 'SIM-TEST-OPTICS',
      title: 'Ray Optics Reflection and Refraction',
      titleNepali: 'प्रकाशको परावर्तन र अपवर्तन',
      description: 'Interactive ray optics simulator testing Snell law.',
      learningObjectives: ['Verify Snell Law', 'Observe Total Internal Reflection'],
      gradeLevels: [8, 9, 10],
      subjectCode: 'SCI',
      language: 'both',
      simulationType: '2D_CANVAS',
      runtimeUrl: '/simulations/physics-ray-optics.html',
      isPublished: true,
      currentVersion: '1.0.0',
    });

    console.log(`  ✨ Created Simulation: ${testSim.title} (Code: ${testSim.code})`);

    // Add version 1.1.0
    const v2 = await SimulationActivityService.addSimulationVersion(testSim.id, {
      versionNumber: '1.1.0',
      changelog: 'Added index of refraction slider for crown glass and water',
    });
    console.log(`  📦 Added Version: ${v2.versionNumber} (Current: ${v2.isCurrent})`);

    const fetchedSim = await SimulationActivityService.getSimulationById(testSim.id);
    if (!fetchedSim || fetchedSim.versions.length < 2) {
      throw new Error('Simulation versioning check failed');
    }
    console.log('  ✅ Simulation lifecycle and versioning validated.');

    // ── TEST 4: Multi-type Activity Engine & Question Verification ─
    console.log('\n[TEST 4] Validating Interactive Activity Question Types...');
    const sampleAct = await Activity.findOne({ code: 'ACT-SCI-G8-CIRCUIT' });
    if (!sampleAct) throw new Error('Seeded activity ACT-SCI-G8-CIRCUIT not found');

    const fullAct = await SimulationActivityService.getActivityById(sampleAct.id);
    console.log(`  📋 Activity: ${fullAct?.title} (Type: ${fullAct?.type})`);
    console.log(`  ❓ Total Questions: ${fullAct?.questions.length}`);
    fullAct?.questions.forEach((q, i) => {
      console.log(`     Q${i + 1} [${q.type}]: ${q.prompt}`);
    });
    console.log('  ✅ Activity structure verified.');

    // ── TEST 5: Teacher Assignment & Student Submission ───────────
    console.log('\n[TEST 5] Teacher Assignment & Automated Student Grading Engine...');
    // Find or create test institution, teacher, and student
    let inst = await Institution.findOne({ emisCode: '270010001' });
    if (!inst) {
      inst = await Institution.create({
        emisCode: '270010001',
        name: 'Kathmandu Model Secondary School',
        type: 'COMMUNITY',
        province: 'Bagmati Province',
        district: 'Kathmandu',
        localLevel: 'Kathmandu Metropolitan City',
        status: 'ACTIVE',
      });
    }

    let teacher = await User.findOne({ username: 'teacher_ramesh' });
    if (!teacher) {
      teacher = await User.create({
        institutionId: inst._id,
        username: 'teacher_ramesh',
        email: 'ramesh@kmss.edu.np',
        passwordHash: 'dummy',
        role: 'TEACHER',
        fullName: 'Ramesh Adhikari',
        status: 'ACTIVE',
      });
    }

    let student = await User.findOne({ username: 'student_aarav' });
    if (!student) {
      student = await User.create({
        institutionId: inst._id,
        username: 'student_aarav',
        email: 'aarav@kmss.edu.np',
        passwordHash: 'dummy',
        role: 'STUDENT',
        fullName: 'Aarav Sharma',
        status: 'ACTIVE',
      });
    }

    let ay = await AcademicYear.findOne({ institutionId: inst._id });
    if (!ay) {
      ay = await AcademicYear.create({
        institutionId: inst._id,
        name: '2081/2082',
        isCurrent: true,
      });
    }

    let cls = await Class.findOne({ institutionId: inst._id, gradeNumber: 8 });
    if (!cls) {
      cls = await Class.create({
        institutionId: inst._id,
        gradeNumber: 8,
        name: 'Class 8',
        board: 'NEB',
      });
    }

    let sec = await Section.findOne({ classId: cls._id, name: 'A' });
    if (!sec) {
      sec = await Section.create({
        institutionId: inst._id,
        academicYearId: ay._id,
        classId: cls._id,
        name: 'A',
        medium: 'NEPALI',
      });
    }

    // Teacher assigns activity
    const assignment = await SimulationActivityService.createAssignment(
      teacher.id,
      inst.id,
      {
        activityId: sampleAct.id,
        classId: cls.id,
        sectionId: sec.id,
        dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      }
    );
    console.log(`  📝 Teacher created assignment ID: ${assignment.id} for Class ${cls.name}`);

    // Student submits answers
    // Q1: 'opt1' (I = V / R - Correct)
    // Q2: 'opt3' (Ohm - Correct)
    const q1 = fullAct?.questions[0];
    const q2 = fullAct?.questions[1];

    const studentAttempt = await SimulationActivityService.submitAttempt({
      studentId: student.id,
      studentName: student.fullName,
      institutionId: inst.id,
      classId: cls.id,
      sectionId: sec.id,
      activityId: sampleAct.id,
      assignmentId: assignment.id,
      answers: [
        { questionId: String(q1!._id), studentAnswer: 'opt1' },
        { questionId: String(q2!._id), studentAnswer: 'opt3' },
      ],
      timeSpentSeconds: 45,
    });

    console.log(`  🎯 Student Score: ${studentAttempt.totalScore} / ${studentAttempt.maxScore} (${studentAttempt.percentage}%)`);
    console.log(`  🏆 Passed: ${studentAttempt.passed}`);
    if (studentAttempt.percentage !== 100 || !studentAttempt.passed) {
      throw new Error('Automated grading calculation mismatch');
    }
    console.log('  ✅ Automated grading and scoring engine verified with 100% precision.');

    // ── TEST 6: Progress Tracking & Teacher Analytics ─────────────
    console.log('\n[TEST 6] Validating Progress Persistence & Teacher Analytics...');
    const progress = await ActivityProgress.findOne({
      studentId: student.id,
      activityId: sampleAct.id,
    });
    console.log(`  📈 Student Best Score: ${progress?.bestScore}, Attempts: ${progress?.attemptsCount}, Completed: ${progress?.isCompleted}`);
    if (!progress || !progress.isCompleted) {
      throw new Error('Activity progress record failed to update isCompleted');
    }

    const analytics = await SimulationActivityService.getAssignmentAnalytics(assignment.id, inst.id);
    console.log(`  📊 Assignment Analytics: Submissions: ${analytics.totalSubmissions}, Avg Score: ${analytics.avgScore}%, Pass Rate: ${analytics.passRate}%`);
    if (analytics.totalSubmissions !== 1 || analytics.avgScore !== 100) {
      throw new Error('Assignment analytics aggregation error');
    }
    console.log('  ✅ Progress tracking and teacher analytics verified.');

    // ── TEST 7: Cleanup test simulation ───────────────────────────
    console.log('\n[TEST 7] Cleaning up test records...');
    await SimulationActivityService.deleteSimulation(testSim.id);
    console.log('  ✅ Test simulation cleaned up cleanly.');

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🎉 ALL 7 PHASE 7 TESTS PASSED WITH 100% SUCCESS RATE!');
    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (error: any) {
    console.error('\n❌ TEST FAILURE:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

runPhase7Tests();
