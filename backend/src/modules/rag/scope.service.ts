import { StudentEnrollment, Section, SubjectAllocation, CentralSubject } from '../../models';
import { VectorFilter } from './vector.service';

/**
 * Decides which textbooks a user may search. Everything here comes from the database
 * (enrolment / teaching allocations) — never from client-supplied class or subject values,
 * which are only accepted as a *narrowing* of what the user is already allowed to see.
 */
export interface RagScope {
  role: 'STUDENT' | 'TEACHER' | 'SUPER_ADMIN';
  grades: number[];
  subjectKeys: string[]; // empty = every subject of the allowed grades
  mediums: string[];
  includeStaffResources: boolean;
  /** Human-readable context shown in the UI and given to the model. */
  label: string;
  allowedSubjects: Array<{ key: string; name: string; grade: number }>;
}

export class ScopeError extends Error {
  constructor(message: string, public status = 403, public code = 'RAG_SCOPE_DENIED') {
    super(message);
  }
}

const mediumOf = (m?: string) => (m === 'ENGLISH' ? ['ENGLISH'] : m === 'NEPALI' ? ['NEPALI'] : ['ENGLISH', 'NEPALI']);

async function subjectsFor(centralIds: any[]) {
  const subs: any[] = await CentralSubject.find({ _id: { $in: centralIds } }).select('name logicalKey gradeNumber').lean();
  return subs.filter((s) => s.logicalKey).map((s) => ({ key: String(s.logicalKey), name: s.name as string, grade: s.gradeNumber as number }));
}

export const ScopeService = {
  async resolve(user: { userId: string; role: string; institutionId?: string | null }, request: { grade?: number; subjectKey?: string; allClasses?: boolean } = {}): Promise<RagScope> {
    if (user.role === 'STUDENT') {
      const enrollments: any[] = await StudentEnrollment.find({ studentId: user.userId, status: 'ENROLLED' })
        .populate({ path: 'sectionId', populate: { path: 'classId', select: 'gradeNumber institutionId' } })
        .sort({ createdAt: -1 });
      const enr = enrollments.find((e) => String(e.sectionId?.classId?.institutionId) === String(user.institutionId)) || enrollments[0];
      const section: any = enr?.sectionId;
      const grade: number | undefined = section?.classId?.gradeNumber;
      if (!grade) throw new ScopeError('Your class could not be determined. Please contact your school.', 404, 'NO_ENROLLMENT');
      const allocs: any[] = await SubjectAllocation.find({ sectionId: section._id, status: { $ne: 'INACTIVE' } }).select('centralSubjectId').lean();
      const allowed = await subjectsFor(allocs.map((a) => a.centralSubjectId));
      let keys = [...new Set(allowed.map((a) => a.key))];
      if (request.subjectKey) {
        if (!keys.includes(request.subjectKey)) throw new ScopeError('That subject is not part of your class.');
        keys = [request.subjectKey];
      }
      return {
        role: 'STUDENT',
        grades: [grade], // a student can never widen this
        subjectKeys: keys,
        mediums: mediumOf(section.medium),
        includeStaffResources: false,
        label: `Class ${grade}${section.name ? ` ${section.name}` : ''}${request.subjectKey ? ` · ${allowed.find((a) => a.key === request.subjectKey)?.name || request.subjectKey}` : ''}`,
        allowedSubjects: allowed,
      };
    }

    if (user.role === 'TEACHER') {
      const allocs: any[] = await SubjectAllocation.find({ teacherId: user.userId, status: { $ne: 'INACTIVE' } }).populate('sectionId', 'medium institutionId').lean();
      const mine = allocs.filter((a) => !user.institutionId || !a.institutionId || String(a.institutionId) === String(user.institutionId));
      if (!mine.length) throw new ScopeError('You have no teaching assignments yet.', 403, 'NO_ALLOCATION');
      const subs: any[] = await CentralSubject.find({ _id: { $in: mine.map((a) => a.centralSubjectId) } }).select('name logicalKey gradeNumber').lean();
      const allowed = subs.filter((s) => s.logicalKey).map((s) => ({ key: String(s.logicalKey), name: s.name as string, grade: s.gradeNumber as number }));
      const allowedGrades = [...new Set(allowed.map((a) => a.grade))];
      let grades = allowedGrades;
      let keys = [...new Set(allowed.map((a) => a.key))];
      if (request.grade) {
        if (!allowedGrades.includes(request.grade) && !request.allClasses) throw new ScopeError('You are not assigned to this class.');
        grades = [request.grade];
        keys = [...new Set(allowed.filter((a) => a.grade === request.grade).map((a) => a.key))];
      }
      if (request.subjectKey) {
        const ok = allowed.some((a) => a.key === request.subjectKey && (!request.grade || a.grade === request.grade));
        if (!ok) throw new ScopeError('You are not assigned to this subject.');
        keys = [request.subjectKey];
      }
      // Authorised cross-class search: widen to every class but keep the teacher's own subjects
      if (request.allClasses) grades = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const mediums = [...new Set(mine.flatMap((a) => mediumOf(a.medium || a.sectionId?.medium)))];
      return {
        role: 'TEACHER',
        grades,
        subjectKeys: keys,
        mediums,
        includeStaffResources: true,
        label: request.allClasses ? 'All classes (your subjects)' : request.grade ? `Class ${request.grade}${request.subjectKey ? ` · ${allowed.find((a) => a.key === request.subjectKey)?.name || request.subjectKey}` : ''}` : 'Your classes',
        allowedSubjects: allowed,
      };
    }

    if (user.role === 'SUPER_ADMIN') {
      return {
        role: 'SUPER_ADMIN',
        grades: request.grade ? [request.grade] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        subjectKeys: request.subjectKey ? [request.subjectKey] : [],
        mediums: [],
        includeStaffResources: true,
        label: 'Platform administrator',
        allowedSubjects: [],
      };
    }

    throw new ScopeError('AI textbook assistant is available to students and teachers only.');
  },

  toFilter(scope: RagScope, extra: { chapterNumber?: number } = {}): VectorFilter {
    return {
      grades: scope.grades,
      subjectKeys: scope.subjectKeys,
      mediums: scope.mediums,
      includeStaffResources: scope.includeStaffResources,
      chapterNumber: extra.chapterNumber,
    };
  },

  /** Is a given chunk visible to this scope? Re-checked after retrieval as defence in depth. */
  allows(scope: RagScope, chunk: { gradeNumber?: number; gradeMin?: number; gradeMax?: number; subjectKey?: string; medium?: string; audience?: string }): boolean {
    if (chunk.audience === 'STAFF') {
      if (!scope.includeStaffResources) return false;
      if (chunk.gradeMin == null || chunk.gradeMax == null) return true;
      return scope.grades.some((g) => g >= chunk.gradeMin! && g <= chunk.gradeMax!);
    }
    if (chunk.gradeNumber != null && !scope.grades.includes(chunk.gradeNumber)) return false;
    if (scope.subjectKeys.length && chunk.subjectKey && !scope.subjectKeys.includes(chunk.subjectKey)) return false;
    if (scope.mediums.length && chunk.medium && chunk.medium !== 'BOTH' && !scope.mediums.includes(chunk.medium)) return false;
    return true;
  },
};
