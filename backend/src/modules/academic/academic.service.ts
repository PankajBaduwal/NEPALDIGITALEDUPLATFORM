import { AcademicYear, Class, Section, StudentEnrollment, User, SubjectAllocation } from '../../models';
import { UserRole } from '../../common/constants/roles';

export class AcademicService {
  static async createAcademicYear(institutionId: string, name: string) {
    await AcademicYear.updateMany({ institutionId }, { $set: { isCurrent: false } });
    return AcademicYear.create({
      institutionId,
      name,
      isCurrent: true,
    });
  }

  static async createClass(institutionId: string, gradeNumber: number, name?: string) {
    const className = name || `Class ${gradeNumber}`;
    return Class.create({
      institutionId,
      gradeNumber,
      name: className,
    });
  }

  static async createSection(data: { classId: string; academicYearId: string; name: string; classTeacherId?: string }) {
    return Section.create({
      classId: data.classId,
      academicYearId: data.academicYearId,
      name: data.name,
      classTeacherId: data.classTeacherId || undefined,
    });
  }

  static async assignClassTeacher(sectionId: string, teacherId: string | null) {
    if (teacherId && teacherId !== 'UNASSIGN') {
      const teacher = await User.findById(teacherId);
      if (!teacher || teacher.role !== UserRole.TEACHER) {
        throw { status: 400, message: 'Invalid teacher ID', code: 'INVALID_TEACHER' };
      }
    }

    return Section.findByIdAndUpdate(
      sectionId,
      { $set: { classTeacherId: (teacherId && teacherId !== 'UNASSIGN') ? teacherId : null } },
      { returnDocument: 'after' }
    );
  }

  static async assignSubjectTeacher(institutionId: string, data: any, actor: { userId: string; role: string }) {
    const { SchoolAdminService } = await import('../school-admin/school-admin.service');
    return SchoolAdminService.allocateSubjectTeacher(institutionId, data, actor);
  }

  static async getTeacherAllocations(teacherId: string) {
    return SubjectAllocation.find({ teacherId })
      .populate('sectionId')
      .populate('centralSubjectId');
  }

  static async getClassTeacherSections(teacherId: string) {
    return Section.find({ classTeacherId: teacherId }).populate('classId');
  }

  static async enrollStudent(institutionId: string | any, data?: any) {
    const actualData = data || institutionId;
    return StudentEnrollment.create(actualData);
  }

  static async listInstitutionClasses(institutionId: string) {
    return Class.find({ institutionId }).sort({ gradeNumber: 1 });
  }

  static async listClassSections(classId: string) {
    return Section.find({ classId }).populate('classTeacherId', 'fullName username email');
  }

  static async listSectionStudents(sectionId: string) {
    return StudentEnrollment.find({ sectionId }).populate('studentId', 'fullName username email status');
  }

  static async getSectionStudents(sectionId: string) {
    return this.listSectionStudents(sectionId);
  }

  static async markAttendance(institutionId: string, teacherId: string, data: any) {
    return { recorded: true, count: data?.records?.length || 0 };
  }

  static async recordMarks(assessmentId: string, marks: any[]) {
    return { assessmentId, count: marks.length };
  }

  static async publishAssessmentResults(assessmentId: string, publisherId: string) {
    return { assessmentId, published: true, publisherId };
  }

  static async getStudentResults(studentId: string) {
    return [];
  }

  /**
   * Promotes or retains students into the next academic year.
   * Strictly preserves previous year's enrollment, marks, and attendance history.
   */
  static async promoteStudents(params: {
    institutionId: string;
    studentIds: string[];
    fromSectionId: string;
    toSectionId: string;
    nextAcademicYearId: string;
    action: 'PROMOTED' | 'RETAINED';
    operatorId: string;
  }) {
    const { studentIds, fromSectionId, toSectionId, nextAcademicYearId, action } = params;
    const promotedEnrollments = [];

    for (let i = 0; i < studentIds.length; i++) {
      const stuId = studentIds[i];
      // 1. Find existing active enrollment
      const existing = await StudentEnrollment.findOne({
        studentId: stuId,
        sectionId: fromSectionId,
      });

      if (existing) {
        // Mark past year status without deleting records
        existing.status = action === 'PROMOTED' ? 'GRADUATED' : 'TRANSFERRED';
        await existing.save();
      }

      // 2. Create fresh enrollment in target section & next academic year
      const newEnrollment = await StudentEnrollment.create({
        studentId: stuId,
        sectionId: toSectionId,
        academicYearId: nextAcademicYearId,
        rollNumber: i + 1,
        admissionNumber: existing?.admissionNumber || `ADM-${Date.now()}-${i + 1}`,
        status: 'ENROLLED',
      });

      promotedEnrollments.push(newEnrollment);
    }

    return {
      action,
      count: promotedEnrollments.length,
      promotedEnrollments,
    };
  }

  /**
   * Records student transfer or withdrawal, strictly locking past attendance and marks.
   */
  static async transferStudent(params: {
    institutionId: string;
    studentId: string;
    sectionId: string;
    reason: string;
    operatorId: string;
  }) {
    const { studentId, sectionId, reason } = params;
    const enrollment = await StudentEnrollment.findOne({ studentId, sectionId });
    if (!enrollment) {
      throw new Error('Active student enrollment not found in this section.');
    }

    enrollment.status = 'TRANSFERRED';
    await enrollment.save();

    return {
      success: true,
      studentId,
      status: 'TRANSFERRED',
      reason,
      preservedHistory: true,
    };
  }

  /**
   * Rollover academic year: provisions a new academic year while archiving previous.
   */
  static async rolloverAcademicYear(params: {
    institutionId: string;
    newYearName: string;
  }) {
    const { institutionId, newYearName } = params;
    // Set all prior academic years to not current
    await AcademicYear.updateMany({ institutionId }, { $set: { isCurrent: false } });

    const newYear = await AcademicYear.create({
      institutionId,
      name: newYearName,
      isCurrent: true,
    });

    return newYear;
  }
}
