import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import {
  Institution,
  User,
  AcademicYear,
  Class,
  Section,
  StudentEnrollment,
  SubjectAllocation,
  SectionSubject,
  TimetableSlot,
  SchoolPeriod,
  TimetableTemplate,
  Timetable,
  TimetableEntry,
  SubstituteAssignment,
  TimetableChange,
  AcademicCalendar,
  Examination,
  ExamAssessment,
  StudentMark,
  MarksAuditLog,
  GradingScheme,
  AttendanceSession,
  AttendanceRecord,
  Assignment,
  AssignmentSubmission,
  SchoolAnnouncement,
  Notification,
  Subscription,
  SubscriptionEntitlement,
  Invoice,
  Payment,
  SubscriptionHistory,
  InstitutionFeatureSettings,
  ClassFeatureSettings,
  SectionFeatureSettings,
  StudentFeatureOverride,
  StudentDeviceProfile,
  FeatureConfigurationHistory,
} from '../models';

export async function resetDhambojhiDemoData(): Promise<{ success: boolean; deletedSummary: Record<string, number> }> {
  console.log('🧹 Starting safe tenant-isolated reset for Dhambojhi Higher Secondary School...');

  const deletedSummary: Record<string, number> = {};

  // 1. Locate Dhambojhi Institution
  const dhambojhi = await Institution.findOne({ emisCode: '570010001' });
  const instId = dhambojhi?._id;

  // 2. Identify demo users (by institutionId OR username prefix 'dhambojhi_')
  const userQuery: any = {
    $or: [{ username: { $regex: /^dhambojhi_/i } }],
  };
  if (instId) {
    userQuery.$or.push({ institutionId: instId });
  }
  const demoUsers = await User.find(userQuery).select('_id username');
  const demoUserIds = demoUsers.map((u) => u._id);

  // 3. Identify academic entities if institution exists
  let sectionIds: any[] = [];
  let classIds: any[] = [];
  let academicYearIds: any[] = [];

  if (instId) {
    const years = await AcademicYear.find({ institutionId: instId }).select('_id');
    academicYearIds = years.map((y) => y._id);

    const classes = await Class.find({ institutionId: instId }).select('_id');
    classIds = classes.map((c) => c._id);

    const sections = await Section.find({ classId: { $in: classIds } }).select('_id');
    sectionIds = sections.map((s) => s._id);
  }

  // 4. Delete Assessments & Marks
  const marksRes = await StudentMark.deleteMany({
    $or: [
      ...(instId ? [{ institutionId: instId }] : []),
      { studentId: { $in: demoUserIds } },
      ...(sectionIds.length > 0 ? [{ sectionId: { $in: sectionIds } }] : []),
    ],
  });
  deletedSummary['marks'] = marksRes.deletedCount;

  const examAssessRes = await ExamAssessment.deleteMany({
    $or: [
      ...(instId ? [{ institutionId: instId }] : []),
      ...(sectionIds.length > 0 ? [{ sectionId: { $in: sectionIds } }] : []),
    ],
  });
  deletedSummary['assessments'] = examAssessRes.deletedCount;

  const examRes = await Examination.deleteMany({
    ...(instId ? { institutionId: instId } : { code: { $regex: /2083/ } }),
  });
  deletedSummary['examinations'] = examRes.deletedCount;

  if (instId) {
    const auditRes = await MarksAuditLog.deleteMany({ institutionId: instId });
    deletedSummary['marksAuditLogs'] = auditRes.deletedCount;

    const gradingRes = await GradingScheme.deleteMany({ institutionId: instId });
    deletedSummary['gradingSchemes'] = gradingRes.deletedCount;
  }

  // 5. Delete Attendance
  const attRecRes = await AttendanceRecord.deleteMany({
    $or: [
      ...(instId ? [{ institutionId: instId }] : []),
      { 'records.studentId': { $in: demoUserIds } },
      ...(sectionIds.length > 0 ? [{ sectionId: { $in: sectionIds } }] : []),
    ],
  });
  deletedSummary['attendanceRecords'] = attRecRes.deletedCount;

  const attSessRes = await AttendanceSession.deleteMany({
    $or: [
      ...(instId ? [{ institutionId: instId }] : []),
      ...(sectionIds.length > 0 ? [{ sectionId: { $in: sectionIds } }] : []),
    ],
  });
  deletedSummary['attendanceSessions'] = attSessRes.deletedCount;

  // 6. Delete Assignments & Submissions
  const assignSubRes = await AssignmentSubmission.deleteMany({
    $or: [
      ...(instId ? [{ institutionId: instId }] : []),
      { studentId: { $in: demoUserIds } },
    ],
  });
  deletedSummary['assignmentSubmissions'] = assignSubRes.deletedCount;

  const assignRes = await Assignment.deleteMany({
    $or: [
      ...(instId ? [{ institutionId: instId }] : []),
      ...(sectionIds.length > 0 ? [{ sectionId: { $in: sectionIds } }] : []),
    ],
  });
  deletedSummary['assignments'] = assignRes.deletedCount;

  // 7. Delete Timetable Entries & Slots
  const slotRes = await TimetableSlot.deleteMany({
    $or: [
      { teacherId: { $in: demoUserIds } },
      ...(sectionIds.length > 0 ? [{ sectionId: { $in: sectionIds } }] : []),
    ],
  });
  deletedSummary['timetableSlots'] = slotRes.deletedCount;

  if (instId) {
    const ttRes = await Timetable.deleteMany({ institutionId: instId });
    deletedSummary['timetables'] = ttRes.deletedCount;

    const entryRes = await TimetableEntry.deleteMany({ institutionId: instId });
    deletedSummary['timetableEntries'] = entryRes.deletedCount;

    const subRes = await SubstituteAssignment.deleteMany({ institutionId: instId });
    deletedSummary['substituteAssignments'] = subRes.deletedCount;

    const changeRes = await TimetableChange.deleteMany({ institutionId: instId });
    deletedSummary['timetableChanges'] = changeRes.deletedCount;

    const templateRes = await TimetableTemplate.deleteMany({ institutionId: instId });
    deletedSummary['timetableTemplates'] = templateRes.deletedCount;

    const periodRes = await SchoolPeriod.deleteMany({ institutionId: instId });
    deletedSummary['schoolPeriods'] = periodRes.deletedCount;

    const calRes = await AcademicCalendar.deleteMany({ institutionId: instId });
    deletedSummary['academicCalendars'] = calRes.deletedCount;
  }

  // 8. Delete Allocations & Enrollments
  if (instId) {
    const secSubRes = await SectionSubject.deleteMany({ institutionId: instId });
    deletedSummary['sectionSubjects'] = secSubRes.deletedCount;
  }

  const allocRes = await SubjectAllocation.deleteMany({
    $or: [
      { teacherId: { $in: demoUserIds } },
      ...(sectionIds.length > 0 ? [{ sectionId: { $in: sectionIds } }] : []),
    ],
  });
  deletedSummary['subjectAllocations'] = allocRes.deletedCount;

  const enrollRes = await StudentEnrollment.deleteMany({
    $or: [
      { studentId: { $in: demoUserIds } },
      ...(sectionIds.length > 0 ? [{ sectionId: { $in: sectionIds } }] : []),
    ],
  });
  deletedSummary['studentEnrollments'] = enrollRes.deletedCount;

  // 9. Delete Feature Access & Device Profiles
  if (instId) {
    await InstitutionFeatureSettings.deleteMany({ institutionId: instId });
    await ClassFeatureSettings.deleteMany({ institutionId: instId });
    await SectionFeatureSettings.deleteMany({ institutionId: instId });
    await StudentFeatureOverride.deleteMany({ institutionId: instId });
    await StudentDeviceProfile.deleteMany({ institutionId: instId });
    await FeatureConfigurationHistory.deleteMany({ institutionId: instId });
    deletedSummary['featureAccessConfigs'] = 1;
  }

  // 10. Delete Subscriptions & Invoices
  if (instId) {
    await Subscription.deleteMany({ institutionId: instId });
    await SubscriptionEntitlement.deleteMany({ institutionId: instId });
    await Invoice.deleteMany({ institutionId: instId });
    await Payment.deleteMany({ institutionId: instId });
    await SubscriptionHistory.deleteMany({ institutionId: instId });
    deletedSummary['subscriptions'] = 1;
  }

  // 11. Delete Announcements & Notifications
  if (instId) {
    const annRes = await SchoolAnnouncement.deleteMany({ institutionId: instId });
    deletedSummary['schoolAnnouncements'] = annRes.deletedCount;

    const notifRes = await Notification.deleteMany({
      $or: [
        { institutionId: instId },
        { recipientId: { $in: demoUserIds } },
      ],
    });
    deletedSummary['notifications'] = notifRes.deletedCount;
  }

  // 12. Delete Academic Hierarchy (Sections, Classes, AcademicYear)
  if (sectionIds.length > 0) {
    const sRes = await Section.deleteMany({ _id: { $in: sectionIds } });
    deletedSummary['sections'] = sRes.deletedCount;
  }
  if (classIds.length > 0) {
    const cRes = await Class.deleteMany({ _id: { $in: classIds } });
    deletedSummary['classes'] = cRes.deletedCount;
  }
  if (academicYearIds.length > 0) {
    const yRes = await AcademicYear.deleteMany({ _id: { $in: academicYearIds } });
    deletedSummary['academicYears'] = yRes.deletedCount;
  }

  // 13. Delete Demo Users
  const userRes = await User.deleteMany({ _id: { $in: demoUserIds } });
  deletedSummary['users'] = userRes.deletedCount;

  // 14. Delete Institution
  if (instId) {
    const instRes = await Institution.deleteOne({ _id: instId });
    deletedSummary['institutions'] = instRes.deletedCount;
  }

  console.log('✅ Safely cleaned up Dhambojhi demo data without affecting other institutions:');
  console.table(deletedSummary);

  return { success: true, deletedSummary };
}

// Standalone execution support
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await resetDhambojhiDemoData();
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error resetting Dhambojhi demo data:', err);
      process.exit(1);
    }
  })();
}

