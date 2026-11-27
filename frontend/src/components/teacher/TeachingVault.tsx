import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../services/api';

interface VaultItem {
  id: string;
  title: string;
  unitNumber?: number;
  unitTitle: string;
  topic?: string;
  description?: string;
  kind: string;
  extension?: string;
  originalFilename: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface VaultScope {
  key: string;
  sectionId: string;
  subjectId: string;
  subjectName: string;
  classLabel: string;
}

interface Props {
  /** Shown as a page inside the dashboard when true, otherwise as a pop-up. */
  inline?: boolean;
  open?: boolean;
  onClose?: () => void;
  scopes: VaultScope[];
  initialScopeKey?: string;
  onLaunch: (item: VaultItem, scope: VaultScope) => Promise<void> | void;
}

const ICON: Record<string, string> = { PDF: '📕', PRESENTATION: '📊', DOCUMENT: '📄', VIDEO: '🎬', AUDIO: '🎧', IMAGE: '🖼️', SPREADSHEET: '📈', TEXT: '📝', OTHER: '📎' };
const KIND_LABEL: Record<string, string> = { PDF: 'PDF', PRESENTATION: 'Slides', DOCUMENT: 'Word', VIDEO: 'Video', AUDIO: 'Audio', IMAGE: 'Image', SPREADSHEET: 'Sheet', TEXT: 'Text', OTHER: 'Other' };
const ACCEPT = '.pdf,.ppt,.pptx,.pps,.ppsx,.odp,.doc,.docx,.odt,.rtf,.txt,.md,.xls,.xlsx,.csv,.mp4,.webm,.mov,.m4v,.mp3,.wav,.m4a,.ogg,.jpg,.jpeg,.png,.gif,.webp,.svg';
const LEGACY = ['doc', 'ppt', 'xls', 'odt', 'odp', 'rtf'];

const size = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const ext = (n: string) => (n.split('.').pop() || '').toLowerCase();

const field: React.CSSProperties = { width: '100%', padding: '9px 11px', border: '1px solid #cfe0db', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', background: '#fff', color: '#0F172A' };
const label: React.CSSProperties = { fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 };
const btn = (primary = false): React.CSSProperties => ({ padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: primary ? 'none' : '1px solid #FED7AA', background: primary ? '#EA580C' : '#FFF7ED', color: primary ? '#fff' : '#0F172A', whiteSpace: 'nowrap' });

export const TeachingVault: React.FC<Props> = ({ inline = false, open = true, onClose = () => undefined, scopes, initialScopeKey, onLaunch }) => {
  const [scopeKey, setScopeKey] = useState(initialScopeKey || scopes[0]?.key || '');
  useEffect(() => {
    if (!scopes.some((x) => x.key === scopeKey)) setScopeKey(initialScopeKey && scopes.some((x) => x.key === initialScopeKey) ? initialScopeKey : scopes[0]?.key || '');
  }, [scopes, scopeKey, initialScopeKey]);
  useEffect(() => { if (open && initialScopeKey && scopes.some((x) => x.key === initialScopeKey)) setScopeKey(initialScopeKey); }, [open, initialScopeKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const scope = scopes.find((x) => x.key === scopeKey);
  const sectionId = scope?.sectionId || '';
  const subjectId = scope?.subjectId || '';
  const subjectName = scope?.subjectName || 'Subject';
  const classLabel = scope?.classLabel || '';
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('ALL');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const [unitNumber, setUnitNumber] = useState('');
  const [unitTitle, setUnitTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [launching, setLaunching] = useState<string | null>(null);
  const [editing, setEditing] = useState<VaultItem | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!sectionId || !subjectId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<VaultItem[]>(`/teacher-vault?sectionId=${sectionId}&centralSubjectId=${subjectId}`);
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'Could not load the vault.');
    } finally {
      setLoading(false);
    }
  }, [sectionId, subjectId]);

  useEffect(() => {
    if (open) { setNotice(null); setError(null); setItems([]); load(); }
  }, [open, load]);

  const unitSuggestions = useMemo(() => Array.from(new Set(items.map((i) => i.unitTitle))), [items]);
  const topicSuggestions = useMemo(() => Array.from(new Set(items.filter((i) => !unitTitle || i.unitTitle === unitTitle).map((i) => i.topic).filter(Boolean))) as string[], [items, unitTitle]);

  const addFiles = (list: FileList | File[]) => {
    const next = Array.from(list);
    const bad = next.filter((f) => !ACCEPT.split(',').includes('.' + ext(f.name)));
    if (bad.length) setError(`Not supported: ${bad.map((b) => b.name).join(', ')}`);
    else setError(null);
    setFiles((prev) => [...prev, ...next.filter((f) => ACCEPT.split(',').includes('.' + ext(f.name)))]);
  };

  const upload = async () => {
    if (!unitTitle.trim()) { setError('Enter the unit these materials belong to.'); return; }
    if (!files.length) { setError('Choose at least one file.'); return; }
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('sectionId', sectionId);
      fd.append('centralSubjectId', subjectId);
      fd.append('unitTitle', unitTitle.trim());
      if (unitNumber.trim()) fd.append('unitNumber', unitNumber.trim());
      fd.append('topic', topic.trim());
      if (description.trim()) fd.append('description', description.trim());
      files.forEach((f) => fd.append('files', f));
      await api.postFormData('/teacher-vault', fd);
      setNotice(`${files.length} file${files.length === 1 ? '' : 's'} saved under ${unitNumber ? `Unit ${unitNumber}: ` : ''}${unitTitle.trim()}${topic.trim() ? ` › ${topic.trim()}` : ''}.`);
      setFiles([]);
      setDescription('');
      await load();
    } catch (e: any) {
      setError(e?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const launch = async (item: VaultItem) => {
    setLaunching(item.id);
    try { if (scope) await onLaunch(item, scope); } finally { setLaunching(null); }
  };

  const remove = async (item: VaultItem) => {
    if (!window.confirm(`Delete "${item.title}" from the vault? This cannot be undone.`)) return;
    try { await api.delete(`/teacher-vault/${item.id}`); setItems((p) => p.filter((x) => x.id !== item.id)); } catch (e: any) { setError(e?.message || 'Could not delete.'); }
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      await api.patch(`/teacher-vault/${editing.id}`, { title: editing.title, unitTitle: editing.unitTitle, unitNumber: editing.unitNumber ?? '', topic: editing.topic || '' });
      setEditing(null);
      await load();
    } catch (e: any) { setError(e?.message || 'Could not save.'); }
  };

  const grouped = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = items.filter((i) => (kindFilter === 'ALL' || i.kind === kindFilter) && (!q || `${i.title} ${i.unitTitle} ${i.topic || ''}`.toLowerCase().includes(q)));
    const units = new Map<string, { number?: number; title: string; topics: Map<string, VaultItem[]> }>();
    list.forEach((i) => {
      const key = `${i.unitNumber ?? ''}|${i.unitTitle}`;
      if (!units.has(key)) units.set(key, { number: i.unitNumber, title: i.unitTitle, topics: new Map() });
      const u = units.get(key)!;
      const t = i.topic || 'General';
      u.topics.set(t, [...(u.topics.get(t) || []), i]);
    });
    return Array.from(units.entries()).sort((a, b) => (a[1].number ?? 9999) - (b[1].number ?? 9999) || a[1].title.localeCompare(b[1].title));
  }, [items, search, kindFilter]);

  if (!open) return null;
  const kinds = ['ALL', ...Array.from(new Set(items.map((i) => i.kind)))];

  const outer: React.CSSProperties = inline ? { width: '100%' } : { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: 16 };
  const card: React.CSSProperties = inline
    ? { background: '#ffffff', color: '#0F172A', borderRadius: 18, width: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid #E2E8F0' }
    : { background: '#ffffff', color: '#0F172A', borderRadius: 18, width: 980, maxWidth: '100%', maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.3)' };

  return (
    <div style={outer} onMouseDown={(e) => { if (!inline && e.target === e.currentTarget) onClose(); }}>
      <div style={card}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e3efeb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Teaching Materials</div>
            <div style={{ fontSize: 12, color: '#64748B' }}>Your private files, organised by unit and topic, ready to teach on the Smart Board.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {scopes.length > 0 && (
              <select value={scopeKey} onChange={(e) => setScopeKey(e.target.value)} style={{ ...field, width: 'auto', minWidth: 230, fontWeight: 700 }} aria-label="Class and subject">
                {scopes.map((x) => <option key={x.key} value={x.key}>{x.subjectName} · {x.classLabel}</option>)}
              </select>
            )}
            {!inline && <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748B' }} aria-label="Close">✕</button>}
          </div>
        </div>

        <div style={{ overflowY: inline ? 'visible' : 'auto', padding: '18px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {scopes.length === 0 && <div style={{ padding: 20, border: '1px dashed #CBD5E1', borderRadius: 12, color: '#64748B', fontSize: 13 }}>No teaching allocations are available for this account yet.</div>}
          {/* Upload */}
          <section style={{ border: '1px solid #E2E8F0', borderRadius: 14, padding: 16, background: '#f7fbfa' }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>Upload materials</div>
            <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div><label style={label}>Unit no.</label><input style={field} inputMode="numeric" placeholder="1" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value.replace(/[^0-9]/g, ''))} /></div>
              <div><label style={label}>Unit name *</label><input style={field} list="vault-units" placeholder="e.g. Atomic Structure" value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)} /><datalist id="vault-units">{unitSuggestions.map((u) => <option key={u} value={u} />)}</datalist></div>
              <div><label style={label}>Topic</label><input style={field} list="vault-topics" placeholder="e.g. Electronic configuration" value={topic} onChange={(e) => setTopic(e.target.value)} /><datalist id="vault-topics">{topicSuggestions.map((t) => <option key={t} value={t} />)}</datalist></div>
            </div>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
              onClick={() => fileInput.current?.click()}
              style={{ border: `2px dashed ${dragging ? '#EA580C' : '#b6d3cc'}`, background: dragging ? '#FFF7ED' : '#ffffff', borderRadius: 12, padding: '18px 12px', textAlign: 'center', cursor: 'pointer', fontSize: 13, color: '#334155' }}
            >
              <strong>Drop files here or click to choose</strong>
              <div style={{ fontSize: 11, color: '#6b7f7a', marginTop: 4 }}>PDF, PowerPoint, Word, video, audio, images, spreadsheets and text. Up to 250 MB each.</div>
              <input ref={fileInput} type="file" multiple accept={ACCEPT} style={{ display: 'none' }} onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} />
            </div>
            {files.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {files.map((f, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 999, padding: '4px 10px', fontSize: 12 }}>
                    {f.name} <span style={{ color: '#6b7f7a' }}>{size(f.size)}</span>
                    {LEGACY.includes(ext(f.name)) && <span title="Older format: save as .docx, .pptx or PDF for the board" style={{ color: '#b45309', fontWeight: 700 }}>⚠</span>}
                    <button onClick={() => setFiles((p) => p.filter((_, x) => x !== i))} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B' }}>✕</button>
                  </span>
                ))}
              </div>
            )}
            {files.some((f) => LEGACY.includes(ext(f.name))) && <div style={{ fontSize: 11, color: '#b45309', marginTop: 6 }}>⚠ Older .doc, .ppt and .xls files can be stored but not shown on the board. Save them as .docx, .pptx or PDF first.</div>}
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginTop: 12 }}>
              <div style={{ flex: 1 }}><label style={label}>Note (optional)</label><input style={field} placeholder="A short description for these files" value={description} onChange={(e) => setDescription(e.target.value)} /></div>
              <button onClick={upload} disabled={uploading} style={{ ...btn(true), padding: '10px 18px', fontSize: 13, opacity: uploading ? 0.7 : 1 }}>{uploading ? 'Uploading...' : `Upload${files.length ? ` ${files.length} file${files.length === 1 ? '' : 's'}` : ''}`}</button>
            </div>
          </section>

          {error && <div style={{ background: '#fdecec', border: '1px solid #f5b5b5', color: '#991b1b', padding: '9px 12px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
          {notice && <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', color: '#0F172A', padding: '9px 12px', borderRadius: 8, fontSize: 13 }}>{notice}</div>}

          {/* Library */}
          <section>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>Library <span style={{ color: '#6b7f7a', fontWeight: 600 }}>({items.length})</span></div>
              <input style={{ ...field, width: 240, marginLeft: 'auto' }} placeholder="Search unit, topic or file" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {kinds.map((k) => (
                <button key={k} onClick={() => setKindFilter(k)} style={{ ...btn(kindFilter === k), padding: '4px 10px' }}>{k === 'ALL' ? 'All' : `${ICON[k] || ''} ${KIND_LABEL[k] || k}`}</button>
              ))}
            </div>

            {loading && <div style={{ fontSize: 13, color: '#64748B' }}>Loading...</div>}
            {!loading && items.length === 0 && <div style={{ padding: 28, textAlign: 'center', border: '1px dashed #CBD5E1', borderRadius: 12, color: '#64748B', fontSize: 13 }}>Nothing here yet. Upload your first file above and it will appear under its unit and topic.</div>}

            {grouped.map(([key, unit]) => {
              const isClosed = collapsed[key];
              const count = Array.from(unit.topics.values()).reduce((n, l) => n + l.length, 0);
              return (
                <div key={key} style={{ border: '1px solid #E2E8F0', borderRadius: 12, marginBottom: 10, overflow: 'hidden' }}>
                  <button onClick={() => setCollapsed((p) => ({ ...p, [key]: !p[key] }))} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: '#F8FAFC', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 800, color: '#0F172A' }}>
                    <span>{isClosed ? '▸' : '▾'}</span>
                    <span>{unit.number ? `Unit ${unit.number}: ` : ''}{unit.title}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#6b7f7a' }}>{count} file{count === 1 ? '' : 's'}</span>
                  </button>
                  {!isClosed && Array.from(unit.topics.entries()).map(([t, list]) => (
                    <div key={t} style={{ padding: '8px 14px 4px' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#6b7f7a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 6px' }}>{t}</div>
                      {list.map((i) => (
                        <div key={i.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 10px', borderRadius: 10, border: '1px solid #e8f1ee', marginBottom: 6, background: '#fff' }}>
                          <span style={{ fontSize: 22 }}>{ICON[i.kind] || '📎'}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.title}</div>
                            <div style={{ fontSize: 11, color: '#6b7f7a' }}>{KIND_LABEL[i.kind] || i.kind} · {(i.extension || '').toUpperCase()} · {size(i.fileSizeBytes)} · {new Date(i.createdAt).toLocaleDateString()}{i.description ? ` · ${i.description}` : ''}</div>
                          </div>
                          <button style={btn(true)} disabled={launching === i.id} onClick={() => launch(i)}>{launching === i.id ? 'Opening...' : '🖥 Launch on Smart Board'}</button>
                          <button style={btn()} onClick={() => api.downloadBlob(`/teacher-vault/${i.id}/file?download=1`, i.originalFilename).catch((e: any) => setError(e?.message || 'Download failed'))}>Download</button>
                          <button style={btn()} onClick={() => setEditing({ ...i })}>Edit</button>
                          <button style={{ ...btn(), color: '#991b1b', border: '1px solid #f5c2c2', background: '#fff5f5' }} onClick={() => remove(i)}>Delete</button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              );
            })}
          </section>
        </div>
      </div>

      {editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 130 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 22, width: 440, maxWidth: '92%' }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>Edit file</div>
            <div style={{ display: 'grid', gap: 10 }}>
              <div><label style={label}>Title</label><input style={field} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: 10 }}>
                <div><label style={label}>Unit no.</label><input style={field} value={editing.unitNumber ?? ''} onChange={(e) => setEditing({ ...editing, unitNumber: e.target.value ? Number(e.target.value.replace(/[^0-9]/g, '')) : undefined })} /></div>
                <div><label style={label}>Unit name</label><input style={field} list="vault-units" value={editing.unitTitle} onChange={(e) => setEditing({ ...editing, unitTitle: e.target.value })} /></div>
              </div>
              <div><label style={label}>Topic</label><input style={field} list="vault-topics" value={editing.topic || ''} onChange={(e) => setEditing({ ...editing, topic: e.target.value })} /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button style={btn()} onClick={() => setEditing(null)}>Cancel</button>
              <button style={btn(true)} onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
