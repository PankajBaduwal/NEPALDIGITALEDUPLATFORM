import {
  TimetableEntry,
  SubstituteAssignment,
  TimetableChange,
  Timetable,
  Section,
  Class,
  User,
  AcademicYear,
  StudentEnrollment,
  CentralSubject,
  DayOfWeekType,
} from '../../models';
import { SocketService } from '../../common/services/socket.service';
import { TimetableBuilderService, ALL_DAYS } from './timetable-builder.service';

const SCHOOL_TIME_ZONE = 'Asia/Kathmandu';

/** Day of week and minutes since midnight in Nepal time, independent of the server's time zone. */
export function schoolClock(ref: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: SCHOOL_TIME_ZONE, weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(ref);
  const get = (t: string) => parts.find((p) => p.type === t)?.value || '';
  return { day: get('weekday').toUpperCase() as DayOfWeekType, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}
const toMin = (t?: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t || '');
  return m ? Number(m[1]) * 60 + Number(m[2]) : NaN;
};

type Actor = { userId: string; role: string };

/**
 * Read side of the timetable (published versions only) plus the legacy single-entry API,
 * which now edits the section's draft through TimetableBuilderService.
 */
export class TimetableService {
  static async currentYearId(institutionId: string) {
    const y: any = (await AcademicYear.findOne({ institutionId, isCurrent: true })) || (await AcademicYear.findOne({ institutionId }).sort({ createdAt: -1 }));
    return y ? String(y._id) : null;
  }

  /** Configured periods and breaks for the current academic year. Nothing is invented when unconfigured. */
  static async getPeriods(institutionId: string) {
    const yearId = await this.currentYearId(institutionId);
    if (!yearId) return { configured: false, periods: [], workingDays: [], message: 'No academic year configured' };
    return TimetableBuilderService.getConfig(institutionId, yearId);
  }

  static async configureTemplate(institutionId: string, body: any, actor: Actor) {
    const yearId = body.academicYearId || (await this.currentYearId(institutionId));
    if (!yearId) throw { status: 400, message: 'No academic year configured' };
    await TimetableBuilderService.assertRole(institutionId, actor, 'edit');
    return TimetableBuilderService.saveConfig(institutionId, String(yearId), body, actor);
  }

  /** Check one slot against the section's draft (or a fresh draft context). */
  static async detectConflicts(institutionId: string, body: any) {
    const { section } = await TimetableBuilderService.loadSection(institutionId, String(body.sectionId));
    const draft: any =
      (await Timetable.findOne({ sectionId: section._id, academicYearId: section.academicYearId, status: { $in: ['DRAFT', 'UNDER_REVIEW'] } })) ||
      new Timetable({ institutionId, academicYearId: section.academicYearId, classId: section.classId, sectionId: section._id, medium: section.medium, version: 0 });
    const ctx = await TimetableBuilderService.loadContext(draft);
    const subject = await CentralSubject.findById(body.centralSubjectId);
    if (subject) ctx.subjects.set(String(subject._id), subject);
    const teacher = await User.findById(body.teacherId, 'fullName role status institutionId');
    if (teacher) ctx.teachers.set(String(teacher._id), teacher);
    const existing = ctx.entries.find((e) => e.dayOfWeek === body.dayOfWeek && e.periodNumber === Number(body.periodNumber));
    const r = TimetableBuilderService.checkSlot(ctx, {
      dayOfWeek: String(body.dayOfWeek || '').toUpperCase(),
      periodNumber: Number(body.periodNumber),
      centralSubjectId: String(body.centralSubjectId),
      teacherId: String(body.teacherId),
      roomNumber: body.roomNumber,
      entryId: existing ? String(existing._id) : undefined,
    });
    return { hasConflict: !r.valid, conflicts: r.errors.map((e) => e.message), errors: r.errors, warnings: r.warnings };
  }

  /** Legacy single-slot assignment: writes into the section's draft, creating one if needed. */
  static async assignTimetableEntry(institutionId: string, body: any, actor: Actor) {
    const { section } = await TimetableBuilderService.loadSection(institutionId, String(body.sectionId));
    let draft: any = await Timetable.findOne({ sectionId: section._id, academicYearId: section.academicYearId, status: 'DRAFT' });
    if (!draft) draft = (await TimetableBuilderService.createDraft(institutionId, String(section._id), actor)).timetable;
    return TimetableBuilderService.setEntry(institutionId, String(draft.id || draft._id), body, actor);
  }

  static async removeTimetableEntry(institutionId: string, entryId: string, actor: Actor) {
    const entry: any = await TimetableEntry.findOne({ _id: entryId, institutionId });
    if (!entry) throw { status: 404, message: 'Timetable entry not found' };
    if (!entry.timetableId) throw { status: 409, message: 'This is a legacy entry. Edit the section timetable in the builder instead.' };
    return TimetableBuilderService.removeEntry(institutionId, String(entry.timetableId), entryId, actor);
  }

  // ── Substitutions ───────────────────────────────────────────────
  static async assignSubstitution(params: { institutionId: string; timetableEntryId: string; substituteTeacherId: string; date: string | Date; assignedBy: string; assignedByRole: string; reason?: string }) {
    const { institutionId, timetableEntryId, substituteTeacherId, date, assignedBy, assignedByRole, reason } = params;
    const entry: any = await TimetableEntry.findOne({ _id: timetableEntryId, institutionId });
    if (!entry) throw { status: 404, message: 'Timetable entry not found' };
    const tt: any = entry.timetableId && (await Timetable.findById(entry.timetableId));
    if (!tt || tt.status !== 'PUBLISHED') throw { status: 409, message: 'Substitutions can only be arranged for periods in a published timetable' };
    const sub: any = await User.findOne({ _id: substituteTeacherId, institutionId, role: 'TEACHER' });
    if (!sub || sub.status !== 'ACTIVE') throw { status: 400, message: 'The substitute must be an active teacher at this school' };
    const subDate = new Date(date);
    subDate.setUTCHours(0, 0, 0, 0);

    const published = await TimetableBuilderService.publishedTimetableIds({ institutionId });
    const clash = await TimetableEntry.findOne({ timetableId: { $in: published }, teacherId: substituteTeacherId, dayOfWeek: entry.dayOfWeek, periodNumber: entry.periodNumber });
    if (clash) throw { status: 409, message: `${sub.fullName} already teaches in period ${entry.periodNumber} on that day`, code: 'TEACHER_CLASH' };
    const already = await SubstituteAssignment.findOne({ substituteTeacherId, date: subDate, periodNumber: entry.periodNumber, status: 'CONFIRMED' });
    if (already) throw { status: 409, message: `${sub.fullName} is already substituting in period ${entry.periodNumber} that day`, code: 'TEACHER_CLASH' };

    const subDoc = await SubstituteAssignment.create({
      institutionId,
      originalTeacherId: entry.teacherId,
      substituteTeacherId,
      timetableEntryId: entry._id,
      sectionId: entry.sectionId,
      centralSubjectId: entry.centralSubjectId,
      date: subDate,
      periodNumber: entry.periodNumber,
      dayOfWeek: entry.dayOfWeek,
      status: 'CONFIRMED',
      reason,
      assignedBy,
    });
    await TimetableChange.create({
      institutionId,
      timetableId: entry.timetableId,
      timetableEntryId: entry._id,
      changeType: 'SUBSTITUTION',
      newValues: { originalTeacher: entry.teacherId, substituteTeacher: substituteTeacherId, date: subDate, period: entry.periodNumber },
      changedBy: assignedBy,
      userRole: assignedByRole,
      reason: `Substitute teacher assigned${reason ? `: ${reason}` : ''}`,
      affectedTeachers: [entry.teacherId, substituteTeacherId],
      affectedSections: [entry.sectionId],
    });
    SocketService.emitSubstitutionAssigned(institutionId, {
      substitutionId: subDoc.id,
      originalTeacherId: entry.teacherId,
      substituteTeacherId,
      sectionId: entry.sectionId,
      periodNumber: entry.periodNumber,
      date: subDate,
    });
    return subDoc;
  }

  // ── Teacher: My Teaching Schedule ───────────────────────────────
  static async getTeacherSchedule(teacherId: string, referenceDate: Date = new Date()) {
    const teacher: any = await User.findById(teacherId, 'fullName institutionId');
    if (!teacher?.institutionId) throw { status: 404, message: 'Teacher not found' };
    const institutionId = String(teacher.institutionId);
    const clock = schoolClock(referenceDate);
    const yearId = await this.currentYearId(institutionId);
    const config = yearId ? await TimetableBuilderService.getConfig(institutionId, yearId) : null;
    const entries: any[] = await TimetableBuilderService.publishedEntries({ institutionId, teacherId });

    const shape = (e: any) => ({
      id: String(e._id),
      dayOfWeek: e.dayOfWeek,
      periodNumber: e.periodNumber,
      startTime: e.startTime,
      endTime: e.endTime,
      classId: e.classId?._id ? String(e.classId._id) : String(e.classId || ''),
      className: e.classId?.name || (e.classId?.gradeNumber ? `Class ${e.classId.gradeNumber}` : ''),
      gradeNumber: e.classId?.gradeNumber,
      stream: e.classId?.stream,
      sectionId: e.sectionId?._id ? String(e.sectionId._id) : String(e.sectionId || ''),
      sectionName: e.sectionId?.name || '',
      medium: e.medium || e.sectionId?.medium,
      subjectId: e.centralSubjectId?._id ? String(e.centralSubjectId._id) : '',
      subjectName: e.centralSubjectId?.name,
      subjectNameNepali: e.centralSubjectId?.nameNepali,
      subjectCode: e.centralSubjectId?.code,
      roomNumber: e.roomNumber || 'Classroom',
      textbookId: e.textbookId?._id ? String(e.textbookId._id) : (e.textbookId ? String(e.textbookId) : null),
      textbook: e.textbookId && typeof e.textbookId === 'object' ? {
        id: String((e.textbookId as any)._id || (e.textbookId as any).id),
        title: (e.textbookId as any).title,
        titleNepali: (e.textbookId as any).titleNepali,
        gradeNumber: (e.textbookId as any).gradeNumber,
        medium: (e.textbookId as any).medium,
      } : null,
      isSubstitution: false,
    });
    const weekly = entries.map(shape);

    const today = new Date(referenceDate);
    today.setUTCHours(0, 0, 0, 0);
    const subs: any[] = await SubstituteAssignment.find({ substituteTeacherId: teacherId, date: today, status: 'CONFIRMED' })
      .populate({ path: 'timetableEntryId', populate: [{ path: 'classId', select: 'name gradeNumber stream' }, { path: 'sectionId', select: 'name medium' }, { path: 'centralSubjectId', select: 'name nameNepali code' }] })
      .populate('originalTeacherId', 'fullName');

    const todayClasses = weekly.filter((c) => c.dayOfWeek === clock.day);
    for (const s of subs) {
      if (!s.timetableEntryId) continue;
      todayClasses.push({ ...shape(s.timetableEntryId), id: String(s._id), isSubstitution: true, subjectName: `${s.timetableEntryId.centralSubjectId?.name} (covering for ${s.originalTeacherId?.fullName})` });
    }
    todayClasses.sort((a, b) => a.periodNumber - b.periodNumber);

    const isWorkingDay = !!config?.workingDays.includes(clock.day);
    const currentPeriod = todayClasses.find((c) => clock.minutes >= toMin(c.startTime) && clock.minutes < toMin(c.endTime)) || null;
    const nextPeriod = todayClasses.find((c) => toMin(c.startTime) > clock.minutes) || null;
    const currentBreak = (config?.periods || []).find((p: any) => p.isBreak && clock.minutes >= toMin(p.startTime) && clock.minutes < toMin(p.endTime)) || null;
    const busy = new Set(todayClasses.map((c) => c.periodNumber));
    const freePeriods = isWorkingDay ? (config?.teachingPeriods || []).filter((p: any) => !busy.has(p.periodNumber)).map((p: any) => p.periodNumber) : [];

    const classes = new Map<string, any>();
    weekly.forEach((c) => {
      const k = `${c.sectionId}|${c.subjectId}`;
      const cur = classes.get(k) || { classId: c.classId, className: c.className, gradeNumber: c.gradeNumber, sectionId: c.sectionId, sectionName: c.sectionName, medium: c.medium, subjectId: c.subjectId, subjectName: c.subjectName, textbookId: c.textbookId, periodsPerWeek: 0 };
      cur.periodsPerWeek++;
      classes.set(k, cur);
    });

    return {
      teacher: { id: teacherId, name: teacher.fullName },
      currentDay: clock.day,
      isWorkingDay,
      workingDays: config?.workingDays || [],
      periods: config?.periods || [],
      todayClasses,
      currentPeriod,
      currentBreak,
      nextPeriod,
      freePeriods,
      weeklyEntries: weekly,
      classes: [...classes.values()].sort((a, b) => (a.gradeNumber || 0) - (b.gradeNumber || 0) || a.sectionName.localeCompare(b.sectionName)),
      totalWeeklyPeriods: weekly.length,
      message: weekly.length ? null : 'No published timetable includes you yet.',
    };
  }

  // ── Student / class view ────────────────────────────────────────
  static async getSectionSchedule(sectionId: string, referenceDate: Date = new Date()) {
    const section: any = await Section.findById(sectionId);
    const cls: any = section && (await Class.findById(section.classId));
    if (!section || !cls) throw { status: 404, message: 'Section not found' };
    const institutionId = String(cls.institutionId);
    const clock = schoolClock(referenceDate);
    const config = await TimetableBuilderService.getConfig(institutionId, String(section.academicYearId));
    const tt: any = await Timetable.findOne({ sectionId, status: 'PUBLISHED' });
    const entries: any[] = tt ? await TimetableBuilderService.publishedEntries({ sectionId }) : [];
    const weekly = entries.map((e) => ({
      id: String(e._id),
      dayOfWeek: e.dayOfWeek,
      periodNumber: e.periodNumber,
      startTime: e.startTime,
      endTime: e.endTime,
      subjectId: e.centralSubjectId?._id ? String(e.centralSubjectId._id) : '',
      subjectName: e.centralSubjectId?.name,
      subjectNameNepali: e.centralSubjectId?.nameNepali,
      subjectCode: e.centralSubjectId?.code,
      teacherName: e.teacherId?.fullName,
      roomNumber: e.roomNumber || 'Classroom',
      textbookId: e.textbookId?._id ? String(e.textbookId._id) : (e.textbookId ? String(e.textbookId) : null),
      textbook: e.textbookId && typeof e.textbookId === 'object' ? {
        id: String((e.textbookId as any)._id || (e.textbookId as any).id),
        title: (e.textbookId as any).title,
        titleNepali: (e.textbookId as any).titleNepali,
        gradeNumber: (e.textbookId as any).gradeNumber,
        medium: (e.textbookId as any).medium,
      } : null,
    }));
    return {
      section: { id: String(section._id), name: section.name, medium: section.medium, gradeNumber: cls.gradeNumber, stream: cls.stream },
      timetable: tt ? { id: String(tt._id), version: tt.version, publishedAt: tt.publishedAt } : null,
      currentDay: clock.day,
      workingDays: config.workingDays,
      periods: config.periods,
      todayClasses: weekly.filter((e) => e.dayOfWeek === clock.day),
      weeklyEntries: weekly,
      message: tt ? null : 'No timetable has been published for this section yet.',
    };
  }

  /** A student may see only their own section; staff only sections of their school. */
  static async assertCanViewSection(user: { userId: string; role: string; institutionId?: string | null }, sectionId: string) {
    const section: any = await Section.findById(sectionId);
    const cls: any = section && (await Class.findById(section.classId));
    if (!section || !cls) throw { status: 404, message: 'Section not found' };
    if (user.role === 'SUPER_ADMIN') return;
    if (String(cls.institutionId) !== String(user.institutionId)) throw { status: 403, message: 'Section belongs to another institution', code: 'CROSS_TENANT_FORBIDDEN' };
    if (user.role === 'STUDENT') {
      const mine = await StudentEnrollment.exists({ studentId: user.userId, sectionId, status: 'ENROLLED' });
      if (!mine) throw { status: 403, message: 'You can only view your own class timetable' };
    }
  }

  // ── Principal overview ──────────────────────────────────────────
  static async getPrincipalOverview(institutionId: string) {
    const yearId = await this.currentYearId(institutionId);
    if (!yearId) throw { status: 400, message: 'No academic year configured' };
    const overview = await TimetableBuilderService.overview(institutionId, yearId);
    const entries: any[] = await TimetableBuilderService.publishedEntries({ institutionId });
    const teachers: any[] = await User.find({ institutionId, role: 'TEACHER' }, 'fullName status');
    const recentChanges = await TimetableBuilderService.history(institutionId, { limit: 20 });
    const slotsPerSection = overview.config.workingDays.length * overview.config.teachingPeriods.length;
    return {
      ...overview,
      totalSections: overview.sections.length,
      publishedSections: overview.sections.filter((s) => s.published).length,
      totalEntries: entries.length,
      teacherWorkloads: teachers.map((t) => {
        const mine = entries.filter((e) => String(e.teacherId?._id || e.teacherId) === String(t._id));
        return {
          teacher: { id: String(t._id), fullName: t.fullName, status: t.status },
          periodsPerWeek: mine.length,
          subjects: [...new Set(mine.map((e) => e.centralSubjectId?.name).filter(Boolean))],
        };
      }),
      sectionCoverage: overview.sections.map((s) => {
        const n = entries.filter((e) => String(e.sectionId?._id || e.sectionId) === s.sectionId).length;
        return { ...s, assignedSlots: n, unassignedSlots: Math.max(0, slotsPerSection - n), coverageRate: slotsPerSection ? Math.round((n / slotsPerSection) * 100) : 0 };
      }),
      recentChanges,
    };
  }

  // ── Smart Board suggestion: the current or next published period ─
  static async getSmartBoardSuggestion(teacherId: string, referenceDate: Date = new Date()) {
    const schedule = await this.getTeacherSchedule(teacherId, referenceDate);
    const candidate = schedule.currentPeriod || schedule.nextPeriod;
    if (!candidate) return { hasScheduledClass: false, message: 'No current or upcoming class in your published timetable today.' };
    return { hasScheduledClass: true, isCurrent: !!schedule.currentPeriod, ...candidate };
  }

  // ── School-wide timetable for today (published versions only) ───
  static async getTodaySchedule(institutionId: string, referenceDate: Date = new Date()) {
    const clock = schoolClock(referenceDate);
    const entries: any[] = await TimetableBuilderService.publishedEntries({ institutionId });
    return entries
      .filter((e) => e.dayOfWeek === clock.day)
      .map((e) => {
        const start = toMin(e.startTime);
        const end = toMin(e.endTime);
        const status = clock.minutes >= start && clock.minutes < end ? 'IN_PROGRESS' : clock.minutes >= end ? 'COMPLETED' : 'UPCOMING';
        return {
          id: String(e._id),
          period: e.periodNumber,
          time: e.startTime && e.endTime ? `${e.startTime} - ${e.endTime}` : '',
          subject: e.centralSubjectId?.name || 'Subject',
          grade: `${e.classId?.gradeNumber ? `Class ${e.classId.gradeNumber}` : e.classId?.name || 'Class'}${e.sectionId?.name ? `-${e.sectionId.name}` : ''}`,
          teacher: e.teacherId?.fullName || '—',
          room: e.roomNumber || 'Classroom',
          status,
        };
      })
      .sort((a, b) => a.period - b.period || a.grade.localeCompare(b.grade));
  }
}

export { ALL_DAYS };
