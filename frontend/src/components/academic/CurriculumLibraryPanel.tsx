import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';
import { PdfReaderModal } from '../PdfReaderModal';
import { Badge, Button, Card, Field, Notice, Table, colors, inputStyle, mediumLabel, td } from './ui';

type View = 'OVERVIEW' | 'BROWSE' | 'SEARCH' | 'ISSUES' | 'INSTITUTIONS' | 'REPORTS';
const VIEWS: Array<[View, string]> = [
  ['OVERVIEW', 'Overview'],
  ['BROWSE', 'Classes & Subjects'],
  ['SEARCH', 'Search'],
  ['ISSUES', 'Data Issues'],
  ['INSTITUTIONS', 'Institutions'],
  ['REPORTS', 'Reports'],
];
const REPORTS: Array<[string, string]> = [
  ['inventory', 'Data inventory'],
  ['extraction', 'Extraction report'],
  ['mapping', 'Textbook mapping'],
  ['issues', 'Data issues'],
];

const statusTone = (s?: string) => (s === 'VERIFIED' || s === 'EXTRACTED' ? 'brand' : s === 'NO_SOURCE_PDF' ? 'danger' : 'warn');

/** Super Admin: Nepal Curriculum & Textbook Library (Country → Curriculum → Class → Medium → Subject → Textbook → Chapter). */
export const CurriculumLibraryPanel: React.FC = () => {
  const [view, setView] = useState<View>('OVERVIEW');
  const [reader, setReader] = useState<any>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {VIEWS.map(([k, label]) => (
          <Button key={k} small variant={view === k ? 'primary' : 'secondary'} onClick={() => setView(k)}>
            {label}
          </Button>
        ))}
      </div>
      {view === 'OVERVIEW' && <Overview />}
      {view === 'BROWSE' && <Browse onOpenSubject={setDetailId} onRead={setReader} />}
      {view === 'SEARCH' && <Search onOpenSubject={setDetailId} onRead={setReader} />}
      {view === 'ISSUES' && <Issues onRead={setReader} />}
      {view === 'INSTITUTIONS' && <Institutions />}
      {view === 'REPORTS' && <Reports />}
      {detailId && <SubjectDetail id={detailId} onClose={() => setDetailId(null)} onOpenSubject={setDetailId} onRead={setReader} />}
      <PdfReaderModal isOpen={!!reader} onClose={() => setReader(null)} textbook={reader} />
    </div>
  );
};

const useLoad = <T,>(fn: () => Promise<T>, deps: any[]) => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(() => {
    setError(null);
    fn().then(setData).catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(reload, [reload]);
  return { data, error, reload };
};

const Loading: React.FC<{ error: string | null }> = ({ error }) =>
  error ? <Notice tone="danger">{error}</Notice> : <p style={{ color: colors.muted, fontSize: 13 }}>Loading…</p>;

const Stat: React.FC<{ label: string; value: React.ReactNode; tone?: string }> = ({ label, value, tone }) => (
  <div style={{ background: colors.soft, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 14 }}>
    <div style={{ fontSize: 11, fontWeight: 700, color: colors.muted, textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color: tone || colors.text, marginTop: 4 }}>{value}</div>
  </div>
);

const Overview: React.FC = () => {
  const { data, error, reload } = useLoad<any>(() => api.get('/curriculum/library/overview'), []);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const run = async (kind: 'sync' | 'rescan') => {
    const prompt =
      kind === 'sync'
        ? 'Apply the latest extraction snapshot to the library? Curated corrections are kept.'
        : 'Re-scan the Nepal data folder? Original PDFs are only read, never changed.';
    if (!window.confirm(prompt)) return;
    setBusy(kind);
    try {
      const res = await api.post(`/curriculum/library/${kind}`);
      setMessage(kind === 'sync' ? `Library synced: ${JSON.stringify(res)}` : 'Re-scan started. Refresh the overview to follow its progress.');
      reload();
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(null);
    }
  };

  if (!data) return <Loading error={error} />;
  const t = data.totals;
  return (
    <div>
      {message && <Notice tone="info">{message}</Notice>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        <Stat label="Textbook PDFs" value={t.textbooks} />
        <Stat label="Pages" value={t.pages.toLocaleString()} />
        <Stat label="Logical subjects" value={t.logicalSubjects} />
        <Stat label="Subject records" value={t.subjectRecords} />
        <Stat label="With chapters" value={t.withChapters} tone={colors.brand} />
        <Stat label="Scanned (no text)" value={t.scanned} tone={colors.warn} />
        <Stat label="Needs review" value={t.needsReview} tone={colors.warn} />
        <Stat label="Subjects without PDF" value={t.subjectsWithoutSource} tone={colors.danger} />
        <Stat label="Reference documents" value={t.referenceDocuments} />
        <Stat label="Schools using" value={t.institutionsUsing} />
      </div>
      <Card
        title="Textbooks by class"
        actions={
          <>
            <Button small onClick={() => run('sync')} disabled={!!busy}>
              {busy === 'sync' ? 'Syncing…' : 'Apply snapshot'}
            </Button>
            <Button small onClick={() => run('rescan')} disabled={!!busy}>
              {busy === 'rescan' ? 'Starting…' : 'Re-scan Nepal data'}
            </Button>
          </>
        }
      >
        <p style={{ fontSize: 12, color: colors.muted, marginTop: 0 }}>
          Snapshot: {data.snapshotGeneratedAt ? new Date(data.snapshotGeneratedAt).toLocaleString() : 'not generated'}
          {data.extraction?.running ? ' · extraction running' : ''}
        </p>
        <Table head={['Class', 'Subjects', 'English', 'Nepali', 'Shared (both media)', 'Self-study']}>
          {data.grades.map((g: any) => (
            <tr key={g.gradeNumber}>
              <td style={td}>
                <strong>Class {g.gradeNumber}</strong>
              </td>
              <td style={td}>{g.subjects}</td>
              <td style={td}>{g.englishTextbooks}</td>
              <td style={td}>{g.nepaliTextbooks}</td>
              <td style={td}>{g.sharedTextbooks}</td>
              <td style={td}>{g.selfStudy}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

const Browse: React.FC<{ onOpenSubject: (id: string) => void; onRead: (tb: any) => void }> = ({ onOpenSubject, onRead }) => {
  const [grade, setGrade] = useState(8);
  const [medium, setMedium] = useState('ENGLISH');
  const [inactive, setInactive] = useState(false);
  const { data, error } = useLoad<any[]>(
    () => api.get(`/curriculum/library/grades/${grade}/subjects?medium=${medium}${inactive ? '&includeInactive=true' : ''}`),
    [grade, medium, inactive]
  );
  return (
    <Card title="Subjects and textbooks">
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <Field label="Class">
          <select style={inputStyle} value={grade} onChange={(e) => setGrade(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
              <option key={g} value={g}>
                Class {g}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Medium">
          <select style={inputStyle} value={medium} onChange={(e) => setMedium(e.target.value)}>
            <option value="ENGLISH">English</option>
            <option value="NEPALI">Nepali</option>
          </select>
        </Field>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.muted, alignSelf: 'flex-end' }}>
          <input type="checkbox" checked={inactive} onChange={(e) => setInactive(e.target.checked)} /> Show inactive subjects
        </label>
      </div>
      {!data ? (
        <Loading error={error} />
      ) : (
        <Table head={['Subject', 'Stream', 'Status', `${mediumLabel(medium)} textbook`, 'Other editions', '']}>
          {data.map((s) => (
            <tr key={s.id} style={{ opacity: s.isActive ? 1 : 0.55 }}>
              <td style={td}>
                <strong>{s.name}</strong>
                <div style={{ fontSize: 11, color: colors.muted }}>
                  {s.code}
                  {s.nameNepali ? ` · ${s.nameNepali}` : ''}
                </div>
              </td>
              <td style={td}>{s.stream || 'General'}</td>
              <td style={td}>
                <Badge tone={statusTone(s.sourceStatus) as any}>{s.sourceStatus}</Badge>
              </td>
              <td style={td}>
                {s.textbook ? (
                  <>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{s.textbook.title}</div>
                    <div style={{ fontSize: 11, color: colors.muted }}>
                      {s.textbook.pageCount || '?'} pages · {s.textbook.chapterCount ?? 0} chapters
                    </div>
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: colors.warn }}>{s.missingReason}</span>
                )}
              </td>
              <td style={td}>{s.otherEditions.map((e: any) => mediumLabel(e.medium)).join(', ') || '—'}</td>
              <td style={{ ...td, whiteSpace: 'nowrap' }}>
                {s.textbook && (
                  <Button small onClick={() => onRead(s.textbook)}>
                    Open PDF
                  </Button>
                )}{' '}
                <Button small onClick={() => onOpenSubject(s.id)}>
                  Manage
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </Card>
  );
};

const Search: React.FC<{ onOpenSubject: (id: string) => void; onRead: (tb: any) => void }> = ({ onOpenSubject, onRead }) => {
  const [q, setQ] = useState('');
  const [res, setRes] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setError(null);
    try {
      setRes(await api.get(`/curriculum/library/search?q=${encodeURIComponent(q.trim())}`));
    } catch (err: any) {
      setError(err.message);
    }
  };
  return (
    <Card title="Search the library">
      <form onSubmit={go} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input style={{ ...inputStyle, flex: 1 }} placeholder="Subject, code, textbook title or file name" value={q} onChange={(e) => setQ(e.target.value)} />
        <Button variant="primary" type="submit">
          Search
        </Button>
      </form>
      {error && <Notice tone="danger">{error}</Notice>}
      {res && (
        <>
          <h4 style={{ fontSize: 13, margin: '8px 0' }}>Subjects ({res.subjects.length})</h4>
          <Table head={['Class', 'Subject', 'Code', 'Status', '']}>
            {res.subjects.map((s: any) => (
              <tr key={s.id}>
                <td style={td}>{s.gradeNumber}</td>
                <td style={td}>{s.name}</td>
                <td style={td}>{s.code}</td>
                <td style={td}>
                  <Badge tone={statusTone(s.sourceStatus) as any}>{s.sourceStatus || 'NO_SOURCE_PDF'}</Badge>
                </td>
                <td style={td}>
                  <Button small onClick={() => onOpenSubject(s.id)}>
                    Manage
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
          <h4 style={{ fontSize: 13, margin: '16px 0 8px' }}>Textbooks ({res.textbooks.length})</h4>
          <Table head={['Class', 'Title', 'Medium', 'Status', '']}>
            {res.textbooks.map((t: any) => (
              <tr key={t.id}>
                <td style={td}>{t.gradeNumber}</td>
                <td style={td}>{t.title}</td>
                <td style={td}>{mediumLabel(t.medium)}</td>
                <td style={td}>{t.status}</td>
                <td style={td}>
                  <Button small onClick={() => onRead(t)}>
                    Open PDF
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </>
      )}
    </Card>
  );
};

const SubjectDetail: React.FC<{ id: string; onClose: () => void; onOpenSubject: (id: string) => void; onRead: (tb: any) => void }> = ({ id, onClose, onOpenSubject, onRead }) => {
  const { data, error, reload } = useLoad<any>(() => api.get(`/curriculum/library/subjects/${id}`), [id]);
  const [message, setMessage] = useState<{ tone: 'brand' | 'danger'; text: string } | null>(null);
  const [linkTarget, setLinkTarget] = useState('');

  const act = async (fn: () => Promise<any>, ok: string) => {
    setMessage(null);
    try {
      await fn();
      setMessage({ tone: 'brand', text: ok });
      reload();
    } catch (e: any) {
      setMessage({ tone: 'danger', text: e.message });
    }
  };

  const replacePdf = (tb: any) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file || !window.confirm(`Replace the PDF of "${tb.title}" with ${file.name}? The original file in Nepal data is kept.`)) return;
      const fd = new FormData();
      fd.append('pdf', file);
      act(() => api.postFormData(`/curriculum/library/textbooks/${tb.id}/replace-pdf`, fd), 'PDF replaced; chapters are being re-extracted.');
    };
    input.click();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,62,59,0.45)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
      <div style={{ width: 'min(760px, 100%)', height: '100%', overflowY: 'auto', background: '#fff', padding: 20 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 17 }}>{data ? `Class ${data.subject.gradeNumber} · ${data.subject.name}` : 'Subject'}</h3>
          <Button small onClick={onClose}>
            Close
          </Button>
        </div>
        {message && <Notice tone={message.tone}>{message.text}</Notice>}
        {!data ? (
          <Loading error={error} />
        ) : (
          <>
            <Card
              title="Subject record"
              actions={
                <>
                  <Button small onClick={() => act(() => api.patch(`/curriculum/library/subjects/${id}`, { isActive: data.subject.isActive === false }), 'Subject updated')}>
                    {data.subject.isActive === false ? 'Activate' : 'Deactivate'}
                  </Button>
                  {data.subject.verificationStatus !== 'VERIFIED' && (
                    <Button small onClick={() => act(() => api.patch(`/curriculum/library/subjects/${id}`, { verificationStatus: 'VERIFIED' }), 'Subject marked verified')}>
                      Mark verified
                    </Button>
                  )}
                  <Button
                    small
                    onClick={() => {
                      const name = window.prompt('Subject name', data.subject.name);
                      if (name && name !== data.subject.name) act(() => api.patch(`/curriculum/library/subjects/${id}`, { name }), 'Subject renamed');
                    }}
                  >
                    Rename
                  </Button>
                </>
              }
            >
              <div style={{ fontSize: 13, display: 'grid', gridTemplateColumns: '140px 1fr', rowGap: 6 }}>
                <span style={{ color: colors.muted }}>Code</span>
                <span>{data.subject.code}</span>
                <span style={{ color: colors.muted }}>Logical subject</span>
                <span>{data.subject.logicalKey || 'none (no CDC PDF in Nepal data)'}</span>
                <span style={{ color: colors.muted }}>Source</span>
                <span>
                  <Badge tone={statusTone(data.subject.sourceStatus) as any}>{data.subject.sourceStatus || 'NO_SOURCE_PDF'}</Badge>{' '}
                  <Badge tone={statusTone(data.subject.verificationStatus) as any}>{data.subject.verificationStatus || 'UNVERIFIED'}</Badge>
                </span>
                <span style={{ color: colors.muted }}>Linked records</span>
                <span>
                  {data.linkedSubjectRecords.map((s: any) => (
                    <span key={s.id} style={{ marginRight: 8 }}>
                      {s.id === id ? (
                        <strong>{s.code}</strong>
                      ) : (
                        <a href="#" onClick={(e) => (e.preventDefault(), onOpenSubject(s.id))}>
                          {s.code}
                        </a>
                      )}{' '}
                      ({s.stream || 'General'})
                    </span>
                  ))}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="Subject id to link to (same class)" value={linkTarget} onChange={(e) => setLinkTarget(e.target.value)} />
                <Button
                  small
                  disabled={!linkTarget.trim()}
                  onClick={() =>
                    window.confirm('Treat this subject as the same logical subject as the target? Its textbooks move with it.') &&
                    act(() => api.post(`/curriculum/library/subjects/${id}/link`, { targetSubjectId: linkTarget.trim() }), 'Subjects linked')
                  }
                >
                  Link
                </Button>
              </div>
            </Card>

            <Card title={`Textbooks (${data.textbooks.length})`}>
              {data.textbooks.length === 0 && <p style={{ fontSize: 13, color: colors.warn, margin: 0 }}>No CDC textbook PDF for this subject exists in Nepal data.</p>}
              {data.textbooks.map((tb: any) => (
                <div key={tb.id} style={{ border: `1px solid ${colors.border}`, borderRadius: 10, padding: 12, marginBottom: 10, opacity: tb.status === 'ARCHIVED' ? 0.55 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                    <div>
                      <strong style={{ fontSize: 13 }}>{tb.title}</strong>
                      <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                        {mediumLabel(tb.medium)} · {tb.documentType || 'TEXTBOOK'} · {tb.pageCount || '?'} pages · {tb.detailedChapters.length} chapters ·{' '}
                        {tb.textLayer === 'NONE' ? 'scanned' : 'text layer'} · {tb.status}
                      </div>
                      <div style={{ fontSize: 11, color: colors.muted }}>{tb.sourceRelativePath || (tb.supersededSource ? `replaced (was ${tb.supersededSource})` : '')}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <Button small onClick={() => onRead({ ...tb, detailedChapters: tb.detailedChapters })}>
                        Open PDF
                      </Button>
                      <select
                        style={{ ...inputStyle, width: 'auto', padding: '4px 6px', fontSize: 12 }}
                        value={tb.medium}
                        onChange={(e) =>
                          window.confirm(`Change medium to ${mediumLabel(e.target.value)}?`) &&
                          act(() => api.patch(`/curriculum/library/textbooks/${tb.id}`, { medium: e.target.value }), 'Textbook medium updated')
                        }
                      >
                        <option value="ENGLISH">English</option>
                        <option value="NEPALI">Nepali</option>
                        <option value="BOTH">Both media</option>
                      </select>
                      {tb.verificationStatus !== 'VERIFIED' && (
                        <Button small onClick={() => act(() => api.patch(`/curriculum/library/textbooks/${tb.id}`, { verificationStatus: 'VERIFIED' }), 'Textbook verified')}>
                          Verify
                        </Button>
                      )}
                      <Button
                        small
                        onClick={() => {
                          const title = window.prompt('Textbook title', tb.title);
                          if (title && title.trim() && title !== tb.title) act(() => api.patch(`/curriculum/library/textbooks/${tb.id}`, { title: title.trim() }), 'Textbook renamed');
                        }}
                      >
                        Rename
                      </Button>
                      <Button small onClick={() => replacePdf(tb)}>
                        Replace PDF
                      </Button>
                      <Button
                        small
                        variant={tb.isActive === false ? 'secondary' : 'danger'}
                        onClick={() => act(() => api.patch(`/curriculum/library/textbooks/${tb.id}`, { isActive: tb.isActive === false }), 'Textbook updated')}
                      >
                        {tb.isActive === false ? 'Restore' : 'Archive'}
                      </Button>
                    </div>
                  </div>
                  {tb.detailedChapters.length > 0 && (
                    <details style={{ marginTop: 8 }}>
                      <summary style={{ fontSize: 12, cursor: 'pointer', color: colors.info }}>Chapters</summary>
                      <ol style={{ fontSize: 12, margin: '6px 0 0', paddingLeft: 20 }}>
                        {tb.detailedChapters.map((c: any) => (
                          <li key={c.id || c._id}>
                            {c.title || c.name} <span style={{ color: colors.muted }}>(p. {c.startPage}–{c.endPage})</span>
                          </li>
                        ))}
                      </ol>
                    </details>
                  )}
                </div>
              ))}
            </Card>

            <Card title="Schools using this subject">
              {data.institutionsUsing.length === 0 ? (
                <p style={{ fontSize: 13, color: colors.muted, margin: 0 }}>Not offered by any school yet.</p>
              ) : (
                <Table head={['School', 'Sections offering', 'Teacher allocations']}>
                  {data.institutionsUsing.map((i: any) => (
                    <tr key={i.id}>
                      <td style={td}>{i.name}</td>
                      <td style={td}>{i.sections}</td>
                      <td style={td}>{i.allocations}</td>
                    </tr>
                  ))}
                </Table>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

const Issues: React.FC<{ onRead: (tb: any) => void }> = () => {
  const { data, error } = useLoad<any>(() => api.get('/curriculum/library/issues'), []);
  if (!data) return <Loading error={error} />;
  return (
    <div>
      <Card title={`Subjects without a source PDF (${data.subjectsWithoutSource.length})`}>
        <Table head={['Class', 'Code', 'Subject', 'Stream']}>
          {data.subjectsWithoutSource.map((s: any) => (
            <tr key={s.id || s._id}>
              <td style={td}>{s.gradeNumber}</td>
              <td style={td}>{s.code}</td>
              <td style={td}>{s.name}</td>
              <td style={td}>{s.stream || 'General'}</td>
            </tr>
          ))}
        </Table>
      </Card>
      <Card title={`Missing editions (${data.missingEditions.length})`}>
        <Table head={['Class', 'Subject', 'Missing medium']}>
          {data.missingEditions.map((m: any) => (
            <tr key={`${m.gradeNumber}-${m.logicalKey}-${m.missing}`}>
              <td style={td}>{m.gradeNumber}</td>
              <td style={td}>{m.title}</td>
              <td style={td}>
                <Badge tone="warn">{mediumLabel(m.missing)}</Badge>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
      <Card title={`Source documents with issues (${data.snapshotIssues.length})`}>
        <Table head={['File', 'Class', 'Status', 'Issues']}>
          {data.snapshotIssues.map((d: any) => (
            <tr key={d.relativePath}>
              <td style={{ ...td, fontSize: 11, wordBreak: 'break-all' }}>{d.relativePath}</td>
              <td style={td}>{d.gradeNumber ?? '—'}</td>
              <td style={td}>{d.status}</td>
              <td style={{ ...td, fontSize: 12 }}>{d.issues.join('; ')}</td>
            </tr>
          ))}
        </Table>
      </Card>
      <Card title={`Textbooks awaiting review (${data.needsReview.length})`}>
        <p style={{ fontSize: 12, color: colors.muted, marginTop: 0 }}>Open a subject under Classes & Subjects to verify its textbooks.</p>
        <Table head={['Class', 'Title', 'Medium']}>
          {data.needsReview.map((t: any) => (
            <tr key={t.id}>
              <td style={td}>{t.gradeNumber}</td>
              <td style={td}>{t.title}</td>
              <td style={td}>{mediumLabel(t.medium)}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
};

const Institutions: React.FC = () => {
  const { data, error } = useLoad<any[]>(() => api.get('/curriculum/library/institutions'), []);
  if (!data) return <Loading error={error} />;
  return (
    <Card title="Library use by school">
      <Table head={['School', 'Sections', 'Medium set', 'Subjects offered', 'Allocations', 'Timetables']}>
        {data.map((i) => (
          <tr key={i.id}>
            <td style={td}>
              <strong>{i.name}</strong>
            </td>
            <td style={td}>{i.sections}</td>
            <td style={td}>
              {i.sectionsWithMedium}/{i.sections}
            </td>
            <td style={td}>{i.offeredSubjects}</td>
            <td style={td}>{i.allocations}</td>
            <td style={{ ...td, fontSize: 12 }}>
              {Object.entries(i.timetables || {})
                .map(([k, n]) => `${n} ${String(k).toLowerCase().replace('_', ' ')}`)
                .join(', ') || '—'}
            </td>
          </tr>
        ))}
      </Table>
    </Card>
  );
};

const Reports: React.FC = () => {
  const [name, setName] = useState('inventory');
  const { data, error } = useLoad<any>(() => api.get(`/curriculum/library/reports/${name}`), [name]);
  return (
    <Card
      title="Nepal data reports"
      actions={REPORTS.map(([k, label]) => (
        <Button key={k} small variant={name === k ? 'primary' : 'secondary'} onClick={() => setName(k)}>
          {label}
        </Button>
      ))}
    >
      {!data ? (
        <Loading error={error} />
      ) : (
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, lineHeight: 1.5, maxHeight: 600, overflowY: 'auto', background: colors.soft, padding: 14, borderRadius: 8, margin: 0 }}>{data.markdown}</pre>
      )}
    </Card>
  );
};
