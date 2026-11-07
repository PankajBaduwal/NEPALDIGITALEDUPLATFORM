import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NotebookPen, Plus, Trash2, Pencil, X, CheckCircle2, CalendarClock, Ban } from 'lucide-react';
import { api } from '../../services/api';
import { useDialogs } from '../common/Dialogs';
import { formatDate } from '../../utils/dates';

interface Props { allocations: any[] }
interface Entry { id: string; date: string; chapterNumber?: number; chapterTitle?: string; topic: string; objective?: string; activities?: string; homework?: string; status: 'PLANNED' | 'TAUGHT' | 'SKIPPED'; periodNumber?: number }

const card: React.CSSProperties = { background: '#fff', border: '1px solid #dcebe6', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };
const field: React.CSSProperties = { padding: '9px 11px', borderRadius: 8, border: '1px solid #cfdcd8', fontSize: 13, background: '#fff', width: '100%', minWidth: 0, fontFamily: 'inherit' };
const lab: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#4b605b', marginBottom: 4, display: 'block' };
const idOf = (v: any) => String(v?.id || v?._id || v || '');
const STATUS = {
  TAUGHT: { label: 'Taught', bg: '#e6f7f0', color: '#0f5f55', icon: <CheckCircle2 size={13} /> },
  PLANNED: { label: 'Planned', bg: '#eff6ff', color: '#1d4ed8', icon: <CalendarClock size={13} /> },
  SKIPPED: { label: 'Skipped', bg: '#fef2f2', color: '#b91c1c', icon: <Ban size={13} /> },
} as const;
const PACE: Record<string, { label: string; bg: string; color: string }> = {
  AHEAD: { label: 'Ahead of the year', bg: '#e6f7f0', color: '#0f5f55' },
  ON_TRACK: { label: 'On track', bg: '#e6f7f0', color: '#0f5f55' },
  BEHIND: { label: 'Behind the year', bg: '#fef2f2', color: '#b91c1c' },
  UNKNOWN: { label: 'Not enough data', bg: '#ebf5f1', color: '#4b605b' },
};
const today = () => new Date().toISOString().slice(0, 10);

/** Daily teaching diary and lesson planner, per class and subject, with curriculum completion against the school year. */
export const TeachingDiaryPanel: React.FC<Props> = ({ allocations }) => {
  const { toast, confirm } = useDialogs();
  const options = useMemo(
    () => allocations.map((a) => ({ key: `${idOf(a.sectionId)}|${idOf(a.centralSubjectId)}`, sectionId: idOf(a.sectionId), subjectId: idOf(a.centralSubjectId), label: `${a.centralSubjectId?.name || 'Subject'} — Grade ${a.sectionId?.classId?.gradeNumber ?? ''} ${a.sectionId?.name || ''}`.trim() })),
    [allocations]
  );
  const [sel, setSel] = useState(options[0]?.key || '');
  const current = options.find((o) => o.key === sel) || options[0];
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [chapters, setChapters] = useState<Array<{ number: number; title: string }>>([]);
  const blank = { date: today(), chapterNumber: '', topic: '', objective: '', activities: '', homework: '', status: 'TAUGHT' as Entry['status'] };
  const [form, setForm] = useState<any>(blank);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!sel && options[0]) setSel(options[0].key); }, [options, sel]);

  const load = useCallback(async () => {
    if (!current) return;
    const q = `sectionId=${current.sectionId}&centralSubjectId=${current.subjectId}`;
    try {
      const [e, p, c] = await Promise.all([api.get<Entry[]>(`/teacher/diary?${q}`), api.get<any>(`/teacher/diary/progress?${q}`), api.get<any>(`/teacher/diary/chapters?${q}`)]);
      setEntries(e);
      setProgress(p);
      setChapters(c?.chapters || []);
    } catch (err: any) {
      toast(err.message || 'Could not load the diary', 'error');
      setEntries([]);
    }
  }, [current?.key, toast]);
  useEffect(() => { setEntries(null); setEditing(null); setForm(blank); load(); }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return;
    setBusy(true);
    try {
      const body = { ...form, chapterNumber: form.chapterNumber ? Number(form.chapterNumber) : undefined, sectionId: current.sectionId, centralSubjectId: current.subjectId };
      if (editing) await api.put(`/teacher/diary/${editing}`, body);
      else await api.post('/teacher/diary', body);
      toast(editing ? 'Diary entry updated.' : 'Diary entry saved.', 'success');
      setForm({ ...blank, date: form.date });
      setEditing(null);
      await load();
    } catch (err: any) {
      toast(err.message || 'Could not save', 'error');
    } finally {
      setBusy(false);
    }
  };
  const edit = (en: Entry) => {
    setEditing(en.id);
    setForm({ date: en.date.slice(0, 10), chapterNumber: en.chapterNumber ? String(en.chapterNumber) : '', topic: en.topic, objective: en.objective || '', activities: en.activities || '', homework: en.homework || '', status: en.status });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const remove = async (en: Entry) => {
    if (!(await confirm(`Delete the diary entry "${en.topic}"?`, { title: 'Delete entry?', confirmLabel: 'Delete', danger: true }))) return;
    try { await api.delete(`/teacher/diary/${en.id}`); toast('Entry deleted.', 'success'); await load(); } catch (err: any) { toast(err.message || 'Could not delete', 'error'); }
  };
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [outlineText, setOutlineText] = useState('');
  const canEditOutline = progress && progress.chapterSource !== 'TEXTBOOK';
  const openOutline = () => { setOutlineText(chapters.map((c) => c.title).join('\n')); setOutlineOpen(true); };
  const saveOutline = async () => {
    if (!current) return;
    const titles = outlineText.split('\n').map((t) => t.trim()).filter(Boolean);
    setBusy(true);
    try {
      await api.put('/teacher/diary/plan', { sectionId: current.sectionId, centralSubjectId: current.subjectId, titles });
      toast('Course outline saved.', 'success');
      setOutlineOpen(false);
      await load();
    } catch (err: any) {
      toast(err.message || 'Could not save the outline', 'error');
    } finally {
      setBusy(false);
    }
  };
  const quickStatus = async (en: Entry, status: Entry['status']) => {
    try { await api.put(`/teacher/diary/${en.id}`, { status }); await load(); } catch (err: any) { toast(err.message || 'Could not update', 'error'); }
  };

  if (!options.length) return <div style={card}>You have no teaching allocations yet, so there is no diary to keep.</div>;
  const pace = PACE[progress?.pace || 'UNKNOWN'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ ...card, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <NotebookPen size={22} color="#117a6b" aria-hidden="true" />
        <div style={{ flex: '1 1 220px' }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: '#0e3e3b' }}>Teaching Diary & Lesson Planner</div>
          <div style={{ fontSize: 12, color: '#5f736f' }}>Log what you teach each day and plan the next lessons. Progress is measured against the school year.</div>
        </div>
        <select value={current?.key} onChange={(e) => setSel(e.target.value)} aria-label="Class and subject" style={{ ...field, width: 'auto', minWidth: 240 }}>
          {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
        </select>
      </div>

      <div style={card}>
        {!progress ? 'Loading progress…' : (
          <>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#0e3e3b' }}>{progress.percent === null ? '—' : `${progress.percent}%`}</div>
              <div style={{ fontSize: 13, color: '#4b605b' }}>
                {progress.totalChapters ? <>{progress.chaptersTaught} of {progress.totalChapters} chapters taught{progress.textbook?.title ? ` · ${progress.textbook.title}` : ''}</> : 'No textbook chapters are mapped for this subject. Add your own course outline below to track completion, or just keep the diary.'}
                {progress.chapterSource === 'TEACHER_OUTLINE' && progress.totalChapters > 0 && <span> · your course outline</span>}
              </div>
              {canEditOutline && <button type="button" onClick={openOutline} style={{ color: '#0f5f55', fontWeight: 700, fontSize: 12, textDecoration: 'underline' }}>{progress.totalChapters ? 'Edit outline' : 'Add course outline'}</button>}
              <span style={{ marginLeft: 'auto', padding: '3px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800, background: pace.bg, color: pace.color }}>{pace.label}</span>
            </div>
            {outlineOpen && (
              <div style={{ margin: '8px 0 12px', padding: 12, border: '1px solid #bfeede', background: '#e6f7f0', borderRadius: 10 }}>
                <label style={lab} htmlFor="outline-text">Course outline: one chapter title per line, in teaching order</label>
                <textarea id="outline-text" rows={8} value={outlineText} onChange={(e) => setOutlineText(e.target.value)} style={field} placeholder={'Chapter 1 title\nChapter 2 title'} />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button type="button" disabled={busy} onClick={saveOutline} style={{ background: '#117a6b', color: '#fff', padding: '7px 16px', borderRadius: 8, fontWeight: 700, fontSize: 13 }}>{busy ? 'Saving…' : 'Save outline'}</button>
                  <button type="button" onClick={() => setOutlineOpen(false)} style={{ color: '#4b605b', fontSize: 13 }}>Cancel</button>
                </div>
              </div>
            )}
            {progress.totalChapters > 0 && (
              <>
                <div style={{ position: 'relative', height: 12, background: '#dcebe6', borderRadius: 999, overflow: 'hidden' }} role="progressbar" aria-valuenow={progress.percent ?? 0} aria-valuemin={0} aria-valuemax={100} aria-label="Chapters taught">
                  <div style={{ width: `${progress.percent}%`, height: '100%', background: '#117a6b', transition: 'width 0.4s ease' }} />
                  {progress.yearElapsedPercent !== null && <div title={`${progress.yearElapsedPercent}% of the school year has passed`} style={{ position: 'absolute', top: 0, bottom: 0, left: `${progress.yearElapsedPercent}%`, width: 2, background: '#0e3e3b' }} />}
                </div>
                <div style={{ fontSize: 11, color: '#5f736f', marginTop: 4 }}>The dark marker shows how much of the school year has passed ({progress.yearElapsedPercent ?? '?'}%).</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                  {progress.chapters.map((c: any) => (
                    <span key={c.number} title={c.title} style={{ padding: '3px 9px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: c.status === 'TAUGHT' ? '#daf5ec' : c.status === 'PLANNED' ? '#dbeafe' : '#ebf5f1', color: c.status === 'TAUGHT' ? '#0f4c4a' : c.status === 'PLANNED' ? '#1d4ed8' : '#5f736f' }}>
                      {c.number}. {c.title.length > 22 ? c.title.slice(0, 22) + '…' : c.title}
                    </span>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <form onSubmit={save} style={{ ...card, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
          {editing ? <Pencil size={16} /> : <Plus size={16} />} {editing ? 'Edit diary entry' : 'New diary entry'}
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(blank); }} style={{ marginLeft: 'auto', color: '#5f736f', display: 'inline-flex', gap: 4, fontSize: 12 }}><X size={14} /> Cancel edit</button>}
        </div>
        <label><span style={lab}>Date</span><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={field} required /></label>
        <label><span style={lab}>Chapter</span>
          <select value={form.chapterNumber} onChange={(e) => setForm({ ...form, chapterNumber: e.target.value })} style={field}>
            <option value="">— not tied to a chapter —</option>
            {chapters.map((c) => <option key={c.number} value={c.number}>{c.number}. {c.title}</option>)}
          </select>
        </label>
        <label><span style={lab}>Status</span>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={field}>
            <option value="TAUGHT">Taught</option><option value="PLANNED">Planned</option><option value="SKIPPED">Skipped</option>
          </select>
        </label>
        <label style={{ gridColumn: '1 / -1' }}><span style={lab}>Topic *</span><input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} maxLength={300} placeholder="e.g. Karak and Bibhakti: types and examples" style={field} required /></label>
        <label style={{ gridColumn: '1 / -1' }}><span style={lab}>Learning objective</span><textarea rows={2} value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })} placeholder="By the end of the lesson students can…" style={field} /></label>
        <label><span style={lab}>Activities / method</span><textarea rows={2} value={form.activities} onChange={(e) => setForm({ ...form, activities: e.target.value })} style={field} /></label>
        <label><span style={lab}>Homework</span><textarea rows={2} value={form.homework} onChange={(e) => setForm({ ...form, homework: e.target.value })} style={field} /></label>
        <div style={{ gridColumn: '1 / -1' }}>
          <button type="submit" disabled={busy || !form.topic.trim()} style={{ background: '#117a6b', color: '#fff', padding: '9px 20px', borderRadius: 8, fontWeight: 700, fontSize: 13, opacity: busy || !form.topic.trim() ? 0.6 : 1 }}>
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add to diary'}
          </button>
        </div>
      </form>

      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '16px 24px', fontWeight: 800 }}>Diary entries</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640, fontSize: 13 }}>
          <thead><tr style={{ color: '#5f736f', textAlign: 'left', fontSize: 11, textTransform: 'uppercase' }}><th style={{ padding: '8px 16px' }}>Date</th><th>Topic</th><th>Chapter</th><th>Status</th><th /></tr></thead>
          <tbody>
            {entries === null && <tr><td colSpan={5} style={{ padding: 16 }}>Loading…</td></tr>}
            {entries?.length === 0 && <tr><td colSpan={5} style={{ padding: 16, color: '#5f736f' }}>Nothing logged for this class yet. Add your first entry above.</td></tr>}
            {entries?.map((en) => {
              const st = STATUS[en.status];
              return (
                <tr key={en.id} style={{ borderTop: '1px solid #ebf5f1', verticalAlign: 'top' }}>
                  <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>{formatDate(en.date)}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ fontWeight: 700 }}>{en.topic}</div>
                    {en.objective && <div style={{ fontSize: 12, color: '#5f736f' }}>Aim: {en.objective}</div>}
                    {en.homework && <div style={{ fontSize: 12, color: '#5f736f' }}>Homework: {en.homework}</div>}
                  </td>
                  <td style={{ padding: '10px 8px', color: '#4b605b' }}>{en.chapterNumber ? `${en.chapterNumber}. ${en.chapterTitle || ''}` : '—'}</td>
                  <td style={{ padding: '10px 8px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, background: st.bg, color: st.color }}>{st.icon} {st.label}</span></td>
                  <td style={{ padding: '10px 16px', whiteSpace: 'nowrap', textAlign: 'right' }}>
                    {en.status === 'PLANNED' && <button type="button" onClick={() => quickStatus(en, 'TAUGHT')} style={{ color: '#0f5f55', fontWeight: 700, fontSize: 12, marginRight: 10 }}>Mark taught</button>}
                    <button type="button" aria-label="Edit entry" onClick={() => edit(en)} style={{ color: '#4b605b', marginRight: 10 }}><Pencil size={14} /></button>
                    <button type="button" aria-label="Delete entry" onClick={() => remove(en)} style={{ color: '#b91c1c' }}><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
