/**
 * ReportCardSheet — the official progress report card of one student for one examination, as an A4 marksheet.
 *
 * The same component is shown on screen (scaled to fit) and printed. Printing uses the rules at the bottom of RC_CSS: the rest of the page is
 * hidden, every card gets its own A4 page, and the browser's own header/footer is removed (@page margin 0).
 * Data comes from GET /class-teacher/section/:id/consolidated-results (one examination only).
 */
import React, { useEffect } from 'react';

export interface ReportCardSheetProps {
  data: any;     // the consolidated-results payload (institution, examination, section, principal, classTeacher, …)
  student: any;  // one entry of data.consolidatedStudents
}

const SCALE: Array<[string, string, string]> = [['A+', '90–100%', '4.0'], ['A', '80–89%', '3.6'], ['B+', '70–79%', '3.2'], ['B', '60–69%', '2.8'], ['C+', '50–59%', '2.4'], ['C', '40–49%', '2.0'], ['D', '35–39%', '1.6'], ['NG', 'Below 35%', '0.0']];

const REMARKS: Record<string, string> = {
  'A+': 'Outstanding performance. Keep up the excellent work.',
  A: 'Excellent work. Continue with the same dedication.',
  'B+': 'Very good performance. A little more practice will bring even better results.',
  B: 'Good effort. Regular revision will help to improve further.',
  'C+': 'Satisfactory. Needs more practice and regular reading at home.',
  C: 'Acceptable. Please give extra time to revision at home.',
  D: 'Basic level reached. Extra support and regular practice are needed.'
};

const fmtDate = (d: any) => {
  if (!d) return '';
  const x = new Date(d);
  return isNaN(+x) ? '' : x.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
const num = (v: any) => (v === null || v === undefined || v === '' ? '—' : String(Math.round(Number(v) * 100) / 100));
const sectionLabel = (n?: string) => (n ? (/^section/i.test(n) ? n : `Section ${n}`) : '');

export const RC_CSS = `
.rc-sheet{position:relative;box-sizing:border-box;width:794px;height:1123px;background:#fff;color:#0f172a;overflow:hidden;
  font-family:'Segoe UI',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;text-align:left}
.rc-sheet *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.rc-frame{position:absolute;inset:14px;border:3px double #0b2a4a;pointer-events:none}
.rc-frame:after{content:'';position:absolute;inset:5px;border:1px solid #0f766e}
.rc-corner{position:absolute;width:30px;height:30px;border:0 solid #0f766e;pointer-events:none}
.rc-corner.tl{left:22px;top:22px;border-top-width:4px;border-left-width:4px}.rc-corner.tr{right:22px;top:22px;border-top-width:4px;border-right-width:4px}
.rc-corner.bl{left:22px;bottom:22px;border-bottom-width:4px;border-left-width:4px}.rc-corner.br{right:22px;bottom:22px;border-bottom-width:4px;border-right-width:4px}
.rc-mark{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;z-index:0}
.rc-mark img{width:420px;opacity:.045}
.rc-mark b{font:900 112px Georgia,'Times New Roman',serif;letter-spacing:6px;color:rgba(100,116,139,.13);transform:rotate(-32deg)}
.rc-inner{position:relative;z-index:1;height:100%;padding:38px 46px 34px;display:flex;flex-direction:column}
.rc-head{display:grid;grid-template-columns:78px 1fr 78px;align-items:center;gap:8px}
.rc-logo{width:70px;height:70px;object-fit:contain}.rc-logo-r{justify-self:end;text-align:right;font-size:8.5px;color:#64748b;line-height:1.35}
.rc-logo-r b{display:block;color:#0b2a4a;font-size:10px;letter-spacing:.04em}
.rc-center{text-align:center}
.rc-gov{font-size:9.5px;font-weight:800;letter-spacing:.2em;color:#64748b;text-transform:uppercase}
.rc-min{font-size:9.5px;color:#64748b;margin-top:2px}
.rc-school{font:800 25px/1.15 Georgia,'Times New Roman',serif;color:#0b2a4a;text-transform:uppercase;margin-top:5px;letter-spacing:.01em}
.rc-school-ne{font:700 17px/1.3 'Nirmala UI','Noto Sans Devanagari',Mangal,sans-serif;color:#0f766e;margin-top:1px}
.rc-addr{font-size:10.5px;color:#475569;margin-top:3px}
.rc-ribbon{margin:14px auto 0;width:78%;background:#0b2a4a;color:#fff;text-align:center;font:800 15px/1 'Segoe UI',Arial,sans-serif;letter-spacing:.34em;padding:10px 0;
  clip-path:polygon(0 0,100% 0,calc(100% - 14px) 50%,100% 100%,0 100%,14px 50%)}
.rc-exam{text-align:center;margin-top:8px;font:700 16px Georgia,'Times New Roman',serif;color:#0f172a}
.rc-dates{text-align:center;font-size:10.5px;color:#64748b;margin-top:2px}
.rc-prov{display:inline-block;margin-left:8px;padding:1px 8px;border-radius:10px;background:#fef3c7;color:#92400e;font-weight:700}
.rc-info{margin-top:12px;display:grid;grid-template-columns:1.5fr .6fr 1.3fr;gap:9px 14px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;padding:11px 16px}
.rc-f label{display:block;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#64748b;font-weight:700}
.rc-f b{display:block;font-size:13px;color:#0f172a;margin-top:1px}.rc-f i{display:block;font-style:normal;font:600 12px 'Nirmala UI','Noto Sans Devanagari',Mangal,sans-serif;color:#64748b}
.rc-table{width:100%;border-collapse:collapse;margin-top:14px;font-size:12px}
.rc-table th{background:#0b2a4a;color:#fff;font-weight:700;font-size:10.5px;padding:8px 6px;text-align:center;border:1px solid #0b2a4a}
.rc-table th.l,.rc-table td.l{text-align:left;padding-left:9px}
.rc-table td{padding:12px 6px;text-align:center;border:1px solid #cbd5e1}
.rc-table tbody tr:nth-child(even) td{background:#f8fafc}
.rc-table td.s{font-weight:700;color:#0b2a4a}.rc-table td.o{font-weight:800}.rc-table td.g{font-weight:800;color:#0f766e}.rc-table td.g.ng{color:#b91c1c}
.rc-table td.r{font-size:10.5px;color:#64748b}
.rc-table tr.tot td{background:#e2f3f0 !important;font-weight:800;color:#0b2a4a;border-top:2px solid #0b2a4a}
.rc-dense .rc-table td{padding:6px 5px}.rc-dense .rc-sum{margin-top:10px}.rc-dense .rc-rem{margin-top:9px;min-height:48px}.rc-dense .rc-scale{margin-top:10px}.rc-dense .rc-scale-g div{padding:5px 0}.rc-dense .rc-info{margin-top:8px}.rc-dense .rc-table{margin-top:9px}
.rc-sum{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-top:18px}
.rc-sum div{border:1px solid #cbd5e1;border-radius:6px;padding:11px 4px;text-align:center;background:#fff}
.rc-sum label{display:block;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#64748b;font-weight:700}
.rc-sum b{display:block;font:800 16px Georgia,serif;color:#0b2a4a;margin-top:3px}.rc-sum b.sm{font-size:12.5px;margin-top:5px}.rc-sum b.bad{color:#b91c1c}
.rc-res{text-align:center;font-size:12px;margin-top:12px;color:#0f172a}.rc-res strong{color:#0b2a4a}
.rc-rem{margin-top:14px;border:1px solid #cbd5e1;border-radius:6px;padding:11px 14px;min-height:64px}
.rc-rem label{display:block;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#64748b;font-weight:700}
.rc-rem p{margin:4px 0 0;font:italic 13px Georgia,serif;color:#0f172a}
.rc-scale{margin-top:16px}.rc-scale>label{display:block;font-size:8.5px;letter-spacing:.1em;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:4px}
.rc-scale-g{display:grid;grid-template-columns:repeat(8,1fr);border:1px solid #cbd5e1;border-radius:6px;overflow:hidden}
.rc-scale-g div{text-align:center;padding:8px 0;border-right:1px solid #cbd5e1;font-size:9px;color:#64748b;line-height:1.35}.rc-scale-g div:last-child{border-right:0}
.rc-scale-g div:nth-child(even){background:#f1f5f9}.rc-scale-g b{display:block;font-size:12px;color:#0b2a4a}
.rc-sign{margin-top:auto;display:grid;grid-template-columns:1fr 130px 1fr;align-items:end;gap:14px;padding:0 6px}
.rc-sign .c{text-align:center;font-size:12px}.rc-sign .c .ln{border-top:1.5px solid #0b2a4a;margin:0 8px 5px}.rc-sign .c b{display:block;color:#0f172a;font-size:12px}.rc-sign .c span{display:block;font-size:10.5px;color:#64748b;margin-top:1px}
.rc-seal{width:92px;height:92px;border:1.5px dashed #94a3b8;border-radius:50%;margin:0 auto;display:grid;place-items:center;text-align:center;font-size:9px;letter-spacing:.14em;color:#94a3b8;line-height:1.5}
.rc-meta{display:flex;justify-content:space-between;align-items:flex-end;font-size:9.5px;color:#64748b;margin-top:14px;padding:0 6px}.rc-meta .gs{display:inline-block;width:210px;border-bottom:1px solid #94a3b8;margin-left:6px;height:12px;vertical-align:bottom}
.rc-foot{text-align:center;font-size:9px;color:#94a3b8;margin-top:9px;border-top:1px solid #e2e8f0;padding-top:7px}
#rc-print-root{display:none}
@page{size:A4 portrait;margin:0}
@media print{
  html,body{background:#fff !important;margin:0 !important;padding:0 !important;height:auto !important;overflow:visible !important}
  body > *:not(#rc-print-root){display:none !important}
  #rc-print-root{display:block !important}
  #rc-print-root .rc-sheet{zoom:1 !important;margin:0 !important;box-shadow:none !important;width:210mm;height:296.4mm;page-break-after:always;break-after:page}
  #rc-print-root .rc-sheet:last-child{page-break-after:auto;break-after:auto}
}
`;

/** Injects the report-card styles once. */
export function useReportCardStyles() {
  useEffect(() => {
    if (document.getElementById('rc-css')) return;
    const s = document.createElement('style');
    s.id = 'rc-css';
    s.textContent = RC_CSS;
    document.head.appendChild(s);
  }, []);
}

export const ReportCardSheet: React.FC<ReportCardSheetProps> = ({ data, student }) => {
  useReportCardStyles();
  const inst = data?.institution || {};
  const exam = data?.examination || {};
  const section = data?.section || {};
  const cls = section.classId || {};
  const provisional = !exam.isPublished;
  const rows: any[] = student?.subjectMarks || [];
  const dense = rows.length > 7;
  const address = [inst.localLevel, inst.district, inst.province].filter(Boolean).join(', ');
  const att = student?.attendance;
  const resultText =
    student?.result === 'PASSED' ? `Passed — ${student.overallRemark}.`
    : student?.result === 'NOT_PASSED' ? `Not passed: non-graded in ${(student.failedSubjects || []).join(', ')}.`
    : `Result incomplete: marks pending for ${(student?.missingSubjects || []).join(', ') || 'one or more subjects'}.`;
  const remark =
    student?.result === 'PASSED' ? REMARKS[student.overallGrade] || ''
    : student?.result === 'NOT_PASSED' ? 'Extra practice and support are needed in the subjects marked NG.'
    : 'The report will be completed once all subject marks are entered.';
  const credits = rows.reduce((s, m) => s + (Number(m.creditHours) || 0), 0);
  const logo = inst.logoUrl || '/brand/logo/icon.svg';

  return (
    <div className={`rc-sheet${dense ? ' rc-dense' : ''}`}>
      <div className="rc-frame" />
      <span className="rc-corner tl" /><span className="rc-corner tr" /><span className="rc-corner bl" /><span className="rc-corner br" />
      <div className="rc-mark">{provisional ? <b>PROVISIONAL</b> : <img src="/brand/logo/icon.svg" alt="" />}</div>
      <div className="rc-inner">
        <div className="rc-head">
          <img className="rc-logo" src={logo} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.visibility = 'hidden'; }} />
          <div className="rc-center">
            <div className="rc-gov">Government of Nepal</div>
            <div className="rc-min">Ministry of Education, Science and Technology • Curriculum Development Centre (CDC)</div>
            <div className="rc-school">{inst.name || 'School'}</div>
            {inst.nameNepali && <div className="rc-school-ne">{inst.nameNepali}</div>}
            <div className="rc-addr">{address ? `${address}, Nepal` : 'Nepal'}</div>
            <div className="rc-addr">EMIS Code: {inst.emisCode || '—'} • Academic Year {data?.academicYear?.name || ''} BS</div>
          </div>
          <div className="rc-logo-r"><b>REPORT NO.</b>{`${exam.code || 'EXAM'}-${String(student?.rollNumber ?? '').padStart(2, '0')}`}</div>
        </div>

        <div className="rc-ribbon">PROGRESS REPORT CARD</div>
        <div className="rc-exam">{exam.name || 'Examination'}</div>
        <div className="rc-dates">
          {fmtDate(exam.startDate)} to {fmtDate(exam.endDate)}
          {provisional && <span className="rc-prov">Provisional — results not yet published</span>}
        </div>

        <div className="rc-info">
          <div className="rc-f"><label>Student name</label><b>{student?.fullName}</b>{student?.fullNameNepali && <i>{student.fullNameNepali}</i>}</div>
          <div className="rc-f"><label>Roll number</label><b>{student?.rollNumber}</b></div>
          <div className="rc-f"><label>Class &amp; section</label><b>{cls.name || (cls.gradeNumber ? `Grade ${cls.gradeNumber}` : '')} — {sectionLabel(section.name)}</b></div>
          <div className="rc-f"><label>Admission no.</label><b>{student?.admissionNumber || '—'}</b></div>
          <div className="rc-f"><label>Medium</label><b>{section.medium === 'NEPALI' ? 'Nepali' : section.medium === 'ENGLISH' ? 'English' : 'Bilingual'}</b></div>
          <div className="rc-f"><label>Attendance</label><b>{att ? `${att.percentage}%  (${att.present + att.late}/${att.total} days)` : '—'}</b></div>
        </div>

        <table className="rc-table">
          <thead>
            <tr>
              <th style={{ width: 34 }}>S.N</th><th className="l">Subject</th><th>Credit hrs</th><th>Full marks</th><th>Pass marks</th>
              <th>Theory</th><th>Practical</th><th>Obtained</th><th>Grade</th><th>GPA</th><th className="l">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m, i) => (
              <tr key={m.assessmentId || i}>
                <td>{i + 1}</td>
                <td className="l s">{m.subjectName}</td>
                <td>{num(m.creditHours)}</td><td>{num(m.totalMarks)}</td><td>{num(m.passMarks)}</td>
                <td>{num(m.theoryMarks)}</td><td>{num(m.practicalMarks)}</td>
                <td className="o">{num(m.marksObtained)}</td>
                <td className={`g${m.grade === 'NG' ? ' ng' : ''}`}>{m.grade || '—'}</td>
                <td>{m.gpa === null || m.gpa === undefined ? '—' : Number(m.gpa).toFixed(2)}</td>
                <td className="l r">{m.remark || (m.isSubmitted ? '' : 'Pending')}</td>
              </tr>
            ))}
            <tr className="tot">
              <td />
              <td className="l">TOTAL</td>
              <td>{num(credits)}</td><td>{num(student?.totalFullMarks)}</td><td /><td /><td />
              <td>{num(student?.totalMarksObtained)}</td>
              <td>{student?.overallGrade}</td>
              <td>{student?.overallGpa ? Number(student.overallGpa).toFixed(2) : '—'}</td>
              <td />
            </tr>
          </tbody>
        </table>

        <div className="rc-sum">
          <div><label>Total marks</label><b className="sm">{num(student?.totalMarksObtained)} / {num(student?.totalMaxMarks)}</b></div>
          <div><label>Percentage</label><b>{student?.percentage}%</b></div>
          <div><label>Overall grade</label><b>{student?.overallGrade}</b></div>
          <div><label>GPA</label><b>{student?.overallGpa ? Number(student.overallGpa).toFixed(2) : '—'}</b></div>
          <div><label>Result</label><b className={`sm${student?.result === 'PASSED' ? '' : ' bad'}`}>{student?.result === 'PASSED' ? 'PASSED' : student?.result === 'NOT_PASSED' ? 'NOT PASSED' : 'INCOMPLETE'}</b></div>
          <div><label>Position</label><b className="sm">{student?.rank ? `${student.rank} of ${data?.rankedCount}` : '—'}</b></div>
        </div>
        <div className="rc-res"><strong>Result:</strong> {resultText}</div>

        <div className="rc-rem"><label>Class teacher’s remarks</label><p>{remark}</p></div>

        <div className="rc-scale">
          <label>CDC 2078 grading scale</label>
          <div className="rc-scale-g">
            {SCALE.map(([g, r, p]) => (<div key={g}><b>{g}</b>{r}<br />GPA {p}</div>))}
          </div>
        </div>

        <div className="rc-sign">
          <div className="c"><div className="ln" /><b>Class Teacher</b><span>{data?.classTeacher?.fullName || ''}</span></div>
          <div className="rc-seal">OFFICIAL<br />SEAL</div>
          <div className="c"><div className="ln" /><b>Principal / Headmaster</b><span>{data?.principal?.fullName || ''}</span></div>
        </div>
        <div className="rc-meta"><span>Date of issue: {fmtDate(new Date())}</span><span>Guardian’s signature:<span className="gs" /></span></div>
        <div className="rc-foot">Computer-generated report card of the Nepal Digital Education Platform — valid with the school seal and signatures.</div>
      </div>
    </div>
  );
};

export default ReportCardSheet;
