import {
  Section,
  StudentEnrollment,
  SubjectAllocation,
  ExamAssessment,
  StudentMark,
  AttendanceRecord,
  User,
} from '../../models';
import { NepalGradingUtil } from '../../common/utils/nepal-grading.util';

export class ClassTeacherService {
  /**
   * Helper to verify that the teacher is the designated Class Teacher of the section.
   */
  private static async verifyClassTeacher(
    teacherId: string,
    sectionId: string,
    institutionId?: string,
    userRole?: string
  ) {
    const section = await Section.findById(sectionId).populate('classId');
    if (!section) {
      throw { status: 404, message: 'Section not found', code: 'SECTION_NOT_FOUND' };
    }
    const cls = section.classId as any;
    if (!cls?.institutionId || (institutionId && cls.institutionId.toString() !== institutionId)) {
      throw { status: 403, message: 'Section does not belong to this institution', code: 'FORBIDDEN_TENANT' };
    }

    if (userRole === 'SCHOOL_ADMIN' || userRole === 'PRINCIPAL' || userRole === 'SUPER_ADMIN') {
      return section;
    }

    if (!section.classTeacherId || section.classTeacherId.toString() !== teacherId) {
      throw {
        status: 403,
        message: 'Forbidden: You are not the assigned Class Teacher for this section',
        code: 'NOT_CLASS_TEACHER',
      };
    }

    return section;
  }

  // ══════════════════════════════════════════════════════════════════
  // 1. CLASS TEACHER SECTION OVERVIEW
  // ══════════════════════════════════════════════════════════════════
  static async getSectionOverview(teacherId: string, sectionId: string, institutionId?: string, userRole?: string) {
    const section = await this.verifyClassTeacher(teacherId, sectionId, institutionId, userRole);

    const [students, allocations, attendanceHistory, recentExams] = await Promise.all([
      StudentEnrollment.find({ sectionId, status: 'ENROLLED' })
        .populate('studentId', 'fullName fullNameNepali username email status phone')
        .sort({ rollNumber: 1 }),
      SubjectAllocation.find({ sectionId })
        .populate('centralSubjectId', 'name nameNepali code creditHours')
        .populate('teacherId', 'fullName username email'),
      AttendanceRecord.find({ institutionId: (section.classId as any).institutionId, sectionId }).sort({ date: -1 }).limit(10),
      ExamAssessment.find({ institutionId: (section.classId as any).institutionId, sectionId }).populate('centralSubjectId', 'name code').sort({ createdAt: -1 }),
    ]);

    // Calculate overall section attendance rate
    let totalPresent = 0;
    let totalRecords = 0;
    attendanceHistory.forEach((rec) => {
      rec.records.forEach((item: any) => {
        totalRecords++;
        if (item.status === 'PRESENT' || item.status === 'LATE') totalPresent++;
      });
    });
    const avgAttendance = totalRecords > 0 ? `${Math.round((totalPresent / totalRecords) * 100)}%` : null;

    return {
      section,
      studentsCount: students.length,
      subjectsCount: allocations.length,
      averageAttendance: avgAttendance,
      students,
      subjects: allocations,
      recentAttendance: attendanceHistory,
      recentAssessments: recentExams,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. CONSOLIDATED SECTION RESULTS (ALL SUBJECTS)
  // ══════════════════════════════════════════════════════════════════
  static async getConsolidatedResults(
    teacherId: string,
    sectionId: string,
    institutionId?: string,
    examName?: string,
    userRole?: string
  ) {
    const section = await this.verifyClassTeacher(teacherId, sectionId, institutionId, userRole);

    // Get all assessments for this section (optionally filtered by exam term name)
    const examFilter: any = { institutionId: (section.classId as any).institutionId, sectionId };
    if (examName) {
      examFilter.name = examName;
    }

    const assessments = await ExamAssessment.find(examFilter).populate('centralSubjectId');
    if (!assessments.length) {
      return {
        section,
        assessments: [],
        consolidatedStudents: [],
        allSubjectsMarksSubmitted: false,
      };
    }

    const assessmentIds = assessments.map((a) => a._id);
    const allMarks = await StudentMark.find({ assessmentId: { $in: assessmentIds } });

    // Load enrolled students
    const enrollments = await StudentEnrollment.find({ sectionId, status: 'ENROLLED' })
      .populate('studentId', 'fullName fullNameNepali username')
      .sort({ rollNumber: 1 });

    // Map consolidated marksheet per student
    const consolidated = enrollments.map((enrollment) => {
      const student = enrollment.studentId as any;
      const studentIdStr = student._id.toString();

      const subjectMarks = assessments.map((asm) => {
        const mark = allMarks.find(
          (m) => m.studentId.toString() === studentIdStr && m.assessmentId.toString() === asm._id.toString()
        );
        const sub = asm.centralSubjectId as any;

        return {
          assessmentId: asm.id,
          subjectName: sub?.name || 'Subject',
          subjectCode: sub?.code,
          creditHours: sub?.creditHours || 4,
          totalMarks: asm.totalMarks,
          marksObtained: mark ? mark.marksObtained : null,
          grade: mark ? mark.grade : 'N/A',
          gpa: mark ? mark.gpa : 0,
          isSubmitted: !!mark,
        };
      });

      // Overall GPA calculation
      const validSubjectGpas = subjectMarks
        .filter((sm) => sm.isSubmitted)
        .map((sm) => ({ gpa: sm.gpa, creditHours: sm.creditHours }));

      const totalMarksObtained = subjectMarks
        .filter((sm) => sm.marksObtained !== null)
        .reduce((sum, sm) => sum + (sm.marksObtained || 0), 0);

      const totalMaxMarks = subjectMarks.reduce((sum, sm) => sum + sm.totalMarks, 0);
      const overallGpa = NepalGradingUtil.calculateOverallGPA(validSubjectGpas);
      const percentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;
      const overallGrade = NepalGradingUtil.calculateGrade(percentage).grade;

      return {
        studentId: student._id,
        rollNumber: enrollment.rollNumber,
        admissionNumber: enrollment.admissionNumber,
        fullName: student.fullName,
        fullNameNepali: student.fullNameNepali,
        subjectMarks,
        totalMarksObtained,
        totalMaxMarks,
        percentage,
        overallGpa,
        overallGrade,
      };
    });

    return {
      section,
      assessments,
      consolidatedStudents: consolidated,
      allSubjectsMarksSubmitted: allMarks.length >= assessments.length * enrollments.length,
      isPublished: assessments.every((a) => a.isPublished),
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. PUBLISH AUTHORIZED SECTION RESULTS
  // ══════════════════════════════════════════════════════════════════
  static async publishSectionResults(
    teacherId: string,
    sectionId: string,
    assessmentIds: string[],
    institutionId?: string,
    userRole: string = 'TEACHER'
  ) {
    const section = await this.verifyClassTeacher(teacherId, sectionId, institutionId, userRole);
    const resolvedInstitutionId = ((section.classId as any).institutionId as any).toString();
    if (!['PRINCIPAL', 'SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      throw { status: 403, message: 'Only institutional administrators can publish approved results.', code: 'FORBIDDEN' };
    }
    if (!Array.isArray(assessmentIds) || assessmentIds.length === 0) {
      throw { status: 400, message: 'Select at least one assessment to publish.', code: 'ASSESSMENTS_REQUIRED' };
    }

    const assessments = await ExamAssessment.find({
      _id: { $in: assessmentIds },
      sectionId,
      institutionId: resolvedInstitutionId,
    });
    if (assessments.length !== new Set(assessmentIds.map(String)).size) {
      throw { status: 400, message: 'One or more assessments do not belong to this section.', code: 'INVALID_ASSESSMENTS' };
    }
    if (assessments.some((assessment) => assessment.workflowStatus !== 'APPROVED')) {
      throw { status: 409, message: 'Every selected assessment must be approved before publication.', code: 'RESULTS_NOT_APPROVED' };
    }

    const { AssessmentService } = await import('../assessment/assessment.service');
    for (const assessment of assessments) {
      await AssessmentService.transitionWorkflow({
        assessmentId: assessment.id,
        institutionId: resolvedInstitutionId,
        targetStatus: 'PUBLISHED',
        actorId: teacherId,
        actorRole: userRole,
      });
    }

    return {
      sectionId,
      publishedAssessmentsCount: assessments.length,
      publishedAt: new Date(),
      status: 'PUBLISHED',
    };
  }
}
