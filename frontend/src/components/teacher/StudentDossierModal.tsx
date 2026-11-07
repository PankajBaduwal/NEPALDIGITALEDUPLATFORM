import React, { useEffect, useState } from 'react';
import { X, Phone, MessageSquareText, TrendingUp } from 'lucide-react';
import { api } from '../../services/api';
import { formatDate } from '../../utils/dates';

interface Props { studentId: string; sectionId?: string; onClose: () => void }

const box: React.CSSProperties = { border: '1px solid #dcebe6', borderRadius: 12, padding: 14, background: '#fff' };
const h: React.CSSProperties = { fontSize: 11, fontWeight: 800, color: '#5f736f', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 };
const rateColor = (r: number | null) => (r === null ? '#5f736f' : r >= 90 ? '#0f5f55' : r >= 75 ? '#4c3fa8' : '#b91c1c');

/** Quick look at one student: attendance, results trend, guardian contact and remarks. Opened by clicking a student's name. */
export const StudentDossierModal: React.FC<Props> = ({ studentId, sectionId, onClose }) => {
  const [d, setD] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    api.get<any>(`/teacher/students/${studentId}/dossier${sectionId ? `?sectionId=${sectionId}` : ''}`).then((r) => live && setD(r)).catch((e: any) => live && setError(e.message || 'Could not load this student.'));
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', key);
    return () => { live = false; window.removeEventListener('keydown', key); };
  }, [studentId, sectionId, onClose]);

  const maxPct = Math.max(100, ...(d?.trend || []).map((t: any) => t.percent));
  return (
    <div role="presentation" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(14,62,59,0.5)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div role="dialog" aria-modal="true" aria-label="Student dossier" onClick={(e) => e.stopPropagation()} style={{ background: '#f4faf8', borderRadius: 16, width: 'min(760px, 100%)', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(14,62,59,0.35)' }}>
        <div style={{ position: 'sticky', top: 0, background: '#117a6b', color: '#fff', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: '16px 16px 0 0' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: 18 }}>
              {d?.student?.name || 'Student dossier'}
              {d?.student?.nameNepali && <span lang="ne" style={{ fontWeight: 700, fontSize: 14, marginLeft: 8, opacity: 0.9 }}>({d.student.nameNepali})</span>}
            </div>
            {d && <div style={{ fontSize: 12, opacity: 0.9 }}>{d.placement.className} · {d.placement.section} · Roll {d.placement.rollNumber} · Admission {d.placement.admissionNumber}</div>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ color: '#fff' }}><X size={20} /></button>
        </div>

        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
          {!d && !error && <div style={box}>Loading…</div>}
          {error && <div style={{ ...box, color: '#b91c1c' }}>{error}</div>}
          {d && (
            <>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div style={box}>
                  <div style={h}>Attendance</div>
                  <div style={{ fontSize: 30, fontWeight: 900, color: rateColor(d.attendance.rate) }}>{d.attendance.rate === null ? '—' : `${d.attendance.rate}%`}</div>
                  <div style={{ fontSize: 12, color: '#4b605b' }}>{d.attendance.present} present · {d.attendance.absent} absent · {d.attendance.late} late · {d.attendance.onLeave} leave</div>
                  <div style={{ fontSize: 12, color: '#4b605b', marginTop: 4 }}>Last 30 days: <b style={{ color: rateColor(d.attendance.last30Rate) }}>{d.attendance.last30Rate === null ? '—' : `${d.attendance.last30Rate}%`}</b></div>
                  {d.attendance.recentAbsences.length > 0 && <div style={{ fontSize: 11, color: '#b91c1c', marginTop: 6 }}>Recent absences: {d.attendance.recentAbsences.map((x: string) => formatDate(x).replace(/ \(.*\)/, '')).join(', ')}</div>}
                </div>
                <div style={box}>
                  <div style={h}>Guardian</div>
                  <div style={{ fontWeight: 700 }}>{d.guardian.name || 'Not recorded'}{d.guardian.relation ? ` (${String(d.guardian.relation).toLowerCase()})` : ''}</div>
                  {d.guardian.phoneVisible ? (
                    <a href={d.guardian.phone ? `tel:${d.guardian.phone}` : undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0f5f55', fontWeight: 700, marginTop: 6 }}><Phone size={14} /> {d.guardian.phone || 'No number on file'}</a>
                  ) : (
                    <div style={{ fontSize: 12, color: '#5f736f', marginTop: 6 }}><Phone size={13} style={{ verticalAlign: -2 }} /> {d.guardian.phoneMasked}. The full number is available to the class teacher.</div>
                  )}
                </div>
              </div>

              <div style={box}>
                <div style={{ ...h, display: 'flex', gap: 6, alignItems: 'center' }}><TrendingUp size={13} /> Results trend {d.viewer.isClassTeacher ? '(all subjects)' : '(your subject)'}</div>
                {d.trend.length === 0 ? <div style={{ fontSize: 13, color: '#5f736f' }}>No marks recorded yet.</div> : (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 120 }}>
                    {d.trend.map((t: any) => (
                      <div key={t.exam} style={{ flex: 1, minWidth: 40, textAlign: 'center' }} title={`${t.exam}: ${t.percent}% (GPA ${t.gpa})`}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#0f5f55' }}>{t.percent}%</div>
                        <div style={{ height: `${Math.max(6, (t.percent / maxPct) * 80)}px`, background: '#117a6b', borderRadius: '4px 4px 0 0', margin: '2px auto 4px', width: '70%' }} />
                        <div style={{ fontSize: 10, color: '#5f736f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.exam}</div>
                      </div>
                    ))}
                  </div>
                )}
                {d.marks.length > 0 && (
                  <div style={{ overflowX: 'auto', marginTop: 10 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                      <thead><tr style={{ color: '#5f736f', textAlign: 'left' }}><th>Exam</th><th>Subject</th><th>Marks</th><th>%</th><th>Grade</th></tr></thead>
                      <tbody>
                        {d.marks.slice(0, 12).map((m: any, i: number) => (
                          <tr key={i} style={{ borderTop: '1px solid #ebf5f1' }}><td style={{ padding: '4px 0' }}>{m.exam}</td><td>{m.subject}</td><td>{m.absent ? 'Absent' : `${m.obtained}/${m.total}`}</td><td>{m.percent ?? '—'}</td><td>{m.grade}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div style={box}>
                <div style={{ ...h, display: 'flex', gap: 6, alignItems: 'center' }}><MessageSquareText size={13} /> Remarks & interventions</div>
                {d.remarks.length === 0 ? <div style={{ fontSize: 13, color: '#5f736f' }}>No remarks recorded.</div> : d.remarks.map((r: any) => (
                  <div key={r.id} style={{ padding: '8px 0', borderTop: '1px solid #ebf5f1', fontSize: 13 }}>
                    <div style={{ fontWeight: 700 }}>{r.title || (r.kind === 'INTERVENTION' ? 'Intervention' : 'Remark')} <span style={{ fontWeight: 500, color: '#5f736f', fontSize: 11 }}>· {r.by}{r.subject ? ` · ${r.subject}` : ''} · {formatDate(r.at)}</span></div>
                    <div style={{ color: '#2f4f4c' }}>{r.text}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
