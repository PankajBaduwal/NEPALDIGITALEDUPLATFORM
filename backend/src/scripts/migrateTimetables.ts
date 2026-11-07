/**
 * One-off, idempotent migration to versioned timetables.
 *  1. Drops the old unique (sectionId, dayOfWeek, periodNumber) index so several versions can coexist.
 *  2. Backfills school, year, class, medium and status on legacy SubjectAllocation rows.
 *  3. Wraps legacy timetable entries (no timetableId) of each section into an ARCHIVED version 1,
 *     preserved as history. They were never validated, so they are not published automatically.
 * Sections without an English/Nepali medium are left untouched and reported.
 */
import { connectDB, disconnectDB } from '../config/db';
import { Section, Class, User, SubjectAllocation, Timetable, TimetableEntry, TimetableChange, SectionSubject } from '../models';
import { sectionMedium } from '../modules/curriculum/textbook-access.service';

export async function migrateTimetables(log: (s: string) => void = console.log) {
  const coll = TimetableEntry.collection;
  const indexes = await coll.indexes();
  const legacy = indexes.find((i: any) => i.unique && JSON.stringify(i.key) === JSON.stringify({ sectionId: 1, dayOfWeek: 1, periodNumber: 1 }));
  if (legacy?.name) {
    await coll.dropIndex(legacy.name);
    log(`Dropped legacy unique index ${legacy.name}`);
  }
  await TimetableEntry.syncIndexes();
  await Timetable.syncIndexes();
  await SectionSubject.syncIndexes();

  // Allocation backfill
  const allocs: any[] = await SubjectAllocation.find({ $or: [{ institutionId: { $exists: false } }, { status: { $exists: false } }] });
  let backfilled = 0;
  for (const a of allocs) {
    const section: any = await Section.findById(a.sectionId);
    const cls: any = section && (await Class.findById(section.classId));
    if (!section || !cls) continue;
    await SubjectAllocation.updateOne(
      { _id: a._id },
      {
        $set: {
          institutionId: cls.institutionId,
          academicYearId: section.academicYearId,
          classId: cls._id,
          status: a.status || 'ACTIVE',
          ...(sectionMedium(section) ? { medium: section.medium } : {}),
          assignedAt: a.assignedAt || a.createdAt || new Date(),
        },
      }
    );
    backfilled++;
  }
  log(`Backfilled ${backfilled} allocation(s)`);

  // Legacy entries → archived v1
  const sectionIds: any[] = await TimetableEntry.distinct('sectionId', { timetableId: { $exists: false } });
  const report = { archived: 0, entries: 0, skippedNoMedium: [] as string[], skippedOrphan: 0 };
  for (const sid of sectionIds) {
    const section: any = await Section.findById(sid);
    const cls: any = section && (await Class.findById(section.classId));
    if (!section || !cls) {
      report.skippedOrphan++;
      continue;
    }
    const medium = sectionMedium(section);
    if (!medium) {
      report.skippedNoMedium.push(`Class ${cls.gradeNumber} ${section.name}`);
      continue;
    }
    const owner: any =
      (await User.findOne({ institutionId: cls.institutionId, role: 'PRINCIPAL' })) || (await User.findOne({ institutionId: cls.institutionId, role: 'SCHOOL_ADMIN' }));
    if (!owner) {
      report.skippedOrphan++;
      continue;
    }
    const last: any = await Timetable.findOne({ sectionId: section._id, academicYearId: section.academicYearId }).sort({ version: -1 });
    const tt: any = await Timetable.create({
      institutionId: cls.institutionId,
      academicYearId: section.academicYearId,
      classId: cls._id,
      sectionId: section._id,
      medium,
      version: (last?.version || 0) + 1,
      status: 'ARCHIVED',
      archivedAt: new Date(),
      createdBy: owner._id,
    });
    const res = await TimetableEntry.updateMany({ sectionId: section._id, timetableId: { $exists: false } }, { $set: { timetableId: tt._id, medium } });
    await TimetableChange.create({
      institutionId: cls.institutionId,
      timetableId: tt._id,
      changeType: 'NEW_VERSION',
      newValues: { version: tt.version, importedEntries: res.modifiedCount },
      changedBy: owner._id,
      userRole: 'SYSTEM',
      reason: 'Legacy (unversioned, unvalidated) timetable imported as an archived version',
      affectedSections: [section._id],
    });
    report.archived++;
    report.entries += res.modifiedCount;
  }
  log(`Archived ${report.archived} legacy timetable(s) with ${report.entries} entries`);
  if (report.skippedNoMedium.length) log(`Left untouched (no English/Nepali medium): ${report.skippedNoMedium.join(', ')}`);
  if (report.skippedOrphan) log(`Skipped ${report.skippedOrphan} section(s) with no school, class or principal`);
  return { backfilled, ...report };
}

if (require.main === module) {
  connectDB()
    .then(() => migrateTimetables())
    .then(() => disconnectDB())
    .catch(async (e) => {
      console.error(e);
      await disconnectDB();
      process.exitCode = 1;
    });
}
