import mongoose from 'mongoose';
import {
  Section,
  StudentEnrollment,
  SubjectAllocation,
  ExamAssessment,
  Examination,
  StudentMark,
  AttendanceRecord,
  Institution,
  AcademicYear,
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
  // 2. CONSOLIDATED SECTION RESULTS FOR ONE EXAMINATION (marksheet + report cards)
  // ══════════════════════════════════════════════════════════════════
  /** Teaching order used on report cards: Nepali, English, Mathematics, Science, Social, then the rest by name. */
  private static subjectRank(code?: string) {
    const order = ['NEP', 'ENG', 'MTH', 'SCI', 'SOC', 'SER'];
    const i = order.findIndex((p) => (code || '').toUpperCase().startsWith(p));
    return i >= 0 ? i : 50;
  }

  static async getConsolidatedResults(
    teacherId: string,
    sectionId: string,
    institutionId?: string,
    examRef?: string,
    userRole?: string
  ) {
    const section = await this.verifyClassTeacher(teacherId, sectionId, institutionId, userRole);
    return this.buildExamReport(section, examRef);
  }

  /**
   * The marksheet of one examination for a whole section (no access check: callers verify access first).
   * Shared by the class teacher console, the printable report card and the report-card PDF.
   */
  static async buildExamReport(section: any, examRef?: string) {
    const sectionId = section._id;
    const cls = section.classId as any;
    const instId = cls.institutionId;

    const [institution, academicYear] = await Promise.all([
      Institution.findById(instId).lean() as any,
      AcademicYear.findById(section.academicYearId).lean() as any,
    ]);

    // Every examination that has assessments for this section, with how many marks are in
    const sectionAssessments: any[] = await ExamAssessment.find({ institutionId: instId, sectionId, examinationId: { $ne: null } })
      .select('examinationId')
      .lean();
    const examIds = [...new Set(sectionAssessments.map((a) => String(a.examinationId)))].map((id) => new mongoose.Types.ObjectId(id));
    const exams: any[] = examIds.length ? await Examination.find({ _id: { $in: examIds } }).sort({ startDate: 1 }).lean() : [];
    const markCounts: any[] = examIds.length
      ? await StudentMark.aggregate([{ $match: { examinationId: { $in: examIds }, sectionId: section._id } }, { $group: { _id: '$examinationId', n: { $sum: 1 } } }])
      : [];
    const marksByExam = new Map(markCounts.map((c) => [String(c._id), c.n as number]));
    const examList = exams.map((e) => ({
      id: String(e._id), name: e.name, code: e.code, examType: e.examType, startDate: e.startDate, endDate: e.endDate,
      status: e.status, isPublished: !!e.isPublished, marksEntered: marksByExam.get(String(e._id)) || 0,
    }));

    // Which examination? An id or name/code from the page, otherwise the best default (latest published terminal exam with marks)
    let selected: any = null;
    if (examRef) {
      if (mongoose.isValidObjectId(examRef)) selected = exams.find((e) => String(e._id) === examRef) || null;
      if (!selected) {
        const q = examRef.trim().toLowerCase();
        selected = exams.find((e) => e.name.toLowerCase() === q || String(e.code).toLowerCase() === q) || null;
      }
    }
    if (!selected) {
      const withMarks = exams.filter((e) => (marksByExam.get(String(e._id)) || 0) > 0);
      const pool = withMarks.length ? withMarks : exams;
      const terminal = pool.filter((e) => e.isPublished && ['TERMINAL', 'FINAL'].includes(e.examType));
      const published = pool.filter((e) => e.isPublished);
      const latest = (arr: any[]) => arr.slice().sort((a, b) => +new Date(b.startDate) - +new Date(a.startDate))[0];
      selected = (terminal.length && latest(terminal)) || (published.length && latest(published)) || (pool.length && latest(pool)) || null;
    }

    const empty = {
      section, institution, academicYear, examinations: examList, examination: null as any, assessments: [] as any[],
      consolidatedStudents: [] as any[], allSubjectsMarksSubmitted: false, isPublished: false,
    };
    if (!selected) return empty;

    const assessments: any[] = (await ExamAssessment.find({ institutionId: instId, sectionId, examinationId: selected._id }).populate('centralSubjectId')).sort(
      (a: any, b: any) =>
        this.subjectRank(a.centralSubjectId?.code) - this.subjectRank(b.centralSubjectId?.code) ||
        String(a.centralSubjectId?.name).localeCompare(String(b.centralSubjectId?.name))
    );
    const selectedInfo = {
      id: String(selected._id), name: selected.name, code: selected.code, examType: selected.examType, startDate: selected.startDate, endDate: selected.endDate,
      status: selected.status, isPublished: !!selected.isPublished,
    };
    if (!assessments.length) return { ...empty, examination: selectedInfo };

    const assessmentIds = assessments.map((a) => a._id);
    const [allMarks, enrollments, principal, classTeacher, attendanceDocs]: any[] = await Promise.all([
      StudentMark.find({ assessmentId: { $in: assessmentIds } }),
      StudentEnrollment.find({ sectionId, status: 'ENROLLED' }).populate('studentId', 'fullName fullNameNepali username').sort({ rollNumber: 1 }),
      User.findOne({ institutionId: instId, role: 'PRINCIPAL' }).select('fullName fullNameNepali').lean(),
      section.classTeacherId ? User.findById(section.classTeacherId).select('fullName fullNameNepali').lean() : null,
      AttendanceRecord.find({ sectionId, periodNumber: 1, date: { $lte: new Date() } }).select('records.studentId records.status').lean(),
    ]);

    // Year-to-date daily attendance per student
    const att = new Map<string, { present: number; absent: number; late: number; leave: number; total: number }>();
    for (const doc of attendanceDocs) {
      for (const r of doc.records || []) {
        const k = String(r.studentId);
        const a = att.get(k) || { present: 0, absent: 0, late: 0, leave: 0, total: 0 };
        a.total++;
        if (r.status === 'PRESENT') a.present++;
        else if (r.status === 'LATE') a.late++;
        else if (r.status === 'ABSENT') a.absent++;
        else a.leave++;
        att.set(k, a);
      }
    }

    const markMap = new Map<string, any>();
    allMarks.forEach((mk: any) => markMap.set(`${mk.studentId}|${mk.assessmentId}`, mk));

    const rows: any[] = enrollments
      .filter((e: any) => e.studentId)
      .map((enrollment: any) => {
        const student = enrollment.studentId as any;
        const sid = String(student._id);
        const subjectMarks = assessments.map((asm: any) => {
          const mk = markMap.get(`${sid}|${asm._id}`);
          const sub = asm.centralSubjectId as any;
          const pct = mk ? Math.round(((mk.marksObtained || 0) / (asm.totalMarks || 1)) * 1000) / 10 : null;
          const g = mk ? NepalGradingUtil.calculateGrade(pct as number) : null;
          return {
            assessmentId: asm.id,
            subjectName: sub?.name || 'Subject',
            subjectNameNepali: sub?.nameNepali,
            subjectCode: sub?.code,
            creditHours: sub?.creditHours || 4,
            totalMarks: asm.totalMarks,
            passMarks: asm.passMarks,
            fullMarksTheory: asm.fullMarksTheory,
            fullMarksPractical: asm.fullMarksPractical,
            theoryMarks: mk ? (mk.theoryMarks ?? mk.marksTheory ?? null) : null,
            practicalMarks: mk ? (mk.practicalMarks ?? mk.marksPractical ?? null) : null,
            marksObtained: mk ? mk.marksObtained : null,
            percentage: pct,
            grade: mk ? mk.grade : null,
            gpa: mk ? mk.gpa : null,
            remark: g ? g.description : null,
            isPassed: mk ? mk.grade !== 'NG' : null,
            isSubmitted: !!mk,
            workflowStatus: mk ? mk.workflowStatus : asm.workflowStatus,
          };
        });

        const entered = subjectMarks.filter((sm) => sm.isSubmitted);
        const totalMarksObtained = entered.reduce((s, sm) => s + (sm.marksObtained || 0), 0);
        const totalMaxMarks = entered.reduce((s, sm) => s + sm.totalMarks, 0);
        const totalFullMarks = subjectMarks.reduce((s, sm) => s + sm.totalMarks, 0);
        const overallGpa = NepalGradingUtil.calculateOverallGPA(entered.map((sm) => ({ gpa: sm.gpa || 0, creditHours: sm.creditHours })));
        const percentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 1000) / 10 : 0;
        const complete = entered.length === subjectMarks.length;
        const failed = entered.filter((sm) => sm.isPassed === false).map((sm) => sm.subjectName);
        const missing = subjectMarks.filter((sm) => !sm.isSubmitted).map((sm) => sm.subjectName);
        const base = NepalGradingUtil.calculateGrade(percentage);
        const result = !entered.length ? 'NO_MARKS' : failed.length ? 'NOT_PASSED' : complete ? 'PASSED' : 'INCOMPLETE';
        const a = att.get(sid);
        return {
          studentId: student._id,
          rollNumber: enrollment.rollNumber,
          admissionNumber: enrollment.admissionNumber,
          guardianName: enrollment.guardianName,
          guardianPhone: enrollment.guardianPhone,
          fullName: student.fullName,
          fullNameNepali: student.fullNameNepali,
          username: student.username,
          subjectMarks,
          totalMarksObtained,
          totalMaxMarks,
          totalFullMarks,
          percentage,
          overallGpa: entered.length ? overallGpa : 0,
          overallGrade: !entered.length ? '—' : failed.length ? 'NG' : base.grade,
          overallRemark: failed.length ? 'Non-Graded' : base.description,
          complete,
          result,
          failedSubjects: failed,
          missingSubjects: missing,
          rank: null as number | null,
          attendance: a ? { ...a, percentage: Math.round(((a.present + a.late) / a.total) * 100) } : null,
        };
      });

    // Position in class (only for students whose results are complete and passed); equal percentages share a position
    const ranked = rows.filter((r) => r.complete && r.result === 'PASSED').sort((x, y) => y.percentage - x.percentage);
    ranked.forEach((r, i) => {
      r.rank = i > 0 && ranked[i - 1].percentage === r.percentage ? (ranked[i - 1].rank as number) : i + 1;
    });

    return {
      section,
      institution,
      academicYear,
      examinations: examList,
      examination: selectedInfo,
      assessments,
      consolidatedStudents: rows,
      principal,
      classTeacher,
      allSubjectsMarksSubmitted: allMarks.length >= assessments.length * rows.length,
      isPublished: assessments.every((a: any) => a.isPublished),
      rankedCount: ranked.length,
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
