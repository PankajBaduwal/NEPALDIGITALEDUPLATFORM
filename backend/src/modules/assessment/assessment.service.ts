import { schoolDayStart } from '../../common/utils/school-day.util';
import mongoose from 'mongoose';
import {
  AttendanceSession,
  AttendanceRecord,
  Examination,
  ExamAssessment,
  StudentMark,
  MarksAuditLog,
  GradingScheme,
  User,
  Section,
  Class,
  StudentEnrollment,
  SubjectAllocation,
  CentralSubject,
  AttendanceStatusType,
  MarksWorkflowStatus,
  ExaminationType,
} from '../../models';
import { NepalGradingUtil } from '../../common/utils/nepal-grading.util';
import { SocketService } from '../../common/services/socket.service';

export class AssessmentService {
  private static async getStudentEnrollment(studentId: string, institutionId: string) {
    const student = await User.findOne({ _id: studentId, institutionId, role: 'STUDENT', status: 'ACTIVE' }).select('_id');
    if (!student) throw { status: 404, message: 'Student not found for this institution.', code: 'STUDENT_NOT_FOUND' };
    const enrollments = await StudentEnrollment.find({ studentId, status: 'ENROLLED' })
      .populate({ path: 'sectionId', populate: { path: 'classId', select: 'institutionId' } })
      .populate('academicYearId', 'institutionId isCurrent')
      .sort({ createdAt: -1 });
    const valid = enrollments.filter((entry: any) => {
      const section = entry.sectionId as any;
      const cls = section?.classId as any;
      const year = entry.academicYearId as any;
      return String(cls?.institutionId || '') === institutionId && String(year?.institutionId || '') === institutionId;
    });
    const enrollment = valid.find((entry: any) => (entry.academicYearId as any)?.isCurrent) || valid[0];
    if (!enrollment) throw { status: 404, message: 'No active enrollment was found for this institution.', code: 'ENROLLMENT_NOT_FOUND' };
    return enrollment;
  }

  private static async getInstitutionSection(
    institutionId: string,
    sectionId: string,
    actorId?: string,
    actorRole?: string
  ) {
    const section = await Section.findById(sectionId).populate('classId');
    const cls = section?.classId as any;
    if (!section || String(cls?.institutionId || '') !== institutionId) {
      throw { status: 404, message: 'Section not found for this institution.', code: 'SECTION_NOT_FOUND' };
    }
    if (actorRole === 'TEACHER' && String(section.classTeacherId || '') !== actorId) {
      throw { status: 403, message: 'Only the assigned class teacher can access this section results view.', code: 'NOT_CLASS_TEACHER' };
    }
    return section;
  }

  // ══════════════════════════════════════════════════════════════════
  // 1. ATTENDANCE MANAGEMENT (Subject & Class Bulk Marking)
  // ══════════════════════════════════════════════════════════════════

  /**
   * Records or updates a class/subject attendance session with bulk student records.
   */
  static async recordAttendanceSession(params: {
    institutionId: string;
    actorRole: string;
    academicYearId?: string;
    classId?: string;
    sectionId: string;
    centralSubjectId?: string;
    periodNumber?: number;
    date: string | Date;
    takenBy: string;
    records: Array<{
      studentId: string;
      status: AttendanceStatusType;
      remarks?: string;
    }>;
    remarks?: string;
  }) {
    const {
      institutionId,
      academicYearId,
      classId,
      sectionId,
      centralSubjectId,
      periodNumber = 1,
      date,
      takenBy,
      actorRole,
      records,
      remarks,
    } = params;

    const section = await Section.findById(sectionId).populate('classId');
    const sectionClass = section?.classId as any;
    if (!section || String(sectionClass?.institutionId || '') !== institutionId) {
      throw { status: 404, message: 'Section not found for this institution.', code: 'SECTION_NOT_FOUND' };
    }
    if (classId && String(sectionClass._id) !== String(classId)) {
      throw { status: 400, message: 'Class does not match the selected section.', code: 'SECTION_CLASS_MISMATCH' };
    }
    if (academicYearId && String(section.academicYearId) !== String(academicYearId)) {
      throw { status: 400, message: 'Academic year does not match the selected section.', code: 'ACADEMIC_YEAR_MISMATCH' };
    }
    if (centralSubjectId) {
      const allocation = await SubjectAllocation.exists({
        sectionId,
        centralSubjectId,
        ...(actorRole === 'TEACHER' ? { teacherId: takenBy } : {}),
        status: { $ne: 'INACTIVE' },
      });
      if (!allocation) {
        throw { status: 403, message: 'You are not assigned to record attendance for this subject and section.', code: 'UNAUTHORIZED_ALLOCATION' };
      }
    } else if (actorRole === 'TEACHER' && String(section.classTeacherId || '') !== takenBy) {
      throw { status: 403, message: 'Only the assigned class teacher can record daily attendance for this section.', code: 'NOT_CLASS_TEACHER' };
    }

    const enrolledIds = await StudentEnrollment.distinct('studentId', { sectionId, status: 'ENROLLED' });
    const submittedIds = records.map((record) => String(record.studentId));
    const enrolledIdSet = new Set(enrolledIds.map(String));
    if (
      submittedIds.length !== enrolledIds.length ||
      new Set(submittedIds).size !== submittedIds.length ||
      submittedIds.some((id) => !enrolledIdSet.has(id))
    ) {
      throw { status: 400, message: 'Attendance must include each enrolled student exactly once.', code: 'INVALID_ATTENDANCE_ROSTER' };
    }

    // Normalize date to YYYY-MM-DD UTC start
    const attendanceDate = schoolDayStart(date);

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let leaveCount = 0;

    records.forEach((r) => {
      if (r.status === 'PRESENT') presentCount++;
      else if (r.status === 'ABSENT') absentCount++;
      else if (r.status === 'LATE') lateCount++;
      else if (r.status === 'LEAVE' || r.status === 'EXCUSED') leaveCount++;
    });

    // Upsert AttendanceSession
    const sessionDoc = await AttendanceSession.findOneAndUpdate(
      {
        institutionId,
        sectionId,
        centralSubjectId: centralSubjectId || null,
        date: attendanceDate,
        periodNumber,
      },
      {
        $set: {
          institutionId,
          academicYearId,
          classId,
          sectionId,
          centralSubjectId,
          periodNumber,
          date: attendanceDate,
          takenBy,
          totalStudents: records.length,
          presentCount,
          absentCount,
          lateCount,
          leaveCount,
          remarks,
          status: 'SUBMITTED',
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Upsert individual student attendance records
    for (const item of records) {
      await AttendanceRecord.findOneAndUpdate(
        {
          institutionId,
          sectionId,
          centralSubjectId: centralSubjectId || null,
          date: attendanceDate,
          studentId: item.studentId,
          periodNumber,
        },
        {
          $set: {
            institutionId,
            academicYearId,
            classId,
            sectionId,
            centralSubjectId,
            periodNumber,
            date: attendanceDate,
            sessionId: sessionDoc._id,
            recordedBy: takenBy,
            studentId: item.studentId,
            status: item.status,
            remarks: item.remarks,
            records: [{ studentId: item.studentId, status: item.status, remarks: item.remarks }],
          },
        },
        { upsert: true }
      );
    }

    // NOTE: a legacy batch record used to be written here too. It duplicated every student in
    // analytics (each student counted twice), so only the per-student records above are stored now.

    // Real-time broadcast
    SocketService.emitAttendanceMarked(institutionId, sectionId, {
      sessionId: sessionDoc.id,
      sectionId,
      centralSubjectId,
      date: attendanceDate,
      totalStudents: records.length,
      presentCount,
      absentCount,
      lateCount,
      leaveCount,
    });

    return sessionDoc;
  }

  /**
   * Lists attendance sessions with filters
   */
  static async listAttendanceSessions(params: {
    institutionId: string;
    sectionId?: string;
    centralSubjectId?: string;
    startDate?: string | Date;
    endDate?: string | Date;
    actorId: string;
    actorRole: string;
  }) {
    const filter: any = { institutionId: params.institutionId };
    if (params.actorRole === 'TEACHER') {
      if (!params.sectionId) {
        throw { status: 400, message: 'A section must be selected to view attendance.', code: 'SECTION_REQUIRED' };
      }
      const section = await this.getInstitutionSection(params.institutionId, params.sectionId);
      const isClassTeacher = String(section.classTeacherId || '') === params.actorId;
      const isSubjectTeacher = await SubjectAllocation.exists({
        sectionId: params.sectionId,
        teacherId: params.actorId,
        status: { $ne: 'INACTIVE' },
      });
      if (!isClassTeacher && !isSubjectTeacher) {
        throw { status: 403, message: 'You are not assigned to this section.', code: 'SECTION_ACCESS_DENIED' };
      }
      filter.sectionId = params.sectionId;
    } else if (params.sectionId) {
      await this.getInstitutionSection(params.institutionId, params.sectionId);
      filter.sectionId = params.sectionId;
    }
    if (params.centralSubjectId) filter.centralSubjectId = params.centralSubjectId;
    if (params.startDate || params.endDate) {
      filter.date = {};
      if (params.startDate) filter.date.$gte = new Date(params.startDate);
      if (params.endDate) filter.date.$lte = new Date(params.endDate);
    }

    return AttendanceSession.find(filter)
      .populate('takenBy', 'fullName email')
      .populate('centralSubjectId', 'name code')
      .sort({ date: -1, periodNumber: -1 });
  }

  /**
   * Retrieves personal attendance log & metrics for a student with policy support
   * (e.g. Approved leave excluded from denominator, mid-year joiner date boundaries, and 75% warning).
   */
  static async getStudentAttendance(
    studentId: string,
    institutionId: string,
    sectionId?: string,
    policy: 'EXCLUDE_APPROVED_LEAVE' | 'INCLUDE_ALL' = 'EXCLUDE_APPROVED_LEAVE',
    actorId?: string,
    actorRole?: string
  ) {
    const enrollment: any = await this.getStudentEnrollment(studentId, institutionId);

    const activeSectionId = String((enrollment.sectionId as any)._id);
    if (sectionId && String(sectionId) !== activeSectionId) {
      throw { status: 403, message: 'Attendance is only available for the student’s active section.', code: 'SECTION_ACCESS_DENIED' };
    }
    if (actorRole === 'TEACHER') {
      const section = await this.getInstitutionSection(institutionId, activeSectionId);
      const isClassTeacher = String(section.classTeacherId || '') === actorId;
      const isSubjectTeacher = await SubjectAllocation.exists({
        sectionId: activeSectionId,
        teacherId: actorId,
        status: { $ne: 'INACTIVE' },
      });
      if (!isClassTeacher && !isSubjectTeacher) {
        throw { status: 403, message: 'You are not assigned to the student’s section.', code: 'SECTION_ACCESS_DENIED' };
      }
    }

    const filter: any = {
      institutionId,
      sectionId: activeSectionId,
      $or: [{ studentId }, { 'records.studentId': studentId }],
    };

    // Mid-year joiner boundary: exclude sessions held before student was admitted
    if ((enrollment as any).enrollmentDate) {
      filter.date = { $gte: new Date((enrollment as any).enrollmentDate) };
    }

    const records = await AttendanceRecord.find(filter).sort({ date: -1 }).limit(200);
    const sessions = new Map<string, { status: AttendanceStatusType | undefined; date: Date }>();
    records.forEach((record: any) => {
      const item = record.records?.find((entry: any) => entry.studentId?.toString() === studentId);
      const status = record.status || item?.status;
      const dateKey = new Date(record.date).toISOString().slice(0, 10);
      const key = record.sessionId
        ? String(record.sessionId)
        : `${dateKey}:${String(record.centralSubjectId || 'DAILY')}:${record.periodNumber || 1}`;
      if (!sessions.has(key) || record.sessionId) {
        sessions.set(key, { status, date: record.date });
      }
    });

    let total = 0;
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;

    sessions.forEach(({ status }) => {
      if (!status) return;
      total++;
      if (status === 'PRESENT') present++;
      else if (status === 'ABSENT') absent++;
      else if (status === 'LATE') late++;
      else if (status === 'LEAVE' || status === 'EXCUSED') leave++;
    });

    // Attendance calculation policy:
    // When EXCLUDE_APPROVED_LEAVE is active, approved medical/official leave is excluded from required days
    const denominator = policy === 'EXCLUDE_APPROVED_LEAVE' ? Math.max(0, total - leave) : total;
    const rate = denominator > 0 ? Math.round(((present + late * 0.8) / denominator) * 100) : null;

    // Ministry of Education / NEB 75% attendance threshold
    const hasAttendanceWarning = rate !== null && rate < 75;
    const warningMessage = hasAttendanceWarning
      ? 'Attendance rate is below the 75% minimum requirement set by the National Examination Board (NEB) / CDC.'
      : null;

    return {
      totalDays: total,
      effectiveWorkingDays: denominator,
      present,
      absent,
      late,
      leave,
      attendanceRate: rate,
      hasAttendanceWarning,
      warningMessage,
      policy,
      history: records,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. EXAMINATION CONFIGURATION (Principal / Admin)
  // ══════════════════════════════════════════════════════════════════

  /**
   * Creates a new examination event
   */
  static async createExamination(params: {
    institutionId: string;
    academicYearId: string;
    name: string;
    code: string;
    examType: ExaminationType;
    startDate: string | Date;
    endDate: string | Date;
    applicableGrades?: number[];
    weightagePercentage?: number;
  }) {
    const exam = new Examination({
      ...params,
      startDate: new Date(params.startDate),
      endDate: new Date(params.endDate),
      applicableGrades: params.applicableGrades || [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      weightagePercentage: params.weightagePercentage || 100,
      status: 'SCHEDULED',
      isPublished: false,
    });

    await exam.save();
    SocketService.emitExaminationCreated(params.institutionId, {
      examinationId: exam.id,
      name: exam.name,
      code: exam.code,
      examType: exam.examType,
    });

    return exam;
  }

  /**
   * Lists examinations for an institution
   */
  static async listExaminations(institutionId: string) {
    return Examination.find({ institutionId })
      .populate('academicYearId', 'name isCurrent')
      .sort({ startDate: -1 });
  }

  /**
   * Publishes entire examination results to students
   */
  static async publishExamination(examinationId: string, publishedBy: string, institutionId?: string) {
    const exam = await Examination.findOne({
      _id: examinationId,
      ...(institutionId ? { institutionId } : {}),
    });
    if (!exam) throw new Error('Examination not found');

    const assessments = await ExamAssessment.find({
      examinationId: exam._id,
      institutionId: exam.institutionId,
    });
    if (!assessments.length || assessments.some((assessment) => !['APPROVED', 'PUBLISHED'].includes(assessment.workflowStatus as string))) {
      throw {
        status: 409,
        message: 'Every assessment must be approved (or already published by its class) before publishing examination results.',
        code: 'RESULTS_NOT_APPROVED',
      };
    }

    exam.isPublished = true;
    exam.status = 'PUBLISHED';
    exam.publishedAt = new Date();
    exam.publishedBy = publishedBy as any;
    await exam.save();

    // Publish only the previously approved assessments under this institution.
    for (const a of assessments) {
      if (a.workflowStatus === 'PUBLISHED') continue; // already published section-by-section
      a.workflowStatus = 'PUBLISHED';
      a.isPublished = true;
      a.publishedAt = new Date();
      a.publishedBy = publishedBy as any;
      await a.save();

      // Update associated marks
      await StudentMark.updateMany(
        { assessmentId: a._id },
        { $set: { workflowStatus: 'PUBLISHED' } }
      );

      // Audit Log
      await MarksAuditLog.create({
        institutionId: exam.institutionId,
        assessmentId: a._id,
        action: 'PUBLISH',
        previousValues: { workflowStatus: 'APPROVED' },
        newValues: { workflowStatus: 'PUBLISHED', isPublished: true },
        changedBy: publishedBy,
        userRole: 'PRINCIPAL',
        reason: `Final examination "${exam.name}" published by administration.`,
      });

      // Real-time notification per section
      SocketService.emitResultsPublished(String(exam.institutionId), String(a.sectionId), {
        examinationId: exam.id,
        examinationName: exam.name,
        sectionId: a.sectionId,
        assessmentId: a.id,
      });
    }

    return exam;
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. MARKS ENTRY & WORKFLOW (Subject Teacher & Audit Log)
  // ══════════════════════════════════════════════════════════════════

  /**
   * Creates or registers an assessment item for a section + subject
   */
  static async createAssessment(params: {
    institutionId: string;
    actorId: string;
    actorRole: string;
    academicYearId: string;
    examinationId?: string;
    classId?: string;
    sectionId: string;
    centralSubjectId: string;
    assignedTeacherId?: string;
    name: string;
    examType?: ExaminationType;
    fullMarksTheory?: number;
    passMarksTheory?: number;
    fullMarksPractical?: number;
    passMarksPractical?: number;
    totalMarks?: number;
    passMarks?: number;
  }) {
    const section = await this.getInstitutionSection(params.institutionId, params.sectionId);
    if (String(section.academicYearId) !== String(params.academicYearId)) {
      throw { status: 400, message: 'Assessment academic year must match the section academic year.', code: 'ACADEMIC_YEAR_MISMATCH' };
    }
    if (params.classId && String((section.classId as any)._id) !== String(params.classId)) {
      throw { status: 400, message: 'Class does not match the selected section.', code: 'SECTION_CLASS_MISMATCH' };
    }
    if (params.actorRole === 'TEACHER' && !(await SubjectAllocation.exists({
      sectionId: params.sectionId,
      centralSubjectId: params.centralSubjectId,
      teacherId: params.actorId,
      status: { $ne: 'INACTIVE' },
    }))) {
      throw { status: 403, message: 'You are not assigned to teach this subject in this section.', code: 'UNAUTHORIZED_ALLOCATION' };
    }
    if (params.examinationId && !(await Examination.exists({
      _id: params.examinationId,
      institutionId: params.institutionId,
      academicYearId: params.academicYearId,
    }))) {
      throw { status: 400, message: 'Examination does not belong to this institution and academic year.', code: 'EXAMINATION_CONTEXT_MISMATCH' };
    }

    const total = params.totalMarks ?? (params.fullMarksTheory ?? 75) + (params.fullMarksPractical ?? 25);
    const pass = params.passMarks ?? (params.passMarksTheory ?? 27) + (params.passMarksPractical ?? 10);
    if (total <= 0 || pass < 0 || pass > total) {
      throw { status: 400, message: 'Assessment marks must have a positive total and valid pass mark.', code: 'INVALID_MARKS_CONFIGURATION' };
    }

    const assessment = new ExamAssessment({
      ...params,
      institutionId: params.institutionId,
      classId: (section.classId as any)._id,
      fullMarksTheory: params.fullMarksTheory ?? 75,
      passMarksTheory: params.passMarksTheory ?? 27,
      fullMarksPractical: params.fullMarksPractical ?? 25,
      passMarksPractical: params.passMarksPractical ?? 10,
      totalMarks: total,
      passMarks: pass,
      workflowStatus: 'DRAFT',
      isPublished: false,
    });

    await assessment.save();
    return assessment;
  }

  /**
   * Enters or updates marks for an assessment (Subject Teacher only)
   * Enforces role check, CDC letter grade calculation, and change audit logging.
   */
  static async enterMarks(params: {
    teacherId: string;
    userRole: string;
    institutionId?: string;
    assessmentId: string;
    saveAsDraft: boolean;
    marks: Array<{
      studentId: string;
      marksTheory?: number;
      marksPractical?: number;
      marksObtained?: number;
      isAbsent?: boolean;
      remarks?: string;
    }>;
  }) {
    const { teacherId, userRole, assessmentId, saveAsDraft, marks } = params;

    if (!params.institutionId && userRole !== 'SUPER_ADMIN') {
      throw { status: 403, message: 'Institution context is required.', code: 'INSTITUTION_CONTEXT_REQUIRED' };
    }
    const assessment = await ExamAssessment.findOne({
      _id: assessmentId,
      ...(params.institutionId ? { institutionId: params.institutionId } : {}),
    });
    if (!assessment) throw new Error('Assessment not found');

    // Verification: Teacher must be assigned to this subject/section unless Admin/Principal
    if (userRole === 'TEACHER') {
      const isAssigned =
        assessment.assignedTeacherId?.toString() === teacherId ||
        (await SubjectAllocation.exists({
          sectionId: assessment.sectionId,
          centralSubjectId: assessment.centralSubjectId,
          teacherId,
        }));

      if (!isAssigned) {
        throw new Error('Unauthorized: You can only enter marks for subjects assigned to you.');
      }
      if (assessment.workflowStatus !== 'DRAFT') {
        throw { status: 409, message: 'Submitted marks cannot be edited by a teacher.', code: 'MARKS_ALREADY_SUBMITTED' };
      }
    }

    // Post-publication protection: Once published, only Principal/Admin can modify with audit
    const isPublished = assessment.isPublished || assessment.workflowStatus === 'PUBLISHED';
    if (isPublished && userRole === 'TEACHER') {
      throw new Error(
        'Unauthorized: Assessment results have been officially published. Post-publication mark changes require Principal or School Admin authorization.'
      );
    }

    const enrolledIds = await StudentEnrollment.distinct('studentId', {
      sectionId: assessment.sectionId,
      status: 'ENROLLED',
    });
    const enrolledSet = new Set(enrolledIds.map(String));
    const submittedIds = marks.map((item) => String(item.studentId));
    if (
      submittedIds.some((id) => !enrolledSet.has(id)) ||
      new Set(submittedIds).size !== submittedIds.length ||
      (!saveAsDraft && (submittedIds.length !== enrolledIds.length || enrolledIds.length === 0))
    ) {
      throw { status: 400, message: 'Marks must be for enrolled students only and include the full roster before submission.', code: 'INVALID_MARKS_ROSTER' };
    }

    const newWorkflowStatus: MarksWorkflowStatus = isPublished
      ? 'PUBLISHED'
      : saveAsDraft
      ? 'DRAFT'
      : 'SUBMITTED';
    const savedMarks = [];

    for (const item of marks) {
      const isAbsent = Boolean(item.isAbsent);
      const theory = isAbsent ? 0 : Number(item.marksTheory ?? 0);
      const practical = isAbsent ? 0 : Number(item.marksPractical ?? 0);
      const graceMarks = Number((item as any).graceMarks ?? 0);

      // Evaluate according to official Nepal CDC 2078 directive and boundary checks
      const evalResult = NepalGradingUtil.evaluateSubjectMarks({
        theoryMarks: theory,
        practicalMarks: practical,
        fullMarksTheory: assessment.fullMarksTheory,
        fullMarksPractical: assessment.fullMarksPractical,
        passMarksTheory: assessment.passMarksTheory,
        passMarksPractical: assessment.passMarksPractical,
        totalMarks: assessment.totalMarks,
        isAbsent,
        graceMarks,
      });

      const effectiveTheory = Math.min(assessment.fullMarksTheory, theory + Math.max(0, graceMarks));
      const totalObtained = isAbsent ? 0 : effectiveTheory + practical;
      const percentage = assessment.totalMarks > 0 ? (totalObtained / assessment.totalMarks) * 100 : 0;
      const { grade, gpa } = evalResult;

      // Check existing mark for audit log
      const existing = await StudentMark.findOne({
        assessmentId: assessment._id,
        studentId: item.studentId,
      });

      const markDoc = await StudentMark.findOneAndUpdate(
        { assessmentId: assessment._id, studentId: item.studentId },
        {
          $set: {
            institutionId: assessment.institutionId,
            examinationId: assessment.examinationId,
            classId: assessment.classId,
            sectionId: assessment.sectionId,
            centralSubjectId: assessment.centralSubjectId,
            marksTheory: theory,
            marksPractical: practical,
            marksObtained: totalObtained,
            percentage: Math.round(percentage * 10) / 10,
            grade,
            gpa,
            isAbsent,
            submittedBy: teacherId,
            workflowStatus: newWorkflowStatus,
            remarks: item.remarks,
          },
        },
        { upsert: true, returnDocument: 'after' }
      );

      // Audit Log for modified or created mark
      await MarksAuditLog.create({
        institutionId: assessment.institutionId,
        assessmentId: assessment._id,
        markId: markDoc._id,
        studentId: item.studentId,
        action: existing ? 'UPDATE' : 'CREATE',
        previousValues: existing
          ? {
              marksTheory: existing.marksTheory,
              marksPractical: existing.marksPractical,
              marksObtained: existing.marksObtained,
              grade: existing.grade,
              gpa: existing.gpa,
              workflowStatus: existing.workflowStatus,
            }
          : null,
        newValues: {
          marksTheory: theory,
          marksPractical: practical,
          marksObtained: totalObtained,
          grade,
          gpa,
          workflowStatus: newWorkflowStatus,
        },
        changedBy: teacherId,
        userRole,
        reason: saveAsDraft ? 'Draft marks saved by teacher' : 'Marks submitted to class teacher for review',
      });

      savedMarks.push(markDoc);
    }

    // Update Assessment workflow state
    assessment.workflowStatus = newWorkflowStatus;
    if (newWorkflowStatus === 'SUBMITTED') {
      assessment.submittedAt = new Date();
      assessment.submittedBy = teacherId as any;
    }
    await assessment.save();

    // Real-time broadcast
    SocketService.emitMarksWorkflowChanged(String(assessment.institutionId), {
      assessmentId: assessment.id,
      sectionId: assessment.sectionId,
      subjectId: assessment.centralSubjectId,
      status: newWorkflowStatus,
      updatedBy: teacherId,
    });

    return {
      assessment,
      marks: savedMarks,
    };
  }

  /**
   * Transitions marks workflow state (Draft -> Submitted -> Reviewed -> Approved -> Published)
   */
  static async transitionWorkflow(params: {
    assessmentId: string;
    institutionId?: string;
    targetStatus: MarksWorkflowStatus;
    actorId: string;
    actorRole: string;
    reason?: string;
  }) {
    const { assessmentId, institutionId, targetStatus, actorId, actorRole, reason } = params;

    if (!institutionId && actorRole !== 'SUPER_ADMIN') {
      throw { status: 403, message: 'Institution context is required.', code: 'INSTITUTION_CONTEXT_REQUIRED' };
    }
    const assessment = await ExamAssessment.findOne({
      _id: assessmentId,
      ...(institutionId ? { institutionId } : {}),
    });
    if (!assessment) throw new Error('Assessment not found');

    const previousStatus = assessment.workflowStatus as MarksWorkflowStatus;
    const allowedTransitions: Record<MarksWorkflowStatus, MarksWorkflowStatus> = {
      DRAFT: 'SUBMITTED',
      SUBMITTED: 'REVIEWED',
      REVIEWED: 'APPROVED',
      APPROVED: 'PUBLISHED',
      PUBLISHED: 'PUBLISHED',
    };
    if (allowedTransitions[previousStatus] !== targetStatus) {
      throw { status: 409, message: `Cannot transition marks from ${previousStatus} to ${targetStatus}.`, code: 'INVALID_MARKS_TRANSITION' };
    }

    if (targetStatus === 'SUBMITTED' && !['TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(actorRole)) {
      throw { status: 403, message: 'Only teachers or institutional administrators can submit marks.', code: 'FORBIDDEN' };
    }
    if (targetStatus === 'SUBMITTED' && actorRole === 'TEACHER') {
      const assigned = assessment.assignedTeacherId?.toString() === actorId ||
        await SubjectAllocation.exists({
          sectionId: assessment.sectionId,
          centralSubjectId: assessment.centralSubjectId,
          teacherId: actorId,
          status: { $ne: 'INACTIVE' },
        });
      if (!assigned) {
        throw { status: 403, message: 'Only the assigned subject teacher can submit these marks.', code: 'UNAUTHORIZED_ALLOCATION' };
      }
    }
    if (targetStatus === 'REVIEWED') {
      if (!['TEACHER', 'SCHOOL_ADMIN', 'PRINCIPAL'].includes(actorRole)) {
        throw { status: 403, message: 'Only the class teacher or an administrator can review marks.', code: 'FORBIDDEN' };
      }
      if (actorRole === 'TEACHER') {
        const section = await Section.findById(assessment.sectionId).populate('classId');
        const cls = section?.classId as any;
        if (
          !section ||
          section.classTeacherId?.toString() !== actorId ||
          cls?.institutionId?.toString() !== assessment.institutionId.toString()
        ) {
          throw { status: 403, message: 'Only the assigned class teacher can review these marks.', code: 'NOT_CLASS_TEACHER' };
        }
      }
      const enrolledStudents = await StudentEnrollment.find({
        sectionId: assessment.sectionId,
        status: 'ENROLLED',
      }).distinct('studentId');
      const markedStudents = await StudentMark.find({ assessmentId: assessment._id }).distinct('studentId');
      const markedStudentIds = new Set(markedStudents.map((id) => id.toString()));
      if (!enrolledStudents.length || enrolledStudents.some((id) => !markedStudentIds.has(id.toString()))) {
        throw { status: 409, message: 'Marks must be entered for every enrolled student before review.', code: 'MARKS_INCOMPLETE' };
      }
    }
    if (targetStatus === 'APPROVED' && !['SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'].includes(actorRole)) {
      throw { status: 403, message: 'Only a Principal or institutional administrator can approve results.', code: 'FORBIDDEN' };
    }
    if (targetStatus === 'PUBLISHED' && !['SCHOOL_ADMIN', 'PRINCIPAL', 'SUPER_ADMIN'].includes(actorRole)) {
      throw { status: 403, message: 'Only a Principal or institutional administrator can publish results.', code: 'FORBIDDEN' };
    }

    assessment.workflowStatus = targetStatus;
    if (targetStatus === 'REVIEWED') {
      assessment.reviewedAt = new Date();
      assessment.reviewedBy = actorId as any;
    } else if (targetStatus === 'APPROVED') {
      assessment.approvedAt = new Date();
      assessment.approvedBy = actorId as any;
    } else if (targetStatus === 'PUBLISHED') {
      assessment.isPublished = true;
      assessment.publishedAt = new Date();
      assessment.publishedBy = actorId as any;
    }
    await assessment.save();

    // Cascade to student marks
    await StudentMark.updateMany(
      { assessmentId: assessment._id },
      { $set: { workflowStatus: targetStatus } }
    );

    // Audit Log
    await MarksAuditLog.create({
      institutionId: assessment.institutionId,
      assessmentId: assessment._id,
      action:
        targetStatus === 'SUBMITTED'
          ? 'SUBMIT'
          : targetStatus === 'REVIEWED'
          ? 'REVIEW'
          : targetStatus === 'APPROVED'
          ? 'APPROVE'
          : targetStatus === 'PUBLISHED'
          ? 'PUBLISH'
          : 'UPDATE',
      previousValues: { workflowStatus: previousStatus },
      newValues: { workflowStatus: targetStatus },
      changedBy: actorId,
      userRole: actorRole,
      reason: reason || `Status transitioned to ${targetStatus}`,
    });

    SocketService.emitMarksWorkflowChanged(String(assessment.institutionId), {
      assessmentId: assessment.id,
      previousStatus,
      newStatus: targetStatus,
      actorId,
    });

    return assessment;
  }

  // ══════════════════════════════════════════════════════════════════
  // 4. CLASS TEACHER CONSOLE (Section Aggregations & Missing Entries)
  // ══════════════════════════════════════════════════════════════════

  /**
   * Retrieves section exam overview, identifying missing entries across all subjects
   */
  static async getSectionExamOverview(
    institutionId: string,
    sectionId: string,
    examinationId?: string,
    actorId?: string,
    actorRole?: string
  ) {
    const section = await this.getInstitutionSection(institutionId, sectionId, actorId, actorRole);
    const filter: any = { institutionId, sectionId };
    if (examinationId) filter.examinationId = examinationId;

    const assessments = await ExamAssessment.find(filter)
      .populate('centralSubjectId', 'name code creditHours')
      .populate('assignedTeacherId', 'fullName email')
      .sort({ createdAt: 1 });

    const enrolledStudentIds = await StudentEnrollment.distinct('studentId', { sectionId, status: 'ENROLLED' });
    const totalStudents = enrolledStudentIds.length;

    // Identify missing marks per subject
    const subjectProgress = await Promise.all(
      assessments.map(async (a) => {
        const markCount = await StudentMark.countDocuments({ institutionId, assessmentId: a._id, studentId: { $in: enrolledStudentIds } });
        const missingCount = Math.max(0, totalStudents - markCount);
        return {
          assessmentId: a.id,
          subject: a.centralSubjectId,
          teacher: a.assignedTeacherId,
          workflowStatus: a.workflowStatus,
          totalStudents,
          enteredMarks: markCount,
          missingMarks: missingCount,
          isComplete: missingCount === 0 && a.workflowStatus !== 'DRAFT',
        };
      })
    );

    return {
      section,
      totalSubjects: assessments.length,
      allSubmitted: subjectProgress.length > 0 && subjectProgress.every((s) => s.workflowStatus !== 'DRAFT'),
      allReviewed: subjectProgress.every(
        (s) => s.workflowStatus === 'REVIEWED' || s.workflowStatus === 'APPROVED' || s.workflowStatus === 'PUBLISHED'
      ),
      subjects: subjectProgress,
    };
  }

  /**
   * Generates consolidated marksheet for a section across all subjects
   */
  static async getConsolidatedResults(
    institutionId: string,
    sectionId: string,
    examinationId?: string,
    actorId?: string,
    actorRole?: string
  ) {
    const section = await this.getInstitutionSection(institutionId, sectionId, actorId, actorRole);
    const filter: any = { institutionId, sectionId };
    if (examinationId) filter.examinationId = examinationId;

    const assessments = await ExamAssessment.find(filter)
      .populate('centralSubjectId', 'name code creditHours')
      .sort({ createdAt: 1 });

    const assessmentIds = assessments.map((a) => a._id);
    const marks = await StudentMark.find({ institutionId, assessmentId: { $in: assessmentIds } })
      .populate('studentId', 'fullName fullNameNepali email')
      .lean();
    const enrollments = await StudentEnrollment.find({ sectionId, status: 'ENROLLED' })
      .populate('studentId', 'fullName fullNameNepali email')
      .sort({ rollNumber: 1 });

    const studentList: Array<{
      student: any;
      rollNumber: any;
      subjectMarks: Record<string, any>;
      totalMarksObtained: number;
      totalFullMarks: number;
      marksEntered: number;
      marksExpected: number;
      complete: boolean;
      overallGPA: number | null;
      overallGrade: string | null;
      classRank?: number | null;
    }> = enrollments.map((enrollment: any) => {
      const student: any = enrollment.studentId;
      const studentId = String(student?._id || student);
      const studentMarks = marks.filter((mark: any) =>
        String(mark.studentId?._id || mark.studentId) === studentId
      );
      const subjectMarks: Record<string, any> = {};
      let totalMarksObtained = 0;
      let totalFullMarks = 0;
      let gpaSum = 0;
      for (const assessment of assessments) {
        const mark: any = studentMarks.find((entry: any) => String(entry.assessmentId) === String(assessment._id));
        subjectMarks[String(assessment._id)] = mark ? {
          marksObtained: mark.marksObtained,
          grade: mark.grade,
          gpa: mark.gpa,
          isAbsent: mark.isAbsent,
          status: mark.workflowStatus,
        } : null;
        if (mark) {
          totalMarksObtained += mark.marksObtained || 0;
          totalFullMarks += assessment.totalMarks;
          gpaSum += mark.gpa || 0;
        }
      }
      const enteredCount = studentMarks.length;
      const avgGPA = enteredCount > 0 ? Math.round((gpaSum / enteredCount) * 100) / 100 : null;
      const percentage = totalFullMarks > 0 ? Math.round((totalMarksObtained / totalFullMarks) * 100) : null;
      return {
        student,
        rollNumber: enrollment.rollNumber,
        subjectMarks,
        totalMarksObtained,
        totalFullMarks,
        marksEntered: enteredCount,
        marksExpected: assessments.length,
        complete: enteredCount === assessments.length && assessments.length > 0,
        overallGPA: avgGPA,
        overallGrade: percentage === null ? null : NepalGradingUtil.calculateGrade(percentage).grade,
      };
    });

    studentList.sort((a, b) => (b.overallGPA || 0) - (a.overallGPA || 0) || b.totalMarksObtained - a.totalMarksObtained);
    studentList.forEach((student, index) => {
      student.classRank = student.complete ? index + 1 : null;
    });

    return {
      section,
      assessments,
      results: studentList,
      allSubjectsMarksSubmitted: studentList.length > 0 && studentList.every((student) => student.complete),
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 5. PRINCIPAL MONITORING & AUDIT TRAIL
  // ══════════════════════════════════════════════════════════════════

  /**
   * Principal & School Admin Overview Dashboard
   */
  static async getPrincipalDashboard(institutionId: string) {
    const totalExaminations = await Examination.countDocuments({ institutionId });
    // Exams that are not published yet, with how far their assessments have progressed.
    // (Exam status itself is never advanced automatically, so it cannot be used to find "pending" exams.)
    const unpublished: any[] = await Examination.find({ institutionId, isPublished: { $ne: true } }).sort({ startDate: -1 }).lean();
    const examAssessments: any[] = await ExamAssessment.find(
      { institutionId, examinationId: { $in: unpublished.map((e) => e._id) } },
      'examinationId workflowStatus'
    ).lean();
    const activeExams = unpublished
      .map((e) => {
        const mine = examAssessments.filter((a) => String(a.examinationId) === String(e._id));
        const ready = mine.filter((a) => ['APPROVED', 'PUBLISHED'].includes(a.workflowStatus)).length;
        return { ...e, id: String(e._id), assessmentSummary: { total: mine.length, ready }, readyToPublish: mine.length > 0 && ready === mine.length };
      })
      .filter((e) => e.assessmentSummary.total > 0);

    const totalAssessments = await ExamAssessment.countDocuments({ institutionId });
    const draftCount = await ExamAssessment.countDocuments({ institutionId, workflowStatus: 'DRAFT' });
    const submittedCount = await ExamAssessment.countDocuments({ institutionId, workflowStatus: 'SUBMITTED' });
    const reviewedCount = await ExamAssessment.countDocuments({ institutionId, workflowStatus: 'REVIEWED' });
    const approvedCount = await ExamAssessment.countDocuments({ institutionId, workflowStatus: 'APPROVED' });
    const publishedCount = await ExamAssessment.countDocuments({ institutionId, workflowStatus: 'PUBLISHED' });

    // Recent attendance sessions today
    const today = schoolDayStart(new Date());
    const todaySessions = await AttendanceSession.find({
      institutionId,
      date: { $gte: today },
    }).populate('sectionId', 'name').populate('takenBy', 'fullName');

    return {
      totalExaminations,
      activeExams,
      assessmentProgress: {
        total: totalAssessments,
        draft: draftCount,
        submitted: submittedCount,
        reviewed: reviewedCount,
        approved: approvedCount,
        published: publishedCount,
        submissionRate: totalAssessments > 0 ? Math.round(((totalAssessments - draftCount) / totalAssessments) * 100) : 0,
      },
      todayAttendanceSessions: todaySessions,
    };
  }

  /**
   * Audit Trail of Marks Changes
   */
  static async getMarksAuditTrail(institutionId: string, limit = 50) {
    return MarksAuditLog.find({ institutionId })
      .populate('changedBy', 'fullName email role')
      .populate('assessmentId', 'name')
      .populate('studentId', 'fullName email')
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  // ══════════════════════════════════════════════════════════════════
  // 6. STUDENT PORTAL (Published Marks & History)
  // ══════════════════════════════════════════════════════════════════

  /**
   * Retrieves official report card for a student. Strictly excludes unpublished results.
   */
  static async getStudentPublishedResults(studentId: string, institutionId: string) {
    const enrollment: any = await this.getStudentEnrollment(studentId, institutionId);
    const sectionId = String(enrollment.sectionId?._id || enrollment.sectionId);
    // Only fetch marks where workflowStatus is PUBLISHED
    const publishedMarks = await StudentMark.find({
      institutionId,
      studentId,
      workflowStatus: 'PUBLISHED',
    })
      .populate({
        path: 'assessmentId',
        match: { institutionId, sectionId, isPublished: true },
        populate: { path: 'centralSubjectId', select: 'name code creditHours' },
      })
      .populate('examinationId', 'name code examType startDate endDate')
      .sort({ createdAt: -1 });

    // Filter out any marks whose parent assessment was not published
    const verifiedMarks = publishedMarks.filter((m) => m.assessmentId !== null);

    // Group by examination
    const examMap: Record<string, any> = {};
    verifiedMarks.forEach((m: any) => {
      const ex = m.examinationId;
      const exKey = ex ? ex._id.toString() : 'CUSTOM';
      if (!examMap[exKey]) {
        examMap[exKey] = {
          examination: ex || { name: 'Institutional Assessment', examType: 'TERMINAL' },
          marks: [],
          totalMarks: 0,
          gpaSum: 0,
        };
      }

      examMap[exKey].marks.push({
        subject: m.assessmentId?.centralSubjectId?.name || 'Subject',
        subjectCode: m.assessmentId?.centralSubjectId?.code || '',
        marksTheory: m.marksTheory,
        marksPractical: m.marksPractical,
        marksObtained: m.marksObtained,
        grade: m.grade,
        gpa: m.gpa,
        isAbsent: m.isAbsent,
        remarks: m.remarks,
      });
      examMap[exKey].totalMarks += m.marksObtained;
      examMap[exKey].gpaSum += m.gpa;
    });

    const reportCards = Object.values(examMap).map((item) => ({
      ...item,
      overallGPA: item.marks.length > 0 ? Math.round((item.gpaSum / item.marks.length) * 100) / 100 : 0,
    }));

    return reportCards;
  }
}
