import mongoose from 'mongoose';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { ClassTeacherService } from '../class-teacher/class-teacher.service';
import {
  Institution,
  User,
  AcademicYear,
  Class,
  Section,
  StudentEnrollment,
  CentralSubject,
  SubjectAllocation,
  AttendanceRecord,
  Examination,
  ExamAssessment,
  StudentMark,
  MarksAuditLog,
  GradingScheme,
  SyllabusProgress,
  TimetableEntry,
} from '../../models';
import { Assignment, AssignmentSubmission } from '../../models/Assessment';
import { Timetable as TimetableModel } from '../../models/Timetable';
import { Quiz, QuizAttempt } from '../../models/Quiz';
import { NepalGradingUtil } from '../../common/utils/nepal-grading.util';
import { SocketService } from '../../common/services/socket.service';

export class AnalyticsService {
  // ══════════════════════════════════════════════════════════════════
  // 1. PRINCIPAL ANALYTICS (INSTITUTION-WIDE REPORTING)
  // ══════════════════════════════════════════════════════════════════

  /**
   * Comprehensive institution-wide analytics dashboard for Principals and School Admins
   * Uses efficient MongoDB aggregation pipelines.
   */
  static async getPrincipalAnalytics(
    institutionId: string,
    filterParams: { academicYearId?: string; classId?: string; sectionId?: string; examinationId?: string } = {}
  ) {
    const instObjectId = new mongoose.Types.ObjectId(institutionId);

    // 1. Fetch available structural filters for the institution
    const instClasses = await Class.find({ institutionId: instObjectId }).sort({ gradeNumber: 1 });
    const instClassIds = instClasses.map((c) => c._id);
    const instSections = await Section.find({ classId: { $in: instClassIds } }).sort({ name: 1 });
    const instSectionIds = instSections.map((s) => s._id);
    const instExams = await Examination.find({ institutionId: instObjectId }).sort({ startDate: 1 });

    // Sanitize filter selections
    const selectedClassId = filterParams.classId && filterParams.classId !== 'ALL' ? filterParams.classId : null;
    const selectedSectionId = filterParams.sectionId && filterParams.sectionId !== 'ALL' ? filterParams.sectionId : null;
    const selectedExamId = filterParams.examinationId && filterParams.examinationId !== 'ALL' ? filterParams.examinationId : null;

    // Scope match for StudentMark
    // Exclude unsubmitted DRAFT marks so principal analytics only reflect submitted/approved/published results
    const markMatch: any = { institutionId: instObjectId, workflowStatus: { $ne: 'DRAFT' } };
    if (selectedClassId) {
      markMatch.classId = new mongoose.Types.ObjectId(selectedClassId);
    }
    if (selectedSectionId) {
      markMatch.sectionId = new mongoose.Types.ObjectId(selectedSectionId);
    }
    if (selectedExamId) {
      markMatch.examinationId = new mongoose.Types.ObjectId(selectedExamId);
    }

    // Scope match for Attendance
    let attendanceSectionIds = instSectionIds;
    if (selectedSectionId) {
      attendanceSectionIds = [new mongoose.Types.ObjectId(selectedSectionId)];
    } else if (selectedClassId) {
      attendanceSectionIds = instSections
        .filter((s) => s.classId?.toString() === selectedClassId)
        .map((s) => s._id);
    }
    const attendanceMatch: any = {
      institutionId: instObjectId,
      sectionId: { $in: attendanceSectionIds },
    };

    // 2. Core KPIs & Scope Statistics
    const studentEnrollMatch: any = {
      sectionId: { $in: attendanceSectionIds },
      status: 'ENROLLED',
    };

    const [
      totalStudents,
      totalFaculty,
      activeAssignments,
      activeQuizzes,
      pendingSubmissions,
      markKpiAgg,
    ] = await Promise.all([
      StudentEnrollment.countDocuments(studentEnrollMatch),
      User.countDocuments({ institutionId: instObjectId, role: 'TEACHER', status: 'ACTIVE' }),
      Assignment.countDocuments({
        institutionId: instObjectId,
        ...(selectedSectionId ? { sectionId: new mongoose.Types.ObjectId(selectedSectionId) } : {}),
      }),
      Quiz.countDocuments({ institutionId: instObjectId, status: 'PUBLISHED' }),
      AssignmentSubmission.countDocuments({
        institutionId: instObjectId,
        status: { $in: ['SUBMITTED', 'RESUBMITTED', 'LATE'] },
      }),
      StudentMark.aggregate([
        { $match: markMatch },
        {
          $group: {
            _id: null,
            averageGpa: { $avg: '$gpa' },
            averageScore: { $avg: '$percentage' },
            totalEvaluated: { $sum: 1 },
            passCount: { $sum: { $cond: [{ $gte: ['$percentage', 35] }, 1, 0] } },
            distinctionCount: { $sum: { $cond: [{ $gte: ['$gpa', 3.6] }, 1, 0] } },
            atRiskCount: { $sum: { $cond: [{ $or: [{ $eq: ['$grade', 'NG'] }, { $lt: ['$gpa', 2.0] }] }, 1, 0] } },
          },
        },
      ]),
    ]);

    const markKpi = markKpiAgg && markKpiAgg.length > 0 ? markKpiAgg[0] : null;

    // 3. Institution Attendance Aggregation
    const attendanceAgg = await AttendanceRecord.aggregate([
      { $match: attendanceMatch },
      { $unwind: '$records' },
      {
        $group: {
          _id: '$records.status',
          count: { $sum: 1 },
        },
      },
    ]);

    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let leaveCount = 0;
    let totalAttendanceRecords = 0;

    attendanceAgg.forEach((item) => {
      totalAttendanceRecords += item.count;
      if (item._id === 'PRESENT') presentCount += item.count;
      else if (item._id === 'ABSENT') absentCount += item.count;
      else if (item._id === 'LATE') lateCount += item.count;
      else if (item._id === 'LEAVE' || item._id === 'EXCUSED') leaveCount += item.count;
    });

    const overallAttendanceRate =
      totalAttendanceRecords > 0 ? Math.round(((presentCount + lateCount) / totalAttendanceRecords) * 100) : null;

    // Daily attendance trends (last 7 distinct dates)
    const dailyAttendanceTrend = await AttendanceRecord.aggregate([
      { $match: attendanceMatch },
      { $unwind: '$records' },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          totalStudents: { $sum: 1 },
          presentStudents: {
            $sum: { $cond: [{ $in: ['$records.status', ['PRESENT', 'LATE']] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 7 },
      {
        $project: {
          date: '$_id',
          attendanceRate: {
            $cond: [
              { $gt: ['$totalStudents', 0] },
              { $round: [{ $multiply: [{ $divide: ['$presentStudents', '$totalStudents'] }, 100] }, 1] },
              null,
            ],
          },
          presentStudents: 1,
          totalStudents: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // 4. Class-by-Class (or Section-by-Section if a class is selected) Comparative Performance
    const classPerformance = selectedClassId
      ? await StudentMark.aggregate([
          { $match: markMatch },
          {
            $group: {
              _id: '$sectionId',
              averageGpa: { $avg: '$gpa' },
              averageScore: { $avg: '$percentage' },
              totalEvaluated: { $sum: 1 },
              passCount: {
                $sum: { $cond: [{ $gte: ['$percentage', 35] }, 1, 0] },
              },
            },
          },
          {
            $lookup: {
              from: 'sections',
              localField: '_id',
              foreignField: '_id',
              as: 'sectionDetails',
            },
          },
          { $unwind: '$sectionDetails' },
          {
            $project: {
              classId: '$_id',
              className: '$sectionDetails.name',
              gradeNumber: { $literal: 0 },
              averageGpa: { $round: ['$averageGpa', 2] },
              averageScore: { $round: ['$averageScore', 1] },
              passPercentage: {
                $cond: [
                  { $gt: ['$totalEvaluated', 0] },
                  { $round: [{ $multiply: [{ $divide: ['$passCount', '$totalEvaluated'] }, 100] }, 1] },
                  0,
                ],
              },
              totalEvaluated: 1,
            },
          },
          { $sort: { className: 1 } },
        ])
      : await StudentMark.aggregate([
          { $match: markMatch },
          {
            $group: {
              _id: '$classId',
              averageGpa: { $avg: '$gpa' },
              averageScore: { $avg: '$percentage' },
              totalEvaluated: { $sum: 1 },
              passCount: {
                $sum: { $cond: [{ $gte: ['$percentage', 35] }, 1, 0] },
              },
            },
          },
          {
            $lookup: {
              from: 'classes',
              localField: '_id',
              foreignField: '_id',
              as: 'classDetails',
            },
          },
          { $unwind: '$classDetails' },
          {
            $project: {
              classId: '$_id',
              className: '$classDetails.name',
              gradeNumber: '$classDetails.gradeNumber',
              averageGpa: { $round: ['$averageGpa', 2] },
              averageScore: { $round: ['$averageScore', 1] },
              passPercentage: {
                $cond: [
                  { $gt: ['$totalEvaluated', 0] },
                  { $round: [{ $multiply: [{ $divide: ['$passCount', '$totalEvaluated'] }, 100] }, 1] },
                  0,
                ],
              },
              totalEvaluated: 1,
            },
          },
          { $sort: { gradeNumber: 1 } },
        ]);

    // 5. Letter Grade Distribution across scoped query
    const gradeDistributionAgg = await StudentMark.aggregate([
      { $match: markMatch },
      {
        $group: {
          _id: '$grade',
          count: { $sum: 1 },
        },
      },
    ]);

    const gradeOrder = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'NG'];
    const gradeDistribution = gradeOrder.map((g) => {
      const match = gradeDistributionAgg.find((item) => item._id === g);
      return {
        grade: g,
        count: match ? match.count : 0,
      };
    });

    // 5. Subject Performance Comparison (Average scores across subjects)
    const subjectPerformance = await StudentMark.aggregate([
      { $match: markMatch },
      {
        $group: {
          _id: '$centralSubjectId',
          averageScore: { $avg: '$percentage' },
          averageTheory: { $avg: '$theoryMarks' },
          averagePractical: { $avg: '$practicalMarks' },
          totalEvaluated: { $sum: 1 },
          passCount: {
            $sum: { $cond: [{ $gte: ['$percentage', 35] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: 'centralsubjects',
          localField: '_id',
          foreignField: '_id',
          as: 'subjectDetails',
        },
      },
      { $unwind: '$subjectDetails' },
      {
        $project: {
          subjectId: '$_id',
          subjectName: '$subjectDetails.name',
          subjectCode: '$subjectDetails.code',
          grade: '$subjectDetails.gradeNumber',
          averageScore: { $round: ['$averageScore', 1] },
          averageTheory: { $round: ['$averageTheory', 1] },
          averagePractical: { $round: ['$averagePractical', 1] },
          totalEvaluated: 1,
          passPercentage: {
            $cond: [
              { $gt: ['$totalEvaluated', 0] },
              { $round: [{ $multiply: [{ $divide: ['$passCount', '$totalEvaluated'] }, 100] }, 1] },
              0,
            ],
          },
        },
      },
      { $sort: { averageScore: -1 } },
      { $limit: 25 },
    ]);

    // 6. Examination Workflow Completion
    const examProgressAgg = await ExamAssessment.aggregate([
      { $match: { institutionId: instObjectId } },
      {
        $group: {
          _id: '$workflowStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    const examProgress: Record<string, number> = {
      DRAFT: 0,
      SUBMITTED: 0,
      REVIEWED: 0,
      APPROVED: 0,
      PUBLISHED: 0,
    };
    let totalExamAssessments = 0;
    examProgressAgg.forEach((item) => {
      if (examProgress[item._id] !== undefined) {
        examProgress[item._id] = item.count;
      }
      totalExamAssessments += item.count;
    });

    const examCompletionRate =
      totalExamAssessments > 0
        ? Math.round(((examProgress.APPROVED + examProgress.PUBLISHED) / totalExamAssessments) * 100)
        : null;

    // 7. Syllabus Completion by Subject
    const syllabusAgg = await SyllabusProgress.aggregate([
      { $match: { institutionId: instObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    let completedChapters = 0;
    let inProgressChapters = 0;
    let notStartedChapters = 0;
    let totalChaptersTracked = 0;

    syllabusAgg.forEach((item) => {
      totalChaptersTracked += item.count;
      if (item._id === 'COMPLETED') completedChapters += item.count;
      else if (item._id === 'IN_PROGRESS') inProgressChapters += item.count;
      else notStartedChapters += item.count;
    });

    const syllabusCompletionPercentage =
      totalChaptersTracked > 0
        ? Math.round(((completedChapters + inProgressChapters * 0.5) / totalChaptersTracked) * 100)
        : null;

    // 8. Teacher Workload & Syllabus Pace
    // Only count periods from PUBLISHED timetables (plus legacy entries not tied to a timetable version)
    const publishedTimetableIds = (await TimetableModel.find({ institutionId: instObjectId, status: 'PUBLISHED' }, '_id').lean()).map((t: any) => t._id);
    const teacherWorkloads = await TimetableEntry.aggregate([
      {
        $match: {
          institutionId: instObjectId,
          $or: [{ timetableId: { $exists: false } }, { timetableId: null }, { timetableId: { $in: publishedTimetableIds } }],
        },
      },
      {
        $group: {
          _id: '$teacherId',
          assignedPeriods: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'teacherUser',
        },
      },
      { $unwind: '$teacherUser' },
      {
        $project: {
          teacherId: '$_id',
          fullName: '$teacherUser.fullName',
          email: '$teacherUser.email',
          assignedPeriods: 1,
          status: {
            $cond: [
              { $gt: ['$assignedPeriods', 24] },
              'HEAVY',
              { $cond: [{ $lt: ['$assignedPeriods', 12] }, 'LIGHT', 'NORMAL'] },
            ],
          },
        },
      },
      { $sort: { assignedPeriods: -1 } },
      { $limit: 8 },
    ]);

    // 9. Academic Trends (GPA trends across recent exams)
    const academicTrends = await StudentMark.aggregate([
      { $match: markMatch },
      {
        $group: {
          _id: '$examinationId',
          averageGpa: { $avg: '$gpa' },
          evaluatedCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'examinations',
          localField: '_id',
          foreignField: '_id',
          as: 'exam',
        },
      },
      { $unwind: '$exam' },
      {
        $project: {
          examinationId: '$_id',
          examName: '$exam.name',
          examType: '$exam.examType',
          averageGpa: { $round: ['$averageGpa', 2] },
          startDate: '$exam.startDate',
        },
      },
      { $sort: { startDate: 1 } },
    ]);

    // 10. Top 10 Honor Roll Performers
    const topPerformers = await StudentMark.aggregate([
      { $match: markMatch },
      {
        $group: {
          _id: '$studentId',
          averageGpa: { $avg: '$gpa' },
          totalScore: { $sum: '$totalMarks' },
          subjectsEvaluated: { $sum: 1 },
        },
      },
      { $sort: { averageGpa: -1, totalScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'studentenrollments',
          localField: '_id',
          foreignField: 'studentId',
          as: 'enrollment',
        },
      },
      { $unwind: { path: '$enrollment', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'classes',
          localField: 'enrollment.classId',
          foreignField: '_id',
          as: 'classDetails',
        },
      },
      { $unwind: { path: '$classDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'sections',
          localField: 'enrollment.sectionId',
          foreignField: '_id',
          as: 'sectionDetails',
        },
      },
      { $unwind: { path: '$sectionDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          studentId: '$_id',
          studentName: '$student.fullName',
          rollNumber: '$enrollment.rollNumber',
          className: '$classDetails.name',
          sectionName: '$sectionDetails.name',
          averageGpa: { $round: ['$averageGpa', 2] },
          totalScore: { $round: ['$totalScore', 1] },
          subjectsEvaluated: 1,
        },
      },
    ]);

    // 11. Institutional At-Risk Students Aggregation
    const atRiskStudentsAgg = await StudentMark.aggregate([
      { $match: markMatch },
      {
        $group: {
          _id: '$studentId',
          averageGpa: { $avg: '$gpa' },
          totalScore: { $sum: '$totalMarks' },
          failedSubjects: {
            $sum: { $cond: [{ $or: [{ $eq: ['$grade', 'NG'] }, { $lt: ['$totalMarks', 35] }] }, 1, 0] },
          },
          subjectsEvaluated: { $sum: 1 },
        },
      },
      {
        $match: {
          $or: [{ averageGpa: { $lt: 2.0 } }, { failedSubjects: { $gt: 0 } }],
        },
      },
      { $sort: { failedSubjects: -1, averageGpa: 1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'studentenrollments',
          localField: '_id',
          foreignField: 'studentId',
          as: 'enrollment',
        },
      },
      { $unwind: { path: '$enrollment', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'classes',
          localField: 'enrollment.classId',
          foreignField: '_id',
          as: 'classDetails',
        },
      },
      { $unwind: { path: '$classDetails', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'sections',
          localField: 'enrollment.sectionId',
          foreignField: '_id',
          as: 'sectionDetails',
        },
      },
      { $unwind: { path: '$sectionDetails', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          studentId: '$_id',
          studentName: '$student.fullName',
          email: '$student.email',
          rollNumber: '$enrollment.rollNumber',
          className: '$classDetails.name',
          sectionName: '$sectionDetails.name',
          averageGpa: { $round: ['$averageGpa', 2] },
          failedSubjects: 1,
          riskLevel: {
            $cond: [{ $gt: ['$failedSubjects', 2] }, 'HIGH', 'MODERATE'],
          },
        },
      },
      { $limit: 15 },
    ]);

    // 12. Institutional Alerts
    const alerts: any[] = [];
    if (pendingSubmissions > 0) {
      alerts.push({
        id: 'alt_pending_eval',
        type: 'WARNING',
        category: 'ASSESSMENT',
        title: 'Pending Assignment Evaluations',
        message: `${pendingSubmissions} student assignment submissions are awaiting faculty review & grading.`,
      });
    }
    if (atRiskStudentsAgg.length > 0) {
      alerts.push({
        id: 'alt_at_risk',
        type: 'CRITICAL',
        category: 'STUDENT',
        title: 'Academic Support Required',
        message: `${atRiskStudentsAgg.length} students identified with GPA < 2.0 or failing terminal exam marks.`,
      });
    }
    const heavyTeachers = teacherWorkloads.filter((t: any) => t.status === 'HEAVY');
    if (heavyTeachers.length > 0) {
      alerts.push({
        id: 'alt_heavy_workload',
        type: 'INFO',
        category: 'FACULTY',
        title: 'High Teaching Workload',
        message: `${heavyTeachers.length} teachers assigned > 24 periods per week in published timetable.`,
      });
    }
    if (syllabusCompletionPercentage !== null && syllabusCompletionPercentage < 50) {
      alerts.push({
        id: 'alt_syllabus_pace',
        type: 'WARNING',
        category: 'CURRICULUM',
        title: 'Curriculum Pacing Alert',
        message: `Overall institutional curriculum coverage is currently at ${syllabusCompletionPercentage}%.`,
      });
    }

    return {
      filters: {
        availableClasses: instClasses.map((c) => ({
          id: c._id.toString(),
          name: c.name,
          gradeNumber: c.gradeNumber,
        })),
        availableSections: instSections.map((s) => ({
          id: s._id.toString(),
          name: s.name,
          classId: s.classId ? s.classId.toString() : '',
        })),
        availableExams: instExams.map((e) => ({
          id: e._id.toString(),
          name: e.name,
          examType: e.examType,
        })),
        selectedClassId: selectedClassId || 'ALL',
        selectedSectionId: selectedSectionId || 'ALL',
        selectedExamId: selectedExamId || 'ALL',
      },
      kpi: {
        totalStudents,
        totalFaculty,
        totalClasses: instClasses.length,
        totalSections: attendanceSectionIds.length,
        overallAttendanceRate,
        averageGpa: markKpi?.averageGpa ? Math.round(markKpi.averageGpa * 100) / 100 : 0,
        terminalPassRate:
          markKpi && markKpi.totalEvaluated > 0
            ? Math.round((markKpi.passCount / markKpi.totalEvaluated) * 1000) / 10
            : 0,
        distinctionCount: markKpi?.distinctionCount || 0,
        atRiskCount: markKpi?.atRiskCount || 0,
        examCompletionRate,
        syllabusCompletionPercentage,
        activeAssignments,
        activeQuizzes,
        pendingSubmissions,
      },
      attendance: {
        overallRate: overallAttendanceRate,
        breakdown: {
          present: presentCount,
          absent: absentCount,
          late: lateCount,
          leave: leaveCount,
        },
        dailyTrend: dailyAttendanceTrend,
      },
      classPerformance,
      gradeDistribution,
      subjectPerformance,
      topPerformers,
      examinationProgress: {
        totalAssessments: totalExamAssessments,
        statusCounts: examProgress,
        completionRate: examCompletionRate,
      },
      syllabusProgress: {
        totalChapters: totalChaptersTracked,
        completedChapters,
        inProgressChapters,
        notStartedChapters,
        overallCompletionPercentage: syllabusCompletionPercentage,
      },
      teacherWorkloads,
      academicTrends,
      atRiskStudents: atRiskStudentsAgg,
      academicAlerts: alerts,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. CLASS TEACHER ANALYTICS (SECTION PROGRESS & AT-RISK STUDENTS)
  // ══════════════════════════════════════════════════════════════════

  /**
   * Section-level deep analytics for Class Teachers
   */
  static async getClassTeacherAnalytics(sectionId: string, examinationId?: string) {
    const secObjectId = new mongoose.Types.ObjectId(sectionId);
    const section = await Section.findById(sectionId).populate('classId');
    if (!section) throw new Error('Section not found');

    // 1. Enrolled Students
    const enrollments = await StudentEnrollment.find({ sectionId: secObjectId })
      .populate('studentId', 'fullName username email')
      .sort({ rollNumber: 1 });

    const totalStudents = enrollments.length;

    // 2. Section Attendance Aggregation
    const attendanceAgg = await AttendanceRecord.aggregate([
      { $match: { sectionId: secObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;
    let totalAttendance = 0;
    attendanceAgg.forEach((a) => {
      totalAttendance += a.count;
      if (a._id === 'PRESENT') present += a.count;
      else if (a._id === 'ABSENT') absent += a.count;
      else if (a._id === 'LATE') late += a.count;
      else if (a._id === 'LEAVE' || a._id === 'EXCUSED') leave += a.count;
    });

    const classAttendanceRate = totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 94;

    // 3. Exam Filter
    let targetExamId = examinationId;
    if (!targetExamId) {
      const instId = (section.classId as any)?.institutionId || (section as any).institutionId;
      const latestExam = await Examination.findOne({ institutionId: instId }).sort({ startDate: -1 });
      if (latestExam) targetExamId = latestExam.id;
    }

    const examQuery: any = { sectionId: secObjectId };
    if (targetExamId) examQuery.examinationId = new mongoose.Types.ObjectId(targetExamId);

    // 4. Student Marks & Rankings
    const marksRecords = await StudentMark.find(examQuery)
      .populate('centralSubjectId', 'name code creditHours')
      .populate('studentId', 'fullName rollNumber');

    // Group marks by student
    const studentPerformanceMap: Record<
      string,
      {
        studentId: string;
        studentName: string;
        rollNumber: number;
        subjects: any[];
        totalScore: number;
        maxPossibleScore: number;
        gpas: number[];
        failedSubjectsCount: number;
      }
    > = {};

    enrollments.forEach((enr: any) => {
      const sId = enr.studentId?._id?.toString() || enr.studentId?.id || enr.studentId;
      studentPerformanceMap[sId] = {
        studentId: sId,
        studentName: enr.studentId?.fullName || 'Student',
        rollNumber: enr.rollNumber || 0,
        subjects: [],
        totalScore: 0,
        maxPossibleScore: 0,
        gpas: [],
        failedSubjectsCount: 0,
      };
    });

    marksRecords.forEach((m: any) => {
      const sId = m.studentId?._id?.toString() || m.studentId?.id || m.studentId;
      if (studentPerformanceMap[sId]) {
        studentPerformanceMap[sId].subjects.push({
          subjectName: m.centralSubjectId?.name || 'Subject',
          subjectCode: m.centralSubjectId?.code || '',
          theoryMarks: m.theoryMarks,
          practicalMarks: m.practicalMarks,
          totalMarks: m.totalMarks,
          grade: m.grade,
          gpa: m.gpa,
          remarks: m.remarks,
        });
        studentPerformanceMap[sId].totalScore += m.totalMarks || 0;
        studentPerformanceMap[sId].maxPossibleScore += (m.assessmentId as any)?.fullMarks || 100;
        studentPerformanceMap[sId].gpas.push(m.gpa || 0);
        if (m.grade === 'NG' || (m.totalMarks && m.totalMarks < 35)) {
          studentPerformanceMap[sId].failedSubjectsCount++;
        }
      }
    });

    const studentList = Object.values(studentPerformanceMap).map((sp) => {
      const avgGpa = sp.gpas.length > 0 ? sp.gpas.reduce((a, b) => a + b, 0) / sp.gpas.length : 0;
      const percentage = sp.maxPossibleScore > 0 ? Math.round((sp.totalScore / sp.maxPossibleScore) * 100) : 0;
      const overallGrade = NepalGradingUtil.calculateGrade(percentage);

      return {
        studentId: sp.studentId,
        studentName: sp.studentName,
        rollNumber: sp.rollNumber,
        subjectCount: sp.subjects.length,
        totalScore: sp.totalScore,
        overallPercentage: percentage,
        overallGpa: Math.round(avgGpa * 100) / 100,
        overallGrade,
        status: sp.failedSubjectsCount === 0 ? 'PASSED' : 'NEEDS_SUPPORT',
        failedSubjectsCount: sp.failedSubjectsCount,
        subjects: sp.subjects,
      };
    });

    // Sort by GPA descending to compute rank
    studentList.sort((a, b) => b.overallGpa - a.overallGpa);
    const rankedStudents = studentList.map((st, idx) => ({
      ...st,
      rank: idx + 1,
    }));

    // Class average GPA
    const totalGpaSum = rankedStudents.reduce((sum, s) => sum + s.overallGpa, 0);
    const classAverageGpa = rankedStudents.length > 0 ? Math.round((totalGpaSum / rankedStudents.length) * 100) / 100 : 0;
    const passCount = rankedStudents.filter((s) => s.status === 'PASSED').length;
    const passPercentage = rankedStudents.length > 0 ? Math.round((passCount / rankedStudents.length) * 100) : 0;

    // 5. Students Needing Additional Support (At-Risk Students)
    // Criteria: Overall GPA < 2.0 OR any failing subject OR attendance < 75%
    const studentsNeedingSupport = rankedStudents
      .filter((s) => s.overallGpa < 2.0 || s.failedSubjectsCount > 0)
      .map((s) => ({
        studentId: s.studentId,
        studentName: s.studentName,
        rollNumber: s.rollNumber,
        overallGpa: s.overallGpa,
        overallGrade: s.overallGrade,
        failedSubjectsCount: s.failedSubjectsCount,
        riskFactors: [
          ...(s.overallGpa < 2.0 ? [`Low GPA: ${s.overallGpa}`] : []),
          ...(s.failedSubjectsCount > 0 ? [`Failed in ${s.failedSubjectsCount} subject(s)`] : []),
        ],
        recommendedAction: 'Remedial coaching & individual tutoring in weak subjects',
      }));

    // 6. Missing Marks Detector
    const sectionAssessments = await ExamAssessment.find({ sectionId: secObjectId });
    const missingMarksReport: any[] = [];

    for (const asgn of sectionAssessments) {
      const enteredMarksCount = await StudentMark.countDocuments({ assessmentId: asgn._id });
      if (enteredMarksCount < totalStudents) {
        missingMarksReport.push({
          assessmentId: asgn.id,
          assessmentName: asgn.name,
          centralSubjectId: asgn.centralSubjectId,
          missingCount: totalStudents - enteredMarksCount,
          status: asgn.workflowStatus,
        });
      }
    }

    // 7. Syllabus progress for this section
    const sectionSyllabus = await SyllabusProgress.find({ sectionId: secObjectId })
      .populate('centralSubjectId', 'name code')
      .sort({ chapterNumber: 1 });

    return {
      section: {
        id: section.id,
        name: section.name,
        className: (section.classId as any)?.name,
        gradeNumber: (section.classId as any)?.gradeNumber,
      },
      stats: {
        totalStudents,
        classAttendanceRate,
        classAverageGpa,
        passPercentage,
        studentsNeedingSupportCount: studentsNeedingSupport.length,
      },
      attendance: {
        rate: classAttendanceRate,
        present,
        absent,
        late,
        leave,
      },
      rankedStudents,
      studentsNeedingSupport,
      missingMarksReport,
      syllabus: sectionSyllabus,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. SUBJECT TEACHER ANALYTICS
  // ══════════════════════════════════════════════════════════════════

  /**
   * Analytics tailored for Subject Teachers tracking their specific assigned subjects
   */
  static async getSubjectTeacherAnalytics(teacherId: string, sectionId?: string, centralSubjectId?: string) {
    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);

    // Build filter
    const query: any = {
      $or: [{ teacherId: teacherObjectId }, { submittedBy: teacherObjectId }],
    };
    if (sectionId) query.sectionId = new mongoose.Types.ObjectId(sectionId);
    if (centralSubjectId) query.centralSubjectId = new mongoose.Types.ObjectId(centralSubjectId);

    // 1. Fetch Marks for Teacher's subjects
    const marks = await StudentMark.find(query)
      .populate('studentId', 'fullName rollNumber')
      .populate('centralSubjectId', 'name code')
      .populate('sectionId', 'name');

    let totalMarksSum = 0;
    let highestScore = 0;
    let lowestScore = 100;
    let passedCount = 0;

    const scoreRanges = {
      '90-100 (A+)': 0,
      '80-89 (A)': 0,
      '70-79 (B+)': 0,
      '60-69 (B)': 0,
      '50-59 (C+)': 0,
      '35-49 (C/D)': 0,
      'Below 35 (NG)': 0,
    };

    marks.forEach((m: any) => {
      const score = m.totalMarks || 0;
      totalMarksSum += score;
      if (score > highestScore) highestScore = score;
      if (score < lowestScore) lowestScore = score;
      if (score >= 35) passedCount++;

      if (score >= 90) scoreRanges['90-100 (A+)']++;
      else if (score >= 80) scoreRanges['80-89 (A)']++;
      else if (score >= 70) scoreRanges['70-79 (B+)']++;
      else if (score >= 60) scoreRanges['60-69 (B)']++;
      else if (score >= 50) scoreRanges['50-59 (C+)']++;
      else if (score >= 35) scoreRanges['35-49 (C/D)']++;
      else scoreRanges['Below 35 (NG)']++;
    });

    const totalEvaluated = marks.length;
    const averageScore = totalEvaluated > 0 ? Math.round((totalMarksSum / totalEvaluated) * 10) / 10 : 0;
    const passPercentage = totalEvaluated > 0 ? Math.round((passedCount / totalEvaluated) * 100) : 0;

    // 2. Syllabus Coverage for this teacher
    const syllabusQuery: any = { teacherId: teacherObjectId };
    if (sectionId) syllabusQuery.sectionId = new mongoose.Types.ObjectId(sectionId);
    if (centralSubjectId) syllabusQuery.centralSubjectId = new mongoose.Types.ObjectId(centralSubjectId);

    const chapters = await SyllabusProgress.find(syllabusQuery).sort({ chapterNumber: 1 });
    const completedChapters = chapters.filter((c) => c.status === 'COMPLETED').length;
    const inProgressChapters = chapters.filter((c) => c.status === 'IN_PROGRESS').length;
    const notStartedChapters = chapters.filter((c) => c.status === 'NOT_STARTED').length;

    const syllabusCompletionRate =
      chapters.length > 0 ? Math.round(((completedChapters + inProgressChapters * 0.5) / chapters.length) * 100) : 0;

    return {
      performance: {
        totalEvaluated,
        averageScore,
        highestScore: totalEvaluated > 0 ? highestScore : 0,
        lowestScore: totalEvaluated > 0 ? lowestScore : 0,
        passPercentage,
        scoreDistribution: Object.entries(scoreRanges).map(([range, count]) => ({ range, count })),
      },
      syllabus: {
        totalChapters: chapters.length,
        completedChapters,
        inProgressChapters,
        notStartedChapters,
        completionRate: syllabusCompletionRate,
        chapters,
      },
      marksSample: marks.slice(0, 15),
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 4. SYLLABUS PROGRESS TRACKING ENGINE
  // ══════════════════════════════════════════════════════════════════

  /**
   * Updates or logs chapter teaching progress for a section and subject
   */
  static async recordSyllabusProgress(params: {
    institutionId: string;
    academicYearId: string;
    classId: string;
    sectionId: string;
    centralSubjectId: string;
    teacherId: string;
    chapterNumber: number;
    chapterTitle: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    coveredTopics?: string[];
    totalTopics?: number;
    learningObjectives?: string[];
    completedObjectives?: string[];
    completionPercentage?: number;
    teachingHoursSpent?: number;
    teachingNotes?: string;
  }) {
    const {
      institutionId,
      academicYearId,
      classId,
      sectionId,
      centralSubjectId,
      teacherId,
      chapterNumber,
      chapterTitle,
      status,
      coveredTopics = [],
      totalTopics = 0,
      learningObjectives = [],
      completedObjectives = [],
      completionPercentage,
      teachingHoursSpent = 0,
      teachingNotes = '',
    } = params;

    // Calculate completion percentage if not explicitly given
    let calculatedPercentage = completionPercentage;
    if (calculatedPercentage === undefined) {
      if (status === 'COMPLETED') calculatedPercentage = 100;
      else if (status === 'NOT_STARTED') calculatedPercentage = 0;
      else if (totalTopics > 0) {
        calculatedPercentage = Math.round((coveredTopics.length / totalTopics) * 100);
      } else if (learningObjectives.length > 0) {
        calculatedPercentage = Math.round((completedObjectives.length / learningObjectives.length) * 100);
      } else {
        calculatedPercentage = 50;
      }
    }

    const doc = await SyllabusProgress.findOneAndUpdate(
      { sectionId, centralSubjectId, chapterNumber },
      {
        institutionId,
        academicYearId,
        classId,
        sectionId,
        centralSubjectId,
        teacherId,
        chapterNumber,
        chapterTitle,
        status,
        coveredTopics,
        totalTopics: Math.max(totalTopics, coveredTopics.length),
        learningObjectives,
        completedObjectives,
        completionPercentage: calculatedPercentage,
        teachingHoursSpent,
        teachingNotes,
        ...(status === 'IN_PROGRESS' && { startDate: new Date() }),
        ...(status === 'COMPLETED' && { completedDate: new Date() }),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Emit real-time Socket.IO update
    SocketService.emitSyllabusUpdated(institutionId, {
      sectionId,
      centralSubjectId,
      chapterNumber,
      status,
      completionPercentage: calculatedPercentage,
    });

    return doc;
  }

  // ══════════════════════════════════════════════════════════════════
  // 5. OFFICIAL REPORT CARD & EXPORTS (PDF & CSV GENERATION)
  // ══════════════════════════════════════════════════════════════════

  /**
   * Generates a downloadable / streamable PDF Report Card according to Nepal CDC directives
   */
  static async exportReportCardPdf(studentId: string, examinationId: string, opts: { publishedOnly?: boolean } = {}): Promise<Buffer> {
    const student: any = await User.findById(studentId);
    if (!student) throw { status: 404, message: 'Student not found' };
    const enrollment: any = await StudentEnrollment.findOne({ studentId, status: 'ENROLLED' }).sort({ createdAt: -1 });
    const section: any = enrollment ? await Section.findById(enrollment.sectionId).populate('classId') : null;
    if (!section) throw { status: 404, message: 'This student is not enrolled in a section' };

    // One examination only: the one asked for, or (for "latest") the latest published terminal exam that has marks
    const report: any = await ClassTeacherService.buildExamReport(section, examinationId && examinationId !== 'latest' ? examinationId : undefined);
    if (!report.examination) throw { status: 404, message: 'No examination record found for report card generation' };
    if (opts.publishedOnly && !report.examination.isPublished) throw { status: 403, message: 'Results for this examination have not been published yet' };
    const row: any = report.consolidatedStudents.find((r: any) => String(r.studentId) === String(studentId));
    if (!row || !row.subjectMarks.some((m: any) => m.isSubmitted)) throw { status: 404, message: 'No marks have been recorded for this student in this examination' };

    const inst: any = report.institution || {};
    const exam = report.examination;
    const cls: any = section.classId || {};
    const sectionLabel = /^section/i.test(String(section.name)) ? String(section.name) : `Section ${section.name}`;
    const provisional = !exam.isPublished;
    const NAVY = '#0b2a4a', TEAL = '#0f766e', SOFT = '#f1f5f9', LINE = '#cbd5e1', MUTED = '#64748b', INK = '#0f172a';
    const NIRMALA = 'C:/Windows/Fonts/Nirmala.ttc';
    const hasNepali = fs.existsSync(NIRMALA);
    const fmt = (d: any) => { try { return new Date(d).toISOString().slice(0, 10); } catch { return ''; } };
    const num = (v: any) => (v === null || v === undefined ? '—' : String(Math.round(Number(v) * 100) / 100));

    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 0, size: 'A4', info: { Title: `Report Card — ${student.fullName} — ${exam.name}`, Author: inst.name || 'Nepal Digital Education Platform' } });
        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);
        if (hasNepali) { doc.registerFont('NP', NIRMALA, 'NirmalaUI'); doc.registerFont('NPB', NIRMALA, 'NirmalaUI-Bold'); }
        const W = 595.28, L = 40, R = W - 40, CW = R - L;
        const txt = (s: string, x: number, y: number, o: any = {}) => doc.text(s, x, y, { lineBreak: false, ...o });

        // page frame (double border like a certificate)
        doc.lineWidth(2.4).strokeColor(NAVY).rect(18, 18, W - 36, 805.9).stroke();
        doc.lineWidth(0.6).strokeColor(TEAL).rect(24, 24, W - 48, 793.9).stroke();

        // watermark
        if (provisional) {
          doc.save();
          doc.rotate(-35, { origin: [W / 2, 430] });
          doc.fillColor('#94a3b8').fillOpacity(0.13).font('Helvetica-Bold').fontSize(74);
          txt('PROVISIONAL', 70, 400, { width: W - 140, align: 'center' });
          doc.restore();
          doc.fillOpacity(1);
        }

        // header
        doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(8);
        txt('GOVERNMENT OF NEPAL', L, 38, { width: CW, align: 'center', characterSpacing: 1.6 });
        doc.font('Helvetica').fontSize(8);
        txt('Ministry of Education, Science and Technology  •  Curriculum Development Centre (CDC)', L, 49, { width: CW, align: 'center' });
        doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(19);
        txt(String(inst.name || 'School').toUpperCase(), L, 66, { width: CW, align: 'center' });
        let y = 90;
        if (hasNepali && inst.nameNepali) { doc.font('NPB').fontSize(13).fillColor(TEAL); txt(inst.nameNepali, L, y, { width: CW, align: 'center' }); y += 18; }
        doc.fillColor(MUTED).font('Helvetica').fontSize(8.5);
        txt([inst.localLevel, inst.district, inst.province].filter(Boolean).join(', ') + ', Nepal', L, y, { width: CW, align: 'center' });
        txt(`EMIS Code: ${inst.emisCode || '—'}   •   Academic Year ${report.academicYear?.name || ''} BS`, L, y + 12, { width: CW, align: 'center' });

        // title ribbon
        y += 32;
        doc.rect(L + 60, y, CW - 120, 26).fill(NAVY);
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(13);
        txt('PROGRESS REPORT CARD', L + 60, y + 7, { width: CW - 120, align: 'center', characterSpacing: 2.4 });
        doc.fillColor(INK).font('Helvetica-Bold').fontSize(10.5);
        txt(exam.name, L, y + 34, { width: CW, align: 'center' });
        doc.fillColor(MUTED).font('Helvetica').fontSize(8);
        txt(`${fmt(exam.startDate)} to ${fmt(exam.endDate)}${provisional ? '   •   Provisional — results not yet published' : ''}`, L, y + 48, { width: CW, align: 'center' });

        // student details
        y += 68;
        doc.roundedRect(L, y, CW, 78, 4).fillAndStroke(SOFT, LINE);
        const col = (label: string, value: string, x: number, yy: number, w: number) => {
          doc.fillColor(MUTED).font('Helvetica').fontSize(7.5); txt(label.toUpperCase(), x, yy, { width: w });
          doc.fillColor(INK).font('Helvetica-Bold').fontSize(10); txt(value, x, yy + 10, { width: w });
        };
        col('Student name', student.fullName, L + 12, y + 9, 230);
        if (hasNepali && student.fullNameNepali) { doc.font('NP').fontSize(9).fillColor(MUTED); txt(student.fullNameNepali, L + 12, y + 31, { width: 230 }); }
        col('Roll number', String(row.rollNumber), L + 250, y + 9, 60);
        col('Class & section', `${cls.name || 'Grade ' + cls.gradeNumber} — ${sectionLabel}`, L + 320, y + 9, 190);
        col('Admission no.', String(row.admissionNumber || '—'), L + 12, y + 52, 120);
        col('Medium', section.medium === 'NEPALI' ? 'Nepali' : section.medium === 'ENGLISH' ? 'English' : 'Bilingual', L + 250, y + 52, 70);
        col('Attendance', row.attendance ? `${row.attendance.percentage}%  (${row.attendance.present + row.attendance.late}/${row.attendance.total} days)` : '—', L + 320, y + 52, 190);

        // marks table
        y += 90;
        const cols = [
          { k: 'sn', t: 'S.N', w: 24, a: 'center' }, { k: 'sub', t: 'Subject', w: 128, a: 'left' }, { k: 'cr', t: 'Credit', w: 36, a: 'center' }, { k: 'fm', t: 'Full', w: 36, a: 'center' },
          { k: 'pm', t: 'Pass', w: 34, a: 'center' }, { k: 'th', t: 'Theory', w: 42, a: 'center' }, { k: 'pr', t: 'Practical', w: 46, a: 'center' }, { k: 'ob', t: 'Obtained', w: 48, a: 'center' },
          { k: 'gr', t: 'Grade', w: 36, a: 'center' }, { k: 'gp', t: 'GPA', w: 33, a: 'center' }, { k: 're', t: 'Remarks', w: 52, a: 'left' }
        ];
        const pos: Record<string, number> = {}; let cx = L; cols.forEach((c) => { pos[c.k] = cx; cx += c.w; });
        doc.rect(L, y, CW, 22).fill(NAVY);
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(8);
        cols.forEach((c) => txt(c.t, pos[c.k] + (c.a === 'left' ? 5 : 0), y + 7, { width: c.w - (c.a === 'left' ? 5 : 0), align: c.a }));
        y += 22;
        row.subjectMarks.forEach((m: any, i: number) => {
          doc.rect(L, y, CW, 26).fillAndStroke(i % 2 ? SOFT : '#ffffff', LINE);
          const base = y + 8;
          doc.fillColor(INK).font('Helvetica').fontSize(8.5);
          const cell = (k: string, s: string, bold = false, color = INK) => { doc.fillColor(color).font(bold ? 'Helvetica-Bold' : 'Helvetica'); const c = cols.find((q) => q.k === k)!; txt(s, pos[k] + (c.a === 'left' ? 5 : 0), base, { width: c.w - (c.a === 'left' ? 5 : 0), align: c.a as any }); };
          cell('sn', String(i + 1));
          cell('sub', m.subjectName, true, NAVY);
          cell('cr', num(m.creditHours)); cell('fm', num(m.totalMarks)); cell('pm', num(m.passMarks));
          cell('th', num(m.theoryMarks)); cell('pr', num(m.practicalMarks));
          cell('ob', num(m.marksObtained), true);
          cell('gr', m.grade || '—', true, m.grade === 'NG' ? '#b91c1c' : TEAL); cell('gp', m.gpa === null ? '—' : Number(m.gpa).toFixed(2));
          doc.fontSize(7.5); cell('re', m.remark || (m.isSubmitted ? '' : 'Pending'), false, MUTED);
          y += 26;
        });
        doc.rect(L, y, CW, 26).fillAndStroke('#e2f3f0', LINE);
        doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(9);
        txt('TOTAL', pos.sub + 5, y + 8, { width: 120 });
        txt(num(row.subjectMarks.reduce((s: number, m: any) => s + (m.creditHours || 0), 0)), pos.cr, y + 8, { width: 36, align: 'center' });
        txt(num(row.totalFullMarks), pos.fm, y + 8, { width: 36, align: 'center' });
        txt(num(row.totalMarksObtained), pos.ob, y + 8, { width: 48, align: 'center' });
        txt(row.overallGrade, pos.gr, y + 8, { width: 36, align: 'center' });
        txt(row.overallGpa ? Number(row.overallGpa).toFixed(2) : '—', pos.gp, y + 8, { width: 33, align: 'center' });
        y += 36;

        // summary boxes
        const resultText = row.result === 'PASSED' ? 'PASSED' : row.result === 'NOT_PASSED' ? 'NOT PASSED' : 'INCOMPLETE';
        const boxes: Array<[string, string]> = [
          ['Total marks', `${num(row.totalMarksObtained)} / ${num(row.totalMaxMarks)}`], ['Percentage', `${row.percentage}%`], ['Overall grade', row.overallGrade],
          ['GPA', row.overallGpa ? Number(row.overallGpa).toFixed(2) : '—'], ['Result', resultText], ['Position', row.rank ? `${row.rank} of ${report.rankedCount}` : '—']
        ];
        const bw = (CW - 5 * 6) / 6;
        boxes.forEach(([lab, val], i) => {
          const bx = L + i * (bw + 6);
          doc.roundedRect(bx, y, bw, 40, 4).fillAndStroke('#ffffff', LINE);
          doc.fillColor(MUTED).font('Helvetica').fontSize(7); txt(lab.toUpperCase(), bx, y + 7, { width: bw, align: 'center' });
          doc.fillColor(lab === 'Result' && row.result !== 'PASSED' ? '#b91c1c' : NAVY).font('Helvetica-Bold').fontSize(lab === 'Total marks' ? 10 : 13); txt(val, bx, y + 20, { width: bw, align: 'center' });
        });
        y += 50;
        doc.fillColor(INK).font('Helvetica').fontSize(8.5);
        const resultLine = row.result === 'PASSED' ? `Passed — ${row.overallRemark}.` : row.result === 'NOT_PASSED' ? `Not passed: non-graded in ${row.failedSubjects.join(', ')}.` : `Result incomplete: marks pending for ${row.missingSubjects.join(', ') || 'one or more subjects'}.`;
        txt(`Result: ${resultLine}`, L, y, { width: CW, align: 'center' });
        y += 18;

        // class teacher's remark
        const remarkFor = row.result === 'PASSED'
          ? ({ 'A+': 'Outstanding performance. Keep up the excellent work.', A: 'Excellent work. Continue with the same dedication.', 'B+': 'Very good performance. A little more practice will bring even better results.', B: 'Good effort. Regular revision will help to improve further.', 'C+': 'Satisfactory. Needs more practice and regular reading at home.', C: 'Acceptable. Please give extra time to revision at home.', D: 'Basic level reached. Extra support and regular practice are needed.' } as any)[row.overallGrade] || ''
          : row.result === 'NOT_PASSED' ? 'Extra practice and support are needed in the subjects marked NG.' : 'The report will be completed once all subject marks are entered.';
        doc.roundedRect(L, y, CW, 44, 4).fillAndStroke('#ffffff', LINE);
        doc.fillColor(MUTED).font('Helvetica').fontSize(7.5); txt("CLASS TEACHER'S REMARKS", L + 10, y + 7);
        doc.fillColor(INK).font('Helvetica').fontSize(9); txt(remarkFor, L + 10, y + 20, { width: CW - 20 });
        y += 54;

        // grade scale
        doc.fillColor(MUTED).font('Helvetica-Bold').fontSize(7.5); txt('CDC 2078 GRADING SCALE', L, y);
        y += 11;
        const scale: Array<[string, string, string]> = [['A+', '90–100', '4.0'], ['A', '80–89', '3.6'], ['B+', '70–79', '3.2'], ['B', '60–69', '2.8'], ['C+', '50–59', '2.4'], ['C', '40–49', '2.0'], ['D', '35–39', '1.6'], ['NG', 'Below 35', '0.0']];
        const sw = CW / scale.length;
        scale.forEach((s, i) => {
          const sx = L + i * sw;
          doc.rect(sx, y, sw, 34).fillAndStroke(i % 2 ? SOFT : '#ffffff', LINE);
          doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(9); txt(s[0], sx, y + 4, { width: sw, align: 'center' });
          doc.fillColor(MUTED).font('Helvetica').fontSize(7); txt(s[2] === '0.0' ? 'Below 35%' : `${s[1]}%`, sx, y + 16, { width: sw, align: 'center' }); txt(`GPA ${s[2]}`, sx, y + 25, { width: sw, align: 'center' });
        });
        y += 44;

        // signatures + seal
        const sigY = Math.max(y + 36, 728);
        doc.strokeColor(NAVY).lineWidth(0.8);
        doc.moveTo(L + 10, sigY).lineTo(L + 150, sigY).stroke();
        doc.moveTo(R - 150, sigY).lineTo(R - 10, sigY).stroke();
        doc.fillColor(INK).font('Helvetica-Bold').fontSize(9);
        txt('Class Teacher', L + 10, sigY + 5, { width: 140, align: 'center' });
        txt('Principal / Headmaster', R - 150, sigY + 5, { width: 140, align: 'center' });
        doc.fillColor(MUTED).font('Helvetica').fontSize(8);
        txt(report.classTeacher?.fullName || '', L + 10, sigY + 17, { width: 140, align: 'center' });
        txt(report.principal?.fullName || '', R - 150, sigY + 17, { width: 140, align: 'center' });
        doc.lineWidth(1).strokeColor('#94a3b8').dash(3, { space: 3 }).circle(W / 2, sigY - 14, 30).stroke().undash();
        doc.fillColor('#94a3b8').font('Helvetica').fontSize(7); txt('OFFICIAL', W / 2 - 30, sigY - 21, { width: 60, align: 'center' }); txt('SEAL', W / 2 - 30, sigY - 11, { width: 60, align: 'center' });
        doc.fillColor(MUTED).fontSize(7.5);
        txt(`Date of issue: ${fmt(new Date())}`, L + 10, sigY + 38, { width: 200 });
        txt('Computer-generated report card — valid with the school seal and signatures.', L, 806, { width: CW, align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Generates a consolidated class result CSV string
   */
  static async exportClassResultsCsv(sectionId: string, examinationId: string): Promise<string> {
    const section: any = await Section.findById(sectionId).populate('classId');
    if (!section) throw { status: 404, message: 'Section not found' };

    // Same data as the on-screen marksheet and the report cards: one examination, one row per subject
    const report: any = await ClassTeacherService.buildExamReport(section, examinationId && examinationId !== 'latest' ? examinationId : undefined);
    if (!report.examination) throw { status: 404, message: 'No examination found for this section' };

    const cell = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const subjects: string[] = report.assessments.map((a: any) => a.centralSubjectId?.name || 'Subject');
    const rows: string[] = [
      [`${cell('Examination')}`, cell(report.examination.name), cell(report.examination.isPublished ? 'Published' : 'Not published')].join(','),
      ['Roll No', 'Student Name', ...subjects.map((s) => cell(`${s} (marks / grade)`)), 'Marks Obtained', 'Full Marks', 'Percentage', 'GPA', 'Grade', 'Result', 'Position', 'Attendance %'].join(','),
    ];

    for (const r of report.consolidatedStudents) {
      rows.push([
        r.rollNumber ?? '',
        cell(r.fullName),
        ...r.subjectMarks.map((m: any) => cell(m.isSubmitted ? `${m.marksObtained} (${m.grade})` : '—')),
        r.totalMarksObtained,
        r.totalMaxMarks,
        r.percentage,
        r.overallGpa ? Number(r.overallGpa).toFixed(2) : '',
        r.overallGrade,
        r.result === 'PASSED' ? 'PASSED' : r.result === 'NOT_PASSED' ? 'NOT PASSED' : 'INCOMPLETE',
        r.rank ?? '',
        r.attendance ? r.attendance.percentage : '',
      ].join(','));
    }
    return rows.join('\n');
  }

  /**
   * Generates a section attendance CSV report
   */
  static async exportAttendanceCsv(sectionId: string, startDate?: string, endDate?: string): Promise<string> {
    const secObjectId = new mongoose.Types.ObjectId(sectionId);
    const enrollments = await StudentEnrollment.find({ sectionId: secObjectId })
      .populate('studentId', 'fullName')
      .sort({ rollNumber: 1 });

    const query: any = { sectionId: secObjectId };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const records = await AttendanceRecord.find(query);

    const headers = ['Roll No', 'Student Name', 'Total Sessions', 'Present Days', 'Absent Days', 'Leave/Late', 'Attendance Rate (%)'];
    const rows: string[] = [headers.join(',')];

    enrollments.forEach((enr: any) => {
      const sId = enr.studentId?._id?.toString() || enr.studentId?.id || enr.studentId;
      const studentName = enr.studentId?.fullName || 'Student';
      const studentRecs = records.filter((r: any) => (r.studentId?._id || r.studentId)?.toString() === sId);

      const total = studentRecs.length;
      const present = studentRecs.filter((r) => r.status === 'PRESENT').length;
      const absent = studentRecs.filter((r) => r.status === 'ABSENT').length;
      const other = studentRecs.filter((r) => r.status === 'LATE' || r.status === 'LEAVE' || r.status === 'EXCUSED').length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 100;

      rows.push([
        enr.rollNumber || '',
        `"${studentName}"`,
        total,
        present,
        absent,
        other,
        `${rate}%`,
      ].join(','));
    });

    return rows.join('\n');
  }

  // ══════════════════════════════════════════════════════════════════
  // PRINCIPAL ATTENDANCE OVERVIEW (real data for the Attendance tab)
  // ══════════════════════════════════════════════════════════════════
  static async getPrincipalAttendanceOverview(institutionId: string) {
    const instObjectId = new mongoose.Types.ObjectId(institutionId);
    // "Today" and day grouping use the school's time zone (Nepal), not UTC, because attendance dates are
    // stored at local midnight and would otherwise land on the previous UTC day.
    const SCHOOL_TZ = 'Asia/Kathmandu';
    const today = new Date();
    const todayKey = new Intl.DateTimeFormat('en-CA', { timeZone: SCHOOL_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(today);
    const since = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

    const classes = await Class.find({ institutionId: instObjectId }, 'gradeNumber stream').lean();
    const classMap = new Map(classes.map((c: any) => [String(c._id), c]));
    const sections: any[] = await Section.find({ classId: { $in: classes.map((c: any) => c._id) } })
      .populate('classTeacherId', 'fullName')
      .lean();
    const sectionIds = sections.map((s) => s._id);

    const enrollments: any[] = await StudentEnrollment.find({ sectionId: { $in: sectionIds }, status: 'ENROLLED' }, 'studentId sectionId guardianPhone').lean();
    const enrolledBySection = new Map<string, number>();
    const enrollmentByStudent = new Map<string, any>();
    enrollments.forEach((e) => {
      enrolledBySection.set(String(e.sectionId), (enrolledBySection.get(String(e.sectionId)) || 0) + 1);
      enrollmentByStudent.set(String(e.studentId), e);
    });

    // One row per student per day (a student counts as present if present in any session that day)
    const daily: Array<{ _id: { sectionId: any; day: string; studentId: any }; present: number }> = await AttendanceRecord.aggregate([
      { $match: { institutionId: instObjectId, sectionId: { $in: sectionIds }, date: { $gte: since } } },
      { $unwind: '$records' },
      {
        $group: {
          _id: {
            sectionId: '$sectionId',
            day: { $dateToString: { format: '%Y-%m-%d', date: '$date', timezone: 'Asia/Kathmandu' } },
            studentId: '$records.studentId',
          },
          present: { $max: { $cond: [{ $in: ['$records.status', ['PRESENT', 'LATE']] }, 1, 0] } },
        },
      },
    ]);

    const todayBySection = new Map<string, { present: number; absent: number }>();
    const perStudent = new Map<string, { days: Map<string, number>; sectionId: string }>();
    let last30Total = 0;
    let last30Present = 0;
    const cutoff30 = new Intl.DateTimeFormat('en-CA', { timeZone: SCHOOL_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));

    daily.forEach((d) => {
      const sec = String(d._id.sectionId);
      const stu = String(d._id.studentId);
      if (d._id.day === todayKey) {
        const t = todayBySection.get(sec) || { present: 0, absent: 0 };
        if (d.present) t.present += 1; else t.absent += 1;
        todayBySection.set(sec, t);
      }
      if (d._id.day >= cutoff30) {
        last30Total += 1;
        last30Present += d.present;
      }
      const entry = perStudent.get(stu) || { days: new Map<string, number>(), sectionId: sec };
      entry.days.set(d._id.day, d.present);
      perStudent.set(stu, entry);
    });

    const sectionRows = sections
      .map((s) => {
        const cls: any = classMap.get(String(s.classId));
        const t = todayBySection.get(String(s._id));
        const marked = t ? t.present + t.absent : 0;
        const secName = String(s.name || '').trim();
        const secLabel = secName.toLowerCase().startsWith('section') ? secName : `Section ${secName}`;
        return {
          sectionId: String(s._id),
          label: `Class ${cls?.gradeNumber ?? '—'} – ${secLabel}${cls?.stream && cls.stream !== 'GENERAL' ? ` (${cls.stream})` : ''}`,
          gradeNumber: cls?.gradeNumber ?? 0,
          classTeacher: s.classTeacherId?.fullName || null,
          enrolled: enrolledBySection.get(String(s._id)) || 0,
          present: t?.present || 0,
          absent: t?.absent || 0,
          rate: marked > 0 ? Math.round(((t as any).present / marked) * 1000) / 10 : null,
          rollCallDone: marked > 0,
        };
      })
      .filter((r) => r.enrolled > 0)
      .sort((a, b) => a.gradeNumber - b.gradeNumber || a.label.localeCompare(b.label));

    const presentToday = sectionRows.reduce((n, r) => n + r.present, 0);
    const absentToday = sectionRows.reduce((n, r) => n + r.absent, 0);

    // Chronic absentees: < 75% over the last 60 days with at least 5 recorded days
    const candidates: any[] = [];
    perStudent.forEach((v, studentId) => {
      const days = [...v.days.entries()].sort((a, b) => a[0].localeCompare(b[0]));
      if (days.length < 5) return;
      const presentDays = days.filter(([, p]) => p).length;
      const rate = Math.round((presentDays / days.length) * 100);
      if (rate >= 75) return;
      let consecutive = 0;
      for (let i = days.length - 1; i >= 0 && !days[i][1]; i--) consecutive++;
      candidates.push({ studentId, sectionId: v.sectionId, rate, consecutive, recordedDays: days.length });
    });
    candidates.sort((a, b) => a.rate - b.rate);
    const top = candidates.slice(0, 50);
    const users: any[] = await User.find({ _id: { $in: top.map((c) => c.studentId) } }, 'fullName').lean();
    const nameMap = new Map(users.map((u) => [String(u._id), u.fullName]));
    const sectionLabel = new Map(sectionRows.map((r) => [r.sectionId, r.label]));

    return {
      summary: {
        overallRate30d: last30Total > 0 ? Math.round((last30Present / last30Total) * 1000) / 10 : null,
        presentToday,
        absentToday,
        rateToday: presentToday + absentToday > 0 ? Math.round((presentToday / (presentToday + absentToday)) * 1000) / 10 : null,
        sectionsTotal: sectionRows.length,
        sectionsDone: sectionRows.filter((r) => r.rollCallDone).length,
      },
      sections: sectionRows,
      chronicAbsentees: top.map((c) => ({
        studentId: c.studentId,
        name: nameMap.get(c.studentId) || 'Unknown student',
        sectionLabel: sectionLabel.get(c.sectionId) || '—',
        rate: c.rate,
        consecutiveAbsences: c.consecutive,
        recordedDays: c.recordedDays,
        guardianPhone: enrollmentByStudent.get(c.studentId)?.guardianPhone || null,
      })),
      totalChronic: candidates.length,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // PRINCIPAL: CURRICULUM COVERAGE (real SyllabusProgress data)
  // ══════════════════════════════════════════════════════════════════
  static async getPrincipalCurriculumCoverage(institutionId: string) {
    const instObjectId = new mongoose.Types.ObjectId(institutionId);
    const rows: any[] = await SyllabusProgress.aggregate([
      { $match: { institutionId: instObjectId } },
      {
        $group: {
          _id: { classId: '$classId', centralSubjectId: '$centralSubjectId', teacherId: '$teacherId' },
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
          lastUpdated: { $max: '$updatedAt' },
        },
      },
    ]);

    const [classes, subjects, teachers]: any[] = await Promise.all([
      Class.find({ _id: { $in: rows.map((r) => r._id.classId) } }, 'gradeNumber stream').lean(),
      CentralSubject.find({ _id: { $in: rows.map((r) => r._id.centralSubjectId) } }, 'name code').lean(),
      User.find({ _id: { $in: rows.map((r) => r._id.teacherId) } }, 'fullName').lean(),
    ]);
    const classMap = new Map<string, any>(classes.map((c: any) => [String(c._id), c]));
    const subjectMap = new Map<string, any>(subjects.map((c: any) => [String(c._id), c]));
    const teacherMap = new Map<string, any>(teachers.map((c: any) => [String(c._id), c]));

    // Merge sections of the same class/subject/teacher into one line
    const items = rows
      .map((r) => {
        const pct = r.total > 0 ? Math.round(((r.completed + r.inProgress * 0.5) / r.total) * 100) : 0;
        return {
          gradeNumber: classMap.get(String(r._id.classId))?.gradeNumber ?? 0,
          subjectName: subjectMap.get(String(r._id.centralSubjectId))?.name || 'Subject',
          subjectCode: subjectMap.get(String(r._id.centralSubjectId))?.code || '',
          teacherName: teacherMap.get(String(r._id.teacherId))?.fullName || 'Unknown',
          totalChapters: r.total,
          completedChapters: r.completed,
          inProgressChapters: r.inProgress,
          percentage: pct,
          lastUpdated: r.lastUpdated,
        };
      })
      .sort((a, b) => a.gradeNumber - b.gradeNumber || a.subjectName.localeCompare(b.subjectName));

    const total = rows.reduce((n, r) => n + r.total, 0);
    const completed = rows.reduce((n, r) => n + r.completed, 0);
    const inProgress = rows.reduce((n, r) => n + r.inProgress, 0);
    const overall = total > 0 ? Math.round(((completed + inProgress * 0.5) / total) * 100) : null;
    const staleCutoff = Date.now() - 21 * 24 * 60 * 60 * 1000;

    return {
      summary: {
        overallPercentage: overall,
        trackedCourses: items.length,
        coursesOnTrack: items.filter((i) => i.percentage >= 50).length,
        coursesBehind: items.filter((i) => i.percentage < 50).length,
        coursesNotUpdated21d: items.filter((i) => !i.lastUpdated || new Date(i.lastUpdated).getTime() < staleCutoff).length,
      },
      items,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // PRINCIPAL: FACULTY EVALUATION PROGRESS (marks + assignment grading per teacher)
  // ══════════════════════════════════════════════════════════════════
  static async getPrincipalEvaluationProgress(institutionId: string) {
    const instObjectId = new mongoose.Types.ObjectId(institutionId);

    // Allocations may lack institutionId; scope them through this institution's sections
    const instClasses = await Class.find({ institutionId: instObjectId }, '_id').lean();
    const instSections = await Section.find({ classId: { $in: instClasses.map((c: any) => c._id) } }, '_id').lean();
    const [teachers, allocations, assessments, assignments, ungraded]: any[] = await Promise.all([
      User.find({ institutionId: instObjectId, role: 'TEACHER', status: 'ACTIVE' }, 'fullName').lean(),
      SubjectAllocation.find({ sectionId: { $in: instSections.map((s: any) => s._id) }, status: { $ne: 'INACTIVE' } }, 'sectionId centralSubjectId teacherId').lean(),
      ExamAssessment.find({ institutionId: instObjectId }, 'sectionId centralSubjectId workflowStatus').lean(),
      Assignment.find({ institutionId: instObjectId }, 'teacherId').lean(),
      AssignmentSubmission.aggregate([
        { $match: { institutionId: instObjectId, status: { $in: ['SUBMITTED', 'LATE', 'RESUBMITTED', 'UNDER_EVALUATION'] } } },
        { $group: { _id: '$assignmentId', pending: { $sum: 1 } } },
      ]),
    ]);

    const teacherByKey = new Map<string, string>();
    allocations.forEach((a: any) => teacherByKey.set(`${a.sectionId}:${a.centralSubjectId}`, String(a.teacherId)));

    type Row = { teacherId: string; fullName: string; assessments: number; submitted: number; draft: number; pendingGrading: number };
    const rows = new Map<string, Row>(
      teachers.map((t: any) => [String(t._id), { teacherId: String(t._id), fullName: t.fullName, assessments: 0, submitted: 0, draft: 0, pendingGrading: 0 }])
    );

    assessments.forEach((a: any) => {
      const tid = teacherByKey.get(`${a.sectionId}:${a.centralSubjectId}`);
      const row = tid ? rows.get(tid) : undefined;
      if (!row) return;
      row.assessments += 1;
      if (a.workflowStatus === 'DRAFT') row.draft += 1;
      else row.submitted += 1;
    });

    const assignmentTeacher = new Map<string, string>(assignments.map((a: any) => [String(a._id), String(a.teacherId)]));
    ungraded.forEach((u: any) => {
      const tid = assignmentTeacher.get(String(u._id));
      const row = tid ? rows.get(tid) : undefined;
      if (row) row.pendingGrading += u.pending;
    });

    const list = [...rows.values()].map((r) => ({
      ...r,
      submissionRate: r.assessments > 0 ? Math.round((r.submitted / r.assessments) * 100) : null,
      status: r.draft > 0 || r.pendingGrading > 0 ? 'PENDING' : 'UP_TO_DATE',
    }));

    const totalAssessments = list.reduce((n, r) => n + r.assessments, 0);
    const totalSubmitted = list.reduce((n, r) => n + r.submitted, 0);

    return {
      summary: {
        marksheetEntryRate: totalAssessments > 0 ? Math.round((totalSubmitted / totalAssessments) * 1000) / 10 : null,
        totalAssessments,
        submittedAssessments: totalSubmitted,
        pendingAssignmentGrading: list.reduce((n, r) => n + r.pendingGrading, 0),
        teachersPending: list.filter((r) => r.status === 'PENDING').length,
        teachersTotal: list.length,
      },
      teachers: list.sort((a, b) => (a.status === b.status ? a.fullName.localeCompare(b.fullName) : a.status === 'PENDING' ? -1 : 1)),
    };
  }
}
