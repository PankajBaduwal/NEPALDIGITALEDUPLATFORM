/**
 * End-to-end tests for the curriculum library, subject allocation, timetable and Smart Board
 * integration (spec section 19, Tests 1–12) against Dhambojhi Higher Secondary School.
 *
 * Runs the real Express app in-process on a free port and calls the HTTP API with the school's
 * real users (session tokens are issued directly, no passwords are used). Requires
 * `npm run curriculum:sync` and `tsx src/scripts/setupDhambojhiTimetable.ts` to have run.
 *
 * Changes it leaves behind are the ones a real run of the scenarios would: Class 8 Section A gets
 * a new published timetable version (room change), and the temporary subject offering/allocation
 * made in Test 3 is removed again.
 */
import http from 'http';
import fs from 'fs';
import crypto from 'crypto';
import { AddressInfo } from 'net';
import { connectDB, disconnectDB } from './config/db';
import { createApp } from './app';
import { SocketService } from './common/services/socket.service';
import { TokenUtil } from './common/utils/token.util';
import { Institution, User, Class, Section, SubjectAllocation, StudentEnrollment, Textbook, Notification, Timetable, TimetableEntry, SectionSubject } from './models';
import { resolveLibraryFile } from './modules/curriculum/nepal-data/nepal-curriculum-sync.service';

let base = '';
let passed = 0;
const failures: string[] = [];

function check(cond: any, label: string, extra?: any) {
  if (cond) {
    passed++;
    console.log(`   ✅ ${label}`);
  } else {
    failures.push(label);
    console.log(`   ❌ ${label}${extra !== undefined ? ` — ${typeof extra === 'string' ? extra : JSON.stringify(extra).slice(0, 400)}` : ''}`);
  }
}

const tokenFor = (u: any) => TokenUtil.sign({ userId: String(u._id), username: u.username, role: u.role, institutionId: u.institutionId ? String(u.institutionId) : null });

async function api(token: string, method: string, path: string, body?: any, headers: Record<string, string> = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json: any = await res.json().catch(() => ({}));
  return { status: res.status, data: json.data, message: json.message, code: json.error?.code, details: json.error?.details };
}

const sha256 = (file: string) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

async function run() {
  await connectDB();
  const app = createApp();
  const server = http.createServer(app);
  SocketService.init(server);
  await new Promise<void>((r) => server.listen(0, r));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/v1`;

  try {
    const school: any = await Institution.findOne({ name: 'Dhambojhi Higher Secondary School' });
    const other: any = await Institution.findOne({ _id: { $ne: school._id } });
    const principal: any = await User.findOne({ institutionId: school._id, role: 'PRINCIPAL', status: 'ACTIVE' });
    const superAdmin: any = await User.findOne({ role: 'SUPER_ADMIN' });
    const P = tokenFor(principal);
    const SA = tokenFor(superAdmin);
    const class8: any = await Class.findOne({ institutionId: school._id, gradeNumber: 8 });
    const s8A: any = await Section.findOne({ classId: class8._id, name: /A$/ });
    const s8B: any = await Section.findOne({ classId: class8._id, name: /B$/ });
    const A = String(s8A._id);
    const B = String(s8B._id);

    // ── Test 1 & 2: medium-specific subject selection ───────────────
    console.log('\n🧪 Test 1: English Medium subject selection (Principal, Class 8)');
    const en = await api(P, 'GET', `/academic-planning/explorer?classId=${class8._id}&medium=ENGLISH`);
    check(en.status === 200 && en.data.subjects.length > 0, `Explorer lists ${en.data?.subjects?.length} Class 8 subjects`, en.message);
    check(en.data.sections.find((s: any) => s.id === A)?.medium === 'ENGLISH', 'Section A is the English medium section');
    check(en.data.subjects.every((s: any) => s.gradeNumber === 8), 'Every subject belongs to Class 8');
    const enBooks = en.data.subjects.filter((s: any) => s.textbook);
    check(enBooks.length > 0 && enBooks.every((s: any) => ['ENGLISH', 'BOTH'].includes(s.textbook.medium) && s.textbook.gradeNumber === 8), `${enBooks.length} English/language textbooks, all Class 8`);
    check(en.data.subjects.every((s: any) => s.sections.every((x: any) => x.sectionId !== B)), 'Nepali section B is not mixed into the English view');

    console.log('\n🧪 Test 2: Nepali Medium subject selection (Class 8)');
    const ne = await api(P, 'GET', `/academic-planning/explorer?classId=${class8._id}&medium=NEPALI`);
    const neBooks = ne.data.subjects.filter((s: any) => s.textbook);
    check(neBooks.length > 0 && neBooks.every((s: any) => ['NEPALI', 'BOTH'].includes(s.textbook.medium) && s.textbook.gradeNumber === 8), `${neBooks.length} Nepali/language textbooks, all Class 8`);
    const mathEn = en.data.subjects.find((s: any) => s.logicalKey === 'MATHEMATICS');
    const mathNe = ne.data.subjects.find((s: any) => s.logicalKey === 'MATHEMATICS');
    check(mathEn && mathNe && mathEn.id === mathNe.id, 'Mathematics is one logical subject in both media');
    check(mathEn?.textbook && mathNe?.textbook && mathEn.textbook.id !== mathNe.textbook.id, `Different PDFs per medium: "${mathEn?.textbook?.title}" vs "${mathNe?.textbook?.title}"`);
    const saLib = await api(SA, 'GET', '/curriculum/library/grades/8/subjects?medium=NEPALI');
    check(saLib.status === 200, 'Super Admin can browse the Class 8 library');

    // ── Test 3: teacher allocation ───────────────────────────────────
    console.log('\n🧪 Test 3: Teacher allocation (Class 8 Section A)');
    const mathAlloc: any = await SubjectAllocation.findOne({ sectionId: A, centralSubjectId: mathEn.id, status: { $ne: 'INACTIVE' } }).populate('teacherId', 'fullName');
    check(!!mathAlloc, `Mathematics in 8A is allocated to ${mathAlloc?.teacherId?.fullName}`);
    const listed = await api(P, 'GET', `/academic-planning/allocations?sectionId=${A}`);
    check(listed.data.some((a: any) => a.subject?.id === mathEn.id && a.medium === 'ENGLISH' && a.status === 'ACTIVE'), 'Allocation record shows subject, medium and status');
    const teachers: any[] = await User.find({ institutionId: school._id, role: 'TEACHER', status: 'ACTIVE' });
    const otherTeacher = teachers.find((t) => String(t._id) !== String(mathAlloc.teacherId._id))!;
    const dup = await api(P, 'POST', '/academic-planning/allocations', { teacherId: String(otherTeacher._id), sectionId: A, subjectIds: [mathEn.id] });
    check(dup.status === 409 && dup.code === 'SUBJECT_ALREADY_ALLOCATED', 'Second teacher for the same subject is refused', dup);
    const wrongMedium = await api(P, 'POST', '/academic-planning/allocations', { teacherId: String(otherTeacher._id), sectionId: A, subjectIds: [mathEn.id], medium: 'NEPALI' });
    check(wrongMedium.status === 400 && wrongMedium.code === 'MEDIUM_MISMATCH', 'Allocation with the wrong medium is refused', wrongMedium);
    const g9 = (await api(P, 'GET', `/curriculum/library/grades/9/subjects?medium=ENGLISH`)).data;
    const g9Id = (g9.subjects || g9)[0]?.id;
    const wrongGrade = await api(P, 'POST', '/academic-planning/allocations', { teacherId: String(otherTeacher._id), sectionId: A, subjectIds: [g9Id] });
    check(wrongGrade.status === 400 && wrongGrade.code === 'SUBJECT_GRADE_MISMATCH', 'Class 9 subject cannot be allocated in Class 8', wrongGrade);

    // A library subject 8A does not offer yet: offer it, check the builder message, allocate, then undo.
    const spare = en.data.subjects.find((s: any) => !s.sections.find((x: any) => x.sectionId === A)?.offered);
    check(!!spare, `Found a Class 8 subject not yet offered in 8A: ${spare?.name}`);
    const notOffered = await api(P, 'POST', '/academic-planning/allocations', { teacherId: String(otherTeacher._id), sectionId: A, subjectIds: [spare.id] });
    check(notOffered.status === 400 && notOffered.code === 'SUBJECT_NOT_OFFERED', 'Allocation to a subject the section does not offer is refused', notOffered);
    const offer = await api(P, 'PUT', `/academic-planning/sections/${A}/subjects`, { subjects: [{ centralSubjectId: spare.id, periodsPerWeek: 0 }] });
    check(offer.status === 200, `Offered ${spare.name} in 8A`, offer.message);
    const ctxNoTeacher = await api(P, 'GET', `/timetable/builder/sections/${A}`);
    const spareInCtx = ctxNoTeacher.data.subjects.find((s: any) => s.id === spare.id);
    check(spareInCtx?.teachers.length === 0 && spareInCtx.message === 'No teacher has been assigned to this subject yet. Please allocate a teacher before creating the timetable entry.', 'Builder shows the "no teacher assigned" message');
    const alloc = await api(P, 'POST', '/academic-planning/allocations', { teacherId: String(otherTeacher._id), sectionId: A, subjectIds: [spare.id], medium: 'ENGLISH' });
    check(alloc.status === 200 && alloc.data[0]?.assignedBy === String(principal._id), `${otherTeacher.fullName} allocated to ${spare.name}; assignedBy recorded`, alloc);
    const ctxWithTeacher = await api(P, 'GET', `/timetable/builder/sections/${A}`);
    check(ctxWithTeacher.data.subjects.find((s: any) => s.id === spare.id)?.teachers.some((t: any) => t.id === String(otherTeacher._id)), 'Builder now lists the allocated teacher');
    const undo = await api(P, 'DELETE', `/academic-planning/allocations/${alloc.data[0]?.id}`);
    check(undo.status === 200, 'Temporary allocation removed', undo);
    await api(P, 'PUT', `/academic-planning/sections/${A}/subjects`, { subjects: [{ centralSubjectId: spare.id, periodsPerWeek: 0, isActive: false }] });

    // ── Test 4: timetable creation ───────────────────────────────────
    console.log('\n🧪 Test 4: Timetable creation (Class 8 Section A)');
    const ctx = await api(P, 'GET', `/timetable/builder/sections/${A}`);
    check(ctx.data.medium === 'ENGLISH', 'Section medium detected automatically: ENGLISH');
    const offered: any[] = await SectionSubject.find({ sectionId: A, isActive: true });
    check(ctx.data.subjects.length === offered.length && ctx.data.subjects.every((s: any) => offered.some((o) => String(o.centralSubjectId) === s.id)), `Only the ${offered.length} configured subjects load`);
    const live8A: any[] = await SubjectAllocation.find({ sectionId: A, status: { $ne: 'INACTIVE' } });
    check(
      ctx.data.subjects.every((s: any) => {
        const expected = live8A.filter((a) => String(a.centralSubjectId) === s.id).map((a) => String(a.teacherId)).sort();
        return JSON.stringify(s.teachers.map((t: any) => t.id).sort()) === JSON.stringify(expected);
      }),
      'Each subject lists exactly its allocated teachers'
    );
    const existingPending = await Timetable.findOne({ sectionId: A, status: { $in: ['DRAFT', 'UNDER_REVIEW'] } });
    if (existingPending) await api(P, 'POST', `/timetable/builder/timetables/${existingPending._id}/archive`);
    const draft = await api(P, 'POST', `/timetable/builder/sections/${A}/drafts`, {});
    check(draft.status === 200 && draft.data.timetable.status === 'DRAFT' && draft.data.copiedEntries > 0, `Draft v${draft.data?.timetable?.version} created from the published version (${draft.data?.copiedEntries} periods)`, draft);
    const D = draft.data.timetable.id;
    const mathTeacher = ctx.data.subjects.find((s: any) => s.id === mathEn.id).teachers[0];
    // A Mathematics period of 8A (Monday when there is one); the teacher is free there by construction.
    const mathSlots: any[] = await TimetableEntry.find({ timetableId: D, centralSubjectId: mathEn.id }).sort({ periodNumber: 1 });
    const slot = mathSlots.find((e) => e.dayOfWeek === 'MONDAY') || mathSlots[0];
    const DAY = slot.dayOfWeek;
    const PER = slot.periodNumber;
    const period = ctx.data.config.teachingPeriods.find((p: any) => p.periodNumber === PER);
    const save = await api(P, 'PUT', `/timetable/builder/timetables/${D}/entries`, { dayOfWeek: DAY, periodNumber: PER, centralSubjectId: mathEn.id, teacherId: mathTeacher.id });
    check(save.status === 200 && save.data.entry.startTime === period.startTime, `Mathematics with ${mathTeacher.name} saved on ${DAY} period ${PER} (${period.startTime})`, save);
    const notAllocated = await api(P, 'PUT', `/timetable/builder/timetables/${D}/entries`, { dayOfWeek: DAY, periodNumber: PER, centralSubjectId: mathEn.id, teacherId: String(otherTeacher._id) });
    check(notAllocated.status === 422 && notAllocated.code === 'TEACHER_NOT_ALLOCATED', 'A teacher not allocated to the subject is refused', notAllocated);

    // ── Test 5: holidays ─────────────────────────────────────────────
    console.log('\n🧪 Test 5: Holiday validation');
    for (const day of ['SATURDAY', 'SUNDAY']) {
      const r = await api(P, 'PUT', `/timetable/builder/timetables/${D}/entries`, { dayOfWeek: day, periodNumber: 2, centralSubjectId: mathEn.id, teacherId: mathTeacher.id });
      check(r.status === 422 && r.code === 'NON_WORKING_DAY', `${day} rejected: ${r.message}`, r);
    }

    // ── Test 6: break ────────────────────────────────────────────────
    console.log('\n🧪 Test 6: Break validation');
    const brk = ctx.data.config.periods.find((p: any) => p.isBreak);
    check(brk?.startTime === '11:45' && brk?.endTime === '12:15', `Midday break configured ${brk?.startTime}–${brk?.endTime}`);
    const onBreak = await api(P, 'PUT', `/timetable/builder/timetables/${D}/entries`, { dayOfWeek: 'TUESDAY', periodNumber: brk.periodNumber, centralSubjectId: mathEn.id, teacherId: mathTeacher.id });
    check(onBreak.status === 422 && onBreak.code === 'BREAK_PERIOD', `Break rejected: ${onBreak.message}`, onBreak);

    // ── Test 7: teacher conflict ─────────────────────────────────────
    console.log('\n🧪 Test 7: Teacher conflict');
    const pubOthers = await Timetable.find({ institutionId: school._id, status: 'PUBLISHED', sectionId: { $ne: s8A._id } }, '_id');
    const allocs8A: any[] = await SubjectAllocation.find({ sectionId: A, status: { $ne: 'INACTIVE' } });
    const busy: any = await TimetableEntry.findOne({ timetableId: { $in: pubOthers.map((t: any) => t._id) }, teacherId: { $in: allocs8A.map((a) => a.teacherId) } });
    check(!!busy, 'Found a teacher of 8A who teaches another section at a known period');
    const busyAlloc = allocs8A.find((a) => String(a.teacherId) === String(busy.teacherId));
    const clash = await api(P, 'PUT', `/timetable/builder/timetables/${D}/entries`, { dayOfWeek: busy.dayOfWeek, periodNumber: busy.periodNumber, centralSubjectId: String(busyAlloc.centralSubjectId), teacherId: String(busy.teacherId) });
    check(clash.status === 422 && clash.code === 'TEACHER_CLASH', `Clash rejected: ${clash.message}`, clash);
    const precheck = await api(P, 'POST', '/timetable/conflicts/check', { sectionId: A, dayOfWeek: busy.dayOfWeek, periodNumber: busy.periodNumber, centralSubjectId: String(busyAlloc.centralSubjectId), teacherId: String(busy.teacherId) });
    check(precheck.data?.hasConflict && precheck.data.errors.some((e: any) => e.code === 'TEACHER_CLASH'), 'Conflict pre-check reports the same clash');

    // ── Test 8: publish → teacher dashboard ──────────────────────────
    console.log('\n🧪 Test 8: Teacher dashboard integration');
    const val = await api(P, 'POST', `/timetable/builder/timetables/${D}/validate`);
    check(val.status === 200 && val.data.valid, `Draft validates (${val.data?.errors?.length} errors, ${val.data?.warnings?.length} warnings)`, val.data?.errors);
    const teacherUser: any = await User.findById(mathTeacher.id);
    const T = tokenFor(teacherUser);
    const teacherPublish = await api(T, 'POST', `/timetable/builder/timetables/${D}/publish`);
    check(teacherPublish.status === 403, 'A teacher cannot publish');
    const pub = await api(P, 'POST', `/timetable/builder/timetables/${D}/publish`);
    check(pub.status === 200 && pub.data.timetable.status === 'PUBLISHED' && pub.data.archivedVersions.length === 1, `Published v${pub.data?.timetable?.version}; v${pub.data?.archivedVersions} archived`, pub);
    const sched = await api(T, 'GET', '/timetable/teacher');
    const mine = sched.data.weeklyEntries.find((e: any) => e.dayOfWeek === DAY && e.periodNumber === PER && e.sectionId === A);
    check(mine && mine.gradeNumber === 8 && mine.subjectId === mathEn.id && mine.startTime === period.startTime && mine.endTime === period.endTime && mine.medium === 'ENGLISH', `My Teaching Schedule: ${DAY} ${mine?.startTime}–${mine?.endTime} Class ${mine?.gradeNumber} ${mine?.sectionName} ${mine?.subjectName} (${mine?.medium})`, mine);
    check(sched.data.workingDays.join() === 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY' && sched.data.weeklyEntries.every((e: any) => !['SATURDAY', 'SUNDAY'].includes(e.dayOfWeek)), 'Schedule is Monday–Friday only');
    const myClasses = await api(T, 'GET', '/teacher/classes');
    check(myClasses.data.some((a: any) => String(a.centralSubjectId?._id || a.centralSubjectId?.id) === mathEn.id && String(a.sectionId?._id || a.sectionId?.id) === A), 'My Subjects lists Mathematics, Class 8 A');

    // ── Test 9: textbook ─────────────────────────────────────────────
    console.log('\n🧪 Test 9: Textbook integration');
    const ws = await api(T, 'GET', `/teacher/workspace/${A}/${mathEn.id}`);
    const book = ws.data?.digitalTextbook?.textbook;
    check(book && book.gradeNumber === 8 && ['ENGLISH', 'BOTH'].includes(book.medium) && book.logicalKey === 'MATHEMATICS', `Digital Textbook: "${book?.title}" (Class ${book?.gradeNumber}, ${book?.medium})`, ws.data?.digitalTextbook);
    check(book && book.id !== mathNe.textbook.id, 'Not the Nepali medium edition');
    const access = await api(T, 'POST', `/curriculum/textbooks/${book.id}/access`);
    check(access.status === 200 && access.data.url.includes('access='), 'Signed PDF URL issued');
    const pdfRes = await fetch(base.replace('/api/v1', '') + access.data.url, { headers: { Range: 'bytes=0-7' } });
    const head = Buffer.from(await pdfRes.arrayBuffer()).toString('latin1');
    check([200, 206].includes(pdfRes.status) && head.startsWith('%PDF'), `PDF streams (${pdfRes.status}, starts with ${head.slice(0, 5)})`);
    const unsigned = await fetch(`${base}/curriculum/textbooks/${book.id}/pdf`);
    check(unsigned.status === 401, 'PDF without a token is refused');

    // ── Test 10: Smart Board ─────────────────────────────────────────
    console.log('\n🧪 Test 10: Smart Board integration');
    const tb: any = await Textbook.findById(book.id);
    const file = resolveLibraryFile(tb.sourceRelativePath);
    const hashBefore = sha256(file);
    const sb = await api(T, 'POST', '/smartboard/sessions', { classId: String(class8._id), sectionId: A, subjectId: mathEn.id, chapterNumber: 1 });
    check(sb.status === 201 && sb.data.textbook?.id === book.id, `Session started with "${sb.data?.textbook?.title}" at page ${sb.data?.textbook?.page}`, sb);
    const launch = new URL('http://x' + sb.data.launcherUrl);
    check(launch.pathname === '/smartboard/index.html' && launch.searchParams.get('textbookId') === book.id && launch.searchParams.get('medium') === 'ENGLISH' && launch.searchParams.get('sectionId') === A, 'Launcher passes textbook, medium, class, section and subject');
    const boardPage = await fetch(base.replace('/api/v1', '') + '/smartboard/index.html');
    check(boardPage.status === 200, 'Existing Smart Board page is served');
    const boardPdf = await fetch(base.replace('/api/v1', '') + launch.searchParams.get('pdf'), { headers: { Range: 'bytes=0-4' } });
    check([200, 206].includes(boardPdf.status), 'Smart Board PDF link opens the textbook');
    const wrongBook = await api(T, 'POST', '/smartboard/sessions', { classId: String(class8._id), sectionId: A, subjectId: mathEn.id, textbookId: mathNe.textbook.id });
    check(wrongBook.status === 400 && wrongBook.code === 'TEXTBOOK_MISMATCH', 'Launching with the Nepali edition in an English section is refused', wrongBook);
    const note = await api(T, 'POST', '/smartboard/annotations', { classId: String(class8._id), sectionId: A, subjectId: mathEn.id, textbookId: book.id, pageNumber: 1, title: 'E2E annotation', annotationData: { strokes: [{ x: 1, y: 1 }] } });
    check([200, 201].includes(note.status), 'Annotation saved', note);
    check(sha256(file) === hashBefore, 'Original textbook PDF unchanged after annotating');
    if (note.data?.id || note.data?._id) await api(T, 'DELETE', `/smartboard/annotations/${note.data.id || note.data._id}`);
    if (sb.data?.session?.id) await api(T, 'POST', `/smartboard/sessions/${sb.data.session.id}/end`, {});

    // ── Test 11: modify a published period ───────────────────────────
    console.log('\n🧪 Test 11: Timetable modification');
    const d2 = await api(P, 'POST', `/timetable/builder/sections/${A}/drafts`, {});
    const D2 = d2.data.timetable.id;
    const currentRoom = (await TimetableEntry.findOne({ timetableId: D2, dayOfWeek: DAY, periodNumber: PER }))?.roomNumber;
    const newRoom = currentRoom === 'Room 8A-Maths' ? 'Classroom' : 'Room 8A-Maths';
    const change = await api(P, 'PUT', `/timetable/builder/timetables/${D2}/entries`, { dayOfWeek: DAY, periodNumber: PER, centralSubjectId: mathEn.id, teacherId: mathTeacher.id, roomNumber: newRoom });
    check(change.status === 200, `${DAY} period ${PER} moved to "${newRoom}" in draft v${d2.data?.timetable?.version}`, change);
    const before = new Date();
    const pub2 = await api(P, 'POST', `/timetable/builder/timetables/${D2}/publish`);
    check(pub2.status === 200, `Revised timetable v${pub2.data?.timetable?.version} published`, pub2);
    const sched2 = await api(T, 'GET', '/timetable/teacher');
    check(sched2.data.weeklyEntries.find((e: any) => e.dayOfWeek === DAY && e.periodNumber === PER && e.sectionId === A)?.roomNumber === newRoom, 'Teacher dashboard shows the new room');
    const classView = await api(P, 'GET', `/timetable/student/${A}`);
    check(classView.data.timetable?.id === D2 && classView.data.weeklyEntries.find((e: any) => e.dayOfWeek === DAY && e.periodNumber === PER)?.roomNumber === newRoom, 'Class timetable shows the revision');
    const enrol: any = await StudentEnrollment.findOne({ sectionId: A, status: 'ENROLLED' });
    const student: any = enrol && (await User.findById(enrol.studentId));
    if (student) {
      const S = tokenFor(student);
      const sv = await api(S, 'GET', `/timetable/student/${A}`);
      check(sv.status === 200 && sv.data.weeklyEntries.find((e: any) => e.dayOfWeek === DAY && e.periodNumber === PER)?.roomNumber === newRoom, 'Student timetable shows the revision');
      const so = await api(S, 'GET', '/student/overview');
      check(so.status === 200 && so.data.todayTimetable.every((e: any) => String(e.timetableId) === D2), 'Student dashboard reads only the published version');
      const subj = await api(S, 'GET', '/student/subjects');
      const sMath = subj.data?.find((x: any) => String(x.subject?._id || x.subject?.id) === mathEn.id);
      check(sMath?.digitalTextbook?.textbook?.id === book.id, 'Student sees the same English Mathematics textbook');
      const otherSection = await api(S, 'GET', `/timetable/student/${B}`);
      check(otherSection.status === 403, "A student cannot open another section's timetable");
      const nepaliBook = await api(S, 'POST', `/curriculum/textbooks/${mathNe.textbook.id}/access`);
      check(nepaliBook.status === 403, 'English-medium student is refused the Nepali edition');
    } else check(false, 'An enrolled 8A student exists');
    const hist = await api(P, 'GET', `/timetable/history?sectionId=${A}`);
    check(hist.data.some((c: any) => c.changeType === 'PUBLISH' && c.timetableId === D2) && hist.data.some((c: any) => c.changeType === 'UPDATE' && c.timetableId === D2), 'Change history records the edit and the publication');
    const notif = await Notification.findOne({ recipientId: mathTeacher.id, type: 'TIMETABLE_PUBLISHED', createdAt: { $gte: before } });
    check(!!notif, 'Teacher received a "Timetable published" notification');

    // ── Test 12: access control ──────────────────────────────────────
    console.log('\n🧪 Test 12: Access control');
    const notMine: any = await SubjectAllocation.findOne({ sectionId: B, teacherId: { $ne: teacherUser._id }, status: { $ne: 'INACTIVE' }, centralSubjectId: { $nin: (await SubjectAllocation.find({ teacherId: teacherUser._id })).map((a: any) => a.centralSubjectId) } });
    const ws403 = await api(T, 'GET', `/teacher/workspace/${B}/${notMine.centralSubjectId}`);
    check(ws403.status === 403, "Teacher cannot open an unassigned subject's workspace", ws403);
    const anyOtherBook: any = await Textbook.findOne({ gradeNumber: 12, status: { $ne: 'ARCHIVED' } });
    const tb403 = await api(T, 'POST', `/curriculum/textbooks/${anyOtherBook._id}/access`);
    check(tb403.status === 403, `Teacher is refused a textbook they do not teach (${anyOtherBook.title})`);
    const sb403 = await api(T, 'POST', '/smartboard/sessions', { classId: String(class8._id), sectionId: B, subjectId: String(notMine.centralSubjectId) });
    check(sb403.status === 403, 'Teacher cannot launch the Smart Board for an unassigned subject');
    if (other) {
      const otherSection: any = await Section.findOne({ classId: { $in: (await Class.find({ institutionId: other._id })).map((c: any) => c._id) } });
      if (otherSection) {
        const x1 = await api(P, 'GET', `/timetable/student/${otherSection._id}`);
        check(x1.status === 403, "Principal cannot read another school's class timetable", x1);
        const x2 = await api(P, 'PATCH', `/academic-planning/sections/${otherSection._id}/medium`, { medium: 'NEPALI' });
        check(x2.status === 403, "Principal cannot change another school's section", x2);
      }
    }
    const saWrite = await api(SA, 'POST', `/timetable/builder/sections/${A}/drafts`, {}, { 'x-institution-id': String(school._id) });
    check(saWrite.status === 403 && saWrite.code === 'SUPER_ADMIN_NOT_AUTHORISED', 'Super Admin cannot edit the school timetable without authorisation', saWrite);
    const tAlloc = await api(T, 'POST', '/academic-planning/allocations', { teacherId: mathTeacher.id, sectionId: A, subjectIds: [mathEn.id] });
    check(tAlloc.status === 403, 'Teachers cannot allocate subjects');
  } finally {
    server.close();
    await disconnectDB();
  }

  console.log(`\n${failures.length ? '❌' : '🎉'} ${passed} passed, ${failures.length} failed`);
  if (failures.length) {
    failures.forEach((f) => console.log(`   - ${f}`));
    process.exitCode = 1;
  }
}

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
