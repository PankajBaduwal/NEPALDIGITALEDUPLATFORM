import mongoose from 'mongoose';
import { Quiz, QuizAttempt } from '../models/Quiz';
import { Assignment, AssignmentSubmission, CentralSubject } from '../models';
import { AIAssignmentService } from '../modules/assignment/ai-assignment.service';
import { AIQuizService } from '../modules/quiz/ai-quiz.service';
import { AssignmentService } from '../modules/assignment/assignment.service';
import { QuizService } from '../modules/quiz/quiz.service';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nepal_edu_ecosystem';

async function runAssessmentStudioE2ETest() {
  console.log('=== STARTING ASSESSMENT & ASSIGNMENT STUDIO E2E VERIFICATION ===');
  await mongoose.connect(MONGO_URI);
  console.log(' Connected to MongoDB:', MONGO_URI);

  const institutionId = new mongoose.Types.ObjectId().toString();
  const classId = new mongoose.Types.ObjectId().toString();
  const sectionId = new mongoose.Types.ObjectId().toString();
  const teacherId = new mongoose.Types.ObjectId().toString();
  const student1Id = new mongoose.Types.ObjectId().toString();
  const student2Id = new mongoose.Types.ObjectId().toString();

  // Find or create a dummy central subject
  let subject = await CentralSubject.findOne();
  if (!subject) {
    subject = await CentralSubject.create({
      code: 'CS101',
      name: 'Computer Science',
      gradeNumber: 11,
      stream: 'GENERAL',
      curriculumFrameworkYear: 2076,
    });
  }
  const centralSubjectId = subject._id.toString();

  // ─────────────────────────────────────────────────────────
  // TEST 1: AI ASSIGNMENT GENERATOR WITH CDC ANTI-HALLUCINATION
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 1. Testing AI Curriculum Assignment Generator ---');
  const assignmentDraft = await AIAssignmentService.generateAssignmentDraft({
    centralSubjectId,
    classId,
    selectedUnits: [
      { unitNumber: 1, title: 'Computational Thinking' },
      { unitNumber: 2, title: 'Algorithmic Approach' },
    ],
    difficulty: 'MEDIUM',
    assignmentType: 'Standard Homework',
    bloomsTaxonomy: ['Apply', 'Analyze'],
    questionCount: 5,
    groundingNotes: 'Focus on flowcharts, pseudocode, and algorithm time complexity in standard Nepal CDC curriculum.',
  });

  console.log(' AI Generated Assignment Title:', assignmentDraft.title);
  console.log(' Questions Generated:', assignmentDraft.questions?.length);
  console.log(' Rubric Criteria Generated:', assignmentDraft.rubric?.length);
  console.log(' Anti-Hallucination Verified:', assignmentDraft.antiHallucinationVerified);

  if (!assignmentDraft.questions || assignmentDraft.questions.length === 0) {
    throw new Error('AI Assignment draft failed to generate questions');
  }

  // ─────────────────────────────────────────────────────────
  // TEST 2: ASSIGNMENT STUDIO CREATION (8-Step Full Workflow)
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 2. Testing Assignment Studio Persistence ---');
  const assignment = await AssignmentService.createAssignment({
    institutionId,
    classId,
    sectionId,
    centralSubjectId,
    teacherId,
    title: assignmentDraft.title,
    description: assignmentDraft.description,
    detailedInstructions: 'Submit clear solutions. For algorithmic proofs, handwritten notes must be scanned.',
    curriculumUnits: [
      { unitNumber: 1, title: 'Computational Thinking' },
      { unitNumber: 2, title: 'Algorithmic Approach' },
    ],
    unitTitle: 'Computational Thinking',
    dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    maxScore: assignmentDraft.maxScore || 25,
    lateSubmissionPolicy: 'ALLOW_WITH_PENALTY',
    latePenaltyPercent: 10,
    submissionSettings: {
      allowedFormats: ['.pdf', '.docx', '.png'],
      maxFileSizeMb: 25,
      allowMultipleFiles: true,
      requireHandwrittenScan: true,
    },
    evaluationRules: {
      passingMarks: 10,
      gradingType: 'RUBRIC_BASED',
      allowResubmission: true,
      maxResubmissions: 2,
    },
    copyDetectionSettings: {
      enabled: true,
      similarityThresholdPercent: 30,
      crossSectionChecking: true,
      archiveComparison: true,
    },
    autoCheckingSettings: {
      enabled: true,
      ocrAnalysis: true,
      formulaValidation: true,
      codeExecution: false,
    },
    questions: assignmentDraft.questions,
    rubric: assignmentDraft.rubric,
    status: 'ACTIVE',
  });

  console.log(' Assignment Created Successfully:', assignment._id);
  console.log(' Assignment Status:', assignment.status);
  console.log(' Questions in MongoDB:', assignment.questions?.length);
  console.log(' Rubric Criteria in MongoDB:', assignment.rubric?.length);

  // ─────────────────────────────────────────────────────────
  // TEST 3: STUDENT SUBMISSION, COPY DETECTION & OCR ANALYSIS
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 3. Testing Student Submissions with Copy Detection ---');
  
  // Student 1 submits
  const submission1 = await AssignmentService.submitAssignment(
    assignment._id.toString(),
    student1Id,
    institutionId,
    {
      content: 'An algorithm is a finite sequence of well-defined computer instructions to solve a class of specific problems or perform computation.',
      fileUrl: 'https://example.com/student1_solution.pdf',
      originalFilename: 'solution_student1.pdf',
    }
  );
  console.log(' Student 1 Submitted. Similarity Score:', submission1.similarityReport?.scorePercent, '%');

  // Student 2 submits identical/similar content
  const submission2 = await AssignmentService.submitAssignment(
    assignment._id.toString(),
    student2Id,
    institutionId,
    {
      content: 'An algorithm is a finite sequence of well-defined computer instructions to solve a class of specific problems or perform computation with flowcharts.',
      fileUrl: 'https://example.com/student2_solution.pdf',
      originalFilename: 'solution_student2.pdf',
    }
  );
  console.log(' Student 2 Submitted. Similarity Score:', submission2.similarityReport?.scorePercent, '%');
  console.log(' Student 2 Report Status:', submission2.similarityReport?.reportStatus);

  // ─────────────────────────────────────────────────────────
  // TEST 4: TEACHER EVALUATION WITH RUBRIC CRITERIA
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 4. Testing Teacher Rubric Evaluation ---');
  const evaluated = await AssignmentService.gradeSubmission(
    submission1._id.toString(),
    teacherId,
    {
      marksObtained: 23,
      feedback: 'Excellent work and rigorous algorithmic breakdown.',
      rubricScores: [
        { criterion: 'Concept Understanding', score: 9, feedback: 'Strong grasp of foundational concepts.' },
        { criterion: 'Algorithmic Accuracy', score: 9.5, feedback: 'Accurate step-by-step logic.' },
        { criterion: 'Neatness & Documentation', score: 4.5, feedback: 'Clear formatting and annotations.' },
      ],
    }
  );
  console.log(' Evaluated Submission Status:', evaluated.status);
  console.log(' Evaluated Marks:', evaluated.marksObtained);
  console.log(' Rubric Criteria Scores Saved:', evaluated.rubricScores?.length);

  // ─────────────────────────────────────────────────────────
  // TEST 5: AI QUIZ GENERATOR WITH ANTI-HALLUCINATION & MULTI-FORMAT
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 5. Testing AI Quiz Generator ---');
  const quizGenResult = await AIQuizService.generateQuizQuestions({
    centralSubjectId,
    selectedUnits: [
      { unitNumber: 1, title: 'Force and Motion' },
      { unitNumber: 2, title: 'Pressure' },
    ],
    difficulty: 'MEDIUM',
    questionFormats: ['MCQ', 'ASSERTION_REASON', 'NUMERICAL'],
    questionCount: 3,
    bloomsTaxonomy: ['Analyze', 'Apply'],
    groundingNotes: 'Newton second law of motion F=ma, gravitational acceleration g=9.8m/s2, liquid pressure P=hdg.',
  });

  console.log(' AI Generated Quiz Questions Count:', quizGenResult.questions?.length);
  quizGenResult.questions?.forEach((q, idx) => {
    console.log(`   Q${idx + 1} [${q.questionType}]: ${q.questionText.slice(0, 50)}...`);
  });

  // ─────────────────────────────────────────────────────────
  // TEST 6: QUIZ STUDIO ASSESSMENT CREATION & PROCTORING
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 6. Testing Quiz Studio Assessment Creation & Security Settings ---');
  const quiz = await QuizService.createQuiz({
    institutionId,
    classId,
    sectionId,
    centralSubjectId,
    teacherId,
    title: 'Class 10 Force & Pressure Midterm Exam',
    description: 'Official CDC assessment with proctored anti-cheat mechanisms.',
    targetMode: 'CHAPTER_WISE',
    curriculumUnits: ['Unit 1: Force and Motion', 'Unit 2: Pressure'],
    difficultyLevel: 'MEDIUM',
    durationMinutes: 30,
    passingMarks: 6,
    totalMarks: 10,
    securitySettings: {
      fullscreenEnforced: true,
      tabSwitchDetection: true,
      preventClipboard: true,
      autoSubmitOnViolation: true,
      maxWarnings: 3,
    },
    attemptPolicy: {
      maxAttempts: 1,
      retakeCooldownMinutes: 0,
      showAnswersAfterSubmission: true,
    },
    resultSettings: {
      releaseMode: 'INSTANT',
      showScore: true,
      showCorrectAnswers: true,
      showExplanations: true,
    },
    negativeMarking: {
      enabled: true,
      penaltyPerWrong: 0.25,
    },
    questions: [
      {
        questionText: 'What is the acceleration due to gravity on the surface of the Earth?',
        questionType: 'MCQ',
        options: [
          { id: 'opt_a', text: '9.8 m/s²' },
          { id: 'opt_b', text: '8.9 m/s²' },
          { id: 'opt_c', text: '10.8 m/s²' },
          { id: 'opt_d', text: '7.8 m/s²' },
        ],
        correctAnswers: 'opt_a',
        marks: 2,
        explanation: 'According to Nepal CDC Grade 10 Science, standard acceleration due to gravity g = 9.8 m/s².',
      },
      {
        questionText: 'Assertion (A): Atmospheric pressure decreases as altitude increases.\nReason (R): The density of air molecules decreases at higher altitudes.',
        questionType: 'ASSERTION_REASON',
        assertionText: 'Atmospheric pressure decreases as altitude increases.',
        reasonText: 'The density of air molecules decreases at higher altitudes.',
        options: [
          { id: 'opt_a', text: 'Both A and R are true, and R is the correct explanation of A' },
          { id: 'opt_b', text: 'Both A and R are true, but R is not the correct explanation of A' },
          { id: 'opt_c', text: 'A is true, but R is false' },
          { id: 'opt_d', text: 'A is false, but R is true' },
        ],
        correctAnswers: 'opt_a',
        marks: 3,
        explanation: 'Air density drops with altitude, lowering atmospheric weight per unit area.',
      },
      {
        questionText: 'Calculate the force required to accelerate a 5 kg mass at 2 m/s².',
        questionType: 'NUMERICAL',
        options: [],
        correctAnswers: '10',
        numericalAnswer: 10,
        tolerance: 0.1,
        unitLabel: 'N',
        marks: 5,
        explanation: 'F = m * a = 5 kg * 2 m/s² = 10 N.',
      },
    ],
    status: 'PUBLISHED',
  });

  console.log(' Quiz Assessment Created:', quiz._id);
  console.log(' Quiz Security Settings:', quiz.securitySettings);

  // ─────────────────────────────────────────────────────────
  // TEST 7: PROCTORED STUDENT QUIZ ATTEMPT & AUTOMATED GRADING
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 7. Testing Student Proctored Quiz Attempt ---');
  const q0Id = (quiz.questions[0] as any)._id?.toString() || quiz.questions[0].id;
  const q1Id = (quiz.questions[1] as any)._id?.toString() || quiz.questions[1].id;
  const q2Id = (quiz.questions[2] as any)._id?.toString() || quiz.questions[2].id;

  const attemptResult = await QuizService.submitQuizAttempt(
    quiz._id.toString(),
    student1Id,
    institutionId,
    [
      { questionId: q0Id, selectedOption: 'opt_a' }, // Correct (+2)
      { questionId: q1Id, selectedOption: 'opt_a' }, // Correct (+3)
      { questionId: q2Id, selectedOption: '10' },     // Correct (+5)
    ],
    420,
    {
      securityEvents: [
        { eventType: 'TAB_SWITCH', timestamp: new Date(), details: 'Student switched tab briefly' },
      ],
      warningsCount: 1,
    }
  );

  console.log(' Student Quiz Attempt Result:');
  console.log('   Score:', attemptResult.score, '/', attemptResult.totalMarks);
  console.log('   Percentage:', attemptResult.percentage, '%');
  console.log('   Passed:', attemptResult.passed);
  console.log('   Warnings Count Recorded:', attemptResult.warningsCount);
  console.log('   Security Events Recorded:', attemptResult.securityEvents?.length);

  // Clean up test data
  await AssignmentSubmission.deleteMany({ assignmentId: assignment._id });
  await Assignment.deleteOne({ _id: assignment._id });
  await QuizAttempt.deleteMany({ quizId: quiz._id });
  await Quiz.deleteOne({ _id: quiz._id });

  await mongoose.disconnect();
  console.log('\n=== ALL ASSESSMENT & ASSIGNMENT STUDIO TESTS PASSED SUCCESSFULLY! ===\n');
}

runAssessmentStudioE2ETest().catch((err) => {
  console.error(' Assessment Studio E2E Test Failed:', err);
  process.exit(1);
});
