import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Badge, Button, Card, Field, Notice, Table, classLabel, colors, dayLabel, inputStyle, mediumLabel, td } from './ui';

const ALL_DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const statusTone = (s?: string) => (s === 'PUBLISHED' ? 'brand' : s === 'UNDER_REVIEW' ? 'info' : s === 'DRAFT' ? 'warn' : 'neutral');
const statusLabel = (s?: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ') : '');

type Msg = { tone: 'brand' | 'danger' | 'warn' | 'info'; text: string; details?: any } | null;

/** Principal / School Admin timetable management: configuration, versioned builder, validation, publication, history. */
export const TimetableManagementPanel: React.FC = () => {
  const [view, setView] = useState<'BUILDER' | 'CONFIG' | 'TEACHERS' | 'HISTORY'>('BUILDER');
  const [overview, setOverview] = useState<any>(null);
  const [sectionId, setSectionId] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [message, setMessage] = useState<Msg>(null);

  const loadOverview = useCallback(async () => {
    const o = await api.get('/timetable/builder/overview');
    setOverview(o);
    return o;
  }, []);

  useEffect(() => {
    loadOverview().catch((e) => setMessage({ tone: 'danger', text: e.message }));
  }, [loadOverview]);

  if (!overview) return <p style={{ color: colors.muted, fontSize: 13 }}>{message?.text || 'Loading timetables…'}</p>;

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {(
          [
            ['BUILDER', 'Class timetables'],
            ['CONFIG', 'Days, periods & breaks'],
            ['TEACHERS', 'Teacher timetables'],
            ['HISTORY', 'Change history'],
          ] as const
        ).map(([k, label]) => (
          <Button key={k} variant={view === k ? 'primary' : 'secondary'} onClick={() => setView(k)}>
            {label}
          </Button>
        ))}
      </div>
      {message && <Notice tone={message.tone}>{message.text}</Notice>}

      {view === 'CONFIG' && <ConfigEditor config={overview.config} onSaved={() => loadOverview()} />}
      {view === 'TEACHERS' && <TeacherTimetables />}
      {view === 'HISTORY' && <History sectionId={sectionId} sections={overview.sections} />}
      {view === 'BUILDER' && (
        <>
          {!overview.config.configured && <Notice tone="warn">Configure the school days, periods and breaks before creating timetables.</Notice>}

          {/* Quick Class Quick Selector & Filters */}
          <div style={{ background: '#f4faf8', border: '1px solid #dcebe6', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#0e3e3b' }}>🎯 Select Class &amp; Section to Manage Timetable:</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <select
                  style={{ ...inputStyle, padding: '6px 12px', fontSize: 13, minWidth: 200 }}
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                >
                  <option value="">-- Choose Class &amp; Section directly --</option>
                  {overview.sections.map((s: any) => (
                    <option key={s.sectionId} value={s.sectionId}>
                      {classLabel(s)} {s.sectionName} ({s.medium || 'Dual'} Medium) {s.published ? `· v${s.published.version} Published` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Class quick pills 1-12 */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#5f736f', marginRight: 4 }}>Filter Grade:</span>
              <button
                onClick={() => setSelectedGrade('ALL')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: selectedGrade === 'ALL' ? '#117a6b' : '#ffffff',
                  color: selectedGrade === 'ALL' ? '#ffffff' : '#4b605b',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                All Classes ({overview.sections.length})
              </button>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => {
                const count = overview.sections.filter((s: any) => Number(s.gradeNumber) === g).length;
                if (!count) return null;
                const active = selectedGrade === String(g);
                return (
                  <button
                    key={g}
                    onClick={() => setSelectedGrade(String(g))}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: active ? '1px solid #117a6b' : '1px solid #dcebe6',
                      background: active ? '#117a6b' : '#ffffff',
                      color: active ? '#ffffff' : '#4b605b',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    Class {g}
                  </button>
                );
              })}
            </div>
          </div>

          <Card title={`School Sections (${overview.sections.filter((s: any) => selectedGrade === 'ALL' || String(s.gradeNumber) === selectedGrade).length})`}>
            <Table head={['Class', 'Section', 'Medium', 'Published', 'In progress', '']}>
              {overview.sections
                .filter((s: any) => selectedGrade === 'ALL' || String(s.gradeNumber) === selectedGrade)
                .map((s: any) => (
                <tr key={s.sectionId} style={{ background: s.sectionId === sectionId ? colors.brandSoft : undefined }}>
                  <td style={td}>{classLabel(s)}</td>
                  <td style={td}><strong>{s.sectionName}</strong></td>
                  <td style={td}>{s.mediumConfigured ? <Badge tone={s.medium === 'NEPALI' ? 'warn' : 'brand'}>{mediumLabel(s.medium)}</Badge> : <Badge tone="danger">Not set</Badge>}</td>
                  <td style={td}>{s.published ? <span style={{ color: '#117a6b', fontWeight: 700 }}>✓ Version {s.published.version} Published</span> : <span style={{ color: colors.muted }}>None</span>}</td>
                  <td style={td}>
                    {s.pending ? (
                      <>
                        <Badge tone={statusTone(s.pending.status)}>
                          v{s.pending.version} {statusLabel(s.pending.status)}
                        </Badge>
                        {s.pending.lastValidation && (
                          <span style={{ fontSize: 11, color: colors.muted, marginLeft: 6 }}>
                            {s.pending.lastValidation.errors} errors · {s.pending.lastValidation.warnings} warnings
                          </span>
                        )}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>
                    <Button small variant={s.sectionId === sectionId ? 'primary' : 'secondary'} onClick={() => setSectionId(s.sectionId)}>
                      {s.sectionId === sectionId ? 'Active Timetable' : 'Open Timetable'}
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          </Card>
          {sectionId && <SectionBuilder key={sectionId} sectionId={sectionId} onChanged={() => loadOverview()} />}
        </>
      )}
    </div>
  );
};

// ── Configuration ───────────────────────────────────────────────────
const ConfigEditor: React.FC<{ config: any; onSaved: () => void }> = ({ config, onSaved }) => {
  const [form, setForm] = useState({
    workingDays: config.workingDays as string[],
    schoolStartTime: config.schoolStartTime || '09:30',
    schoolEndTime: config.schoolEndTime || '14:30',
    periodDurationMinutes: config.periodDurationMinutes || 45,
    breaks: (config.breaks?.length ? config.breaks : [{ name: 'Midday Break', startTime: '11:45', endTime: '12:15', breakType: 'LUNCH' }]) as any[],
  });
  const [msg, setMsg] = useState<Msg>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const r = await api.put('/timetable/config', form);
      const extra = [r.notes?.length ? r.notes.join('; ') : '', r.entriesOutsideNewLayout ? `${r.entriesOutsideNewLayout} existing period(s) fall outside the new layout and will be flagged when validated.` : '']
        .filter(Boolean)
        .join(' ');
      setMsg({ tone: extra ? 'warn' : 'brand', text: `Saved: ${r.teachingPeriods.length} teaching periods on ${r.workingDays.map(dayLabel).join(', ')}. ${extra}` });
      onSaved();
    } catch (e: any) {
      setMsg({ tone: 'danger', text: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Card title="School week">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
          {ALL_DAYS.map((d) => (
            <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 10px', border: `1px solid ${colors.border}`, borderRadius: 6, background: form.workingDays.includes(d) ? colors.brandSoft : '#fff' }}>
              <input
                type="checkbox"
                checked={form.workingDays.includes(d)}
                onChange={(e) => setForm({ ...form, workingDays: e.target.checked ? [...form.workingDays, d] : form.workingDays.filter((x) => x !== d) })}
              />
              {dayLabel(d)}
            </label>
          ))}
        </div>
        <p style={{ fontSize: 12, color: colors.muted, margin: 0 }}>Unticked days are holidays; no teaching can be scheduled on them.</p>
      </Card>
      <Card title="Periods and breaks">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 14 }}>
          <Field label="School starts">
            <input type="time" style={inputStyle} value={form.schoolStartTime} onChange={(e) => setForm({ ...form, schoolStartTime: e.target.value })} />
          </Field>
          <Field label="School ends">
            <input type="time" style={inputStyle} value={form.schoolEndTime} onChange={(e) => setForm({ ...form, schoolEndTime: e.target.value })} />
          </Field>
          <Field label="Period length (minutes)">
            <input type="number" min={20} max={120} style={inputStyle} value={form.periodDurationMinutes} onChange={(e) => setForm({ ...form, periodDurationMinutes: Number(e.target.value) })} />
          </Field>
        </div>
        {form.breaks.map((b, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
            <Field label="Break name">
              <input style={inputStyle} value={b.name} onChange={(e) => setForm({ ...form, breaks: form.breaks.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
            </Field>
            <Field label="Starts">
              <input type="time" style={inputStyle} value={b.startTime} onChange={(e) => setForm({ ...form, breaks: form.breaks.map((x, j) => (j === i ? { ...x, startTime: e.target.value } : x)) })} />
            </Field>
            <Field label="Ends">
              <input type="time" style={inputStyle} value={b.endTime} onChange={(e) => setForm({ ...form, breaks: form.breaks.map((x, j) => (j === i ? { ...x, endTime: e.target.value } : x)) })} />
            </Field>
            <Field label="Type">
              <select style={inputStyle} value={b.breakType || 'LUNCH'} onChange={(e) => setForm({ ...form, breaks: form.breaks.map((x, j) => (j === i ? { ...x, breakType: e.target.value } : x)) })}>
                <option value="LUNCH">Lunch</option>
                <option value="SHORT_BREAK">Short break</option>
                <option value="ASSEMBLY">Assembly</option>
              </select>
            </Field>
            <Button variant="danger" onClick={() => setForm({ ...form, breaks: form.breaks.filter((_, j) => j !== i) })}>
              Remove
            </Button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Button onClick={() => setForm({ ...form, breaks: [...form.breaks, { name: 'Break', startTime: '', endTime: '', breakType: 'SHORT_BREAK' }] })}>Add break</Button>
          <Button variant="primary" disabled={saving} onClick={save}>
            {saving ? 'Saving…' : 'Save and generate periods'}
          </Button>
        </div>
      </Card>
      {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
      <Card title="Current periods">
        {config.periods.length === 0 ? (
          <p style={{ fontSize: 13, color: colors.muted, margin: 0 }}>Not configured yet.</p>
        ) : (
          <Table head={['Name', 'Time', 'Type']}>
            {config.periods.map((p: any) => (
              <tr key={p.periodNumber} style={{ background: p.isBreak ? colors.soft : undefined }}>
                <td style={td}>{p.name}</td>
                <td style={td}>
                  {p.startTime}–{p.endTime}
                </td>
                <td style={td}>{p.isBreak ? <Badge tone="warn">Break — no teaching</Badge> : <Badge tone="brand">Teaching</Badge>}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </>
  );
};

// ── Section builder ─────────────────────────────────────────────────
const SectionBuilder: React.FC<{ sectionId: string; onChanged: () => void }> = ({ sectionId, onChanged }) => {
  const [ctx, setCtx] = useState<any>(null);
  const [tt, setTt] = useState<any>(null);
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [cell, setCell] = useState<{ day: string; period: number } | null>(null);
  const [form, setForm] = useState({ centralSubjectId: '', teacherId: '', roomNumber: '' });
  const [validation, setValidation] = useState<any>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (versionId?: string) => {
      const c = await api.get(`/timetable/builder/sections/${sectionId}`);
      setCtx(c);
      const id = versionId || c.pending || c.published || c.versions[0]?.id || '';
      setSelectedVersion(id);
      setTt(id ? await api.get(`/timetable/builder/timetables/${id}`) : null);
    },
    [sectionId]
  );

  useEffect(() => {
    load().catch((e) => setMsg({ tone: 'danger', text: e.message }));
  }, [load]);

  if (!ctx) return <p style={{ color: colors.muted, fontSize: 13 }}>{msg?.text || 'Loading section…'}</p>;

  const isDraft = tt?.timetable.status === 'DRAFT';
  const entryAt = (day: string, n: number) => tt?.entries.find((e: any) => e.dayOfWeek === day && e.periodNumber === n);
  const subject = ctx.subjects.find((s: any) => s.id === form.centralSubjectId);

  const act = async (fn: () => Promise<any>, ok: string, after?: (r: any) => void) => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await fn();
      setMsg({ tone: 'brand', text: ok });
      after?.(r);
      onChanged();
      return r;
    } catch (e: any) {
      setMsg({ tone: 'danger', text: e.message, details: e.details });
      if (e.details?.errors) setValidation(e.details);
    } finally {
      setBusy(false);
    }
  };

  const openCell = (day: string, period: number) => {
    if (!isDraft) return;
    const e = entryAt(day, period);
    setCell({ day, period });
    setForm({ centralSubjectId: e?.subject?.id || '', teacherId: e?.teacher?.id || '', roomNumber: e?.roomNumber && e.roomNumber !== 'Classroom' ? e.roomNumber : '' });
  };

  const saveCell = () =>
    act(
      () => api.put(`/timetable/builder/timetables/${tt.timetable.id}/entries`, { dayOfWeek: cell!.day, periodNumber: cell!.period, ...form }),
      `${dayLabel(cell!.day)} period ${cell!.period} saved`,
      async (r) => {
        if (r?.warnings?.length) setMsg({ tone: 'warn', text: `Saved with warnings: ${r.warnings.map((w: any) => w.message).join(' ')}` });
        setCell(null);
        setValidation(null);
        await load(tt.timetable.id);
      }
    );

  const clearCell = () => {
    const e = entryAt(cell!.day, cell!.period);
    if (!e) return setCell(null);
    return act(() => api.delete(`/timetable/builder/timetables/${tt.timetable.id}/entries/${e.id}`), 'Period cleared', async () => {
      setCell(null);
      await load(tt.timetable.id);
    });
  };

  const transition = (path: string, ok: string) =>
    act(() => api.post(`/timetable/builder/timetables/${tt.timetable.id}/${path}`), ok, async (r) => {
      if (r?.warnings?.length || r?.validation?.warnings?.length) setValidation(r.validation || { valid: true, errors: [], warnings: r.warnings });
      await load();
    });

  return (
    <>
      <Card
        title={`${classLabel(ctx.class)} ${ctx.section.name}`}
        actions={
          <>
            <Badge tone={ctx.medium === 'NEPALI' ? 'warn' : ctx.medium ? 'brand' : 'danger'}>{ctx.medium ? `${mediumLabel(ctx.medium)} medium` : 'Medium not set'}</Badge>
            {ctx.versions.length > 0 && (
              <select style={{ ...inputStyle, padding: '4px 8px' }} value={selectedVersion} onChange={(e) => load(e.target.value)}>
                {ctx.versions.map((v: any) => (
                  <option key={v.id} value={v.id}>
                    Version {v.version} — {statusLabel(v.status)}
                    {v.publishedAt ? ` (${new Date(v.publishedAt).toLocaleDateString()})` : ''}
                  </option>
                ))}
              </select>
            )}
            {!ctx.pending && (
              <Button variant="primary" disabled={busy || !!ctx.blockingReason} onClick={() => act(() => api.post(`/timetable/builder/sections/${sectionId}/drafts`, {}), 'New draft version created', async (r) => load(r.timetable.id))}>
                {ctx.published ? '✏️ Edit Timetable (New Draft)' : 'Create timetable'}
              </Button>
            )}
          </>
        }
      >
        {ctx.blockingReason && <Notice tone="warn">{ctx.blockingReason}</Notice>}
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {ctx.subjects.map((s: any) => (
            <span key={s.id} title={s.message || s.teachers.map((t: any) => t.name).join(', ')} style={{ fontSize: 12, border: `1px solid ${s.teachers.length ? colors.border : '#fecaca'}`, background: s.teachers.length ? '#fff' : colors.dangerSoft, borderRadius: 6, padding: '4px 8px' }}>
              <strong>{s.name}</strong> · {tt ? tt.entries.filter((e: any) => e.subject?.id === s.id).length : 0}/{s.periodsPerWeek}
              <span style={{ color: colors.muted }}> · {s.teachers.length ? s.teachers.map((t: any) => t.name).join(', ') : 'no teacher'}</span>
            </span>
          ))}
          {ctx.subjects.length === 0 && <span style={{ fontSize: 13, color: colors.warn }}>No subjects are configured for this section. Add them under Academic Curriculum &amp; Subjects.</span>}
        </div>

        {tt && (
          <>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
              <Badge tone={statusTone(tt.timetable.status)}>
                Version {tt.timetable.version} · {statusLabel(tt.timetable.status)}
              </Badge>
              {isDraft && <span style={{ fontSize: 12, color: colors.muted }}>Click a period to assign a subject and teacher.</span>}
              <div style={{ flex: 1 }} />
              <Button small disabled={busy} onClick={() => act(() => api.post(`/timetable/builder/timetables/${tt.timetable.id}/validate`), 'Validation complete', (r) => setValidation(r))}>
                Validate
              </Button>
              {isDraft && (
                <Button small disabled={busy} onClick={() => transition('submit', 'Submitted for review')}>
                  Submit for review
                </Button>
              )}
              {tt.timetable.status === 'UNDER_REVIEW' && (
                <Button small disabled={busy} onClick={() => transition('return', 'Returned to draft')}>
                  Return to draft
                </Button>
              )}
              {(isDraft || tt.timetable.status === 'UNDER_REVIEW') && (
                <Button small variant="primary" disabled={busy} onClick={() => transition('publish', 'Published. Teachers and students now see this version.')}>
                  Publish
                </Button>
              )}
              {tt.timetable.status !== 'ARCHIVED' && (
                <Button small variant="danger" disabled={busy} onClick={() => window.confirm(`Archive version ${tt.timetable.version}?`) && transition('archive', 'Version archived')}>
                  Archive
                </Button>
              )}
            </div>

            <Table head={['Period', ...tt.config.workingDays.map(dayLabel)]}>
              {tt.config.periods.map((p: any) => (
                <tr key={p.periodNumber} style={{ background: p.isBreak ? colors.soft : undefined }}>
                  <td style={{ ...td, whiteSpace: 'nowrap' }}>
                    <strong>{p.name}</strong>
                    <div style={{ fontSize: 11, color: colors.muted }}>
                      {p.startTime}–{p.endTime}
                    </div>
                  </td>
                  {tt.config.workingDays.map((d: string) => {
                    if (p.isBreak) return <td key={d} style={{ ...td, color: colors.muted, fontSize: 12 }}>{p.name}</td>;
                    const e = entryAt(d, p.periodNumber);
                    const flagged = validation?.errors?.some((x: any) => x.dayOfWeek === d && x.periodNumber === p.periodNumber);
                    const selected = cell?.day === d && cell?.period === p.periodNumber;
                    return (
                      <td
                        key={d}
                        onClick={() => openCell(d, p.periodNumber)}
                        style={{ ...td, cursor: isDraft ? 'pointer' : 'default', minWidth: 120, background: selected ? colors.infoSoft : flagged ? colors.dangerSoft : undefined, outline: selected ? `2px solid ${colors.info}` : undefined }}
                      >
                        {e ? (
                          <>
                            <div style={{ fontWeight: 700, fontSize: 12 }}>{e.subject?.name}</div>
                            <div style={{ fontSize: 11, color: colors.muted }}>
                              {e.teacher?.name}
                              {e.roomNumber && e.roomNumber !== 'Classroom' ? ` · ${e.roomNumber}` : ''}
                            </div>
                            <div style={{ marginTop: 2 }}>
                              <span style={{ fontSize: 9, fontWeight: 700, background: '#dcfce7', color: '#166534', padding: '1px 5px', borderRadius: 4, display: 'inline-block' }}>
                                📖 CDC Book
                              </span>
                            </div>
                          </>
                        ) : (
                          <span style={{ fontSize: 11, color: '#cfdcd8' }}>{isDraft ? '+ Assign' : '—'}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </Table>
          </>
        )}
      </Card>

      {cell && isDraft && (
        <Card title={`${dayLabel(cell.day)} · Period ${cell.period}`}>
          <div style={{ fontSize: 12, color: '#0f5f55', background: '#e6f7f0', border: '1px solid #bfeede', padding: '8px 12px', borderRadius: 8, marginBottom: 12 }}>
            🇳🇵 Saving this period automatically assigns the subject to the teacher&apos;s dashboard and links the official CDC textbook PDF directly for teachers and students.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, alignItems: 'end' }}>
            <Field label="Subject">
              <select style={inputStyle} value={form.centralSubjectId} onChange={(e) => setForm({ ...form, centralSubjectId: e.target.value, teacherId: '' })}>
                <option value="">Select subject…</option>
                {ctx.subjects.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Teacher">
              <select
                style={inputStyle}
                value={form.teacherId}
                disabled={!subject}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              >
                <option value="">Select teacher…</option>
                {((subject?.teachers && subject.teachers.length > 0) ? subject.teachers : (ctx.schoolTeachers || [])).map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Room (optional)">
              <input style={inputStyle} value={form.roomNumber} placeholder="Classroom" onChange={(e) => setForm({ ...form, roomNumber: e.target.value })} />
            </Field>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="primary" disabled={busy || !form.centralSubjectId || !form.teacherId} onClick={saveCell}>
                Save
              </Button>
              {entryAt(cell.day, cell.period) && (
                <Button variant="danger" disabled={busy} onClick={clearCell}>
                  Clear
                </Button>
              )}
              <Button onClick={() => setCell(null)}>Cancel</Button>
            </div>
          </div>
          {subject && subject.teachers.length === 0 && (
            <Notice tone="danger">
              <span style={{ display: 'block', marginTop: 10 }}>{subject.message}</span>
            </Notice>
          )}
        </Card>
      )}

      {validation && (
        <Card title={validation.valid ? 'Validation passed' : `Validation: ${validation.errors.length} error(s)`} actions={<Button small onClick={() => setValidation(null)}>Close</Button>}>
          {validation.errors.length === 0 && validation.warnings.length === 0 && <p style={{ fontSize: 13, color: colors.brand, margin: 0 }}>No errors or warnings.</p>}
          {validation.errors.map((x: any, i: number) => (
            <div key={`e${i}`} style={{ fontSize: 13, color: colors.danger, marginBottom: 4 }}>
              ✕ {x.dayOfWeek ? `${dayLabel(x.dayOfWeek)} P${x.periodNumber}: ` : ''}
              {x.message}
            </div>
          ))}
          {validation.warnings.map((x: any, i: number) => (
            <div key={`w${i}`} style={{ fontSize: 13, color: colors.warn, marginBottom: 4 }}>
              ! {x.message}
            </div>
          ))}
        </Card>
      )}
    </>
  );
};

// ── Teacher timetables (read-only, published) ───────────────────────
const TeacherTimetables: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teacherId, setTeacherId] = useState('');
  const [sched, setSched] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api.get('/school-admin/teachers').then((t: any[]) => setTeachers(t || [])).catch((e) => setErr(e.message));
  }, []);
  useEffect(() => {
    if (!teacherId) return;
    setSched(null);
    api.get(`/timetable/teacher/${teacherId}`).then(setSched).catch((e) => setErr(e.message));
  }, [teacherId]);

  return (
    <Card title="Teacher timetable (published)">
      {err && <Notice tone="danger">{err}</Notice>}
      <Field label="Teacher" style={{ maxWidth: 320, marginBottom: 14 }}>
        <select style={inputStyle} value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
          <option value="">Select teacher…</option>
          {teachers.map((t) => (
            <option key={t.id || t._id} value={t.id || t._id}>
              {t.fullName}
            </option>
          ))}
        </select>
      </Field>
      {sched && (
        <>
          <p style={{ fontSize: 13, color: colors.muted }}>{sched.totalWeeklyPeriods} periods a week</p>
          <Table head={['Period', ...sched.workingDays.map(dayLabel)]}>
            {sched.periods.map((p: any) => (
              <tr key={p.periodNumber} style={{ background: p.isBreak ? colors.soft : undefined }}>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  <strong>{p.name}</strong>
                  <div style={{ fontSize: 11, color: colors.muted }}>
                    {p.startTime}–{p.endTime}
                  </div>
                </td>
                {sched.workingDays.map((d: string) => {
                  if (p.isBreak) return <td key={d} style={{ ...td, color: colors.muted, fontSize: 12 }}>Break</td>;
                  const e = sched.weeklyEntries.find((x: any) => x.dayOfWeek === d && x.periodNumber === p.periodNumber);
                  return (
                    <td key={d} style={td}>
                      {e ? (
                        <>
                          <div style={{ fontWeight: 700, fontSize: 12 }}>{e.subjectName}</div>
                          <div style={{ fontSize: 11, color: colors.muted }}>
                            {classLabel(e)} {e.sectionName}
                          </div>
                        </>
                      ) : (
                        <span style={{ fontSize: 11, color: '#cfdcd8' }}>Free</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </Table>
        </>
      )}
    </Card>
  );
};

// ── Change history ──────────────────────────────────────────────────
const History: React.FC<{ sectionId: string; sections: any[] }> = ({ sectionId, sections }) => {
  const [filter, setFilter] = useState(sectionId);
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => {
    api.get(`/timetable/history?limit=200${filter ? `&sectionId=${filter}` : ''}`).then(setRows).catch(() => setRows([]));
  }, [filter]);
  return (
    <Card title="Change history">
      <Field label="Section" style={{ maxWidth: 320, marginBottom: 14 }}>
        <select style={inputStyle} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All sections and configuration</option>
          {sections.map((s) => (
            <option key={s.sectionId} value={s.sectionId}>
              {classLabel(s)} {s.sectionName}
            </option>
          ))}
        </select>
      </Field>
      <Table head={['When', 'Change', 'By', 'Details']}>
        {rows.map((r) => (
          <tr key={r.id}>
            <td style={{ ...td, whiteSpace: 'nowrap' }}>{new Date(r.timestamp).toLocaleString()}</td>
            <td style={td}>
              <Badge tone={r.changeType === 'PUBLISH' ? 'brand' : r.changeType === 'DELETE' || r.changeType === 'ARCHIVE' ? 'danger' : 'neutral'}>{r.changeType}</Badge>
            </td>
            <td style={td}>
              {r.changedByName || '—'} <span style={{ color: colors.muted, fontSize: 11 }}>{r.userRole}</span>
            </td>
            <td style={td}>{r.reason}</td>
          </tr>
        ))}
      </Table>
      {rows.length === 0 && <p style={{ fontSize: 13, color: colors.muted }}>No changes recorded.</p>}
    </Card>
  );
};
