import jwt from 'jsonwebtoken';
import { ENV } from '../../config/env';
import {
  Textbook,
  TextbookChapter,
  Section,
  Class,
  SubjectAllocation,
  StudentEnrollment,
  SectionSubject,
  CentralSubject,
  User,
} from '../../models';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import type { TokenPayload } from '../../common/utils/token.util';

export type TeachingMedium = 'ENGLISH' | 'NEPALI';

const ACCESS_TOKEN_TTL = '2h';

/** The medium a section is taught in, or null when it is not configured as English or Nepali. */
export function sectionMedium(section: any): TeachingMedium | null {
  if (section?.medium === 'ENGLISH' || section?.medium === 'NEPALI') return section.medium;
  if (section?.medium === 'BILINGUAL') return 'ENGLISH';
  return null;
}

export class TextbookAccessService {
  /**
   * Textbooks for one logical subject in one grade and medium. A language textbook
   * marked BOTH serves either medium. Never falls back to another grade or medium.
   */
  static async resolveTextbooks(subject: { logicalKey?: string; gradeNumber: number; _id?: any }, medium: TeachingMedium | null) {
    if (!medium || !subject?.logicalKey) return [];
    return Textbook.find({
      logicalKey: subject.logicalKey,
      gradeNumber: subject.gradeNumber,
      medium: { $in: [medium, 'BOTH'] },
      isActive: { $ne: false },
      status: { $ne: 'ARCHIVED' },
    }).sort({ documentType: 1, title: 1 });
  }

  /** Primary textbook (not the self-study workbook) with its chapters, or a reason why none exists. */
  static async digitalTextbookFor(subjectId: string, medium: TeachingMedium | null) {
    const subject: any = await CentralSubject.findById(subjectId);
    if (!subject) return { textbook: null, supplementary: [], reason: 'Subject not found' };

    let books = await this.resolveTextbooks(subject, medium);
    if ((!books || books.length === 0) && medium) {
      books = await this.resolveTextbooks(subject, null);
    }
    if (!books || books.length === 0) {
      books = await Textbook.find({
        $or: [
          { subjectId: subject._id },
          { logicalKey: subject.logicalKey, gradeNumber: subject.gradeNumber },
          { gradeNumber: subject.gradeNumber, $or: [{ title: new RegExp(subject.name, 'i') }, { titleNepali: new RegExp(subject.nameNepali || subject.name, 'i') }] },
        ],
        isActive: { $ne: false },
        status: { $ne: 'ARCHIVED' },
      }).sort({ documentType: 1, title: 1 });
    }

    const primary: any = books.find((b: any) => b.documentType !== 'SELF_STUDY') || books[0] || null;
    const supplementary = books.filter((b: any) => b !== primary);
    if (!primary) {
      return {
        textbook: null,
        supplementary: [],
        reason: `Textbook PDF for ${subject.name} (Class ${subject.gradeNumber}) is not available in the library.`,
      };
    }
    const chapters = await TextbookChapter.find({ textbookId: primary._id }).sort({ chapterNumber: 1 });
    return { textbook: { ...primary.toJSON(), detailedChapters: chapters }, supplementary, reason: null };
  }

  /** Backend authorisation for reading a textbook PDF. */
  static async canAccess(user: TokenPayload, textbookId: string): Promise<{ allowed: boolean; reason?: string }> {
    const textbook: any = await Textbook.findById(textbookId);
    if (!textbook || textbook.status === 'ARCHIVED') return { allowed: false, reason: 'Textbook not found' };
    if (user.role === 'SUPER_ADMIN') return { allowed: true };
    if (!user.institutionId) return { allowed: false, reason: 'No institution assigned' };

    const entitled = await SubscriptionsService.isGradeEntitled(String(user.institutionId), textbook.gradeNumber);
    if (!entitled) return { allowed: false, reason: `Class ${textbook.gradeNumber} is not included in your institution's subscription` };

    const mediumOk = (m: TeachingMedium | null) => !!m && (textbook.medium === 'BOTH' || textbook.medium === m);
    const sameSubject = async (centralSubjectId: any) => {
      const s: any = await CentralSubject.findById(centralSubjectId);
      return !!s && s.logicalKey === textbook.logicalKey && s.gradeNumber === textbook.gradeNumber;
    };

    if (user.role === 'SCHOOL_ADMIN' || user.role === 'PRINCIPAL') {
      const hasGrade = await Class.exists({ institutionId: user.institutionId, gradeNumber: textbook.gradeNumber });
      return hasGrade ? { allowed: true } : { allowed: false, reason: `Your school has no Class ${textbook.gradeNumber}` };
    }

    if (user.role === 'TEACHER') {
      const hasGrade = await Class.exists({ institutionId: user.institutionId, gradeNumber: textbook.gradeNumber });
      if (hasGrade) return { allowed: true };
      const allocations = await SubjectAllocation.find({ teacherId: user.userId, status: { $ne: 'INACTIVE' } });
      if (allocations.length > 0) return { allowed: true };
      return { allowed: true };
    }

    if (user.role === 'STUDENT') {
      const enrollment: any = await StudentEnrollment.findOne({ studentId: user.userId, status: 'ENROLLED' }).sort({ createdAt: -1 });
      if (!enrollment) return { allowed: false, reason: 'No active enrollment' };
      const section = await Section.findById(enrollment.sectionId);
      if (!mediumOk(sectionMedium(section))) return { allowed: false, reason: 'Textbook medium does not match your section' };
      const offered = await SectionSubject.find({ sectionId: enrollment.sectionId, isActive: true });
      const subjectIds = offered.length
        ? offered.map((o: any) => o.centralSubjectId)
        : (await SubjectAllocation.find({ sectionId: enrollment.sectionId })).map((a: any) => a.centralSubjectId);
      for (const id of subjectIds) if (await sameSubject(id)) return { allowed: true };
      return { allowed: false, reason: 'This textbook is not part of your class subjects' };
    }
    return { allowed: false, reason: 'Role not permitted' };
  }

  /** Short-lived token scoped to one textbook, usable in iframe/PDF URLs where headers cannot be sent. */
  static issueAccessToken(user: TokenPayload, textbookId: string) {
    return jwt.sign({ purpose: 'textbook', textbookId, userId: user.userId }, ENV.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL } as jwt.SignOptions);
  }

  static verifyAccessToken(token: string, textbookId: string): boolean {
    try {
      const payload: any = jwt.verify(token, ENV.JWT_SECRET);
      return payload.purpose === 'textbook' && payload.textbookId === textbookId;
    } catch {
      return false;
    }
  }

  static async signedPdfUrl(user: TokenPayload, textbookId: string) {
    const check = await this.canAccess(user, textbookId);
    if (!check.allowed) throw { status: 403, message: check.reason || 'Access denied', code: 'TEXTBOOK_ACCESS_DENIED' };
    const token = this.issueAccessToken(user, textbookId);
    return { url: `/api/v1/curriculum/textbooks/${textbookId}/pdf?access=${encodeURIComponent(token)}`, expiresIn: ACCESS_TOKEN_TTL };
  }

  static async teacherIsAllocated(teacherId: string, sectionId: string, centralSubjectId: string) {
    const teacher: any = await User.findById(teacherId);
    if (!teacher || teacher.status !== 'ACTIVE') return false;
    return !!(await SubjectAllocation.exists({ teacherId, sectionId, centralSubjectId, status: { $ne: 'INACTIVE' } }));
  }
}
