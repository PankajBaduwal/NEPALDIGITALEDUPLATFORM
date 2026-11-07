import mongoose from 'mongoose';
import {
  User,
  Institution,
  CentralSubject,
  Textbook,
  Class,
  Section,
  SmartBoardNote,
  AnnotationSession,
  ClassroomSession,
  ActivityCatalog,
  SimulationCatalog,
  TextbookChapter,
  SubjectAllocation,
} from '../../models';
import { TextbookAccessService, sectionMedium } from '../curriculum/textbook-access.service';

export class SmartBoardService {
  // ── 1. CLASSROOM SESSION MANAGEMENT ──────────────────────────
  /**
   * Start an authenticated classroom session.
   * Resolves institution directly from teacher credentials.
   */
  static async startClassroomSession(params: {
    institutionId: string;
    teacherId: string;
    classId: string;
    sectionId: string;
    subjectId: string;
    textbookId?: string;
    chapterNumber?: number;
    chapterTitle?: string;
    lessonTitle?: string;
    initialResourceType?: 'WHITEBOARD' | 'TEXTBOOK' | 'SIMULATION' | 'ACTIVITY';
    initialResourceName?: string;
    initialResourceUrl?: string;
  }) {
    // 1. Verify teacher, school, class/section and the teacher's allocation to this subject.
    const [teacher, institution, cls, sec, subject] = await Promise.all([
      User.findById(params.teacherId),
      Institution.findById(params.institutionId),
      Class.findById(params.classId),
      Section.findById(params.sectionId),
      CentralSubject.findById(params.subjectId),
    ]);

    if (!teacher || teacher.role !== 'TEACHER' || teacher.status !== 'ACTIVE') {
      throw { status: 403, message: 'Only active teachers can start classroom sessions.' };
    }
    if (!institution || String(teacher.institutionId) !== String(institution._id)) {
      throw { status: 403, message: 'Teacher does not belong to this institution.' };
    }
    if (!cls || !sec || !subject || String(sec.classId) !== String(cls._id) || String(cls.institutionId) !== String(institution._id)) {
      throw { status: 400, message: 'Invalid class, section, or subject for this school.' };
    }
    if (!(await TextbookAccessService.teacherIsAllocated(params.teacherId, params.sectionId, params.subjectId))) {
      throw { status: 403, message: `You are not allocated to teach ${subject.name} in Class ${cls.gradeNumber} ${sec.name}.`, code: 'UNAUTHORIZED_ALLOCATION' };
    }

    // 1b. Textbook for this subject, grade and the section's medium. A different book is refused.
    const medium = sectionMedium(sec);
    const resolved = await TextbookAccessService.digitalTextbookFor(params.subjectId, medium);
    const allowedIds = [resolved.textbook, ...resolved.supplementary].filter(Boolean).map((b: any) => String(b.id || b._id));
    let textbookId: string | undefined = params.textbookId ? String(params.textbookId) : allowedIds[0];
    if (params.textbookId && !allowedIds.includes(String(params.textbookId))) {
      throw { status: 400, message: `That textbook is not the ${medium === 'NEPALI' ? 'Nepali' : 'English'} medium book for ${subject.name} Class ${cls.gradeNumber}.`, code: 'TEXTBOOK_MISMATCH' };
    }
    const textbook: any = textbookId ? await Textbook.findById(textbookId) : null;
    if (!textbook) textbookId = undefined;
    let page = 1;
    let chapterTitle = params.chapterTitle;
    if (textbook && params.chapterNumber) {
      const chapter: any = await TextbookChapter.findOne({ textbookId: textbook._id, chapterNumber: params.chapterNumber });
      if (chapter) {
        page = chapter.startPage || 1;
        chapterTitle = chapterTitle || chapter.title;
      }
    }

    // 2. Prepare initial resource log
    const resourcesUsed: any[] = [];
    if (params.initialResourceType) {
      resourcesUsed.push({
        type: params.initialResourceType,
        name: params.initialResourceName || params.initialResourceType,
        url: params.initialResourceUrl,
        timeSpentSeconds: 0,
      });
    }

    // 3. Create ClassroomSession record
    const session = await ClassroomSession.create({
      institutionId: params.institutionId,
      teacherId: params.teacherId,
      classId: params.classId,
      sectionId: params.sectionId,
      subjectId: params.subjectId,
      textbookId: textbookId,
      chapterNumber: params.chapterNumber,
      chapterTitle,
      lessonTitle: params.lessonTitle || `${subject.name} - Class ${cls.gradeNumber}`,
      sessionStart: new Date(),
      status: 'ACTIVE',
      resourcesUsed,
      durationSeconds: 0,
    });

    // 4. Launcher URL for the existing Smart Board, with a short-lived textbook-scoped PDF link.
    const q = new URLSearchParams({ sessionId: String(session.id) });
    if (textbook) {
      const access = TextbookAccessService.issueAccessToken({ userId: params.teacherId, role: 'TEACHER', institutionId: params.institutionId } as any, String(textbook._id));
      q.set('textbookId', String(textbook._id));
      q.set('pdf', `/api/v1/curriculum/textbooks/${textbook._id}/pdf?access=${encodeURIComponent(access)}`);
      q.set('page', String(page));
    }
    if (params.chapterNumber) q.set('chapter', String(params.chapterNumber));
    q.set('title', params.lessonTitle || `${subject.name} - Class ${cls.gradeNumber} ${sec.name}`);
    q.set('institutionId', String(institution._id));
    q.set('classId', String(cls._id));
    q.set('sectionId', String(sec._id));
    q.set('subjectId', String(subject._id));
    if (medium) q.set('medium', medium);
    const launcherUrl = `/smartboard/index.html?${q.toString()}`;

    return {
      session,
      launcherUrl,
      institution: {
        id: institution.id,
        name: institution.name,
      },
      classDetails: {
        classId: String(cls._id),
        gradeNumber: cls.gradeNumber,
        sectionId: String(sec._id),
        sectionName: sec.name,
        subjectId: String(subject._id),
        subjectName: subject.name,
        medium,
      },
      textbook: textbook ? { id: String(textbook._id), title: textbook.title, medium: textbook.medium, page, chapterNumber: params.chapterNumber || null, chapterTitle: chapterTitle || null } : null,
      textbookMessage: textbook ? null : resolved.reason,
    };
  }

  /**
   * Update ongoing classroom session (e.g. log another opened resource or coverage notes).
   */
  static async updateClassroomSession(
    sessionId: string,
    institutionId: string,
    updates: {
      lessonCoverage?: string;
      addResource?: {
        type: 'TEXTBOOK' | 'SIMULATION' | 'ACTIVITY' | 'WHITEBOARD';
        name: string;
        url?: string;
        timeSpentSeconds?: number;
      };
    }
  ) {
    const session = await ClassroomSession.findOne({ _id: sessionId, institutionId });
    if (!session) {
      throw { status: 404, message: 'Classroom session not found or unauthorized.' };
    }

    if (updates.lessonCoverage !== undefined) {
      session.lessonCoverage = updates.lessonCoverage;
    }

    if (updates.addResource) {
      session.resourcesUsed.push(updates.addResource);
    }

    await session.save();
    return session;
  }

  /**
   * End an active classroom session.
   * Requirement: Do not automatically mark chapters completed just because a resource was opened.
   */
  static async endClassroomSession(
    sessionId: string,
    institutionId: string,
    data?: { lessonCoverage?: string; durationSeconds?: number }
  ) {
    const session = await ClassroomSession.findOne({ _id: sessionId, institutionId });
    if (!session) {
      throw { status: 404, message: 'Classroom session not found.' };
    }

    const now = new Date();
    const duration =
      data?.durationSeconds !== undefined
        ? data.durationSeconds
        : Math.round((now.getTime() - new Date(session.sessionStart).getTime()) / 1000);

    session.status = 'COMPLETED';
    session.sessionEnd = now;
    session.durationSeconds = Math.max(0, duration);

    if (data?.lessonCoverage) {
      session.lessonCoverage = data.lessonCoverage;
    }

    await session.save();
    return session;
  }

  static async getActiveClassroomSession(teacherId: string, institutionId: string) {
    return ClassroomSession.findOne({
      teacherId,
      institutionId,
      status: 'ACTIVE',
    })
      .populate('classId', 'gradeNumber')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name nameNepali code');
  }

  static async listClassroomSessions(
    institutionId: string,
    teacherId?: string,
    filter?: { classId?: string; subjectId?: string; limit?: number }
  ) {
    const query: any = { institutionId };
    if (teacherId) query.teacherId = teacherId;
    if (filter?.classId) query.classId = filter.classId;
    if (filter?.subjectId) query.subjectId = filter.subjectId;

    const limit = filter?.limit || 30;
    return ClassroomSession.find(query)
      .populate('classId', 'gradeNumber')
      .populate('sectionId', 'name')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'fullName')
      .sort({ sessionStart: -1 })
      .limit(limit);
  }

  // ── 2. ANNOTATION SESSION STORAGE ─────────────────────────────
  /**
   * Save or update an annotation session on top of a textbook page or canvas.
   * Annotations remain separate from the original textbook PDF.
   */
  static async saveAnnotationSession(params: {
    institutionId: string;
    teacherId: string;
    classId?: string;
    sectionId?: string;
    subjectId?: string;
    textbookId?: string;
    pageNumber: number;
    title: string;
    annotationData: Record<string, any>;
    drawDataUrl?: string;
    boardState?: Record<string, any>;
    isSharedWithStudents?: boolean;
  }) {
    // Upsert or save annotation
    const existing = await AnnotationSession.findOne({
      institutionId: params.institutionId,
      teacherId: params.teacherId,
      textbookId: params.textbookId || null,
      pageNumber: params.pageNumber,
    });

    if (existing) {
      existing.title = params.title || existing.title;
      existing.annotationData = params.annotationData;
      if (params.drawDataUrl) existing.drawDataUrl = params.drawDataUrl;
      if (params.boardState) existing.boardState = params.boardState;
      if (params.isSharedWithStudents !== undefined) {
        existing.isSharedWithStudents = params.isSharedWithStudents;
      }
      existing.updatedAt = new Date();
      await existing.save();
      return existing;
    }

    return AnnotationSession.create({
      institutionId: params.institutionId,
      teacherId: params.teacherId,
      classId: params.classId || undefined,
      sectionId: params.sectionId || undefined,
      subjectId: params.subjectId || undefined,
      textbookId: params.textbookId || undefined,
      pageNumber: params.pageNumber,
      title: params.title,
      annotationData: params.annotationData,
      drawDataUrl: params.drawDataUrl,
      boardState: params.boardState,
      isSharedWithStudents: params.isSharedWithStudents !== undefined ? params.isSharedWithStudents : true,
    });
  }

  static async listAnnotationSessions(params: {
    institutionId: string;
    teacherId?: string;
    textbookId?: string;
    pageNumber?: number;
    subjectId?: string;
  }) {
    const query: any = { institutionId: params.institutionId };
    if (params.teacherId) query.teacherId = params.teacherId;
    if (params.textbookId) query.textbookId = params.textbookId;
    if (params.pageNumber) query.pageNumber = Number(params.pageNumber);
    if (params.subjectId) query.subjectId = params.subjectId;

    return AnnotationSession.find(query)
      .populate('teacherId', 'fullName')
      .populate('textbookId', 'title gradeNumber medium')
      .sort({ updatedAt: -1 })
      .limit(50);
  }

  static async getAnnotationSessionById(id: string, institutionId: string) {
    const note = await AnnotationSession.findOne({ _id: id, institutionId }).populate('teacherId', 'fullName');
    if (!note) {
      throw { status: 404, message: 'Annotation session not found or unauthorized.' };
    }
    return note;
  }

  static async deleteAnnotationSession(id: string, institutionId: string, teacherId: string) {
    const result = await AnnotationSession.findOneAndDelete({
      _id: id,
      institutionId,
      teacherId,
    });
    if (!result) {
      throw { status: 404, message: 'Annotation not found or unauthorized to delete.' };
    }
    return { message: 'Annotation removed successfully' };
  }

  // ── 3. SIMULATIONS & ACTIVITIES LAUNCHER ───────────────────────
  static async listActivities(filter: { grade?: number; subjectId?: string; type?: string }) {
    const query: any = {};
    if (filter.grade) query.gradeLevels = Number(filter.grade);
    if (filter.subjectId) query.subjectId = filter.subjectId;
    if (filter.type) query.type = filter.type;

    let activities = await ActivityCatalog.find(query).sort({ title: 1 });

    // Seed sample curriculum activities if empty
    if (activities.length === 0) {
      activities = await ActivityCatalog.create([
        {
          title: 'Newton Laws of Motion Quiz & Concept Check',
          titleNepali: 'न्युटनको चाल सम्बन्धी नियम प्रश्नावली',
          type: 'MCQ',
          gradeLevels: [9, 10],
          chapterNumber: 2,
          contentData: {
            questions: [
              {
                question: 'What is the SI unit of force?',
                options: ['Joule', 'Newton', 'Pascal', 'Watt'],
                correctAnswer: 1,
              },
            ],
          },
          isInteractive: true,
        },
        {
          title: 'Plant vs Animal Cell Organelles Labeling',
          titleNepali: 'वनस्पति र जनावर कोषका अङ्गहरू पहिचान',
          type: 'DIAGRAM_LABELING',
          gradeLevels: [6, 7, 8, 9, 10],
          chapterNumber: 3,
          contentData: {
            targets: ['Nucleus', 'Mitochondria', 'Cell Wall', 'Chloroplast'],
          },
          isInteractive: true,
        },
        {
          title: 'Chemical Reactions & Balanced Equations Matching',
          titleNepali: 'रासायनिक प्रतिक्रिया र सन्तुलित समीकरण जोडा मिलाउने',
          type: 'MATCHING',
          gradeLevels: [9, 10],
          chapterNumber: 4,
          contentData: {
            pairs: [
              { left: '2H2 + O2', right: '2H2O (Synthesis)' },
              { left: 'CaCO3 + Heat', right: 'CaO + CO2 (Decomposition)' },
            ],
          },
          isInteractive: true,
        },
        {
          title: 'Solar System Planetary Order Sequence',
          titleNepali: 'सौर्यमण्डलका ग्रहहरूको क्रम मिलाउने',
          type: 'DRAG_DROP',
          gradeLevels: [6, 7, 8],
          chapterNumber: 1,
          contentData: {
            items: ['Mercury', 'Venus', 'Earth', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune'],
          },
          isInteractive: true,
        },
      ]);
    }

    return activities;
  }

  static async listSimulations(filter: { grade?: number; domain?: string }) {
    const query: any = {};
    if (filter.grade) query.gradeLevels = Number(filter.grade);
    if (filter.domain) query.domain = filter.domain;
    return SimulationCatalog.find(query).sort({ title: 1 });
  }

  // Legacy context method kept for backward compatibility with rbac-bridge.js
  static async getSmartboardContext(subjectId: string, userId: string, sectionId?: string) {
    const user = await User.findById(userId);
    if (!user) throw { status: 401, message: 'Invalid teacher identity' };

    let subject = null;
    if (subjectId.match(/^[0-9a-fA-F]{24}$/)) {
      subject = await CentralSubject.findById(subjectId);
    }
    if (!subject) {
      subject = await CentralSubject.findOne({ code: subjectId });
    }
    if (!subject) {
      throw { status: 404, message: 'Subject not found in central curriculum' };
    }

    // Only the textbook for the section's medium; without a section the medium is unknown, so none is attached.
    const section = sectionId && /^[0-9a-fA-F]{24}$/.test(sectionId) ? await Section.findById(sectionId) : null;
    const resolved = await TextbookAccessService.digitalTextbookFor(String(subject._id), sectionMedium(section));
    const textbook: any = resolved.textbook;
    let pdfUrl: string | null = null;
    if (textbook) {
      const check = await TextbookAccessService.canAccess({ userId: String(user._id), role: user.role, institutionId: user.institutionId ? String(user.institutionId) : null } as any, String(textbook.id));
      pdfUrl = check.allowed ? (await TextbookAccessService.signedPdfUrl({ userId: String(user._id), role: user.role, institutionId: user.institutionId ? String(user.institutionId) : null } as any, String(textbook.id))).url : null;
    }

    return {
      subject: {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        nameNepali: subject.nameNepali,
        gradeNumber: subject.gradeNumber,
        pdfUrl,
      },
      textbook,
      textbookMessage: resolved.reason,
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        institutionId: user.institutionId ? user.institutionId.toString() : undefined,
      },
    };
  }

  static async shareBoardNotes(data: any) {
    if (!data.isSuperAdmin && data.sectionId && data.subjectId && data.teacherId) {
      const sec: any = await Section.findById(data.sectionId).populate('classId', 'institutionId');
      const allowed =
        sec && String(sec.classId?.institutionId) === String(data.institutionId) &&
        (await SubjectAllocation.exists({
          sectionId: data.sectionId,
          centralSubjectId: data.subjectId,
          teacherId: data.teacherId,
          status: { $ne: 'INACTIVE' },
        }));
      if (!allowed) {
        throw { status: 403, message: 'You are not assigned to teach this subject in this section', code: 'NOT_ALLOCATED' };
      }
    }
    return SmartBoardNote.create({
      institutionId: data.institutionId,
      teacherId: data.teacherId,
      sectionId: data.sectionId || undefined,
      subjectId: data.subjectId || undefined,
      title: data.title || 'Smart Board Class Notes',
      drawingData: data.drawingData || data.notesDataUrl,
      isSharedWithStudents: true,
    });
  }
}
