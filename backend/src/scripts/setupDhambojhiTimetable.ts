/**
 * Moves Dhambojhi Higher Secondary School onto the versioned timetable, using the same
 * service code the Principal's screens call (every rule and audit entry applies).
 *
 *  - Section media: classes 1–10 Section A English, Section B Nepali. Classes 11–12 follow the
 *    library: Science books exist only in English, Management books only in Nepali.
 *  - School week Monday–Friday, 09:30–14:30, 45-minute periods, break 11:45–12:15.
 *  - Each section offers the subjects its teachers are already allocated to.
 *  - The legacy (Sunday–Friday, 7-period) timetable is archived as version 1; its Monday–Friday
 *    periods 1–6 are re-entered into a new draft, validated, and published when valid.
 *
 * Idempotent: sections that already have a published version are left alone.
 */
import { connectDB, disconnectDB } from '../config/db';
import { Institution, Class, Section, SubjectAllocation, Timetable, TimetableEntry, User } from '../models';
import { AcademicPlanningService } from '../modules/academic-planning/academic-planning.service';
import { TimetableBuilderService } from '../modules/timetable/timetable-builder.service';
import { migrateTimetables } from './migrateTimetables';

const SCHOOL = 'Dhambojhi Higher Secondary School';
const WEEK = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

function mediumFor(grade: number, stream: string, sectionName: string) {
  if (grade <= 10) return /\bA$/.test(sectionName.trim()) ? 'ENGLISH' : 'NEPALI';
  return stream === 'SCIENCE' ? 'ENGLISH' : 'NEPALI';
}

export async function setupDhambojhi(log: (s: string) => void = console.log) {
  const inst: any = await Institution.findOne({ name: SCHOOL });
  if (!inst) throw new Error(`${SCHOOL} not found`);
  const institutionId = String(inst._id);
  const principal: any = await User.findOne({ institutionId, role: 'PRINCIPAL', status: 'ACTIVE' });
  if (!principal) throw new Error('No active principal at Dhambojhi');
  const actor = { userId: String(principal._id), role: 'PRINCIPAL' };
  const year = await AcademicPlanningService.currentAcademicYear(institutionId);
  const yearId = String(year._id);

  const classes: any[] = await Class.find({ institutionId }).sort({ gradeNumber: 1, stream: 1 });
  const sections: any[] = await Section.find({ classId: { $in: classes.map((c) => c._id) }, academicYearId: year._id }).sort({ name: 1 });
  const label = (s: any) => {
    const c = classes.find((x) => String(x._id) === String(s.classId));
    return `Class ${c.gradeNumber}${c.stream !== 'GENERAL' ? ` ${c.stream}` : ''} ${s.name}`;
  };

  // 1. Section media
  for (const s of sections) {
    const c = classes.find((x) => String(x._id) === String(s.classId));
    const m = mediumFor(c.gradeNumber, c.stream, s.name);
    if (s.medium !== m) await AcademicPlanningService.setSectionMedium(institutionId, String(s._id), m, actor);
  }
  log(`Section media set for ${sections.length} sections`);

  // 2. Archive legacy entries as version 1
  await migrateTimetables(log);

  // 3. School week, periods and break
  const cfg = await TimetableBuilderService.saveConfig(
    institutionId,
    yearId,
    { workingDays: WEEK, schoolStartTime: '09:30', schoolEndTime: '14:30', periodDurationMinutes: 45, breaks: [{ name: 'Midday Break', startTime: '11:45', endTime: '12:15', breakType: 'LUNCH' }], name: 'Dhambojhi School Week' },
    actor
  );
  log(`Configured ${cfg.workingDays.join(', ')}: ${cfg.periods.map((p: any) => `${p.name} ${p.startTime}-${p.endTime}`).join(' | ')}`);
  const teachingNumbers = new Set(cfg.teachingPeriods.map((p: any) => p.periodNumber));

  const summary = { published: 0, notPublished: [] as string[], skippedEntries: [] as string[], skippedSubjects: [] as string[] };
  for (const s of sections) {
    const name = label(s);
    if (await Timetable.exists({ sectionId: s._id, status: 'PUBLISHED' })) continue;
    const legacyTt: any = await Timetable.findOne({ sectionId: s._id, status: 'ARCHIVED' }).sort({ version: 1 });
    const legacy: any[] = legacyTt ? await TimetableEntry.find({ timetableId: legacyTt._id }) : [];
    const usable = legacy.filter((e) => WEEK.includes(e.dayOfWeek) && teachingNumbers.has(e.periodNumber));

    // 4. Offered subjects = allocated subjects; weekly periods taken from the carried-over legacy periods.
    const allocs: any[] = await SubjectAllocation.find({ sectionId: s._id, status: { $ne: 'INACTIVE' } });
    const subjectIds = [...new Set(allocs.map((a) => String(a.centralSubjectId)))];
    for (const sid of subjectIds) {
      try {
        await AcademicPlanningService.setSectionSubjects(institutionId, String(s._id), [{ centralSubjectId: sid, periodsPerWeek: usable.filter((e) => String(e.centralSubjectId) === sid).length }], actor);
      } catch (e: any) {
        summary.skippedSubjects.push(`${name}: ${e.message}`);
      }
    }

    // 5. New draft with the carried-over periods, each one checked by the validation engine.
    let draftId: string;
    const pending: any = await Timetable.findOne({ sectionId: s._id, status: { $in: ['DRAFT', 'UNDER_REVIEW'] } });
    if (pending) draftId = String(pending._id);
    else draftId = String((await TimetableBuilderService.createDraft(institutionId, String(s._id), actor, { copyFrom: 'NONE' })).timetable.id);
    const draft: any = await Timetable.findById(draftId);
    if (draft.status === 'DRAFT' && !(await TimetableEntry.exists({ timetableId: draft._id }))) {
      for (const e of usable) {
        try {
          await TimetableBuilderService.setEntry(institutionId, draftId, { dayOfWeek: e.dayOfWeek, periodNumber: e.periodNumber, centralSubjectId: String(e.centralSubjectId), teacherId: String(e.teacherId), roomNumber: e.roomNumber }, actor);
        } catch (err: any) {
          summary.skippedEntries.push(`${name} ${e.dayOfWeek} P${e.periodNumber}: ${err.message}`);
        }
      }
    }

    // 6. Publish when the version has no errors.
    try {
      const r = await TimetableBuilderService.publish(institutionId, draftId, actor);
      summary.published++;
      log(`Published ${name} v${r.timetable.version} (${r.warnings.length} warning(s))`);
    } catch (err: any) {
      summary.notPublished.push(`${name}: ${err.message}`);
    }
  }
  log(`\nPublished ${summary.published} section timetable(s)`);
  if (summary.skippedSubjects.length) log(`Subjects not offered:\n  ${summary.skippedSubjects.join('\n  ')}`);
  if (summary.skippedEntries.length) log(`Legacy periods not carried over (${summary.skippedEntries.length}):\n  ${summary.skippedEntries.join('\n  ')}`);
  if (summary.notPublished.length) log(`Not published:\n  ${summary.notPublished.join('\n  ')}`);
  return summary;
}

if (require.main === module) {
  connectDB()
    .then(() => setupDhambojhi())
    .then(() => disconnectDB())
    .catch(async (e) => {
      console.error(e);
      await disconnectDB();
      process.exitCode = 1;
    });
}
