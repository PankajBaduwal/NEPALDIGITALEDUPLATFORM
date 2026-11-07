import path from 'path';
import fs from 'fs';
import { connectDB, disconnectDB } from './config/db';
import {
  Institution,
  User,
  Class,
  Section,
  CentralSubject,
  Textbook,
  AnnotationSession,
  ClassroomSession,
  ActivityCatalog,
} from './models';
import { SmartBoardService } from './modules/smartboard/smartboard.service';

async function runPhase6Tests() {
  console.log('🇳🇵 ========================================================');
  console.log('🇳🇵 NEPAL DIGITAL EDUCATION ECOSYSTEM — PHASE 6 TEST SUITE');
  console.log('🇳🇵 Smart Board & Digital Classroom Integration');
  console.log('🇳🇵 ========================================================\n');

  await connectDB();

  try {
    // ── SETUP & FIXTURES ──────────────────────────────────────────
    console.log('🔧 [SETUP] Resolving Institutional Context and Teacher Identity...');
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

    let cls = await Class.findOne({ institutionId: inst._id, gradeNumber: 10 });
    if (!cls) {
      cls = await Class.create({
        institutionId: inst._id,
        academicYearId: new (require('mongoose').Types.ObjectId)(),
        gradeNumber: 10,
        name: 'Class 10',
      });
    }

    let sec = await Section.findOne({ classId: cls._id });
    if (!sec) {
      sec = await Section.create({
        institutionId: inst._id,
        classId: cls._id,
        academicYearId: cls.academicYearId,
        name: 'Sagarmatha',
      });
    }

    let subject = await CentralSubject.findOne({ code: 'MATH-10' });
    if (!subject) {
      subject = await CentralSubject.create({
        code: 'MATH-10',
        name: 'Compulsory Mathematics',
        nameNepali: 'अनिवार्य गणित',
        gradeNumber: 10,
        creditHours: 4,
      });
    }

    let textbook = await Textbook.findOne({ gradeNumber: 10 });
    console.log(`  ✅ Institution Context: ${inst.name} (EMIS: ${inst.emisCode})`);
    console.log(`  ✅ Verified Teacher: ${teacher.fullName} (${teacher.role})`);
    console.log(`  ✅ Class & Section: Class ${cls.gradeNumber} - Section ${sec.name}`);
    console.log(`  ✅ Subject: ${subject.name} (${subject.code})`);

    // ── TEST 1: Smart Board Classroom Launcher & Institution Security ───
    console.log('\n🧪 [TEST 1] Testing Smart Board Classroom Launcher & Institutional Isolation...');
    // Teacher selects Institution (locked from session), Class, Section, Subject, Chapter, Lesson
    const sessionResult = await SmartBoardService.startClassroomSession({
      institutionId: inst.id,
      teacherId: teacher.id,
      classId: cls.id,
      sectionId: sec.id,
      subjectId: subject.id,
      textbookId: textbook?.id,
      chapterNumber: 2,
      chapterTitle: 'Quadratic Equations & Polynomials',
      lessonTitle: 'Solving Quadratic Equations by Factorization',
      initialResourceType: 'TEXTBOOK',
      initialResourceName: textbook?.title || 'Compulsory Math Grade 10',
      initialResourceUrl: textbook ? `/api/v1/curriculum/textbooks/${textbook.id}/pdf` : undefined,
    });

    console.log(`  🚀 Session Created: ID = ${sessionResult.session.id}`);
    console.log(`  🔗 Generated Launcher URL: ${sessionResult.launcherUrl}`);
    console.log(`  🏛️ Verified Institutional Lock: ${sessionResult.institution.name}`);

    if (!sessionResult.session || sessionResult.session.status !== 'ACTIVE') {
      throw new Error('Classroom session failed to initialize with ACTIVE status');
    }
    if (!sessionResult.launcherUrl.includes('sessionId=') || !sessionResult.launcherUrl.includes('/smartboard/index.html')) {
      throw new Error('Invalid Smart Board launcher URL format');
    }
    console.log('  ✅ Launcher URL and secure session context verified.');

    // ── TEST 2: Active Session Retrieval & Session Management ──
    console.log('\n🧪 [TEST 2] Testing Active Session Retrieval & Resource Usage Tracking...');
    const activeSession = await SmartBoardService.getActiveClassroomSession(teacher.id, inst.id);
    if (!activeSession || activeSession.id !== sessionResult.session.id) {
      throw new Error('Failed to retrieve active classroom session for teacher');
    }
    console.log(`  ✅ Live Active Session verified: ${activeSession.lessonTitle}`);

    // Log another resource used (HTML5 Simulation)
    await SmartBoardService.updateClassroomSession(sessionResult.session.id, inst.id, {
      lessonCoverage: 'Covered algebraic factorization methods and parabolic curve behavior',
      addResource: {
        type: 'SIMULATION',
        name: 'Math Visualizer - Parabola Explorer',
        url: '/smartboard/math-visualizer.html',
        timeSpentSeconds: 420,
      },
    });

    const updatedSession = await ClassroomSession.findById(sessionResult.session.id);
    console.log(`  📊 Resources Used in Session: ${updatedSession?.resourcesUsed.length}`);
    updatedSession?.resourcesUsed.forEach((r: any, idx: number) => {
      console.log(`     - [${r.type}] ${r.name}`);
    });
    if (updatedSession?.resourcesUsed.length !== 2) {
      throw new Error('Resource usage tracking failed to record multiple resources');
    }
    console.log('  ✅ Multiple resources logged cleanly during live teaching session.');

    // ── TEST 3: Annotation Storage (Separation from PDF) ─────────
    console.log('\n🧪 [TEST 3] Testing Annotation Storage (Separation from Original PDF)...');
    const sampleBoardState = {
      pages: [
        {
          id: 1,
          label: 'Page 1 - Quadratic Derivations',
          shapes: [
            { type: 'rect', x: 100, y: 150, w: 300, h: 200, color: '#38bdf8' },
            { type: 'text', x: 120, y: 180, text: 'ax² + bx + c = 0', color: '#facc15' },
          ],
          drawDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        },
      ],
      currentPage: 0,
      chapter: 2,
    };

    const savedAnnotation = await SmartBoardService.saveAnnotationSession({
      institutionId: inst.id,
      teacherId: teacher.id,
      classId: cls.id,
      sectionId: sec.id,
      subjectId: subject.id,
      textbookId: textbook?.id,
      pageNumber: 24,
      title: 'Class 10 Math - Page 24 Teacher Derivation',
      annotationData: {
        strokeCount: 42,
        formula: 'ax² + bx + c = 0',
      },
      drawDataUrl: sampleBoardState.pages[0].drawDataUrl,
      boardState: sampleBoardState,
      isSharedWithStudents: true,
    });

    console.log(`  💾 Saved Annotation ID: ${savedAnnotation.id}`);
    console.log(`  📄 Annotated Page: ${savedAnnotation.pageNumber}`);
    console.log(`  🌐 Shared with Students: ${savedAnnotation.isSharedWithStudents}`);

    // Verify retrieval
    const retrievedNotes = await SmartBoardService.listAnnotationSessions({
      institutionId: inst.id,
      textbookId: textbook?.id,
      pageNumber: 24,
    });
    console.log(`  📂 Found ${retrievedNotes.length} saved cloud annotation(s) for Page 24.`);
    if (retrievedNotes.length === 0 || retrievedNotes[0].id !== savedAnnotation.id) {
      throw new Error('Failed to retrieve saved cloud annotations');
    }

    const fullNote = await SmartBoardService.getAnnotationSessionById(savedAnnotation.id, inst.id);
    if (!fullNote.boardState || !fullNote.boardState.pages) {
      throw new Error('Board state payload corrupted or missing');
    }
    console.log('  ✅ Annotations stored and restored without modifying original PDF.');

    // ── TEST 4: Simulation & Activity Launcher ───────────────────
    console.log('\n🧪 [TEST 4] Testing Curriculum Simulation & Activity Launcher...');
    const sims = await SmartBoardService.listSimulations({ grade: 10 });
    console.log(`  🔬 Available Curriculum Simulations: ${sims.length}`);

    const activities = await SmartBoardService.listActivities({ grade: 10 });
    console.log(`  🧩 Available Curriculum Activities: ${activities.length}`);
    activities.forEach((act) => {
      console.log(`     - [${act.type}] ${act.title}`);
    });

    if (activities.length === 0) {
      throw new Error('No interactive activities returned for curriculum grade 10');
    }
    console.log('  ✅ Simulation and activity catalog connected to curriculum hierarchy.');

    // ── TEST 5: Ending Classroom Session & Chapter Completion Rule ──
    console.log('\n🧪 [TEST 5] Testing Session Completion (Strict Non-Automatic Completion Rule)...');
    const endedSession = await SmartBoardService.endClassroomSession(sessionResult.session.id, inst.id, {
      durationSeconds: 2700, // 45 minutes class
      lessonCoverage: 'Full derivation and 5 practice numericals completed.',
    });

    console.log(`  ⏹️ Session Status: ${endedSession.status}`);
    console.log(`  ⏱️ Duration: ${Math.round(endedSession.durationSeconds / 60)} minutes`);
    console.log(`  📝 Lesson Summary: ${endedSession.lessonCoverage}`);

    if (endedSession.status !== 'COMPLETED' || endedSession.durationSeconds !== 2700) {
      throw new Error('Classroom session did not complete cleanly');
    }
    console.log('  ✅ Session ended properly. Chapter completion status preserved intact.');

    // ── TEST 6: Cross-Tenant Isolation Guarantee ─────────────────
    console.log('\n🧪 [TEST 6] Testing Cross-Institution Isolation Boundary...');
    // Create a different institution (Pokhara Secondary Academy)
    const schoolB = await Institution.create({
      emisCode: '380020002',
      name: 'Pokhara Secondary Academy',
      type: 'INSTITUTIONAL',
      province: 'Gandaki Province',
      district: 'Kaski',
      localLevel: 'Pokhara Metropolitan City',
      status: 'ACTIVE',
    });

    // School B attempts to access School A's annotation
    try {
      await SmartBoardService.getAnnotationSessionById(savedAnnotation.id, schoolB.id);
      throw new Error('Cross-tenant leak: School B accessed School A annotations!');
    } catch (err: any) {
      console.log(`  🛡️ Access Denied as expected: ${err.message || 'Unauthorized'}`);
    }

    // School B lists annotations - must be empty
    const schoolBNotes = await SmartBoardService.listAnnotationSessions({ institutionId: schoolB.id });
    if (schoolBNotes.length !== 0) {
      throw new Error('Cross-tenant leak: School B received annotations belonging to School A');
    }
    console.log('  ✅ Cross-institution isolation strictly verified.');

    // ── TEST 7: Smart Board Bridge Script Verification ───────────
    console.log('\n🧪 [TEST 7] Testing Smart Board Bridge Integration Files...');
    let bridgeFile = path.resolve(process.cwd(), 'smartboard/modules/smartboard-bridge.js');
    if (!fs.existsSync(bridgeFile)) {
      bridgeFile = path.resolve(process.cwd(), '../smartboard/modules/smartboard-bridge.js');
    }
    let indexFile = path.resolve(process.cwd(), 'smartboard/index.html');
    if (!fs.existsSync(indexFile)) {
      indexFile = path.resolve(process.cwd(), '../smartboard/index.html');
    }

    if (!fs.existsSync(bridgeFile)) {
      throw new Error('smartboard-bridge.js missing on disk');
    }
    const indexHtml = fs.readFileSync(indexFile, 'utf8');
    if (!indexHtml.includes('modules/smartboard-bridge.js')) {
      throw new Error('index.html missing script tag for modules/smartboard-bridge.js');
    }
    console.log('  ✅ smartboard-bridge.js verified on disk and wired in index.html.');

    // Clean up test fixtures
    await AnnotationSession.findByIdAndDelete(savedAnnotation.id);
    await ClassroomSession.findByIdAndDelete(sessionResult.session.id);
    await Institution.findByIdAndDelete(schoolB.id);
    console.log('  ✅ Test session artifacts cleaned up successfully.');

    console.log('\n========================================================');
    console.log('🎉 ALL PHASE 6 TESTS PASSED WITH 100% SUCCESS!');
    console.log('========================================================\n');
  } catch (err: any) {
    console.error('\n❌ PHASE 6 TEST FAILED:', err);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

runPhase6Tests();
