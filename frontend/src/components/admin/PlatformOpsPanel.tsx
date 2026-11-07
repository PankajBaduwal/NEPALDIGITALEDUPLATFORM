import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, Megaphone, Sparkles, Eye, Trash2, Send } from 'lucide-react';
import { api } from '../../services/api';
import { useDialogs } from '../common/Dialogs';
import { formatDate, formatDateTime } from '../../utils/dates';

type Tab = 'HEALTH' | 'AI' | 'ANNOUNCE';

const card: React.CSSProperties = { background: '#fff', border: '1px solid #dcebe6', borderRadius: 12, padding: 18 };
const th: React.CSSProperties = { textAlign: 'left', padding: '10px 12px', fontSize: 11, color: '#5f736f', fontWeight: 800, textTransform: 'uppercase', borderBottom: '1px solid #dcebe6', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #ebf5f1', verticalAlign: 'top' };
const field: React.CSSProperties = { padding: '8px 10px', borderRadius: 8, border: '1px solid #cfdcd8', fontSize: 13, background: '#fff', minWidth: 0 };
const btn = (bg = '#fff', color = '#0e3e3b'): React.CSSProperties => ({ background: bg, color, padding: '7px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12, border: bg === '#fff' ? '1px solid #cfdcd8' : 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 });
const PROVINCES = ['Koshi Province', 'Madhesh Province', 'Bagmati Province', 'Gandaki Province', 'Lumbini Province', 'Karnali Province', 'Sudurpashchim Province'];
const n = (v: number) => (v || 0).toLocaleString('en-IN');

const FLAG: Record<string, { label: string; bg: string; color: string }> = {
  SUBSCRIPTION_EXPIRING: { label: 'Subscription expiring', bg: '#ede9fe', color: '#3b2f8f' },
  SUBSCRIPTION_INACTIVE: { label: 'Subscription inactive', bg: '#fee2e2', color: '#991b1b' },
  NO_SUBSCRIPTION: { label: 'No subscription', bg: '#fee2e2', color: '#991b1b' },
  NO_RECENT_ACTIVITY: { label: 'Quiet for 14+ days', bg: '#e0e7ff', color: '#3730a3' },
};

export const PlatformOpsPanel: React.FC = () => {
  const [tab, setTab] = useState<Tab>('HEALTH');
  const tabs: Array<[Tab, string, React.ReactNode]> = [
    ['HEALTH', 'School health', <Activity size={15} key="a" />],
    ['AI', 'AI usage', <Sparkles size={15} key="b" />],
    ['ANNOUNCE', 'Announcements', <Megaphone size={15} key="c" />],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div role="tablist" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tabs.map(([k, label, icon]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} style={{ ...btn(tab === k ? '#117a6b' : '#fff', tab === k ? '#fff' : '#2f4f4c'), padding: '8px 16px', fontSize: 13 }}>
            {icon} {label}
          </button>
        ))}
      </div>
      {tab === 'HEALTH' && <Health />}
      {tab === 'AI' && <AiUsage />}
      {tab === 'ANNOUNCE' && <Announcements />}
    </div>
  );
};

/* ───────────────────────────── School health ───────────────────────────── */
const Health: React.FC = () => {
  const { toast, confirm } = useDialogs();
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [dq, setDq] = useState('');
  const [flag, setFlag] = useState('');
  const [busyId, setBusyId] = useState('');
  useEffect(() => { const t = setTimeout(() => setDq(search.trim()), 300); return () => clearTimeout(t); }, [search]);
  const load = useCallback(async () => {
    const p = new URLSearchParams();
    if (dq) p.set('search', dq);
    if (flag) p.set('flag', flag);
    try { setData(await api.get(`/admin/platform/health?${p.toString()}`)); } catch (e: any) { toast(e.message || 'Could not load school health', 'error'); }
  }, [dq, flag, toast]);
  useEffect(() => { load(); }, [load]);

  const viewAs = async (row: any) => {
    if (!(await confirm(`You will see the platform exactly as the administrator of "${row.name}" does, for up to 1 hour. Every change you make is recorded in the audit log under your name. Passwords and security settings stay locked.`, { title: `View as ${row.name}?`, confirmLabel: 'Start viewing' }))) return;
    setBusyId(row.id);
    try {
      const r: any = await api.post('/admin/platform/impersonate', { institutionId: row.id });
      // keep the Super Admin session so "Exit" can restore it
      localStorage.setItem('nepal_edu_admin_backup', JSON.stringify({ token: localStorage.getItem('nepal_edu_token'), user: localStorage.getItem('nepal_edu_user') }));
      localStorage.setItem('nepal_edu_impersonation', JSON.stringify({ school: row.name, as: r.user.fullName || r.user.username, role: r.user.role, until: Date.now() + (r.expiresInMinutes || 60) * 60_000 }));
      localStorage.setItem('nepal_edu_token', r.token);
      localStorage.setItem('nepal_edu_user', JSON.stringify(r.user));
      window.location.href = r.user.role === 'PRINCIPAL' ? '/principal' : '/school-admin';
    } catch (e: any) {
      toast(e.message || 'Could not start the view', 'error');
      setBusyId('');
    }
  };

  const s = data?.summary;
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
        {[['Schools', s?.institutions, '#0e3e3b'], ['Active users this week', s?.activeUsers7d, '#0f5f55'], ['Subscriptions expiring ≤ 30 days', s?.expiringSoon, '#4c3fa8'], ['Inactive or missing subscription', s?.inactiveSubscriptions, '#b91c1c'], ['Quiet schools (14+ days)', s?.quietSchools, '#4338ca']].map(([k, v, c]) => (
          <div key={String(k)} style={card}>
            <div style={{ fontSize: 12, color: '#5f736f', fontWeight: 700 }}>{k}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: String(c), marginTop: 4 }}>{v ?? '…'}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search school, EMIS code or district" aria-label="Search schools" style={{ ...field, flex: '1 1 220px' }} />
        <select value={flag} onChange={(e) => setFlag(e.target.value)} aria-label="Show" style={field}>
          <option value="">All schools</option>
          <option value="ANY">Needs attention</option>
          <option value="SUBSCRIPTION_EXPIRING">Subscription expiring</option>
          <option value="SUBSCRIPTION_INACTIVE">Subscription inactive</option>
          <option value="NO_RECENT_ACTIVITY">Quiet for 14+ days</option>
        </select>
      </div>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
          <thead>
            <tr><th style={th}>School</th><th style={th}>People</th><th style={th}>Last sign-in</th><th style={th}>Active (7 days)</th><th style={th}>AI (30 days)</th><th style={th}>Subscription</th><th style={th}>Alerts</th><th style={th} /></tr>
          </thead>
          <tbody>
            {!data && <tr><td style={td} colSpan={8}>Loading…</td></tr>}
            {data?.rows.length === 0 && <tr><td style={td} colSpan={8}>No schools match.</td></tr>}
            {data?.rows.map((r: any) => (
              <tr key={r.id}>
                <td style={td}><div style={{ fontWeight: 700 }}>{r.name}</div><div style={{ fontSize: 11, color: '#5f736f' }}>{r.emisCode} · {r.province}</div></td>
                <td style={td}>{n(r.students)} students<br /><span style={{ color: '#5f736f' }}>{n(r.teachers)} teachers</span></td>
                <td style={td}>{r.lastSeenAt ? formatDateTime(r.lastSeenAt) : <span style={{ color: '#8da19d' }}>No sign-ins recorded yet</span>}</td>
                <td style={td}>{n(r.activeUsers7d)}</td>
                <td style={td}>{n(r.aiRequests30d)} requests</td>
                <td style={td}>
                  {r.subscription ? (<><div style={{ fontWeight: 600 }}>{r.subscription.plan}</div><div style={{ fontSize: 11, color: '#5f736f' }}>{r.subscription.status} · {r.subscription.daysLeft === null ? '' : r.subscription.daysLeft < 0 ? `ended ${Math.abs(r.subscription.daysLeft)}d ago` : `${r.subscription.daysLeft}d left`} ({formatDate(r.subscription.endDate)})</div></>) : <span style={{ color: '#b91c1c' }}>None</span>}
                </td>
                <td style={td}>{r.flags.length === 0 ? <span style={{ color: '#0f5f55' }}>Healthy</span> : r.flags.map((f: string) => <span key={f} style={{ display: 'inline-block', margin: '0 4px 4px 0', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: FLAG[f]?.bg, color: FLAG[f]?.color }}>{FLAG[f]?.label || f}</span>)}</td>
                <td style={td}><button type="button" style={btn()} disabled={busyId === r.id || r.status !== 'ACTIVE'} onClick={() => viewAs(r)}><Eye size={13} /> {busyId === r.id ? 'Opening…' : 'View as admin'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: '#5f736f' }}>"Last sign-in" and "Active" count from now on: people appear here after their next sign-in or request.</p>
    </>
  );
};

/* ───────────────────────────── AI usage ───────────────────────────── */
const AiUsage: React.FC = () => {
  const { toast } = useDialogs();
  const [days, setDays] = useState(30);
  const [d, setD] = useState<any>(null);
  useEffect(() => { api.get(`/admin/platform/ai-usage?days=${days}`).then(setD).catch((e: any) => toast(e.message || 'Could not load AI usage', 'error')); }, [days, toast]);
  const max = useMemo(() => Math.max(1, ...(d?.daily || []).map((x: any) => x.requests)), [d]);
  if (!d) return <div style={card}>Loading…</div>;
  const q = d.quota;
  const pct = Math.min(100, Math.round((q.usedToday / Math.max(1, q.dailyLimit)) * 100));
  return (
    <>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: '#4b605b' }}>Period</span>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Period" style={field}>
          {[7, 30, 90].map((x) => <option key={x} value={x}>Last {x} days</option>)}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
        {[['Requests', n(d.totals.requests)], ['Answered from textbooks', d.totals.requests ? `${Math.round((d.totals.grounded / d.totals.requests) * 100)}%` : '—'], ['Failed', n(d.totals.failed)], ['Tokens used', n(d.totals.inputTokens + d.totals.outputTokens)], ['Average reply time', d.totals.avgLatencyMs ? `${(d.totals.avgLatencyMs / 1000).toFixed(1)} s` : '—']].map(([k, v]) => (
          <div key={k} style={card}><div style={{ fontSize: 12, color: '#5f736f', fontWeight: 700 }}>{k}</div><div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{v}</div></div>
        ))}
      </div>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <b>Today against the daily limit</b>
          <span style={{ fontSize: 13, color: '#4b605b' }}>{q.usedToday} of {q.dailyLimit} requests · plan: <b>{q.tier}</b> · model {q.model}</span>
        </div>
        <div style={{ height: 12, background: '#dcebe6', borderRadius: 999, overflow: 'hidden' }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <div style={{ width: `${pct}%`, height: '100%', background: pct >= 90 ? '#dc2626' : pct >= 70 ? '#6d5bd0' : '#16a34a', transition: 'width 0.4s ease' }} />
        </div>
        <p style={{ fontSize: 12, color: '#5f736f', margin: '8px 0 0' }}>{q.note}</p>
      </div>
      <div style={card}>
        <b>Requests per day</b>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 110, marginTop: 10 }} aria-label="Requests per day">
          {d.daily.length === 0 && <span style={{ color: '#5f736f', fontSize: 13 }}>No AI requests in this period.</span>}
          {d.daily.map((x: any) => <div key={x.date} title={`${x.date}: ${x.requests} requests`} style={{ flex: 1, minWidth: 4, height: `${Math.max(4, (x.requests / max) * 100)}%`, background: '#117a6b', borderRadius: '3px 3px 0 0' }} />)}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <div style={{ padding: '14px 16px', fontWeight: 800 }}>By school</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>School</th><th style={th}>Requests</th><th style={th}>Failed</th><th style={th}>Tokens</th></tr></thead>
            <tbody>
              {d.byInstitution.length === 0 && <tr><td style={td} colSpan={4}>No usage yet.</td></tr>}
              {d.byInstitution.map((r: any, i: number) => <tr key={i}><td style={td}>{r.name}</td><td style={td}>{n(r.requests)}</td><td style={td}>{n(r.failed)}</td><td style={td}>{n(r.tokens)}</td></tr>)}
            </tbody>
          </table>
        </div>
        <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
          <div style={{ padding: '14px 16px', fontWeight: 800 }}>By feature</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={th}>Feature</th><th style={th}>Requests</th><th style={th}>Tokens</th></tr></thead>
            <tbody>
              {d.byFeature.length === 0 && <tr><td style={td} colSpan={3}>No usage yet.</td></tr>}
              {d.byFeature.map((r: any) => <tr key={r.feature}><td style={td}>{r.feature}</td><td style={td}>{n(r.requests)}</td><td style={td}>{n(r.tokens)}</td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

/* ───────────────────────────── Announcements ───────────────────────────── */
const Announcements: React.FC = () => {
  const { toast, confirm } = useDialogs();
  const [list, setList] = useState<any[] | null>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [f, setF] = useState({ title: '', content: '', scope: 'ALL', province: PROVINCES[0], audience: 'ALL', priority: 'NORMAL' });
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api.get<any[]>('/admin/platform/announcements').then(setList).catch(() => setList([])), []);
  useEffect(() => { load(); api.get<any>('/admin/institutions?limit=200').then((r) => setSchools(r.items || [])).catch(() => {}); }, [load]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const who = f.scope === 'ALL' ? 'every active school' : f.scope === 'PROVINCE' ? f.province : `${picked.length} selected school(s)`;
    if (!(await confirm(`Send "${f.title}" to ${who}? Each school's announcement board will show it right away.`, { title: 'Send announcement?', confirmLabel: 'Send' }))) return;
    setBusy(true);
    try {
      const r: any = await api.post('/admin/platform/announcements', { ...f, institutionIds: picked });
      toast(`Sent to ${r.institutions} school${r.institutions === 1 ? '' : 's'}.`, 'success');
      setF({ ...f, title: '', content: '' });
      load();
    } catch (err: any) { toast(err.message || 'Could not send', 'error'); } finally { setBusy(false); }
  };
  const withdraw = async (a: any) => {
    if (!(await confirm(`Remove "${a.title}" from all ${a.institutions} school(s)?`, { title: 'Withdraw announcement?', confirmLabel: 'Withdraw', danger: true }))) return;
    try { await api.delete(`/admin/platform/announcements/${a.batchId}`); toast('Announcement withdrawn.', 'success'); load(); } catch (err: any) { toast(err.message || 'Could not withdraw', 'error'); }
  };

  return (
    <>
      <form onSubmit={send} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <b>New platform announcement</b>
        <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={160} placeholder="Title" aria-label="Title" style={field} required />
        <textarea value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} maxLength={4000} rows={4} placeholder="Message" aria-label="Message" style={{ ...field, fontFamily: 'inherit' }} required />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select value={f.scope} onChange={(e) => setF({ ...f, scope: e.target.value })} aria-label="Send to" style={field}>
            <option value="ALL">All schools</option><option value="PROVINCE">One province</option><option value="INSTITUTIONS">Selected schools</option>
          </select>
          {f.scope === 'PROVINCE' && <select value={f.province} onChange={(e) => setF({ ...f, province: e.target.value })} aria-label="Province" style={field}>{PROVINCES.map((p) => <option key={p}>{p}</option>)}</select>}
          <select value={f.audience} onChange={(e) => setF({ ...f, audience: e.target.value })} aria-label="Audience" style={field}>
            <option value="ALL">Everyone at the school</option><option value="TEACHERS">Teachers only</option><option value="STUDENTS">Students only</option>
          </select>
          <select value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })} aria-label="Priority" style={field}>
            <option value="NORMAL">Normal</option><option value="HIGH">High</option><option value="URGENT">Urgent</option>
          </select>
        </div>
        {f.scope === 'INSTITUTIONS' && (
          <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid #dcebe6', borderRadius: 8, padding: 8 }}>
            {schools.map((s) => (
              <label key={s.id || s._id} style={{ display: 'flex', gap: 8, fontSize: 13, padding: '3px 0' }}>
                <input type="checkbox" checked={picked.includes(s.id || s._id)} onChange={(e) => setPicked((p) => (e.target.checked ? [...p, s.id || s._id] : p.filter((x) => x !== (s.id || s._id))))} /> {s.name} <span style={{ color: '#8da19d' }}>{s.emisCode}</span>
              </label>
            ))}
          </div>
        )}
        <div><button type="submit" disabled={busy || !f.title.trim() || !f.content.trim() || (f.scope === 'INSTITUTIONS' && !picked.length)} style={{ ...btn('#117a6b', '#fff'), padding: '9px 18px', opacity: busy ? 0.6 : 1 }}><Send size={14} /> {busy ? 'Sending…' : 'Send announcement'}</button></div>
      </form>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '14px 16px', fontWeight: 800 }}>Sent announcements</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead><tr><th style={th}>When</th><th style={th}>Title</th><th style={th}>Sent to</th><th style={th}>Audience</th><th style={th} /></tr></thead>
          <tbody>
            {list === null && <tr><td style={td} colSpan={5}>Loading…</td></tr>}
            {list?.length === 0 && <tr><td style={td} colSpan={5}>Nothing sent yet.</td></tr>}
            {list?.map((a) => (
              <tr key={a.batchId}>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>{formatDateTime(a.sentAt)}</td>
                <td style={td}><b>{a.title}</b>{a.priority !== 'NORMAL' && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 800, color: '#b91c1c' }}>{a.priority}</span>}<div style={{ fontSize: 12, color: '#5f736f', maxWidth: 420 }}>{a.content.slice(0, 120)}{a.content.length > 120 ? '…' : ''}</div></td>
                <td style={td}>{a.scope} · {a.institutions} school{a.institutions === 1 ? '' : 's'}</td>
                <td style={td}>{a.audience === 'ALL' ? 'Everyone' : a.audience === 'TEACHERS' ? 'Teachers' : 'Students'}</td>
                <td style={td}><button type="button" style={btn('#fff', '#b91c1c')} onClick={() => withdraw(a)}><Trash2 size={13} /> Withdraw</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
