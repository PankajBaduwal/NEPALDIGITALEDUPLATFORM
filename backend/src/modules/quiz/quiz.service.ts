import mongoose from 'mongoose';
import { Quiz, QuizAttempt, QuizSession, IQuiz, IQuizQuestion, IQuizAttempt } from '../../models/Quiz';
import { Section, Class, CentralSubject, User, StudentEnrollment } from '../../models';
import { NotificationService } from '../notifications/notification.service';

export interface CreateQuizInput {
  institutionId: string;
  classId: string;
  sectionId: string;
  centralSubjectId: string;
  teacherId: string;
  title: string;
  description?: string;
  medium?: 'ENGLISH' | 'NEPALI' | 'BOTH';
  textbookId?: string;
  chapterNumber?: number;
  topic?: string;
  curriculumUnits?: any[];
  targetMode?: 'CHAPTER_WISE' | 'COMBINED';
  difficultyLevel?: 'EASY' | 'MEDIUM' | 'HARD' | 'MIXED';
  durationMinutes?: number;
  totalMarks?: number;
  passingMarks?: number;
  passingScorePercent?: number;
  instructions?: string;
  startTime?: Date;
  endTime?: Date;
  questions: IQuizQuestion[];
  securitySettings?: any;
  attemptPolicy?: any;
  resultSettings?: any;
  negativeMarking?: any;
  sourceNotes?: any[];
  isAiGenerated?: boolean;
  aiGenerationMetadata?: any;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}

export class QuizService {
  /**
   * Create a new quiz with complete curriculum units & security settings
   */
  static async createQuiz(input: CreateQuizInput): Promise<IQuiz> {
    const totalMarks = input.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    const passPercent = input.passingScorePercent || 50;
    const passingMarks = input.passingMarks || Math.ceil((totalMarks * passPercent) / 100);

    const quiz = new Quiz({
      ...input,
      totalMarks: input.totalMarks || totalMarks,
      passingMarks,
      passingScorePercent: passPercent,
      status: input.status || 'DRAFT',
    });

    await quiz.save();
    return quiz;
  }

  /**
   * Update an existing quiz
   */
  static async updateQuiz(
    quizId: string,
    teacherId: string,
    updates: Partial<CreateQuizInput>
  ): Promise<IQuiz | null> {
    const quiz = await Quiz.findOne({ _id: quizId, teacherId });
    if (!quiz) throw new Error('Quiz not found or unauthorized to update.');

    if (updates.questions) {
      quiz.questions = updates.questions;
      quiz.totalMarks = updates.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
    }
    if (updates.title) quiz.title = updates.title;
    if (updates.description !== undefined) quiz.description = updates.description;
    if (updates.durationMinutes) quiz.durationMinutes = updates.durationMinutes;
    if (updates.passingMarks) quiz.passingMarks = updates.passingMarks;
    if (updates.passingScorePercent) quiz.passingScorePercent = updates.passingScorePercent;
    if (updates.instructions !== undefined) quiz.instructions = updates.instructions;
    if (updates.medium) quiz.medium = updates.medium;
    if (updates.chapterNumber !== undefined) quiz.chapterNumber = updates.chapterNumber;
    if (updates.topic !== undefined) quiz.topic = updates.topic;
    if (updates.curriculumUnits) quiz.curriculumUnits = updates.curriculumUnits;
    if (updates.targetMode) quiz.targetMode = updates.targetMode;
    if (updates.difficultyLevel) quiz.difficultyLevel = updates.difficultyLevel;
    if (updates.securitySettings) quiz.securitySettings = updates.securitySettings;
    if (updates.attemptPolicy) quiz.attemptPolicy = updates.attemptPolicy;
    if (updates.resultSettings) quiz.resultSettings = updates.resultSettings;
    if (updates.negativeMarking) quiz.negativeMarking = updates.negativeMarking;
    if (updates.sourceNotes) quiz.sourceNotes = updates.sourceNotes;
    if (updates.status) quiz.status = updates.status;

    await quiz.save();
    return quiz;
  }

  /**
   * Publish a quiz (makes it accessible to enrolled students)
   */
  static async publishQuiz(quizId: string, teacherId: string): Promise<IQuiz> {
    const quiz = await Quiz.findOne({ _id: quizId, teacherId });
    if (!quiz) throw new Error('Quiz not found or unauthorized to publish.');

    if (!quiz.questions || quiz.questions.length === 0) {
      throw new Error('Cannot publish a quiz with 0 questions.');
    }

    quiz.status = 'PUBLISHED';
    await quiz.save();

    // Notify enrolled students in this section
    try {
      const enrollments = await StudentEnrollment.find({
        sectionId: quiz.sectionId,
        status: 'ENROLLED',
      }).select('studentId');

      for (const e of enrollments) {
        await NotificationService.sendNotification({
          recipientId: e.studentId.toString(),
          institutionId: quiz.institutionId.toString(),
          title: 'New Quiz Published',
          message: `A new quiz "${quiz.title}" has been published. Duration: ${quiz.durationMinutes} mins.`,
          type: 'ANNOUNCEMENT',
        });
      }
    } catch {
      // Non-blocking notification
    }

    return quiz;
  }

  /**
   * List quizzes for a teacher
   */
  static async getTeacherQuizzes(
    institutionId: string,
    teacherId: string,
    sectionId?: string,
    centralSubjectId?: string
  ): Promise<any[]> {
    const query: any = { institutionId, teacherId };
    if (sectionId) query.sectionId = sectionId;
    if (centralSubjectId) query.centralSubjectId = centralSubjectId;

    const quizzes = await Quiz.find(query)
      .populate('classId', 'name gradeNumber')
      .populate('sectionId', 'name')
      .populate('centralSubjectId', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    // Attach attempt count & average score
    const quizIds = quizzes.map((q) => q._id);
    const attempts = await QuizAttempt.aggregate([
      { $match: { quizId: { $in: quizIds } } },
      {
        $group: {
          _id: '$quizId',
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: '$score' },
          passedCount: { $sum: { $cond: ['$passed', 1, 0] } },
        },
      },
    ]);

    const statsMap = new Map();
    attempts.forEach((a) => statsMap.set(a._id.toString(), a));

    return quizzes.map((q) => {
      const stat = statsMap.get(q._id.toString()) || { totalAttempts: 0, avgScore: 0, passedCount: 0 };
      return {
        ...q,
        id: q._id.toString(),
        totalAttempts: stat.totalAttempts,
        avgScore: Math.round(stat.avgScore * 10) / 10,
        passedCount: stat.passedCount,
      };
    });
  }

  /**
   * Institutional quiz oversight for Principal & School Admin
   */
  static async getInstitutionalQuizzes(
    institutionId: string,
    filters?: { classId?: string; sectionId?: string; centralSubjectId?: string; teacherId?: string; status?: string }
  ): Promise<{ quizzes: any[]; stats: any }> {
    const query: any = { institutionId };
    if (filters?.classId) query.classId = filters.classId;
    if (filters?.sectionId) query.sectionId = filters.sectionId;
    if (filters?.centralSubjectId) query.centralSubjectId = filters.centralSubjectId;
    if (filters?.teacherId) query.teacherId = filters.teacherId;
    if (filters?.status) query.status = filters.status;

    const quizzes = await Quiz.find(query)
      .populate('classId', 'name gradeNumber')
      .populate('sectionId', 'name')
      .populate('centralSubjectId', 'name code')
      .populate('teacherId', 'fullName name email')
      .sort({ createdAt: -1 })
      .lean();

    const quizIds = quizzes.map((q) => q._id);
    const attempts = await QuizAttempt.aggregate([
      { $match: { quizId: { $in: quizIds } } },
      {
        $group: {
          _id: '$quizId',
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: '$score' },
          passedCount: { $sum: { $cond: ['$passed', 1, 0] } },
          totalWarnings: { $sum: '$warningsCount' },
        },
      },
    ]);

    const statsMap = new Map();
    let totalAttemptsAll = 0;
    let passedAll = 0;
    let totalWarningsAll = 0;

    attempts.forEach((a) => {
      statsMap.set(a._id.toString(), a);
      totalAttemptsAll += a.totalAttempts;
      passedAll += a.passedCount;
      totalWarningsAll += a.totalWarnings || 0;
    });

    const quizzesWithStats = quizzes.map((q: any) => {
      const stat = statsMap.get(q._id.toString()) || { totalAttempts: 0, avgScore: 0, passedCount: 0, totalWarnings: 0 };
      return {
        ...q,
        id: q._id.toString(),
        totalAttempts: stat.totalAttempts,
        avgScore: stat.avgScore ? Math.round(stat.avgScore * 10) / 10 : 0,
        passedCount: stat.passedCount,
        passPercentage: stat.totalAttempts > 0 ? Math.round((stat.passedCount / stat.totalAttempts) * 100) : 0,
        totalWarnings: stat.totalWarnings || 0,
      };
    });

    const publishedCount = quizzes.filter((q) => q.status === 'PUBLISHED').length;
    const draftCount = quizzes.filter((q) => q.status === 'DRAFT').length;
    const proctoredCount = quizzes.filter((q) => q.securitySettings?.fullscreenEnforced || q.securitySettings?.tabSwitchDetection).length;
    const aiCount = quizzes.filter((q) => q.isAiGenerated).length;

    return {
      quizzes: quizzesWithStats,
      stats: {
        totalQuizzes: quizzes.length,
        publishedCount,
        draftCount,
        proctoredCount,
        totalAttempts: totalAttemptsAll,
        passedCount: passedAll,
        overallPassPercentage: totalAttemptsAll > 0 ? Math.round((passedAll / totalAttemptsAll) * 100) : 0,
        totalSecurityWarnings: totalWarningsAll,
        aiGeneratedCount: aiCount,
      },
    };
  }

  /**
   * List published quizzes available for a student
   */
  static async getStudentQuizzes(
    institutionId: string,
    studentId: string,
    classId: string,
    sectionId: string
  ): Promise<any[]> {
    const quizzes = await Quiz.find({
      institutionId,
      sectionId,
      status: 'PUBLISHED',
    })
      .populate('centralSubjectId', 'name code')
      .populate('teacherId', 'fullName name')
      .sort({ createdAt: -1 })
      .lean();

    const quizIds = quizzes.map((q) => q._id);
    const myAttempts = await QuizAttempt.find({
      quizId: { $in: quizIds },
      studentId,
      institutionId,
    }).lean();

    const attemptMap = new Map();
    myAttempts.forEach((a) => attemptMap.set(a.quizId.toString(), a));

    return quizzes.map((q) => {
      const myAttempt = attemptMap.get(q._id.toString());
      return {
        id: q._id.toString(),
        title: q.title,
        description: q.description,
        subjectName: (q.centralSubjectId as any)?.name || 'General',
        subjectCode: (q.centralSubjectId as any)?.code || '',
        teacherName: (q.teacherId as any)?.fullName || (q.teacherId as any)?.name || 'Teacher',
        durationMinutes: q.durationMinutes,
        totalMarks: q.totalMarks,
        passingMarks: q.passingMarks,
        questionCount: q.questions?.length || 0,
        medium: q.medium,
        chapterNumber: q.chapterNumber,
        topic: q.topic,
        createdAt: q.createdAt,
        attempted: Boolean(myAttempt),
        myScore: myAttempt ? myAttempt.score : null,
        passed: myAttempt ? myAttempt.passed : null,
        attemptDate: myAttempt ? myAttempt.submittedAt : null,
      };
    });
  }

  /** Extra seconds allowed beyond the quiz duration (network delay, slow submit). */
  static readonly TIME_GRACE_SECONDS = 120;

  private static isSessionExpired(startedAt: Date, durationMinutes: number): boolean {
    return Date.now() - new Date(startedAt).getTime() > (durationMinutes * 60 + QuizService.TIME_GRACE_SECONDS) * 1000;
  }

  /**
   * When a timed attempt runs out of time without being submitted, the attempt is used up:
   * it is recorded with no answers (score 0) so a student cannot reopen the quiz for a fresh clock.
   */
  private static async closeExpiredSession(quiz: any, studentId: string, institutionId: string, session: any): Promise<void> {
    try {
      await this.submitQuizAttempt(String(quiz._id), studentId, institutionId, [], quiz.durationMinutes * 60, { isAutoSubmitted: true }, { skipTimeCheck: true });
    } catch {
      // attempt limit already reached etc. - nothing more to record
    }
    await QuizSession.deleteOne({ _id: session._id });
  }

  /**
   * Get single quiz by ID (sanitizes correct answers if taken by student)
   */
  static async getQuizById(
    quizId: string,
    institutionId: string,
    userRole: string,
    userId: string
  ): Promise<any> {
    const quiz = await Quiz.findOne({ _id: quizId, institutionId })
      .populate('classId', 'name gradeNumber')
      .populate('sectionId', 'name')
      .populate('centralSubjectId', 'name code')
      .lean();

    if (!quiz) throw new Error('Quiz not found.');
    if (userRole === 'TEACHER' && quiz.teacherId.toString() !== userId) {
      throw new Error('Quiz not found or unauthorized.');
    }

    // If student, check if already submitted
    if (userRole === 'STUDENT') {
      const studentBelongsToInstitution = await User.exists({
        _id: userId,
        institutionId,
        role: 'STUDENT',
        status: 'ACTIVE',
      });
      const sectionId = (quiz.sectionId as any)?._id || quiz.sectionId;
      const isEnrolled = studentBelongsToInstitution && quiz.status === 'PUBLISHED'
        ? await StudentEnrollment.exists({
            studentId: userId,
            sectionId,
            status: 'ENROLLED',
          })
        : false;
      if (!isEnrolled) throw new Error('Quiz not found or unauthorized.');

      // Timed attempts: finalise an abandoned/expired session first so it counts as used
      const maxAllowed = quiz.attemptPolicy?.maxAttempts || 1;
      const priorCount = await QuizAttempt.countDocuments({ quizId, studentId: userId, institutionId });
      let session: any = priorCount < maxAllowed
        ? await QuizSession.findOne({ quizId, studentId: userId, attemptNumber: priorCount + 1 })
        : null;
      if (session && this.isSessionExpired(session.startedAt, quiz.durationMinutes || 20)) {
        await this.closeExpiredSession(quiz, userId, institutionId, session);
        session = null;
      }

      const attempts = await QuizAttempt.find({ quizId, studentId: userId, institutionId }).sort({ attemptNumber: -1 }).lean();
      const latestAttempt = attempts.length > 0 ? attempts[0] : null;
      if (!session && attempts.length < maxAllowed) {
        session = await QuizSession.findOneAndUpdate(
          { quizId, studentId: userId, attemptNumber: attempts.length + 1 },
          { $setOnInsert: { institutionId, startedAt: new Date() } },
          { upsert: true, new: true }
        );
      }
      const remainingSeconds = session
        ? Math.max(0, Math.round((quiz.durationMinutes || 20) * 60 - (Date.now() - new Date(session.startedAt).getTime()) / 1000))
        : null;
      const isSubmitted = Boolean(latestAttempt);

      // Correct answers/explanations are revealed only once the student has no attempts left
      const attemptsExhausted = attempts.length >= (quiz.attemptPolicy?.maxAttempts || 1);
      const hideAnswers = !isSubmitted || !attemptsExhausted || quiz.resultSettings?.showExplanations === false;

      // Hide correct answers if not yet submitted
      const sanitizedQuestions = (quiz.questions || []).map((q: any) => ({
        id: q._id?.toString() || q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        marks: q.marks,
        chapterNumber: q.chapterNumber,
        unit: q.unit,
        topic: q.topic,
        assertionText: q.assertionText,
        reasonText: q.reasonText,
        unitLabel: q.unitLabel,
        matchingPairs: q.matchingPairs,
        bloomLevel: q.bloomLevel,
        correctAnswers: hideAnswers ? undefined : q.correctAnswers,
        explanation: hideAnswers ? undefined : q.explanation,
      }));

      return {
        ...quiz,
        id: quiz._id.toString(),
        questions: sanitizedQuestions,
        myAttempt: latestAttempt
          ? {
              ...latestAttempt,
              answers: hideAnswers
                ? (latestAttempt.answers || []).map((a: any) => ({ ...a, explanation: undefined }))
                : latestAttempt.answers,
            }
          : null,
        attemptsCount: attempts.length,
        maxAttempts: quiz.attemptPolicy?.maxAttempts || 1,
        remainingSeconds,
      };
    }

    return {
      ...quiz,
      id: quiz._id.toString(),
    };
  }

  /**
   * Submit student quiz attempt & compute automatic grading across all question types
   */
  static async submitQuizAttempt(
    quizId: string,
    studentId: string,
    institutionId: string,
    submissionAnswers: Array<{ questionId: string; selectedOption?: any; selectedOptions?: any[]; textAnswer?: string; numericalAnswer?: any }>,
    timeSpentSeconds: number = 0,
    securityData?: {
      warningsCount?: number;
      securityEvents?: any[];
      isAutoSubmitted?: boolean;
    },
    options: { skipTimeCheck?: boolean } = {}
  ): Promise<IQuizAttempt> {
    const quiz = await Quiz.findOne({ _id: quizId, institutionId });
    if (!quiz) throw new Error('Quiz not found.');
    if (quiz.status !== 'PUBLISHED') throw new Error('This quiz is not currently open for submission.');
    const studentBelongsToInstitution = await User.exists({
      _id: studentId,
      institutionId,
      role: 'STUDENT',
      status: 'ACTIVE',
    });
    const isEnrolled = studentBelongsToInstitution
      ? await StudentEnrollment.exists({
          studentId,
          sectionId: quiz.sectionId,
          status: 'ENROLLED',
        })
      : false;
    if (!isEnrolled) throw new Error('Quiz not found or unauthorized.');

    // Check attempt limits
    const maxAttempts = quiz.attemptPolicy?.maxAttempts || 1;
    const existingAttempts = await QuizAttempt.find({ quizId, studentId, institutionId });
    if (existingAttempts.length >= maxAttempts) {
      throw new Error(`You have reached the maximum allowed attempts (${maxAttempts}) for this assessment.`);
    }
    const attemptNumber = existingAttempts.length + 1;

    // Server-side time limit: the clock started when the student opened the quiz
    if (!options.skipTimeCheck) {
      const session: any = await QuizSession.findOne({ quizId, studentId, attemptNumber });
      if (session && this.isSessionExpired(session.startedAt, quiz.durationMinutes || 20)) {
        await this.closeExpiredSession(quiz, studentId, institutionId, session);
        throw new Error('The time limit for this assessment has passed. The attempt was closed with no answers recorded.');
      }
    }

    let totalScore = 0;
    const gradedAnswers: any[] = [];
    const penalty = quiz.negativeMarking?.enabled ? (quiz.negativeMarking.penaltyPerWrong || 0.25) : 0;

    const rawAnswerMap = new Map<string, any>();
    (Array.isArray(submissionAnswers) ? submissionAnswers : []).forEach((a) => rawAnswerMap.set(String(a.questionId), a));
    const isBlank = (v: any) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

    for (const q of quiz.questions) {
      const qId = (q as any)._id?.toString() || q.id;
      // Pick the answer field that matches the question type
      const rawAns = rawAnswerMap.get(qId) || {};
      let studentAns: any;
      if (q.questionType === 'MULTIPLE_CORRECT') {
        studentAns = !isBlank(rawAns.selectedOptions) ? rawAns.selectedOptions : rawAns.selectedOption;
      } else if (q.questionType === 'NUMERICAL') {
        studentAns = !isBlank(rawAns.numericalAnswer) ? rawAns.numericalAnswer : rawAns.selectedOption;
      } else if (['FILL_BLANK', 'SHORT_CONCEPTUAL', 'DESCRIPTIVE', 'MATCHING'].includes(q.questionType as string)) {
        studentAns = !isBlank(rawAns.textAnswer) ? rawAns.textAnswer : rawAns.selectedOption;
      } else {
        studentAns = rawAns.selectedOption;
      }
      let isCorrect = false;
      let scoreAwarded = 0;
      let needsReview = false;

      if (!isBlank(studentAns)) {
        const qMarks = q.marks || 1;

        if (q.questionType === 'MCQ' || q.questionType === 'TRUE_FALSE' || q.questionType === 'ASSERTION_REASON') {
          const correct = String(q.correctAnswers).trim().toLowerCase();
          const given = String(studentAns).trim().toLowerCase();
          if (correct === given) {
            isCorrect = true;
            scoreAwarded = qMarks;
            totalScore += scoreAwarded;
          } else if (penalty > 0) {
            totalScore = Math.max(0, totalScore - penalty);
          }
        } else if (q.questionType === 'MULTIPLE_CORRECT') {
          const correctArr = Array.isArray(q.correctAnswers)
            ? q.correctAnswers.map((s: any) => String(s).trim().toLowerCase()).sort()
            : [String(q.correctAnswers).trim().toLowerCase()];
          const givenArr = Array.isArray(studentAns)
            ? studentAns.map((s: any) => String(s).trim().toLowerCase()).sort()
            : [String(studentAns).trim().toLowerCase()];

          const allMatch = correctArr.length === givenArr.length && correctArr.every((v: any, i: number) => v === givenArr[i]);
          if (allMatch) {
            isCorrect = true;
            scoreAwarded = qMarks;
            totalScore += scoreAwarded;
          } else {
            // Partial credit if at least 1 correct
            const matchingCount = givenArr.filter(g => correctArr.includes(g)).length;
            if (matchingCount > 0) {
              scoreAwarded = Math.round((matchingCount / correctArr.length) * qMarks * 10) / 10;
              totalScore += scoreAwarded;
            } else if (penalty > 0) {
              totalScore = Math.max(0, totalScore - penalty);
            }
          }
        } else if (q.questionType === 'NUMERICAL') {
          const expectedNum = Number(q.numericalAnswer ?? q.correctAnswers);
          const givenNum = Number(studentAns);
          const tolerance = Number(q.tolerance || 0);

          if (!isNaN(expectedNum) && !isNaN(givenNum) && Math.abs(expectedNum - givenNum) <= tolerance) {
            isCorrect = true;
            scoreAwarded = qMarks;
            totalScore += scoreAwarded;
          } else if (penalty > 0) {
            totalScore = Math.max(0, totalScore - penalty);
          }
        } else if (q.questionType === 'FILL_BLANK') {
          const correct = String(q.correctAnswers).trim().toLowerCase();
          const given = String(studentAns).trim().toLowerCase();
          if (given && (correct === given || correct.includes(given))) {
            isCorrect = true;
            scoreAwarded = qMarks;
            totalScore += scoreAwarded;
          } else if (penalty > 0) {
            totalScore = Math.max(0, totalScore - penalty);
          }
        } else {
          // SHORT_CONCEPTUAL, DESCRIPTIVE, MATCHING
          const correct = String(q.correctAnswers || '').trim().toLowerCase();
          const given = String(studentAns).trim().toLowerCase();
          if (given && (correct === given || correct.includes(given) || given.includes(correct))) {
            isCorrect = true;
            scoreAwarded = qMarks;
            totalScore += scoreAwarded;
          } else if (given.length > 0) {
            // No automatic partial credit: an unmatched written answer is held for teacher review
            // instead of earning marks just for being long enough.
            needsReview = true;
          }
        }
      }

      gradedAnswers.push({
        questionId: qId,
        selectedOption: studentAns ?? '',
        isCorrect,
        scoreAwarded,
        needsReview,
        explanation: quiz.resultSettings?.showExplanations === false ? undefined : q.explanation,
      });
    }

    const percentage = quiz.totalMarks > 0 ? Math.round((totalScore / quiz.totalMarks) * 100) : 0;
    const passThreshold = quiz.passingMarks || Math.ceil((quiz.totalMarks * (quiz.passingScorePercent || 50)) / 100);
    const passed = totalScore >= passThreshold;

    const attempt = new QuizAttempt({
      quizId,
      studentId,
      institutionId,
      attemptNumber,
      warningsCount: securityData?.warningsCount || 0,
      securityEvents: securityData?.securityEvents || [],
      answers: gradedAnswers,
      score: Math.round(totalScore * 10) / 10,
      totalMarks: quiz.totalMarks,
      percentage,
      passed,
      timeSpentSeconds,
      submittedAt: new Date(),
      status: securityData?.isAutoSubmitted ? 'AUTO_SUBMITTED' : 'SUBMITTED',
    });

    await attempt.save();
    await QuizSession.deleteOne({ quizId, studentId, attemptNumber });

    // Trigger notification to student
    try {
      await NotificationService.sendNotification({
        recipientId: studentId,
        institutionId,
        title: 'Quiz Result Available',
        message: `Attempt #${attemptNumber}: You scored ${totalScore}/${quiz.totalMarks} (${percentage}%) in "${quiz.title}". Status: ${passed ? 'PASSED' : 'NEEDS PRACTICE'}.`,
        type: 'MARKS_PUBLISHED',
      });
    } catch {
      // ignore
    }

    return attempt;
  }

  /**
   * Get detailed analytics for a quiz (teacher view)
   */
  static async getQuizAnalytics(quizId: string, teacherId: string): Promise<any> {
    const quiz = await Quiz.findOne({ _id: quizId, teacherId })
      .populate('classId', 'name gradeNumber')
      .populate('sectionId', 'name')
      .populate('centralSubjectId', 'name code')
      .lean();

    if (!quiz) throw new Error('Quiz not found or unauthorized.');

    const attempts = await QuizAttempt.find({ quizId })
      .populate('studentId', 'fullName name rollNumber')
      .sort({ score: -1 })
      .lean();

    const totalAttempts = attempts.length;
    const avgScore = totalAttempts > 0
      ? Math.round((attempts.reduce((s, a) => s + a.score, 0) / totalAttempts) * 10) / 10
      : 0;
    const passedCount = attempts.filter((a) => a.passed).length;
    const passPercentage = totalAttempts > 0 ? Math.round((passedCount / totalAttempts) * 100) : 0;

    // Item-level question performance
    const questionStats = (quiz.questions || []).map((q: any, idx: number) => {
      const qId = q._id?.toString() || q.id;
      let correctAttempts = 0;
      attempts.forEach((att) => {
        const ans = att.answers.find((a: any) => a.questionId === qId);
        if (ans && ans.isCorrect) correctAttempts += 1;
      });
      return {
        questionIndex: idx + 1,
        questionText: q.questionText,
        questionType: q.questionType,
        marks: q.marks,
        correctCount: correctAttempts,
        successRate: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
      };
    });

    return {
      quiz: {
        id: quiz._id.toString(),
        title: quiz.title,
        totalMarks: quiz.totalMarks,
        passingMarks: quiz.passingMarks,
        durationMinutes: quiz.durationMinutes,
      },
      summary: {
        totalAttempts,
        avgScore,
        passedCount,
        passPercentage,
      },
      questionStats,
      studentAttempts: attempts.map((a) => ({
        id: a._id.toString(),
        studentName: (a.studentId as any)?.fullName || (a.studentId as any)?.name || 'Student',
        rollNumber: (a.studentId as any)?.rollNumber || '–',
        score: a.score,
        totalMarks: a.totalMarks,
        percentage: a.percentage,
        passed: a.passed,
        timeSpentSeconds: a.timeSpentSeconds,
        submittedAt: a.submittedAt,
      })),
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // TEACHER REVIEW OF WRITTEN ANSWERS
  // ══════════════════════════════════════════════════════════════════
  static async getReviewQueue(quizId: string, teacherId: string, institutionId: string) {
    const quiz: any = await Quiz.findOne({ _id: quizId, teacherId, institutionId }).lean();
    if (!quiz) throw new Error('Quiz not found or unauthorized.');
    const attempts: any[] = await QuizAttempt.find({ quizId, institutionId, 'answers.needsReview': true })
      .populate('studentId', 'fullName name')
      .lean();
    const qMap = new Map<string, any>((quiz.questions || []).map((q: any) => [String(q._id || q.id), q]));
    const items: any[] = [];
    attempts.forEach((a) => {
      (a.answers || []).forEach((ans: any) => {
        if (!ans.needsReview) return;
        const q = qMap.get(String(ans.questionId));
        items.push({
          attemptId: String(a._id),
          attemptNumber: a.attemptNumber,
          studentName: a.studentId?.fullName || a.studentId?.name || 'Student',
          questionId: String(ans.questionId),
          questionText: q?.questionText || '',
          modelAnswer: q?.correctAnswers ?? '',
          maxMarks: q?.marks || 1,
          studentAnswer: ans.selectedOption,
        });
      });
    });
    return { quizTitle: quiz.title, items };
  }

  static async reviewAnswer(
    quizId: string,
    teacherId: string,
    institutionId: string,
    input: { attemptId: string; questionId: string; marks: number }
  ) {
    const quiz: any = await Quiz.findOne({ _id: quizId, teacherId, institutionId }).lean();
    if (!quiz) throw new Error('Quiz not found or unauthorized.');
    const question: any = (quiz.questions || []).find((q: any) => String(q._id || q.id) === String(input.questionId));
    if (!question) throw new Error('Question not found.');
    const marks = Number(input.marks);
    const max = question.marks || 1;
    if (!Number.isFinite(marks) || marks < 0 || marks > max) throw new Error(`Marks must be between 0 and ${max}.`);

    const attempt: any = await QuizAttempt.findOne({ _id: input.attemptId, quizId, institutionId });
    if (!attempt) throw new Error('Attempt not found.');
    const ans = attempt.answers.find((a: any) => String(a.questionId) === String(input.questionId));
    if (!ans || !ans.needsReview) throw new Error('This answer is not waiting for review.');

    ans.scoreAwarded = marks;
    ans.isCorrect = marks >= max;
    ans.needsReview = false;
    attempt.markModified('answers');

    const total = attempt.answers.reduce((sum: number, a: any) => sum + (a.scoreAwarded || 0), 0);
    attempt.score = Math.round(total * 10) / 10;
    attempt.percentage = quiz.totalMarks > 0 ? Math.round((attempt.score / quiz.totalMarks) * 100) : 0;
    const passThreshold = quiz.passingMarks || Math.ceil((quiz.totalMarks * (quiz.passingScorePercent || 50)) / 100);
    attempt.passed = attempt.score >= passThreshold;
    await attempt.save();

    try {
      await NotificationService.sendNotification({
        recipientId: String(attempt.studentId),
        institutionId,
        title: 'Quiz answer reviewed',
        message: `Your written answer in "${quiz.title}" was reviewed (${marks}/${max}). New score: ${attempt.score}/${quiz.totalMarks}.`,
        type: 'MARKS_PUBLISHED',
      });
    } catch {
      // non-blocking
    }
    return { score: attempt.score, percentage: attempt.percentage, passed: attempt.passed };
  }
}
