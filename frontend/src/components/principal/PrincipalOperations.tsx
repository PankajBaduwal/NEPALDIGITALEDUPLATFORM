import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Siren, CheckCircle2, UserMinus, MonitorPlay, Stamp, FileText, Upload, Trash2, RefreshCw, AlertTriangle, Undo2, Download } from 'lucide-react';
import { api } from '../../services/api';
import { useDialogs } from '../common/Dialogs';

const TEAL = '#117a6b', TEAL_DARK = '#0f5f55', TEAL_BG = '#effaf6', TEAL_BORDER = '#bfeede';
const card: React.CSSProperties = { background: '#fff', border: '1px solid #dcebe6', borderRadius: 16, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const field: React.CSSProperties = { padding: '9px 11px', borderRadius: 8, border: '1px solid #cfdcd8', fontSize: 13, background: '#fff', width: '100%', minWidth: 0, fontFamily: 'inherit' };
const lab: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#4b605b', marginBottom: 4, display: 'block' };
const btn = (bg: string, color = '#fff', border = bg): React.CSSProperties => ({ background: bg, color, border: `1px solid ${border}`, padding: '9px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' });
const grid = (min = 200): React.CSSProperties => ({ display: 'grid', gap: 12, gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))` });
const today = () => new Date().toISOString().slice(0, 10);
const when = (d: any) => new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const Title: React.FC<{ icon: React.ReactNode; title: string; sub: string }> = ({ icon, title, sub }) => (
  <div style={{ ...card, display: 'flex', gap: 14, alignItems: 'center' }}>
    <div style={{ color: TEAL }}>{icon}</div>
    <div><div style={{ fontWeight: 800, fontSize: 16, color: '#0e3e3b' }}>{title}</div><div style={{ fontSize: 12, color: '#5f736f' }}>{sub}</div></div>
  </div>
);
const Note: React.FC<{ tone: 'warn' | 'ok' | 'bad'; children: React.ReactNode }> = ({ tone, children }) => (
  <div role="status" style={{ padding: '10px 12px', borderRadius: 10, fontSize: 12.5, background: tone === 'warn' ? '#f5f3ff' : tone === 'ok' ? '#e6f7f0' : '#fef2f2', color: tone === 'warn' ? '#3b2f8f' : tone === 'ok' ? '#0f4c4a' : '#991b1b', border: `1px solid ${tone === 'warn' ? '#ddd6fe' : tone === 'ok' ? '#bfeede' : '#fecaca'}` }}>{children}</div>
);

/** Authenticated file download (PDF) with a readable error when the server refuses. */
async function fetchFile(path: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<string> {
  const res = await fetch(`/api/v1${path}`, { method, headers: { Authorization: `Bearer ${localStorage.getItem('nepal_edu_token') || ''}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.message || (typeof j.error === 'string' ? j.error : j.error?.message) || `Request failed (${res.status})`);
  }
  const name = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') || '')?.[1] || 'document.pdf';
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return name;
}

// ── 1. Emergency alert ────────────────────────────────────────────────────────────────────
const PRESETS = [
  { label: 'School closed today', kind: 'CLOSURE', title: 'School closed today', message: 'The school is closed today. Students should stay at home. We will inform you when classes resume.' },
  { label: 'School closed tomorrow', kind: 'CLOSURE', title: 'School closed tomorrow', message: 'The school will remain closed tomorrow. Please wait for the next notice about when classes resume.' },
  { label: 'Extreme weather / flood', kind: 'WEATHER', title: 'Weather alert: school closed', message: 'Because of extreme weather and flood risk the school is closed today. Please keep children safely at home.' },
  { label: 'Safety alert', kind: 'SAFETY', title: 'Safety alert', message: 'A safety situation needs attention. Parents should not send children to school until further notice.' },
];
const KINDS: Array<[string, string]> = [['CLOSURE', 'School closure'], ['WEATHER', 'Weather alert'], ['SAFETY', 'Safety alert'], ['OTHER', 'Other urgent notice']];

export const EmergencyAlertPanel: React.FC = () => {
  const { toast, confirm } = useDialogs();
  const [f, setF] = useState({ kind: 'CLOSURE', title: '', message: '', closureDate: '', teachers: true, students: true, sms: true });
  const [list, setList] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [last, setLast] = useState<any>(null);
  const load = useCallback(() => api.get<any>('/principal-tools/emergency').then(setList).catch((e: any) => toast(e.message || 'Could not load alerts', 'error')), [toast]);
  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  const send = async () => {
    if (f.message.trim().length < 5) { toast('Write the alert message first.', 'error'); return; }
    const who = [f.teachers && 'all teachers', f.students && 'all students', f.sms && 'guardians by SMS'].filter(Boolean).join(', ');
    if (!(await confirm(`This sends an URGENT alert to ${who || 'school staff'} right away and cannot be recalled.\n\n"${f.message.trim()}"`, { title: 'Send emergency alert?', confirmLabel: 'Send now', danger: true }))) return;
    setBusy(true);
    try {
      const r = await api.post<any>('/principal-tools/emergency', { ...f, closureDate: f.closureDate || undefined, confirm: true });
      setLast(r); toast('Alert sent.', 'success'); setF({ ...f, title: '', message: '' }); await load();
    } catch (e: any) { toast(e.message || 'Could not send the alert', 'error'); } finally { setBusy(false); }
  };
  const clear = async (a: any) => {
    if (!(await confirm('Tell everyone the alert is over and normal activities continue?', { title: 'Send all-clear?', confirmLabel: 'Send all-clear' }))) return;
    try { await api.post(`/principal-tools/emergency/${a.id}/clear`, {}); toast('All-clear sent.', 'success'); await load(); } catch (e: any) { toast(e.message || 'Could not send all-clear', 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Title icon={<Siren size={24} />} title="Emergency Alerts" sub="Instantly notify teachers, students and guardians about a closure, extreme weather or a safety issue." />
      {list && !list.smsConfigured && <Note tone="warn"><AlertTriangle size={13} style={{ verticalAlign: -2 }} /> SMS is not set up on this server, so guardians will <b>not</b> receive text messages yet. In-app alerts still reach teachers and students. Ask your administrator to add the SMS provider settings to the server.</Note>}
      <div style={card}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {PRESETS.map((p) => <button key={p.label} type="button" onClick={() => setF({ ...f, kind: p.kind, title: p.title, message: p.message })} style={btn('#fff', TEAL_DARK, TEAL_BORDER)}>{p.label}</button>)}
        </div>
        <div style={grid(220)}>
          <label><span style={lab}>Type</span><select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} style={field}>{KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
          <label><span style={lab}>Headline</span><input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={160} placeholder="Defaults to the type" style={field} /></label>
          <label><span style={lab}>Closure date (optional)</span><input type="date" value={f.closureDate} onChange={(e) => setF({ ...f, closureDate: e.target.value })} style={field} /></label>
        </div>
        <label style={{ display: 'block', marginTop: 12 }}><span style={lab}>Message * <span style={{ fontWeight: 500, color: f.message.length > 480 ? '#b91c1c' : '#8da19d' }}>({f.message.length}/480, kept short so it fits an SMS)</span></span>
          <textarea rows={3} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} maxLength={480} style={field} placeholder="Write what people must do." />
        </label>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', margin: '12px 0', fontSize: 13 }}>
          <label><input type="checkbox" checked={f.teachers} onChange={(e) => setF({ ...f, teachers: e.target.checked })} /> Teachers (in-app)</label>
          <label><input type="checkbox" checked={f.students} onChange={(e) => setF({ ...f, students: e.target.checked })} /> Students (in-app)</label>
          <label><input type="checkbox" checked={f.sms} onChange={(e) => setF({ ...f, sms: e.target.checked })} /> Guardians and staff by SMS</label>
        </div>
        <button type="button" disabled={busy || f.message.trim().length < 5} onClick={send} style={{ ...btn('#dc2626'), opacity: busy || f.message.trim().length < 5 ? 0.6 : 1 }}><Siren size={15} /> {busy ? 'Sending…' : 'Send emergency alert'}</button>
      </div>
      {last && (
        <Note tone={last.sms.status === 'NOT_CONFIGURED' ? 'warn' : 'ok'}>
          Alert sent to <b>{last.inApp}</b> people in the app.{' '}
          {!last.sms.requested ? 'SMS was not requested.' : last.sms.status === 'NOT_CONFIGURED' ? `SMS is not configured: ${last.sms.numbers} valid numbers were found but nothing was texted.` : last.sms.status === 'NO_NUMBERS' ? 'No valid mobile numbers were found for SMS.' : `Texting ${last.sms.numbers} numbers now; progress shows in the history below.`}
          {last.sms.invalidNumbers > 0 && ` ${last.sms.invalidNumbers} guardian/staff numbers on file are not valid Nepal mobile numbers and were skipped.`}
        </Note>
      )}
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '14px 20px', fontWeight: 800 }}>Alert history</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 640 }}>
          <thead><tr style={{ color: '#5f736f', textAlign: 'left', fontSize: 11, textTransform: 'uppercase' }}><th style={{ padding: '8px 20px' }}>Sent</th><th>Alert</th><th>In-app</th><th>SMS</th><th>Status</th><th /></tr></thead>
          <tbody>
            {list === null && <tr><td colSpan={6} style={{ padding: 16 }}>Loading…</td></tr>}
            {list?.alerts.length === 0 && <tr><td colSpan={6} style={{ padding: 16, color: '#5f736f' }}>No emergency alerts have been sent.</td></tr>}
            {list?.alerts.map((a: any) => (
              <tr key={a.id} style={{ borderTop: '1px solid #ebf5f1', verticalAlign: 'top' }}>
                <td style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>{when(a.sentAt)}<div style={{ fontSize: 11, color: '#8da19d' }}>{a.sentBy}</div></td>
                <td style={{ padding: '10px 8px', maxWidth: 320 }}><b>{a.title}</b><div style={{ color: '#5f736f' }}>{a.message}</div></td>
                <td style={{ padding: '10px 8px' }}>{a.stats?.inApp ?? 0}</td>
                <td style={{ padding: '10px 8px', fontSize: 12 }}>{!a.stats?.smsConfigured ? <span style={{ color: '#3b2f8f' }}>{a.stats?.smsPrepared || 0} not sent (SMS off)</span> : <>{a.stats?.smsSent || 0} sent{a.stats?.smsFailed ? <span style={{ color: '#b91c1c' }}>, {a.stats.smsFailed} failed</span> : null}</>}{a.stats?.smsInvalid ? <div style={{ color: '#8da19d' }}>{a.stats.smsInvalid} invalid numbers</div> : null}</td>
                <td style={{ padding: '10px 8px' }}><span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: a.status === 'ACTIVE' ? '#fee2e2' : '#e6f7f0', color: a.status === 'ACTIVE' ? '#b91c1c' : '#0f5f55' }}>{a.status === 'ACTIVE' ? 'Active' : 'Cleared'}</span></td>
                <td style={{ padding: '10px 16px', textAlign: 'right' }}>{a.status === 'ACTIVE' && <button type="button" onClick={() => clear(a)} style={{ color: TEAL_DARK, fontWeight: 700, fontSize: 12 }}><CheckCircle2 size={13} style={{ verticalAlign: -2 }} /> All clear</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── 2. Teacher absence and cover ──────────────────────────────────────────────────────────
export const TeacherCoverPanel: React.FC = () => {
  const { toast, confirm } = useDialogs();
  const [teachers, setTeachers] = useState<Array<{ id: string; name: string }>>([]);
  const [teacherId, setTeacherId] = useState('');
  const [date, setDate] = useState(today());
  const [leaveType, setLeaveType] = useState('SICK');
  const [reason, setReason] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [pick, setPick] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [absences, setAbsences] = useState<any[]>([]);

  useEffect(() => { api.get<any[]>('/principal-tools/teachers').then(setTeachers).catch(() => setTeachers([])); }, []);
  const loadAbsences = useCallback(() => api.get<any[]>(`/principal-tools/cover/absences?date=${date}`).then(setAbsences).catch(() => setAbsences([])), [date]);
  useEffect(() => { loadAbsences(); }, [loadAbsences]);
  const loadPlan = useCallback(async () => {
    setResult(null);
    if (!teacherId) { setPlan(null); return; }
    try {
      const p = await api.get<any>(`/principal-tools/cover/plan?teacherId=${teacherId}&date=${date}`);
      setPlan(p);
      const init: Record<string, string> = {};
      for (const x of p.periods) if (!x.covered && x.suggested) init[x.entryId] = x.suggested;
      setPick(init);
    } catch (e: any) { setPlan(null); toast(e.message || 'Could not build the cover plan', 'error'); }
  }, [teacherId, date, toast]);
  useEffect(() => { loadPlan(); }, [loadPlan]);

  const apply = async () => {
    const assignments = Object.entries(pick).filter(([, v]) => v).map(([timetableEntryId, substituteTeacherId]) => ({ timetableEntryId, substituteTeacherId }));
    const open = plan.periods.filter((p: any) => !p.covered).length;
    if (!(await confirm(`Assign cover for ${assignments.length} of ${open} open period(s) and notify the substitute teachers?`, { title: `Cover for ${plan.teacher.name}`, confirmLabel: 'Assign cover' }))) return;
    setBusy(true);
    try {
      const r = await api.post<any>('/principal-tools/cover/apply', { teacherId, date, leaveType, reason, assignments, auto: false });
      setResult(r); toast(`${r.assigned.length} period(s) covered.`, r.unresolved.length ? 'info' : 'success'); await loadPlan(); await loadAbsences();
    } catch (e: any) { toast(e.message || 'Could not assign cover', 'error'); } finally { setBusy(false); }
  };
  const undo = async (a: any) => {
    if (!(await confirm(`Cancel the leave and the cover arranged for ${a.teacher}?`, { title: 'Undo cover?', confirmLabel: 'Undo', danger: true }))) return;
    try { await api.delete(`/principal-tools/cover/absences/${a.id}`); toast('Cover cancelled.', 'success'); await loadAbsences(); await loadPlan(); } catch (e: any) { toast(e.message || 'Could not cancel', 'error'); }
  };
  const open = plan ? plan.periods.filter((p: any) => !p.covered) : [];
  const chosen = Object.values(pick).filter(Boolean).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Title icon={<UserMinus size={24} />} title="Teacher Absence & Cover" sub="When a teacher is away, fill all of the day's periods with free teachers in one step." />
      <div style={card}>
        <div style={grid(190)}>
          <label><span style={lab}>Teacher who is away</span><select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} style={field}><option value="">Choose a teacher…</option>{teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
          <label><span style={lab}>Date</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={field} /></label>
          <label><span style={lab}>Leave type</span><select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} style={field}><option value="SICK">Sick</option><option value="CASUAL">Casual</option><option value="OFFICIAL">Official duty</option><option value="OTHER">Other</option></select></label>
          <label><span style={lab}>Note (optional)</span><input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} style={field} /></label>
        </div>
      </div>

      {plan && (
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 800 }}>{plan.teacher.name}: {plan.day.charAt(0) + plan.day.slice(1).toLowerCase()}, {plan.date}</div>
            <span style={{ fontSize: 12, color: '#5f736f' }}>{plan.periods.length === 0 ? 'No periods on this day.' : `${plan.periods.length} period(s), ${open.length} still open`}</span>
            {open.length > 0 && <button type="button" disabled={busy || !chosen} onClick={apply} style={{ ...btn(TEAL), marginLeft: 'auto', opacity: busy || !chosen ? 0.6 : 1 }}><UserMinus size={15} /> {busy ? 'Assigning…' : `Assign cover for ${chosen} period${chosen === 1 ? '' : 's'}`}</button>}
          </div>
          {plan.periods.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 620 }}>
              <thead><tr style={{ color: '#5f736f', textAlign: 'left', fontSize: 11, textTransform: 'uppercase' }}><th style={{ padding: '8px 20px' }}>Period</th><th>Class</th><th>Subject</th><th>Cover teacher</th></tr></thead>
              <tbody>
                {plan.periods.map((p: any) => (
                  <tr key={p.entryId} style={{ borderTop: '1px solid #ebf5f1' }}>
                    <td style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>{p.periodNumber}<div style={{ fontSize: 11, color: '#8da19d' }}>{p.startTime}-{p.endTime}</div></td>
                    <td style={{ padding: '10px 8px' }}>{p.section}</td>
                    <td style={{ padding: '10px 8px' }}>{p.subject}</td>
                    <td style={{ padding: '8px 8px' }}>
                      {p.covered ? <span style={{ color: '#0f5f55', fontWeight: 700 }}><CheckCircle2 size={14} style={{ verticalAlign: -3 }} /> {p.covered.teacherName}</span>
                        : p.candidates.length === 0 ? <span style={{ color: '#b91c1c' }}>No free teacher this period</span>
                        : <select value={pick[p.entryId] || ''} onChange={(e) => setPick({ ...pick, [p.entryId]: e.target.value })} style={{ ...field, minWidth: 220 }}>
                            <option value="">Leave uncovered</option>
                            {p.candidates.map((c: any) => <option key={c.id} value={c.id}>{c.name}{c.sameSubject ? ' · teaches this subject' : c.sameSection ? ' · knows this class' : ''}{c.load ? ` · ${c.load} period${c.load > 1 ? 's' : ''} today` : ''}</option>)}
                          </select>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {result && (
        <Note tone={result.unresolved.length ? 'warn' : 'ok'}>
          {result.assigned.length} period(s) covered{result.alreadyCovered.length ? `, ${result.alreadyCovered.length} were already covered` : ''}. Substitute teachers have been notified.
          {result.unresolved.map((u: any) => <div key={u.period}>Period {u.period} ({u.section}): {u.error}</div>)}
        </Note>
      )}
      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Teachers away on {date}</div>
        {absences.length === 0 ? <div style={{ fontSize: 13, color: '#5f736f' }}>No absences recorded for this day.</div> : absences.map((a) => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: '1px solid #ebf5f1', fontSize: 13, flexWrap: 'wrap' }}>
            <b>{a.teacher}</b><span style={{ color: '#5f736f' }}>{a.leaveType.toLowerCase()}{a.reason ? `: ${a.reason}` : ''}</span>
            <span style={{ marginLeft: 'auto', color: a.periodsCovered >= a.periodsAffected ? '#0f5f55' : '#4c3fa8', fontWeight: 700 }}>{a.periodsCovered}/{a.periodsAffected} periods covered</span>
            <button type="button" onClick={() => undo(a)} style={{ color: '#b91c1c', fontSize: 12, fontWeight: 700 }}><Undo2 size={13} style={{ verticalAlign: -2 }} /> Undo</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── 3. Live Smart Board classrooms ────────────────────────────────────────────────────────
export const LiveClassroomsPanel: React.FC = () => {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState('');
  const [at, setAt] = useState<Date | null>(null);
  const load = useCallback(() => api.get<any>('/principal-tools/live-classrooms').then((r) => { setD(r); setErr(''); setAt(new Date()); }).catch((e: any) => setErr(e.message || 'Could not load live classrooms')), []);
  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [load]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Title icon={<MonitorPlay size={24} />} title="Live Smart Board Classrooms" sub="Which classrooms have a Smart Board lesson open right now, and what is being taught. Refreshes every 20 seconds." />
      {err && <Note tone="bad">{err}</Note>}
      {d && (
        <>
          <div style={grid(170)}>
            {[['Live now', d.totals.live, '#0f5f55'], ['Paused', d.totals.paused, '#4c3fa8'], ['Periods in progress', d.totals.scheduledNow, '#0e3e3b']].map(([l, v, c]: any) => (
              <div key={l} style={card}><div style={{ fontSize: 28, fontWeight: 900, color: c }}>{v}</div><div style={{ fontSize: 12, color: '#5f736f' }}>{l}</div></div>
            ))}
            <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#5f736f' }}>
              <div style={{ flex: 1 }}>{d.now.day.charAt(0) + d.now.day.slice(1).toLowerCase()} {d.now.time} (Nepal time){at && <div>Updated {at.toLocaleTimeString()}</div>}</div>
              <button type="button" onClick={load} aria-label="Refresh" style={{ color: TEAL_DARK }}><RefreshCw size={16} /></button>
            </div>
          </div>
          <div style={grid(300)}>
            {d.sessions.length === 0 && <div style={{ ...card, color: '#5f736f', fontSize: 13, gridColumn: '1 / -1' }}>No Smart Board lesson is open right now.</div>}
            {d.sessions.map((s: any) => (
              <div key={s.id} style={{ ...card, borderLeft: `4px solid ${s.status === 'ACTIVE' ? '#1fb589' : '#6d5bd0'}` }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <b style={{ fontSize: 15 }}>{s.className} {s.section}</b>
                  <span style={{ padding: '1px 9px', borderRadius: 999, fontSize: 10.5, fontWeight: 800, background: s.status === 'ACTIVE' ? '#daf5ec' : '#ede9fe', color: s.status === 'ACTIVE' ? '#0f4c4a' : '#3b2f8f' }}>{s.status === 'ACTIVE' ? 'LIVE' : 'PAUSED'}</span>
                  {s.stale && <span title="Open for more than 8 hours; the teacher may have forgotten to end it" style={{ fontSize: 10.5, color: '#b91c1c', fontWeight: 800 }}>STALE</span>}
                  <span style={{ marginLeft: 'auto', fontSize: 12, color: '#5f736f' }}>{s.minutes} min</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 13 }}><b>{s.subject}</b> with {s.teacher}</div>
                <div style={{ fontSize: 12.5, color: '#2f4f4c', marginTop: 4 }}>
                  {s.chapterTitle || s.lessonTitle ? <>{s.chapterNumber ? `Chapter ${s.chapterNumber}: ` : ''}{s.chapterTitle}{s.lessonTitle ? ` · ${s.lessonTitle}` : ''}</> : <span style={{ color: '#8da19d' }}>No chapter selected yet</span>}
                </div>
                {s.textbook && <div style={{ fontSize: 11.5, color: '#5f736f' }}>{s.textbook}</div>}
                {s.resources.length > 0 && <div style={{ fontSize: 11.5, color: '#5f736f', marginTop: 4 }}>Using: {s.resources.map((r: any) => r.name).join(', ')}</div>}
              </div>
            ))}
          </div>
          <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
            <div style={{ padding: '14px 20px', fontWeight: 800 }}>Timetabled right now</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 560 }}>
              <thead><tr style={{ color: '#5f736f', textAlign: 'left', fontSize: 11, textTransform: 'uppercase' }}><th style={{ padding: '8px 20px' }}>Period</th><th>Class</th><th>Subject</th><th>Teacher</th><th>Smart Board</th></tr></thead>
              <tbody>
                {d.scheduledNow.length === 0 && <tr><td colSpan={5} style={{ padding: 16, color: '#5f736f' }}>No period is in progress at this time.</td></tr>}
                {d.scheduledNow.map((p: any, i: number) => (
                  <tr key={i} style={{ borderTop: '1px solid #ebf5f1' }}>
                    <td style={{ padding: '9px 20px' }}>{p.period}<div style={{ fontSize: 11, color: '#8da19d' }}>{p.time}</div></td><td>{p.section}</td><td>{p.subject}</td><td>{p.teacher}</td>
                    <td><span style={{ fontWeight: 700, color: p.usingSmartBoard ? '#0f5f55' : '#8da19d' }}>{p.usingSmartBoard ? 'In use' : 'Not in use'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// ── 4. Reports, stamp and signature, marksheets and certificates ──────────────────────────
const readPng = (file: File): Promise<string> => new Promise((resolve, reject) => {
  if (file.type !== 'image/png') return reject(new Error('Please choose a PNG image.'));
  if (file.size > 800 * 1024) return reject(new Error('The image is larger than 800 KB. Use a smaller scan.'));
  const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = () => reject(new Error('Could not read the file.')); r.readAsDataURL(file);
});

const StudentPicker: React.FC<{ value: any; onChange: (s: any) => void }> = ({ value, onChange }) => {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    if (q.trim().length < 2) { setRows([]); return; }
    const t = setTimeout(() => api.get<any[]>(`/principal-tools/students?q=${encodeURIComponent(q.trim())}`).then(setRows).catch(() => setRows([])), 250);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <div>
      <span style={lab}>Student</span>
      {value ? <div style={{ ...field, display: 'flex', alignItems: 'center', gap: 8 }}><b>{value.name}</b><span style={{ color: '#5f736f' }}>{value.className}</span><button type="button" onClick={() => onChange(null)} style={{ marginLeft: 'auto', color: '#b91c1c', fontSize: 12 }}>Change</button></div> : (
        <>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type at least 2 letters of the name" style={field} />
          {rows.length > 0 && <div style={{ border: '1px solid #dcebe6', borderRadius: 8, marginTop: 4, maxHeight: 180, overflowY: 'auto' }}>{rows.map((r) => <button key={r.id} type="button" onClick={() => { onChange(r); setQ(''); setRows([]); }} style={{ display: 'flex', width: '100%', justifyContent: 'space-between', padding: '7px 10px', fontSize: 13, textAlign: 'left', borderTop: '1px solid #ebf5f1' }}><span>{r.name}</span><span style={{ color: '#5f736f' }}>{r.className}{r.roll ? ` · Roll ${r.roll}` : ''}</span></button>)}</div>}
        </>
      )}
    </div>
  );
};

export const SchoolDocumentsPanel: React.FC = () => {
  const { toast, confirm } = useDialogs();
  const [seal, setSeal] = useState<any>(null);
  const [signer, setSigner] = useState({ name: '', title: 'Principal' });
  const [stamp, setStamp] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [busy, setBusy] = useState('');
  const [student, setStudent] = useState<any>(null);
  const [examName, setExamName] = useState('');
  const [tc, setTc] = useState({ leavingDate: today(), reason: '', conduct: 'Good', duesCleared: true, remarks: '', markTransferred: false });
  const [tcs, setTcs] = useState<any[]>([]);
  const stampRef = useRef<HTMLInputElement>(null);
  const sigRef = useRef<HTMLInputElement>(null);

  const loadSeal = useCallback(() => api.get<any>('/principal-tools/seal').then((s) => { setSeal(s); setSigner({ name: s.signerName || '', title: s.signerTitle || 'Principal' }); }).catch(() => setSeal({})), []);
  const loadTcs = useCallback(() => api.get<any[]>('/principal-tools/transfer-certificates').then(setTcs).catch(() => setTcs([])), []);
  useEffect(() => { loadSeal(); loadTcs(); }, [loadSeal, loadTcs]);

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>, set: (v: string) => void) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    try { set(await readPng(file)); } catch (err: any) { toast(err.message, 'error'); }
  };
  const saveSeal = async (extra: any = {}) => {
    setBusy('seal');
    try {
      const s = await api.put<any>('/principal-tools/seal', { ...(stamp ? { stamp } : {}), ...(sig ? { signature: sig } : {}), signerName: signer.name, signerTitle: signer.title, ...extra });
      setSeal(s); setStamp(null); setSig(null); toast('Stamp and signature saved.', 'success');
    } catch (err: any) { toast(err.message || 'Could not save', 'error'); } finally { setBusy(''); }
  };
  const dl = async (key: string, path: string, method: 'GET' | 'POST' = 'GET', body?: any) => {
    setBusy(key);
    try { const name = await fetchFile(path, method, body); toast(`${name} downloaded.`, 'success'); return true; } catch (err: any) { toast(err.message || 'Download failed', 'error'); return false; } finally { setBusy(''); }
  };
  const issueTc = async () => {
    if (!student) return;
    if (!(await confirm(`Issue a transfer certificate to ${student.name}?${tc.markTransferred ? '\n\nThe student will also be marked as TRANSFERRED and leave the class roll.' : ''}`, { title: 'Issue certificate?', confirmLabel: 'Issue', danger: tc.markTransferred }))) return;
    if (await dl('tc', `/principal-tools/transfer-certificates/${student.id}`, 'POST', tc)) { await loadTcs(); setStudent(null); setTc({ ...tc, reason: '', remarks: '', markTransferred: false }); }
  };
  const hasSeal = !!(seal?.stamp || seal?.signature);
  const preview = (src: string | null, empty: string) => <div style={{ height: 90, border: '1px dashed #cfdcd8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4faf8', color: '#8da19d', fontSize: 12 }}>{src ? <img src={src} alt="" style={{ maxHeight: 84, maxWidth: '100%' }} /> : empty}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Title icon={<Stamp size={24} />} title="Reports, Stamp & Certificates" sub="Annual performance report, the school stamp and principal signature, marksheets and transfer certificates." />

      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 4 }}>Annual School Performance Report</div>
        <div style={{ fontSize: 12.5, color: '#5f736f', marginBottom: 10 }}>A print-ready PDF with the school letterhead and EMIS number from your school profile, enrolment, faculty summary, pass-rate chart, class and section rankings and top students. Only approved or published terminal results are counted.</div>
        <button type="button" disabled={busy === 'annual'} onClick={() => dl('annual', '/principal-tools/reports/annual')} style={{ ...btn(TEAL), opacity: busy === 'annual' ? 0.6 : 1 }}><Download size={15} /> {busy === 'annual' ? 'Preparing…' : 'Generate annual report (PDF)'}</button>
      </div>

      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 4 }}>School stamp and principal's signature</div>
        <div style={{ fontSize: 12.5, color: '#5f736f', marginBottom: 12 }}>Upload scanned PNG images (under 800 KB, ideally with a transparent background). They are placed automatically on <b>approved</b> marksheets, transfer certificates and the annual report. Marksheets for results that are not yet approved are watermarked and left unstamped.</div>
        <div style={grid(240)}>
          <div><span style={lab}>School stamp {stamp && <i style={{ color: TEAL_DARK }}>(new, not saved yet)</i>}</span>{preview(stamp || seal?.stamp || null, 'No stamp uploaded')}
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}><input ref={stampRef} type="file" accept="image/png" hidden onChange={(e) => pickImage(e, setStamp)} /><button type="button" onClick={() => stampRef.current?.click()} style={btn('#fff', TEAL_DARK, TEAL_BORDER)}><Upload size={14} /> Choose PNG</button>{seal?.stamp && !stamp && <button type="button" onClick={async () => { if (await confirm('Remove the stamp?', { confirmLabel: 'Remove', danger: true })) saveSeal({ clearStamp: true }); }} style={{ color: '#b91c1c' }} aria-label="Remove stamp"><Trash2 size={15} /></button>}</div></div>
          <div><span style={lab}>Principal's signature {sig && <i style={{ color: TEAL_DARK }}>(new, not saved yet)</i>}</span>{preview(sig || seal?.signature || null, 'No signature uploaded')}
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}><input ref={sigRef} type="file" accept="image/png" hidden onChange={(e) => pickImage(e, setSig)} /><button type="button" onClick={() => sigRef.current?.click()} style={btn('#fff', TEAL_DARK, TEAL_BORDER)}><Upload size={14} /> Choose PNG</button>{seal?.signature && !sig && <button type="button" onClick={async () => { if (await confirm('Remove the signature?', { confirmLabel: 'Remove', danger: true })) saveSeal({ clearSignature: true }); }} style={{ color: '#b91c1c' }} aria-label="Remove signature"><Trash2 size={15} /></button>}</div></div>
          <div><label><span style={lab}>Name printed under the signature</span><input value={signer.name} onChange={(e) => setSigner({ ...signer, name: e.target.value })} maxLength={120} style={field} /></label>
            <label style={{ display: 'block', marginTop: 8 }}><span style={lab}>Title</span><input value={signer.title} onChange={(e) => setSigner({ ...signer, title: e.target.value })} maxLength={80} style={field} /></label></div>
        </div>
        <button type="button" disabled={busy === 'seal'} onClick={() => saveSeal()} style={{ ...btn(TEAL), marginTop: 12, opacity: busy === 'seal' ? 0.6 : 1 }}>{busy === 'seal' ? 'Saving…' : 'Save stamp and signature'}</button>
        {!hasSeal && <div style={{ marginTop: 10 }}><Note tone="warn">No stamp or signature is saved yet, so official documents will have blank signature areas.</Note></div>}
      </div>

      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 10 }}>Student documents</div>
        <div style={{ maxWidth: 420 }}><StudentPicker value={student} onChange={setStudent} /></div>
        {student && (
          <div style={{ marginTop: 14, display: 'grid', gap: 16 }}>
            <div style={{ border: `1px solid ${TEAL_BORDER}`, background: TEAL_BG, borderRadius: 12, padding: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}><FileText size={15} style={{ verticalAlign: -3 }} /> Terminal marksheet</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end' }}>
                <label style={{ flex: '1 1 240px' }}><span style={lab}>Examination name (blank = latest approved)</span><input value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="e.g. First Terminal Examination 2083" style={field} /></label>
                <button type="button" disabled={busy === 'ms'} onClick={() => dl('ms', `/principal-tools/marksheet/${student.id}${examName.trim() ? `?examName=${encodeURIComponent(examName.trim())}` : ''}`)} style={{ ...btn(TEAL), opacity: busy === 'ms' ? 0.6 : 1 }}><Download size={15} /> {busy === 'ms' ? 'Preparing…' : 'Download marksheet'}</button>
              </div>
            </div>
            <div style={{ border: '1px solid #dcebe6', borderRadius: 12, padding: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}><FileText size={15} style={{ verticalAlign: -3 }} /> Transfer certificate</div>
              <div style={grid(190)}>
                <label><span style={lab}>Date of leaving *</span><input type="date" value={tc.leavingDate} onChange={(e) => setTc({ ...tc, leavingDate: e.target.value })} style={field} /></label>
                <label><span style={lab}>Reason</span><input value={tc.reason} onChange={(e) => setTc({ ...tc, reason: e.target.value })} maxLength={300} style={field} /></label>
                <label><span style={lab}>Conduct</span><select value={tc.conduct} onChange={(e) => setTc({ ...tc, conduct: e.target.value })} style={field}><option>Excellent</option><option>Very good</option><option>Good</option><option>Satisfactory</option></select></label>
                <label><span style={lab}>Remarks</span><input value={tc.remarks} onChange={(e) => setTc({ ...tc, remarks: e.target.value })} maxLength={400} style={field} /></label>
              </div>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', margin: '10px 0', fontSize: 13 }}>
                <label><input type="checkbox" checked={tc.duesCleared} onChange={(e) => setTc({ ...tc, duesCleared: e.target.checked })} /> School dues cleared</label>
                <label><input type="checkbox" checked={tc.markTransferred} onChange={(e) => setTc({ ...tc, markTransferred: e.target.checked })} /> Also mark the student as transferred (removes them from the class roll)</label>
              </div>
              <button type="button" disabled={busy === 'tc' || !tc.leavingDate} onClick={issueTc} style={{ ...btn('#fff', TEAL_DARK, TEAL), opacity: busy === 'tc' ? 0.6 : 1 }}>{busy === 'tc' ? 'Issuing…' : 'Issue transfer certificate (PDF)'}</button>
            </div>
          </div>
        )}
      </div>

      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '14px 20px', fontWeight: 800 }}>Transfer certificates issued</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 560 }}>
          <thead><tr style={{ color: '#5f736f', textAlign: 'left', fontSize: 11, textTransform: 'uppercase' }}><th style={{ padding: '8px 20px' }}>Number</th><th>Student</th><th>Class</th><th>Leaving</th><th>Issued</th><th /></tr></thead>
          <tbody>
            {tcs.length === 0 && <tr><td colSpan={6} style={{ padding: 16, color: '#5f736f' }}>No certificates issued yet.</td></tr>}
            {tcs.map((t) => (
              <tr key={t.id} style={{ borderTop: '1px solid #ebf5f1' }}>
                <td style={{ padding: '9px 20px', fontWeight: 700 }}>{t.certificateNumber}</td><td>{t.student}</td><td>{t.grade}</td><td>{new Date(t.leavingDate).toLocaleDateString('en-GB')}</td><td>{new Date(t.issuedOn).toLocaleDateString('en-GB')}</td>
                <td style={{ padding: '9px 16px', textAlign: 'right' }}><button type="button" onClick={() => dl(`tc-${t.id}`, `/principal-tools/transfer-certificates/${t.id}/pdf`)} style={{ color: TEAL_DARK, fontWeight: 700 }}><Download size={13} style={{ verticalAlign: -2 }} /> PDF</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
