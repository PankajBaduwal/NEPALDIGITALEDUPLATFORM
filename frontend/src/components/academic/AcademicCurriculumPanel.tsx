import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { PdfReaderModal, TextbookData } from '../PdfReaderModal';
import { Badge, Button, Card, Field, Notice, Table, classLabel, colors, inputStyle, mediumLabel, td } from './ui';

type Medium = 'ENGLISH' | 'NEPALI';

/**
 * Principal / School Admin: browse the national library subjects for a class and medium,
 * set section media, choose offered subjects and weekly periods, and allocate teachers.
 */
export const AcademicCurriculumPanel: React.FC = () => {
  const [structure, setStructure] = useState<any>(null);
  const [yearId, setYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [medium, setMedium] = useState<Medium>('ENGLISH');
  const [explorer, setExplorer] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [workload, setWorkload] = useState<any>(null);
  const [message, setMessage] = useState<{ tone: 'brand' | 'danger' | 'warn'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [reader, setReader] = useState<TextbookData | null>(null);
  const [edits, setEdits] = useState<Record<string, { periodsPerWeek?: number; practicalPeriodsPerWeek?: number; isOptional?: boolean }>>({});
  const [assignPick, setAssignPick] = useState<Record<string, string>>({});

  const loadStructure = useCallback(async (y?: string) => {
    const s = await api.get(`/academic-planning/structure${y ? `?academicYearId=${y}` : ''}`);
    setStructure(s);
    setYearId(s.academicYear.id);
    setClassId((cur) => cur && s.classes.some((c: any) => c.id === cur) ? cur : s.classes[0]?.id || '');
  }, []);

  const loadExplorer = useCallback(async () => {
    if (!classId || !yearId) return;
    setExplorer(await api.get(`/academic-planning/explorer?academicYearId=${yearId}&classId=${classId}&medium=${medium}`));
    setEdits({});
  }, [classId, yearId, medium]);

  const loadWorkload = useCallback(async () => setWorkload(await api.get('/academic-planning/workload')), []);

  useEffect(() => {
    loadStructure().catch((e) => setMessage({ tone: 'danger', text: e.message }));
    api.get('/school-admin/teachers').then((t: any[]) => setTeachers(t || [])).catch(() => setTeachers([]));
    loadWorkload().catch(() => undefined);
  }, [loadStructure, loadWorkload]);

  useEffect(() => {
    loadExplorer().catch((e) => setMessage({ tone: 'danger', text: e.message }));
  }, [loadExplorer]);

  const selectedClass = useMemo(() => structure?.classes.find((c: any) => c.id === classId), [structure, classId]);
  const sectionsOfMedium = explorer?.sections.filter((s: any) => s.medium === medium) || [];
  const activeTeachers = teachers.filter((t) => t.status === 'ACTIVE');

  const run = async (fn: () => Promise<any>, success: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const r = await fn();
      const warnings: string[] = r?.warnings || [];
      setMessage({ tone: warnings.length ? 'warn' : 'brand', text: warnings.length ? `${success}. ${warnings.join(' ')}` : success });
      await Promise.all([loadExplorer(), loadStructure(yearId), loadWorkload()]);
    } catch (e: any) {
      setMessage({ tone: 'danger', text: e.message });
    } finally {
      setBusy(false);
    }
  };

  const setSectionMedium = (sectionId: string, m: Medium) =>
    run(() => api.patch(`/academic-planning/sections/${sectionId}/medium`, { medium: m }), `Section medium set to ${mediumLabel(m)}`);

  const assignClassTeacher = (sectionId: string, teacherId: string) =>
    run(
      () => api.post(`/school-admin/sections/${sectionId}/class-teacher`, { teacherId }),
      'Primary class teacher assigned successfully'
    );

  const toggleOffered = (sectionId: string, subject: any, offered: boolean) =>
    run(
      () =>
        api.put(`/academic-planning/sections/${sectionId}/subjects`, {
          subjects: [{ centralSubjectId: subject.id, periodsPerWeek: offered ? 5 : 0, isOptional: !subject.isCompulsory, isActive: offered }],
        }),
      offered ? `${subject.name} is now offered` : `${subject.name} removed from the section`
    );

  const saveOffering = (sectionId: string, subject: any, cell: any) => {
    const e = edits[`${sectionId}:${subject.id}`] || {};
    return run(
      () =>
        api.put(`/academic-planning/sections/${sectionId}/subjects`, {
          subjects: [
            {
              centralSubjectId: cell.offeringSubjectId || subject.id,
              periodsPerWeek: e.periodsPerWeek ?? cell.periodsPerWeek ?? 0,
              practicalPeriodsPerWeek: e.practicalPeriodsPerWeek ?? cell.practicalPeriodsPerWeek ?? 0,
              isOptional: e.isOptional ?? cell.isOptional,
              isActive: true,
            },
          ],
        }),
      `${subject.name} updated`
    );
  };

  const assign = (sectionId: string, subject: any, cell: any) => {
    const teacherId = assignPick[`${sectionId}:${subject.id}`];
    if (!teacherId) return setMessage({ tone: 'warn', text: 'Choose a teacher first' });
    return run(
      () => api.post('/academic-planning/allocations', { academicYearId: yearId, teacherId, sectionId, subjectIds: [cell.offeringSubjectId || subject.id], medium }),
      `Teacher allocated to ${subject.name}`
    );
  };

  const unassign = (allocationId: string, name: string) => run(() => api.delete(`/academic-planning/allocations/${allocationId}`), `${name} removed from the subject`);

  if (!structure) return <p style={{ color: colors.muted, fontSize: 13 }}>{message?.text || 'Loading academic structure…'}</p>;

  return (
    <div>
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
          <Field label="Academic year">
            <select style={inputStyle} value={yearId} onChange={(e) => loadStructure(e.target.value)}>
              {structure.academicYears.map((y: any) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                  {y.isCurrent ? ' (current)' : ''}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Class">
            <select style={inputStyle} value={classId} onChange={(e) => setClassId(e.target.value)}>
              {structure.classes.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {classLabel(c)}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Medium">
            <div style={{ display: 'flex', gap: 6 }}>
              {(['ENGLISH', 'NEPALI'] as Medium[]).map((m) => (
                <Button key={m} variant={medium === m ? 'primary' : 'secondary'} onClick={() => setMedium(m)} style={{ flex: 1, justifyContent: 'center' }}>
                  {mediumLabel(m)}
                </Button>
              ))}
            </div>
          </Field>
        </div>
      </Card>

      {message && <Notice tone={message.tone}>{message.text}</Notice>}

      {selectedClass && (
        <Card title={`${classLabel(selectedClass)} sections and teaching medium`}>
          <p style={{ fontSize: 12, color: colors.muted, marginTop: 0 }}>
            Each section is taught in one medium. Its subjects, teachers, timetable and textbooks follow that medium.
          </p>
          <Table head={['Section', 'Medium', 'Students', 'Subjects offered', 'Class Teacher (Primary)']}>
            {selectedClass.sections.map((s: any) => (
              <tr key={s.id}>
                <td style={td}>{s.name}</td>
                <td style={td}>
                  <select style={inputStyle} value={s.mediumConfigured ? s.medium : ''} disabled={busy} onChange={(e) => setSectionMedium(s.id, e.target.value as Medium)}>
                    {!s.mediumConfigured && <option value="">Not set</option>}
                    <option value="ENGLISH">English</option>
                    <option value="NEPALI">Nepali</option>
                  </select>
                </td>
                <td style={td}>{s.students}</td>
                <td style={td}>{s.offeredSubjects}</td>
                <td style={td}>
                  <select
                    style={inputStyle}
                    value={s.classTeacherId?.id || s.classTeacherId?._id || s.classTeacherId || ''}
                    disabled={busy}
                    onChange={(e) => assignClassTeacher(s.id, e.target.value)}
                  >
                    <option value="">Select Class Teacher...</option>
                    {activeTeachers.map((t: any) => (
                      <option key={t.id || t._id} value={t.id || t._id}>
                        {t.fullName} ({t.username})
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {explorer && (
        <Card title={`${classLabel(explorer.class)} — ${mediumLabel(medium)} medium subjects`} actions={<Badge tone="info">{explorer.subjects.length} subjects in the national library</Badge>}>
          {sectionsOfMedium.length === 0 && (
            <Notice tone="warn">
              No section of {classLabel(explorer.class)} is set to the {mediumLabel(medium)} medium. Set a section's medium above to offer these subjects.
            </Notice>
          )}
          <Table head={['Subject', 'Digital textbook', ...sectionsOfMedium.map((s: any) => `Section ${s.name.replace(/^Section\s*/i, '')}`)]}>
            {explorer.subjects.map((subject: any) => (
              <tr key={subject.id}>
                <td style={{ ...td, minWidth: 180 }}>
                  <div style={{ fontWeight: 700 }}>{subject.name}</div>
                  {subject.nameNepali && <div style={{ fontSize: 12, color: colors.muted }}>{subject.nameNepali}</div>}
                  <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <Badge tone={subject.isCompulsory ? 'neutral' : 'info'}>{subject.isCompulsory ? 'Compulsory' : 'Optional'}</Badge>
                    {subject.stream && subject.stream !== 'GENERAL' && <Badge>{subject.stream}</Badge>}
                  </div>
                </td>
                <td style={{ ...td, minWidth: 200 }}>
                  {subject.textbook ? (
                    <>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{subject.textbook.title}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                        <Badge tone="brand">{mediumLabel(subject.textbook.medium)}</Badge>
                        <Button small onClick={() => setReader({ id: subject.textbook.id, title: subject.textbook.title, medium: subject.textbook.medium, gradeNumber: subject.gradeNumber, pageCount: subject.textbook.pageCount })}>
                          Open PDF
                        </Button>
                      </div>
                    </>
                  ) : (
                    <span style={{ fontSize: 12, color: colors.warn }}>{subject.missingReason}</span>
                  )}
                </td>
                {subject.sections
                  .filter((cell: any) => sectionsOfMedium.some((s: any) => s.id === cell.sectionId))
                  .map((cell: any) => {
                    const key = `${cell.sectionId}:${subject.id}`;
                    const e = edits[key] || {};
                    return (
                      <td key={cell.sectionId} style={{ ...td, minWidth: 230 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}>
                          <input type="checkbox" checked={cell.offered} disabled={busy} onChange={(ev) => toggleOffered(cell.sectionId, subject, ev.target.checked)} />
                          Offered
                        </label>
                        {cell.offered && (
                          <>
                            <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 }}>
                              <input
                                type="number"
                                min={0}
                                max={20}
                                title="Periods per week"
                                style={{ ...inputStyle, width: 56, padding: '4px 6px' }}
                                value={e.periodsPerWeek ?? cell.periodsPerWeek ?? 0}
                                onChange={(ev) => setEdits({ ...edits, [key]: { ...e, periodsPerWeek: Number(ev.target.value) } })}
                              />
                              <span style={{ color: colors.muted }}>periods/wk</span>
                              <input
                                type="number"
                                min={0}
                                max={20}
                                step={2}
                                title="Of which practical (double) periods"
                                style={{ ...inputStyle, width: 50, padding: '4px 6px' }}
                                value={e.practicalPeriodsPerWeek ?? cell.practicalPeriodsPerWeek ?? 0}
                                onChange={(ev) => setEdits({ ...edits, [key]: { ...e, practicalPeriodsPerWeek: Number(ev.target.value) } })}
                              />
                              <span style={{ color: colors.muted }}>practical</span>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <input type="checkbox" checked={e.isOptional ?? cell.isOptional} onChange={(ev) => setEdits({ ...edits, [key]: { ...e, isOptional: ev.target.checked } })} />
                                optional
                              </label>
                              {edits[key] && (
                                <Button small variant="primary" disabled={busy} onClick={() => saveOffering(cell.sectionId, subject, cell)}>
                                  Save
                                </Button>
                              )}
                            </div>
                            <div style={{ marginTop: 8 }}>
                              {cell.teachers.length === 0 && <div style={{ fontSize: 12, color: colors.warn }}>No teacher assigned</div>}
                              {cell.teachers.map((t: any) => (
                                <div key={t.allocationId} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 2 }}>
                                  <span style={{ fontWeight: 600 }}>{t.name}</span>
                                  {t.status !== 'ACTIVE' && <Badge tone="danger">{t.status}</Badge>}
                                  <button title="Remove allocation" disabled={busy} onClick={() => unassign(t.allocationId, t.name)} style={{ border: 'none', background: 'none', color: colors.danger, cursor: 'pointer', fontSize: 12 }}>
                                    Remove
                                  </button>
                                </div>
                              ))}
                              {cell.teachers.length === 0 && (
                                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                  <select style={{ ...inputStyle, padding: '4px 6px', fontSize: 12, flex: 1 }} value={assignPick[key] || ''} onChange={(ev) => setAssignPick({ ...assignPick, [key]: ev.target.value })}>
                                    <option value="">Assign teacher…</option>
                                    {activeTeachers.map((t) => (
                                      <option key={t.id || t._id} value={t.id || t._id}>
                                        {t.fullName}
                                      </option>
                                    ))}
                                  </select>
                                  <Button small variant="primary" disabled={busy || !assignPick[key]} onClick={() => assign(cell.sectionId, subject, cell)}>
                                    Assign
                                  </Button>
                                </div>
                              )}
                              <div style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>{cell.students} students</div>
                            </div>
                          </>
                        )}
                      </td>
                    );
                  })}
              </tr>
            ))}
          </Table>
        </Card>
      )}

      {workload && (
        <Card title="Teacher workload" actions={<Badge>School limit {workload.maxPeriodsPerWeek} periods / week</Badge>}>
          <Table head={['Teacher', 'Status', 'Allocations', 'Required periods', 'Published periods', 'Draft periods']}>
            {workload.teachers.map((t: any) => (
              <tr key={t.id} style={{ background: t.overloaded ? colors.dangerSoft : undefined }}>
                <td style={td}>{t.name}</td>
                <td style={td}>
                  <Badge tone={t.status === 'ACTIVE' ? 'brand' : 'danger'}>{t.status}</Badge>
                </td>
                <td style={td}>{t.allocations}</td>
                <td style={td}>{t.requiredPeriods}</td>
                <td style={td}>{t.scheduledPublished}</td>
                <td style={td}>{t.scheduledDraft}</td>
              </tr>
            ))}
          </Table>
        </Card>
      )}

      <PdfReaderModal isOpen={!!reader} onClose={() => setReader(null)} textbook={reader} />
    </div>
  );
};
