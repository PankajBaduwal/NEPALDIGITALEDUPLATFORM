import PDFDocument from 'pdfkit';
import {
  User, Institution, Section, Class, AcademicYear, StudentEnrollment, ExamAssessment, StudentMark, AttendanceRecord, TimetableEntry, TransferCertificate, Examination,
} from '../../models';
import { TimetableBuilderService } from '../timetable/timetable-builder.service';
import { AuditService } from '../../common/services/audit.service';
import { SealService, fail, isId, isoOk } from './principal-tools.service';

type Seal = Awaited<ReturnType<typeof SealService.buffers>>;
const TERMINAL = ['TERMINAL', 'FINAL'];
const APPROVED = ['APPROVED', 'PUBLISHED'];
const NAVY = '#0f172a', GREEN = '#047857', GREY = '#64748b';
const fmtDate = (d: any) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const gradeOf = (p: number) => (p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B+' : p >= 60 ? 'B' : p >= 50 ? 'C+' : p >= 40 ? 'C' : p >= 35 ? 'D' : 'NG');
const r1 = (n: number) => Math.round(n * 10) / 10;

function toBuffer(build: (doc: PDFKit.PDFDocument) => void, opts: PDFKit.PDFDocumentOptions = { size: 'A4', margin: 40 }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument(opts);
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    try { build(doc); doc.end(); } catch (e) { reject(e); }
  });
}

function letterhead(doc: PDFKit.PDFDocument, inst: any, title: string, subtitle?: string) {
  const w = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const x = doc.page.margins.left;
  doc.font('Helvetica-Bold').fontSize(17).fillColor(NAVY).text(inst.name || 'School', x, doc.y, { width: w, align: 'center' });
  const addr = [inst.street, inst.ward ? `Ward ${inst.ward}` : '', inst.localLevel, inst.district, inst.province].filter(Boolean).join(', ');
  doc.font('Helvetica').fontSize(9).fillColor(GREY);
  if (addr) doc.text(addr, x, doc.y, { width: w, align: 'center' });
  const ids = [inst.emisCode ? `EMIS Code: ${inst.emisCode}` : '', inst.registrationNumber ? `Reg. No: ${inst.registrationNumber}` : '', inst.phone ? `Phone: ${inst.phone}` : '', inst.email || ''].filter(Boolean).join('   |   ');
  if (ids) doc.text(ids, x, doc.y, { width: w, align: 'center' });
  doc.moveDown(0.4);
  doc.moveTo(x, doc.y).lineTo(x + w, doc.y).lineWidth(1.2).strokeColor(GREEN).stroke();
  doc.moveDown(0.6);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(GREEN).text(title.toUpperCase(), x, doc.y, { width: w, align: 'center' });
  if (subtitle) doc.font('Helvetica').fontSize(9.5).fillColor(GREY).text(subtitle, x, doc.y, { width: w, align: 'center' });
  doc.fillColor('#000').moveDown(0.8);
}

/** Left: preparer line. Right: the principal's signature over the printed name. The stamp is added only when `official`. */
function signBlock(doc: PDFKit.PDFDocument, seal: Seal, official: boolean, leftLabel: string) {
  if (doc.y > doc.page.height - 190) doc.addPage();
  const y = doc.y + 30;
  const left = doc.page.margins.left, right = doc.page.width - doc.page.margins.right;
  doc.moveTo(left, y + 55).lineTo(left + 150, y + 55).lineWidth(0.6).strokeColor('#000').stroke();
  doc.font('Helvetica').fontSize(9).fillColor('#000').text(leftLabel, left, y + 59, { width: 170 });
  if (official && seal.stamp) { try { doc.image(seal.stamp, (left + right) / 2 - 40, y - 8, { fit: [86, 86] }); } catch { /* unreadable image is skipped */ } }
  if (official && seal.signature) { try { doc.image(seal.signature, right - 150, y + 2, { fit: [140, 50] }); } catch { /* skipped */ } }
  doc.moveTo(right - 160, y + 55).lineTo(right, y + 55).stroke();
  doc.font('Helvetica-Bold').fontSize(9).text(seal.signerName || seal.signerTitle, right - 160, y + 59, { width: 160, align: 'center' });
  if (seal.signerName) doc.font('Helvetica').fontSize(8.5).fillColor(GREY).text(seal.signerTitle, right - 160, doc.y, { width: 160, align: 'center' });
  doc.fillColor('#000');
  if (!official) doc.font('Helvetica-Oblique').fontSize(8).fillColor('#b91c1c').text('Not stamped: the results are not yet approved by the principal.', left, y + 95, { width: right - left, align: 'center' }).fillColor('#000');
}

function watermark(doc: PDFKit.PDFDocument, text: string) {
  doc.save();
  doc.rotate(-35, { origin: [doc.page.width / 2, doc.page.height / 2] });
  doc.font('Helvetica-Bold').fontSize(64).fillColor('#e2e8f0').opacity(0.55).text(text, 0, doc.page.height / 2 - 30, { width: doc.page.width, align: 'center' });
  doc.opacity(1).restore();
  doc.fillColor('#000');
  doc.x = doc.page.margins.left; doc.y = doc.page.margins.top;
}

async function instOf(institutionId: string) {
  const i: any = await Institution.findById(institutionId).lean();
  if (!i) throw fail(404, 'School not found.', 'NOT_FOUND');
  return i;
}
async function currentYear(institutionId: string) {
  return (await AcademicYear.findOne({ institutionId, isCurrent: true }).lean()) || (await AcademicYear.findOne({ institutionId }).sort({ createdAt: -1 }).lean());
}

// ── Annual School Performance Report ────────────────────────────────────────────────────
export const AnnualReportService = {
  async collect(institutionId: string) {
    const [inst, year]: [any, any] = await Promise.all([instOf(institutionId), currentYear(institutionId)]);
    const yearId = year?._id;
    const classes: any[] = await Class.find({ institutionId }).sort({ gradeNumber: 1 }).lean();
    const sections: any[] = await Section.find({ classId: { $in: classes.map((c) => c._id) }, ...(yearId ? { academicYearId: yearId } : {}) }).lean();
    const secIds = sections.map((s) => s._id);
    const classOf = new Map(classes.map((c) => [String(c._id), c]));
    const [teachers, enrollments, pubIds]: [any[], any[], any[]] = await Promise.all([
      User.find({ institutionId, role: 'TEACHER', status: 'ACTIVE' }, 'fullName').lean() as any,
      StudentEnrollment.find({ sectionId: { $in: secIds }, status: 'ENROLLED' }).populate('studentId', 'fullName').lean() as any,
      TimetableBuilderService.publishedTimetableIds({ institutionId }),
    ]);
    const entries: any[] = await TimetableEntry.find({ timetableId: { $in: pubIds } }, 'teacherId centralSubjectId').lean() as any;
    const faculty = {
      teachers: teachers.length,
      classTeachers: new Set(sections.filter((s) => s.classTeacherId).map((s) => String(s.classTeacherId))).size,
      sections: sections.length, sectionsWithClassTeacher: sections.filter((s) => s.classTeacherId).length,
      subjects: new Set(entries.map((e) => String(e.centralSubjectId))).size,
      avgPeriods: teachers.length ? r1(entries.length / teachers.length) : 0,
      withoutTimetable: teachers.filter((t) => !entries.some((e) => String(e.teacherId) === String(t._id))).length,
    };
    const secClass = new Map(sections.map((s) => [String(s._id), classOf.get(String(s.classId))]));
    const enrollment = classes.map((c) => {
      const secs = sections.filter((s) => String(s.classId) === String(c._id));
      return { grade: c.gradeNumber, name: c.name || `Class ${c.gradeNumber}`, sections: secs.length, students: enrollments.filter((e) => String(secClass.get(String(e.sectionId))?._id) === String(c._id)).length };
    }).filter((r) => r.sections > 0);

    // attendance over the school year
    const att: any[] = await AttendanceRecord.aggregate([
      { $match: { institutionId: inst._id, ...(year?.startDate ? { date: { $gte: year.startDate, ...(year.endDate ? { $lte: year.endDate } : {}) } } : {}) } },
      { $unwind: '$records' }, { $group: { _id: '$records.status', n: { $sum: 1 } } },
    ]);
    const attTotal = att.reduce((a, x) => a + x.n, 0);
    const attPresent = att.filter((x) => ['PRESENT', 'LATE'].includes(x._id)).reduce((a, x) => a + x.n, 0);
    const attendanceRate = attTotal ? r1((attPresent / attTotal) * 100) : null;

    // results: terminal papers that the principal has approved or published
    const allTerm: any[] = await ExamAssessment.find({ institutionId, sectionId: { $in: secIds }, examType: { $in: TERMINAL } }).lean();
    const terms = allTerm.filter((a) => APPROVED.includes(a.workflowStatus));
    const marks: any[] = terms.length ? await StudentMark.find({ assessmentId: { $in: terms.map((a) => a._id) } }).lean() as any : [];
    const asmt = new Map(terms.map((a) => [String(a._id), a]));
    const perStudent = new Map<string, { sectionId: string; got: number; max: number; fail: boolean; name: string }>();
    const nameOf = new Map(enrollments.map((e) => [String(e.studentId?._id), e.studentId?.fullName || '']));
    for (const m of marks) {
      const a = asmt.get(String(m.assessmentId)); if (!a) continue;
      const k = String(m.studentId);
      const s = perStudent.get(k) || { sectionId: String(a.sectionId), got: 0, max: 0, fail: false, name: nameOf.get(k) || '' };
      s.max += Number(a.totalMarks) || 100;
      if (m.isAbsent) s.fail = true; else { s.got += Number(m.marksObtained) || 0; if ((Number(m.marksObtained) || 0) < (Number(a.passMarks) || 0)) s.fail = true; }
      perStudent.set(k, s);
    }
    const students = [...perStudent.entries()].map(([id, s]) => ({ id, ...s, percent: s.max ? r1((s.got / s.max) * 100) : 0, cls: secClass.get(s.sectionId) }));
    const byClass = classes.map((c) => {
      const list = students.filter((s) => String(s.cls?._id) === String(c._id));
      if (!list.length) return null;
      const passed = list.filter((s) => !s.fail).length;
      const top = [...list].sort((a, b) => b.percent - a.percent)[0];
      return { grade: c.gradeNumber, label: c.name || `Class ${c.gradeNumber}`, short: String(c.name || c.gradeNumber).replace(/^Grade\s*/i, '').replace(/\s*-\s*(\w)\w*/, '$1'), appeared: list.length, passed, passRate: r1((passed / list.length) * 100), avg: r1(list.reduce((a, s) => a + s.percent, 0) / list.length), topper: top.name, topperPercent: top.percent };
    }).filter(Boolean) as Array<{ grade: number; label: string; short: string; appeared: number; passed: number; passRate: number; avg: number; topper: string; topperPercent: number }>;
    const bySection = sections.map((sec) => {
      const list = students.filter((s) => s.sectionId === String(sec._id));
      if (!list.length) return null;
      const c = classOf.get(String(sec.classId));
      return { label: `${c?.name || `Class ${c?.gradeNumber ?? ''}`} ${sec.name}`.trim(), grade: c?.gradeNumber ?? 0, appeared: list.length, passRate: r1((list.filter((s) => !s.fail).length / list.length) * 100), avg: r1(list.reduce((a, s) => a + s.percent, 0) / list.length) };
    }).filter(Boolean) as Array<{ label: string; grade: number; appeared: number; passRate: number; avg: number }>;
    bySection.sort((a, b) => b.avg - a.avg);
    const top = [...students].sort((a, b) => b.percent - a.percent).slice(0, 10).map((s) => ({ name: s.name, cls: `Class ${s.cls?.gradeNumber ?? ''}`, percent: s.percent }));
    const overall = students.length ? { appeared: students.length, passed: students.filter((s) => !s.fail).length, passRate: r1((students.filter((s) => !s.fail).length / students.length) * 100) } : null;
    return {
      inst, year: year?.name || '', faculty, enrollment, totalStudents: enrollments.length, attendanceRate, byClass, bySection, top, overall,
      results: { approvedPapers: terms.length, pendingPapers: allTerm.length - terms.length },
    };
  },

  async pdf(institutionId: string): Promise<Buffer> {
    const d = await this.collect(institutionId);
    const seal = await SealService.buffers(institutionId);
    return toBuffer((doc) => {
      const L = doc.page.margins.left, W = doc.page.width - L - doc.page.margins.right;
      letterhead(doc, d.inst, 'Annual School Performance Report', `Academic year ${d.year || '-'}   |   Prepared ${fmtDate(new Date())}`);
      const h2 = (t: string) => { if (doc.y > doc.page.height - 120) doc.addPage(); doc.moveDown(0.5).font('Helvetica-Bold').fontSize(12).fillColor(NAVY).text(t, L, doc.y); doc.moveDown(0.25).fillColor('#000'); };
      const table = (heads: string[], widths: number[], rows: Array<Array<string | number>>) => {
        let y = doc.y;
        const draw = (cells: Array<string | number>, bold: boolean, fill?: string) => {
          if (y > doc.page.height - doc.page.margins.bottom - 24) { doc.addPage(); y = doc.page.margins.top; }
          let x = L;
          if (fill) doc.rect(L, y, widths.reduce((a, b) => a + b, 0), 18).fill(fill).fillColor('#000');
          cells.forEach((c, i) => { doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.5).fillColor('#000').text(String(c), x + 3, y + 5, { width: widths[i] - 6, height: 12, lineBreak: false, ellipsis: true, align: i === 0 ? 'left' : 'center' }); x += widths[i]; });
          doc.moveTo(L, y + 18).lineTo(L + widths.reduce((a, b) => a + b, 0), y + 18).lineWidth(0.3).strokeColor('#cbd5e1').stroke();
          y += 18;
        };
        draw(heads, true, '#d1fae5');
        rows.forEach((r) => draw(r, false));
        doc.y = y + 4; doc.x = L;
      };

      h2('1. Students and attendance');
      doc.font('Helvetica').fontSize(10).text(`Enrolled students: ${d.totalStudents}   |   Sections: ${d.faculty.sections}   |   Attendance rate this year: ${d.attendanceRate === null ? 'no attendance recorded' : `${d.attendanceRate}%`}`, L, doc.y);
      doc.moveDown(0.4);
      table(['Class', 'Sections', 'Students'], [200, 120, 120], d.enrollment.map((e) => [e.name, e.sections, e.students]));

      h2('2. Faculty summary');
      doc.font('Helvetica').fontSize(10).text(`Active teachers: ${d.faculty.teachers}`, L, doc.y)
        .text(`Class teachers designated: ${d.faculty.sectionsWithClassTeacher} of ${d.faculty.sections} sections`)
        .text(`Subjects timetabled: ${d.faculty.subjects}   |   Average weekly periods per teacher: ${d.faculty.avgPeriods}`)
        .text(`Teachers with no periods in the published timetable: ${d.faculty.withoutTimetable}`);

      h2('3. Terminal examination results');
      if (!d.byClass.length) {
        doc.font('Helvetica').fontSize(10).fillColor(GREY).text(`No approved terminal results yet. ${d.results.pendingPapers ? `${d.results.pendingPapers} paper(s) are still waiting for approval.` : ''}`, L, doc.y).fillColor('#000');
      } else {
        doc.font('Helvetica').fontSize(9).fillColor(GREY).text(`Based on ${d.results.approvedPapers} approved or published terminal paper(s)${d.results.pendingPapers ? `; ${d.results.pendingPapers} not yet approved are left out` : ''}. A student passes by scoring at least the pass marks in every paper and not being absent.`, L, doc.y, { width: W }).fillColor('#000');
        if (d.overall) doc.moveDown(0.3).font('Helvetica-Bold').fontSize(10).text(`Overall: ${d.overall.passed} of ${d.overall.appeared} students passed (${d.overall.passRate}%)`, L, doc.y);
        doc.moveDown(0.4);
        // pass-rate chart
        const chartH = 110, gap = 6, bw = Math.min(34, (W - 40) / d.byClass.length - gap);
        if (doc.y > doc.page.height - chartH - 90) doc.addPage();
        const top = doc.y + 4, base = top + chartH;
        doc.font('Helvetica').fontSize(7).fillColor(GREY);
        [0, 50, 100].forEach((v) => { const yy = base - (v / 100) * chartH; doc.moveTo(L + 22, yy).lineTo(L + W, yy).lineWidth(0.3).strokeColor('#e2e8f0').stroke(); doc.text(`${v}%`, L, yy - 3, { width: 20, align: 'right' }); });
        d.byClass.forEach((c, i) => {
          const x = L + 30 + i * (bw + gap), h = Math.max(1, (c.passRate / 100) * chartH);
          doc.rect(x, base - h, bw, h).fill(c.passRate >= 80 ? '#059669' : c.passRate >= 50 ? '#d97706' : '#dc2626');
          doc.fillColor('#000').fontSize(7).text(`${c.passRate}%`, x - 4, base - h - 9, { width: bw + gap + 2, align: 'center' }).text(c.short, x - 4, base + 3, { width: bw + gap + 2, align: 'center' });
        });
        doc.fillColor('#000'); doc.y = base + 18; doc.x = L;
        doc.font('Helvetica-Bold').fontSize(8).fillColor(GREY).text('Pass rate by class (green 80%+, amber 50-79%, red below 50%)', L, doc.y).fillColor('#000'); doc.moveDown(0.5);
        table(['Class', 'Appeared', 'Passed', 'Pass %', 'Average %', 'Class topper'], [130, 60, 55, 55, 65, 150], d.byClass.map((c) => [c.label, c.appeared, c.passed, `${c.passRate}%`, `${c.avg}%`, `${c.topper} (${c.topperPercent}%)`]));

        h2('4. Section ranking (by average percentage)');
        table(['Rank', 'Section', 'Appeared', 'Pass %', 'Average %'], [40, 200, 70, 70, 75], d.bySection.map((s, i) => [i + 1, s.label, s.appeared, `${s.passRate}%`, `${s.avg}%`]));

        h2('5. Top students of the school');
        table(['Rank', 'Student', 'Class', 'Percentage'], [45, 200, 80, 90], d.top.map((s, i) => [i + 1, s.name, s.cls, `${s.percent}%`]));
      }
      signBlock(doc, seal, true, 'Prepared by');
    });
  },
};

// ── Student terminal marksheet ──────────────────────────────────────────────────────────
export const MarksheetService = {
  async pdf(institutionId: string, studentId: string, examName?: string): Promise<{ buffer: Buffer; official: boolean; student: string }> {
    if (!isId(studentId)) throw fail(400, 'Choose a student.', 'INVALID_INPUT');
    const [inst, student]: [any, any] = await Promise.all([instOf(institutionId), User.findOne({ _id: studentId, institutionId, role: 'STUDENT' }, 'fullName').lean()]);
    if (!student) throw fail(404, 'Student not found in your school.', 'NOT_FOUND');
    const enr: any = await StudentEnrollment.findOne({ studentId, status: 'ENROLLED' }).sort({ createdAt: -1 }).populate({ path: 'sectionId', populate: { path: 'classId' } }).lean();
    if (!enr?.sectionId) throw fail(404, 'This student has no active class enrolment.', 'NOT_FOUND');
    let papers: any[] = await ExamAssessment.find({ institutionId, sectionId: enr.sectionId._id, examType: { $in: TERMINAL } }).populate('centralSubjectId', 'name').lean();
    if (!papers.length) throw fail(404, 'No terminal examination exists for this student class yet.', 'NO_DATA');
    // One examination = all its subject papers. Older papers without an examination link are grouped by their name.
    const exams: any[] = await Examination.find({ _id: { $in: papers.map((p) => p.examinationId).filter(Boolean) } }, 'name').lean();
    const examNameOf = new Map(exams.map((x) => [String(x._id), x.name]));
    const groupOf = (p: any) => (p.examinationId ? String(p.examinationId) : `name:${p.name}`);
    const titleOf = (p: any) => (p.examinationId ? examNameOf.get(String(p.examinationId)) || p.name : p.name);
    const keys = [...new Set(papers.map(groupOf))];
    const newest = (k: string) => Math.max(...papers.filter((p) => groupOf(p) === k).map((p) => +new Date(p.createdAt)));
    const isApproved = (k: string) => papers.filter((p) => groupOf(p) === k).every((p) => APPROVED.includes(p.workflowStatus));
    let pickKey: string | undefined;
    if (examName) pickKey = keys.find((k) => titleOf(papers.find((p) => groupOf(p) === k)) === examName);
    else { const ok = keys.filter(isApproved); pickKey = (ok.length ? ok : keys).sort((a, b) => newest(b) - newest(a))[0]; }
    if (!pickKey) throw fail(404, 'That examination was not found for this student class.', 'NO_DATA');
    papers = papers.filter((p) => groupOf(p) === pickKey);
    const examTitle = titleOf(papers[0]);
    papers.sort((a, b) => String(a.centralSubjectId?.name).localeCompare(String(b.centralSubjectId?.name)));
    const marks: any[] = await StudentMark.find({ studentId, assessmentId: { $in: papers.map((p) => p._id) } }).lean() as any;
    const mk = new Map(marks.map((m) => [String(m.assessmentId), m]));
    const official = papers.every((p) => APPROVED.includes(p.workflowStatus));
    const seal = await SealService.buffers(institutionId);
    const year: any = enr.sectionId.academicYearId ? await AcademicYear.findById(enr.sectionId.academicYearId, 'name').lean() : null;
    let got = 0, max = 0, gpaSum = 0, gpaN = 0, failed = false, missing = false;
    const rows = papers.map((p) => {
      const m: any = mk.get(String(p._id)); const full = Number(p.totalMarks) || 100;
      if (!m) { missing = true; return [p.centralSubjectId?.name || '', full, Number(p.passMarks) || '-', '-', '-', '-']; }
      if (m.isAbsent) { failed = true; return [p.centralSubjectId?.name || '', full, Number(p.passMarks) || '-', 'AB', '-', '-']; }
      const o = Number(m.marksObtained) || 0; got += o; max += full; if (m.gpa) { gpaSum += m.gpa; gpaN++; }
      if (o < (Number(p.passMarks) || 0)) failed = true;
      return [p.centralSubjectId?.name || '', full, Number(p.passMarks) || '-', o, gradeOf((o / full) * 100), m.gpa ?? '-'];
    });
    const pct = max ? r1((got / max) * 100) : 0;
    const buffer = await toBuffer((doc) => {
      if (!official) watermark(doc, 'NOT APPROVED');
      letterhead(doc, inst, 'Terminal Examination Marksheet', `${examTitle}   |   Academic year ${year?.name || '-'}`);
      const L = doc.page.margins.left;
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#000').text(`Name of student: ${student.fullName}`, L, doc.y);
      doc.font('Helvetica').fontSize(10).text(`Class: ${enr.sectionId.classId?.gradeNumber ?? ''}   Section: ${enr.sectionId.name}   Roll no.: ${enr.rollNumber}   Admission no.: ${enr.admissionNumber}`);
      doc.moveDown(0.6);
      const widths = [170, 60, 70, 70, 55, 55]; let y = doc.y;
      const row = (cells: Array<string | number>, bold: boolean, fill?: string) => {
        let x = L; if (fill) doc.rect(L, y, widths.reduce((a, b) => a + b, 0), 20).fill(fill).fillColor('#000');
        cells.forEach((c, i) => { doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9).fillColor('#000').text(String(c), x + 4, y + 6, { width: widths[i] - 8, lineBreak: false, ellipsis: true, align: i === 0 ? 'left' : 'center' }); doc.rect(x, y, widths[i], 20).lineWidth(0.4).strokeColor('#94a3b8').stroke(); x += widths[i]; });
        y += 20;
      };
      row(['Subject', 'Full marks', 'Pass marks', 'Obtained', 'Grade', 'GPA'], true, '#d1fae5');
      rows.forEach((r) => row(r, false));
      doc.y = y + 10; doc.x = L;
      const result = missing ? 'INCOMPLETE (some marks not entered)' : failed ? 'NOT PASSED' : 'PASSED';
      doc.font('Helvetica-Bold').fontSize(10.5).text(`Total: ${got} / ${max}    Percentage: ${pct}%    Grade: ${max ? gradeOf(pct) : '-'}    GPA: ${gpaN ? r1((gpaSum / gpaN) * 100) / 100 : '-'}`, L, doc.y);
      doc.fillColor(failed || missing ? '#b91c1c' : GREEN).text(`Result: ${result}`).fillColor('#000');
      doc.moveDown(0.3).font('Helvetica').fontSize(8).fillColor(GREY).text(`Date of issue: ${fmtDate(new Date())}`, L, doc.y).fillColor('#000');
      signBlock(doc, seal, official, 'Class teacher');
    });
    return { buffer, official, student: student.fullName };
  },
};

// ── Transfer certificate ────────────────────────────────────────────────────────────────
async function tcPdf(institutionId: string, tc: any): Promise<Buffer> {
  const [inst, seal] = await Promise.all([instOf(institutionId), SealService.buffers(institutionId)]);
  const s = tc.snapshot || {};
  return toBuffer((doc) => {
    letterhead(doc, inst, 'Transfer Certificate', `Certificate No: ${tc.certificateNumber}`);
    const L = doc.page.margins.left, W = doc.page.width - L - doc.page.margins.right;
    doc.font('Helvetica').fontSize(11).fillColor('#000').text(`This is to certify that ${s.studentName}, ${s.guardianName ? `child of ${s.guardianName}, ` : ''}was a student of this school in Class ${s.grade ?? ''} (Section ${s.section ?? ''}), Roll No. ${s.roll ?? ''}, Admission No. ${s.admissionNumber ?? ''}, during the academic year ${s.year || '-'}.`, L, doc.y, { width: W, align: 'justify', lineGap: 4 });
    doc.moveDown(0.8);
    const facts: Array<[string, string]> = [
      ['Date of leaving', fmtDate(tc.leavingDate)], ['Reason for leaving', tc.reason || 'Not stated'], ['Last examination result', s.lastResult || 'No approved result on record'],
      ['Attendance this year', s.attendanceRate == null ? 'Not recorded' : `${s.attendanceRate}%`], ['Conduct', tc.conduct || 'Good'], ['School dues', tc.duesCleared ? 'Cleared' : 'Pending'],
      ...(tc.remarks ? [['Remarks', tc.remarks] as [string, string]] : []),
    ];
    for (const [k, v] of facts) { doc.font('Helvetica-Bold').fontSize(10.5).text(`${k}: `, L, doc.y, { continued: true }).font('Helvetica').text(v); doc.moveDown(0.25); }
    doc.moveDown(0.5).font('Helvetica').fontSize(9).fillColor(GREY).text(`Issued on ${fmtDate(tc.issuedOn)}. This certificate is valid only with the school stamp and the principal's signature.`, L, doc.y, { width: W }).fillColor('#000');
    signBlock(doc, seal, true, 'Prepared by');
  });
}

export const TransferCertificateService = {
  async issue(userId: string, role: string, institutionId: string, studentId: string, b: any) {
    if (!isId(studentId)) throw fail(400, 'Choose a student.', 'INVALID_INPUT');
    if (!isoOk(b?.leavingDate)) throw fail(400, 'Enter the date the student is leaving.', 'INVALID_DATE');
    const student: any = await User.findOne({ _id: studentId, institutionId, role: 'STUDENT' }, 'fullName').lean();
    if (!student) throw fail(404, 'Student not found in your school.', 'NOT_FOUND');
    const enr: any = await StudentEnrollment.findOne({ studentId, status: { $in: ['ENROLLED', 'TRANSFERRED'] } }).sort({ createdAt: -1 }).populate({ path: 'sectionId', populate: { path: 'classId' } }).lean();
    if (!enr?.sectionId) throw fail(404, 'This student has no class enrolment.', 'NOT_FOUND');
    const year: any = enr.sectionId.academicYearId ? await AcademicYear.findById(enr.sectionId.academicYearId, 'name startDate endDate').lean() : null;
    // last approved terminal result
    const papers: any[] = await ExamAssessment.find({ institutionId, sectionId: enr.sectionId._id, examType: { $in: TERMINAL }, workflowStatus: { $in: APPROVED } }, 'name totalMarks createdAt').lean();
    let lastResult = '';
    if (papers.length) {
      const name = [...papers].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0].name;
      const ps = papers.filter((p) => p.name === name);
      const ms: any[] = await StudentMark.find({ studentId, assessmentId: { $in: ps.map((p) => p._id) }, isAbsent: false }, 'marksObtained').lean() as any;
      const max = ps.length * (Number(ps[0].totalMarks) || 100);
      if (ms.length) lastResult = `${name}: ${r1((ms.reduce((a, m) => a + (Number(m.marksObtained) || 0), 0) / max) * 100)}%`;
    }
    const att: any[] = await AttendanceRecord.aggregate([{ $match: { sectionId: enr.sectionId._id, 'records.studentId': enr.studentId } }, { $unwind: '$records' }, { $match: { 'records.studentId': enr.studentId } }, { $group: { _id: '$records.status', n: { $sum: 1 } } }]);
    const total = att.reduce((a, x) => a + x.n, 0);
    const present = att.filter((x) => ['PRESENT', 'LATE'].includes(x._id)).reduce((a, x) => a + x.n, 0);
    const snapshot = { studentName: student.fullName, grade: enr.sectionId.classId?.gradeNumber, section: enr.sectionId.name, roll: enr.rollNumber, admissionNumber: enr.admissionNumber, guardianName: enr.guardianName || '', year: year?.name || '', lastResult, attendanceRate: total ? r1((present / total) * 100) : null };
    const yy = String(year?.name || new Date().getFullYear()).replace(/\D/g, '').slice(0, 4) || String(new Date().getFullYear());
    let doc: any;
    for (let attempt = 0; attempt < 5 && !doc; attempt++) {
      const seq = (await TransferCertificate.countDocuments({ institutionId })) + 1 + attempt;
      try {
        doc = await TransferCertificate.create({ institutionId, studentId, certificateNumber: `TC-${yy}-${String(seq).padStart(4, '0')}`, issuedBy: userId, leavingDate: new Date(`${b.leavingDate}T00:00:00Z`), reason: String(b?.reason || '').slice(0, 300), conduct: String(b?.conduct || 'Good').slice(0, 60), duesCleared: b?.duesCleared !== false, remarks: String(b?.remarks || '').slice(0, 400), snapshot });
      } catch (e: any) { if (e?.code !== 11000) throw e; }
    }
    if (!doc) throw fail(500, 'Could not allocate a certificate number. Try again.', 'NUMBER_CLASH');
    if (b?.markTransferred === true) await StudentEnrollment.updateOne({ _id: enr._id }, { $set: { status: 'TRANSFERRED' } });
    await AuditService.log({ operatorId: userId, operatorRole: role, action: 'TRANSFER_CERTIFICATE_ISSUED', entityType: 'User', entityId: studentId, details: { certificateNumber: doc.certificateNumber, markTransferred: b?.markTransferred === true } });
    return { id: String(doc._id), certificateNumber: doc.certificateNumber, pdf: await tcPdf(institutionId, doc.toObject()) };
  },
  async pdf(institutionId: string, id: string) {
    const tc: any = isId(id) && (await TransferCertificate.findOne({ _id: id, institutionId }).lean());
    if (!tc) throw fail(404, 'Certificate not found.', 'NOT_FOUND');
    return { certificateNumber: tc.certificateNumber, pdf: await tcPdf(institutionId, tc) };
  },
  async list(institutionId: string) {
    const rows: any[] = await TransferCertificate.find({ institutionId }).sort({ createdAt: -1 }).limit(100).lean();
    return rows.map((r) => ({ id: String(r._id), certificateNumber: r.certificateNumber, student: r.snapshot?.studentName, grade: r.snapshot?.grade, leavingDate: r.leavingDate, issuedOn: r.issuedOn, reason: r.reason }));
  },
};
