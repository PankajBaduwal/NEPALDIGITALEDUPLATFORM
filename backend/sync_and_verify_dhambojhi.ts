import mongoose from 'mongoose';
import { Timetable, TimetableEntry } from './src/models/Timetable';
import { Institution } from './src/models/Institution';
import { SubjectAllocation, SectionSubject } from './src/models/Allocation';
import { Section, Class, AcademicYear } from './src/models/Academic';
import { TextbookAccessService, sectionMedium } from './src/modules/curriculum/textbook-access.service';

async function syncAndVerify() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nepal_edu_ecosystem');
  console.log('Connected to MongoDB');

  const inst = await Institution.findOne({ emisCode: '570010001' });
  if (!inst) throw new Error('Dhambojhi Secondary School not found');
  console.log('Found institution:', inst.name, inst._id);

  const academicYear = await AcademicYear.findOne({ institutionId: inst._id, isCurrent: true })
    || await AcademicYear.findOne({ institutionId: inst._id }).sort({ createdAt: -1 });
  if (!academicYear) throw new Error('Academic year not found');
  console.log('Academic year:', academicYear.name, academicYear._id);

  const entries: any[] = await TimetableEntry.find({ institutionId: inst._id });
  console.log(`Found ${entries.length} timetable entries for Dhambojhi`);

  // Ensure every entry has textbookId
  let updatedEntries = 0;
  for (const entry of entries) {
    if (!entry.textbookId) {
      const section = await Section.findById(entry.sectionId);
      const medium = section ? sectionMedium(section) : 'ENGLISH';
      const bookRes = await TextbookAccessService.digitalTextbookFor(String(entry.centralSubjectId), medium);
      if (bookRes.textbook) {
        entry.textbookId = (bookRes.textbook as any)._id || (bookRes.textbook as any).id;
        await entry.save();
        updatedEntries++;
      }
    }
  }
  console.log(`Updated ${updatedEntries} entries with textbookId`);

  // Build unique allocations and section subjects
  const allocMap = new Map<string, { sectionId: any; centralSubjectId: any; teacherId: any; classId: any; medium: any }>();
  const sectionSubjectMap = new Map<string, { sectionId: any; centralSubjectId: any; classId: any }>();

  for (const e of entries) {
    const kAlloc = `${e.sectionId}_${e.centralSubjectId}_${e.teacherId}`;
    if (!allocMap.has(kAlloc)) {
      allocMap.set(kAlloc, {
        sectionId: e.sectionId,
        centralSubjectId: e.centralSubjectId,
        teacherId: e.teacherId,
        classId: e.classId,
        medium: e.medium || 'ENGLISH',
      });
    }

    const kSub = `${e.sectionId}_${e.centralSubjectId}`;
    if (!sectionSubjectMap.has(kSub)) {
      sectionSubjectMap.set(kSub, {
        sectionId: e.sectionId,
        centralSubjectId: e.centralSubjectId,
        classId: e.classId,
      });
    }
  }

  console.log(`Upserting ${allocMap.size} SubjectAllocations...`);
  let createdAllocs = 0;
  for (const item of allocMap.values()) {
    await SubjectAllocation.findOneAndUpdate(
      {
        sectionId: item.sectionId,
        centralSubjectId: item.centralSubjectId,
        teacherId: item.teacherId,
      },
      {
        $set: {
          institutionId: inst._id,
          academicYearId: academicYear._id,
          classId: item.classId,
          sectionId: item.sectionId,
          centralSubjectId: item.centralSubjectId,
          teacherId: item.teacherId,
          medium: item.medium,
          status: 'ACTIVE',
        },
      },
      { upsert: true }
    );
    createdAllocs++;
  }
  console.log(`Successfully synced ${createdAllocs} SubjectAllocations!`);

  console.log(`Upserting ${sectionSubjectMap.size} SectionSubjects...`);
  let createdSectionSubjects = 0;
  for (const item of sectionSubjectMap.values()) {
    await SectionSubject.findOneAndUpdate(
      {
        sectionId: item.sectionId,
        centralSubjectId: item.centralSubjectId,
      },
      {
        $set: {
          institutionId: inst._id,
          academicYearId: academicYear._id,
          classId: item.classId,
          sectionId: item.sectionId,
          centralSubjectId: item.centralSubjectId,
          periodsPerWeek: 5,
          isActive: true,
        },
      },
      { upsert: true }
    );
    createdSectionSubjects++;
  }
  console.log(`Successfully synced ${createdSectionSubjects} SectionSubjects!`);

  // Verify class coverage
  const classes = await Class.find({ institutionId: inst._id }).sort({ gradeNumber: 1 });
  console.log(`\nVerifying all ${classes.length} classes for Dhambojhi:`);
  for (const cls of classes) {
    const sections = await Section.find({ classId: cls._id });
    for (const sec of sections) {
      const secEntries = await TimetableEntry.countDocuments({ sectionId: sec._id });
      const secAllocs = await SubjectAllocation.countDocuments({ sectionId: sec._id });
      const secBooks = await TimetableEntry.countDocuments({ sectionId: sec._id, textbookId: { $ne: null } });
      console.log(`Class ${cls.gradeNumber || cls.name} (${cls.stream || 'GENERAL'}) - ${sec.name}: ${secEntries} periods | ${secAllocs} allocations | ${secBooks} textbook links`);
    }
  }

  await mongoose.disconnect();
  console.log('\nSync and verification complete!');
}

syncAndVerify().catch((e) => {
  console.error(e);
  process.exit(1);
});
