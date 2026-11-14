/**
 * Read-only check of the Class 1 demo data (Dhambojhi Secondary School): counts per data type and gaps.
 *   npm run verify:class1
 */
import fs from 'fs';
import path from 'path';
import { connectDB, disconnectDB } from '../config/db';
import * as M from '../models';
const m: any = M;

async function main() {
  await connectDB();
  console.log(`\n▶ Verifying Class 1 demo data in "${m.Institution.db.name}"`);
  const inst: any = await m.Institution.findOne({ emisCode: '570010001' });
  const cls: any = await m.Class.findOne({ institutionId: inst._id, gradeNumber: 1 });
  const secs: any[] = await m.Section.find({ classId: cls._id });
  const sids = secs.map((s) => s._id);
  const enr: any[] = await m.StudentEnrollment.find({ sectionId: { $in: sids }, status: { $ne: 'GRADUATED' } });
  const studentIds = enr.map((e) => e.studentId);
  const allocs: any[] = await m.SubjectAllocation.find({ sectionId: { $in: sids } });
  const problems: string[] = [];
  const n = async (label: string, model: string, filter: any, min = 1) => {
    const c = await m[model].countDocuments(filter);
    console.log(`  ${String(c).padStart(5)}  ${label}`);
    if (c < min) problems.push(`${label}: only ${c}`);
    return c;
  };
  console.log(`  sections ${secs.length} · students ${studentIds.length} · subject allocations ${allocs.length}`);
  if (studentIds.length < 18) problems.push('fewer than 18 students');
  if (allocs.length < 8) problems.push('fewer than 8 subject allocations');

  await n('attendance sessions', 'AttendanceSession', { sectionId: { $in: sids } }, 100);
  const today = new Date();
  const last = await m.AttendanceSession.findOne({ sectionId: { $in: sids } }).sort({ date: -1 });
  console.log('        latest attendance:', last && last.date.toISOString().slice(0, 10));
  await n('examinations (Class 1)', 'Examination', { institutionId: inst._id, applicableGrades: 1 }, 3);
  await n('exam assessments', 'ExamAssessment', { sectionId: { $in: sids }, examinationId: { $ne: null } }, 24);
  await n('student marks', 'StudentMark', { studentId: { $in: studentIds } }, 200);
  await n('assignments', 'Assignment', { sectionId: { $in: sids } }, 16);
  await n('assignment submissions', 'AssignmentSubmission', { studentId: { $in: studentIds } }, 30);
  const mats: any[] = await m.AcademicMaterial.find({ sectionId: { $in: sids } });
  console.log(`  ${String(mats.length).padStart(5)}  shared notes`);
  if (mats.length < 16) problems.push('shared notes: fewer than 16');
  const missingFiles = mats.filter((x) => !fs.existsSync(path.resolve(process.cwd(), 'uploads', 'materials', path.basename(x.fileUrl)))).length;
  if (missingFiles) problems.push(`${missingFiles} shared-note files are missing on disk`);
  console.log(`        note files on disk: ${mats.length - missingFiles}/${mats.length}`);
  await n('smart-board notes (shared)', 'SmartBoardNote', { sectionId: { $in: sids }, isSharedWithStudents: true }, 8);
  await n('quizzes', 'Quiz', { sectionId: { $in: sids }, status: 'PUBLISHED' }, 8);
  const quizIds = (await m.Quiz.find({ sectionId: { $in: sids } }).select('_id')).map((q: any) => q._id);
  await n('quiz attempts', 'QuizAttempt', { quizId: { $in: quizIds }, studentId: { $in: studentIds } }, 40);
  await n('activity assignments', 'ActivityAssignment', { sectionId: { $in: sids } }, 8);
  await n('activity attempts', 'ActivityAttempt', { sectionId: { $in: sids } }, 20);
  await n('teaching plans', 'TeachingPlan', { sectionId: { $in: sids } }, 8);
  await n('teaching diary entries', 'TeachingDiaryEntry', { sectionId: { $in: sids } }, 40);
  await n('syllabus progress rows', 'SyllabusProgress', { sectionId: { $in: sids } }, 40);
  await n('student remarks / interventions', 'StudentRemark', { studentId: { $in: studentIds } }, 8);
  await n('class announcements', 'SchoolAnnouncement', { sectionId: { $in: sids } }, 12);
  await n('student notifications', 'Notification', { recipientId: { $in: studentIds } }, 36);
  await n('calendar events', 'CalendarEvent', { institutionId: inst._id }, 5);
  await n('smart-board lesson logs', 'ClassroomSession', { sectionId: { $in: sids }, status: 'COMPLETED' }, 8);
  await n('timetable entries', 'TimetableEntry', { sectionId: { $in: sids } }, 50);

  // every student must have attendance, marks in every subject for the published unit test, and unique names
  const names = (await m.User.find({ _id: { $in: studentIds } }).select('fullName')).map((u: any) => u.fullName);
  if (new Set(names).size !== names.length) problems.push('duplicate student names remain in Class 1');
  const ut1: any = await m.Examination.findOne({ institutionId: inst._id, code: 'UT1_2083' });
  for (const s of secs) {
    const stu = enr.filter((e) => String(e.sectionId) === String(s._id)).map((e) => e.studentId);
    const ids = (await m.AttendanceRecord.find({ sectionId: s._id, periodNumber: 1 }).select('records')).flatMap((r: any) => r.records.map((x: any) => String(x.studentId)));
    const noAtt = stu.filter((id) => !ids.includes(String(id)));
    if (noAtt.length) problems.push(`Section ${s.name}: ${noAtt.length} students have no attendance records`);
    if (ut1) {
      const per = await m.StudentMark.countDocuments({ examinationId: ut1._id, sectionId: s._id });
      const expected = stu.length * 4;
      console.log(`        Section ${s.name}: unit-test marks ${per}/${expected}`);
      if (per < expected) problems.push(`Section ${s.name}: unit-test marks ${per}/${expected}`);
    } else problems.push('Unit Test 1 examination is missing');
  }
  console.log(problems.length ? `\n✖ ${problems.length} problem(s):\n  - ${problems.join('\n  - ')}` : '\n✔ Class 1 demo data is complete.');
  await disconnectDB();
  process.exit(problems.length ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
