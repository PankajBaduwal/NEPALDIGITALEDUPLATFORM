// Create / edit / delete lifecycle checks against a COPY of the database (backend on :5056)
const B = 'http://localhost:5056/api/v1';
const results = [];
const tokens = {};
async function call(method, path, token, body) {
  const r = await fetch(B + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  return { status: r.status, ok: r.ok && j.success !== false, data: j.data, msg: j.message || (typeof j.error === 'string' ? j.error : j.error?.message) };
}
const check = (name, r, extra) => { results.push({ name, ok: r.ok, status: r.status, msg: r.ok ? '' : r.msg }); console.log((r.ok ? 'PASS ' : 'FAIL ') + name + (r.ok ? '' : `  [${r.status}] ${r.msg}`) + (extra || '')); return r; };
async function login(u) { const r = await call('POST', '/auth/login', null, { identifier: u, username: u, password: 'DemoPass123!' }); tokens[u] = r.data?.accessToken; return r.data?.user; }
const id = (o) => o?.id || o?._id;

(async () => {
  const me = await login('dhambojhi_t_29');
  const T = tokens['dhambojhi_t_29'];
  const al = check('teacher: my allocations', await call('GET', '/academic/my-allocations', T));
  const a0 = (al.data || [])[0] || {};
  const sectionId = id(a0.section) || a0.sectionId?.id || a0.sectionId;
  const centralSubjectId = id(a0.subject) || a0.centralSubjectId?.id || a0.centralSubjectId;
  console.log('   using section', sectionId, 'subject', centralSubjectId);

  // ── Quiz lifecycle ──
  const q = check('teacher: create quiz', await call('POST', '/quizzes', T, {
    sectionId, centralSubjectId, title: 'CRUD check quiz', description: 'lifecycle', durationMinutes: 10, medium: 'ENGLISH',
    questions: [
      { questionText: 'Capital of Nepal?', questionType: 'MCQ', options: [{ id: 'opt_1', text: 'Kathmandu' }, { id: 'opt_2', text: 'Pokhara' }, { id: 'opt_3', text: 'Biratnagar' }, { id: 'opt_4', text: 'Lalitpur' }], correctAnswers: 'opt_1', marks: 1 },
      { questionText: '2 + 2 = 4', questionType: 'TRUE_FALSE', options: [{ id: 'opt_true', text: 'True' }, { id: 'opt_false', text: 'False' }], correctAnswers: 'opt_true', marks: 1 },
    ],
  }));
  const quizId = id(q.data);
  if (quizId) {
    check('teacher: edit quiz', await call('PUT', `/quizzes/${quizId}`, T, { title: 'CRUD check quiz (edited)', durationMinutes: 15 }));
    check('teacher: publish quiz', await call('PATCH', `/quizzes/${quizId}/publish`, T));
    const list = check('teacher: list own quizzes', await call('GET', '/quizzes/teacher', T));
    const found = (Array.isArray(list.data) ? list.data : list.data?.quizzes || []).find((x) => id(x) === quizId);
    results.push({ name: 'teacher: edited quiz appears in list', ok: !!found && /edited/.test(found.title) });
    console.log((found && /edited/.test(found.title) ? 'PASS ' : 'FAIL ') + 'teacher: edited quiz appears in list');
  }
  // ── Student takes the quiz ──
  await login('dhambojhi_s_g09');
  const S = tokens['dhambojhi_s_g09'];
  const sq = check('student: list quizzes', await call('GET', '/quizzes/student', S));
  const sqList = Array.isArray(sq.data) ? sq.data : sq.data?.quizzes || [];
  const mine = sqList.find((x) => id(x) === quizId);
  results.push({ name: 'student: sees the published quiz', ok: !!mine });
  console.log((mine ? 'PASS ' : 'FAIL ') + 'student: sees the published quiz');
  if (mine) {
    const full = check('student: open quiz', await call('GET', `/quizzes/${quizId}`, S));
    const qs = full.data?.questions || [];
    check('student: submit quiz attempt', await call('POST', `/quizzes/${quizId}/attempt`, S, {
      answers: qs.map((x) => ({ questionId: id(x) || x.questionId, selectedAnswers: x.options?.[0]?.id ? [x.options[0].id] : [], answer: x.options?.[0]?.id })),
      timeSpentSeconds: 30,
    }));
  }

  // ── Assignment lifecycle ──
  const due = new Date(Date.now() + 7 * 864e5).toISOString();
  const asg = check('teacher: create assignment', await call('POST', '/assignments', T, {
    sectionId, centralSubjectId, title: 'CRUD check assignment', description: 'Write three sentences about Kathmandu.', dueDate: due, maxScore: 10, submissionType: 'ONLINE_TEXT', status: 'ACTIVE',
  }));
  const asgId = id(asg.data);
  if (asgId) {
    check('teacher: edit assignment', await call('PUT', `/assignments/${asgId}`, T, { title: 'CRUD check assignment (edited)', maxScore: 20 }));
    const sub = check('student: submit assignment', await call('POST', `/assignments/${asgId}/submit`, S, { content: 'Kathmandu is the capital. It has temples. It is crowded.' }));
    const subs = check('teacher: list submissions', await call('GET', `/assignments/${asgId}/submissions`, T));
    const sid = id((Array.isArray(subs.data) ? subs.data : subs.data?.submissions || [])[0]);
    if (sid) check('teacher: grade submission', await call('PATCH', `/assignments/submissions/${sid}/grade`, T, { marksObtained: 8, feedback: 'Good work' }));
    else { results.push({ name: 'teacher: grade submission', ok: false, msg: 'no submission to grade' }); console.log('FAIL teacher: grade submission  (no submission found)'); }
  }

  // ── Attendance (roll call for a section) ──
  const roster = check('teacher: section roster', await call('GET', `/academic/sections/${sectionId}/students`, T));
  const stu = Array.isArray(roster.data) ? roster.data : roster.data?.students || [];
  const records = stu.map((s) => ({ studentId: id(s.student || s) || s.studentId, status: 'PRESENT' }));
  check('teacher: record attendance', await call('POST', '/teacher/attendance', T, { sectionId, date: new Date().toISOString().slice(0, 10), records }));
  check('teacher: attendance history', await call('GET', `/teacher/attendance/${sectionId}`, T));

  // ── Announcements & notifications ──
  const ann = check('teacher: post announcement', await call('POST', '/school-admin/announcements', T, { title: 'CRUD check notice', content: 'Test notice body', targetAudience: 'STUDENTS', announcementType: 'CLASS_OVERALL', sectionId, className: 'Grade 9 A' }));
  const sAnn = check('student: read announcements', await call('GET', '/student/announcements', S));
  const nots = check('student: notifications', await call('GET', '/notifications', S));
  const n0 = id((Array.isArray(nots.data) ? nots.data : nots.data?.notifications || [])[0]);
  if (n0) check('student: mark notification read', await call('PATCH', `/notifications/${n0}/read`, S));
  check('student: mark all read', await call('POST', '/notifications/mark-all-read', S));

  // ── Principal: academic calendar CRUD ──
  await login('dhambojhi_principal');
  const P = tokens['dhambojhi_principal'];
  const ev = check('principal: create calendar event', await call('POST', '/calendar', P, { title: 'CRUD check event', date: '2083-05-01', term: 'FIRST', type: 'MEETING', description: 'x' }));
  const evId = id(ev.data);
  if (evId) {
    check('principal: edit calendar event', await call('PUT', `/calendar/${evId}`, P, { title: 'CRUD check event (edited)' }));
    check('principal: delete calendar event', await call('DELETE', `/calendar/${evId}`, P));
    const after = await call('GET', '/calendar', P);
    const still = (after.data || []).some((e) => id(e) === evId);
    results.push({ name: 'principal: deleted event is gone', ok: !still }); console.log((!still ? 'PASS ' : 'FAIL ') + 'principal: deleted event is gone');
  }

  // ── School admin: people, allocations, status toggles ──
  await login('dhambojhi_admin');
  const A = tokens['dhambojhi_admin'];
  const suffix = Date.now().toString().slice(-6);
  const t = check('admin: create teacher', await call('POST', '/school-admin/teachers', A, { fullName: 'CRUD Teacher ' + suffix, username: 'crud_t_' + suffix, email: `crud_t_${suffix}@dhambojhi.edu.np.test` }));
  const newTeacherId = id(t.data?.teacher || t.data);
  const structure = await call('GET', '/school-admin/structure', A);
  const yearId = id(structure.data?.academicYear) || structure.data?.academicYearId || (structure.data?.academicYears || [])[0]?.id;
  const stud = check('admin: register student', await call('POST', '/school-admin/students', A, { fullName: 'CRUD Student ' + suffix, username: 'crud_s_' + suffix, sectionId, academicYearId: yearId, rollNumber: 900 + Number(suffix.slice(-2)), admissionNumber: 'CRUD-' + suffix, guardianName: 'Guardian' }));
  if (newTeacherId) {
    check('admin: allocate subject to new teacher', await call('POST', '/school-admin/allocations', A, { sectionId, centralSubjectId, teacherId: newTeacherId }));
    check('admin: deactivate teacher', await call('PATCH', `/school-admin/teachers/${newTeacherId}/status`, A, { isActive: false }));
    check('admin: reactivate teacher', await call('PATCH', `/school-admin/teachers/${newTeacherId}/status`, A, { isActive: true }));
  }
  const tl = check('admin: teachers list shows new teacher', await call('GET', '/school-admin/teachers', A));
  const seen = (Array.isArray(tl.data) ? tl.data : tl.data?.teachers || []).some((x) => id(x) === newTeacherId);
  results.push({ name: 'admin: new teacher in list', ok: seen }); console.log((seen ? 'PASS ' : 'FAIL ') + 'admin: new teacher in list');
  check('admin/principal: HOD allocations endpoint', await call('GET', '/school-admin/allocations', A));
  check('admin/principal: HOD subject overview endpoint', await call('GET', '/school-admin/subjects', A));
  check('admin: school announcement (institution-wide)', await call('POST', '/school-admin/announcements', A, { title: 'CRUD admin notice', content: 'body', targetAudience: 'ALL', announcementType: 'INSTITUTIONAL' }));

  // ── Super admin: reads that gate every provisioning screen ──
  await login('superadmin');
  const SA = tokens['superadmin'];
  check('super admin: institutions list', await call('GET', '/admin/institutions', SA));
  check('super admin: registration requests', await call('GET', '/admin/registration-requests?status=PENDING', SA));
  check('super admin: AI index status', await call('GET', '/ai/index-status', SA));
  const aiS = await call('GET', '/ai/index-status', S);
  results.push({ name: 'student is refused the AI index status', ok: aiS.status === 403 }); console.log((aiS.status === 403 ? 'PASS ' : 'FAIL ') + 'student is refused the AI index status');
  globalThis.ctx = { sectionId, centralSubjectId, quizId, T };
})().then(() => { const f = results.filter((r) => !r.ok); console.log(`\n${results.length - f.length}/${results.length} passed`); }).catch((e) => console.error('script error', e));
