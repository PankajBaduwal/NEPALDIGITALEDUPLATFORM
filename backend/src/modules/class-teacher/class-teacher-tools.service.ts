import crypto from 'crypto';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import {
  Section, StudentEnrollment, AttendanceRecord, User, Institution, ExamAssessment, StudentMark, AcademicYear, AbsenceNotice,
} from '../../models';
import { NotificationService } from '../notifications/notification.service';
import { SmsService } from '../../common/services/sms.service';
import { AuditService } from '../../common/services/audit.service';
import { schoolDayStart, schoolDayEnd } from '../../common/utils/school-day.util';

const fail = (status: number, message: string, code: string) => ({ status, message, code });
const isId = (v: any) => /^[a-f0-9]{24}$/i.test(String(v || ''));
// A school day runs 00:00-24:00 Nepal time, the same rule attendance is saved with, whatever time zone the server uses
const dayRange = (iso: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso)) || isNaN(new Date(`${iso}T12:00:00`).getTime())) throw fail(400, 'Choose a valid date.', 'INVALID_DATE');
  return { start: schoolDayStart(iso), end: schoolDayEnd(iso) };
};
const prettyDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

/** Only the section's designated class teacher passes. Administrators have their own tools. */
async function requireClassTeacher(userId: string, institutionId: string, sectionId: string) {
  if (!isId(sectionId)) throw fail(400, 'Choose a class section.', 'INVALID_INPUT');
  const section: any = await Section.findById(sectionId).populate('classId');
  if (!section || String(section.classId?.institutionId) !== String(institutionId)) throw fail(404, 'Section not found in your school.', 'SECTION_NOT_FOUND');
  if (!section.classTeacherId || String(section.classTeacherId) !== String(userId)) {
    throw fail(403, 'Only the designated class teacher of this section can do this.', 'NOT_CLASS_TEACHER');
  }
  return section;
}

const TEMPLATES = {
  en: 'Dear {guardian}, {student} (Class {class} {section}) was absent from school on {date}. Please contact the class teacher {teacher}. - {school}',
  ne: 'आदरणीय {guardian}, {student} (कक्षा {class} {section}) {date} का दिन विद्यालयमा अनुपस्थित हुनुहुन्थ्यो। कृपया कक्षा शिक्षक {teacher} सँग सम्पर्क गर्नुहोस्। - {school}',
};
const fill = (tpl: string, v: Record<string, string>) => tpl.replace(/\{(\w+)\}/g, (_m, k) => v[k] ?? '');

export const AbsenceNoticeService = {
  templates: TEMPLATES,

  /** Students recorded ABSENT on a day (any period), with guardian details and whether a notice already went out. */
  async absentees(userId: string, institutionId: string, sectionId: string, dateIso: string) {
    const section = await requireClassTeacher(userId, institutionId, sectionId);
    const { start, end } = dayRange(dateIso);
    const recs: any[] = await AttendanceRecord.find({ sectionId, date: { $gte: start, $lt: end } }, 'records periodNumber').lean();
    const periods = new Map<string, number>();
    for (const r of recs) for (const x of r.records || []) if (x.status === 'ABSENT') periods.set(String(x.studentId), (periods.get(String(x.studentId)) || 0) + 1);
    const ids = [...periods.keys()];
    const [enrollments, notices, institution, teacher]: [any[], any[], any, any] = await Promise.all([
      StudentEnrollment.find({ sectionId, status: 'ENROLLED', studentId: { $in: ids } }).populate('studentId', 'fullName fullNameNepali').sort({ rollNumber: 1 }).lean() as any,
      AbsenceNotice.find({ sectionId, date: { $gte: start, $lt: end } }).lean() as any,
      Institution.findById(institutionId, 'name').lean(),
      User.findById(userId, 'fullName').lean(),
    ]);
    const done = new Set(notices.filter((n) => n.smsStatus === 'SENT' || n.inAppStatus === 'SENT').map((n) => String(n.studentId)));
    return {
      date: dateIso,
      section: { id: String(section._id), name: section.name, className: section.classId?.name || `Class ${section.classId?.gradeNumber}`, grade: section.classId?.gradeNumber },
      smsConfigured: SmsService.isConfigured(),
      templates: TEMPLATES,
      context: { school: institution?.name || '', teacher: teacher?.fullName || '' },
      students: enrollments.map((e) => ({
        studentId: String(e.studentId._id), name: e.studentId.fullName, nameNepali: e.studentId.fullNameNepali, roll: e.rollNumber,
        absentPeriods: periods.get(String(e.studentId._id)) || 1,
        guardianName: e.guardianName || '', guardianRelation: e.guardianRelation || '',
        phone: e.guardianPhone || '', phoneValid: !!SmsService.normalize(e.guardianPhone), phoneMasked: SmsService.mask(e.guardianPhone),
        alreadyNotified: done.has(String(e.studentId._id)),
      })),
    };
  },

  async send(userId: string, institutionId: string, sectionId: string, body: any) {
    const section: any = await requireClassTeacher(userId, institutionId, sectionId);
    const dateIso = String(body?.date || '');
    const lang: 'en' | 'ne' = body?.language === 'ne' ? 'ne' : 'en';
    const template = String(body?.template || TEMPLATES[lang]).slice(0, 600);
    if (!template.trim()) throw fail(400, 'Write the message.', 'INVALID_INPUT');
    const wantSms = body?.sms !== false;
    const wantInApp = body?.inApp !== false;
    const resend = !!body?.resend;
    const data = await this.absentees(userId, institutionId, sectionId, dateIso);
    const chosen = new Set((Array.isArray(body?.studentIds) ? body.studentIds : data.students.map((s) => s.studentId)).map(String));
    const batchId = crypto.randomBytes(5).toString('hex');
    const results: any[] = [];
    for (const s of data.students.filter((x) => chosen.has(x.studentId))) {
      if (s.alreadyNotified && !resend) { results.push({ studentId: s.studentId, name: s.name, status: 'ALREADY_NOTIFIED' }); continue; }
      const message = fill(template, {
        guardian: s.guardianName || (lang === 'ne' ? 'अभिभावक' : 'Parent/Guardian'), student: lang === 'ne' && s.nameNepali ? s.nameNepali : s.name,
        class: String(section.classId?.gradeNumber ?? ''), section: section.name, date: prettyDate(dateIso), teacher: data.context.teacher, school: data.context.school,
      }).slice(0, 480);
      const channels: string[] = [];
      let smsStatus: 'SENT' | 'PREPARED' | 'FAILED' | 'SKIPPED' = 'SKIPPED';
      let smsError: string | undefined;
      const phone = SmsService.normalize(s.phone);
      if (wantSms) {
        channels.push('SMS');
        if (!phone) { smsStatus = 'FAILED'; smsError = s.phone ? 'The guardian number is not a valid Nepal mobile number' : 'No guardian number on file'; }
        else if (!SmsService.isConfigured()) { smsStatus = 'PREPARED'; smsError = 'SMS is not set up on this server; the message was saved but not sent'; }
        else { const r = await SmsService.send(phone, message); smsStatus = r.ok ? 'SENT' : 'FAILED'; smsError = r.error; }
      }
      let inAppStatus: 'SENT' | 'FAILED' | 'SKIPPED' = 'SKIPPED';
      if (wantInApp) {
        channels.push('IN_APP');
        try {
          await NotificationService.sendNotification({ recipientId: s.studentId, institutionId, type: 'ATTENDANCE_WARNING', title: lang === 'ne' ? 'अनुपस्थिति सूचना' : 'Absence notice', message, priority: 'HIGH', metadata: { sectionId, date: dateIso } });
          inAppStatus = 'SENT';
        } catch { inAppStatus = 'FAILED'; }
      }
      await AbsenceNotice.create({ institutionId, sectionId, studentId: s.studentId, sentBy: userId, batchId, date: schoolDayStart(dateIso), guardianName: s.guardianName, phone: phone || s.phone, language: lang, message, channels, smsStatus, smsError, inAppStatus });
      results.push({ studentId: s.studentId, name: s.name, status: smsStatus === 'SENT' || inAppStatus === 'SENT' ? 'SENT' : smsStatus === 'PREPARED' ? 'PREPARED' : 'FAILED', sms: smsStatus, smsError, inApp: inAppStatus, message });
    }
    const count = (st: string) => results.filter((r) => r.status === st).length;
    await AuditService.log({ operatorId: userId, operatorRole: 'TEACHER', action: 'ABSENCE_NOTICES_SENT', entityType: 'Section', entityId: sectionId, details: { date: dateIso, students: results.length, sent: count('SENT'), prepared: count('PREPARED'), failed: count('FAILED') } });
    return { batchId, smsConfigured: SmsService.isConfigured(), summary: { students: results.length, sent: count('SENT'), prepared: count('PREPARED'), failed: count('FAILED'), skipped: count('ALREADY_NOTIFIED') }, results };
  },

  async history(userId: string, institutionId: string, sectionId: string) {
    await requireClassTeacher(userId, institutionId, sectionId);
    const rows: any[] = await AbsenceNotice.find({ sectionId }).sort({ createdAt: -1 }).limit(60).populate('studentId', 'fullName').lean();
    return rows.map((r) => ({ id: String(r._id), student: r.studentId?.fullName, date: r.date, sentAt: r.createdAt, channels: r.channels, smsStatus: r.smsStatus, smsError: r.smsError, inAppStatus: r.inAppStatus, phoneMasked: SmsService.mask(r.phone), message: r.message }));
  },
};

// ── Ledger export (Excel / PDF) ───────────────────────────────────────────────────────────
const TERMINAL = ['TERMINAL', 'FINAL'];
const CONTINUOUS = ['UNIT_TEST', 'MONTHLY_TEST', 'INTERNAL_ASSESSMENT', 'PRACTICAL', 'ASSIGNMENT', 'CUSTOM'];

interface Ledger {
  title: string; school: string; classLine: string; year: string; teacher: string; generated: string;
  columns: Array<{ label: string; max: number }>;
  rows: Array<{ roll: number; name: string; cells: Array<string | number>; total: number; max: number; percent: number | null; gpa: number | null; grade: string; rank: number | null }>;
}

export const LedgerExportService = {
  async build(userId: string, institutionId: string, sectionId: string, type: string, examName?: string): Promise<Ledger> {
    const section: any = await requireClassTeacher(userId, institutionId, sectionId);
    const kind = type === 'cas' ? 'cas' : 'terminal';
    const filter: any = { institutionId, sectionId, examType: { $in: kind === 'cas' ? CONTINUOUS : TERMINAL } };
    if (examName) filter.name = examName;
    const assessments: any[] = await ExamAssessment.find(filter).populate('centralSubjectId', 'name').sort({ 'centralSubjectId.name': 1, createdAt: 1 }).lean();
    if (!assessments.length) throw fail(404, kind === 'cas' ? 'No continuous-assessment marks exist for this section yet.' : 'No terminal examination marks exist for this section yet.', 'NO_DATA');
    assessments.sort((a, b) => String(a.centralSubjectId?.name).localeCompare(String(b.centralSubjectId?.name)) || +new Date(a.createdAt) - +new Date(b.createdAt));
    const [marks, enrollments, institution, teacher, year]: [any[], any[], any, any, any] = await Promise.all([
      StudentMark.find({ assessmentId: { $in: assessments.map((a) => a._id) } }).lean() as any,
      StudentEnrollment.find({ sectionId, status: 'ENROLLED' }).populate('studentId', 'fullName').sort({ rollNumber: 1 }).lean() as any,
      Institution.findById(institutionId, 'name').lean(),
      User.findById(userId, 'fullName').lean(),
      section.academicYearId ? AcademicYear.findById(section.academicYearId, 'name').lean() : null,
    ]);
    const byKey = new Map(marks.map((m) => [`${m.studentId}|${m.assessmentId}`, m]));
    const columns = assessments.map((a) => ({ label: `${a.centralSubjectId?.name || 'Subject'}\n${a.name}`, max: Number(a.totalMarks) || 100 }));
    const rows: Ledger['rows'] = enrollments.map((e) => {
      let total = 0, max = 0, gpaSum = 0, gpaN = 0;
      const cells = assessments.map((a) => {
        const m: any = byKey.get(`${e.studentId._id}|${a._id}`);
        if (!m) return '-';
        if (m.isAbsent) return 'AB';
        total += Number(m.marksObtained) || 0;
        max += Number(a.totalMarks) || 100;
        if (m.gpa) { gpaSum += m.gpa; gpaN++; }
        return Number(m.marksObtained);
      });
      const percent = max ? Math.round((total / max) * 1000) / 10 : null;
      return { roll: e.rollNumber, name: e.studentId.fullName, cells, total, max, percent, gpa: gpaN ? Math.round((gpaSum / gpaN) * 100) / 100 : null, grade: percent === null ? '-' : percent >= 90 ? 'A+' : percent >= 80 ? 'A' : percent >= 70 ? 'B+' : percent >= 60 ? 'B' : percent >= 50 ? 'C+' : percent >= 40 ? 'C' : percent >= 35 ? 'D' : 'NG', rank: null };
    });
    [...rows].filter((r) => r.percent !== null).sort((a, b) => (b.percent as number) - (a.percent as number)).forEach((r, i, arr) => { r.rank = i > 0 && arr[i - 1].percent === r.percent ? (arr[i - 1].rank as number) : i + 1; });
    return {
      title: kind === 'cas' ? 'Continuous Assessment System (CAS) Ledger' : 'Terminal Examination Marks Sheet',
      school: institution?.name || '', classLine: `Class ${section.classId?.gradeNumber ?? ''} - ${/^section/i.test(section.name) ? section.name : `Section ${section.name}`}`, year: year?.name || '', teacher: teacher?.fullName || '',
      generated: new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }), columns, rows,
    };
  },

  async toXlsx(l: Ledger): Promise<Buffer> {
    const wb = new ExcelJS.Workbook();
    wb.creator = 'Nepal Education Platform';
    const ws = wb.addWorksheet('Ledger', { pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 } });
    const cols = l.columns.length + 7;
    const put = (r: number, text: string, bold = false, size = 11) => { ws.mergeCells(r, 1, r, Math.min(cols, 12)); const c = ws.getCell(r, 1); c.value = text; c.font = { bold, size }; c.alignment = { horizontal: 'left' }; };
    put(1, l.school, true, 14); put(2, l.title, true, 12);
    put(3, `${l.classLine}${l.year ? ` | Academic year ${l.year}` : ''} | Class teacher: ${l.teacher}`);
    put(4, `Generated ${l.generated}`);
    const head = ['Roll', 'Student', ...l.columns.map((c) => `${c.label} (/${c.max})`), 'Total', 'Out of', '%', 'GPA', 'Grade', 'Rank'];
    const hr = ws.getRow(6);
    hr.values = head;
    hr.font = { bold: true };
    hr.alignment = { wrapText: true, vertical: 'middle', horizontal: 'center' };
    hr.height = 46;
    hr.eachCell((c) => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1FAE5' } }; c.border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }; });
    l.rows.forEach((r, i) => {
      const row = ws.getRow(7 + i);
      row.values = [r.roll, r.name, ...r.cells, r.total, r.max, r.percent ?? '-', r.gpa ?? '-', r.grade, r.rank ?? '-'];
      row.eachCell((c, n) => { c.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } }; if (n > 2) c.alignment = { horizontal: 'center' }; });
    });
    ws.getColumn(1).width = 7;
    ws.getColumn(2).width = 28;
    for (let i = 3; i < cols + 1; i++) ws.getColumn(i).width = 13;
    ws.views = [{ state: 'frozen', xSplit: 2, ySplit: 6 }];
    const sig = 7 + l.rows.length + 3;
    ws.getCell(sig, 2).value = 'Class teacher signature: ____________________';
    ws.getCell(sig, Math.max(4, Math.floor(cols / 2))).value = 'Examination committee: ____________________';
    ws.getCell(sig, Math.max(6, cols - 3)).value = 'Principal: ____________________';
    return Buffer.from(await wb.xlsx.writeBuffer());
  },

  /** A4 landscape; wide ledgers continue on the next page with the roll number and name repeated. */
  toPdf(l: Ledger): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 28 });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      const perPage = 8;
      const parts: number[][] = [];
      for (let i = 0; i < Math.max(1, l.columns.length); i += perPage) parts.push(l.columns.map((_c, idx) => idx).slice(i, i + perPage));
      parts.forEach((idxs, pi) => {
        if (pi > 0) doc.addPage();
        const last = pi === parts.length - 1;
        doc.font('Helvetica-Bold').fontSize(13).text(l.school, { align: 'left' });
        doc.font('Helvetica-Bold').fontSize(11).text(l.title);
        doc.font('Helvetica').fontSize(9).fillColor('#475569').text(`${l.classLine}${l.year ? `  |  Academic year ${l.year}` : ''}  |  Class teacher: ${l.teacher}  |  Generated ${l.generated}${parts.length > 1 ? `  |  Page ${pi + 1} of ${parts.length}` : ''}`).fillColor('#000');
        doc.moveDown(0.6);
        const widths = [30, 130, ...idxs.map(() => 62), ...(last ? [40, 38, 34, 34, 36, 32] : [])];
        const heads = ['Roll', 'Student', ...idxs.map((i) => l.columns[i].label.replace('\n', ' - ') + ` /${l.columns[i].max}`), ...(last ? ['Total', 'Out of', '%', 'GPA', 'Grade', 'Rank'] : [])];
        const x0 = doc.page.margins.left;
        let y = doc.y;
        const drawRow = (cells: Array<string | number>, bold: boolean, h: number, fill?: string) => {
          let x = x0;
          cells.forEach((c, i) => {
            if (fill) doc.rect(x, y, widths[i], h).fill(fill).fillColor('#000');
            doc.rect(x, y, widths[i], h).strokeColor('#94a3b8').lineWidth(0.4).stroke();
            doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 6.5 : 8).fillColor('#000').text(String(c), x + 2, y + 3, { width: widths[i] - 4, height: h - 4, align: i === 1 ? 'left' : 'center' });
            x += widths[i];
          });
          y += h;
        };
        drawRow(heads, true, 34, '#d1fae5');
        for (const r of l.rows) {
          if (y > doc.page.height - doc.page.margins.bottom - 60) { doc.addPage(); y = doc.page.margins.top; drawRow(heads, true, 34, '#d1fae5'); }
          drawRow([r.roll, r.name, ...idxs.map((i) => r.cells[i]), ...(last ? [r.total, r.max, r.percent ?? '-', r.gpa ?? '-', r.grade, r.rank ?? '-'] : [])], false, 17);
        }
        if (last) {
          y += 36;
          doc.font('Helvetica').fontSize(9).fillColor('#000');
          doc.text('Class teacher: ______________________', x0, y);
          doc.text('Examination committee: ______________________', x0 + 270, y);
          doc.text('Principal: ______________________', x0 + 560, y);
        }
      });
      doc.end();
    });
  },
};
