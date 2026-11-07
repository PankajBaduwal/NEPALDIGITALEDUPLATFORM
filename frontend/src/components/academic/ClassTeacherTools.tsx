import React, { useCallback, useEffect, useState } from 'react';
import { Send, Copy, FileSpreadsheet, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { useDialogs } from '../common/Dialogs';
import { formatDateTime } from '../../utils/dates';

const card: React.CSSProperties = { background: '#fff', border: '1px solid #dcebe6', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const field: React.CSSProperties = { padding: '8px 10px', borderRadius: 8, border: '1px solid #cfdcd8', fontSize: 13, background: '#fff', fontFamily: 'inherit' };
const btn = (bg: string, color = '#fff'): React.CSSProperties => ({ background: bg, color, padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, border: bg === '#fff' ? '1px solid #cfdcd8' : 'none', cursor: 'pointer' });
const today = () => new Date().toISOString().slice(0, 10);
const STATE: Record<string, [string, string, string]> = { SENT: ['Sent', '#e6f7f0', '#0f5f55'], PREPARED: ['Saved, not sent', '#f5f3ff', '#3b2f8f'], FAILED: ['Failed', '#fef2f2', '#b91c1c'], ALREADY_NOTIFIED: ['Already notified', '#ebf5f1', '#4b605b'] };

/** Class-teacher-only tools: absence notices to guardians, and PDF / Excel ledgers for the examination committee. */
export const ClassTeacherTools: React.FC<{ sectionId: string }> = ({ sectionId }) => {
  const { toast, confirm } = useDialogs();
  const [date, setDate] = useState(today());
  const [lang, setLang] = useState<'en' | 'ne'>('en');
  const [data, setData] = useState<any>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [template, setTemplate] = useState('');
  const [useSms, setUseSms] = useState(true);
  const [useInApp, setUseInApp] = useState(true);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [exporting, setExporting] = useState('');

  const loadHistory = useCallback(() => api.get<any[]>(`/class-teacher/section/${sectionId}/absence-notices`).then(setHistory).catch(() => setHistory([])), [sectionId]);
  const loadAbsentees = useCallback(async () => {
    setResults(null);
    try {
      const r = await api.get<any>(`/class-teacher/section/${sectionId}/absentees?date=${date}`);
      setData(r);
      setPicked(r.students.filter((s: any) => !s.alreadyNotified).map((s: any) => s.studentId));
      setTemplate((t) => t || r.templates[lang]);
    } catch (e: any) { toast(e.message || 'Could not load absent students', 'error'); setData(null); }
  }, [sectionId, date, lang, toast]);
  useEffect(() => { loadAbsentees(); }, [loadAbsentees]);
  useEffect(() => { loadHistory(); }, [loadHistory]);
  useEffect(() => { if (data) setTemplate(data.templates[lang]); }, [lang]); // switching language loads that language's wording

  const send = async () => {
    if (!picked.length) return toast('Choose at least one student.', 'error');
    if (!useSms && !useInApp) return toast('Choose SMS, an in-app notice, or both.', 'error');
    if (!(await confirm(`Send an absence notice for ${picked.length} student${picked.length === 1 ? '' : 's'} (${[useSms && 'SMS to guardian', useInApp && 'in-app notice'].filter(Boolean).join(' + ')})?`, { title: 'Send absence notices?', confirmLabel: 'Send' }))) return;
    setBusy(true);
    try {
      const r = await api.post<any>(`/class-teacher/section/${sectionId}/absence-notices`, { date, language: lang, template, studentIds: picked, sms: useSms, inApp: useInApp });
      setResults(r);
      const s = r.summary;
      toast(`${s.sent} sent, ${s.prepared} saved without sending, ${s.failed} failed${s.skipped ? `, ${s.skipped} already notified` : ''}.`, s.failed ? 'warning' : 'success');
      await Promise.all([loadAbsentees(), loadHistory()]);
    } catch (e: any) { toast(e.message || 'Could not send', 'error'); } finally { setBusy(false); }
  };

  const copyAll = async () => {
    const msgs = (results?.results || []).filter((x: any) => x.message).map((x: any) => `${x.name}: ${x.message}`).join('\n\n');
    try { await navigator.clipboard.writeText(msgs); toast('Messages copied. Paste them into your phone or SMS tool.', 'success'); } catch { toast('Copy is not available in this browser.', 'error'); }
  };

  const download = async (type: 'terminal' | 'cas', format: 'xlsx' | 'pdf') => {
    const key = `${type}-${format}`;
    setExporting(key);
    try {
      const res = await fetch(`/api/v1/class-teacher/section/${sectionId}/export?type=${type}&format=${format}`, { headers: { Authorization: `Bearer ${localStorage.getItem('nepal_edu_token') || ''}` } });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || (typeof j.error === 'string' ? j.error : j.error?.message) || `Export failed (${res.status})`);
      }
      const name = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') || '')?.[1] || `ledger.${format}`;
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
      toast(`${name} downloaded.`, 'success');
    } catch (e: any) { toast(e.message || 'Export failed', 'error'); } finally { setExporting(''); }
  };

  const invalid = data?.students.filter((s: any) => picked.includes(s.studentId) && !s.phoneValid).length || 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>Absence notices to guardians</div>
        <div style={{ fontSize: 12, color: '#5f736f', marginBottom: 14 }}>Students marked absent on the chosen day. Only you, as this section's class teacher, can send these.</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#4b605b' }}>Date <input type="date" value={date} max={today()} onChange={(e) => setDate(e.target.value)} style={{ ...field, marginLeft: 6 }} /></label>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#4b605b' }}>Language <select value={lang} onChange={(e) => setLang(e.target.value as any)} style={{ ...field, marginLeft: 6 }}><option value="en">English</option><option value="ne">नेपाली</option></select></label>
        </div>
        {data && !data.smsConfigured && (
          <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#3b2f8f', borderRadius: 10, padding: '10px 12px', fontSize: 12, marginBottom: 12, display: 'flex', gap: 8 }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} /> SMS is not set up on this server, so text messages cannot be sent yet. Notices are still delivered inside the app, and you can copy the messages to send them yourself. Ask the administrator to set the SMS provider.
          </div>
        )}
        {!data ? 'Loading…' : data.students.length === 0 ? (
          <div style={{ color: '#0f5f55', fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}><CheckCircle2 size={16} /> No student was marked absent on this day.</div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
                <thead><tr style={{ textAlign: 'left', color: '#5f736f', fontSize: 11, textTransform: 'uppercase' }}><th style={{ padding: 6 }}><input type="checkbox" aria-label="Select all" checked={picked.length === data.students.length} onChange={() => setPicked(picked.length === data.students.length ? [] : data.students.map((s: any) => s.studentId))} /></th><th>Roll</th><th>Student</th><th>Guardian</th><th>Number</th><th>Status</th></tr></thead>
                <tbody>
                  {data.students.map((s: any) => (
                    <tr key={s.studentId} style={{ borderTop: '1px solid #ebf5f1' }}>
                      <td style={{ padding: 6 }}><input type="checkbox" aria-label={`Select ${s.name}`} checked={picked.includes(s.studentId)} onChange={() => setPicked((p) => (p.includes(s.studentId) ? p.filter((x) => x !== s.studentId) : [...p, s.studentId]))} /></td>
                      <td>{s.roll}</td>
                      <td style={{ fontWeight: 700 }}>{s.name}{s.absentPeriods > 1 && <span style={{ color: '#5f736f', fontWeight: 500, fontSize: 11 }}> · {s.absentPeriods} periods</span>}</td>
                      <td>{s.guardianName || <span style={{ color: '#8da19d' }}>Not recorded</span>}</td>
                      <td style={{ color: s.phoneValid ? '#0e3e3b' : '#b91c1c' }}>{s.phoneValid ? s.phoneMasked : s.phone ? `${s.phoneMasked} — not a valid mobile number` : 'No number'}</td>
                      <td>{s.alreadyNotified ? <span style={{ fontSize: 11, fontWeight: 800, color: '#4b605b' }}>Already notified</span> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '12px 0', fontSize: 13 }}>
              <label><input type="checkbox" checked={useSms} onChange={(e) => setUseSms(e.target.checked)} /> SMS to guardian</label>
              <label><input type="checkbox" checked={useInApp} onChange={(e) => setUseInApp(e.target.checked)} /> In-app notice to the student</label>
              {useSms && invalid > 0 && <span style={{ color: '#b91c1c', fontSize: 12 }}>{invalid} selected student{invalid === 1 ? ' has' : 's have'} no valid guardian number, so no SMS will go to them.</span>}
            </div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#4b605b' }}>Message (you can edit it; {'{guardian}'} {'{student}'} {'{class}'} {'{section}'} {'{date}'} {'{teacher}'} {'{school}'} are filled in)</label>
            <textarea value={template} onChange={(e) => setTemplate(e.target.value)} rows={3} maxLength={600} style={{ ...field, width: '100%', marginTop: 4 }} aria-label="Message template" />
            <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" onClick={send} disabled={busy || !picked.length} style={{ ...btn('#117a6b'), opacity: busy || !picked.length ? 0.6 : 1 }}><Send size={15} /> {busy ? 'Sending…' : `Send notice${picked.length === 1 ? '' : 's'} (${picked.length})`}</button>
            </div>
          </>
        )}
        {results && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>Result
              <button type="button" onClick={copyAll} style={{ ...btn('#fff', '#0e3e3b'), padding: '4px 10px', fontSize: 12 }}><Copy size={13} /> Copy messages</button>
            </div>
            {results.results.map((x: any) => {
              const [label, bg, color] = STATE[x.status] || ['', '#ebf5f1', '#4b605b'];
              return (
                <div key={x.studentId} style={{ padding: '8px 0', borderTop: '1px solid #ebf5f1', fontSize: 13 }}>
                  <b>{x.name}</b> <span style={{ marginLeft: 6, padding: '1px 8px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: bg, color }}>{label}</span>
                  {x.smsError && <span style={{ color: '#3b2f8f', fontSize: 12, marginLeft: 8 }}>SMS: {x.smsError}</span>}
                  {x.message && <div style={{ fontSize: 12, color: '#4b605b', marginTop: 2 }}>{x.message}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div style={card}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Recent notices</div>
          {history.slice(0, 12).map((h) => (
            <div key={h.id} style={{ padding: '7px 0', borderTop: '1px solid #ebf5f1', fontSize: 12.5, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <b style={{ minWidth: 140 }}>{h.student}</b>
              <span style={{ color: '#5f736f' }}>{formatDateTime(h.sentAt)}</span>
              <span>SMS: {STATE[h.smsStatus]?.[0] || 'Not used'}</span>
              <span>In-app: {h.inAppStatus === 'SENT' ? 'Delivered' : h.inAppStatus === 'FAILED' ? 'Failed' : 'Not used'}</span>
            </div>
          ))}
        </div>
      )}

      <div style={card}>
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 2 }}>Export marks ledgers</div>
        <div style={{ fontSize: 12, color: '#5f736f', marginBottom: 14 }}>Ready to print and sign for the examination committee: all subjects for every student in this section, with totals, percentage, GPA, grade and rank.</div>
        {([['terminal', 'Terminal examination marks sheet'], ['cas', 'Continuous Assessment (CAS) ledger']] as const).map(([type, label]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 0', borderTop: '1px solid #ebf5f1' }}>
            <div style={{ flex: '1 1 240px', fontWeight: 700, fontSize: 14 }}>{label}</div>
            <button type="button" disabled={!!exporting} onClick={() => download(type, 'xlsx')} style={{ ...btn('#fff', '#0f5f55'), opacity: exporting ? 0.6 : 1 }}><FileSpreadsheet size={15} /> {exporting === `${type}-xlsx` ? 'Preparing…' : 'Excel'}</button>
            <button type="button" disabled={!!exporting} onClick={() => download(type, 'pdf')} style={{ ...btn('#fff', '#b91c1c'), opacity: exporting ? 0.6 : 1 }}><FileText size={15} /> {exporting === `${type}-pdf` ? 'Preparing…' : 'PDF'}</button>
          </div>
        ))}
      </div>
    </div>
  );
};
