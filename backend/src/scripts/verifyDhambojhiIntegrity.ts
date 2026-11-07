import { connectDB, disconnectDB } from '../config/db';
import {
  Institution,
  AcademicYear,
  Class,
  Section,
  User,
  StudentEnrollment,
  Timetable,
  TimetableEntry,
  SectionSubject,
  SubjectAllocation,
  ExamAssessment,
  StudentMark,
  AttendanceSession,
} from '../models';

async function verifyIntegrity() {
  await connectDB();
  console.log('══════════════════════════════════════════════════════════════════');
  console.log('🔍 VERIFYING DHAMBOJHI SECONDARY SCHOOL ACADEMIC INTEGRITY (1–12)');
  console.log('══════════════════════════════════════════════════════════════════');

  const inst = await Institution.findOne({ emisCode: '570010001' });
  if (!inst) throw new Error('Dhambojhi Institution not found!');
  console.log(`Institution: ${inst.name} | EMIS: ${inst.emisCode} | Status: ${inst.status}`);

  const ay = await AcademicYear.findOne({ institutionId: inst._id, isCurrent: true });
  console.log(`Academic Year: ${ay?.name} BS`);

  const classes = await Class.find({ institutionId: inst._id }).sort({ gradeNumber: 1, stream: 1 });
  console.log(`Total Classes: ${classes.length}`);

  let totalSections = 0;
  let totalStudents = 0;
  let totalTimetables = 0;
  let totalEntries = 0;
  let totalMarks = 0;
  let totalAttendance = 0;

  for (const c of classes) {
    const sections = await Section.find({ classId: c._id }).populate('classTeacherId');
    totalSections += sections.length;
    console.log(`\n• Class: ${c.name.padEnd(24)} (Grade ${c.gradeNumber}, Stream: ${c.stream})`);

    for (const s of sections) {
      const ctName = (s.classTeacherId as any)?.fullName || 'None';
      const studentCount = await StudentEnrollment.countDocuments({ sectionId: s._id });
      totalStudents += studentCount;

      const tt = await Timetable.findOne({ sectionId: s._id, status: 'PUBLISHED' });
      const entriesCount = await TimetableEntry.countDocuments({ sectionId: s._id });
      if (tt) totalTimetables++;
      totalEntries += entriesCount;

      const secSubs = await SectionSubject.countDocuments({ sectionId: s._id });
      const marks = await StudentMark.countDocuments({ sectionId: s._id });
      totalMarks += marks;

      const attSessions = await AttendanceSession.countDocuments({ sectionId: s._id });
      totalAttendance += attSessions;

      console.log(`   └ ${s.name} [${s.medium}]: CT: ${ctName.padEnd(24)} | Students: ${studentCount} | TT: ${tt ? 'Published' : 'None'} (${entriesCount} periods) | Subs: ${secSubs} | Marks: ${marks} | Att: ${attSessions} days`);
    }
  }

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log('📊 TOTAL VERIFICATION SUMMARY:');
  console.log('══════════════════════════════════════════════════════════════════');
  console.log(`• Total Classes:            ${classes.length}`);
  console.log(`• Total Sections:           ${totalSections}`);
  console.log(`• Total Students Enrolled:  ${totalStudents}`);
  console.log(`• Published Timetables:     ${totalTimetables} (Weekly Slots: ${totalEntries})`);
  console.log(`• Student Marks Recorded:   ${totalMarks}`);
  console.log(`• Daily Attendance Sessions:${totalAttendance}`);
  console.log('══════════════════════════════════════════════════════════════════\n');

  await disconnectDB();
}

verifyIntegrity();

