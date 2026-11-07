import {
  StudentEnrollment,
  Section,
  Class,
  SubjectAllocation,
  CentralSubject,
  Textbook,
  SimulationCatalog,
  AttendanceRecord,
  ExamAssessment,
  StudentMark,
  Assignment,
  AssignmentSubmission,
  SmartBoardNote,
  SchoolAnnouncement,
  User,
} from '../../models';
import { SectionSubject } from '../../models';
import { TimetableBuilderService } from '../timetable/timetable-builder.service';
import { schoolClock } from '../timetable/timetable.service';
import { TextbookAccessService, sectionMedium } from '../curriculum/textbook-access.service';
import { NepalGradingUtil } from '../../common/utils/nepal-grading.util';
import { FeatureAccessService } from '../feature-access/feature-access.service';
import { FeatureKey } from '../../models/FeatureAccess';

export class StudentService {
  private static getPersonalAttendance(
    records: any[],
    studentId: string
  ): Array<{ date: Date; status: string; remarks: string }> {
    const sessions = new Map<string, { date: Date; status: string; remarks: string }>();
    records.forEach((record: any) => {
      const item = record.records?.find((entry: any) => String(entry.studentId?._id || entry.studentId) === studentId);
      if (!item) return;
      const dateKey = new Date(record.date).toISOString().slice(0, 10);
      const key = record.sessionId
        ? String(record.sessionId)
        : `${dateKey}:${String(record.centralSubjectId || 'DAILY')}:${record.periodNumber || 1}`;
      sessions.set(key, {
        date: record.date,
        status: item.status,
        remarks: item.remarks || '',
      });
    });
    return Array.from(sessions.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Helper to fetch student active enrollment details.
   */
  private static async getStudentEnrollment(studentId: string, institutionId: string) {
    const enrollments = await StudentEnrollment.find({ studentId, status: 'ENROLLED' })
      .populate({
        path: 'sectionId',
        populate: { path: 'classId', select: 'name gradeNumber institutionId' },
      })
      .populate('academicYearId', 'name isCurrent institutionId')
      .sort({ createdAt: -1 });
    const institutionEnrollments = enrollments.filter((entry: any) => {
      const academicYear = entry.academicYearId as any;
      const section = entry.sectionId as any;
      const cls = section?.classId as any;
      return String(academicYear?.institutionId || '') === institutionId
        && String(section?.institutionId || cls?.institutionId || '') === institutionId
        && String(cls?.institutionId || '') === institutionId;
    });
    const enrollment = institutionEnrollments.find((entry: any) => (entry.academicYearId as any)?.isCurrent)
      || institutionEnrollments[0];

    if (!enrollment) {
      throw { status: 404, message: 'No active enrollment was found for this institution.', code: 'ENROLLMENT_NOT_FOUND' };
    }

    const section = enrollment.sectionId as any;
    const cls = section?.classId as any;

    if (!section || !cls || cls.institutionId.toString() !== institutionId) {
      throw { status: 403, message: 'Tenant Isolation: Access denied to other institution records', code: 'FORBIDDEN_TENANT' };
    }

    return { enrollment, section, cls };
  }

  // ══════════════════════════════════════════════════════════════════
  // 1. STUDENT DASHBOARD OVERVIEW
  // ══════════════════════════════════════════════════════════════════
  static async getOverview(studentId: string, institutionId: string) {
    const { enrollment, section, cls } = await this.getStudentEnrollment(studentId, institutionId);

    const [allocations, attendanceHistory, publishedAssessments, assignments, notes, timetable] = await Promise.all([
      SubjectAllocation.find({ sectionId: section._id, status: { $ne: 'INACTIVE' } })
        .populate('centralSubjectId', 'name nameNepali code creditHours')
        .populate('teacherId', 'fullName username'),
      AttendanceRecord.find({ institutionId, sectionId: section._id }).sort({ date: -1 }).limit(30),
      ExamAssessment.find({ sectionId: section._id, isPublished: true }).populate('centralSubjectId'),
      Assignment.find({ sectionId: section._id, status: 'ACTIVE' }).sort({ dueDate: 1 }).limit(5),
      SmartBoardNote.find({ sectionId: section._id, isSharedWithStudents: true }).sort({ createdAt: -1 }).limit(5),
      // Today's periods from the published timetable version only.
      TimetableBuilderService.publishedEntries({ sectionId: String(section._id) }).then((list: any[]) => list.filter((e) => e.dayOfWeek === schoolClock().day)),
    ]);

    // Student's personal attendance rate
    const personalAttendance = this.getPersonalAttendance(attendanceHistory, studentId);
    const totalDays = personalAttendance.length;
    const presentDays = personalAttendance.filter(
      (item: any) => item.status === 'PRESENT' || item.status === 'LATE'
    ).length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : null;

    // Student's latest marks
    const assessmentIds = publishedAssessments.map((a) => a._id);
    const myMarks = await StudentMark.find({
      assessmentId: { $in: assessmentIds },
      studentId,
    });

    // Pending = active assignments this student has not submitted yet
    const submittedIds = new Set(
      (await AssignmentSubmission.find({ studentId, assignmentId: { $in: assignments.map((a: any) => a._id) } }, 'assignmentId').lean()).map((x: any) => String(x.assignmentId))
    );
    const pendingAssignmentsCount = assignments.filter((a: any) => !submittedIds.has(String(a._id))).length;

    const averageGpa = myMarks.length
      ? Math.round((myMarks.reduce((sum, m) => sum + m.gpa, 0) / myMarks.length) * 100) / 100
      : null;

    const classTeacher: any = (section as any).classTeacherId
      ? await User.findById((section as any).classTeacherId, 'fullName').lean()
      : null;

    return {
      student: await User.findById(studentId, 'fullName fullNameNepali username email'),
      academicInfo: {
        classTeacherName: classTeacher?.fullName || null,
        guardianName: (enrollment as any).guardianName || null,
        guardianPhone: (enrollment as any).guardianPhone || null,
        classId: String(cls._id),
        sectionId: String(section._id),
        className: cls.name || `Class ${cls.gradeNumber}`,
        gradeNumber: cls.gradeNumber,
        sectionName: section.name,
        rollNumber: enrollment.rollNumber,
        admissionNumber: enrollment.admissionNumber,
        medium: section.medium || null,
      },
      studentProfile: {
        classId: { id: String(cls._id), _id: String(cls._id), name: cls?.name, gradeNumber: cls?.gradeNumber },
        sectionId: { id: String(section._id), _id: String(section._id), name: section?.name, medium: section?.medium },
      },
      stats: {
        totalSubjects: allocations.length,
        attendanceRate: attendancePercentage === null ? null : `${attendancePercentage}%`,
        totalAttendanceDays: totalDays,
        presentDays,
        gpa: averageGpa,
        pendingAssignments: pendingAssignmentsCount,
      },
      subjects: allocations,
      todayTimetable: timetable,
      recentAssignments: assignments,
      recentNotes: notes,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. MY SUBJECTS, TEXTBOOKS & SIMULATIONS
  // ══════════════════════════════════════════════════════════════════
  static async getMySubjects(studentId: string, institutionId: string) {
    const { section, cls } = await this.getStudentEnrollment(studentId, institutionId);

    // Subjects the school configured for this section; fall back to allocations where none are configured yet.
    const offered: any[] = await SectionSubject.find({ sectionId: section._id, isActive: true }).populate('centralSubjectId');
    const allocs: any[] = await SubjectAllocation.find({ sectionId: section._id, status: { $ne: 'INACTIVE' } })
      .populate('centralSubjectId')
      .populate('teacherId', 'fullName username email');
    const allocations: any[] = offered.length
      ? offered.filter((o) => o.centralSubjectId).map((o) => {
          const a = allocs.find((x) => String(x.centralSubjectId?._id) === String(o.centralSubjectId._id));
          return { id: a?.id || null, centralSubjectId: o.centralSubjectId, teacherId: a?.teacherId || null };
        })
      : allocs;

    const subjectIds = allocations.map((a: any) => a.centralSubjectId?._id);
    const medium = sectionMedium(section);
    const books = new Map<string, any>();
    for (const id of subjectIds) books.set(String(id), await TextbookAccessService.digitalTextbookFor(String(id), medium));

    const [simulations] = await Promise.all([
      SimulationCatalog.find({
        $or: [{ subjectId: { $in: subjectIds } }, { gradeLevels: cls.gradeNumber }],
      }),
    ]);

    return allocations.map((alloc: any) => {
      const sub = alloc.centralSubjectId;
      const subIdStr = sub._id.toString();
      return {
        allocationId: alloc.id,
        subject: sub,
        teacher: alloc.teacherId,
        digitalTextbook: books.get(subIdStr),
        textbooks: [books.get(subIdStr)?.textbook, ...(books.get(subIdStr)?.supplementary || [])].filter(Boolean),
        simulations: simulations.filter(
          (s) => (s.subjectId && s.subjectId.toString() === subIdStr) || s.gradeLevels.includes(cls.gradeNumber)
        ),
      };
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. PRIVATE ATTENDANCE LOG
  // ══════════════════════════════════════════════════════════════════
  static async getMyAttendance(studentId: string, institutionId: string) {
    const { section } = await this.getStudentEnrollment(studentId, institutionId);

    const records = await AttendanceRecord.find({ institutionId, sectionId: section._id }).sort({ date: -1 });

    const personalLog = this.getPersonalAttendance(records, studentId);

    const presentCount = personalLog.filter((l) => l.status === 'PRESENT' || l.status === 'LATE').length;
    const totalCount = personalLog.length;

    const overallPct = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : null;

    const allocs = await SubjectAllocation.find({ sectionId: section._id, status: { $ne: 'INACTIVE' } })
      .populate('centralSubjectId', 'name nameNepali code creditHours')
      .populate('teacherId', 'fullName username');

    const subjectAttendance = new Map<string, { total: number; present: number }>();
    const uniqueRecords = new Map<string, any>();
    records.forEach((record: any) => {
      const dateKey = new Date(record.date).toISOString().slice(0, 10);
      const key = record.sessionId
        ? String(record.sessionId)
        : `${dateKey}:${String(record.centralSubjectId || 'DAILY')}:${record.periodNumber || 1}`;
      uniqueRecords.set(key, record);
    });
    uniqueRecords.forEach((record: any) => {
      if (!record.centralSubjectId) return;
      const item = record.records.find((entry: any) => entry.studentId.toString() === studentId);
      if (!item) return;
      const key = record.centralSubjectId.toString();
      const counts = subjectAttendance.get(key) || { total: 0, present: 0 };
      counts.total += 1;
      if (item.status === 'PRESENT' || item.status === 'LATE') counts.present += 1;
      subjectAttendance.set(key, counts);
    });

    const subjectBreakdown = allocs.map((al: any) => {
      const subjectId = String(al.centralSubjectId?._id || al.centralSubjectId);
      const counts = subjectAttendance.get(subjectId) || { total: 0, present: 0 };
      const percentage = counts.total > 0 ? Math.round((counts.present / counts.total) * 100) : null;
      return {
        subjectId,
        subjectName: al.centralSubjectId?.name || 'Subject',
        subjectCode: al.centralSubjectId?.code || '',
        teacherName: al.teacherId?.fullName || 'Subject Teacher',
        totalSessions: counts.total,
        attendedSessions: counts.present,
        attendanceRate: percentage === null ? null : `${percentage}%`,
        percentage,
        status: percentage === null ? 'NO_DATA' : percentage >= 85 ? 'EXCELLENT' : percentage >= 75 ? 'REGULAR' : 'LOW_ATTENDANCE',
      };
    });

    return {
      totalDays: totalCount,
      presentDays: presentCount,
      absentDays: totalCount - presentCount,
      attendanceRate: overallPct === null ? null : `${overallPct}%`,
      percentage: overallPct,
      subjectBreakdown,
      history: personalLog,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 4. PUBLISHED RESULTS & MARKSHEET
  // ══════════════════════════════════════════════════════════════════
  static async getMyResults(studentId: string, institutionId: string) {
    const { section } = await this.getStudentEnrollment(studentId, institutionId);

    // Only published assessments
    const publishedAssessments = await ExamAssessment.find({
      sectionId: section._id,
      $or: [{ isPublished: true }, { workflowStatus: 'PUBLISHED' }],
    }).populate('centralSubjectId');

    const assessmentIds = publishedAssessments.map((a) => a._id);
    const marks = await StudentMark.find({
      assessmentId: { $in: assessmentIds },
      studentId,
    });

    const results = publishedAssessments.map((asm) => {
      const mark = marks.find((m) => m.assessmentId.toString() === asm._id.toString());
      const sub = asm.centralSubjectId as any;

      return {
        assessmentId: asm.id,
        examinationId: (asm as any).examinationId ? String((asm as any).examinationId) : undefined,
        examName: asm.name,
        examType: asm.examType,
        subjectName: sub?.name || 'Subject',
        subjectCode: sub?.code,
        creditHours: sub?.creditHours ?? null,
        totalMarks: asm.totalMarks,
        passMarks: asm.passMarks,
        marksObtained: mark ? mark.marksObtained : null,
        grade: mark ? mark.grade : null,
        gpa: mark ? mark.gpa : null,
        remarks: mark?.remarks || '',
        publishedAt: asm.publishedAt,
      };
    });

    const validMarks = results.filter((r) => r.marksObtained !== null);
    const overallGpa = validMarks.length
      ? NepalGradingUtil.calculateOverallGPA(validMarks.map((v) => ({ gpa: v.gpa, creditHours: v.creditHours })))
      : null;

    return {
      results,
      overallGpa,
      totalExamsCount: publishedAssessments.length,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 5. ASSIGNMENTS & HOMEWORK
  // ══════════════════════════════════════════════════════════════════
  static async getMyAssignments(studentId: string, institutionId: string) {
    const { section } = await this.getStudentEnrollment(studentId, institutionId);

    return Assignment.find({ sectionId: section._id, status: 'ACTIVE' })
      .populate('centralSubjectId', 'name nameNepali code')
      .populate('teacherId', 'fullName')
      .sort({ dueDate: 1 });
  }

  // ══════════════════════════════════════════════════════════════════
  // 6. SMART BOARD SHARED NOTES
  // ══════════════════════════════════════════════════════════════════
  static async getMySmartBoardNotes(studentId: string, institutionId: string) {
    const { section } = await this.getStudentEnrollment(studentId, institutionId);

    return SmartBoardNote.find({
      sectionId: section._id,
      isSharedWithStudents: true,
    })
      .populate('subjectId', 'name nameNepali')
      .populate('teacherId', 'fullName')
      .sort({ createdAt: -1 });
  }

  // ══════════════════════════════════════════════════════════════════
  // 7. ASSIGNMENT ONLINE SUBMISSION
  // ══════════════════════════════════════════════════════════════════
  static async submitAssignment(
    studentId: string,
    institutionId: string,
    assignmentId: string,
    data: { content?: string; fileUrl?: string }
  ) {
    const isAllowed = await FeatureAccessService.isFeatureAllowed(
      studentId,
      FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
      institutionId
    );
    if (!isAllowed) {
      throw {
        status: 403,
        message: 'Online assignment submission is disabled by your school policy. Please submit your work offline in class.',
        code: 'ONLINE_SUBMISSION_DISABLED',
      };
    }

    const assignment = await Assignment.findOne({ _id: assignmentId, institutionId });
    if (!assignment) {
      throw { status: 404, message: 'Assignment not found', code: 'ASSIGNMENT_NOT_FOUND' };
    }

    // 1. File Format Validation
    if (data.fileUrl) {
      const ext = data.fileUrl.substring(data.fileUrl.lastIndexOf('.')).toLowerCase();
      const allowedExts = ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg'];
      if (!allowedExts.includes(ext)) {
        throw {
          status: 400,
          message: `Invalid file format '${ext}'. Only document (.pdf, .docx) and image (.png, .jpg) formats are permitted.`,
          code: 'INVALID_FILE_TYPE',
        };
      }
    }

    // 2. Deadline & Late Submission Policy
    const now = new Date();
    const isPastDue = assignment.dueDate && now > new Date(assignment.dueDate);
    if (isPastDue && !(assignment as any).allowLateSubmission) {
      throw {
        status: 400,
        message: 'The assignment submission deadline has passed. Late submissions are not accepted for this task.',
        code: 'DEADLINE_PASSED',
      };
    }

    // 3. Resubmission Protection (Cannot overwrite already-graded assignments)
    const existing = await AssignmentSubmission.findOne({ assignmentId, studentId, institutionId });
    if (existing && existing.status === 'GRADED') {
      throw {
        status: 400,
        message: 'This assignment has already been evaluated and graded by your teacher. Resubmission requires teacher re-opening.',
        code: 'ALREADY_GRADED',
      };
    }

    const submissionStatus = isPastDue ? 'LATE' : 'SUBMITTED';

    const submission = await AssignmentSubmission.findOneAndUpdate(
      { assignmentId, studentId, institutionId },
      {
        content: data.content,
        fileUrl: data.fileUrl,
        submittedAt: now,
        status: submissionStatus,
      },
      { upsert: true, returnDocument: 'after' }
    );

    return submission;
  }

  static async getMySubmissions(studentId: string, institutionId: string) {
    return AssignmentSubmission.find({ studentId, institutionId })
      .populate('assignmentId')
      .sort({ submittedAt: -1 });
  }
  static async getAnnouncements(studentId: string, institutionId: string) {
    const enrollment = await this.getStudentEnrollment(studentId, institutionId).catch(() => null);
    const section = enrollment?.section;
    const sectionId = section?._id || section?.id;
    return SchoolAnnouncement.find({
      institutionId,
      targetAudience: { $in: ['ALL', 'STUDENTS'] },
      $or: [
        { announcementType: 'INSTITUTIONAL' },
        { announcementType: { $exists: false } },
        { sectionId: null },
        ...(sectionId ? [{ sectionId }] : []),
      ],
    })
      .populate('publishedBy', 'fullName username role')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(30);
  }
}
