import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { useDialogs } from '../common/Dialogs';
import { formatDate } from '../../utils/dates';

interface Row { id: string; institution: { id: string; name: string; emisCode: string; province: string } | null; plan: string; status: string; endDate: string; daysLeft: number | null }

const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 11, color: '#5f736f', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid #dcebe6', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #ebf5f1' };
const field: React.CSSProperties = { padding: '8px 10px', borderRadius: 8, border: '1px solid #cfdcd8', fontSize: 13, background: '#fff', minWidth: 0 };
const btn = (bg: string, color = '#fff'): React.CSSProperties => ({ background: bg, color, padding: '7px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', border: bg === '#fff' ? '1px solid #cfdcd8' : 'none' });
const STATUS: Record<string, [string, string]> = { ACTIVE: ['#e6f7f0', '#117a6b'], TRIAL: ['#eef2ff', '#4f46e5'], GRACE_PERIOD: ['#ede9fe', '#6d5bd0'], EXPIRED: ['#fee2e2', '#b91c1c'], SUSPENDED: ['#fee2e2', '#b91c1c'], CANCELLED: ['#ebf5f1', '#4b605b'] };

/** All school subscriptions in one table, with select-many actions: extend, suspend, reactivate. */
export const BulkSubscriptionsPanel: React.FC<{ onChanged?: () => void }> = ({ onChanged }) => {
  const { toast, confirm } = useDialogs();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [dq, setDq] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  const [months, setMonths] = useState(12);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { const t = setTimeout(() => setDq(search.trim()), 300); return () => clearTimeout(t); }, [search]);
  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (status) p.set('status', status);
    if (dq) p.set('search', dq);
    try { setRows(await api.get<Row[]>(`/admin/platform/subscriptions?${p.toString()}`)); } catch (e: any) { toast(e.message || 'Could not load subscriptions', 'error'); setRows([]); }
  }, [status, dq, toast]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => setSel((s) => s.filter((id) => rows?.some((r) => r.id === id))), [rows]);

  const all = useMemo(() => !!rows?.length && rows.every((r) => sel.includes(r.id)), [rows, sel]);
  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const run = async (action: 'EXTEND' | 'SUSPEND' | 'ACTIVATE') => {
    if (action === 'SUSPEND' && !reason.trim()) return toast('Write a reason before suspending.', 'error');
    const verb = action === 'EXTEND' ? `extend by ${months} month${months === 1 ? '' : 's'}` : action === 'SUSPEND' ? 'suspend' : 'reactivate';
    if (!(await confirm(`${verb[0].toUpperCase() + verb.slice(1)} ${sel.length} subscription${sel.length === 1 ? '' : 's'}?`, { title: 'Confirm bulk action', confirmLabel: verb[0].toUpperCase() + verb.slice(1), danger: action === 'SUSPEND' }))) return;
    setBusy(true);
    try {
      const r: any = await api.post('/admin/platform/subscriptions/bulk', { subscriptionIds: sel, action, months, reason: reason.trim() });
      toast(`${r.succeeded} done${r.failed ? `, ${r.failed} failed` : ''}.`, r.failed ? 'warning' : 'success');
      if (r.failed) {
        const first = r.results.find((x: any) => !x.ok);
        if (first) toast(`First failure: ${first.error}`, 'error');
      }
      setSel([]);
      setReason('');
      await load();
      onChanged?.();
    } catch (e: any) { toast(e.message || 'Bulk action failed', 'error'); } finally { setBusy(false); }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #dcebe6', marginBottom: 28, overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid #ebf5f1' }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#0e3e3b' }}>All School Subscriptions</h3>
        <p style={{ fontSize: 12, color: '#5f736f', margin: '2px 0 0' }}>Tick several schools, then extend, suspend or reactivate them in one step.</p>
      </div>
      <div style={{ padding: '12px 24px', display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid #ebf5f1' }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search school or EMIS code" aria-label="Search subscriptions" style={{ ...field, flex: '1 1 200px' }} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" style={field}>
          <option value="">All statuses</option>
          {Object.keys(STATUS).map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>
      {sel.length > 0 && (
        <div style={{ padding: '12px 24px', background: '#e6f7f0', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <b style={{ fontSize: 13 }}>{sel.length} selected</b>
          <label style={{ fontSize: 12, color: '#4b605b' }}>Months <input type="number" min={1} max={60} value={months} onChange={(e) => setMonths(Math.max(1, Math.min(60, Number(e.target.value) || 1)))} style={{ ...field, width: 70, marginLeft: 4 }} /></label>
          <button type="button" disabled={busy} style={btn('#117a6b')} onClick={() => run('EXTEND')}>+ Extend</button>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (needed to suspend)" aria-label="Reason" style={{ ...field, flex: '1 1 180px' }} />
          <button type="button" disabled={busy} style={btn('#dc2626')} onClick={() => run('SUSPEND')}>Suspend</button>
          <button type="button" disabled={busy} style={btn('#fff', '#0e3e3b')} onClick={() => run('ACTIVATE')}>Reactivate</button>
          <button type="button" disabled={busy} style={btn('#fff', '#5f736f')} onClick={() => setSel([])}>Clear</button>
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
          <thead>
            <tr>
              <th style={{ ...th, width: 36 }}><input type="checkbox" aria-label="Select all" checked={all} onChange={() => setSel(all ? [] : (rows || []).map((r) => r.id))} /></th>
              <th style={th}>School</th><th style={th}>Package</th><th style={th}>Status</th><th style={th}>Ends</th>
            </tr>
          </thead>
          <tbody>
            {rows === null && <tr><td style={td} colSpan={5}>Loading…</td></tr>}
            {rows?.length === 0 && <tr><td style={td} colSpan={5}>No subscriptions match.</td></tr>}
            {rows?.map((r) => {
              const [bg, color] = STATUS[r.status] || ['#ebf5f1', '#4b605b'];
              return (
                <tr key={r.id} style={{ background: sel.includes(r.id) ? '#f4faf8' : undefined }}>
                  <td style={td}><input type="checkbox" aria-label={`Select ${r.institution?.name || 'subscription'}`} checked={sel.includes(r.id)} onChange={() => toggle(r.id)} /></td>
                  <td style={td}>{r.institution ? <><b>{r.institution.name}</b><div style={{ fontSize: 11, color: '#5f736f' }}>{r.institution.emisCode} · {r.institution.province}</div></> : <span style={{ color: '#8da19d' }}>School no longer exists</span>}</td>
                  <td style={td}>{r.plan}</td>
                  <td style={td}><span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, background: bg, color }}>{r.status.replace('_', ' ')}</span></td>
                  <td style={td}>{formatDate(r.endDate)}{r.daysLeft !== null && <span style={{ color: r.daysLeft < 0 ? '#b91c1c' : r.daysLeft <= 30 ? '#4c3fa8' : '#5f736f', marginLeft: 6, fontSize: 11 }}>{r.daysLeft < 0 ? `${Math.abs(r.daysLeft)}d ago` : `${r.daysLeft}d left`}</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
