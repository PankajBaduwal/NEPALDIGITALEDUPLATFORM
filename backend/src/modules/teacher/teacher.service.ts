import {
  SubjectAllocation,
  AcademicYear,
  Class,
  Section,
  StudentEnrollment,
  CentralSubject,
  Textbook,
  SimulationCatalog,
  SmartBoardNote,
  AttendanceRecord,
  ExamAssessment,
  StudentMark,
  MarksAuditLog,
  Assignment,
  AssignmentSubmission,
  Quiz,
  SchoolAnnouncement,
  User, TimetableEntry,
  TextbookChapter,
  SyllabusProgress,
  QuizAttempt,
  StudentRemark,
} from '../../models';
import { NepalGradingUtil } from '../../common/utils/nepal-grading.util';
import { TimetableBuilderService } from '../timetable/timetable-builder.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { SocketService } from '../../common/services/socket.service';
import { schoolDayStart, schoolDayEnd } from '../../common/utils/school-day.util';
import { NotificationService } from '../notifications/notification.service';
import { schoolClock } from '../timetable/timetable.service';
import { TextbookAccessService, sectionMedium } from '../curriculum/textbook-access.service';

const records_summary = (records: Array<{ status: string }>) => ({
  total: records.length,
  present: records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length,
  absent: records.filter((r) => r.status === 'ABSENT').length,
});

export class TeacherService {
  private static async getActiveInstitutionSections(institutionId: string) {
    const academicYear = await AcademicYear.findOne({ institutionId })
      .sort({ isCurrent: -1, startDate: -1, createdAt: -1 })
      .select('_id');
    if (!academicYear) return [];

    const sections = await Section.find({ academicYearId: academicYear._id })
      .populate('classId', 'institutionId gradeNumber name')
      .lean();
    return sections.filter(
      (section: any) => section.classId?.institutionId?.toString() === institutionId
    );
  }

  private static async verifyTeacherSection(
    teacherId: string,
    institutionId: string,
    sectionId: string,
    requireSubjectAllocation = true
  ) {
    const sections = await this.getActiveInstitutionSections(institutionId);
    const section = sections.find((entry: any) => entry._id.toString() === sectionId) as any;
    if (!section) {
      throw { status: 404, message: 'Section is not part of the active academic year for this institution.', code: 'SECTION_NOT_FOUND' };
    }

    const isClassTeacher = section.classTeacherId?.toString() === teacherId;
    const hasAllocation = requireSubjectAllocation
      ? await SubjectAllocation.exists({ teacherId, sectionId, status: { $ne: 'INACTIVE' } })
      : false;
    if (!isClassTeacher && !hasAllocation) {
      throw { status: 403, message: 'You are not assigned to teach or supervise this section.', code: 'UNAUTHORIZED_SECTION' };
    }
    return section;
  }

  // ══════════════════════════════════════════════════════════════════
  // 1. TEACHER DASHBOARD OVERVIEW
  // ══════════════════════════════════════════════════════════════════
  static async getOverview(teacherId: string, institutionId: string) {
    const activeSections = await this.getActiveInstitutionSections(institutionId);
    const sectionIdSet = activeSections.map((section: any) => section._id);
    const allocations = await SubjectAllocation.find({
      teacherId,
      sectionId: { $in: sectionIdSet },
      status: { $ne: 'INACTIVE' },
    })
      .populate({
        path: 'sectionId',
        populate: { path: 'classId' },
      })
      .populate('centralSubjectId');

    const sectionIds = Array.from(new Set(allocations.map((a: any) => a.sectionId?._id || a.sectionId)));
    const classIds = Array.from(
      new Set(allocations.map((a: any) => a.sectionId?.classId?._id || a.sectionId?.classId).filter(Boolean))
    );

    // Find if teacher is class teacher of any section
    const supervisedSections = activeSections.filter(
      (section: any) => section.classTeacherId?.toString() === teacherId
    );

    // 1. Count distinct active students across all assigned sections (prevents 2323 concatenation bug)
    const distinctStudentIds = await StudentEnrollment.distinct('studentId', {
      sectionId: { $in: sectionIds },
      status: 'ENROLLED',
    });
    const totalStudents = distinctStudentIds.length;

    // 2. Count pending submissions awaiting grading for this teacher
    const teacherAssignments = await Assignment.find({
      institutionId,
      $or: [{ teacherId }, { createdBy: teacherId }, { sectionId: { $in: sectionIds } }],
    })
      .populate('sectionId')
      .populate('centralSubjectId');

    const asgnIds = teacherAssignments
      .filter((a: any) => String(a.teacherId) === String(teacherId) || String(a.createdBy) === String(teacherId))
      .map((a) => a._id);
    const pendingSubmissions = asgnIds.length
      ? await AssignmentSubmission.countDocuments({
          assignmentId: { $in: asgnIds },
          status: { $in: ['SUBMITTED', 'LATE', 'RESUBMITTED', 'UNDER_EVALUATION'] },
        })
      : 0;

    // 3. Calculate overall attendance percentage from actual records
    const attendanceRecords = await AttendanceRecord.find({ institutionId, sectionId: { $in: sectionIds } })
      .populate('sectionId')
      .sort({ date: -1 });

    let totalPresents = 0;
    let totalPossible = 0;
    attendanceRecords.forEach((rec) => {
      (rec.records || []).forEach((item: any) => {
        totalPossible++;
        if (item.status === 'PRESENT' || item.status === 'LATE') totalPresents++;
      });
    });
    const overallAttendance = totalPossible > 0 ? Math.round((totalPresents / totalPossible) * 100) : null;

    // 4. Notes count
    const totalNotes = await SmartBoardNote.countDocuments({ institutionId, teacherId });

    // 5. Today's timetable
    const timetable = (await TimetableBuilderService.publishedEntries({ institutionId, teacherId }))
      .filter((e) => e.dayOfWeek === schoolClock().day);

    // 6. Upcoming assignments (deadline >= now, sorted by upcoming deadline)
    const now = new Date();
    const upcomingAssignments = await Assignment.find({
      institutionId,
      $or: [{ teacherId }, { createdBy: teacherId }, { sectionId: { $in: sectionIds } }],
      dueDate: { $gte: now },
    })
      .populate({
        path: 'sectionId',
        populate: { path: 'classId' },
      })
      .populate('centralSubjectId')
      .sort({ dueDate: 1 })
      .limit(10);

    // 7. Upcoming quizzes (published, scheduled or active)
    const upcomingQuizzes = await Quiz.find({
      institutionId,
      status: 'PUBLISHED',
      $and: [
        { $or: [{ teacherId }, { createdBy: teacherId }, { sectionId: { $in: sectionIds } }] },
        {
          $or: [
            { scheduledStartTime: { $gte: now } },
            { endDate: { $gte: now } },
            { createdAt: { $gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) } },
          ],
        },
      ],
    })
      .populate({
        path: 'sectionId',
        populate: { path: 'classId' },
      })
      .populate('centralSubjectId')
      .sort({ scheduledStartTime: 1, createdAt: -1 })
      .limit(10);

    // 8. Recent activity events log
    const recentActivities: any[] = [];

    // Add recent assignments
    teacherAssignments.slice(0, 5).forEach((asgn: any) => {
      recentActivities.push({
        id: `asgn-${asgn._id}`,
        title: `Assignment Published: ${asgn.title}`,
        type: 'ASSIGNMENT',
        date: asgn.createdAt || new Date(),
        subjectName: asgn.centralSubjectId?.name || 'Subject',
        className: asgn.sectionId?.name ? `Section ${asgn.sectionId.name}` : 'Class',
      });
    });

    // Add recent attendance records
    attendanceRecords.slice(0, 4).forEach((att: any) => {
      recentActivities.push({
        id: `att-${att._id}`,
        title: `Attendance Recorded for ${att.sectionId?.name || 'Section'} (${att.records?.length || 0} students)`,
        type: 'ATTENDANCE',
        date: att.date || att.createdAt,
        subjectName: 'Daily Roll Call',
        className: att.sectionId?.name ? `Section ${att.sectionId.name}` : 'Section',
      });
    });

    // Add recent announcements
    const announcements = await SchoolAnnouncement.find({ institutionId })
      .sort({ createdAt: -1 })
      .limit(3);

    announcements.forEach((ann) => {
      recentActivities.push({
        id: `ann-${ann._id}`,
        title: `School Announcement: ${ann.title}`,
        type: 'ANNOUNCEMENT',
        date: ann.createdAt,
        subjectName: 'Institutional Notice',
        className: 'All School',
      });
    });

    // Sort recent activities by date descending
    recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Check today's attendance for supervised section
    const todayAttendance = supervisedSections.length
      ? await AttendanceRecord.findOne({
          sectionId: supervisedSections[0]._id,
          date: { $gte: schoolDayStart(new Date()), $lt: schoolDayEnd(new Date()) },
        })
      : null;

    const teacher = await User.findById(
      teacherId,
      'fullName fullNameNepali username email phone staffId employeeId designation department'
    );

    // Real per-section student counts and today's attendance for the supervised section
    const sectionCounts: Array<{ _id: any; count: number }> = await StudentEnrollment.aggregate([
      { $match: { sectionId: { $in: sectionIds.concat(supervisedSections.map((x: any) => x._id)) }, status: 'ENROLLED' } },
      { $group: { _id: '$sectionId', count: { $sum: 1 } } },
    ]);
    const countBySection = new Map(sectionCounts.map((c) => [String(c._id), c.count]));

    const supervised: any = supervisedSections[0] ? ((supervisedSections[0] as any).toJSON?.() ?? supervisedSections[0]) : null;
    if (supervised) {
      supervised.studentCount = countBySection.get(String(supervised._id || supervised.id)) ?? 0;
      const dayStart = schoolDayStart(new Date());
      const todayDocs = await AttendanceRecord.find({ institutionId, sectionId: supervised._id || supervised.id, date: { $gte: dayStart } });
      let tp = 0;
      let tt = 0;
      todayDocs.forEach((d: any) => (d.records || []).forEach((r: any) => { tt++; if (r.status === 'PRESENT' || r.status === 'LATE') tp++; }));
      supervised.todayAttendancePercent = tt > 0 ? Math.round((tp / tt) * 100) : null;
    }

    const allocationsOut = allocations.map((a: any) => {
      const json: any = a.toJSON ? a.toJSON() : a;
      const secId = String(a.sectionId?._id || a.sectionId);
      json.studentCount = countBySection.get(secId) ?? 0;
      return json;
    });

    return {
      teacher,
      counts: {
        assignedClasses: classIds.length || sectionIds.length,
        assignedSections: sectionIds.length,
        assignedSubjects: allocations.length,
        totalStudents,
        pendingSubmissions,
        overallAttendance,
        smartBoardNotes: totalNotes,
        isClassTeacher: supervisedSections.length > 0,
      },
      classTeacherSection: supervised,
      todayAttendanceRecorded: !!todayAttendance,
      todayTimetable: timetable,
      upcomingAssignments,
      upcomingQuizzes,
      recentActivities: recentActivities.slice(0, 8),
      allocations: allocationsOut,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. ASSIGNED CLASSES & SUBJECTS
  // ══════════════════════════════════════════════════════════════════
  static async getAssignedClassesAndSubjects(teacherId: string, institutionId: string) {
    const activeSections = await this.getActiveInstitutionSections(institutionId);
    const allocations = await SubjectAllocation.find({
      teacherId,
      sectionId: { $in: activeSections.map((section: any) => section._id) },
      status: { $ne: 'INACTIVE' },
    })
      .populate({
        path: 'sectionId',
        populate: { path: 'classId' },
      })
      .populate('centralSubjectId');

    return allocations;
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. SUBJECT WORKSPACE (Class -> Subject -> Full Workspace)
  // ══════════════════════════════════════════════════════════════════
  static async getSubjectWorkspace(
    teacherId: string,
    institutionId: string,
    params: { sectionId: string; centralSubjectId: string }
  ) {
    const { sectionId, centralSubjectId } = params;

    const activeSections = await this.getActiveInstitutionSections(institutionId);
    const section = activeSections.find((entry: any) => entry._id.toString() === sectionId);
    if (!section) {
      throw { status: 404, message: 'Section is not part of the active academic year for this institution.', code: 'SECTION_NOT_FOUND' };
    }

    // Verify teacher allocation
    let allocation = await SubjectAllocation.findOne({
      sectionId,
      centralSubjectId,
      teacherId,
      status: { $ne: 'INACTIVE' },
    });

    if (!allocation) {
      const hasSlot = await TimetableEntry.exists({ sectionId, centralSubjectId, teacherId });
      if (hasSlot) {
        allocation = await SubjectAllocation.findOneAndUpdate(
          { sectionId, centralSubjectId, teacherId },
          {
            $set: {
              institutionId,
              academicYearId: section.academicYearId,
              classId: (section.classId as any)?._id || section.classId,
              sectionId,
              centralSubjectId,
              teacherId,
              status: 'ACTIVE',
            },
          },
          { upsert: true, returnDocument: 'after' }
        );
      }
    }

    if (!allocation) {
      throw {
        status: 403,
        message: 'You are not assigned to teach this subject in this section',
        code: 'UNAUTHORIZED_ALLOCATION',
      };
    }

    const [subject, students, assessments, assignments, notes] = await Promise.all([
      CentralSubject.findById(centralSubjectId),
      StudentEnrollment.find({ sectionId, status: 'ENROLLED' })
        .populate('studentId', 'fullName fullNameNepali username email status')
        .sort({ rollNumber: 1 }),
      ExamAssessment.find({ institutionId, sectionId, centralSubjectId }).sort({ createdAt: -1 }),
      Assignment.find({ institutionId, sectionId, centralSubjectId, teacherId }).sort({ dueDate: 1 }),
      SmartBoardNote.find({ institutionId, teacherId, sectionId, subjectId: centralSubjectId }).sort({ createdAt: -1 }),
    ]);

    if (!subject) {
      throw { status: 404, message: 'Section or subject not found', code: 'NOT_FOUND' };
    }

    // Get matching interactive simulations for this grade & domain
    const simulations = await SimulationCatalog.find({
      $or: [
        { subjectId: centralSubjectId },
        { gradeLevels: (section.classId as any)?.gradeNumber || 10 },
      ],
    }).limit(10);

    // The textbook for this subject, grade and the section's medium only. Never a substitute.
    const digitalTextbook = await TextbookAccessService.digitalTextbookFor(centralSubjectId, sectionMedium(section));
    const textbooks = [digitalTextbook.textbook, ...digitalTextbook.supplementary].filter(Boolean);

    return {
      section,
      subject,
      students,
      digitalTextbook,
      textbooks,
      simulations,
      assessments,
      assignments,
      notes,
      studentCount: students.length,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 4. SECTION ATTENDANCE MANAGEMENT
  // ══════════════════════════════════════════════════════════════════
  static async recordSectionAttendance(
    teacherId: string,
    institutionId: string,
    data: {
      sectionId: string;
      date: string | Date;
      /** Optional: a lesson-level record for one subject/period instead of the daily roll call. */
      centralSubjectId?: string;
      periodNumber?: number;
      topic?: string;
      records: Array<{ studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'EXCUSED'; remarks?: string }>;
    }
  ) {
    const section = await this.verifyTeacherSection(teacherId, institutionId, data.sectionId, true);
    const isClassTeacher = String((section as any).classTeacherId) === String(teacherId);
    if (data.centralSubjectId) {
      const teachesIt = await SubjectAllocation.exists({ sectionId: data.sectionId, centralSubjectId: data.centralSubjectId, teacherId, status: { $ne: 'INACTIVE' } });
      if (!teachesIt && !isClassTeacher) {
        throw { status: 403, message: 'You are not assigned to teach this subject in this section', code: 'UNAUTHORIZED_ALLOCATION' };
      }
    }
    const period = data.periodNumber === undefined || data.periodNumber === null ? undefined : Number(data.periodNumber);
    if (period !== undefined && (!Number.isInteger(period) || period < 1 || period > 12)) {
      throw { status: 400, message: 'Period must be a whole number from 1 to 12', code: 'INVALID_PERIOD' };
    }
    const enrolledStudentIds = await StudentEnrollment.distinct('studentId', {
      sectionId: data.sectionId,
      status: 'ENROLLED',
    });
    const enrolledIds = new Set(enrolledStudentIds.map((id) => id.toString()));
    const submittedIds = data.records.map((record) => record.studentId);
    if (
      submittedIds.some((id) => !enrolledIds.has(id)) ||
      new Set(submittedIds).size !== submittedIds.length ||
      submittedIds.length !== enrolledIds.size
    ) {
      throw { status: 400, message: 'Attendance must include each enrolled student exactly once.', code: 'INVALID_ATTENDANCE_ROSTER' };
    }

    // Stored at 00:00 Nepal time, whatever time zone the server runs in
    const recordDate = schoolDayStart(data.date);

    // One record per section + day for the daily roll call, or per section + day + subject + period for a lesson
    const key: any = {
      institutionId,
      sectionId: data.sectionId,
      date: { $gte: recordDate, $lt: schoolDayEnd(data.date) },
    };
    if (data.centralSubjectId) {
      key.centralSubjectId = data.centralSubjectId;
      key.periodNumber = period ?? 1;
    } else {
      key.centralSubjectId = null; // matches records without a subject (daily roll call)
    }
    const existing = await AttendanceRecord.findOne(key);

    const topic = String(data.topic || '').trim().slice(0, 300);
    if (existing) {
      existing.records = data.records as any;
      existing.recordedBy = teacherId as any;
      (existing as any).topic = topic;
      await existing.save();
      this.announceAttendance(institutionId, data, period, records_summary(data.records));
      return existing;
    }

    const created = await AttendanceRecord.create({
      institutionId,
      sectionId: data.sectionId,
      centralSubjectId: data.centralSubjectId || undefined,
      periodNumber: period ?? 1,
      topic,
      date: recordDate,
      recordedBy: teacherId,
      records: data.records,
    });
    this.announceAttendance(institutionId, data, period, records_summary(data.records));
    return created;
  }

  /** Tell the section and the school's supervisors that attendance changed so open dashboards refresh. */
  private static announceAttendance(institutionId: string, data: { sectionId: string; centralSubjectId?: string; date: string | Date }, period: number | undefined, summary: { total: number; present: number; absent: number }) {
    SocketService.emitAttendanceMarked(institutionId, data.sectionId, {
      sectionId: data.sectionId,
      centralSubjectId: data.centralSubjectId,
      periodNumber: period ?? 1,
      date: data.date,
      ...summary,
    });
  }

  static async getSectionAttendanceHistory(
    teacherId: string,
    institutionId: string,
    sectionId: string,
    queryDate?: string
  ) {
    await this.verifyTeacherSection(teacherId, institutionId, sectionId, true);
    const filter: any = { institutionId, sectionId };
    if (queryDate) {
      filter.date = { $gte: schoolDayStart(queryDate), $lt: schoolDayEnd(queryDate) };
    }

    return AttendanceRecord.find(filter)
      .populate('records.studentId', 'fullName rollNumber username')
      .sort({ date: -1 })
      .limit(30);
  }

  // ══════════════════════════════════════════════════════════════════
  // 5. MARKS ENTRY & ASSESSMENTS
  // ══════════════════════════════════════════════════════════════════
  static async createAssessment(
    teacherId: string,
    institutionId: string,
    data: {
      academicYearId: string;
      sectionId: string;
      centralSubjectId: string;
      name: string;
      examType?: 'UNIT_TEST' | 'TERMINAL' | 'FINAL' | 'PRACTICAL';
      totalMarks?: number;
      passMarks?: number;
    }
  ) {
    // Verify allocation
    const section = await this.verifyTeacherSection(teacherId, institutionId, data.sectionId, true);
    if (section.academicYearId?.toString() !== data.academicYearId) {
      throw { status: 400, message: 'Assessment academic year must match the section academic year.', code: 'ACADEMIC_YEAR_MISMATCH' };
    }
    const allocation = await SubjectAllocation.findOne({
      sectionId: data.sectionId,
      centralSubjectId: data.centralSubjectId,
      teacherId,
    });
    if (!allocation) {
      throw { status: 403, message: 'You can only create assessments for subjects you teach', code: 'UNAUTHORIZED' };
    }

    const total = data.totalMarks || 100;
    const pass = data.passMarks || Math.round(total * 0.4);

    return ExamAssessment.create({
      institutionId,
      academicYearId: data.academicYearId,
      sectionId: data.sectionId,
      centralSubjectId: data.centralSubjectId,
      name: data.name,
      examType: data.examType || 'TERMINAL',
      totalMarks: total,
      passMarks: pass,
      isPublished: false,
    });
  }

  static async getAssessments(teacherId: string, institutionId: string, sectionId: string, centralSubjectId?: string) {
    await this.verifyTeacherSection(teacherId, institutionId, sectionId, true);
    const filter: any = { institutionId, sectionId };
    if (centralSubjectId) filter.centralSubjectId = centralSubjectId;
    return ExamAssessment.find(filter).populate('centralSubjectId', 'name nameNepali code').sort({ createdAt: -1 });
  }

  static async recordSubjectMarks(
    teacherId: string,
    institutionId: string,
    data: {
      assessmentId: string;
      marks: Array<{ studentId: string; marksObtained: number; remarks?: string }>;
    }
  ) {
    const assessment = await ExamAssessment.findOne({ _id: data.assessmentId, institutionId });
    if (!assessment) {
      throw { status: 404, message: 'Assessment not found', code: 'ASSESSMENT_NOT_FOUND' };
    }

    // Verify teacher is assigned to this subject
    const allocation = await SubjectAllocation.findOne({
      sectionId: assessment.sectionId,
      centralSubjectId: assessment.centralSubjectId,
      teacherId,
    });
    if (!allocation) {
      throw { status: 403, message: 'You are not authorized to submit marks for this subject', code: 'UNAUTHORIZED' };
    }

    await this.verifyTeacherSection(teacherId, institutionId, assessment.sectionId.toString(), true);

    // Once submitted for review, marks are locked for the subject teacher
    if (assessment.workflowStatus && assessment.workflowStatus !== 'DRAFT') {
      throw { status: 409, message: 'Marks were already submitted and can no longer be edited', code: 'MARKS_LOCKED' };
    }
    if (data.marks.some((m) => !Number.isFinite(m.marksObtained) || m.marksObtained < 0 || m.marksObtained > assessment.totalMarks)) {
      throw { status: 400, message: `Marks must be between 0 and ${assessment.totalMarks}`, code: 'INVALID_MARKS' };
    }
    const enrolledStudentIds = await StudentEnrollment.distinct('studentId', {
      sectionId: assessment.sectionId,
      status: 'ENROLLED',
    });
    const enrolledIds = new Set(enrolledStudentIds.map((id) => id.toString()));
    if (data.marks.some((item) => !enrolledIds.has(item.studentId))) {
      throw { status: 400, message: 'Marks can only be recorded for currently enrolled students.', code: 'INVALID_STUDENT_ENROLLMENT' };
    }

    const savedMarks = [];
    for (const item of data.marks) {
      const percentage = (item.marksObtained / assessment.totalMarks) * 100;
      const { grade, gpa } = NepalGradingUtil.calculateGrade(percentage);

      const markDoc = await StudentMark.findOneAndUpdate(
        { assessmentId: assessment._id, studentId: item.studentId },
        {
          $set: {
            marksObtained: item.marksObtained,
            totalMarks: assessment.totalMarks,
            percentage: Math.round(percentage * 10) / 10,
            grade,
            gpa,
            submittedBy: teacherId,
            remarks: item.remarks,
          },
        },
        { upsert: true, returnDocument: 'after' }
      );
      savedMarks.push(markDoc);

      await MarksAuditLog.create({
        institutionId,
        assessmentId: assessment._id,
        markId: markDoc._id,
        studentId: item.studentId,
        action: 'UPDATE',
        newValues: { marksObtained: item.marksObtained, grade, gpa },
        changedBy: teacherId,
        userRole: 'TEACHER',
        reason: 'Subject teacher entered marks',
      });
    }

    return {
      assessment,
      marksCount: savedMarks.length,
      marks: savedMarks,
    };
  }

  static async getAssessmentMarks(assessmentId: string, teacherId: string, institutionId: string) {
    const assessment = await ExamAssessment.findOne({ _id: assessmentId, institutionId });
    if (!assessment) {
      throw { status: 404, message: 'Assessment not found', code: 'ASSESSMENT_NOT_FOUND' };
    }
    const allocated = await SubjectAllocation.exists({
      sectionId: assessment.sectionId,
      centralSubjectId: assessment.centralSubjectId,
      teacherId,
    });
    if (!allocated) {
      throw { status: 403, message: 'You do not teach this subject in this section', code: 'UNAUTHORIZED' };
    }
    return StudentMark.find({ assessmentId })
      .populate('studentId', 'fullName rollNumber username')
      .sort({ marksObtained: -1 });
  }

  // ══════════════════════════════════════════════════════════════════
  // 6. ASSIGNMENTS
  // ══════════════════════════════════════════════════════════════════
  static async createAssignment(
    teacherId: string,
    institutionId: string,
    data: {
      sectionId: string;
      centralSubjectId: string;
      title: string;
      description: string;
      dueDate: Date | string;
    }
  ) {
    return Assignment.create({
      institutionId,
      sectionId: data.sectionId,
      centralSubjectId: data.centralSubjectId,
      teacherId,
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate),
    });
  }

  static async getAssignments(teacherId: string, sectionId: string, centralSubjectId?: string) {
    const filter: any = { sectionId, teacherId };
    if (centralSubjectId) filter.centralSubjectId = centralSubjectId;
    return Assignment.find(filter).populate('centralSubjectId', 'name nameNepali').sort({ dueDate: 1 });
  }

  static async getAssignmentSubmissions(teacherId: string, assignmentId: string, institutionId: string) {
    const assignment = await Assignment.findOne({ _id: assignmentId, institutionId });
    if (!assignment) {
      throw { status: 404, message: 'Assignment not found', code: 'ASSIGNMENT_NOT_FOUND' };
    }

    return AssignmentSubmission.find({ assignmentId })
      .populate('studentId', 'fullName fullNameNepali username email')
      .sort({ submittedAt: -1 });
  }

  static async gradeAssignmentSubmission(
    teacherId: string,
    submissionId: string,
    marksObtained: number,
    feedback: string | undefined,
    institutionId: string
  ) {
    const submission = await AssignmentSubmission.findOne({ _id: submissionId, institutionId });
    if (!submission) {
      throw { status: 404, message: 'Submission not found', code: 'SUBMISSION_NOT_FOUND' };
    }

    submission.marksObtained = marksObtained;
    if (feedback !== undefined) submission.feedback = feedback;
    submission.status = 'GRADED';
    submission.gradedBy = teacherId as any;
    submission.gradedAt = new Date();
    await submission.save();

    return submission;
  }

  // ══════════════════════════════════════════════════════════════════
  // SYLLABUS / CHAPTER PROGRESS (real textbook chapters + saved progress)
  // ══════════════════════════════════════════════════════════════════
  private static async assertAllocated(teacherId: string, institutionId: string, sectionId: string, centralSubjectId: string) {
    // Allocation documents do not always carry institutionId, so tenancy is checked through the section's class
    const sec: any = await Section.findById(sectionId).populate('classId', 'institutionId');
    const allocated =
      sec && String(sec.classId?.institutionId) === String(institutionId) &&
      (await SubjectAllocation.exists({ sectionId, centralSubjectId, teacherId, status: { $ne: 'INACTIVE' } }));
    if (!allocated) {
      throw { status: 403, message: 'You are not assigned to teach this subject in this section', code: 'UNAUTHORIZED_ALLOCATION' };
    }
  }

  static async getSyllabus(teacherId: string, institutionId: string, sectionId: string, centralSubjectId: string) {
    await this.assertAllocated(teacherId, institutionId, sectionId, centralSubjectId);

    const section: any = await Section.findById(sectionId).populate('classId', 'gradeNumber');
    const gradeNumber = section?.classId?.gradeNumber;

    const textbooks: any[] = await Textbook.find({
      subjectId: centralSubjectId,
      isActive: { $ne: false },
      documentType: { $ne: 'SELF_STUDY' },
      ...(gradeNumber ? { gradeNumber } : {}),
    }).lean();
    // Prefer a textbook whose chapters have been extracted
    let chapters: any[] = [];
    let textbookTitle: string | null = null;
    for (const tb of textbooks) {
      const found: any[] = await TextbookChapter.find({ textbookId: tb._id }).sort({ chapterNumber: 1 }).lean();
      if (found.length > 0) {
        chapters = found;
        textbookTitle = tb.title;
        break;
      }
    }

    const saved: any[] = await SyllabusProgress.find({ sectionId, centralSubjectId }).lean();
    const savedByChapter = new Map(saved.map((d) => [d.chapterNumber, d]));

    const merged = chapters.map((c) => {
      const prog = savedByChapter.get(c.chapterNumber);
      return {
        ch: c.chapterNumber,
        title: c.title,
        obj: c.unitTitle || c.summary || '',
        status: prog?.status || 'NOT_STARTED',
        progress: prog?.completionPercentage ?? 0,
        hours: prog?.teachingHoursSpent ?? 0,
      };
    });
    // Progress saved against chapters that no longer exist in the textbook still counts
    saved
      .filter((d) => !chapters.some((c) => c.chapterNumber === d.chapterNumber))
      .forEach((d) =>
        merged.push({ ch: d.chapterNumber, title: d.chapterTitle, obj: '', status: d.status, progress: d.completionPercentage ?? 0, hours: d.teachingHoursSpent ?? 0 })
      );
    merged.sort((a, b) => a.ch - b.ch);

    return { textbookTitle, gradeNumber: gradeNumber ?? null, chapters: merged };
  }

  static async saveSyllabusProgress(
    teacherId: string,
    institutionId: string,
    data: { sectionId: string; centralSubjectId: string; chapterNumber: number; chapterTitle: string; completionPercentage: number; teachingHoursSpent?: number }
  ) {
    await this.assertAllocated(teacherId, institutionId, data.sectionId, data.centralSubjectId);
    const section: any = await Section.findById(data.sectionId);
    if (!section) throw { status: 404, message: 'Section not found', code: 'SECTION_NOT_FOUND' };

    const pct = Math.max(0, Math.min(100, Number(data.completionPercentage) || 0));
    const status = pct >= 100 ? 'COMPLETED' : pct > 0 ? 'IN_PROGRESS' : 'NOT_STARTED';

    // Server derives class / year from the section; the client cannot choose them
    return AnalyticsService.recordSyllabusProgress({
      institutionId,
      academicYearId: String(section.academicYearId),
      classId: String(section.classId),
      sectionId: data.sectionId,
      centralSubjectId: data.centralSubjectId,
      teacherId,
      chapterNumber: Number(data.chapterNumber),
      chapterTitle: data.chapterTitle || `Chapter ${data.chapterNumber}`,
      status,
      completionPercentage: pct,
      teachingHoursSpent: Number(data.teachingHoursSpent) || 0,
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // STUDENT INSIGHTS (attendance, marks, assignments, quizzes per student)
  // ══════════════════════════════════════════════════════════════════
  static async getStudentInsights(teacherId: string, institutionId: string, sectionId: string, centralSubjectId?: string) {
    const section: any = await this.verifyTeacherSection(teacherId, institutionId, sectionId, true);
    const isClassTeacher = String(section.classTeacherId) === String(teacherId);

    // Which subjects this view may cover
    const myAllocs: any[] = await SubjectAllocation.find({ sectionId, teacherId, status: { $ne: 'INACTIVE' } }, 'centralSubjectId').lean();
    const mySubjectIds = myAllocs.map((a) => String(a.centralSubjectId));
    let subjectIds: string[] | null; // null = every subject of the section
    if (centralSubjectId) {
      if (!isClassTeacher && !mySubjectIds.includes(String(centralSubjectId))) {
        throw { status: 403, message: 'You are not assigned to teach this subject in this section', code: 'UNAUTHORIZED_ALLOCATION' };
      }
      subjectIds = [String(centralSubjectId)];
    } else {
      subjectIds = isClassTeacher ? null : mySubjectIds;
    }
    const subjectFilter: any = subjectIds ? { $in: subjectIds } : { $exists: true };

    const enrollments: any[] = await StudentEnrollment.find({ sectionId, status: 'ENROLLED' })
      .populate('studentId', 'fullName fullNameNepali username')
      .sort({ rollNumber: 1 })
      .lean();
    const studentIds = enrollments.map((e) => e.studentId?._id).filter(Boolean);

    // Attendance: one result per student per day over the last 90 days
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const attAgg: any[] = await AttendanceRecord.aggregate([
      { $match: { sectionId: new (require('mongoose').Types.ObjectId)(sectionId), date: { $gte: since } } },
      { $unwind: '$records' },
      {
        $group: {
          _id: { s: '$records.studentId', d: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: 'Asia/Kathmandu' } } },
          present: { $max: { $cond: [{ $in: ['$records.status', ['PRESENT', 'LATE']] }, 1, 0] } },
        },
      },
      { $group: { _id: '$_id.s', days: { $sum: 1 }, present: { $sum: '$present' } } },
    ]);
    const attMap = new Map<string, any>(attAgg.map((a) => [String(a._id), a]));

    // Marks (submitted or later only)
    const marks: any[] = await StudentMark.find(
      { sectionId, studentId: { $in: studentIds }, workflowStatus: { $ne: 'DRAFT' }, centralSubjectId: subjectFilter },
      'studentId centralSubjectId percentage gpa'
    ).lean();

    // Assignments and quizzes of the section
    const assignments: any[] = await Assignment.find({ sectionId, status: 'ACTIVE', centralSubjectId: subjectFilter }, '_id').lean();
    const asgIds = assignments.map((a) => a._id);
    const submissions: any[] = asgIds.length
      ? await AssignmentSubmission.find({ assignmentId: { $in: asgIds }, studentId: { $in: studentIds } }, 'studentId assignmentId').lean()
      : [];
    const quizzes: any[] = await Quiz.find({ sectionId, status: 'PUBLISHED', centralSubjectId: subjectFilter }, '_id').lean();
    const quizIds = quizzes.map((q) => q._id);
    const attempts: any[] = quizIds.length
      ? await QuizAttempt.find({ quizId: { $in: quizIds }, studentId: { $in: studentIds } }, 'studentId quizId percentage').lean()
      : [];

    const subjectNames = new Map<string, string>(
      (await CentralSubject.find({ _id: { $in: marks.map((m) => m.centralSubjectId) } }, 'name').lean()).map((c: any) => [String(c._id), c.name])
    );

    const avg = (arr: number[]) => (arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null);

    const students = enrollments.map((e) => {
      const sid = String(e.studentId?._id);
      const att = attMap.get(sid);
      const attendance = att && att.days > 0 ? Math.round((att.present / att.days) * 100) : null;
      const myMarks = marks.filter((m) => String(m.studentId) === sid);
      const avgPercent = avg(myMarks.map((m) => m.percentage || 0));
      const gpa = avg(myMarks.map((m) => m.gpa || 0));
      const submitted = new Set(submissions.filter((x) => String(x.studentId) === sid).map((x) => String(x.assignmentId))).size;
      const assignmentRate = asgIds.length ? Math.round((submitted / asgIds.length) * 100) : null;
      // best attempt per quiz
      const best = new Map<string, number>();
      attempts.filter((a) => String(a.studentId) === sid).forEach((a) => best.set(String(a.quizId), Math.max(best.get(String(a.quizId)) || 0, a.percentage || 0)));
      const quizAvg = best.size ? avg([...best.values()]) : null;

      const reasons: string[] = [];
      if (attendance !== null && attendance < 75) reasons.push(`Attendance ${attendance}% (below 75%)`);
      if (avgPercent !== null && avgPercent < 40) reasons.push(`Average score ${avgPercent}%`);
      if (gpa !== null && gpa < 2) reasons.push(`GPA ${gpa}`);
      if (assignmentRate !== null && assignmentRate < 50) reasons.push(`Only ${assignmentRate}% of assignments submitted`);
      let status = 'ON_TRACK';
      if (reasons.length >= 1 && ((attendance !== null && attendance < 75) || (avgPercent !== null && avgPercent < 40) || (gpa !== null && gpa < 2))) status = 'FLAGGED';
      else if (reasons.length >= 1 || (attendance !== null && attendance < 85) || (avgPercent !== null && avgPercent < 50)) status = 'NEEDS_SUPPORT';
      else if (avgPercent !== null && avgPercent >= 85 && (attendance === null || attendance >= 90)) status = 'EXCELLENT';

      const subjectScores: Record<string, number> = {};
      const bySubject = new Map<string, number[]>();
      myMarks.forEach((m) => bySubject.set(String(m.centralSubjectId), [...(bySubject.get(String(m.centralSubjectId)) || []), m.percentage || 0]));
      bySubject.forEach((v, k) => { subjectScores[subjectNames.get(k) || 'Subject'] = avg(v) as number; });

      return {
        studentId: sid,
        rollNumber: e.rollNumber,
        fullName: e.studentId?.fullName || 'Student',
        username: e.studentId?.username,
        guardianName: e.guardianName || null,
        guardianPhone: e.guardianPhone || null,
        attendance,
        avgPercent,
        gpa,
        assignmentRate,
        quizAvg,
        status,
        flagReason: reasons.join(' • '),
        subjectScores,
      };
    });

    const num = (arr: Array<number | null>) => avg(arr.filter((x): x is number => x !== null));
    const summary = {
      studentCount: students.length,
      avgGpa: num(students.map((s) => s.gpa)),
      avgAttendance: num(students.map((s) => s.attendance)),
      avgScore: num(students.map((s) => s.avgPercent)),
      flaggedCount: students.filter((s) => s.status === 'FLAGGED').length,
      needsSupportCount: students.filter((s) => s.status === 'NEEDS_SUPPORT').length,
      assignmentCount: asgIds.length,
      quizCount: quizIds.length,
    };

    // Per-subject averages for the class-teacher matrix
    const subjectMatrix: any[] = [];
    const perSubject = new Map<string, number[]>();
    marks.forEach((m) => perSubject.set(String(m.centralSubjectId), [...(perSubject.get(String(m.centralSubjectId)) || []), m.percentage || 0]));
    perSubject.forEach((vals, k) => {
      subjectMatrix.push({
        subjectId: k,
        subject: subjectNames.get(k) || 'Subject',
        average: avg(vals),
        passRate: Math.round((vals.filter((v) => v >= 35).length / vals.length) * 100),
        entries: vals.length,
      });
    });
    subjectMatrix.sort((a, b) => a.subject.localeCompare(b.subject));

    return { scope: subjectIds ? 'SUBJECT' : 'ALL_SUBJECTS', summary, students, subjectMatrix };
  }

  // ══════════════════════════════════════════════════════════════════
  // REMARKS & INTERVENTIONS
  // ══════════════════════════════════════════════════════════════════
  static async addRemark(
    teacherId: string,
    institutionId: string,
    data: { studentId: string; sectionId: string; centralSubjectId?: string; kind?: 'REMARK' | 'INTERVENTION'; title?: string; text: string; notifyStudent?: boolean }
  ) {
    await this.verifyTeacherSection(teacherId, institutionId, data.sectionId, true);
    if (!data.text || !String(data.text).trim()) {
      throw { status: 400, message: 'Please write something first', code: 'TEXT_REQUIRED' };
    }
    const enrolled = await StudentEnrollment.exists({ studentId: data.studentId, sectionId: data.sectionId, status: 'ENROLLED' });
    if (!enrolled) {
      throw { status: 404, message: 'Student is not enrolled in this section', code: 'STUDENT_NOT_FOUND' };
    }
    const remark = await StudentRemark.create({
      institutionId,
      studentId: data.studentId,
      sectionId: data.sectionId,
      centralSubjectId: data.centralSubjectId || null,
      teacherId,
      kind: data.kind === 'INTERVENTION' ? 'INTERVENTION' : 'REMARK',
      title: data.title || '',
      text: String(data.text).trim(),
    });
    if (data.notifyStudent) {
      const teacher: any = await User.findById(teacherId, 'fullName');
      await NotificationService.sendNotification({
        recipientId: data.studentId,
        institutionId,
        title: data.title || (data.kind === 'INTERVENTION' ? 'Learning support note' : 'Teacher remark'),
        message: `${teacher?.fullName || 'Your teacher'}: ${String(data.text).trim().slice(0, 240)}`,
        type: 'SYSTEM_ALERT',
        priority: data.kind === 'INTERVENTION' ? 'HIGH' : 'NORMAL',
      });
    }
    return remark;
  }

  static async listRemarks(teacherId: string, institutionId: string, sectionId: string, studentId?: string) {
    await this.verifyTeacherSection(teacherId, institutionId, sectionId, true);
    const filter: any = { institutionId, sectionId };
    if (studentId) filter.studentId = studentId;
    return StudentRemark.find(filter).sort({ createdAt: -1 }).limit(100).populate('studentId', 'fullName').populate('teacherId', 'fullName');
  }
}
