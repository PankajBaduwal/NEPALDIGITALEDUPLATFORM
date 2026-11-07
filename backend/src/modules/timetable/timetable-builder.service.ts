import mongoose from 'mongoose';
import {
  Institution,
  Class,
  Section,
  CentralSubject,
  SectionSubject,
  SubjectAllocation,
  User,
  Timetable,
  TimetableEntry,
  TimetableTemplate,
  SchoolPeriod,
  TimetableChange,
  DayOfWeekType,
} from '../../models';
import { SocketService } from '../../common/services/socket.service';
import { NotificationService } from '../notifications/notification.service';
import { AuditService } from '../../common/services/audit.service';
import { sectionMedium, TextbookAccessService, TeachingMedium } from '../curriculum/textbook-access.service';

type Actor = { userId: string; role: string };
export type Issue = { code: string; message: string; dayOfWeek?: string; periodNumber?: number; entryId?: string };
export type ValidationResult = { valid: boolean; errors: Issue[]; warnings: Issue[] };

export const ALL_DAYS: DayOfWeekType[] = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
export const DEFAULT_WORKING_DAYS: DayOfWeekType[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
export const NO_TEACHER_MESSAGE = 'No teacher has been assigned to this subject yet. Please allocate a teacher before creating the timetable entry.';

const LIVE: string[] = ['DRAFT', 'UNDER_REVIEW', 'PUBLISHED'];
const PENDING: string[] = ['DRAFT', 'UNDER_REVIEW'];
const isId = (id: any) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);
const toMin = (t: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t || '');
  if (!m || Number(m[1]) > 23 || Number(m[2]) > 59) throw { status: 400, message: `Invalid time "${t}" (use HH:MM)` };
  return Number(m[1]) * 60 + Number(m[2]);
};
const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
const dayLabel = (d: string) => d.charAt(0) + d.slice(1).toLowerCase();
const isNamedRoom = (r?: string) => !!r && !!r.trim() && r.trim().toLowerCase() !== 'classroom';

type Context = {
  timetable: any;
  section: any;
  cls: any;
  medium: TeachingMedium | null;
  workingDays: string[];
  periods: any[];
  teachingPeriods: any[];
  offerings: Map<string, any>;
  allocations: any[];
  teachers: Map<string, any>;
  subjects: Map<string, any>;
  entries: any[];
  others: Array<{ entry: any; status: string; sectionName: string }>;
  maxTeacherPeriods: number;
};

export class TimetableBuilderService {
  // ══════════════════════════════════════════════════════════════════
  // CONFIGURATION: working days, periods and breaks
  // ══════════════════════════════════════════════════════════════════

  static async getConfig(institutionId: string, academicYearId: string) {
    const template: any = await TimetableTemplate.findOne({ institutionId, academicYearId });
    const periods: any[] = await SchoolPeriod.find({ institutionId, academicYearId }).sort({ sortOrder: 1, startTime: 1 });
    const teaching = periods.filter((p) => !p.isBreak);
    return {
      configured: !!template && teaching.length > 0,
      workingDays: template?.workingDays?.length ? template.workingDays : DEFAULT_WORKING_DAYS,
      holidays: ALL_DAYS.filter((d) => !(template?.workingDays?.length ? template.workingDays : DEFAULT_WORKING_DAYS).includes(d)),
      schoolStartTime: template?.schoolStartTime || null,
      schoolEndTime: template?.schoolEndTime || null,
      periodDurationMinutes: template?.periodDurationMinutes || null,
      breaks: (template?.breaks || []).map((b: any) => ({ name: b.name, startTime: b.startTime, endTime: b.endTime, durationMinutes: b.durationMinutes, breakType: b.breakType })),
      periods: periods.map((p) => p.toJSON()),
      teachingPeriods: teaching.map((p) => p.toJSON()),
    };
  }

  /** Generate teaching periods around fixed breaks. Breaks are separate events; no period may overlap one. */
  static generatePeriods(input: {
    schoolStartTime: string;
    schoolEndTime: string;
    periodDurationMinutes: number;
    breaks: Array<{ name: string; startTime: string; endTime: string; breakType?: string }>;
  }) {
    const start = toMin(input.schoolStartTime);
    const end = toMin(input.schoolEndTime);
    const duration = Number(input.periodDurationMinutes);
    if (end <= start) throw { status: 400, message: 'School end time must be after the start time' };
    if (!Number.isInteger(duration) || duration < 20 || duration > 120) throw { status: 400, message: 'Period duration must be between 20 and 120 minutes' };
    const breaks = (input.breaks || [])
      .map((b) => ({ name: (b.name || 'Break').trim(), s: toMin(b.startTime), e: toMin(b.endTime), breakType: ['SHORT_BREAK', 'LUNCH', 'ASSEMBLY'].includes(String(b.breakType)) ? b.breakType! : 'LUNCH' }))
      .sort((a, b) => a.s - b.s);
    breaks.forEach((b, i) => {
      if (b.e <= b.s) throw { status: 400, message: `${b.name}: end time must be after start time` };
      if (b.s < start || b.e > end) throw { status: 400, message: `${b.name} (${toHHMM(b.s)}–${toHHMM(b.e)}) is outside school hours` };
      if (i > 0 && b.s < breaks[i - 1].e) throw { status: 400, message: `${breaks[i - 1].name} and ${b.name} overlap` };
    });

    const periods: any[] = [];
    const notes: string[] = [];
    let cursor = start;
    let n = 0;
    let bi = 0;
    while (cursor < end) {
      const nextBreak = breaks[bi];
      if (nextBreak && cursor >= nextBreak.s) {
        periods.push({ name: nextBreak.name, periodNumber: 90 + bi + 1, startTime: toHHMM(nextBreak.s), endTime: toHHMM(nextBreak.e), durationMinutes: nextBreak.e - nextBreak.s, isBreak: true, breakType: nextBreak.breakType, sortOrder: nextBreak.s });
        cursor = nextBreak.e;
        bi++;
        continue;
      }
      const limit = nextBreak ? nextBreak.s : end;
      if (cursor + duration > limit) {
        if (limit > cursor) notes.push(`${limit - cursor} unused minutes between ${toHHMM(cursor)} and ${toHHMM(limit)}`);
        cursor = limit;
        continue;
      }
      n++;
      periods.push({ name: `Period ${n}`, periodNumber: n, startTime: toHHMM(cursor), endTime: toHHMM(cursor + duration), durationMinutes: duration, isBreak: false, breakType: 'NONE', sortOrder: cursor });
      cursor += duration;
    }
    if (!n) throw { status: 400, message: 'No teaching period fits in the configured school hours' };
    return { periods, notes, numberOfPeriods: n };
  }

  static async saveConfig(
    institutionId: string,
    academicYearId: string,
    body: { workingDays?: string[]; schoolStartTime: string; schoolEndTime: string; periodDurationMinutes: number; breaks?: any[]; name?: string },
    actor: Actor
  ) {
    const workingDays = (body.workingDays?.length ? body.workingDays : DEFAULT_WORKING_DAYS).map((d) => String(d).toUpperCase());
    const bad = workingDays.filter((d) => !ALL_DAYS.includes(d as DayOfWeekType));
    if (bad.length) throw { status: 400, message: `Unknown day(s): ${bad.join(', ')}` };
    const orderedDays = ALL_DAYS.filter((d) => workingDays.includes(d));
    const generated = this.generatePeriods({
      schoolStartTime: body.schoolStartTime,
      schoolEndTime: body.schoolEndTime,
      periodDurationMinutes: Number(body.periodDurationMinutes),
      breaks: body.breaks || [],
    });
    const previous = await this.getConfig(institutionId, academicYearId);

    await TimetableTemplate.findOneAndUpdate(
      { institutionId, academicYearId },
      {
        $set: {
          name: body.name || 'School Timetable',
          workingDays: orderedDays,
          schoolStartTime: body.schoolStartTime,
          schoolEndTime: body.schoolEndTime,
          periodDurationMinutes: Number(body.periodDurationMinutes),
          numberOfPeriods: generated.numberOfPeriods,
          breaks: generated.periods.filter((p) => p.isBreak).map((p) => ({ name: p.name, startTime: p.startTime, endTime: p.endTime, durationMinutes: p.durationMinutes, breakType: p.breakType })),
          isDefault: true,
          status: 'ACTIVE',
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    await SchoolPeriod.deleteMany({ institutionId, academicYearId });
    await SchoolPeriod.insertMany(generated.periods.map((p) => ({ ...p, institutionId, academicYearId })));

    // Keep stored entry times in step with the new period times; report entries the new layout no longer fits.
    const timetables = await Timetable.find({ institutionId, academicYearId, status: { $in: LIVE } }, '_id');
    const ttIds = timetables.map((t: any) => t._id);
    const teaching = generated.periods.filter((p) => !p.isBreak);
    if (ttIds.length) {
      await TimetableEntry.bulkWrite(
        teaching.map((p) => ({ updateMany: { filter: { timetableId: { $in: ttIds }, periodNumber: p.periodNumber }, update: { $set: { startTime: p.startTime, endTime: p.endTime } } } }))
      );
    }
    const affected = ttIds.length
      ? await TimetableEntry.countDocuments({ timetableId: { $in: ttIds }, $or: [{ dayOfWeek: { $nin: orderedDays } }, { periodNumber: { $gt: generated.numberOfPeriods } }] })
      : 0;

    await TimetableChange.create({
      institutionId,
      changeType: 'CONFIG',
      previousValues: { workingDays: previous.workingDays, periods: previous.periods.map((p: any) => `${p.name} ${p.startTime}-${p.endTime}`) },
      newValues: { workingDays: orderedDays, periods: generated.periods.map((p) => `${p.name} ${p.startTime}-${p.endTime}`) },
      changedBy: actor.userId,
      userRole: actor.role,
      reason: 'School days, periods and breaks configured',
    });
    SocketService.emitScheduleChanged(institutionId, { action: 'CONFIG' });
    return { ...(await this.getConfig(institutionId, academicYearId)), notes: generated.notes, entriesOutsideNewLayout: affected };
  }

  // ══════════════════════════════════════════════════════════════════
  // PERMISSIONS
  // ══════════════════════════════════════════════════════════════════

  static async assertRole(institutionId: string, actor: Actor, kind: 'edit' | 'publish') {
    if (actor.role === 'SUPER_ADMIN') return; // gated per school by requireSchoolAcademicContext
    const inst: any = await Institution.findById(institutionId, 'academicSettings');
    const roles: string[] =
      kind === 'publish'
        ? inst?.academicSettings?.timetablePublishRoles || ['PRINCIPAL', 'SCHOOL_ADMIN']
        : inst?.academicSettings?.timetableEditRoles || ['PRINCIPAL', 'SCHOOL_ADMIN'];
    if (!roles.includes(actor.role)) {
      throw { status: 403, message: `Your role (${actor.role}) is not authorised to ${kind} timetables at this school`, code: 'TIMETABLE_ROLE_FORBIDDEN' };
    }
  }

  static async loadTimetable(institutionId: string, timetableId: string) {
    if (!isId(timetableId)) throw { status: 400, message: 'Invalid timetable id' };
    const tt: any = await Timetable.findOne({ _id: timetableId, institutionId });
    if (!tt) throw { status: 404, message: 'Timetable not found' };
    return tt;
  }

  static async loadSection(institutionId: string, sectionId: string) {
    if (!isId(sectionId)) throw { status: 400, message: 'Invalid section id' };
    const section: any = await Section.findById(sectionId);
    const cls: any = section && (await Class.findById(section.classId));
    if (!section || !cls || String(cls.institutionId) !== String(institutionId)) throw { status: 404, message: 'Section not found in this institution' };
    return { section, cls };
  }

  // ══════════════════════════════════════════════════════════════════
  // VALIDATION ENGINE
  // ══════════════════════════════════════════════════════════════════

  static async loadContext(timetable: any): Promise<Context> {
    const { section, cls } = await this.loadSection(String(timetable.institutionId), String(timetable.sectionId));
    const config = await this.getConfig(String(timetable.institutionId), String(timetable.academicYearId));
    const offeringsList: any[] = await SectionSubject.find({ sectionId: section._id });
    const allocations: any[] = await SubjectAllocation.find({ sectionId: section._id, status: { $ne: 'INACTIVE' } });
    const entries: any[] = await TimetableEntry.find({ timetableId: timetable._id });

    // Other sections' published and pending timetables in the same school year, for clash checks.
    const otherTts: any[] = await Timetable.find({
      institutionId: timetable.institutionId,
      academicYearId: timetable.academicYearId,
      sectionId: { $ne: section._id },
      status: { $in: LIVE },
    }).populate('sectionId', 'name');
    const otherEntries: any[] = otherTts.length ? await TimetableEntry.find({ timetableId: { $in: otherTts.map((t) => t._id) } }) : [];
    const ttById = new Map(otherTts.map((t) => [String(t._id), t]));
    const classIds = [...new Set(otherTts.map((t) => String(t.classId)))];
    const classes = new Map((await Class.find({ _id: { $in: classIds } })).map((c: any) => [String(c._id), c]));

    const teacherIds = [...new Set([...allocations.map((a) => String(a.teacherId)), ...entries.map((e) => String(e.teacherId))])];
    const subjectIds = [...new Set([...offeringsList.map((o) => String(o.centralSubjectId)), ...entries.map((e) => String(e.centralSubjectId))])];
    const inst: any = await Institution.findById(timetable.institutionId, 'academicSettings');

    return {
      timetable,
      section,
      cls,
      medium: sectionMedium(section),
      workingDays: config.workingDays,
      periods: config.periods,
      teachingPeriods: config.teachingPeriods,
      offerings: new Map(offeringsList.map((o) => [String(o.centralSubjectId), o])),
      allocations,
      teachers: new Map((await User.find({ _id: { $in: teacherIds } }, 'fullName role status institutionId')).map((u: any) => [String(u._id), u])),
      subjects: new Map((await CentralSubject.find({ _id: { $in: subjectIds } })).map((s: any) => [String(s._id), s])),
      entries,
      others: otherEntries.map((e) => {
        const t = ttById.get(String(e.timetableId));
        const c = classes.get(String(t?.classId));
        return { entry: e, status: t?.status, sectionName: `Class ${c?.gradeNumber ?? '?'}${c?.stream && c.stream !== 'GENERAL' ? ` ${c.stream}` : ''} ${t?.sectionId?.name || ''}`.trim() };
      }),
      maxTeacherPeriods: inst?.academicSettings?.maxTeacherPeriodsPerWeek || 30,
    };
  }

  /** Hard rules for one slot. Errors block saving; warnings are advisory. */
  static checkSlot(
    ctx: Context,
    slot: { dayOfWeek: string; periodNumber: number; centralSubjectId: string; teacherId: string; roomNumber?: string; entryId?: string }
  ): ValidationResult {
    const errors: Issue[] = [];
    const warnings: Issue[] = [];
    const at = { dayOfWeek: slot.dayOfWeek, periodNumber: slot.periodNumber, entryId: slot.entryId };
    const err = (code: string, message: string) => errors.push({ code, message, ...at });
    const warn = (code: string, message: string) => warnings.push({ code, message, ...at });
    const where = `${dayLabel(slot.dayOfWeek)} period ${slot.periodNumber}`;

    if (!ALL_DAYS.includes(slot.dayOfWeek as DayOfWeekType)) err('INVALID_DAY', `Unknown day "${slot.dayOfWeek}"`);
    else if (!ctx.workingDays.includes(slot.dayOfWeek)) err('NON_WORKING_DAY', `${dayLabel(slot.dayOfWeek)} is a school holiday. Classes can only be scheduled on ${ctx.workingDays.map(dayLabel).join(', ')}.`);

    const period = ctx.periods.find((p) => p.periodNumber === slot.periodNumber);
    if (!period) err('INVALID_PERIOD', `Period ${slot.periodNumber} does not exist in the school's period configuration`);
    else if (period.isBreak) err('BREAK_PERIOD', `${period.name} (${period.startTime}–${period.endTime}) is a break. No teaching can be scheduled during breaks.`);

    if (!ctx.medium) err('MEDIUM_NOT_CONFIGURED', `Section ${ctx.section.name} has no teaching medium configured`);
    else if (ctx.medium !== ctx.timetable.medium) {
      err('MEDIUM_MISMATCH', `This timetable was created for the ${ctx.timetable.medium} medium but the section is now ${ctx.medium}. Create a new version.`);
    }

    const subject = ctx.subjects.get(String(slot.centralSubjectId));
    const offering = ctx.offerings.get(String(slot.centralSubjectId));
    if (!subject) err('SUBJECT_NOT_FOUND', 'Subject not found');
    else {
      if (subject.gradeNumber !== ctx.cls.gradeNumber) err('SUBJECT_GRADE_MISMATCH', `${subject.name} is a Class ${subject.gradeNumber} subject; this is Class ${ctx.cls.gradeNumber}`);
      if (subject.isActive === false) err('SUBJECT_INACTIVE', `${subject.name} is deactivated in the curriculum library`);
      if (!offering || !offering.isActive) err('SUBJECT_NOT_OFFERED', `${subject.name} is not configured for Class ${ctx.cls.gradeNumber} ${ctx.section.name}`);
      else if (ctx.medium && offering.medium && offering.medium !== ctx.medium) err('MEDIUM_MISMATCH', `${subject.name} is configured for the ${offering.medium} medium but the section is ${ctx.medium}`);
    }

    const allocatedForSubject = ctx.allocations.filter((a) => String(a.centralSubjectId) === String(slot.centralSubjectId));
    const teacher = ctx.teachers.get(String(slot.teacherId));
    if (!allocatedForSubject.length) err('NO_TEACHER_ALLOCATED', NO_TEACHER_MESSAGE);
    else if (!allocatedForSubject.some((a) => String(a.teacherId) === String(slot.teacherId))) {
      err('TEACHER_NOT_ALLOCATED', `${teacher?.fullName || 'This teacher'} is not allocated to ${subject?.name || 'this subject'} in Section ${ctx.section.name}`);
    }
    if (!teacher) err('TEACHER_NOT_FOUND', 'Teacher not found');
    else {
      if (teacher.role !== 'TEACHER' || String(teacher.institutionId) !== String(ctx.timetable.institutionId)) err('TEACHER_NOT_FOUND', `${teacher.fullName} is not a teacher at this school`);
      if (teacher.status !== 'ACTIVE') err('TEACHER_INACTIVE', `${teacher.fullName} is ${String(teacher.status).toLowerCase()} and cannot be scheduled`);
    }

    const sameSlot = (e: any) => e.dayOfWeek === slot.dayOfWeek && e.periodNumber === slot.periodNumber;
    const dup = ctx.entries.filter((e) => sameSlot(e) && String(e._id) !== String(slot.entryId || ''));
    if (slot.entryId && dup.length) err('DUPLICATE_ENTRY', `Section ${ctx.section.name} already has another subject on ${where}`);

    for (const o of ctx.others.filter((x) => sameSlot(x.entry))) {
      const published = o.status === 'PUBLISHED';
      if (String(o.entry.teacherId) === String(slot.teacherId)) {
        const msg = `${teacher?.fullName || 'Teacher'} already teaches ${o.sectionName} on ${where}${published ? '' : ` (in a ${o.status.toLowerCase().replace('_', ' ')} timetable)`}`;
        published ? err('TEACHER_CLASH', msg) : warn('TEACHER_CLASH_PENDING', msg);
      }
      if (isNamedRoom(slot.roomNumber) && isNamedRoom(o.entry.roomNumber) && o.entry.roomNumber.trim().toLowerCase() === slot.roomNumber!.trim().toLowerCase()) {
        const msg = `Room ${slot.roomNumber} is already used by ${o.sectionName} on ${where}${published ? '' : ' (pending timetable)'}`;
        published ? err('ROOM_CLASH', msg) : warn('ROOM_CLASH_PENDING', msg);
      }
    }
    return { valid: errors.length === 0, errors, warnings };
  }

  /** Full validation of a timetable version: every slot plus weekly rules. */
  static async validate(timetable: any, ctxIn?: Context): Promise<ValidationResult> {
    const ctx = ctxIn || (await this.loadContext(timetable));
    const errors: Issue[] = [];
    const warnings: Issue[] = [];
    for (const e of ctx.entries) {
      const r = this.checkSlot(ctx, { dayOfWeek: e.dayOfWeek, periodNumber: e.periodNumber, centralSubjectId: String(e.centralSubjectId), teacherId: String(e.teacherId), roomNumber: e.roomNumber, entryId: String(e._id) });
      errors.push(...r.errors);
      warnings.push(...r.warnings);
    }

    const name = (id: string) => ctx.subjects.get(id)?.name || 'Subject';
    const count = new Map<string, number>();
    ctx.entries.forEach((e) => count.set(String(e.centralSubjectId), (count.get(String(e.centralSubjectId)) || 0) + 1));
    for (const [sid, off] of ctx.offerings) {
      if (!off.isActive) continue;
      const n = count.get(sid) || 0;
      if (off.periodsPerWeek > 0 && n === 0) warnings.push({ code: 'SUBJECT_MISSING', message: `${name(sid)} is offered but has no periods this week (target ${off.periodsPerWeek})` });
      else if (n < off.periodsPerWeek) warnings.push({ code: 'PERIODS_BELOW_TARGET', message: `${name(sid)}: ${n} of ${off.periodsPerWeek} weekly periods scheduled` });
      else if (n > off.periodsPerWeek) warnings.push({ code: 'PERIODS_ABOVE_TARGET', message: `${name(sid)}: ${n} periods scheduled, target is ${off.periodsPerWeek}` });
      if (!ctx.allocations.some((a) => String(a.centralSubjectId) === sid)) warnings.push({ code: 'NO_TEACHER_ALLOCATED', message: `${name(sid)}: ${NO_TEACHER_MESSAGE}` });

      if (off.practicalPeriodsPerWeek > 0) {
        // Consecutive teaching periods of the same subject with no break between them count as one double period.
        let doubles = 0;
        for (const day of ctx.workingDays) {
          const nums = ctx.entries.filter((e) => e.dayOfWeek === day && String(e.centralSubjectId) === sid).map((e) => e.periodNumber).sort((a, b) => a - b);
          for (let i = 0; i < nums.length - 1; i++) {
            const a = ctx.periods.find((p) => p.periodNumber === nums[i]);
            const b = ctx.periods.find((p) => p.periodNumber === nums[i + 1]);
            if (a && b && nums[i + 1] === nums[i] + 1 && a.endTime === b.startTime) {
              doubles++;
              i++;
            }
          }
        }
        if (doubles * 2 < off.practicalPeriodsPerWeek) {
          warnings.push({ code: 'PRACTICAL_DURATION', message: `${name(sid)} needs ${off.practicalPeriodsPerWeek / 2} double period(s) for practicals; ${doubles} scheduled` });
        }
      }
    }

    for (const day of ctx.workingDays) {
      const dayEntries = ctx.entries.filter((e) => e.dayOfWeek === day);
      const perSubject = new Map<string, number>();
      dayEntries.forEach((e) => perSubject.set(String(e.centralSubjectId), (perSubject.get(String(e.centralSubjectId)) || 0) + 1));
      for (const [sid, n] of perSubject) {
        if (n > 2) warnings.push({ code: 'CLASS_WORKLOAD', message: `${name(sid)} is scheduled ${n} times on ${dayLabel(day)}`, dayOfWeek: day });
      }
    }
    const empty = ctx.workingDays.length * ctx.teachingPeriods.length - ctx.entries.filter((e) => ctx.workingDays.includes(e.dayOfWeek) && ctx.teachingPeriods.some((p) => p.periodNumber === e.periodNumber)).length;
    if (empty > 0) warnings.push({ code: 'UNASSIGNED_PERIODS', message: `${empty} teaching period(s) in the week have no subject` });

    // Teacher workload: this version plus other sections' published timetables.
    const teacherIds = [...new Set(ctx.entries.map((e) => String(e.teacherId)))];
    for (const tid of teacherIds) {
      const mine = ctx.entries.filter((e) => String(e.teacherId) === tid);
      const elsewhere = ctx.others.filter((o) => o.status === 'PUBLISHED' && String(o.entry.teacherId) === tid);
      const total = mine.length + elsewhere.length;
      const tName = ctx.teachers.get(tid)?.fullName || 'Teacher';
      if (total > ctx.maxTeacherPeriods) warnings.push({ code: 'TEACHER_WORKLOAD', message: `${tName} would teach ${total} periods a week (school limit ${ctx.maxTeacherPeriods})` });
      for (const day of ctx.workingDays) {
        const n = [...mine, ...elsewhere.map((o) => o.entry)].filter((e) => e.dayOfWeek === day).length;
        if (ctx.teachingPeriods.length > 1 && n >= ctx.teachingPeriods.length) {
          warnings.push({ code: 'TEACHER_WORKLOAD', message: `${tName} has no free period on ${dayLabel(day)}`, dayOfWeek: day });
        }
      }
    }
    return { valid: errors.length === 0, errors, warnings };
  }

  // ══════════════════════════════════════════════════════════════════
  // BUILDER CONTEXT, VERSIONS AND EDITING
  // ══════════════════════════════════════════════════════════════════

  /** Everything the builder needs for one section: detected medium, offered subjects, allocated teachers, versions. */
  static async builderContext(institutionId: string, sectionId: string) {
    const { section, cls } = await this.loadSection(institutionId, sectionId);
    const medium = sectionMedium(section);
    const config = await this.getConfig(institutionId, String(section.academicYearId));
    const offerings: any[] = await SectionSubject.find({ sectionId: section._id, isActive: true }).populate('centralSubjectId', 'name nameNepali code gradeNumber logicalKey isActive');
    const allocations: any[] = await SubjectAllocation.find({ sectionId: section._id, status: { $ne: 'INACTIVE' } }).populate('teacherId', 'fullName status');
    const versions: any[] = await Timetable.find({ sectionId: section._id, academicYearId: section.academicYearId }).sort({ version: -1 }).populate('publishedBy', 'fullName').populate('createdBy', 'fullName');
    const schoolTeachers: any[] = await User.find({ institutionId, role: 'TEACHER', status: 'ACTIVE' }, 'fullName status').sort({ fullName: 1 });

    // Fallback: If section offerings are empty or incomplete, ensure all CDC CentralSubjects for this grade are included
    const allGradeSubjects: any[] = await CentralSubject.find({
      gradeNumber: cls.gradeNumber,
      isActive: { $ne: false },
      ...(cls.stream && cls.stream !== 'GENERAL' ? { $or: [{ stream: 'GENERAL' }, { stream: cls.stream }, { stream: { $exists: false } }] } : {}),
    }).sort({ isCompulsory: -1, code: 1, name: 1 });

    const subjectMap = new Map<string, any>();
    // First add offerings
    for (const o of offerings.filter((x) => x.centralSubjectId)) {
      const subId = String(o.centralSubjectId._id);
      subjectMap.set(subId, {
        id: subId,
        name: o.centralSubjectId.name,
        nameNepali: o.centralSubjectId.nameNepali,
        code: o.centralSubjectId.code,
        periodsPerWeek: o.periodsPerWeek,
        practicalPeriodsPerWeek: o.practicalPeriodsPerWeek || 0,
        isOptional: o.isOptional,
      });
    }
    // Then add any other CentralSubject for this grade
    for (const s of allGradeSubjects) {
      const subId = String(s._id);
      if (!subjectMap.has(subId)) {
        subjectMap.set(subId, {
          id: subId,
          name: s.name,
          nameNepali: s.nameNepali,
          code: s.code,
          periodsPerWeek: 5,
          practicalPeriodsPerWeek: 0,
          isOptional: !s.isCompulsory,
        });
      }
    }

    const subjects = Array.from(subjectMap.values()).map((sub) => {
      const allocatedTeachers = allocations
        .filter((a) => String(a.centralSubjectId) === sub.id && a.teacherId?.status === 'ACTIVE')
        .map((a) => ({ id: String(a.teacherId._id), name: a.teacherId.fullName }));

      // Merge with school teachers so any teacher can be picked, with allocated ones prioritized
      const teacherIds = new Set(allocatedTeachers.map((t) => t.id));
      const otherTeachers = schoolTeachers
        .filter((t) => !teacherIds.has(String(t._id)))
        .map((t) => ({ id: String(t._id), name: t.fullName }));

      const teachers = [...allocatedTeachers, ...otherTeachers];
      return {
        ...sub,
        teachers,
        message: teachers.length ? null : NO_TEACHER_MESSAGE,
      };
    });

    return {
      section: { id: String(section._id), name: section.name, medium: section.medium, mediumConfigured: !!medium },
      class: { id: String(cls._id), name: cls.name, gradeNumber: cls.gradeNumber, stream: cls.stream },
      academicYearId: String(section.academicYearId),
      medium,
      blockingReason: !medium ? `Set Section ${section.name}'s medium (English or Nepali) before creating a timetable.` : !config.configured ? 'Configure school days, periods and breaks first.' : null,
      config,
      schoolTeachers: schoolTeachers.map((t) => ({ id: String(t._id), name: t.fullName })),
      subjects,
      versions: versions.map((v) => ({ ...v.toJSON(), publishedByName: v.publishedBy?.fullName, createdByName: v.createdBy?.fullName })),
      published: versions.find((v) => v.status === 'PUBLISHED')?.id || null,
      pending: versions.find((v) => PENDING.includes(v.status))?.id || null,
    };
  }

  static async getTimetable(institutionId: string, timetableId: string) {
    const tt = await this.loadTimetable(institutionId, timetableId);
    const entries: any[] = await TimetableEntry.find({ timetableId: tt._id })
      .populate('centralSubjectId', 'name nameNepali code')
      .populate('teacherId', 'fullName')
      .sort({ periodNumber: 1 });
    const config = await this.getConfig(institutionId, String(tt.academicYearId));
    const { section, cls } = await this.loadSection(institutionId, String(tt.sectionId));
    return {
      timetable: tt.toJSON(),
      section: { id: String(section._id), name: section.name, medium: section.medium },
      class: { id: String(cls._id), name: cls.name, gradeNumber: cls.gradeNumber, stream: cls.stream },
      config,
      entries: entries.map((e) => ({
        id: String(e._id),
        dayOfWeek: e.dayOfWeek,
        periodNumber: e.periodNumber,
        startTime: e.startTime,
        endTime: e.endTime,
        roomNumber: e.roomNumber,
        subject: e.centralSubjectId ? { id: String(e.centralSubjectId._id), name: e.centralSubjectId.name, nameNepali: e.centralSubjectId.nameNepali, code: e.centralSubjectId.code } : null,
        teacher: e.teacherId ? { id: String(e.teacherId._id), name: e.teacherId.fullName } : null,
        textbookId: e.textbookId ? String(e.textbookId) : null,
      })),
    };
  }

  /** Start a new draft version for a section, copying the published version's entries when one exists. */
  static async createDraft(institutionId: string, sectionId: string, actor: Actor, opts: { copyFrom?: 'PUBLISHED' | 'NONE' } = {}) {
    await this.assertRole(institutionId, actor, 'edit');
    const { section, cls } = await this.loadSection(institutionId, sectionId);
    const medium = sectionMedium(section);
    if (!medium) throw { status: 400, message: `Set Section ${section.name}'s medium (English or Nepali) before creating a timetable`, code: 'MEDIUM_NOT_CONFIGURED' };
    const config = await this.getConfig(institutionId, String(section.academicYearId));
    if (!config.configured) throw { status: 400, message: 'Configure school days, periods and breaks before creating timetables', code: 'TIMETABLE_NOT_CONFIGURED' };

    const pending = await Timetable.findOne({ sectionId: section._id, academicYearId: section.academicYearId, status: { $in: PENDING } });
    if (pending) throw { status: 409, message: `Version ${pending.version} of this section's timetable is already ${pending.status === 'DRAFT' ? 'in draft' : 'under review'}`, code: 'DRAFT_EXISTS', details: { timetableId: String(pending._id) } };

    const published: any = await Timetable.findOne({ sectionId: section._id, academicYearId: section.academicYearId, status: 'PUBLISHED' });
    const last: any = await Timetable.findOne({ sectionId: section._id, academicYearId: section.academicYearId }).sort({ version: -1 });
    let tt: any;
    try {
      tt = await Timetable.create({
        institutionId,
        academicYearId: section.academicYearId,
        classId: cls._id,
        sectionId: section._id,
        medium,
        version: (last?.version || 0) + 1,
        status: 'DRAFT',
        basedOnVersion: published && opts.copyFrom !== 'NONE' ? published.version : undefined,
        createdBy: actor.userId,
      });
    } catch (e: any) {
      if (e?.code === 11000) throw { status: 409, message: 'Another draft was created at the same time. Reload and try again.', code: 'DRAFT_EXISTS' };
      throw e;
    }
    let copied = 0;
    if (published && opts.copyFrom !== 'NONE' && published.medium === medium) {
      const src: any[] = await TimetableEntry.find({ timetableId: published._id });
      if (src.length) {
        await TimetableEntry.insertMany(
          src.map((e) => {
            const o = e.toObject();
            delete o._id;
            delete o.createdAt;
            delete o.updatedAt;
            return { ...o, timetableId: tt._id };
          })
        );
        copied = src.length;
      }
    }
    await TimetableChange.create({
      institutionId,
      timetableId: tt._id,
      changeType: 'NEW_VERSION',
      newValues: { version: tt.version, basedOnVersion: tt.basedOnVersion, copiedEntries: copied, medium },
      changedBy: actor.userId,
      userRole: actor.role,
      reason: `Draft version ${tt.version} created`,
      affectedSections: [section._id],
    });
    return { timetable: tt.toJSON(), copiedEntries: copied };
  }

  static async loadDraft(institutionId: string, timetableId: string, actor: Actor) {
    await this.assertRole(institutionId, actor, 'edit');
    const tt = await this.loadTimetable(institutionId, timetableId);
    if (tt.status !== 'DRAFT') {
      throw { status: 409, message: `Version ${tt.version} is ${tt.status.toLowerCase().replace('_', ' ')} and cannot be edited${tt.status === 'PUBLISHED' ? '. Create a new version instead.' : ''}`, code: 'TIMETABLE_NOT_EDITABLE' };
    }
    return tt;
  }

  /** Create or replace the subject in one slot of a draft. All hard rules must pass. */
  static async setEntry(
    institutionId: string,
    timetableId: string,
    body: { dayOfWeek: string; periodNumber: number; centralSubjectId: string; teacherId: string; roomNumber?: string },
    actor: Actor
  ) {
    const tt = await this.loadDraft(institutionId, timetableId, actor);
    const dayOfWeek = String(body.dayOfWeek || '').toUpperCase();
    const periodNumber = Number(body.periodNumber);
    if (!isId(body.centralSubjectId)) throw { status: 400, message: 'Select a subject' };
    if (!isId(body.teacherId)) throw { status: 400, message: NO_TEACHER_MESSAGE, code: 'NO_TEACHER_ALLOCATED' };
    const ctx = await this.loadContext(tt);
    // Make sure the subject and teacher being placed are in the lookup maps.
    if (!ctx.subjects.has(body.centralSubjectId)) {
      const s = await CentralSubject.findById(body.centralSubjectId);
      if (s) ctx.subjects.set(body.centralSubjectId, s);
    }
    if (!ctx.teachers.has(body.teacherId)) {
      const t = await User.findById(body.teacherId, 'fullName role status institutionId');
      if (t) ctx.teachers.set(body.teacherId, t);
    }
    const existing: any = ctx.entries.find((e) => e.dayOfWeek === dayOfWeek && e.periodNumber === periodNumber);
    const roomNumber = (body.roomNumber || '').trim() || 'Classroom';
    const check = this.checkSlot(ctx, { dayOfWeek, periodNumber, centralSubjectId: body.centralSubjectId, teacherId: body.teacherId, roomNumber, entryId: existing ? String(existing._id) : undefined });
    if (!check.valid) throw { status: 422, message: check.errors[0].message, code: check.errors[0].code, details: check };

    const period = ctx.periods.find((p) => p.periodNumber === periodNumber);
    const book = await TextbookAccessService.digitalTextbookFor(body.centralSubjectId, ctx.medium);
    const entry: any = await TimetableEntry.findOneAndUpdate(
      { timetableId: tt._id, dayOfWeek, periodNumber },
      {
        $set: {
          institutionId,
          academicYearId: tt.academicYearId,
          classId: tt.classId,
          sectionId: tt.sectionId,
          medium: tt.medium,
          periodId: period._id || period.id,
          startTime: period.startTime,
          endTime: period.endTime,
          centralSubjectId: body.centralSubjectId,
          teacherId: body.teacherId,
          roomNumber,
          textbookId: (book.textbook as any)?.id || (book.textbook as any)?._id || undefined,
        },
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Automatically ensure SubjectAllocation and SectionSubject are assigned so teacher sees it immediately
    await SubjectAllocation.findOneAndUpdate(
      {
        sectionId: tt.sectionId,
        centralSubjectId: body.centralSubjectId,
        teacherId: body.teacherId,
      },
      {
        $set: {
          institutionId,
          academicYearId: tt.academicYearId,
          classId: tt.classId,
          sectionId: tt.sectionId,
          centralSubjectId: body.centralSubjectId,
          teacherId: body.teacherId,
          status: 'ACTIVE',
        },
      },
      { upsert: true }
    );

    await SectionSubject.findOneAndUpdate(
      {
        sectionId: tt.sectionId,
        centralSubjectId: body.centralSubjectId,
      },
      {
        $set: {
          institutionId,
          academicYearId: tt.academicYearId,
          sectionId: tt.sectionId,
          centralSubjectId: body.centralSubjectId,
          isActive: true,
        },
      },
      { upsert: true }
    );
    await TimetableChange.create({
      institutionId,
      timetableId: tt._id,
      timetableEntryId: entry._id,
      changeType: existing ? 'UPDATE' : 'CREATE',
      previousValues: existing ? { centralSubjectId: existing.centralSubjectId, teacherId: existing.teacherId, roomNumber: existing.roomNumber } : null,
      newValues: { dayOfWeek, periodNumber, centralSubjectId: body.centralSubjectId, teacherId: body.teacherId, roomNumber },
      changedBy: actor.userId,
      userRole: actor.role,
      reason: `Draft v${tt.version}: ${dayLabel(dayOfWeek)} period ${periodNumber} ${existing ? 'changed' : 'assigned'}`,
      affectedTeachers: [body.teacherId, ...(existing ? [existing.teacherId] : [])],
      affectedSections: [tt.sectionId],
    });
    await Timetable.updateOne({ _id: tt._id }, { $unset: { lastValidation: 1 } });
    return { entry: entry.toJSON(), warnings: check.warnings };
  }

  static async removeEntry(institutionId: string, timetableId: string, entryId: string, actor: Actor) {
    const tt = await this.loadDraft(institutionId, timetableId, actor);
    if (!isId(entryId)) throw { status: 400, message: 'Invalid entry id' };
    const entry: any = await TimetableEntry.findOneAndDelete({ _id: entryId, timetableId: tt._id });
    if (!entry) throw { status: 404, message: 'Entry not found in this draft' };
    await TimetableChange.create({
      institutionId,
      timetableId: tt._id,
      timetableEntryId: entry._id,
      changeType: 'DELETE',
      previousValues: { dayOfWeek: entry.dayOfWeek, periodNumber: entry.periodNumber, centralSubjectId: entry.centralSubjectId, teacherId: entry.teacherId },
      changedBy: actor.userId,
      userRole: actor.role,
      reason: `Draft v${tt.version}: ${dayLabel(entry.dayOfWeek)} period ${entry.periodNumber} cleared`,
      affectedTeachers: [entry.teacherId],
      affectedSections: [tt.sectionId],
    });
    return { id: entryId, removed: true };
  }

  static async runValidation(institutionId: string, timetableId: string) {
    const tt = await this.loadTimetable(institutionId, timetableId);
    const result = await this.validate(tt);
    await Timetable.updateOne({ _id: tt._id }, { $set: { lastValidation: { errors: result.errors.length, warnings: result.warnings.length, checkedAt: new Date() } } });
    return result;
  }

  // ══════════════════════════════════════════════════════════════════
  // WORKFLOW: DRAFT → UNDER_REVIEW → PUBLISHED → ARCHIVED
  // ══════════════════════════════════════════════════════════════════

  private static async transition(tt: any, from: string[], set: Record<string, any>) {
    const updated: any = await Timetable.findOneAndUpdate({ _id: tt._id, status: { $in: from } }, { $set: set }, { returnDocument: 'after' });
    if (!updated) throw { status: 409, message: 'The timetable was changed by someone else. Reload and try again.', code: 'TIMETABLE_STATE_CHANGED' };
    return updated;
  }

  static async submitForReview(institutionId: string, timetableId: string, actor: Actor) {
    const tt = await this.loadDraft(institutionId, timetableId, actor);
    const result = await this.validate(tt);
    if (!result.valid) throw { status: 422, message: `Fix ${result.errors.length} error(s) before submitting for review`, code: 'TIMETABLE_INVALID', details: result };
    const updated = await this.transition(tt, ['DRAFT'], { status: 'UNDER_REVIEW', submittedBy: actor.userId, submittedAt: new Date(), lastValidation: { errors: 0, warnings: result.warnings.length, checkedAt: new Date() } });
    await TimetableChange.create({ institutionId, timetableId: tt._id, changeType: 'UPDATE', newValues: { status: 'UNDER_REVIEW' }, changedBy: actor.userId, userRole: actor.role, reason: `Version ${tt.version} submitted for review`, affectedSections: [tt.sectionId] });
    return { timetable: updated.toJSON(), validation: result };
  }

  static async returnToDraft(institutionId: string, timetableId: string, actor: Actor, reason?: string) {
    await this.assertRole(institutionId, actor, 'publish');
    const tt = await this.loadTimetable(institutionId, timetableId);
    const updated = await this.transition(tt, ['UNDER_REVIEW'], { status: 'DRAFT' });
    await TimetableChange.create({ institutionId, timetableId: tt._id, changeType: 'UPDATE', newValues: { status: 'DRAFT' }, changedBy: actor.userId, userRole: actor.role, reason: reason || `Version ${tt.version} returned to draft`, affectedSections: [tt.sectionId] });
    return updated.toJSON();
  }

  static async publish(institutionId: string, timetableId: string, actor: Actor) {
    await this.assertRole(institutionId, actor, 'publish');
    const tt = await this.loadTimetable(institutionId, timetableId);
    if (!PENDING.includes(tt.status)) throw { status: 409, message: `Version ${tt.version} is ${tt.status.toLowerCase()} and cannot be published`, code: 'TIMETABLE_NOT_PUBLISHABLE' };
    const ctx = await this.loadContext(tt);
    const result = await this.validate(tt, ctx);
    if (!result.valid) throw { status: 422, message: `Publishing blocked: ${result.errors.length} error(s) must be fixed first`, code: 'TIMETABLE_INVALID', details: result };

    const now = new Date();
    const updated = await this.transition(tt, PENDING, {
      status: 'PUBLISHED',
      publishedBy: actor.userId,
      publishedAt: now,
      lastValidation: { errors: 0, warnings: result.warnings.length, checkedAt: now },
    });
    const previous: any[] = await Timetable.find({ sectionId: tt.sectionId, academicYearId: tt.academicYearId, status: 'PUBLISHED', _id: { $ne: tt._id } });
    if (previous.length) await Timetable.updateMany({ _id: { $in: previous.map((p) => p._id) }, status: 'PUBLISHED' }, { $set: { status: 'ARCHIVED', archivedAt: now } });

    const prevTeachers = previous.length ? await TimetableEntry.distinct('teacherId', { timetableId: { $in: previous.map((p) => p._id) } }) : [];
    const teachers = [...new Set([...ctx.entries.map((e) => String(e.teacherId)), ...prevTeachers.map(String)])];

    await TimetableChange.create({
      institutionId,
      timetableId: tt._id,
      changeType: 'PUBLISH',
      previousValues: previous.length ? { version: previous[0].version } : null,
      newValues: { version: tt.version, entries: ctx.entries.length, warnings: result.warnings.length },
      changedBy: actor.userId,
      userRole: actor.role,
      reason: `Version ${tt.version} published`,
      affectedTeachers: teachers,
      affectedSections: [tt.sectionId],
    });
    await AuditService.log({ operatorId: actor.userId, operatorRole: actor.role, action: 'TIMETABLE_PUBLISHED', entityType: 'Timetable', entityId: String(tt._id), details: { institutionId, sectionId: String(tt.sectionId), version: tt.version } });

    const label = `Class ${ctx.cls.gradeNumber}${ctx.cls.stream && ctx.cls.stream !== 'GENERAL' ? ` ${ctx.cls.stream}` : ''} ${ctx.section.name}`;
    for (const teacherId of teachers) {
      await NotificationService.sendNotification({
        recipientId: teacherId,
        institutionId,
        type: 'TIMETABLE_PUBLISHED' as any,
        title: 'Timetable published',
        message: `The timetable for ${label} (version ${tt.version}) has been published. Check My Teaching Schedule for your periods.`,
        priority: 'NORMAL' as any,
        metadata: { timetableId: String(tt._id), sectionId: String(tt.sectionId) },
      }).catch(() => undefined);
      SocketService.emitScheduleChanged(institutionId, { action: 'PUBLISHED', timetableId: String(tt._id), version: tt.version, teacherId });
    }
    await NotificationService.broadcastNotification({
      institutionId,
      audience: 'STUDENTS',
      sectionId: String(tt.sectionId),
      type: 'TIMETABLE_PUBLISHED' as any,
      title: 'New class timetable',
      message: `A new timetable for ${label} has been published.`,
      metadata: { timetableId: String(tt._id) },
    }).catch(() => undefined);
    SocketService.emitScheduleChanged(institutionId, { action: 'PUBLISHED', timetableId: String(tt._id), version: tt.version, sectionId: String(tt.sectionId) });

    return { timetable: updated.toJSON(), archivedVersions: previous.map((p) => p.version), notifiedTeachers: teachers.length, warnings: result.warnings };
  }

  static async archive(institutionId: string, timetableId: string, actor: Actor) {
    await this.assertRole(institutionId, actor, 'publish');
    const tt = await this.loadTimetable(institutionId, timetableId);
    const updated = await this.transition(tt, ['DRAFT', 'UNDER_REVIEW', 'PUBLISHED'], { status: 'ARCHIVED', archivedAt: new Date() });
    await TimetableChange.create({ institutionId, timetableId: tt._id, changeType: 'ARCHIVE', previousValues: { status: tt.status }, changedBy: actor.userId, userRole: actor.role, reason: `Version ${tt.version} archived`, affectedSections: [tt.sectionId] });
    if (tt.status === 'PUBLISHED') SocketService.emitScheduleChanged(institutionId, { action: 'ARCHIVED', timetableId: String(tt._id), sectionId: String(tt.sectionId) });
    return updated.toJSON();
  }

  static async history(institutionId: string, filter: { sectionId?: string; limit?: number }) {
    const q: any = { institutionId };
    if (filter.sectionId) {
      const { section } = await this.loadSection(institutionId, filter.sectionId);
      q.timetableId = { $in: (await Timetable.find({ sectionId: section._id }, '_id')).map((t: any) => t._id) };
    }
    const changes: any[] = await TimetableChange.find(q).sort({ timestamp: -1 }).limit(Math.min(filter.limit || 100, 500)).populate('changedBy', 'fullName role');
    return changes.map((c) => ({ ...c.toJSON(), changedByName: c.changedBy?.fullName, changedBy: c.changedBy?._id ? String(c.changedBy._id) : c.changedBy }));
  }

  /** School-wide status of every section's timetable. */
  static async overview(institutionId: string, academicYearId: string) {
    const classes: any[] = await Class.find({ institutionId }).sort({ gradeNumber: 1, stream: 1 });
    const sections: any[] = await Section.find({ classId: { $in: classes.map((c) => c._id) }, academicYearId }).sort({ name: 1 });
    const tts: any[] = await Timetable.find({ sectionId: { $in: sections.map((s) => s._id) }, status: { $ne: 'ARCHIVED' } });
    const config = await this.getConfig(institutionId, academicYearId);
    return {
      config,
      sections: sections.map((s) => {
        const c = classes.find((x) => String(x._id) === String(s.classId));
        const pub = tts.find((t) => String(t.sectionId) === String(s._id) && t.status === 'PUBLISHED');
        const pend = tts.find((t) => String(t.sectionId) === String(s._id) && PENDING.includes(t.status));
        return {
          sectionId: String(s._id),
          sectionName: s.name,
          classId: String(c?._id),
          gradeNumber: c?.gradeNumber,
          stream: c?.stream,
          medium: s.medium,
          mediumConfigured: !!sectionMedium(s),
          published: pub ? { id: String(pub._id), version: pub.version, publishedAt: pub.publishedAt } : null,
          pending: pend ? { id: String(pend._id), version: pend.version, status: pend.status, lastValidation: pend.lastValidation } : null,
        };
      }),
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // PUBLISHED SCHEDULES (read side for teachers, students and principals)
  // ══════════════════════════════════════════════════════════════════

  static async publishedTimetableIds(filter: Record<string, any>) {
    return (await Timetable.find({ ...filter, status: 'PUBLISHED' }, '_id')).map((t: any) => t._id);
  }

  static async publishedEntries(query: { institutionId?: string; teacherId?: string; sectionId?: string }) {
    const ttFilter: any = {};
    if (query.institutionId) ttFilter.institutionId = query.institutionId;
    if (query.sectionId) ttFilter.sectionId = query.sectionId;
    const ids = await this.publishedTimetableIds(ttFilter);
    const q: any = { timetableId: { $in: ids } };
    if (query.teacherId) q.teacherId = new mongoose.Types.ObjectId(String(query.teacherId));
    return TimetableEntry.find(q)
      .populate('centralSubjectId', 'name nameNepali code logicalKey gradeNumber')
      .populate('teacherId', 'fullName')
      .populate('sectionId', 'name medium')
      .populate('classId', 'name gradeNumber stream')
      .populate('textbookId', 'title titleNepali coverImage gradeNumber medium')
      .sort({ periodNumber: 1 });
  }
}
