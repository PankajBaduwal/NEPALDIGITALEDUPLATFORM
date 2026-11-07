import { Section, SubjectAllocation } from '../../models';

/**
 * Confirms a teacher may publish content (assignments, quizzes, materials, notes) to a section:
 * the section must belong to the teacher's institution and the teacher must be allocated to it
 * (for the given subject when one is supplied).
 * Returns the section's real classId so callers never trust a client-supplied one.
 * Allocation documents do not always carry institutionId, so tenancy is verified through the section's class.
 */
export async function assertTeacherTeachesSection(
  teacherId: string,
  institutionId: string,
  sectionId: string,
  centralSubjectId?: string
): Promise<{ classId: string }> {
  const section: any = await Section.findById(sectionId).populate('classId', 'institutionId');
  if (!section || String(section.classId?.institutionId) !== String(institutionId)) {
    throw { status: 404, message: 'Section not found in your institution', code: 'SECTION_NOT_FOUND' };
  }
  const filter: any = { sectionId, teacherId, status: { $ne: 'INACTIVE' } };
  if (centralSubjectId) filter.centralSubjectId = centralSubjectId;
  const allocated = await SubjectAllocation.exists(filter);
  if (!allocated) {
    throw {
      status: 403,
      message: 'You are not assigned to teach this subject in this section',
      code: 'NOT_ALLOCATED',
    };
  }
  return { classId: String(section.classId._id) };
}

/** Class-wide content (no section chosen): the teacher must teach the subject in at least one section of that class. */
export async function assertTeacherTeachesClass(
  teacherId: string,
  institutionId: string,
  classId: string,
  centralSubjectId?: string
): Promise<{ classId: string }> {
  const sections: any[] = await Section.find({ classId }).populate('classId', 'institutionId');
  const ownSections = sections.filter((s) => String(s.classId?.institutionId) === String(institutionId));
  if (ownSections.length === 0) {
    throw { status: 404, message: 'Class not found in your institution', code: 'CLASS_NOT_FOUND' };
  }
  const filter: any = { sectionId: { $in: ownSections.map((s) => s._id) }, teacherId, status: { $ne: 'INACTIVE' } };
  if (centralSubjectId) filter.centralSubjectId = centralSubjectId;
  if (!(await SubjectAllocation.exists(filter))) {
    throw { status: 403, message: 'You are not assigned to teach this subject in this class', code: 'NOT_ALLOCATED' };
  }
  return { classId: String(classId) };
}
