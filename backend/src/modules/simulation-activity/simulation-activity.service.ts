import mongoose from 'mongoose';
import {
  Simulation,
  ISimulation,
  SimulationVersion,
  SimulationAsset,
  SimulationTopic,
  Activity,
  IActivity,
  ActivityQuestion,
  IActivityQuestion,
  ActivityAssignment,
  ActivityAttempt,
  ActivityProgress,
  SimulationProgress,
  ISimulationProgress,
  ActivityType,
} from '../../models/SimulationActivity';
import { CentralSubject } from '../../models/Curriculum';

export class SimulationActivityService {
  // ══════════════════════════════════════════════════════════════════
  // SIMULATIONS
  // ══════════════════════════════════════════════════════════════════

  static async listSimulations(filter: {
    grade?: number;
    subjectCode?: string;
    chapterNumber?: number;
    language?: string;
    search?: string;
    simulationType?: string;
    isPublished?: boolean;
  }) {
    const query: any = {};
    if (filter.grade) {
      query.gradeLevels = filter.grade;
    }
    if (filter.subjectCode) {
      query.subjectCode = filter.subjectCode;
    }
    if (filter.chapterNumber) {
      query.chapterNumber = filter.chapterNumber;
    }
    if (filter.language && filter.language !== 'all') {
      query.$or = [{ language: filter.language }, { language: 'both' }];
    }
    if (filter.simulationType) {
      query.simulationType = filter.simulationType;
    }
    if (typeof filter.isPublished === 'boolean') {
      query.isPublished = filter.isPublished;
    }
    if (filter.search) {
      const regex = new RegExp(filter.search, 'i');
      query.$or = [
        { title: regex },
        { titleNepali: regex },
        { description: regex },
        { topicName: regex },
        { tags: regex },
      ];
    }

    return await Simulation.find(query).sort({ chapterNumber: 1, createdAt: 1 });
  }

  static async getSimulationById(id: string) {
    const simulation = await Simulation.findById(id).populate('subjectId');
    if (!simulation) return null;

    const [versions, assets, topics] = await Promise.all([
      SimulationVersion.find({ simulationId: id }).sort({ createdAt: -1 }),
      SimulationAsset.find({ simulationId: id }),
      SimulationTopic.find({ simulationId: id }),
    ]);

    return {
      ...simulation.toJSON(),
      versions,
      assets,
      topics,
    };
  }

  static async createSimulation(data: Partial<ISimulation>) {
    const simulation = new Simulation(data);
    await simulation.save();

    // Create initial version record
    const version = new SimulationVersion({
      simulationId: simulation._id,
      versionNumber: data.currentVersion || '1.0.0',
      changelog: 'Initial version release',
      isCurrent: true,
    });
    await version.save();

    return simulation;
  }

  static async updateSimulation(id: string, data: Partial<ISimulation>) {
    return await Simulation.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  static async deleteSimulation(id: string) {
    await Promise.all([
      Simulation.findByIdAndDelete(id),
      SimulationVersion.deleteMany({ simulationId: id }),
      SimulationAsset.deleteMany({ simulationId: id }),
      SimulationTopic.deleteMany({ simulationId: id }),
    ]);
    return { success: true };
  }

  static async togglePublishSimulation(id: string, isPublished: boolean) {
    return await Simulation.findByIdAndUpdate(id, { $set: { isPublished } }, { new: true });
  }

  static async recordLaunch(id: string) {
    return await Simulation.findByIdAndUpdate(
      id,
      { $inc: { viewsCount: 1, smartBoardLaunches: 1 } },
      { new: true }
    );
  }

  static async addSimulationVersion(simulationId: string, versionData: { versionNumber: string; changelog: string; bundleUrl?: string }) {
    await SimulationVersion.updateMany({ simulationId }, { $set: { isCurrent: false } });
    const version = new SimulationVersion({
      simulationId,
      ...versionData,
      isCurrent: true,
    });
    await version.save();

    await Simulation.findByIdAndUpdate(simulationId, {
      $set: { currentVersion: versionData.versionNumber },
    });

    return version;
  }

  static async addSimulationAsset(simulationId: string, assetData: any) {
    const asset = new SimulationAsset({
      simulationId,
      ...assetData,
    });
    await asset.save();
    return asset;
  }

  // ══════════════════════════════════════════════════════════════════
  // ACTIVITIES
  // ══════════════════════════════════════════════════════════════════

  static async listActivities(filter: {
    grade?: number;
    subjectCode?: string;
    type?: string;
    search?: string;
    isPublished?: boolean;
  }) {
    const query: any = {};
    if (filter.grade) query.gradeLevels = filter.grade;
    if (filter.subjectCode) query.subjectCode = filter.subjectCode;
    if (filter.type) query.type = filter.type;
    if (typeof filter.isPublished === 'boolean') query.isPublished = filter.isPublished;
    if (filter.search) {
      const regex = new RegExp(filter.search, 'i');
      query.$or = [{ title: regex }, { titleNepali: regex }, { description: regex }, { topicName: regex }];
    }

    return await Activity.find(query).sort({ createdAt: -1 });
  }

  static async getActivityById(id: string) {
    const activity = await Activity.findById(id).populate('subjectId');
    if (!activity) return null;

    const questions = await ActivityQuestion.find({ activityId: id }).sort({ questionNumber: 1 });
    return {
      ...activity.toJSON(),
      questions,
    };
  }

  static async createActivity(data: Partial<IActivity>, initialQuestions?: any[]) {
    const activity = new Activity(data);
    await activity.save();

    if (initialQuestions && initialQuestions.length > 0) {
      const qDocs = initialQuestions.map((q, idx) => ({
        activityId: activity._id,
        questionNumber: q.questionNumber || idx + 1,
        type: q.type || activity.type,
        prompt: q.prompt,
        promptNepali: q.promptNepali,
        points: q.points || 1,
        explanation: q.explanation || '',
        hint: q.hint,
        data: q.data || {},
      }));
      await ActivityQuestion.insertMany(qDocs);
      activity.questionsCount = qDocs.length;
      activity.totalMarks = qDocs.reduce((acc, cur) => acc + (cur.points || 1), 0);
      if (activity.passingScore > activity.totalMarks) {
        activity.passingScore = Math.max(1, Math.ceil(activity.totalMarks * 0.4));
      }
      await activity.save();
    }

    return activity;
  }

  static async updateActivity(id: string, data: Partial<IActivity>) {
    return await Activity.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  static async deleteActivity(id: string) {
    await Promise.all([
      Activity.findByIdAndDelete(id),
      ActivityQuestion.deleteMany({ activityId: id }),
      ActivityAssignment.deleteMany({ activityId: id }),
      ActivityAttempt.deleteMany({ activityId: id }),
    ]);
    return { success: true };
  }

  static async togglePublishActivity(id: string, isPublished: boolean) {
    return await Activity.findByIdAndUpdate(id, { $set: { isPublished } }, { new: true });
  }

  static async addQuestion(activityId: string, questionData: any) {
    const count = await ActivityQuestion.countDocuments({ activityId });
    const question = new ActivityQuestion({
      activityId,
      questionNumber: questionData.questionNumber || count + 1,
      type: questionData.type,
      prompt: questionData.prompt,
      promptNepali: questionData.promptNepali,
      points: questionData.points || 1,
      explanation: questionData.explanation || '',
      hint: questionData.hint,
      data: questionData.data || {},
    });
    await question.save();

    // Update questionsCount & totalMarks in Activity
    const allQuestions = await ActivityQuestion.find({ activityId });
    const totalMarks = allQuestions.reduce((sum, q) => sum + (q.points || 1), 0);
    await Activity.findByIdAndUpdate(activityId, {
      $set: { questionsCount: allQuestions.length, totalMarks },
    });

    return question;
  }

  static async updateQuestion(questionId: string, data: any) {
    return await ActivityQuestion.findByIdAndUpdate(questionId, { $set: data }, { new: true });
  }

  static async deleteQuestion(questionId: string) {
    const q = await ActivityQuestion.findById(questionId);
    if (!q) return null;
    await ActivityQuestion.findByIdAndDelete(questionId);
    const allQuestions = await ActivityQuestion.find({ activityId: q.activityId });
    const totalMarks = allQuestions.reduce((sum, item) => sum + (item.points || 1), 0);
    await Activity.findByIdAndUpdate(q.activityId, {
      $set: { questionsCount: allQuestions.length, totalMarks },
    });
    return { success: true };
  }

  // ══════════════════════════════════════════════════════════════════
  // ASSIGNMENTS (Teacher Tools)
  // ══════════════════════════════════════════════════════════════════

  static async createAssignment(
    teacherId: string,
    institutionId: string,
    data: {
      activityId: string;
      classId: string;
      sectionId: string;
      subjectId?: string;
      dueDate?: Date;
      allowRetries?: boolean;
      maxAttempts?: number;
    }
  ) {
    const assignment = new ActivityAssignment({
      ...data,
      teacherId,
      institutionId,
    });
    return await assignment.save();
  }

  static async listTeacherAssignments(teacherId: string, institutionId: string) {
    const assignments = await ActivityAssignment.find({ teacherId, institutionId })
      .populate('activityId')
      .populate('classId')
      .populate('sectionId')
      .sort({ createdAt: -1 });

    const results = await Promise.all(
      assignments.map(async (asgn) => {
        const attemptsCount = await ActivityAttempt.countDocuments({ assignmentId: asgn._id });
        return {
          ...asgn.toJSON(),
          attemptsCount,
        };
      })
    );

    return results;
  }

  static async listStudentAssignments(institutionId: string, classId: string, sectionId: string) {
    return await ActivityAssignment.find({
      institutionId,
      classId,
      sectionId,
      status: 'ACTIVE',
    })
      .populate('activityId')
      .populate('teacherId', 'fullName email username')
      .sort({ createdAt: -1 });
  }

  static async getAssignmentAnalytics(assignmentId: string, institutionId: string) {
    const attempts = await ActivityAttempt.find({ assignmentId, institutionId }).populate(
      'studentId',
      'fullName email username'
    );

    const totalSubmissions = attempts.length;
    const avgScore =
      totalSubmissions > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalSubmissions)
        : 0;
    const passCount = attempts.filter((a) => a.passed).length;
    const passRate = totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 0;

    return {
      assignmentId,
      totalSubmissions,
      avgScore,
      passRate,
      attempts,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // AUTOMATED GRADING & STUDENT ATTEMPTS
  // ══════════════════════════════════════════════════════════════════

  static async submitAttempt(params: {
    studentId: string;
    studentName?: string;
    institutionId: string;
    classId: string;
    sectionId: string;
    activityId: string;
    assignmentId?: string;
    answers: { questionId: string; studentAnswer: any }[];
    timeSpentSeconds?: number;
    isTimedOut?: boolean;
  }) {
    const activity = await Activity.findById(params.activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    if (params.assignmentId) {
      const assignment = await ActivityAssignment.findById(params.assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }
      if (assignment.institutionId.toString() !== params.institutionId) {
        throw new Error('Unauthorized assignment access');
      }
      if (assignment.status !== 'ACTIVE') {
        throw new Error('Assignment is no longer active');
      }
      if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
        throw new Error('Assignment deadline has passed');
      }
      if (assignment.maxAttempts && assignment.maxAttempts > 0) {
        const existingCount = await ActivityAttempt.countDocuments({
          assignmentId: params.assignmentId,
          studentId: params.studentId,
        });
        if (existingCount >= assignment.maxAttempts) {
          throw new Error(
            `MAX_ATTEMPTS_EXCEEDED: Maximum attempts (${assignment.maxAttempts}) reached for this assignment.`
          );
        }
      }
    }

    const questions = await ActivityQuestion.find({ activityId: params.activityId });
    const questionMap = new Map<string, IActivityQuestion>();
    questions.forEach((q) => questionMap.set(q._id.toString(), q));

    let totalScore = 0;
    let maxScore = 0;
    const evaluatedAnswers: any[] = [];

    for (const q of questions) {
      const qId = q._id.toString();
      const points = q.points || 1;
      maxScore += points;

      const userAnsObj = params.answers.find((a) => a.questionId === qId);
      const studentAnswer = userAnsObj ? userAnsObj.studentAnswer : null;

      let isCorrect = false;
      let scoreEarned = 0;
      let feedback = q.explanation || '';

      if (studentAnswer !== null && studentAnswer !== undefined) {
        switch (q.type) {
          case 'MCQ':
          case 'TRUE_FALSE': {
            // Options: find matching option
            const opts = q.data?.options || [];
            const correctOpt = opts.find((o: any) => o.isCorrect === true);
            if (correctOpt && (studentAnswer === correctOpt.id || studentAnswer === correctOpt.text)) {
              isCorrect = true;
              scoreEarned = points;
            }
            break;
          }

          case 'MATCHING': {
            // studentAnswer: array of { left: string, right: string }
            const pairs = q.data?.pairs || [];
            let correctPairs = 0;
            if (Array.isArray(studentAnswer)) {
              studentAnswer.forEach((sa) => {
                const match = pairs.find(
                  (p: any) => p.left.trim() === sa.left?.trim() && p.right.trim() === sa.right?.trim()
                );
                if (match) correctPairs++;
              });
            }
            if (pairs.length > 0 && correctPairs === pairs.length) {
              isCorrect = true;
              scoreEarned = points;
            } else if (pairs.length > 0) {
              scoreEarned = Math.round((correctPairs / pairs.length) * points * 10) / 10;
              isCorrect = correctPairs > 0;
            }
            break;
          }

          case 'DRAG_DROP': {
            // studentAnswer: array of { itemId: string, droppedCategory: string }
            const items = q.data?.items || [];
            let correctDrops = 0;
            if (Array.isArray(studentAnswer)) {
              studentAnswer.forEach((sa) => {
                const item = items.find((i: any) => i.id === sa.itemId || i.text === sa.text);
                if (item && item.correctCategory === sa.droppedCategory) {
                  correctDrops++;
                }
              });
            }
            if (items.length > 0 && correctDrops === items.length) {
              isCorrect = true;
              scoreEarned = points;
            } else if (items.length > 0) {
              scoreEarned = Math.round((correctDrops / items.length) * points * 10) / 10;
              isCorrect = correctDrops > 0;
            }
            break;
          }

          case 'FILL_BLANKS': {
            // studentAnswer: object mapping { [blankId]: "value" }
            const blanks = q.data?.blanks || [];
            let correctBlanks = 0;
            blanks.forEach((b: any) => {
              const val = (studentAnswer[b.id] || '').toString().trim().toLowerCase();
              const accepted = (b.acceptedAnswers || []).map((a: string) => a.trim().toLowerCase());
              if (accepted.includes(val)) {
                correctBlanks++;
              }
            });
            if (blanks.length > 0 && correctBlanks === blanks.length) {
              isCorrect = true;
              scoreEarned = points;
            } else if (blanks.length > 0) {
              scoreEarned = Math.round((correctBlanks / blanks.length) * points * 10) / 10;
              isCorrect = correctBlanks > 0;
            }
            break;
          }

          case 'DIAGRAM_LABELING': {
            // studentAnswer: object mapping { [hotspotId]: "selectedLabel" }
            const hotspots = q.data?.hotspots || [];
            let correctLabels = 0;
            hotspots.forEach((h: any) => {
              const label = (studentAnswer[h.id] || '').toString().trim().toLowerCase();
              if (label === h.label.trim().toLowerCase()) {
                correctLabels++;
              }
            });
            if (hotspots.length > 0 && correctLabels === hotspots.length) {
              isCorrect = true;
              scoreEarned = points;
            } else if (hotspots.length > 0) {
              scoreEarned = Math.round((correctLabels / hotspots.length) * points * 10) / 10;
              isCorrect = correctLabels > 0;
            }
            break;
          }

          case 'NUMERICAL': {
            // studentAnswer: number
            const val = parseFloat(studentAnswer);
            const target = parseFloat(q.data?.correctValue);
            const tol = parseFloat(q.data?.tolerance || 0);
            if (!isNaN(val) && !isNaN(target) && Math.abs(val - target) <= tol) {
              isCorrect = true;
              scoreEarned = points;
            }
            break;
          }

          case 'ORDERING': {
            // studentAnswer: array of item IDs in order
            const items = q.data?.items || [];
            const sortedCorrect = [...items].sort((a: any, b: any) => a.correctOrder - b.correctOrder);
            let matches = 0;
            if (Array.isArray(studentAnswer)) {
              studentAnswer.forEach((itemVal, idx) => {
                if (sortedCorrect[idx] && (sortedCorrect[idx].id === itemVal || sortedCorrect[idx].text === itemVal)) {
                  matches++;
                }
              });
            }
            if (items.length > 0 && matches === items.length) {
              isCorrect = true;
              scoreEarned = points;
            }
            break;
          }
        }
      }

      totalScore += scoreEarned;
      evaluatedAnswers.push({
        questionId: qId,
        studentAnswer,
        isCorrect,
        scoreEarned,
        feedback: isCorrect ? '✅ Correct! ' + feedback : '❌ Incorrect. ' + feedback,
      });
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const requiredPassingScore = activity.passingScore > maxScore ? Math.ceil(maxScore * 0.4) : activity.passingScore;
    const passed = totalScore >= requiredPassingScore;

    const attempt = new ActivityAttempt({
      activityId: params.activityId,
      assignmentId: params.assignmentId,
      institutionId: params.institutionId,
      studentId: params.studentId,
      studentName: params.studentName,
      classId: params.classId,
      sectionId: params.sectionId,
      answers: evaluatedAnswers,
      totalScore,
      maxScore,
      percentage,
      passed,
      timeSpentSeconds: params.timeSpentSeconds || 0,
      status: params.isTimedOut ? 'TIMED_OUT' : 'COMPLETED',
      completedAt: new Date(),
    });
    await attempt.save();

    // Update Progress
    const grade = activity.gradeLevels[0] || 1;
    await ActivityProgress.findOneAndUpdate(
      { studentId: params.studentId, activityId: params.activityId },
      {
        $set: {
          institutionId: params.institutionId,
          subjectId: activity.subjectId,
          grade,
          isCompleted: passed,
          lastAttemptedAt: new Date(),
        },
        $max: {
          bestScore: totalScore,
          highestPercentage: percentage,
        },
        $inc: {
          attemptsCount: 1,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    return attempt;
  }

  static async getStudentAttempts(studentId: string, activityId: string) {
    return await ActivityAttempt.find({ studentId, activityId }).sort({ completedAt: -1 });
  }

  static async getStudentProgress(studentId: string, institutionId: string) {
    return await ActivityProgress.find({ studentId, institutionId })
      .populate('activityId')
      .sort({ lastAttemptedAt: -1 });
  }

  // ══════════════════════════════════════════════════════════════════
  // SEED NEPAL CDC SIMULATIONS & ACTIVITIES
  // ══════════════════════════════════════════════════════════════════
  static async seedInitialContent() {
    const simCount = await Simulation.countDocuments();
    if (simCount === 0) {
      console.log('Seeding initial Nepal CDC Simulations...');
      const simulationsToSeed = [
        {
          code: 'SIM-PHY-G6-CIRCUIT',
          title: "Simple Electric Circuit & Ohm's Law",
          titleNepali: 'सामान्य विद्युत परिपथ र ओमको नियम',
          description:
            'Interactive electric circuit with live voltage/resistance controls, ammeter calculations, and electron particle visualization.',
          learningObjectives: [
            "Demonstrate Ohm's Law (I = V / R)",
            'Understand relationship between voltage, resistance and electric current',
            'Observe bulb luminosity with power variations',
          ],
          gradeLevels: [6, 7, 8, 9, 10],
          subjectCode: 'SCI',
          chapterNumber: 4,
          topicName: 'Current Electricity & Magnetism',
          language: 'both' as const,
          simulationType: '2D_CANVAS' as const,
          runtimeUrl: '/simulations/physics-electric-circuit.html',
          isPublished: true,
          tags: ['Physics', 'Electricity', "Ohm's Law", 'Class 6-10'],
        },
        {
          code: 'SIM-MATH-G1-FRACTIONS',
          title: 'Interactive Fractions Visualizer',
          titleNepali: 'भिन्नको अवधारणा र वृत्त विभाजन',
          description:
            'Dynamic pizza and slice visualizer illustrating denominators, numerators, and equivalent fractions for primary students.',
          learningObjectives: [
            'Identify parts of a whole',
            'Understand numerator (shaded) and denominator (total)',
            'Calculate equivalent fractions and decimals',
          ],
          gradeLevels: [3, 4, 5],
          subjectCode: 'MATH',
          chapterNumber: 7,
          topicName: 'Fractions & Decimals',
          language: 'both' as const,
          simulationType: '2D_CANVAS' as const,
          runtimeUrl: '/simulations/math-fractions-pizza.html',
          isPublished: true,
          tags: ['Math', 'Primary', 'Fractions', 'Class 1-5'],
        },
        {
          code: 'SIM-PHY-G9-PROJECTILE',
          title: 'Projectile Motion Laboratory',
          titleNepali: 'प्रक्षेप्य गति प्रयोगशाला',
          description:
            'Parabolic flight physics simulation with launch angle, velocity, and gravity selectors including high-altitude Nepal Everest gravity.',
          learningObjectives: [
            'Calculate maximum height and horizontal range',
            'Determine time of flight across angles',
            'Verify theoretical trajectory parabolas',
          ],
          gradeLevels: [9, 10, 11, 12],
          subjectCode: 'SCI',
          chapterNumber: 2,
          topicName: 'Motion in Two Dimensions',
          language: 'both' as const,
          simulationType: '2D_CANVAS' as const,
          runtimeUrl: '/simulations/physics-projectile-motion.html',
          isPublished: true,
          tags: ['Physics', 'Mechanics', 'Projectile', 'Class 9-12'],
        },
        {
          code: 'SIM-CHEM-G6-BOHR',
          title: "Bohr's Atomic Model Visualizer",
          titleNepali: 'बोरको पारमाणविक नमुना',
          description:
            'Animated electron shell visualizer (K, L, M, N) for elements 1 to 20 with valence electrons and atomic numbers.',
          learningObjectives: [
            'Apply 2n² electron configuration rule',
            'Identify valence electrons and chemical valency',
            'Distinguish protons and neutrons in nucleus',
          ],
          gradeLevels: [6, 7, 8, 9, 10],
          subjectCode: 'SCI',
          chapterNumber: 5,
          topicName: 'Matter and Atomic Structure',
          language: 'both' as const,
          simulationType: '2D_CANVAS' as const,
          runtimeUrl: '/simulations/chem-atomic-bohr.html',
          isPublished: true,
          tags: ['Chemistry', 'Atom', 'Bohr Model', 'Class 6-10'],
        },
        {
          code: 'SIM-CS-G9-LOGIC',
          title: 'Digital Logic Circuit Simulator',
          titleNepali: 'डिजिटल लजिक गेट्स प्रयोगशाला',
          description:
            'Interactive logic gate tester for AND, OR, NOT, NAND, NOR, XOR with live toggles, output LED, and truth table highlighting.',
          learningObjectives: [
            'Construct basic and universal logic gates',
            'Formulate Boolean algebra outputs',
            'Verify complete truth tables interactively',
          ],
          gradeLevels: [9, 10, 11, 12],
          subjectCode: 'COM',
          chapterNumber: 1,
          topicName: 'Boolean Logic & Digital Systems',
          language: 'both' as const,
          simulationType: '2D_CANVAS' as const,
          runtimeUrl: '/simulations/cs-logic-gates.html',
          isPublished: true,
          tags: ['Computer Science', 'Logic Gates', 'Class 9-12'],
        },
        {
          code: 'SIM-MATH-G1-NUMBERLINE',
          title: 'Number Line & Counting Frog (3D Edition)',
          titleNepali: 'सङ्ख्या रेखा र भ्यागुताको उफ्राइ (थ्रीडी)',
          description:
            'Interactive 3D number line and garden with animated frog demonstrating counting, addition, subtraction, missing numbers, and Nepali numerals ० देखि २०.',
          learningObjectives: [
            'Count forward and backward on 3D number line',
            'Recognize Nepali numerals and word values (० देखि २०)',
            'Perform single-digit addition and subtraction using forward and backward jumps',
            'Solve missing number challenges and complete number patterns',
          ],
          gradeLevels: [1, 2, 3, 4, 5],
          subjectCode: 'MTH',
          chapterNumber: 1,
          topicName: 'Numbers & Basic Operations',
          language: 'both' as const,
          simulationType: '3D_WEBGL' as const,
          componentKey: 'class1-math-number-line-frog',
          runtimeUrl: '/simulations/math-number-line.html',
          isPublished: true,
          tags: ['Math', 'Primary', 'Counting', 'Number Line', '3D', 'Class 1-5'],
        },
        {
          code: 'SIM-BIO-G6-CELL',
          title: 'Virtual Microscope: Cell Structure',
          titleNepali: 'कोषको संरचना र भर्चुअल माइक्रोस्कोप',
          description:
            'Specimen comparison between plant cell and animal cell with interactive organelle inspection.',
          learningObjectives: [
            'Differentiate plant and animal cell organelles',
            'Identify nucleus, mitochondria, chloroplast and cell wall functions',
            'Understand cellular turgor and photosynthesis support',
          ],
          gradeLevels: [6, 7, 8, 9, 10],
          subjectCode: 'SCI',
          chapterNumber: 3,
          topicName: 'Living Organisms & Cell Biology',
          language: 'both' as const,
          simulationType: '2D_CANVAS' as const,
          runtimeUrl: '/simulations/bio-cell-structure.html',
          isPublished: true,
          tags: ['Biology', 'Cells', 'Microscope', 'Class 6-10'],
        },
      ];

      for (const s of simulationsToSeed) {
        await this.createSimulation(s);
      }
      console.log('Seeded 7 Nepal CDC simulations successfully.');
    }

    // Always ensure the 5 official Class 1 Mathematics Chapter 1 simulations are registered
    const class1MathSims = [
      {
        code: 'SIM-MATH-G1-CH1-01',
        title: 'My 3D Position Playground – Inside, Outside, Above and Below',
        titleNepali: 'मेरो ३डी स्थिति खेलमैदान – भित्र, बाहिर, माथि र तल',
        description:
          'Interactive 3D Nepalese village playground for learning Inside/Outside and Above/Below spatial relationships through real-time dragging, object placement, and audio-guided tasks.',
        descriptionNepali:
          'नेपाली गाउँको सुन्दर ३डी खेलमैदानमा भित्र र बाहिर, माथि र तलका अवधारणाहरू प्रत्यक्ष अभ्यास र अन्तरक्रिया मार्फत सिक्नुहोस्।',
        learningObjectives: [
          'Identify whether an object or animal is inside or outside (भित्र र बाहिर)',
          'Identify vertical positions: above and below (माथि र तल)',
          'Drag, place, and verify 3D objects in the village environment',
          'Build foundational spatial vocabulary in Nepali and English',
        ],
        learningObjectivesNepali: [
          'कुनै वस्तु वा जनावर भित्र वा बाहिर छ भनी पहिचान गर्न (भित्र र बाहिर)',
          'ठाडो स्थिति: माथि र तल स्पष्ट बुझ्न र देखाउन (माथि र तल)',
          'गाउँको ३डी वातावरणमा वस्तुहरू तानेर सही ठाउँमा राख्न',
          'नेपाली र अङ्ग्रेजी दुवै भाषामा स्थान सम्बन्धी शब्दहरू सिक्न',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        subjectNameNepali: 'गणित',
        chapterNumber: 1,
        chapterTitle: 'Shapes and Position',
        chapterTitleNepali: 'आकारप्रकार र स्थान',
        topicName: 'Inside, Outside, Above and Below',
        topicNameNepali: 'भित्र, बाहिर, माथि र तल',
        language: 'both' as const,
        simulationType: '3D_WEBGL' as const,
        runtimeUrl: '/simulations/class1-math-ch1-playground',
        componentKey: 'class1-math-ch1-playground',
        difficulty: 'BEGINNER' as const,
        estimatedMinutes: 20,
        status: 'AVAILABLE' as const,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 1', 'Shapes and Position', '3D WebGL', 'Inside Outside', 'Above Below', 'Nepal CDC'],
      },
      {
        code: 'SIM-MATH-G1-CH1-02',
        title: 'Big and Small World',
        titleNepali: 'ठूलो र सानो संसार',
        description:
          'Interactive 3D scale laboratory comparing volume, mass perception, and object sizes with elephants, balls, traditional clay pots, and fruit baskets.',
        descriptionNepali:
          'हात्ती, बल, माटोका भाँडा र फलफूलका टोकरीहरूको आकार तुलना गरी ठूलो र सानो छुट्याउने अन्तरक्रियात्मक ३डी अभ्यास।',
        learningObjectives: [
          'Distinguish between big and small (ठूलो र सानो)',
          'Compare overall physical scale and dimensions of 3D objects',
          'Sort and classify items from smallest to biggest',
        ],
        learningObjectivesNepali: [
          'ठूलो र सानो वस्तुहरू बीचको भिन्नता छुट्याउन (ठूलो र सानो)',
          '३डी वस्तुहरूको समग्र आकार तुलना गर्न',
          'वस्तुहरूलाई सानोदेखि ठूलो क्रममा मिलाउन',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        subjectNameNepali: 'गणित',
        chapterNumber: 1,
        chapterTitle: 'Shapes and Position',
        chapterTitleNepali: 'आकारप्रकार र स्थान',
        topicName: 'Big and Small',
        topicNameNepali: 'ठूलो र सानो',
        language: 'both' as const,
        simulationType: '3D_WEBGL' as const,
        runtimeUrl: '/simulations/class1-math-ch1-big-small',
        componentKey: 'class1-math-ch1-big-small',
        difficulty: 'BEGINNER' as const,
        estimatedMinutes: 15,
        status: 'AVAILABLE' as const,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 1', 'Big and Small', 'Size Comparison', '3D WebGL'],
      },
      {
        code: 'SIM-MATH-G1-CH1-03',
        title: 'Tall and Short Adventure',
        titleNepali: 'अग्लो र होचो साहसिक यात्रा',
        description:
          'Compare vertical heights of Himalayan pine trees, village houses, people, and flagpoles from a common ground plane.',
        descriptionNepali:
          'समान जमिनको सतहबाट सल्लाका रूखहरू, घरहरू, मानिसहरू र झण्डाको उचाइ तुलना गरी अग्लो र होचो छुट्याउने ३डी साहसिक यात्रा।',
        learningObjectives: [
          'Understand vertical height differences (अग्लो र होचो)',
          'Distinguish height from overall volume/size',
          'Identify the tallest and shortest object in a scene',
        ],
        learningObjectivesNepali: [
          'ठाडो उचाइको भिन्नता बुझ्न (अग्लो र होचो)',
          'उचाइ र मोटाइ/आकार बीचको अन्तर स्पष्ट गर्न',
          'दृश्यमा सबैभन्दा अग्लो र सबैभन्दा होचो वस्तु पहिचान गर्न',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        subjectNameNepali: 'गणित',
        chapterNumber: 1,
        chapterTitle: 'Shapes and Position',
        chapterTitleNepali: 'आकारप्रकार र स्थान',
        topicName: 'Tall and Short',
        topicNameNepali: 'अग्लो र होचो',
        language: 'both' as const,
        simulationType: '3D_WEBGL' as const,
        runtimeUrl: '/simulations/class1-math-ch1-tall-short',
        componentKey: 'class1-math-ch1-tall-short',
        difficulty: 'BEGINNER' as const,
        estimatedMinutes: 15,
        status: 'AVAILABLE' as const,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 1', 'Tall and Short', 'Height', '3D WebGL'],
      },
      {
        code: 'SIM-MATH-G1-CH1-04',
        title: 'Long and Short Explorer',
        titleNepali: 'लामो र छोटो अन्वेषक',
        description:
          'Explore horizontal length comparisons with wooden pencils, ropes, suspension bridges, and village walking trails.',
        descriptionNepali:
          'सिसाकलम, डोरी, झोलुङ्गे पुल र गोरेटो बाटोको लम्बाइ नापेर लामो र छोटो छुट्याउने ३डी अन्तरक्रियात्मक अन्वेषक।',
        learningObjectives: [
          'Understand horizontal length relationships (लामो र छोटो)',
          'Align baseline endpoints to compare lengths accurately',
          'Order items from shortest to longest',
        ],
        learningObjectivesNepali: [
          'तेर्सो लम्बाइको सम्बन्ध बुझ्न (लामो र छोटो)',
          'सुरुवाती बिन्दु मिलाएर लम्बाइको सही तुलना गर्न',
          'वस्तुहरूलाई छोटोदेखि लामो क्रममा राख्न',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        subjectNameNepali: 'गणित',
        chapterNumber: 1,
        chapterTitle: 'Shapes and Position',
        chapterTitleNepali: 'आकारप्रकार र स्थान',
        topicName: 'Long and Short',
        topicNameNepali: 'लामो र छोटो',
        language: 'both' as const,
        simulationType: '3D_WEBGL' as const,
        runtimeUrl: '/simulations/class1-math-ch1-long-short',
        componentKey: 'class1-math-ch1-long-short',
        difficulty: 'BEGINNER' as const,
        estimatedMinutes: 15,
        status: 'AVAILABLE' as const,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 1', 'Long and Short', 'Length Comparison', '3D WebGL'],
      },
      {
        code: 'SIM-MATH-G1-CH1-05',
        title: 'Direction and Distance Adventure',
        titleNepali: 'दिशा र दूरी साहसिक यात्रा',
        description:
          'Interactive village journey mastering Right and Left, Front, Middle and Behind, and Near and Far relative to reference landmarks.',
        descriptionNepali:
          'दायाँ र बायाँ, अगाडि, बिच र पछाडि, तथा नजिक र टाढाका दिशाहरू र दूरीहरू बुझ्ने रोमाञ्चक ३डी साहसिक यात्रा।',
        learningObjectives: [
          'Distinguish Right and Left directions (दायाँ र बायाँ)',
          'Identify sequential positions: Front, Middle, and Behind (अगाडि, बिच, पछाडि)',
          'Evaluate distance (Near and Far) relative to a reference character (नजिक र टाढा)',
        ],
        learningObjectivesNepali: [
          'दायाँ र बायाँ दिशा पहिचान गर्न (दायाँ र बायाँ)',
          'लाइनमा अगाडि, बिच र पछाडि छुट्याउन (अगाडि, बिच, पछाडि)',
          'निश्चित सन्दर्भ बिन्दुबाट नजिक र टाढा दूरी तुलना गर्न (नजिक र टाढा)',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        subjectNameNepali: 'गणित',
        chapterNumber: 1,
        chapterTitle: 'Shapes and Position',
        chapterTitleNepali: 'आकारप्रकार र स्थान',
        topicName: 'Direction and Distance',
        topicNameNepali: 'दिशा र दूरी',
        language: 'both' as const,
        simulationType: '3D_WEBGL' as const,
        runtimeUrl: '/simulations/class1-math-ch1-direction-distance',
        componentKey: 'class1-math-ch1-direction-distance',
        difficulty: 'BEGINNER' as const,
        estimatedMinutes: 20,
        status: 'AVAILABLE' as const,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 1', 'Direction', 'Distance', 'Right Left', 'Near Far', '3D WebGL'],
      },
    ];

    for (const sim of class1MathSims) {
      await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: sim },
        { upsert: true, new: true }
      );
    }
    console.log('Verified registration of Class 1 Mathematics Chapter 1 simulations.');

    // Always ensure the 5 official Class 1 Mathematics Chapter 2 (Lines / रेखाहरू) simulations are registered
    const class1MathCh2Sims = [
      {
        code: 'SIM-MATH-G1-CH2-01',
        title: 'Straight and Curved Line Explorer',
        titleNepali: 'सीधा र बाङ्गो रेखा चिनौँ',
        description:
          'Explore straight and curved lines in a vibrant 3D village playground with roads, ropes, bridges, railway tracks, and interactive line transformations.',
        descriptionNepali:
          'नेपाली गाउँको सुन्दर ३डी खेलमैदानमा सडक, डोरी, पुल, रेलको लिक र विभिन्न वस्तुहरूको सहयोगले सिधा र बाङ्गो रेखा चिन्नुहोस् र तुलना गर्नुहोस्।',
        learningObjectives: [
          'Distinguish between straight lines and curved lines (सिधा रेखा र बाङ्गो रेखा)',
          'Identify real-world objects featuring straight and curved geometry',
          'Transform flexible ropes between bent and straight states',
          'Classify lines into straight and curved categories',
        ],
        learningObjectivesNepali: [
          'सिधा रेखा र बाङ्गो रेखा बीचको भिन्नता छुट्याउन',
          'दैनिक जीवनका वस्तुहरूमा सिधा र बाङ्गो रेखाहरू पहिचान गर्न',
          'डोरी तन्काएर सिधा र बाङ्गो बनाउने अभ्यास गर्न',
          'रेखाहरूलाई सिधा र बाङ्गो समूहमा वर्गीकरण गर्न',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        subjectNameNepali: 'गणित',
        chapterNumber: 2,
        chapterTitle: 'Lines',
        chapterTitleNepali: 'रेखाहरू',
        topicName: 'Straight and Curved Lines',
        topicNameNepali: 'सिधा र बाङ्गो रेखा',
        language: 'both' as const,
        simulationType: '3D_WEBGL' as const,
        runtimeUrl: '/simulations/class1-math-ch2-explorer',
        componentKey: 'class1-math-ch2-explorer',
        difficulty: 'BEGINNER' as const,
        estimatedMinutes: 20,
        status: 'AVAILABLE' as const,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 2', 'Lines', 'Straight Line', 'Curved Line', '3D WebGL', 'Nepal CDC'],
      },
      {
        code: 'SIM-MATH-G1-CH2-02',
        title: 'Colour the Lines',
        titleNepali: 'रेखाहरूमा रङ भरौँ',
        description:
          'Textbook-aligned activity colouring straight lines BLUE and curved lines RED across interactive cards and composite drawings (ice cream cone, boat, house, flower).',
        descriptionNepali:
          'पाठ्यपुस्तकको अभ्यास अनुसार सिधा रेखामा नीलो र बाङ्गो रेखामा रातो रङ भरी चित्रहरू (आइसक्रिम, डुङ्गा, घर, फूल) पूरा गर्नुहोस्।',
        learningObjectives: [
          'Apply blue colour to straight lines (सिधा रेखामा नीलो रङ)',
          'Apply red colour to curved lines (बाङ्गो रेखामा रातो रङ)',
          'Deconstruct composite figures into straight and curved segments',
          'Reinforce line recognition through active colouring',
        ],
        learningObjectivesNepali: [
          'सिधा रेखा पहिचान गरी नीलो रङ लगाउन',
          'बाङ्गो रेखा पहिचान गरी रातो रङ लगाउन',
          'चित्रहरूमा रहेका सिधा र बाङ्गो भागहरू छुट्याउन',
          'रङ भर्ने रमाइलो अभ्यासबाट रेखाको ज्ञान पक्का गर्न',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        subjectNameNepali: 'गणित',
        chapterNumber: 2,
        chapterTitle: 'Lines',
        chapterTitleNepali: 'रेखाहरू',
        topicName: 'Colouring Lines',
        topicNameNepali: 'रेखाहरूमा रङ भर्ने',
        language: 'both' as const,
        simulationType: '3D_WEBGL' as const,
        runtimeUrl: '/simulations/class1-math-ch2-colouring',
        componentKey: 'class1-math-ch2-colouring',
        difficulty: 'BEGINNER' as const,
        estimatedMinutes: 15,
        status: 'AVAILABLE' as const,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 2', 'Colouring', 'Blue Straight', 'Red Curved', 'Interactive'],
      },
      {
        code: 'SIM-MATH-G1-CH2-03',
        title: 'Connect the Dots',
        titleNepali: 'थोप्लाहरू जोडेर रेखा बनाऔँ',
        description:
          'Interactive dot grid where students join dots to construct straight lines (2 dots, 3 dots), diagonal tracks, zigzag paths, and smooth curved trajectories.',
        descriptionNepali:
          'थोप्लाहरूलाई जोडेर २ थोप्लाको सिधा रेखा, ३ थोप्लाको सिधा रेखा, बाङ्गो र जिगज्याग रेखाहरू बनाउने अभ्यास गर्नुहोस्।',
        learningObjectives: [
          'Understand that connecting dots produces lines (थोप्ला जोडेर रेखा बन्ने)',
          'Create straight lines by joining aligned dots',
          'Create zigzag paths by joining alternating dots',
          'Trace smooth curves through sequenced circular points',
        ],
        learningObjectivesNepali: [
          'थोप्लाहरू जोडेर रेखा बन्छ भन्ने कुरा बुझ्न',
          'सिधा रहेका थोप्लाहरू जोडी सिधा रेखा बनाउन',
          'जिगज्याग र बाङ्गा रेखाहरू निर्माण गर्न',
          'हातको सन्तुलन र रेखा कोर्ने सीप विकास गर्न',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        subjectNameNepali: 'गणित',
        chapterNumber: 2,
        chapterTitle: 'Lines',
        chapterTitleNepali: 'रेखाहरू',
        topicName: 'Connect Dots',
        topicNameNepali: 'थोप्ला जोड्ने',
        language: 'both' as const,
        simulationType: '3D_WEBGL' as const,
        runtimeUrl: '/simulations/class1-math-ch2-dots',
        componentKey: 'class1-math-ch2-dots',
        difficulty: 'BEGINNER' as const,
        estimatedMinutes: 15,
        status: 'AVAILABLE' as const,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 2', 'Dots', 'Connect the Dots', 'Interactive'],
      },
      {
        code: 'SIM-MATH-G1-CH2-04',
        title: 'Draw with Real Objects',
        titleNepali: 'वस्तुको प्रयोग गरी रेखा कोरौँ',
        description:
          'Virtual classroom desk exploration using straight-edged objects (ruler, textbook, wooden block, notebook) to guide the pencil and draw crisp straight lines.',
        descriptionNepali:
          'स्केल, किताब, कापी र काठको ब्लक जस्ता सिधा किनारा भएका वस्तुहरू प्रयोग गरी कागजमा सिधा रेखा कोर्ने अभ्यास गर्नुहोस्।',
        learningObjectives: [
          'Identify physical objects possessing straight edges (सिधा किनारा भएका वस्तुहरू)',
          'Use straight-edged physical guides to draw clean straight lines',
          'Contrast guided lines with freehand wobbly lines',
          'Rotate objects to draw horizontal, vertical, and diagonal lines',
        ],
        learningObjectivesNepali: [
          'सिधा किनारा भएका वस्तुहरू (स्केल, किताब) पहिचान गर्न',
          'किनाराको सहारा लिएर सफा र सिधा रेखा कोर्न',
          'किनारा बिना कोरेको बाङ्गो रेखा र किनारा सहितको सिधा रेखा तुलना गर्न',
          'विभिन्न दिशामा सिधा रेखाहरू कोर्न सिक्न',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        subjectNameNepali: 'गणित',
        chapterNumber: 2,
        chapterTitle: 'Lines',
        chapterTitleNepali: 'रेखाहरू',
        topicName: 'Draw with Objects',
        topicNameNepali: 'वस्तु प्रयोग गरी कोर्ने',
        language: 'both' as const,
        simulationType: '3D_WEBGL' as const,
        runtimeUrl: '/simulations/class1-math-ch2-objects',
        componentKey: 'class1-math-ch2-objects',
        difficulty: 'BEGINNER' as const,
        estimatedMinutes: 15,
        status: 'AVAILABLE' as const,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 2', 'Ruler', 'Straight Edge', 'Drawing', 'Interactive'],
      },
      {
        code: 'SIM-MATH-G1-CH2-05',
        title: 'My 3D Line Drawing Playground',
        titleNepali: 'आफैँ रेखा कोरौँ',
        description:
          'Freehand and guided line drawing playground in 3D village sandpit: trace templates, draw free lines, choose vibrant colours, erase, and save creations.',
        descriptionNepali:
          '३डी खेलमैदानमा आफैँ सिधा र बाङ्गा रेखाहरू कोर्नुहोस्, टेम्प्लेट पछ्याउनुहोस्, रङहरू बदल्नुहोस् र रमाइलो कला सिर्जना गर्नुहोस्।',
        learningObjectives: [
          'Trace guided straight and curved templates with precision',
          'Express creativity through freehand straight and curved drawing',
          'Recognize line structures in self-drawn village scenes',
          'Develop motor skills and stylus/touch control',
        ],
        learningObjectivesNepali: [
          'सिधा र बाङ्गा रेखाहरूका टेम्प्लेटहरू माथि ट्रेस गर्न',
          'आफ्नै हातले सिधा र बाङ्गा रेखाहरू कोर्न',
          'चित्रहरूमा रेखाका विभिन्न रूपहरू प्रयोग गर्न',
          'हातको सन्तुलन र कलात्मक सीप बढाउन',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        subjectNameNepali: 'गणित',
        chapterNumber: 2,
        chapterTitle: 'Lines',
        chapterTitleNepali: 'रेखाहरू',
        topicName: 'Free Drawing',
        topicNameNepali: 'आफैँ रेखा कोर्ने',
        language: 'both' as const,
        simulationType: '3D_WEBGL' as const,
        runtimeUrl: '/simulations/class1-math-ch2-drawing',
        componentKey: 'class1-math-ch2-drawing',
        difficulty: 'BEGINNER' as const,
        estimatedMinutes: 20,
        status: 'AVAILABLE' as const,
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 2', 'Free Drawing', 'Tracing', '3D WebGL'],
      },
    ];

    for (const sim of class1MathCh2Sims) {
      await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: sim },
        { upsert: true, new: true }
      );
    }
    console.log('Verified registration of Class 1 Mathematics Chapter 2 simulations.');

    // ══════════════════════════════════════════════════════════════════
    // CLASS 1 MATHEMATICS - CHAPTER 3: GEOMETRICAL SHAPES (ज्यामितीय आकारहरू)
    // ══════════════════════════════════════════════════════════════════
    const class1MathCh3Sims = [
      {
        code: 'SIM-MATH-G1-CH3-01',
        title: 'Shape Explorer 3D',
        titleNepali: 'आकारहरू चिनौँ',
        description:
          'Explore circles (वृत्त), triangles (त्रिभुज), and quadrilaterals (चतुर्भुज) in an interactive 3D playground with real-world objects, multi-angle 3D rotation, and guided progressive challenges.',
        descriptionNepali:
          'रङ्गीचङ्गी ३डी खेलमैदानमा वृत्त, त्रिभुज र चतुर्भुज आकारहरूलाई वास्तविक वस्तुहरूको सहयोगले चिन्नुहोस्, ३डी मोडेल घुमाउनुहोस् र तुलना गर्नुहोस्।',
        learningObjectives: [
          'Recognize basic 2D geometrical shapes: Circle (वृत्त), Triangle (त्रिभुज), and Quadrilateral (चतुर्भुज)',
          'Identify real-world objects corresponding to geometrical shapes (plate, clock, roof, sign, door, window)',
          'Compare shapes by size to identify the smallest or largest in a group',
          'Understand shapes regardless of color, orientation, or physical size',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        chapterNumber: 3,
        chapterTitle: 'Geometrical Shapes',
        simulationType: 'THREE_JS',
        componentKey: 'class1-math-ch3-explorer',
        runtimeUrl: '/simulations/class1-math-ch3/explorer',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 12,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 3', 'Shapes', 'Circle', 'Triangle', 'Quadrilateral', '3D WebGL'],
      },
      {
        code: 'SIM-MATH-G1-CH3-02',
        title: 'Match the Shape',
        titleNepali: 'वस्तु र आकार मिलाऔँ',
        description:
          'Connect real-world objects (plate, clock, drum, ball face, triangular sign, kite, book, window, door) with their corresponding geometrical shape categories (Circle, Triangle, Quadrilateral).',
        descriptionNepali:
          'थाली, घडी, बल, ट्राफिक सङ्केत, चङ्गा, किताब, झ्याल र ढोका जस्ता दैनिक वस्तुहरूलाई वृत्त, त्रिभुज वा चतुर्भुजको सही बाकसमा मिलाउनुहोस्।',
        learningObjectives: [
          'Map everyday household and classroom items to their geometrical cross-sections or faces',
          'Categorize objects into Circle, Triangle, and Quadrilateral groups',
          'Reinforce spatial association between 3D objects and 2D shape representations',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        chapterNumber: 3,
        chapterTitle: 'Geometrical Shapes',
        simulationType: 'HTML_INTERACTIVE',
        componentKey: 'class1-math-ch3-matching',
        runtimeUrl: '/simulations/class1-math-ch3/matching',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 10,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 3', 'Matching', 'Classification', 'Interactive'],
      },
      {
        code: 'SIM-MATH-G1-CH3-03',
        title: 'Colour the Shapes',
        titleNepali: 'आकारहरूमा रङ भरौँ',
        description:
          'Textbook-aligned shape colouring activity: Triangle = Red (रातो), Quadrilateral/Rectangle = Blue (निलो), Circle = Green (हरियो) across isolated shapes and creative drawings (house, bus, robot, flower, person).',
        descriptionNepali:
          'पाठ्यपुस्तकको नियम अनुसार त्रिभुजमा रातो, चतुर्भुजमा निलो र वृत्तमा हरियो रङ भरी सुन्दर चित्रहरू (घर, बस, रोबोट, फूल) रङ्गाउनुहोस्।',
        learningObjectives: [
          'Apply the textbook colour key: Triangle (Red), Quadrilateral (Blue), Circle (Green)',
          'Identify shapes embedded in composite illustrations (houses, buses, robots)',
          'Strengthen fine motor skills and geometric visual discrimination',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        chapterNumber: 3,
        chapterTitle: 'Geometrical Shapes',
        simulationType: 'HTML_INTERACTIVE',
        componentKey: 'class1-math-ch3-colouring',
        runtimeUrl: '/simulations/class1-math-ch3/colouring',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 10,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 3', 'Colouring', 'Red Blue Green', 'Art Integration'],
      },
      {
        code: 'SIM-MATH-G1-CH3-04',
        title: 'Shape Detective',
        titleNepali: 'आकार खोजौँ',
        description:
          'Explore 3 vibrant 3D environments (Classroom, Playground, Nepalese Village) as a Shape Detective to discover hidden circles, triangles, and quadrilaterals in everyday surroundings.',
        descriptionNepali:
          'कक्षाकोठा, खेलमैदान र गाउँका ३ फरक वातावरणमा घुमेर लुकेका वृत्त, त्रिभुज र चतुर्भुज आकारका वस्तुहरू पत्ता लगाउने जासुसी खेल।',
        learningObjectives: [
          'Discover geometrical shapes embedded within realistic surrounding environments',
          'Distinguish shapes in classroom settings (blackboard, books, clock)',
          'Locate shapes in outdoor play and traditional village architecture',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        chapterNumber: 3,
        chapterTitle: 'Geometrical Shapes',
        simulationType: 'THREE_JS',
        componentKey: 'class1-math-ch3-detective',
        runtimeUrl: '/simulations/class1-math-ch3/detective',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 12,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 3', 'Detective', 'Exploration', 'Scavenger Hunt'],
      },
      {
        code: 'SIM-MATH-G1-CH3-05',
        title: 'Build with Shapes',
        titleNepali: 'आकारहरूबाट चित्र बनाऔँ',
        description:
          'Creative 3D construction canvas where students drag, place, rotate, and combine circles, triangles, squares, and rectangles to build houses, robots, buses, flowers, and vehicles.',
        descriptionNepali:
          'वृत्त, त्रिभुज, वर्ग र आयतका टुक्राहरू जोडेर घर, रोबोट, बस, फूल र गाडी जस्ता रमाइला चित्रहरू बनाउने सिर्जनात्मक खेल।',
        learningObjectives: [
          'Synthesize composite structures using fundamental geometric building blocks',
          'Understand that complex physical objects are combinations of basic shapes',
          'Foster spatial reasoning, design intuition, and creative problem solving',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        chapterNumber: 3,
        chapterTitle: 'Geometrical Shapes',
        simulationType: 'THREE_JS',
        componentKey: 'class1-math-ch3-builder',
        runtimeUrl: '/simulations/class1-math-ch3/builder',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 3', 'Construction', 'Tangram', 'Creative Playground'],
      },
    ];

    for (const sim of class1MathCh3Sims) {
      await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: sim },
        { upsert: true, new: true }
      );
    }
    console.log('Verified registration of Class 1 Mathematics Chapter 3 simulations.');

    // ══════════════════════════════════════════════════════════════════
    // CLASS 1 MATHEMATICS - CHAPTER 4: NUMBERS UP TO 9 (९ सम्मका सङ्ख्याहरू)
    // ══════════════════════════════════════════════════════════════════
    const class1MathCh4Sims = [
      {
        code: 'SIM-MATH-G1-CH4-01',
        title: 'Many and Few Adventure',
        titleNepali: 'धेरै र थोरै चिनौँ',
        description:
          'Compare two groups of real-world objects in an interactive 3D village marketplace (apples, flowers, birds, balls) to identify which group has more (धेरै) or fewer (थोरै) items.',
        descriptionNepali:
          'नेपाली गाउँको सुन्दर बजारमा स्याउ, फूल, चरा र बलहरूका समूह तुलना गरी धेरै र थोरै छुट्याउने ३डी अन्तरक्रियात्मक खेल।',
        learningObjectives: [
          'Understand the core mathematical concepts of Many (धेरै) and Few (थोरै)',
          'Visually and numerically compare two groups of everyday objects',
          'Identify groups containing more or fewer items without relying on physical object sizes alone',
          'Sort and distribute objects into groups of many and few',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        chapterNumber: 4,
        chapterTitle: 'Numbers up to 9',
        simulationType: 'THREE_JS',
        componentKey: 'class1-math-ch4-many-few',
        runtimeUrl: '/simulations/class1-math-ch4/many-few',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 12,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 4', 'Many and Few', 'धेरै र थोरै', 'Comparison', '3D WebGL'],
      },
      {
        code: 'SIM-MATH-G1-CH4-02',
        title: 'Number Garden 1–9',
        titleNepali: '१ देखि ९ सम्म गनौँ',
        description:
          'Explore and count objects from 1 to 9 in an interactive 3D garden with animated butterflies, rabbits, fish, balloons, and fruit trees, linking tactile counting to numerals.',
        descriptionNepali:
          'रङ्गीचङ्गी ३डी बगैँचामा पुतली, खरायो, माछा, बेलुन र फलफूलहरू छोएर १ देखि ९ सम्म क्रमैसँग गन्ने र सङ्ख्या चिन्ने रमाइलो अभ्यास।',
        learningObjectives: [
          'Count physical and natural objects from 1 to 9 sequentially',
          'Associate individual counted objects with increasing number values',
          'Recognize numerals 1–9 and १–९ paired with their exact quantities',
          'Prevent accidental double counting with single-touch confirmation',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        chapterNumber: 4,
        chapterTitle: 'Numbers up to 9',
        simulationType: 'THREE_JS',
        componentKey: 'class1-math-ch4-garden',
        runtimeUrl: '/simulations/class1-math-ch4/garden',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 4', 'Counting', '1 to 9', '१ देखि ९', '3D Garden'],
      },
      {
        code: 'SIM-MATH-G1-CH4-03',
        title: 'Number Matching World',
        titleNepali: 'वस्तु र सङ्ख्या मिलाऔँ',
        description:
          'Match groups of objects (1 to 9) with English numerals (1–9), Nepali numerals (१–९), English number names (One to Nine), and Nepali number names (एक देखि नौ).',
        descriptionNepali:
          'वस्तुहरूको समूहलाई तिनका अङ्क (१ देखि ९) र अक्षरमा लेखिएका नाम (एक देखि नौ) सँग जोडा मिलाउने अन्तरक्रियात्मक खेल।',
        learningObjectives: [
          'Connect concrete object quantities with abstract numeral symbols',
          'Master bilingual number names: One (एक) through Nine (नौ)',
          'Switch seamlessly between English (1–9) and Devanagari (१–९) numerals',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        chapterNumber: 4,
        chapterTitle: 'Numbers up to 9',
        simulationType: 'HTML_INTERACTIVE',
        componentKey: 'class1-math-ch4-matching',
        runtimeUrl: '/simulations/class1-math-ch4/matching',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 10,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 4', 'Matching', 'Number Names', 'Bilingual'],
      },
      {
        code: 'SIM-MATH-G1-CH4-04',
        title: 'Number Tracing and Writing Studio',
        titleNepali: 'सङ्ख्या लेख्न सिकौँ',
        description:
          'Interactive guided stroke tracing studio for writing numerals 1 to 9 in both standard English (1–9) and Nepali Devanagari (१, २, ३, ४, ५, ६, ७, ८, ९) notation.',
        descriptionNepali:
          'नेपाली देवनागरी अङ्क (१ देखि ९) र अङ्ग्रेजी अङ्क (1 to 9) लाई सही दिशा र तरिकाले लेख्न र कोर्न सिक्ने डिजिटल पाटी।',
        learningObjectives: [
          'Trace and write numerals 1 to 9 following correct stroke order and starting points',
          'Practice Devanagari numerals १, २, ३, ४, ५, ६, ७, ८, ९ with guided outlines',
          'Develop fine motor control and digit recognition with forgiving tolerance',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        chapterNumber: 4,
        chapterTitle: 'Numbers up to 9',
        simulationType: 'HTML_INTERACTIVE',
        componentKey: 'class1-math-ch4-tracing',
        runtimeUrl: '/simulations/class1-math-ch4/tracing',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 12,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 4', 'Tracing', 'Writing', 'Numerals', 'Devanagari'],
      },
      {
        code: 'SIM-MATH-G1-CH4-05',
        title: 'Number Sequence Adventure',
        titleNepali: 'सङ्ख्या क्रम मिलाऔँ',
        description:
          'Navigate a 3D stepping stone river pathway by ordering shuffled numbers 1–9, filling in missing numbers, and continuing increasing number sequences.',
        descriptionNepali:
          '३डी ढुङ्गे खोलाको बाटोमा १ देखि ९ सम्मका सङ्ख्याहरूलाई मिलाएर राख्ने, छुटेका सङ्ख्या भर्ने र सङ्ख्याको क्रम पूरा गर्ने साहसिक खेल।',
        learningObjectives: [
          'Recognize increasing chronological order of numbers from 1 up to 9',
          'Fill in missing numbers within sequences (e.g., 1, __, 3, __, 5)',
          'Identify which number immediately follows or precedes a given quantity',
        ],
        gradeLevels: [1],
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        chapterNumber: 4,
        chapterTitle: 'Numbers up to 9',
        simulationType: 'THREE_JS',
        componentKey: 'class1-math-ch4-sequence',
        runtimeUrl: '/simulations/class1-math-ch4/sequence',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 4', 'Sequence', 'Stepping Stones', 'Ordering', '3D WebGL'],
      },
    ];

    for (const sim of class1MathCh4Sims) {
      await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: sim },
        { upsert: true, new: true }
      );
    }
    console.log('Verified registration of Class 1 Mathematics Chapter 4 simulations.');

    // Class 1 Mathematics - Chapter 5: Zero (शून्य)
    const class1MathCh5Sims = [
      {
        code: 'SIM-MATH-G1-CH5-01',
        title: 'The Zero Discovery Playground',
        titleNepali: 'शून्य चिनौँ',
        description:
          'Explore a vibrant 3D village playground to discover situations where no objects remain, understanding zero (०) as an empty group.',
        descriptionNepali:
          '३डी गाउँको खेलमैदान अन्वेषण गर्दै कुनै समूहमा कुनै वस्तु बाँकी नहुँदा शून्य (०) हुन्छ भनी प्रत्यक्ष अनुभव र अन्तरक्रियाबाट सिक्नुहोस्।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 5,
        chapterTitle: 'Zero',
        chapterTitleNepali: 'शून्य',
        topicName: 'Concept of Zero',
        topicNameNepali: 'शून्यको अवधारणा',
        learningObjectives: [
          'Understand zero as an empty group',
          'Observe object removal leading to zero count',
          'Identify zero in real-life village playground settings',
        ],
        learningObjectivesNepali: [
          'कुनै समूहमा कुनै वस्तु नहुनुलाई शून्य भनिन्छ भनी बुझ्ने',
          'वस्तुहरू हटाउँदै जाँदा अन्तिममा शून्य बाँकी रहने प्रक्रिया बुझ्ने',
          'वातावरणमा शून्यको अवस्था पहिचान गर्ने',
        ],
        simulationType: 'THREE_JS',
        componentKey: 'class1-math-ch5-playground',
        runtimeUrl: '/simulations/class1-math/ch5/playground',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 5', 'Zero', 'Shunya', '3D WebGL'],
      },
      {
        code: 'SIM-MATH-G1-CH5-02',
        title: 'Empty Basket Adventure',
        titleNepali: 'खाली टोकरी चिनौँ',
        description:
          'Explore village market containers, trays, pots, and boxes to count objects and identify empty collections with zero (०).',
        descriptionNepali:
          'गाउँको बजारमा विभिन्न टोकरी, गमला, ट्रे र बक्सहरू हेरेर वस्तु गणना गर्नुहोस् र खाली भाँडोलाई शून्य (०) सँग मिलाउनुहोस्।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 5,
        chapterTitle: 'Zero',
        chapterTitleNepali: 'शून्य',
        topicName: 'Empty Containers and Zero',
        topicNameNepali: 'खाली भाँडो र शून्य',
        learningObjectives: [
          'Distinguish empty vs non-empty containers',
          'Move objects in and out to observe zero',
          'Match empty containers with numeral 0',
        ],
        learningObjectivesNepali: [
          'खाली र भरिएका भाँडाहरूको फरक पहिचान गर्ने',
          'वस्तुहरू निकाल्दै जाँदा शून्य हुने अवस्था अनुभव गर्ने',
          'खाली समूहलाई सङ्ख्या ० सँग जोड्ने',
        ],
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch5-empty-basket',
        runtimeUrl: '/simulations/class1-math/ch5/empty-basket',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 12,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 5', 'Empty Basket', 'Zero', 'Containers'],
      },
      {
        code: 'SIM-MATH-G1-CH5-03',
        title: 'Where Did Everything Go?',
        titleNepali: 'वस्तुहरू कहाँ गए?',
        description:
          'Watch birds fly away from branches, ducks swim away, and fruits taken until nothing remains, seeing the count drop to zero (०).',
        descriptionNepali:
          'रुखबाट चराहरू उड्दा, पोखरीबाट हाँस जाँदा र टोकरीबाट फल खाँदा सङ्ख्या घट्दै शून्य (०) पुग्ने प्रक्रिया प्रत्यक्ष हेर्नुहोस्।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 5,
        chapterTitle: 'Zero',
        chapterTitleNepali: 'शून्य',
        topicName: 'Object Departure and Zero Remainder',
        topicNameNepali: 'वस्तुको प्रस्थान र शून्य शेष',
        learningObjectives: [
          'Track sequential departure of objects',
          'Confirm that removing all objects yields zero',
          'Select the correct final count of zero',
        ],
        learningObjectivesNepali: [
          'वस्तुहरू एक–एक गरी हट्ने क्रम पछ्याउने',
          'सबै वस्तु हटेपछि बाँकी शून्य हुन्छ भनी पुष्टि गर्ने',
          'अन्तिम सङ्ख्या शून्य (०) छान्ने',
        ],
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch5-where-did-it-go',
        runtimeUrl: '/simulations/class1-math/ch5/where-did-it-go',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 12,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 5', 'Object Departure', 'Zero'],
      },
      {
        code: 'SIM-MATH-G1-CH5-04',
        title: 'Count the Village',
        titleNepali: 'गाउँमा गनौँ',
        description:
          'Explore various locations in a Nepalese village to count people, animals, and objects, identifying places with zero objects.',
        descriptionNepali:
          'नेपाली गाउँका विभिन्न स्थानहरू हेरी मानिस, पशुपक्षी र बोटबिरुवाको सङ्ख्या गन्नुहोस् र शून्य वस्तु भएका स्थानहरू पहिचान गर्नुहोस्।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 5,
        chapterTitle: 'Zero',
        chapterTitleNepali: 'शून्य',
        topicName: 'Village Counting and Zero Spots',
        topicNameNepali: 'गाउँको गणना र शून्य स्थानहरू',
        learningObjectives: [
          'Compare zero count with non-zero counts in real environments',
          'Identify places with no inhabitants or items',
          'Record quantities in dual numeral notation',
        ],
        learningObjectivesNepali: [
          'वास्तविक वातावरणमा शून्य र अन्य सङ्ख्याको तुलना गर्ने',
          'कुनै पनि बासिन्दा वा वस्तु नभएको स्थान पहिचान गर्ने',
          'देवनागरी र अङ्ग्रेजी दुवै लिपिमा सङ्ख्या बुझ्ने',
        ],
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch5-count-village',
        runtimeUrl: '/simulations/class1-math/ch5/count-village',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 5', 'Village', 'Counting', 'Zero'],
      },
      {
        code: 'SIM-MATH-G1-CH5-05',
        title: 'Zero Challenge',
        titleNepali: 'शून्यको खेल',
        description:
          'Master zero through interactive challenges comparing empty vs occupied groups, counting scenes, and removing objects.',
        descriptionNepali:
          'खाली र भरिएका समूह तुलना गर्ने, दृश्यमा गणना गर्ने र ५ तहका चुनौतीहरू पूरा गरी शून्यको अवधारणामा दक्षता हासिल गर्नुहोस्।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 5,
        chapterTitle: 'Zero',
        chapterTitleNepali: 'शून्य',
        topicName: 'Zero Mastery Challenges',
        topicNameNepali: 'शून्य सम्बन्धी चुनौतीहरू',
        learningObjectives: [
          'Master progressive multi-level zero tasks',
          'Discriminate empty collections instantly',
          'Achieve high score and star mastery',
        ],
        learningObjectivesNepali: [
          'क्रमिक बहु-तहका शून्य सम्बन्धी चुनौतीहरू समाधान गर्ने',
          'खाली समूहहरू तुरुन्त पहिचान गर्ने',
          'उच्च अङ्क र ताराहरू प्राप्त गरी दक्षता प्रमाणित गर्ने',
        ],
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch5-zero-challenge',
        runtimeUrl: '/simulations/class1-math/ch5/zero-challenge',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 5', 'Zero Challenge', 'Mastery'],
      },
    ];

    for (const sim of class1MathCh5Sims) {
      await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: sim },
        { upsert: true, new: true }
      );
    }
    console.log('Verified registration of Class 1 Mathematics Chapter 5 simulations.');

    // Class 1 Mathematics - Chapter 6: Ten (दश)
    const class1MathCh6Sims = [
      {
        code: 'SIM-MATH-G1-CH6-01',
        title: 'Ten Object Adventure',
        titleNepali: 'दश वस्तुहरू गनौँ',
        description:
          'Explore an interactive 3D village garden to count groups of objects individually until reaching exactly ten (१० / 10).',
        descriptionNepali:
          '३डी गाउँको बगैँचामा वस्तुहरू एक–एक गरी गन्दै ठ्याक्कै दश (१०) वटा वस्तुहरूको समूह बनाउनुहोस् र गणना गर्नुहोस्।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 6,
        chapterTitle: 'Ten',
        chapterTitleNepali: 'दश',
        topicName: 'Counting up to Ten',
        topicNameNepali: 'दशसम्मको गणना',
        learningObjectives: [
          'Count objects up to 10 individually',
          'Recognize when a group contains exactly ten objects',
          'Distinguish 10 from smaller collections',
        ],
        learningObjectivesNepali: [
          'वस्तुहरू एक–एक गरी १० सम्म गन्न सक्ने',
          'कुनै समूहमा ठ्याक्कै १० वटा वस्तु भएको पहिचान गर्ने',
          '१० भन्दा साना समूहबाट १० को समूह छुट्याउने',
        ],
        simulationType: 'THREE_JS',
        componentKey: 'class1-math-ch6-ten-objects',
        runtimeUrl: '/simulations/class1-math/ch6/ten-objects',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 6', 'Ten', 'Counting', '3D WebGL'],
      },
      {
        code: 'SIM-MATH-G1-CH6-02',
        title: 'Number Ten Discovery World',
        titleNepali: '१० चिनौँ',
        description:
          'Discover and recognize the numeral 10 in English and १० in Nepali, its number name Ten / दश, and associate it with ten objects.',
        descriptionNepali:
          'सङ्ख्या १० (दश) र 10 (Ten) को रूप, नाम र १० वटा वस्तुहरूको सम्बन्धलाई ३डी बगैँचा र अन्तरक्रियात्मक बोर्डबाट चिन्नुहोस्।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 6,
        chapterTitle: 'Ten',
        chapterTitleNepali: 'दश',
        topicName: 'Recognition of Numeral Ten',
        topicNameNepali: 'सङ्ख्या १० को पहिचान',
        learningObjectives: [
          'Recognize numeral forms 10 and १०',
          'Associate number names Ten and दश',
          'Discriminate 10 from other single-digit numbers',
        ],
        learningObjectivesNepali: [
          'सङ्ख्या १० र 10 पहिचान गर्ने',
          'नाम "दश" र "Ten" उच्चारण र पहिचान गर्ने',
          'अन्य सङ्ख्याहरूबाट १० लाई छुट्याउने',
        ],
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch6-discovery',
        runtimeUrl: '/simulations/class1-math/ch6/discovery',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 12,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 6', 'Ten', 'Numerals', 'Recognition'],
      },
      {
        code: 'SIM-MATH-G1-CH6-03',
        title: 'Make Ten Challenge',
        titleNepali: 'दश बनाऔँ',
        description:
          'Physically partition and combine two groups of objects (1+9, 2+8, 3+7, 4+6, 5+5) between two baskets to make ten.',
        descriptionNepali:
          'दुईवटा टोकरीमा १० वटा वस्तुहरू बाँडेर १ र ९, २ र ८, ३ र ७, ४ र ६, तथा ५ र ५ जोडेर १० बनाउने खेल खेल्नुहोस्।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 6,
        chapterTitle: 'Ten',
        chapterTitleNepali: 'दश',
        topicName: 'Number Combinations that Make Ten',
        topicNameNepali: '१० बनाउने जोडहरू',
        learningObjectives: [
          'Understand practical combinations that sum to 10',
          'Distribute objects across two containers interactively',
          'Reinforce conservation of quantity',
        ],
        learningObjectivesNepali: [
          '१० बनाउने विभिन्न दुई समूहका जोडहरू बुझ्ने',
          'दुई टोकरीमा वस्तुहरू बाँड्दै जम्मा १० हुने प्रक्रिया अनुभव गर्ने',
          'जम्मा परिमाण स्थिर रहने अवधारणा बुझ्ने',
        ],
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch6-make-ten',
        runtimeUrl: '/simulations/class1-math/ch6/make-ten',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 6', 'Make Ten', 'Number Pairs', 'Combinations'],
      },
      {
        code: 'SIM-MATH-G1-CH6-04',
        title: 'Count and Match Ten',
        titleNepali: 'गनेर दशसँग मिलाऔँ',
        description:
          'Count objects across village scenes (flowers, fish, pencils, apples) and match groups containing ten with the numeral १० and 10.',
        descriptionNepali:
          'विभिन्न दृश्यहरूमा वस्तुहरू गनेर १० वटा वस्तु भएका समूहलाई सङ्ख्या १० र नाम "दश" सँग जोडी मिलाउनुहोस्।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 6,
        chapterTitle: 'Ten',
        chapterTitleNepali: 'दश',
        topicName: 'Counting and Matching Ten',
        topicNameNepali: 'गणना र जोडी मिलान',
        learningObjectives: [
          'Count discrete objects in multiple scenes',
          'Match sets of ten to numeral 10 and १०',
          'Select correct group containing exactly ten',
        ],
        learningObjectivesNepali: [
          'विभिन्न दृश्यमा रहेका वस्तुहरू सही गन्न सक्ने',
          '१० वटा वस्तुलाई सङ्ख्या १० सँग जोड्न सक्ने',
          '१० वटा भएको समूह ठम्याउन सक्ने',
        ],
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch6-count-match',
        runtimeUrl: '/simulations/class1-math/ch6/count-match',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 12,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 6', 'Matching', 'Counting', 'Ten'],
      },
      {
        code: 'SIM-MATH-G1-CH6-05',
        title: 'Number Ten Writing Studio',
        titleNepali: '१० लेख्न सिकौँ',
        description:
          'Guided stroke handwriting studio for practicing the two-digit number 10 and Devanagari numeral १० with directional guides and evaluation.',
        descriptionNepali:
          'डिजिटल पाटीमा १ र ० जोडेर १० तथा 1 र 0 जोडेर 10 लेख्ने सही तरिका हेर्नुहोस् र औँला वा स्टाइलसले कोर्नुहोस्।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 6,
        chapterTitle: 'Ten',
        chapterTitleNepali: 'दश',
        topicName: 'Handwriting Numeral 10 and १०',
        topicNameNepali: 'सङ्ख्या १० को लेखन अभ्यास',
        learningObjectives: [
          'Trace English numeral 10 with correct stroke order',
          'Trace Devanagari numeral १० with correct stroke order',
          'Understand that 10 is composed of digits 1 and 0',
        ],
        learningObjectivesNepali: [
          'अङ्ग्रेजी सङ्ख्या 10 सही दिशामा कोर्न सक्ने',
          'देवनागरी सङ्ख्या १० सही तरिकाले लेख्न सक्ने',
          '१० मा १ र ० दुईवटा अङ्क मिलेर बनेको हुन्छ भनी बुझ्ने',
        ],
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch6-writing',
        runtimeUrl: '/simulations/class1-math/ch6/writing',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        accessLevel: 'FREE',
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 6', 'Writing', 'Tracing', 'Ten'],
      },
    ];

    for (const sim of class1MathCh6Sims) {
      await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: sim },
        { upsert: true, new: true }
      );
    }
    console.log('Verified registration of Class 1 Mathematics Chapter 6 simulations.');

    // Class 1 Mathematics - Chapter 7: Addition up to 10 (योगफल १० सम्म आउने जोड)
    const class1MathCh7Sims = [
      {
        code: 'SIM-MATH-G1-CH7-01',
        title: 'Addition Playground',
        titleNepali: 'जोड्ने खेलमैदान',
        description:
          'Combine two groups of real-world objects in a 3D village playground, move them together into a combined basket, and discover the total.',
        descriptionNepali:
          '३डी गाउँको खेलमैदानमा दुई समूहका वस्तुहरूलाई एकै ठाउँमा मिसाएर जम्मा सङ्ख्या पत्ता लगाउने र जोडको अवधारणा बुझ्ने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 7,
        chapterName: 'Addition up to 10',
        chapterNameNepali: 'योगफल १० सम्म आउने जोड',
        simulationType: 'THREE_JS',
        componentKey: 'class1-math-ch7-playground',
        runtimeUrl: '/simulations/class1-math/ch7/playground',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Understand addition as combining two groups of objects',
          'Count objects in Group A, Group B, and find the combined total',
          'Connect physical grouping with the addition equation A + B = Total',
          'Discover addition with zero (A + 0 = A)',
        ],
        learningObjectivesNepali: [
          'दुई समूहका वस्तुहरूलाई एकै ठाउँमा मिसाएर जोडको अवधारणा बुझ्ने',
          'समूह क र समूह ख का वस्तुहरू गनेर जम्मा योगफल पत्ता लगाउने',
          'वस्तुहरूको मिश्रणलाई गणितीय वाक्य क + ख = जम्मासँग जोड्ने',
          'शून्यको जोडको नियम बुझ्ने (क + ० = क)',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 7', 'Addition', 'Playground', '3D WebGL'],
      },
      {
        code: 'SIM-MATH-G1-CH7-02',
        title: 'Make the Total',
        titleNepali: 'जम्मा सङ्ख्या पत्ता लगाऔँ',
        description:
          'Solve picture-based addition activities across village markets and gardens, counting both groups and identifying the combined total.',
        descriptionNepali:
          'बगैँचा र बजारका दृश्यहरू हेरी दुई समूहका वस्तुहरू गनेर जम्मा योगफल पत्ता लगाउने चित्रमा आधारित जोडको अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 7,
        chapterName: 'Addition up to 10',
        chapterNameNepali: 'योगफल १० सम्म आउने जोड',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch7-make-total',
        runtimeUrl: '/simulations/class1-math/ch7/make-total',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Interpret pictorial addition scenes with authentic everyday objects',
          'Count two separate groups in a scene (e.g., perched birds + arriving birds)',
          'Select and verify the total quantity up to 10',
        ],
        learningObjectivesNepali: [
          'चित्रमा आधारित जोडका दृश्यहरू बुझेर वस्तुहरू गन्ने',
          'दुई छुट्टाछुट्टै समूहका वस्तुहरू गनेर जम्मा सङ्ख्या पत्ता लगाउने',
          '१० सम्मको जम्मा योगफल पहिचान गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 7', 'Make Total', 'Pictures', 'Visual Addition'],
      },
      {
        code: 'SIM-MATH-G1-CH7-03',
        title: 'Number Bond Houses',
        titleNepali: 'सङ्ख्याका घरहरू',
        description:
          'Explore colourful number houses to discover pairs and combinations that make 5, 6, 7, 8, 9, and 10 with interactive room distributions.',
        descriptionNepali:
          '५, ६, ७, ८, ९ र १० योगफल आउने विभिन्न सङ्ख्याका जोडीहरू घरका कोठाहरूमा वस्तु राखेर पत्ता लगाउने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 7,
        chapterName: 'Addition up to 10',
        chapterNameNepali: 'योगफल १० सम्म आउने जोड',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch7-number-houses',
        runtimeUrl: '/simulations/class1-math/ch7/number-houses',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Explore number combinations that sum to 5, 6, 7, 8, 9, and 10',
          'Distribute objects across two rooms in a number house',
          'Solve missing-part puzzles (Part A + ? = Total)',
        ],
        learningObjectivesNepali: [
          '५, ६, ७, ८, ९ र १० योगफल आउने सङ्ख्याका जोडीहरू पत्ता लगाउने',
          'घरका दुई कोठामा वस्तुहरू विभाजन गरी जोडी बनाउने',
          'खाली कोठामा कति चाहिन्छ पत्ता लगाउने चुनौती हल गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 7', 'Number Bonds', 'Make 5', 'Make 10', 'Partitions'],
      },
      {
        code: 'SIM-MATH-G1-CH7-04',
        title: 'Count On Adventure',
        titleNepali: 'गनेर जोडौँ',
        description:
          'Learn the counting-on addition strategy on a stepping-stone path, starting at the first number and stepping forward to find the total.',
        descriptionNepali:
          'सङ्ख्या ढुङ्गाहरूमा पहिलो सङ्ख्याबाट अगाडि पाइला चाल्दै सजिलै जोड गर्ने गन्ती विधि (Counting-on) सिक्नुहोस्।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 7,
        chapterName: 'Addition up to 10',
        chapterNameNepali: 'योगफल १० सम्म आउने जोड',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch7-count-on',
        runtimeUrl: '/simulations/class1-math/ch7/count-on',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Master counting-on as an efficient addition strategy',
          'Start at the first number and count forward by the second number',
          'Reinforce addition concepts without recounting from 1 every time',
        ],
        learningObjectivesNepali: [
          'पहिलो सङ्ख्याबाट अगाडि गन्दै जाने सजिलो जोड विधि सिक्ने',
          'सुरुदेखि सबै नगनी पहिलो सङ्ख्याबाट थप पाइला चाल्ने',
          '१० सम्मका जोडहरू आत्मविश्वासका साथ हल गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 7', 'Counting On', 'Addition Strategy', 'Path'],
      },
      {
        code: 'SIM-MATH-G1-CH7-05',
        title: 'Addition Equation Studio',
        titleNepali: 'जोडका वाक्य बनाऔँ',
        description:
          'Connect real-world object groups with the mathematical symbols plus (+) and equals (=) to build simple addition sentences.',
        descriptionNepali:
          'वस्तुहरूको समूहलाई जोड (+) र बराबर (=) चिन्हसँग जोडेर सही गणितीय वाक्य बनाउने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 7,
        chapterName: 'Addition up to 10',
        chapterNameNepali: 'योगफल १० सम्म आउने जोड',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch7-equation-studio',
        runtimeUrl: '/simulations/class1-math/ch7/equation-studio',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Understand the purpose and meaning of the plus sign (+)',
          'Understand the purpose and meaning of the equals sign (=)',
          'Construct complete addition equations (A + B = C) from visual groups',
          'Complete missing number sentences within sums up to 10',
        ],
        learningObjectivesNepali: [
          'जोड चिन्ह (+) को अर्थ र प्रयोग बुझ्ने',
          'बराबर चिन्ह (=) को अर्थ र प्रयोग बुझ्ने',
          'वस्तुहरूको चित्रबाट गणितीय वाक्य (क + ख = ग) निर्माण गर्ने',
          '१० सम्मका खाली ठाउँ भर्ने गणितीय वाक्य पूरा गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 7', 'Equations', 'Plus Sign', 'Equals Sign', 'Studio'],
      },
    ];

    for (const sim of class1MathCh7Sims) {
      await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: sim },
        { upsert: true, new: true }
      );
    }
    console.log('Verified registration of Class 1 Mathematics Chapter 7 simulations.');

    // Class 1 Mathematics - Chapter 8: Subtraction up to 10 (१० सम्मका सङ्ख्याहरूको घटाउ)
    const class1MathCh8Sims = [
      {
        code: 'SIM-MATH-G1-CH8-01',
        title: 'Subtraction Playground',
        titleNepali: 'घटाउ खेलमैदान',
        description:
          'Teach the basic meaning of subtraction through physically removing objects from a 3D group into a removal basket and discovering the remainder.',
        descriptionNepali:
          '३डी खेलमैदानमा वस्तुहरूको समूहबाट केही वस्तु हटाएर बाँकी सङ्ख्या पत्ता लगाउने र घटाउको आधारभूत अवधारणा बुझ्ने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 8,
        chapterName: 'Subtraction up to 10',
        chapterNameNepali: '१० सम्मका सङ्ख्याहरूको घटाउ',
        simulationType: 'THREE_JS',
        componentKey: 'class1-math-ch8-playground',
        runtimeUrl: '/simulations/class1-math/ch8/playground',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Understand subtraction as physically taking away objects from a collection',
          'Count the initial set, removed items, and remaining items',
          'Recognize that subtracting zero leaves the group unchanged (A - 0 = A)',
          'Connect physical removal to the equation A - B = Remainder',
        ],
        learningObjectivesNepali: [
          'समूहबाट वस्तु हटाएर घटाउको वास्तविक अवधारणा बुझ्ने',
          'सुरुको सङ्ख्या, हटाइएका वस्तु र बाँकी रहेका वस्तु गन्ने',
          'शून्य घटाउँदा सङ्ख्यामा परिवर्तन हुँदैन भनी बुझ्ने (क - ० = क)',
          'वस्तु हटाउने कार्यलाई गणितीय वाक्य क - ख = बाँकीसँग जोड्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 8', 'Subtraction', 'Playground', '3D WebGL'],
      },
      {
        code: 'SIM-MATH-G1-CH8-02',
        title: 'Empty the Basket Adventure',
        titleNepali: 'टोकरी खाली गर्ने साहसिक खेल',
        description:
          'Help students understand subtraction through removing objects from containers (baskets, toy boxes, nests) and counting what remains.',
        descriptionNepali:
          'टोकरी, खेलौना बाकस र गुँडबाट वस्तु हटाउँदै बाँकी सङ्ख्या गनेर घटाउ सिक्ने साहसिक खेल।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 8,
        chapterName: 'Subtraction up to 10',
        chapterNameNepali: '१० सम्मका सङ्ख्याहरूको घटाउ',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch8-basket-adventure',
        runtimeUrl: '/simulations/class1-math/ch8/basket-adventure',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Remove items from authentic containers (fruit baskets, toy boxes, bird nests)',
          'Observe dynamic departures (birds flying away, toys given away)',
          'Formulate subtraction equations within 10',
        ],
        learningObjectivesNepali: [
          'विभिन्न भाँडा र टोकरीहरूबाट वस्तु निकालेर बाँकी गन्ने',
          'गतिशील दृश्यहरू (चरा उडेर जाने, खेलौना बाँड्ने) अवलोकन गर्ने',
          '१० सम्मका घटाउका गणितीय वाक्य निर्माण गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 8', 'Containers', 'Basket', 'Removal'],
      },
      {
        code: 'SIM-MATH-G1-CH8-03',
        title: 'Subtraction Equation Studio',
        titleNepali: 'घटाउ वाक्य निर्माण प्रयोगशाला',
        description:
          'Convert visual subtraction into horizontal and vertical equations, place minus (−) and equals (=) signs, and solve missing-number challenges.',
        descriptionNepali:
          'चित्रमा आधारित घटाउलाई तेर्सो र ठाडो गणितीय वाक्यमा रूपान्तरण गर्ने, घटाउ (−) र बराबर (=) चिन्ह राख्ने प्रयोगशाला।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 8,
        chapterName: 'Subtraction up to 10',
        chapterNameNepali: '१० सम्मका सङ्ख्याहरूको घटाउ',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch8-equation-studio',
        runtimeUrl: '/simulations/class1-math/ch8/equation-studio',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Connect the minus symbol (−) with the subtraction process',
          'Understand both horizontal and vertical subtraction layouts',
          'Solve missing number puzzles (A - ? = C and ? - B = C)',
        ],
        learningObjectivesNepali: [
          'घटाउ चिन्ह (−) को सही पहिचान र प्रयोग गर्ने',
          'तेर्सो र ठाडो दुवै ढाँचाका घटाउ वाक्यहरू बुझ्ने',
          'खाली ठाउँ भर्ने घटाउका समस्याहरू समाधान गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 8', 'Equations', 'Vertical Subtraction', 'Missing Numbers'],
      },
      {
        code: 'SIM-MATH-G1-CH8-04',
        title: 'More or Less – Difference Explorer',
        titleNepali: 'बढी र कम पत्ता लगाऔँ',
        description:
          'Compare two groups of objects using one-to-one matching to find how many more or fewer objects one group contains (numerical difference).',
        descriptionNepali:
          'दुई समूहका वस्तुहरूलाई जोडा मिलाएर तुलना गर्दै कुनमा कति बढी वा कम छन् भनी संख्यात्मक फरक पत्ता लगाउने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 8,
        chapterName: 'Subtraction up to 10',
        chapterNameNepali: '१० सम्मका सङ्ख्याहरूको घटाउ',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch8-difference-explorer',
        runtimeUrl: '/simulations/class1-math/ch8/difference-explorer',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Understand subtraction as comparison and numerical difference',
          'Use one-to-one pairing between two groups to isolate the difference',
          'Answer "How many more?" and "How many fewer?" questions',
        ],
        learningObjectivesNepali: [
          'दुई समूहको तुलना गरेर संख्यात्मक फरक (Difference) निकाल्ने',
          'एक-एक जोडा मिलाएर बाँकी रहेका बढी वस्तुहरू पत्ता लगाउने',
          '"कति बढी?" र "कति कम?" का प्रश्नहरू आत्मविश्वासका साथ हल गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 8', 'Difference', 'Comparison', 'More or Less'],
      },
      {
        code: 'SIM-MATH-G1-CH8-05',
        title: 'Subtraction Challenge World',
        titleNepali: 'घटाउ चुनौती संसार',
        description:
          'Explore 5 village challenge stations (Fruit Shop, Bird Garden, Toy House, Flower Garden, Challenge Station) to solve mixed subtraction problems within 10.',
        descriptionNepali:
          'गाउँका ५ चुनौती केन्द्रहरू घुम्दै वस्तु हटाउने, शून्य घटाउने, ठाडो घटाउ र फरक पत्ता लगाउने विविध अभ्यासहरू हल गर्नुहोस्।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 8,
        chapterName: 'Subtraction up to 10',
        chapterNameNepali: '१० सम्मका सङ्ख्याहरूको घटाउ',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch8-challenge-world',
        runtimeUrl: '/simulations/class1-math/ch8/challenge-world',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Apply diverse subtraction strategies across 5 authentic village stations',
          'Solve mixed removal, zero-subtraction, and difference questions',
          'Achieve chapter mastery with persistent progress tracking',
        ],
        learningObjectivesNepali: [
          'गाउँका ५ विविध केन्द्रहरूमा घटाउका सिपहररू व्यवहारिक रूपमा प्रयोग गर्ने',
          'वस्तु हटाउने, शून्यको घटाउ र फरक निकाल्ने विविध प्रश्नहरू हल गर्ने',
          'मूल्याङ्कनमा सफलता प्राप्त गरी प्रगति विवरण सुरक्षित गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 8', 'Challenge', 'Village Stations', 'Assessment'],
      },
    ];

    for (const sim of class1MathCh8Sims) {
      await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: sim },
        { upsert: true, new: true }
      );
    }
    console.log('Verified registration of Class 1 Mathematics Chapter 8 simulations.');

    // Class 1 Mathematics - Chapter 9: Numbers 11 to 20 (११ देखि २० सम्मका सङ्ख्याहरू)
    const class1MathCh9Sims = [
      {
        code: 'SIM-MATH-G1-CH9-01',
        title: 'Number Garden 11–20',
        titleNepali: '११ देखि २० सम्मको सङ्ख्या बगैँचा',
        description:
          'Count apples, flowers, leaves, and butterflies in a 3D garden to discover and recognize quantities from 11 to 20 with dual numerals.',
        descriptionNepali:
          '३डी बगैँचामा ११ देखि २० सम्मका स्याउ, फूल, पात र पुतलीहरू गन्दै सङ्ख्या र देवनागरी अङ्कहरू पहिचान गर्ने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 9,
        chapterName: 'Numbers 11 to 20',
        chapterNameNepali: '११ देखि २० सम्मका सङ्ख्याहरू',
        simulationType: 'THREE_JS',
        componentKey: 'class1-math-ch9-garden',
        runtimeUrl: '/simulations/class1-math/ch9/garden',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Count collections of objects from 11 to 20 accurately without omission',
          'Recognize numerals 11–20 and Devanagari ११–२०',
          'Match counted quantities with corresponding numeral cards',
          'Read spoken number names from Eleven (एघार) to Twenty (बीस)',
        ],
        learningObjectivesNepali: [
          '११ देखि २० सम्मका वस्तुहरू नछुटाई शुद्ध रूपमा गन्ने',
          'अङ्क ११ देखि २० र देवनागरी ११ देखि २० पहिचान गर्ने',
          'गनेका वस्तुहरूलाई सही सङ्ख्या कार्डसँग जोडा मिलाउने',
          'एघार देखि बीससम्मका सङ्ख्याका नामहरू सुन्ने र बोल्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 9', 'Numbers 11-20', 'Counting', 'Garden', '3D WebGL'],
      },
      {
        code: 'SIM-MATH-G1-CH9-02',
        title: 'Make a Group of Ten',
        titleNepali: 'दशको समूह बनाऔँ',
        description:
          'Group ten objects together to form a ten-bundle, add individual ones, and understand how numbers from 11 to 20 are constructed (10 + N).',
        descriptionNepali:
          '१० वटा वस्तुको एउटा समूह बनाएर थप एकाइ जोड्दै ११ देखि २० सम्मका सङ्ख्याहरू कसरी बन्छन् भनी बुझ्ने आधारभूत अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 9,
        chapterName: 'Numbers 11 to 20',
        chapterNameNepali: '११ देखि २० सम्मका सङ्ख्याहरू',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch9-group-ten',
        runtimeUrl: '/simulations/class1-math/ch9/group-ten',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Group 10 loose units into a single ten-bundle',
          'Observe that 11–19 consist of 1 group of ten plus additional single units',
          'Understand that 20 consists of 2 complete groups of ten',
        ],
        learningObjectivesNepali: [
          '१० वटा छुट्टाछुट्टै वस्तुलाई एकमुष्ट दशको समूह बनाउने',
          '११ देखि १९ सम्मका सङ्ख्यामा १ दश र थप एकाइ हुन्छन् भनी बुझ्ने',
          '२० मा दशका २ वटा पूर्ण समूह हुन्छन् भनी प्रयोगात्मक रूपमा सिक्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 9', 'Group of Ten', 'Tens and Ones', '10 Plus N'],
      },
      {
        code: 'SIM-MATH-G1-CH9-03',
        title: 'Tens and Ones Explorer',
        titleNepali: 'दहाइ र एकाइ पत्ता लगाऔँ',
        description:
          'Explore place value for numbers 11–20 using ten-unit rods (दहाइ) and unit cubes (एकाइ) on an interactive classroom board.',
        descriptionNepali:
          'दहाइ (१० को छड) र एकाइ (छुट्टाटुट्टै क्युब) को प्रयोग गरी ११ देखि २० सम्मका सङ्ख्याहरूको स्थानमान बुझ्ने अभ्यास।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 9,
        chapterName: 'Numbers 11 to 20',
        chapterNameNepali: '११ देखि २० सम्मका सङ्ख्याहरू',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch9-tens-ones',
        runtimeUrl: '/simulations/class1-math/ch9/tens-ones',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Identify the number of tens and ones in numbers from 11 to 20',
          'Place ten-rods in the Tens column and single cubes in the Ones column',
          'Connect 1 Ten + 6 Ones with the numeral 16 (१६)',
        ],
        learningObjectivesNepali: [
          '११ देखि २० सम्मका सङ्ख्यामा कति दहाइ र कति एकाइ छन् छुट्याउने',
          'दहाइको कोठामा १० को छड र एकाइको कोठामा क्युबहरू मिलाउने',
          '१ दहाइ र ६ एकाइ मिलेर १६ बन्छ भनी गणितीय सम्बन्ध बुझ्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 9', 'Place Value', 'Tens', 'Ones', 'Dahai Ekai'],
      },
      {
        code: 'SIM-MATH-G1-CH9-04',
        title: 'Number Line Adventure',
        titleNepali: 'सङ्ख्यारेखाको साहसिक यात्रा',
        description:
          'Navigate a 3D stepping-stone number line from 0 to 20 to master number before, after, between, and missing numbers in sequence.',
        descriptionNepali:
          '० देखि २० सम्मको सङ्ख्यारेखामा अगाडिको, पछाडिको र बीचको सङ्ख्या तथा खाली क्रम पत्ता लगाउने साहसिक यात्रा।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 9,
        chapterName: 'Numbers 11 to 20',
        chapterNameNepali: '११ देखि २० सम्मका सङ्ख्याहरू',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch9-number-line',
        runtimeUrl: '/simulations/class1-math/ch9/number-line',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Locate numerals 11 to 20 on an interactive number line',
          'Identify the number before and after a given number (e.g. before 15 is 14)',
          'Identify the number between two given numbers (e.g. between 12 and 14 is 13)',
          'Complete missing sequence gaps on the number path',
        ],
        learningObjectivesNepali: [
          'सङ्ख्यारेखामा ११ देखि २० सम्मका सङ्ख्याहरूको स्थान पहिचान गर्ने',
          'कुनै सङ्ख्याको ठीक अगाडि र ठीक पछाडिको सङ्ख्या पत्ता लगाउने',
          'दुई सङ्ख्याको ठीक बीचमा पर्ने सङ्ख्या पहिचान गर्ने',
          'क्रममा छुटेका खाली सङ्ख्याहरू भर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 9', 'Number Line', 'Before After', 'Sequence'],
      },
      {
        code: 'SIM-MATH-G1-CH9-05',
        title: 'Number Ordering and Challenge World',
        titleNepali: 'सङ्ख्या मिलाउने चुनौती संसार',
        description:
          'Explore 5 village challenge stations to master Nepali number names (एघार to बीस), smallest/largest comparison, and ascending/descending order.',
        descriptionNepali:
          'गाउँका ५ केन्द्रहरूमा सङ्ख्याका नाम (एघार देखि बीस), सानो/ठूलो तुलना र बढ्दो/घट्दो क्रम मिलाउने विविध चुनौतीहरू।',
        subjectCode: 'MATH',
        subjectName: 'Mathematics',
        gradeLevels: [1],
        chapterNumber: 9,
        chapterName: 'Numbers 11 to 20',
        chapterNameNepali: '११ देखि २० सम्मका सङ्ख्याहरू',
        simulationType: 'HTML5_CANVAS',
        componentKey: 'class1-math-ch9-challenge-world',
        runtimeUrl: '/simulations/class1-math/ch9/challenge-world',
        difficulty: 'BEGINNER',
        estimatedDurationMinutes: 15,
        learningObjectives: [
          'Match numerals with Nepali written number names (एघार to बीस)',
          'Identify smallest and largest numbers in a group of 4 cards',
          'Arrange numbers 11–20 in ascending and descending orders',
          'Complete mixed sequence challenges with progress persistence',
        ],
        learningObjectivesNepali: [
          'सङ्ख्यालाई अक्षरेपी नाम (एघार देखि बीस) सँग जोडा मिलाउने',
          'चारवटा सङ्ख्याको समूहबाट सबैभन्दा सानो र ठूलो सङ्ख्या पत्ता लगाउने',
          'सङ्ख्याहरूलाई बढ्दो (सानोदेखि ठूलो) र घट्दो क्रममा मिलाउने',
          'मूल्याङ्कनमा सफलता प्राप्त गरी प्रगति सुरक्षित गर्ने',
        ],
        isPublished: true,
        currentVersion: '1.0.0',
        tags: ['Class 1', 'Mathematics', 'Chapter 9', 'Number Names', 'Ordering', 'Ascending', 'Challenge'],
      },
    ];

    for (const sim of class1MathCh9Sims) {
      await Simulation.findOneAndUpdate(
        { code: sim.code },
        { $set: sim },
        { upsert: true, new: true }
      );
    }
    console.log('Verified registration of Class 1 Mathematics Chapter 9 simulations.');

    const actCount = await Activity.countDocuments();
    if (actCount === 0) {
      console.log('Seeding initial interactive activities...');
      // 1. MCQ Activity
      await this.createActivity(
        {
          code: 'ACT-SCI-G8-CIRCUIT',
          title: "Electric Circuit & Ohm's Law Quiz",
          titleNepali: 'विद्युत परिपथ र ओमको नियम प्रश्नोत्तरी',
          description: 'Assess understanding of electric potential, resistance, and current flow.',
          type: 'MCQ',
          gradeLevels: [6, 7, 8, 9, 10],
          subjectCode: 'SCI',
          chapterNumber: 4,
          totalMarks: 5,
          passingScore: 3,
          timeLimitMinutes: 10,
          isPublished: true,
        },
        [
          {
            questionNumber: 1,
            type: 'MCQ',
            prompt: 'According to Ohm’s Law, what is the formula to calculate current (I)?',
            promptNepali: 'ओमको नियम अनुसार विद्युत प्रवाह (I) निकाल्ने सुत्र कुन हो?',
            points: 1,
            explanation: "Ohm's Law states I = V / R.",
            data: {
              options: [
                { id: 'opt1', text: 'I = V / R', isCorrect: true },
                { id: 'opt2', text: 'I = V × R', isCorrect: false },
                { id: 'opt3', text: 'I = R / V', isCorrect: false },
                { id: 'opt4', text: 'I = V + R', isCorrect: false },
              ],
            },
          },
          {
            questionNumber: 2,
            type: 'MCQ',
            prompt: 'What is the SI unit of electrical resistance?',
            promptNepali: 'विद्युत प्रतिरोधको SI एकाइ के हो?',
            points: 1,
            explanation: 'The SI unit of resistance is the Ohm (Ω).',
            data: {
              options: [
                { id: 'opt1', text: 'Volt (V)', isCorrect: false },
                { id: 'opt2', text: 'Ampere (A)', isCorrect: false },
                { id: 'opt3', text: 'Ohm (Ω)', isCorrect: true },
                { id: 'opt4', text: 'Watt (W)', isCorrect: false },
              ],
            },
          },
        ]
      );

      // 2. Matching Pairs Activity
      await this.createActivity(
        {
          code: 'ACT-BIO-G7-ORGANELLE',
          title: 'Cell Organelles Matching Exercise',
          titleNepali: 'कोषका अंगहरू र तिनका कार्य जोडा मिलाउनुहोस्',
          description: 'Match cell organelle names with their primary physiological roles.',
          type: 'MATCHING',
          gradeLevels: [6, 7, 8, 9],
          subjectCode: 'SCI',
          chapterNumber: 3,
          totalMarks: 4,
          passingScore: 2,
          timeLimitMinutes: 10,
          isPublished: true,
        },
        [
          {
            questionNumber: 1,
            type: 'MATCHING',
            prompt: 'Match each organelle on the left with its biological function on the right:',
            points: 4,
            explanation: 'Mitochondria = Powerhouse, Chloroplast = Photosynthesis, Nucleus = Genetic Control, Cell Wall = Structure.',
            data: {
              pairs: [
                { id: 'p1', left: 'Mitochondria', right: 'Powerhouse (ATP Generation)' },
                { id: 'p2', left: 'Chloroplast', right: 'Photosynthesis' },
                { id: 'p3', left: 'Nucleus', right: 'Master Genetic Control' },
                { id: 'p4', left: 'Cell Wall', right: 'Rigid Cellulose Support' },
              ],
            },
          },
        ]
      );

      // 3. Drag and Drop Activity
      await this.createActivity(
        {
          code: 'ACT-SCI-G6-SORT',
          title: 'Plant vs Animal Cell Component Classification',
          titleNepali: 'वनस्पति र जनावर कोषका विशेषता वर्गीकरण',
          description: 'Drag cellular parts into the appropriate category bin.',
          type: 'DRAG_DROP',
          gradeLevels: [6, 7, 8],
          subjectCode: 'SCI',
          chapterNumber: 3,
          totalMarks: 4,
          passingScore: 2,
          timeLimitMinutes: 8,
          isPublished: true,
        },
        [
          {
            questionNumber: 1,
            type: 'DRAG_DROP',
            prompt: 'Drag each organelle into its correct category (Plant Only, Animal Only, or Both):',
            points: 4,
            explanation: 'Chloroplast and Cell Wall are unique to plants, while Nucleus and Mitochondria exist in both.',
            data: {
              categories: [
                { id: 'PLANT', title: 'Plant Cells Only (वनस्पति मात्र)' },
                { id: 'BOTH', title: 'Both Plant & Animal (दुवैमा पाइने)' },
              ],
              items: [
                { id: 'it1', text: 'Chloroplast (हरितकण)', correctCategory: 'PLANT' },
                { id: 'it2', text: 'Cell Wall (कोष भित्ति)', correctCategory: 'PLANT' },
                { id: 'it3', text: 'Nucleus (केन्द्रक)', correctCategory: 'BOTH' },
                { id: 'it4', text: 'Mitochondria (माइटोकोन्ड्रिया)', correctCategory: 'BOTH' },
              ],
            },
          },
        ]
      );

      // 4. Fill in the Blanks Activity
      await this.createActivity(
        {
          code: 'ACT-MATH-G4-FILL',
          title: 'Fraction Vocabulary & Concepts',
          titleNepali: 'भिन्न सम्बन्धी खाली ठाउँ भर्ने अभ्यास',
          description: 'Fill in missing fraction terms in English or Nepali.',
          type: 'FILL_BLANKS',
          gradeLevels: [3, 4, 5],
          subjectCode: 'MTH',
          chapterNumber: 3,
          totalMarks: 2,
          passingScore: 1,
          timeLimitMinutes: 5,
          isPublished: true,
        },
        [
          {
            questionNumber: 1,
            type: 'FILL_BLANKS',
            prompt: 'Fill in the blanks with the correct mathematical terms:',
            points: 2,
            explanation: 'The top number is numerator, bottom number is denominator.',
            data: {
              template: 'In a fraction, the top number is called the [blank1] and the bottom number is called the [blank2].',
              blanks: [
                { id: 'blank1', acceptedAnswers: ['numerator', 'अंश'] },
                { id: 'blank2', acceptedAnswers: ['denominator', 'हर'] },
              ],
            },
          },
        ]
      );

      // 5. Numerical Question Activity
      await this.createActivity(
        {
          code: 'ACT-PHY-G9-NUMERICAL',
          title: "Ohm's Law Numerical Calculations",
          titleNepali: 'ओमको नियम गणितीय समस्याहरू',
          description: 'Solve real circuit problems calculating voltage, current and resistance.',
          type: 'NUMERICAL',
          gradeLevels: [8, 9, 10],
          subjectCode: 'SCI',
          chapterNumber: 4,
          totalMarks: 2,
          passingScore: 1,
          timeLimitMinutes: 10,
          isPublished: true,
        },
        [
          {
            questionNumber: 1,
            type: 'NUMERICAL',
            prompt:
              'A light bulb has a resistance of 20 Ω and is connected across a 10 V battery. Calculate the current (I) in Amperes.',
            promptNepali: '२० ओम प्रतिरोध भएको चिमलाई १० भोल्टको ब्याट्रीमा जोड्दा कति एम्पियर विद्युत प्रवाह हुन्छ?',
            points: 2,
            explanation: 'I = V / R = 10 / 20 = 0.5 A.',
            data: {
              unit: 'A',
              correctValue: 0.5,
              tolerance: 0.05,
              formulaSteps: 'I = V / R => I = 10 / 20 = 0.5 Amperes',
            },
          },
        ]
      );

      // 6. Ordering Activity
      await this.createActivity(
        {
          code: 'ACT-SCI-G5-ORDER',
          title: 'Water Cycle Steps in Correct Sequence',
          titleNepali: 'जल चक्रका चरणहरू सही क्रममा मिलाउनुहोस्',
          description: 'Arrange the stages of the Himalayan water cycle from start to finish.',
          type: 'ORDERING',
          gradeLevels: [4, 5, 6],
          subjectCode: 'SCI',
          chapterNumber: 2,
          totalMarks: 3,
          passingScore: 2,
          timeLimitMinutes: 6,
          isPublished: true,
        },
        [
          {
            questionNumber: 1,
            type: 'ORDERING',
            prompt: 'Arrange the stages of the Water Cycle in order starting from evaporation:',
            points: 3,
            explanation: 'Evaporation -> Condensation -> Precipitation -> River Runoff.',
            data: {
              items: [
                { id: 'ord1', text: '1. Evaporation from rivers & lakes (वाष्पीकरण)', correctOrder: 1 },
                { id: 'ord2', text: '2. Condensation forming clouds (वाष्प सङ्कलन र बादल)', correctOrder: 2 },
                { id: 'ord3', text: '3. Precipitation as rain/snow (वर्षा र हिमपात)', correctOrder: 3 },
                { id: 'ord4', text: '4. Surface runoff flowing back to rivers (नदी प्रवाह)', correctOrder: 4 },
              ],
            },
          },
        ]
      );

      console.log('Seeded 6 interactive activities successfully.');
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // CENTRALIZED SIMULATION LIBRARY HIERARCHY
  // ══════════════════════════════════════════════════════════════════
  static async getLibraryHierarchy() {
    // 1. Fetch all published simulations from database to get real counts
    const allSims = await Simulation.find({ isPublished: true }).lean();

    // 2. Define Nepal CDC standard subjects configuration per level/grade
    const standardSubjectsByGrade: Record<number, Array<{ code: string; name: string; nameNepali: string; icon: string }>> = {
      1: [
        { code: 'MATH', name: 'Mathematics', nameNepali: 'गणित', icon: 'Calculator' },
        { code: 'SCI', name: 'Environmental Studies', nameNepali: 'हाम्रो सेरोफेरो', icon: 'Compass' },
        { code: 'NEP', name: 'Nepali', nameNepali: 'मेरो नेपाली', icon: 'BookOpen' },
        { code: 'ENG', name: 'English', nameNepali: 'My English', icon: 'Languages' },
      ],
      2: [
        { code: 'MATH', name: 'Mathematics', nameNepali: 'गणित', icon: 'Calculator' },
        { code: 'SCI', name: 'Environmental Studies', nameNepali: 'हाम्रो सेरोफेरो', icon: 'Compass' },
        { code: 'NEP', name: 'Nepali', nameNepali: 'मेरो नेपाली', icon: 'BookOpen' },
        { code: 'ENG', name: 'English', nameNepali: 'My English', icon: 'Languages' },
      ],
      3: [
        { code: 'MATH', name: 'Mathematics', nameNepali: 'गणित', icon: 'Calculator' },
        { code: 'SCI', name: 'Environmental Studies', nameNepali: 'हाम्रो सेरोफेरो', icon: 'Compass' },
        { code: 'NEP', name: 'Nepali', nameNepali: 'मेरो नेपाली', icon: 'BookOpen' },
        { code: 'ENG', name: 'English', nameNepali: 'My English', icon: 'Languages' },
      ],
      4: [
        { code: 'MATH', name: 'Mathematics', nameNepali: 'गणित', icon: 'Calculator' },
        { code: 'SCI', name: 'Science & Technology', nameNepali: 'विज्ञान तथा प्रविधि', icon: 'Atom' },
        { code: 'SOC', name: 'Social Studies', nameNepali: 'सामाजिक अध्ययन', icon: 'Globe' },
        { code: 'NEP', name: 'Nepali', nameNepali: 'नेपाली', icon: 'BookOpen' },
        { code: 'ENG', name: 'English', nameNepali: 'English', icon: 'Languages' },
      ],
      5: [
        { code: 'MATH', name: 'Mathematics', nameNepali: 'गणित', icon: 'Calculator' },
        { code: 'SCI', name: 'Science & Technology', nameNepali: 'विज्ञान तथा प्रविधि', icon: 'Atom' },
        { code: 'SOC', name: 'Social Studies', nameNepali: 'सामाजिक अध्ययन', icon: 'Globe' },
        { code: 'NEP', name: 'Nepali', nameNepali: 'नेपाली', icon: 'BookOpen' },
        { code: 'ENG', name: 'English', nameNepali: 'English', icon: 'Languages' },
      ],
      6: [
        { code: 'SCI', name: 'Science & Technology', nameNepali: 'विज्ञान तथा प्रविधि', icon: 'Atom' },
        { code: 'MATH', name: 'Mathematics', nameNepali: 'गणित', icon: 'Calculator' },
        { code: 'COM', name: 'Computer Education', nameNepali: 'कम्प्युटर शिक्षा', icon: 'Binary' },
        { code: 'SOC', name: 'Social Studies', nameNepali: 'सामाजिक अध्ययन', icon: 'Globe' },
        { code: 'NEP', name: 'Nepali', nameNepali: 'नेपाली', icon: 'BookOpen' },
        { code: 'ENG', name: 'English', nameNepali: 'English', icon: 'Languages' },
      ],
      7: [
        { code: 'SCI', name: 'Science & Technology', nameNepali: 'विज्ञान तथा प्रविधि', icon: 'Atom' },
        { code: 'MATH', name: 'Mathematics', nameNepali: 'गणित', icon: 'Calculator' },
        { code: 'COM', name: 'Computer Education', nameNepali: 'कम्प्युटर शिक्षा', icon: 'Binary' },
        { code: 'SOC', name: 'Social Studies', nameNepali: 'सामाजिक अध्ययन', icon: 'Globe' },
        { code: 'NEP', name: 'Nepali', nameNepali: 'नेपाली', icon: 'BookOpen' },
        { code: 'ENG', name: 'English', nameNepali: 'English', icon: 'Languages' },
      ],
      8: [
        { code: 'SCI', name: 'Science & Technology', nameNepali: 'विज्ञान तथा प्रविधि', icon: 'Atom' },
        { code: 'MATH', name: 'Mathematics', nameNepali: 'गणित', icon: 'Calculator' },
        { code: 'COM', name: 'Computer Education', nameNepali: 'कम्प्युटर शिक्षा', icon: 'Binary' },
        { code: 'SOC', name: 'Social Studies', nameNepali: 'सामाजिक अध्ययन', icon: 'Globe' },
        { code: 'NEP', name: 'Nepali', nameNepali: 'नेपाली', icon: 'BookOpen' },
        { code: 'ENG', name: 'English', nameNepali: 'English', icon: 'Languages' },
      ],
      9: [
        { code: 'SCI', name: 'Science & Technology', nameNepali: 'विज्ञान तथा प्रविधि', icon: 'Atom' },
        { code: 'MATH', name: 'Compulsory Mathematics', nameNepali: 'अनिवार्य गणित', icon: 'Calculator' },
        { code: 'COM', name: 'Computer Science', nameNepali: 'कम्प्युटर विज्ञान', icon: 'Binary' },
        { code: 'SOC', name: 'Social Studies', nameNepali: 'सामाजिक अध्ययन', icon: 'Globe' },
        { code: 'ENG', name: 'English', nameNepali: 'English', icon: 'Languages' },
        { code: 'NEP', name: 'Nepali', nameNepali: 'नेपाली', icon: 'BookOpen' },
      ],
      10: [
        { code: 'SCI', name: 'Science & Technology', nameNepali: 'विज्ञान तथा प्रविधि', icon: 'Atom' },
        { code: 'MATH', name: 'Compulsory Mathematics', nameNepali: 'अनिवार्य गणित', icon: 'Calculator' },
        { code: 'COM', name: 'Computer Science', nameNepali: 'कम्प्युटर विज्ञान', icon: 'Binary' },
        { code: 'SOC', name: 'Social Studies', nameNepali: 'सामाजिक अध्ययन', icon: 'Globe' },
        { code: 'ENG', name: 'English', nameNepali: 'English', icon: 'Languages' },
        { code: 'NEP', name: 'Nepali', nameNepali: 'नेपाली', icon: 'BookOpen' },
      ],
      11: [
        { code: 'PHY', name: 'Physics', nameNepali: 'भौतिक विज्ञान', icon: 'Zap' },
        { code: 'CHEM', name: 'Chemistry', nameNepali: 'रसायन विज्ञान', icon: 'FlaskConical' },
        { code: 'BIO', name: 'Biology', nameNepali: 'जीव विज्ञान', icon: 'Dna' },
        { code: 'MATH', name: 'Mathematics', nameNepali: 'गणित', icon: 'Calculator' },
        { code: 'COM', name: 'Computer Science', nameNepali: 'कम्प्युटर विज्ञान', icon: 'Binary' },
        { code: 'ENG', name: 'English', nameNepali: 'English', icon: 'Languages' },
        { code: 'NEP', name: 'Nepali', nameNepali: 'नेपाली', icon: 'BookOpen' },
      ],
      12: [
        { code: 'PHY', name: 'Physics', nameNepali: 'भौतिक विज्ञान', icon: 'Zap' },
        { code: 'CHEM', name: 'Chemistry', nameNepali: 'रसायन विज्ञान', icon: 'FlaskConical' },
        { code: 'BIO', name: 'Biology', nameNepali: 'जीव विज्ञान', icon: 'Dna' },
        { code: 'MATH', name: 'Mathematics', nameNepali: 'गणित', icon: 'Calculator' },
        { code: 'COM', name: 'Computer Science', nameNepali: 'कम्प्युटर विज्ञान', icon: 'Binary' },
        { code: 'ENG', name: 'English', nameNepali: 'English', icon: 'Languages' },
        { code: 'NEP', name: 'Nepali', nameNepali: 'नेपाली', icon: 'BookOpen' },
      ],
    };

    // 3. Known Verified CDC Chapters for key subjects
    const knownChapters: Record<string, Array<{ number: number; title: string; titleNepali: string }>> = {
      '1_MATH': [
        { number: 1, title: 'Shapes and Position', titleNepali: 'आकारप्रकार र स्थान' },
        { number: 2, title: 'Lines', titleNepali: 'रेखाहरू' },
        { number: 3, title: 'Geometrical Shapes', titleNepali: 'ज्यामितीय आकारहरू' },
        { number: 4, title: 'Numbers up to 9', titleNepali: '९ सम्मका सङ्ख्याहरू' },
        { number: 5, title: 'Zero', titleNepali: 'शून्य' },
        { number: 6, title: 'Ten', titleNepali: 'दश' },
        { number: 7, title: 'Addition up to 10', titleNepali: 'योगफल १० सम्म आउने जोड' },
        { number: 8, title: 'Subtraction up to 10', titleNepali: '१० सम्मका सङ्ख्याहरूको घटाउ' },
        { number: 9, title: 'Numbers 11 to 20', titleNepali: '११ देखि २० सम्मका सङ्ख्याहरू' },
        { number: 10, title: 'Addition up to 20', titleNepali: 'योगफल २० सम्म आउने जोड' },
        { number: 11, title: 'Subtraction up to 20', titleNepali: '२० सम्मका सङ्ख्याहरूको घटाउ' },
        { number: 12, title: 'Money and Time', titleNepali: 'मुद्रा र समय' },
      ],
      '1_SCI': [
        { number: 1, title: 'Me and My Family', titleNepali: 'म र मेरो परिवार' },
        { number: 2, title: 'Our Daily Life', titleNepali: 'हाम्रो दैनिक जीवन' },
        { number: 3, title: 'Our Surrounding Environment', titleNepali: 'हाम्रो वरिपरिको वातावरण' },
      ],
    };

    const levels = [
      {
        id: 'PRIMARY',
        name: 'Primary Level',
        nameNepali: 'आधारभूत तह (कक्षा १–५)',
        range: 'Class 1–5',
        grades: [1, 2, 3, 4, 5],
      },
      {
        id: 'BASIC',
        name: 'Basic Level',
        nameNepali: 'आधारभूत तह (कक्षा ६–८)',
        range: 'Class 6–8',
        grades: [6, 7, 8],
      },
      {
        id: 'SECONDARY',
        name: 'Secondary Level',
        nameNepali: 'माध्यमिक तह (कक्षा ९–१०)',
        range: 'Class 9–10',
        grades: [9, 10],
      },
      {
        id: 'HIGHER_SECONDARY',
        name: 'Higher Secondary Level',
        nameNepali: 'उच्च माध्यमिक तह (कक्षा ११–१२)',
        range: 'Class 11–12',
        grades: [11, 12],
      },
    ];

    const nepaliNumerals = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९', '१०', '११', '१२'];

    const classesData = [];

    for (let g = 1; g <= 12; g++) {
      // Find simulations matching this grade
      const gradeSims = allSims.filter((s: any) => (s.gradeLevels || []).includes(g));

      const levelObj = levels.find((l) => l.grades.includes(g)) || levels[0];
      const subjectsConfig = standardSubjectsByGrade[g] || [];

      // Build subject-level details
      const subjectsData = subjectsConfig.map((sub) => {
        const subSims = gradeSims.filter(
          (s: any) =>
            (s.subjectCode || '').toUpperCase() === sub.code.toUpperCase() ||
            (sub.code === 'MATH' && s.subjectCode === 'MTH')
        );

        // Build chapter list
        const key = `${g}_${sub.code}`;
        const defaultChapters = knownChapters[key] || [];

        // Collect distinct chapters from registered simulations
        const chapterNumbers = new Set<number>();
        defaultChapters.forEach((ch) => chapterNumbers.add(ch.number));
        subSims.forEach((s: any) => {
          if (s.chapterNumber) chapterNumbers.add(s.chapterNumber);
        });

        const sortedChapterNumbers = Array.from(chapterNumbers).sort((a, b) => a - b);
        const chapters = sortedChapterNumbers.map((chNum) => {
          const matchingSims = subSims.filter((s: any) => s.chapterNumber === chNum);
          const known = defaultChapters.find((c) => c.number === chNum);
          const firstSim = matchingSims[0];

          return {
            chapterNumber: chNum,
            title: known?.title || firstSim?.chapterTitle || `Chapter ${chNum}`,
            titleNepali: known?.titleNepali || firstSim?.chapterTitleNepali || `पाठ ${nepaliNumerals[chNum] || chNum}`,
            simulationCount: matchingSims.length,
            simulations: matchingSims.map((s: any) => ({
              id: String(s._id || s.id),
              code: s.code,
              title: s.title,
              titleNepali: s.titleNepali,
              description: s.description,
              descriptionNepali: s.descriptionNepali,
              learningObjectives: s.learningObjectives || [],
              learningObjectivesNepali: s.learningObjectivesNepali || [],
              topicName: s.topicName,
              topicNameNepali: s.topicNameNepali,
              difficulty: s.difficulty || 'BEGINNER',
              estimatedMinutes: s.estimatedMinutes || 15,
              language: s.language || 'both',
              simulationType: s.simulationType || '3D_WEBGL',
              componentKey: s.componentKey,
              runtimeUrl: s.runtimeUrl,
              status: s.status || 'AVAILABLE',
              tags: s.tags || [],
              currentVersion: s.currentVersion || '1.0.0',
            })),
          };
        });

        return {
          code: sub.code,
          name: sub.name,
          nameNepali: sub.nameNepali,
          icon: sub.icon,
          simulationCount: subSims.length,
          chapters,
        };
      });

      classesData.push({
        grade: g,
        className: `Class ${g}`,
        classNameNepali: `कक्षा ${nepaliNumerals[g]}`,
        levelId: levelObj.id,
        levelName: levelObj.name,
        levelNameNepali: levelObj.nameNepali,
        simulationCount: gradeSims.length,
        subjectCount: subjectsData.length,
        subjects: subjectsData,
      });
    }

    const featuredSims = allSims
      .filter((s: any) => s.simulationType === '3D_WEBGL' || s.code === 'SIM-MATH-G1-CH1-01')
      .slice(0, 6)
      .map((s: any) => ({
        id: String(s._id || s.id),
        code: s.code,
        title: s.title,
        titleNepali: s.titleNepali,
        gradeLevels: s.gradeLevels,
        subjectCode: s.subjectCode,
        chapterNumber: s.chapterNumber,
        simulationType: s.simulationType,
        difficulty: s.difficulty || 'BEGINNER',
        estimatedMinutes: s.estimatedMinutes || 15,
        status: s.status || 'AVAILABLE',
        componentKey: s.componentKey,
        runtimeUrl: s.runtimeUrl,
      }));

    const recentSims = allSims.slice(0, 6).map((s: any) => ({
      id: String(s._id || s.id),
      code: s.code,
      title: s.title,
      titleNepali: s.titleNepali,
      gradeLevels: s.gradeLevels,
      subjectCode: s.subjectCode,
      chapterNumber: s.chapterNumber,
      simulationType: s.simulationType,
      difficulty: s.difficulty || 'BEGINNER',
      estimatedMinutes: s.estimatedMinutes || 15,
      status: s.status || 'AVAILABLE',
      componentKey: s.componentKey,
      runtimeUrl: s.runtimeUrl,
    }));

    return {
      levels,
      classes: classesData,
      totalSimulations: allSims.length,
      featuredSimulations: featuredSims,
      recentSimulations: recentSims,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // SIMULATION PROGRESS TRACKING (Student & Teacher)
  // ══════════════════════════════════════════════════════════════════
  static async recordSimulationProgress(params: {
    userId: string;
    studentId?: string;
    institutionId?: string;
    userRole: 'TEACHER' | 'STUDENT' | 'SUPER_ADMIN' | 'SCHOOL_ADMIN';
    gradeLevel?: number;
    subjectCode?: string;
    chapterNumber?: number;
    simulationCode: string;
    simulationTitle?: string;
    completedLevels?: number[];
    attempts?: number;
    correctAnswers?: number;
    totalQuestions?: number;
    assessmentScore?: number;
    percentage?: number;
    timeSpentSeconds?: number;
    conceptsToReview?: string[];
    conceptsUnderstood?: string[];
    isCompleted?: boolean;
  }) {
    let gradeLevel = params.gradeLevel;
    let subjectCode = params.subjectCode;
    let chapterNumber = params.chapterNumber;
    let simulationTitle = params.simulationTitle;

    if (!gradeLevel || !subjectCode || !chapterNumber || !simulationTitle) {
      const sim = await Simulation.findOne({ code: params.simulationCode });
      if (sim) {
        gradeLevel = gradeLevel ?? sim.gradeLevels?.[0] ?? 1;
        subjectCode = subjectCode ?? sim.subjectCode ?? 'MATH';
        chapterNumber = chapterNumber ?? sim.chapterNumber ?? 2;
        simulationTitle = simulationTitle ?? sim.title;
      } else {
        gradeLevel = gradeLevel ?? 1;
        subjectCode = subjectCode ?? 'MATH';
        chapterNumber = chapterNumber ?? 2;
        simulationTitle = simulationTitle ?? params.simulationCode;
      }
    }

    const existing = await SimulationProgress.findOne({
      userId: params.userId,
      simulationCode: params.simulationCode,
    });

    const attempts = (existing?.attempts || 0) + (params.attempts || 1);
    const score = Math.max(existing?.assessmentScore || 0, params.assessmentScore || 0);
    const totalQ = params.totalQuestions || existing?.totalQuestions || 12;
    const percentage = Math.round((score / totalQ) * 100);

    const newLevels = Array.isArray(params.completedLevels)
      ? params.completedLevels
      : typeof params.completedLevels === 'number'
      ? [params.completedLevels]
      : [];

    const mergedCompletedLevels = Array.from(
      new Set([...(existing?.completedLevels || []), ...newLevels])
    ).sort((a, b) => a - b);

    const updateData: any = {
      ...params,
      gradeLevel,
      subjectCode,
      chapterNumber,
      simulationTitle,
      attempts,
      assessmentScore: score,
      percentage,
      completedLevels: mergedCompletedLevels,
      isCompleted: params.isCompleted ?? (percentage >= 60),
      lastAttemptedAt: new Date(),
    };

    if (!updateData.institutionId) {
      delete updateData.institutionId;
    }

    const doc = await SimulationProgress.findOneAndUpdate(
      { userId: params.userId, simulationCode: params.simulationCode },
      { $set: updateData },
      { upsert: true, new: true }
    );

    return doc;
  }

  static async getSimulationProgress(userId: string, simulationCode: string) {
    return await SimulationProgress.findOne({ userId, simulationCode });
  }

  static async getAllSimulationProgress(userId: string) {
    return await SimulationProgress.find({ userId }).sort({ lastAttemptedAt: -1 });
  }
}
