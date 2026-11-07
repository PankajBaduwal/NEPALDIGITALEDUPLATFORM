/**
 * Phase 10 — timetable engine checks that do not change data:
 * period/break generation, and re-validation of every published timetable.
 * The full workflow (drafts, publishing, dashboards, Smart Board, access control)
 * is covered by test_timetable_e2e.ts.
 */
import { connectDB, disconnectDB } from './config/db';
import { Timetable, TimetableEntry } from './models';
import { TimetableBuilderService } from './modules/timetable/timetable-builder.service';
import { schoolClock } from './modules/timetable/timetable.service';

let passed = 0;
let failed = 0;
const check = (cond: any, label: string, extra?: any) => {
  if (cond) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    console.log(`  ❌ ${label}${extra !== undefined ? ` — ${JSON.stringify(extra)}` : ''}`);
  }
};
const expectError = (fn: () => any, label: string) => {
  try {
    fn();
    check(false, label, 'no error');
  } catch (e: any) {
    check(e?.status === 400, `${label}: ${e?.message}`);
  }
};

async function run() {
  console.log('🧪 Period and break generation');
  const g = TimetableBuilderService.generatePeriods({
    schoolStartTime: '09:30',
    schoolEndTime: '14:30',
    periodDurationMinutes: 45,
    breaks: [{ name: 'Midday Break', startTime: '11:45', endTime: '12:15' }],
  });
  check(g.numberOfPeriods === 6, `Sample day yields 6 teaching periods (got ${g.numberOfPeriods})`);
  check(g.periods.map((p) => `${p.startTime}-${p.endTime}`).join(' ') === '09:30-10:15 10:15-11:00 11:00-11:45 11:45-12:15 12:15-13:00 13:00-13:45 13:45-14:30', 'Periods fall around the break');
  check(g.periods.filter((p) => p.isBreak).length === 1 && g.periods.find((p) => p.isBreak)!.periodNumber > 90, 'Break is a separate, non-teaching event');
  const uneven = TimetableBuilderService.generatePeriods({ schoolStartTime: '09:30', schoolEndTime: '14:30', periodDurationMinutes: 40, breaks: [{ name: 'Break', startTime: '11:45', endTime: '12:15' }] });
  check(uneven.periods.every((p) => p.isBreak || p.endTime <= '11:45' || p.startTime >= '12:15'), 'No period overlaps the break when lengths do not divide evenly');
  check(uneven.notes.length > 0, `Unused minutes are reported (${uneven.notes.join('; ')})`);
  expectError(() => TimetableBuilderService.generatePeriods({ schoolStartTime: '14:00', schoolEndTime: '09:00', periodDurationMinutes: 45, breaks: [] }), 'End before start rejected');
  expectError(() => TimetableBuilderService.generatePeriods({ schoolStartTime: '09:30', schoolEndTime: '14:30', periodDurationMinutes: 45, breaks: [{ name: 'Late', startTime: '15:00', endTime: '15:30' }] }), 'Break outside school hours rejected');
  expectError(
    () => TimetableBuilderService.generatePeriods({ schoolStartTime: '09:30', schoolEndTime: '14:30', periodDurationMinutes: 45, breaks: [{ name: 'A', startTime: '11:00', endTime: '11:30' }, { name: 'B', startTime: '11:15', endTime: '11:45' }] }),
    'Overlapping breaks rejected'
  );
  expectError(() => TimetableBuilderService.generatePeriods({ schoolStartTime: '9:7', schoolEndTime: '14:30', periodDurationMinutes: 45, breaks: [] }), 'Malformed time rejected');

  console.log('\n🧪 School clock (Asia/Kathmandu)');
  const c = schoolClock(new Date('2026-11-02T03:45:00Z')); // 09:30 NPT, Monday
  check(c.day === 'MONDAY' && c.minutes === 9 * 60 + 30, `03:45 UTC is Monday 09:30 in Nepal (got ${c.day} ${c.minutes})`);

  console.log('\n🧪 Published timetables re-validate cleanly');
  await connectDB();
  try {
    const published: any[] = await Timetable.find({ status: 'PUBLISHED' });
    check(published.length > 0, `${published.length} published timetable(s) found`);
    let errors = 0;
    for (const tt of published) {
      const r = await TimetableBuilderService.validate(tt);
      errors += r.errors.length;
      if (r.errors.length) console.log(`     ${tt.id}: ${r.errors.map((e) => e.message).join(' | ')}`);
    }
    check(errors === 0, `No hard-rule violations across published timetables (${errors})`);
    const bySection = await Timetable.aggregate([{ $match: { status: 'PUBLISHED' } }, { $group: { _id: '$sectionId', n: { $sum: 1 } } }, { $match: { n: { $gt: 1 } } }]);
    check(bySection.length === 0, 'At most one published version per section');
    const ids = published.map((t) => t._id);
    const weekend = await TimetableEntry.countDocuments({ timetableId: { $in: ids }, dayOfWeek: { $in: ['SATURDAY', 'SUNDAY'] } });
    check(weekend === 0, 'No published period on Saturday or Sunday');
    const clashes = await TimetableEntry.aggregate([
      { $match: { timetableId: { $in: ids } } },
      { $group: { _id: { t: '$teacherId', d: '$dayOfWeek', p: '$periodNumber', y: '$academicYearId' }, n: { $sum: 1 } } },
      { $match: { n: { $gt: 1 } } },
    ]);
    check(clashes.length === 0, `No teacher is in two places at once (${clashes.length})`);
  } finally {
    await disconnectDB();
  }
  console.log(`\n${failed ? '❌' : '🎉'} ${passed} passed, ${failed} failed`);
  if (failed) process.exitCode = 1;
}

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
