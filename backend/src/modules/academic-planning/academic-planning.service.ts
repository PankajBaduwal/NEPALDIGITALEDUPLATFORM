import mongoose from 'mongoose';
import {
  AcademicYear,
  Class,
  Section,
  CentralSubject,
  SectionSubject,
  SubjectAllocation,
  StudentEnrollment,
  User,
  Timetable,
  TimetableEntry,
  Institution,
} from '../../models';
import { AuditService } from '../../common/services/audit.service';
import { CurriculumLibraryService } from '../curriculum/curriculum-library.service';
import { sectionMedium, TeachingMedium } from '../curriculum/textbook-access.service';

type Actor = { userId: string; role: string };
const oid = (id: any) => new mongoose.Types.ObjectId(String(id));
const isId = (id: any) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

export class AcademicPlanningService {
  // ── Helpers ────────────────────────────────────────────────────────────────
  static async loadSection(institutionId: string, sectionId: string) {
    if (!isId(sectionId)) throw { status: 400, message: 'Invalid section id' };
    const section: any = await Section.findById(sectionId);
    if (!section) throw { status: 404, message: 'Section not found' };
    const cls: any = await Class.findById(section.classId);
    if (!cls || String(cls.institutionId) !== String(institutionId)) {
      throw { status: 403, message: 'Section does not belong to your institution', code: 'CROSS_TENANT_FORBIDDEN' };
    }
    return { section, cls };
  }

  static async institutionSectionIds(institutionId: string) {
    const classIds = (await Class.find({ institutionId }, '_id')).map((c: any) => c._id);
    return (await Section.find({ classId: { $in: classIds } }, '_id')).map((s: any) => s._id);
  }

  static async currentAcademicYear(institutionId: string, academicYearId?: string) {
    if (academicYearId) {
      const y: any = await AcademicYear.findOne({ _id: academicYearId, institutionId });
      if (!y) throw { status: 404, message: 'Academic year not found for this institution' };
      return y;
    }
    const y: any = (await AcademicYear.findOne({ institutionId, isCurrent: true })) || (await AcademicYear.findOne({ institutionId }).sort({ createdAt: -1 }));
    if (!y) throw { status: 400, message: 'No academic year is configured for this institution' };
    return y;
  }

  // ── Structure ──────────────────────────────────────────────────────────────
  static async structure(institutionId: string, academicYearId?: string) {
    const year = await this.currentAcademicYear(institutionId, academicYearId);
    const years = await AcademicYear.find({ institutionId }).sort({ name: -1 });
    const classes: any[] = await Class.find({ institutionId }).sort({ gradeNumber: 1, stream: 1 });
    const sections: any[] = await Section.find({ classId: { $in: classes.map((c) => c._id) }, academicYearId: year._id })
      .populate('classTeacherId', 'fullName username email')
      .sort({ name: 1 });
    const offered = await SectionSubject.aggregate([
      { $match: { sectionId: { $in: sections.map((s) => s._id) }, isActive: true } },
      { $group: { _id: '$sectionId', n: { $sum: 1 } } },
    ]);
    const students = await StudentEnrollment.aggregate([
      { $match: { sectionId: { $in: sections.map((s) => s._id) }, status: 'ENROLLED' } },
      { $group: { _id: '$sectionId', n: { $sum: 1 } } },
    ]);
    return {
      academicYear: year.toJSON(),
      academicYears: years.map((y: any) => y.toJSON()),
      classes: classes.map((c) => ({
        ...c.toJSON(),
        sections: sections
          .filter((s) => String(s.classId) === String(c._id))
          .map((s) => ({
            ...s.toJSON(),
            mediumConfigured: !!sectionMedium(s),
            offeredSubjects: offered.find((o) => String(o._id) === String(s._id))?.n || 0,
            students: students.find((o) => String(o._id) === String(s._id))?.n || 0,
          })),
      })),
    };
  }

  /** Set a section's teaching medium. Allocations follow; published timetables are re-checked on next publish. */
  static async setSectionMedium(institutionId: string, sectionId: string, medium: string, actor: Actor) {
    if (medium !== 'ENGLISH' && medium !== 'NEPALI') throw { status: 400, message: 'Medium must be ENGLISH or NEPALI' };
    const { section } = await this.loadSection(institutionId, sectionId);
    const previous = section.medium;
    if (previous === medium) return section.toJSON();
    await Section.updateOne({ _id: section._id }, { $set: { medium } });
    await SectionSubject.updateMany({ sectionId: section._id }, { $set: { medium } });
    await SubjectAllocation.updateMany({ sectionId: section._id }, { $set: { medium } });
    const published = await Timetable.countDocuments({ sectionId: section._id, status: 'PUBLISHED' });
    await AuditService.log({
      operatorId: actor.userId,
      operatorRole: actor.role,
      action: 'SECTION_MEDIUM_CHANGED',
      entityType: 'Section',
      entityId: sectionId,
      details: { institutionId, previous, medium, publishedTimetables: published },
    });
    return { ...(await Section.findById(section._id))!.toJSON(), publishedTimetableNeedsReview: published > 0 };
  }

  // ── Curriculum explorer for the school ─────────────────────────────────────
  static async explorer(institutionId: string, params: { academicYearId?: string; classId: string; medium?: string }) {
    const year = await this.currentAcademicYear(institutionId, params.academicYearId);
    if (!isId(params.classId)) throw { status: 400, message: 'classId is required' };
    const cls: any = await Class.findOne({ _id: params.classId, institutionId });
    if (!cls) throw { status: 404, message: 'Class not found in your institution' };
    const sections: any[] = await Section.find({ classId: cls._id, academicYearId: year._id }).sort({ name: 1 });
    const requested = (params.medium === 'ENGLISH' || params.medium === 'NEPALI' ? params.medium : null) as TeachingMedium | null;
    const sectionsForMedium = requested ? sections.filter((s) => sectionMedium(s) === requested) : sections;

    const subjects = await CurriculumLibraryService.subjectsForGrade(cls.gradeNumber, cls.stream);
    const described = await CurriculumLibraryService.describeSubjects(subjects, requested);
    const subjectIdsByKey = new Map<string, string[]>();
    for (const s of await CentralSubject.find({ gradeNumber: cls.gradeNumber })) {
      const k = (s as any).logicalKey || `id:${s._id}`;
      subjectIdsByKey.set(k, [...(subjectIdsByKey.get(k) || []), String(s._id)]);
    }

    const offerings: any[] = await SectionSubject.find({ sectionId: { $in: sections.map((s) => s._id) } });
    const allocations: any[] = await SubjectAllocation.find({ sectionId: { $in: sections.map((s) => s._id) }, status: { $ne: 'INACTIVE' } }).populate('teacherId', 'fullName status');
    const enrolled = await StudentEnrollment.aggregate([
      { $match: { sectionId: { $in: sections.map((s) => s._id) }, status: 'ENROLLED' } },
      { $group: { _id: '$sectionId', n: { $sum: 1 } } },
    ]);

    return {
      academicYear: year.toJSON(),
      class: cls.toJSON(),
      medium: requested,
      sections: sections.map((s) => ({ id: String(s._id), name: s.name, medium: s.medium, mediumConfigured: !!sectionMedium(s), students: enrolled.find((e) => String(e._id) === String(s._id))?.n || 0 })),
      sectionsWithoutMedium: sections.filter((s) => !sectionMedium(s)).map((s) => s.name),
      subjects: described.map((d) => {
        const ids = subjectIdsByKey.get(d.logicalKey || `id:${d.id}`) || [d.id];
        return {
          ...d,
          sections: sectionsForMedium.map((s) => {
            const off = offerings.find((o) => String(o.sectionId) === String(s._id) && ids.includes(String(o.centralSubjectId)));
            const teachers = allocations
              .filter((a) => String(a.sectionId) === String(s._id) && ids.includes(String(a.centralSubjectId)))
              .map((a) => ({ allocationId: String(a._id), teacherId: String(a.teacherId?._id || a.teacherId), name: a.teacherId?.fullName, status: a.teacherId?.status }));
            return {
              sectionId: String(s._id),
              sectionName: s.name,
              offered: !!off?.isActive,
              offeringSubjectId: off ? String(off.centralSubjectId) : null,
              periodsPerWeek: off?.periodsPerWeek ?? null,
              practicalPeriodsPerWeek: off?.practicalPeriodsPerWeek ?? 0,
              isOptional: off?.isOptional ?? !d.isCompulsory,
              teachers,
              students: enrolled.find((e) => String(e._id) === String(s._id))?.n || 0,
            };
          }),
        };
      }),
    };
  }

  /** Configure which library subjects a section takes. Only subjects of the section's own class and stream are accepted. */
  static async setSectionSubjects(
    institutionId: string,
    sectionId: string,
    items: Array<{ centralSubjectId: string; periodsPerWeek?: number; practicalPeriodsPerWeek?: number; isOptional?: boolean; isActive?: boolean }>,
    actor: Actor
  ) {
    const { section, cls } = await this.loadSection(institutionId, sectionId);
    const medium = sectionMedium(section);
    if (!medium) throw { status: 400, message: `Set Section ${section.name}'s medium (English or Nepali) before choosing subjects`, code: 'MEDIUM_NOT_CONFIGURED' };
    const allowed = await CurriculumLibraryService.subjectsForGrade(cls.gradeNumber, cls.stream);
    const allowedIds = new Set(allowed.map((s: any) => String(s._id)));
    const results: any[] = [];
    const warnings: string[] = [];
    for (const item of items) {
      if (!isId(item.centralSubjectId)) throw { status: 400, message: 'Invalid subject id' };
      const subject: any = await CentralSubject.findById(item.centralSubjectId);
      if (!subject) throw { status: 404, message: 'Subject not found' };
      if (subject.gradeNumber !== cls.gradeNumber) {
        throw { status: 400, message: `${subject.name} is a Class ${subject.gradeNumber} subject and cannot be offered in Class ${cls.gradeNumber}`, code: 'SUBJECT_GRADE_MISMATCH' };
      }
      if (!allowedIds.has(String(subject._id))) {
        throw { status: 400, message: `${subject.name} (${subject.stream}) is not part of the ${cls.stream} stream for Class ${cls.gradeNumber}`, code: 'SUBJECT_STREAM_MISMATCH' };
      }
      if (subject.isActive === false) throw { status: 400, message: `${subject.name} is deactivated in the national library` };
      const periods = item.periodsPerWeek ?? 5;
      if (!Number.isInteger(periods) || periods < 0 || periods > 20) throw { status: 400, message: 'Periods per week must be a whole number between 0 and 20' };
      const practical = item.practicalPeriodsPerWeek ?? 0;
      if (!Number.isInteger(practical) || practical < 0 || practical > periods || practical % 2 !== 0) {
        throw { status: 400, message: `${subject.name}: practical periods must be an even number no larger than the periods per week` };
      }
      if (subject.logicalKey && !(subject.availableMedia || []).includes(medium)) {
        warnings.push(`${subject.name}: no ${medium === 'ENGLISH' ? 'English' : 'Nepali'} medium textbook exists in the library`);
      }
      const doc = await SectionSubject.findOneAndUpdate(
        { sectionId: section._id, centralSubjectId: subject._id },
        {
          $set: {
            institutionId,
            academicYearId: section.academicYearId,
            classId: cls._id,
            medium,
            periodsPerWeek: periods,
            practicalPeriodsPerWeek: practical,
            isOptional: item.isOptional ?? !subject.isCompulsory,
            isActive: item.isActive ?? true,
            configuredBy: actor.userId,
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
      results.push(doc);
    }
    await AuditService.log({
      operatorId: actor.userId,
      operatorRole: actor.role,
      action: 'SECTION_SUBJECTS_CONFIGURED',
      entityType: 'Section',
      entityId: sectionId,
      details: { institutionId, items },
    });
    return { offerings: results.map((r: any) => r.toJSON()), warnings };
  }

  // ── Teacher allocation ─────────────────────────────────────────────────────
  static async listAllocations(institutionId: string, filter: { sectionId?: string; teacherId?: string }) {
    const sectionIds = await this.institutionSectionIds(institutionId);
    const q: any = { sectionId: { $in: sectionIds }, status: { $ne: 'INACTIVE' } };
    if (filter.sectionId && isId(filter.sectionId)) q.sectionId = oid(filter.sectionId);
    if (filter.teacherId && isId(filter.teacherId)) q.teacherId = oid(filter.teacherId);
    const list: any[] = await SubjectAllocation.find(q).populate('teacherId', 'fullName status').populate('centralSubjectId', 'name nameNepali code gradeNumber logicalKey').populate({ path: 'sectionId', select: 'name medium classId', populate: { path: 'classId', select: 'gradeNumber name stream' } });
    return list.map((a) => ({
      id: String(a._id),
      teacher: a.teacherId ? { id: String(a.teacherId._id), name: a.teacherId.fullName, status: a.teacherId.status } : null,
      subject: a.centralSubjectId ? { id: String(a.centralSubjectId._id), name: a.centralSubjectId.name, nameNepali: a.centralSubjectId.nameNepali, code: a.centralSubjectId.code } : null,
      section: a.sectionId ? { id: String(a.sectionId._id), name: a.sectionId.name, medium: a.sectionId.medium } : null,
      class: a.sectionId?.classId ? { id: String(a.sectionId.classId._id), gradeNumber: a.sectionId.classId.gradeNumber, name: a.sectionId.classId.name, stream: a.sectionId.classId.stream } : null,
      medium: a.medium || a.sectionId?.medium,
      status: a.status || 'ACTIVE',
      assignedAt: a.assignedAt || a.createdAt,
    }));
  }

  /** Validate and save one teacher's allocation to one or more subjects of a section. */
  static async allocate(
    institutionId: string,
    body: { teacherId: string; sectionId: string; subjectIds: string[]; medium?: string; academicYearId?: string },
    actor: Actor
  ) {
    const subjectIds = Array.isArray(body.subjectIds) ? body.subjectIds : [];
    if (!subjectIds.length) throw { status: 400, message: 'Select at least one subject' };
    const { section, cls } = await this.loadSection(institutionId, body.sectionId);
    if (body.academicYearId && String(section.academicYearId) !== String(body.academicYearId)) {
      throw { status: 400, message: 'Section does not belong to the selected academic year' };
    }
    const medium = sectionMedium(section);
    if (!medium) throw { status: 400, message: `Section ${section.name} has no medium configured`, code: 'MEDIUM_NOT_CONFIGURED' };
    if (body.medium && body.medium !== medium) {
      throw { status: 400, message: `Section ${section.name} is ${medium === 'ENGLISH' ? 'English' : 'Nepali'} medium; the selected medium does not match`, code: 'MEDIUM_MISMATCH' };
    }

    if (!isId(body.teacherId)) throw { status: 400, message: 'Invalid teacher id' };
    const teacher: any = await User.findOne({ _id: body.teacherId, institutionId, role: 'TEACHER' });
    if (!teacher) throw { status: 404, message: 'Teacher not found in this institution', code: 'TEACHER_NOT_FOUND' };
    if (teacher.status !== 'ACTIVE') throw { status: 400, message: `${teacher.fullName} is ${teacher.status.toLowerCase()} and cannot be allocated`, code: 'TEACHER_INACTIVE' };
    const meta = teacher.metadata || {};

    const created: any[] = [];
    for (const subjectId of subjectIds) {
      if (!isId(subjectId)) throw { status: 400, message: 'Invalid subject id' };
      const subject: any = await CentralSubject.findById(subjectId);
      if (!subject) throw { status: 404, message: 'Subject not found' };
      if (subject.gradeNumber !== cls.gradeNumber) {
        throw { status: 400, message: `${subject.name} belongs to Class ${subject.gradeNumber}, not Class ${cls.gradeNumber}`, code: 'SUBJECT_GRADE_MISMATCH' };
      }
      const offered = await SectionSubject.findOne({ sectionId: section._id, centralSubjectId: subject._id, isActive: true });
      if (!offered) {
        throw { status: 400, message: `${subject.name} is not offered in Class ${cls.gradeNumber} ${section.name}. Add it under Academic Curriculum & Subjects first.`, code: 'SUBJECT_NOT_OFFERED' };
      }
      if (Array.isArray(meta.qualifiedSubjects) && meta.qualifiedSubjects.length && subject.logicalKey && !meta.qualifiedSubjects.includes(subject.logicalKey)) {
        throw { status: 400, message: `${teacher.fullName} is not qualified for ${subject.name} (qualified: ${meta.qualifiedSubjects.join(', ')})`, code: 'TEACHER_NOT_QUALIFIED' };
      }
      if (Array.isArray(meta.allowedGrades) && meta.allowedGrades.length && !meta.allowedGrades.includes(cls.gradeNumber)) {
        throw { status: 400, message: `${teacher.fullName} is not authorised to teach Class ${cls.gradeNumber}`, code: 'TEACHER_GRADE_NOT_ALLOWED' };
      }
      const existing: any = await SubjectAllocation.findOne({ sectionId: section._id, centralSubjectId: subject._id, status: { $ne: 'INACTIVE' } }).populate('teacherId', 'fullName');
      if (existing && String(existing.teacherId?._id || existing.teacherId) === String(teacher._id)) {
        throw { status: 409, message: `${teacher.fullName} is already allocated to ${subject.name} in ${section.name}`, code: 'DUPLICATE_ALLOCATION' };
      }
      if (existing) {
        throw {
          status: 409,
          message: `${subject.name} in Class ${cls.gradeNumber} ${section.name} is already allocated to ${existing.teacherId?.fullName}. Remove that allocation first.`,
          code: 'SUBJECT_ALREADY_ALLOCATED',
        };
      }
      const doc = await SubjectAllocation.findOneAndUpdate(
        { sectionId: section._id, centralSubjectId: subject._id, teacherId: teacher._id },
        {
          $set: {
            institutionId,
            academicYearId: section.academicYearId,
            classId: cls._id,
            medium,
            status: 'ACTIVE',
            assignedBy: actor.userId,
            assignedAt: new Date(),
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
      created.push(doc);
      await AuditService.log({
        operatorId: actor.userId,
        operatorRole: actor.role,
        action: 'TEACHER_SUBJECT_ALLOCATED',
        entityType: 'SubjectAllocation',
        entityId: String(doc._id),
        details: { institutionId, teacherId: String(teacher._id), sectionId: String(section._id), subjectId: String(subject._id), medium },
      });
    }
    return created.map((c) => c.toJSON());
  }

  static async removeAllocation(institutionId: string, allocationId: string, actor: Actor) {
    if (!isId(allocationId)) throw { status: 400, message: 'Invalid allocation id' };
    const alloc: any = await SubjectAllocation.findById(allocationId);
    if (!alloc) throw { status: 404, message: 'Allocation not found' };
    await this.loadSection(institutionId, String(alloc.sectionId));
    const live = await Timetable.find({ sectionId: alloc.sectionId, status: { $in: ['DRAFT', 'UNDER_REVIEW', 'PUBLISHED'] } }, '_id status version');
    const used = await TimetableEntry.countDocuments({ timetableId: { $in: live.map((t: any) => t._id) }, teacherId: alloc.teacherId, centralSubjectId: alloc.centralSubjectId });
    if (used) {
      throw { status: 409, message: `This allocation is used by ${used} timetable period(s). Reassign those periods first.`, code: 'ALLOCATION_IN_USE' };
    }
    await SubjectAllocation.updateOne({ _id: alloc._id }, { $set: { status: 'INACTIVE' } });
    await AuditService.log({ operatorId: actor.userId, operatorRole: actor.role, action: 'TEACHER_SUBJECT_UNALLOCATED', entityType: 'SubjectAllocation', entityId: allocationId, details: { institutionId } });
    return { id: allocationId, status: 'INACTIVE' };
  }

  /** Periods required (from offerings) and scheduled (from published / draft timetables) per teacher. */
  static async workload(institutionId: string) {
    const sectionIds = await this.institutionSectionIds(institutionId);
    const teachers: any[] = await User.find({ institutionId, role: 'TEACHER' }, 'fullName status metadata').sort({ fullName: 1 });
    const allocations: any[] = await SubjectAllocation.find({ sectionId: { $in: sectionIds }, status: { $ne: 'INACTIVE' } });
    const offerings: any[] = await SectionSubject.find({ sectionId: { $in: sectionIds }, isActive: true });
    const published: any[] = await Timetable.find({ sectionId: { $in: sectionIds }, status: 'PUBLISHED' }, '_id');
    const drafts: any[] = await Timetable.find({ sectionId: { $in: sectionIds }, status: { $in: ['DRAFT', 'UNDER_REVIEW'] } }, '_id');
    const count = async (ids: any[]) =>
      TimetableEntry.aggregate([{ $match: { timetableId: { $in: ids.map((t) => t._id) } } }, { $group: { _id: '$teacherId', n: { $sum: 1 } } }]);
    const [pub, dr] = await Promise.all([count(published), count(drafts)]);
    const inst: any = await Institution.findById(institutionId);
    const max = inst?.academicSettings?.maxTeacherPeriodsPerWeek || 30;
    return {
      maxPeriodsPerWeek: max,
      teachers: teachers.map((t) => {
        const mine = allocations.filter((a) => String(a.teacherId) === String(t._id));
        const required = mine.reduce((n, a) => {
          const off = offerings.find((o) => String(o.sectionId) === String(a.sectionId) && String(o.centralSubjectId) === String(a.centralSubjectId));
          return n + (off?.periodsPerWeek || 0);
        }, 0);
        const scheduledPublished = pub.find((p: any) => String(p._id) === String(t._id))?.n || 0;
        const scheduledDraft = dr.find((p: any) => String(p._id) === String(t._id))?.n || 0;
        return {
          id: String(t._id),
          name: t.fullName,
          status: t.status,
          allocations: mine.length,
          requiredPeriods: required,
          scheduledPublished,
          scheduledDraft,
          overloaded: required > max || scheduledPublished > max,
        };
      }),
    };
  }
}
