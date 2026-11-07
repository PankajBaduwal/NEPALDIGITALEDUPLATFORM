import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { formatDateTime } from '../../utils/dates';
import { useDialogs } from '../common/Dialogs';

interface Row {
  id?: string;
  _id?: string;
  createdAt?: string;
  operatorRole?: string;
  operatorId?: string;
  action: string;
  targetEntity?: string;
  targetId?: string;
  ipAddress?: string;
  details?: any;
  actor?: { name?: string; username?: string };
}
interface Page { items: Row[]; total: number; page: number; totalPages: number; filters: { actions: string[]; roles: string[]; entities: string[] } }

const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 11, color: '#5f736f', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid #dcebe6', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #ebf5f1', color: '#0e3e3b', verticalAlign: 'top' };
const field: React.CSSProperties = { padding: '8px 10px', borderRadius: 8, border: '1px solid #cfdcd8', fontSize: 13, background: '#fff', minWidth: 0 };
const btn: React.CSSProperties = { padding: '6px 12px', borderRadius: 6, border: '1px solid #cfdcd8', background: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 };

const label = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

export const AuditLogView: React.FC = () => {
  const { toast } = useDialogs();
  const [data, setData] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [action, setAction] = useState('');
  const [role, setRole] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDq(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => setPage(1), [dq, action, role, from, to]);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (dq) p.set('q', dq);
    if (action) p.set('action', action);
    if (role) p.set('role', role);
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    return p;
  }, [dq, action, role, from, to]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const p = new URLSearchParams(query);
      p.set('page', String(page));
      p.set('limit', '25');
      setData(await api.get<Page>(`/admin/audit-logs?${p.toString()}`));
    } catch (e: any) {
      setError(e.message || 'Could not load the audit log.');
    } finally {
      setLoading(false);
    }
  }, [query, page]);
  useEffect(() => { load(); }, [load]);

  const exportCsv = async () => {
    try {
      const token = localStorage.getItem('nepal_edu_token');
      const res = await fetch(`/api/v1/admin/audit-logs/export?${query.toString()}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast('Audit log exported (up to 5,000 matching rows).', 'success');
    } catch (e: any) {
      toast(e.message || 'Export failed', 'error');
    }
  };

  const clear = () => { setQ(''); setAction(''); setRole(''); setFrom(''); setTo(''); };
  const filtered = !!(q || action || role || from || to);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search action, entity or id" aria-label="Search audit log" style={{ ...field, flex: '1 1 200px' }} />
        <select value={action} onChange={(e) => setAction(e.target.value)} aria-label="Filter by action" style={field}>
          <option value="">All actions</option>
          {(data?.filters.actions || []).map((a) => <option key={a} value={a}>{label(a)}</option>)}
        </select>
        <select value={role} onChange={(e) => setRole(e.target.value)} aria-label="Filter by role" style={field}>
          <option value="">All roles</option>
          {(data?.filters.roles || []).map((r) => <option key={r} value={r}>{label(r)}</option>)}
        </select>
        <label style={{ fontSize: 12, color: '#5f736f', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          From <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} style={field} />
        </label>
        <label style={{ fontSize: 12, color: '#5f736f', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          To <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} style={field} />
        </label>
        {filtered && <button type="button" style={btn} onClick={clear}>Clear filters</button>}
        <button type="button" style={btn} onClick={load} aria-label="Refresh"><RefreshCw size={13} /> Refresh</button>
        <button type="button" style={{ ...btn, background: '#117a6b', color: '#fff', border: 'none' }} onClick={exportCsv}><Download size={13} /> Export CSV</button>
      </div>

      {error && <div style={{ color: '#b91c1c', fontSize: 13 }}>{error}</div>}

      <div style={{ background: '#fff', border: '1px solid #dcebe6', borderRadius: 12, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr><th style={th} /><th style={th}>When</th><th style={th}>Who</th><th style={th}>Role</th><th style={th}>Action</th><th style={th}>Target</th></tr>
          </thead>
          <tbody>
            {loading && !data && <tr><td style={td} colSpan={6}>Loading…</td></tr>}
            {data && data.items.length === 0 && <tr><td style={td} colSpan={6}>{filtered ? 'No entries match these filters.' : 'No audit entries yet.'}</td></tr>}
            {data?.items.map((r, i) => {
              const key = String(r.id || r._id || i);
              const isOpen = open === key;
              const has = r.details && Object.keys(r.details).length > 0;
              return (
                <React.Fragment key={key}>
                  <tr style={{ cursor: has ? 'pointer' : 'default', background: isOpen ? '#f4faf8' : undefined }} onClick={() => has && setOpen(isOpen ? null : key)}>
                    <td style={{ ...td, width: 24, color: '#8da19d' }}>{has ? (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : null}</td>
                    <td style={{ ...td, whiteSpace: 'nowrap' }}>{formatDateTime(r.createdAt)}</td>
                    <td style={td}>
                      <div style={{ fontWeight: 700 }}>{r.actor?.name || r.actor?.username || r.operatorId || '—'}</div>
                      {r.actor?.username && r.actor?.name && <div style={{ fontSize: 11, color: '#5f736f' }}>@{r.actor.username}</div>}
                    </td>
                    <td style={td}>{r.operatorRole ? label(r.operatorRole) : '—'}</td>
                    <td style={td}>{label(r.action)}</td>
                    <td style={td}>{r.targetEntity || '—'}{r.targetId ? ` · ${String(r.targetId).slice(-6)}` : ''}</td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td />
                      <td style={{ ...td, background: '#f4faf8' }} colSpan={5}>
                        <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#2f4f4c' }}>{JSON.stringify(r.details, null, 2)}</pre>
                        {r.ipAddress && <div style={{ fontSize: 11, color: '#5f736f', marginTop: 6 }}>IP address: {r.ipAddress}</div>}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between', flexWrap: 'wrap', fontSize: 13, color: '#4b605b' }}>
        <span>{data ? `${data.total.toLocaleString('en-IN')} ${data.total === 1 ? 'entry' : 'entries'}` : ''}</span>
        <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <button type="button" style={btn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          Page {data?.page || page} of {data?.totalPages || 1}
          <button type="button" style={btn} disabled={!data || page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </span>
      </div>
    </div>
  );
};
