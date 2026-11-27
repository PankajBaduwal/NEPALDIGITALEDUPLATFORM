import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ArrowLeft, Building2, GraduationCap, Users, Layers, ClipboardCheck, BookOpen, Sparkles, CalendarCheck, Pencil, ShieldCheck, RefreshCw, LogOut, Menu, CreditCard, TrendingUp, Clock, FileSpreadsheet, UserCog, LayoutDashboard, ToggleRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DemoBanner } from '../components/common/DemoBanner';
import './superAdminResponsive.css';
import { usePersistentState } from '../hooks/usePersistentState';

/**
 * Super Admin → one school, as a full page.
 * Privacy: this page only ever receives counts and trends. No teacher or student is named anywhere;
 * the only people shown are the school's designated Principal and Administrator.
 */

const C = { teal: '#117a6b', dark: '#0f4c4a', mint: '#2fcf9c', purple: '#7c3aed', amber: '#f59e0b', red: '#dc2626', blue: '#2563eb', grey: '#5f736f', line: '#dcebe6' };

const FEATURE_COLUMNS: [string, string][] = [['ASSIGNMENTS', 'Assignments'], ['QUIZZES', 'Quizzes'], ['NOTES', 'Notes'], ['MATERIALS', 'Materials'], ['VIDEOS', 'Videos'], ['SIMULATIONS', 'Simulations'], ['AI_STUDENT_ACCESS', 'Student AI']];

type Tab = 'OVERVIEW' | 'PEOPLE' | 'ACCESS' | 'SUBSCRIPTION' | 'PROFILE';

const card: React.CSSProperties = { background: '#fff', border: `1px solid ${C.line}`, borderRadius: 16, padding: 18, boxShadow: '0 2px 8px rgba(234,88,12,0.05)' };
const fmt = (n: any) => (typeof n === 'number' ? n.toLocaleString('en-IN') : '—');

const Kpi: React.FC<{ icon: React.ReactNode; label: string; value: any; sub?: string; color: string; onClick?: () => void; active?: boolean }> = ({ icon, label, value, sub, color, onClick, active }) => (
  <button
    onClick={onClick}
    style={{ ...card, textAlign: 'left', cursor: onClick ? 'pointer' : 'default', borderColor: active ? color : C.line, outline: 'none', transition: 'transform .12s, box-shadow .12s' }}
    onMouseEnter={(e) => { (e.currentTarget.style.transform = 'translateY(-2px)'); }}
    onMouseLeave={(e) => { (e.currentTarget.style.transform = 'none'); }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.grey, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4 }}>
      <span style={{ color }}>{icon}</span>{label}
    </div>
    <div style={{ fontSize: 30, fontWeight: 900, color, marginTop: 6, lineHeight: 1.1 }}>{typeof value === 'number' ? fmt(value) : value}</div>
    {sub && <div style={{ fontSize: 12, color: C.grey, marginTop: 4 }}>{sub}</div>}
  </button>
);

const Panel: React.FC<{ title: string; hint?: string; right?: React.ReactNode; children: React.ReactNode; empty?: boolean; emptyText?: string }> = ({ title, hint, right, children, empty, emptyText }) => (
  <div style={card}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
      <div>
        <div style={{ fontWeight: 900, color: C.dark, fontSize: 15 }}>{title}</div>
        {hint && <div style={{ fontSize: 12, color: C.grey, marginTop: 2 }}>{hint}</div>}
      </div>
      {right}
    </div>
    {empty ? <div style={{ padding: '40px 0', textAlign: 'center', color: C.grey, fontSize: 13 }}>{emptyText || 'No data yet'}</div> : children}
  </div>
);

export const SuperAdminSchoolPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedTab, setTab] = usePersistentState<Tab>(`superadmin.school.${id}.tab`, 'OVERVIEW');
  const TABS: Tab[] = ['OVERVIEW', 'PEOPLE', 'ACCESS', 'SUBSCRIPTION', 'PROFILE'];
  const tab: Tab = TABS.includes(savedTab) ? savedTab : 'OVERVIEW';
  const [gradeFocus, setGradeFocus] = useState<string | null>(null);

  // Student dashboard access (school-wide and per class), controlled only from here
  const [access, setAccess] = useState<any>(null);
  const [accessBusy, setAccessBusy] = useState<string | null>(null);
  const [accessError, setAccessError] = useState('');
  const [matrix, setMatrix] = useState<any>(null);
  const loadAccess = async () => {
    try {
      const res: any = await api.get(`/admin/institutions/${id}/student-access`);
      setAccess(res && res.data ? res.data : res);
      setAccessError('');
      const m: any = await api.get(`/feature-access/matrix?institutionId=${id}`);
      setMatrix(m && m.data ? m.data : m);
    } catch (e: any) {
      setAccessError(e?.message || 'Could not load access settings');
    }
  };
  const toggleClassFeature = async (classId: string, featureKey: string, enabled: boolean) => {
    setAccessBusy(`F${classId}${featureKey}`);
    try {
      await api.put(`/feature-access/classes/${classId}`, { institutionId: id, featureKey, enabled, reason: 'Changed by the Super Admin' });
      await loadAccess();
    } catch (e: any) {
      setAccessError(e?.message || 'Could not save');
    } finally {
      setAccessBusy(null);
    }
  };
  const setStudentAccess = async (scope: 'SCHOOL' | 'CLASS', enabled: boolean, classId?: string) => {
    const what = scope === 'SCHOOL' ? 'the whole school' : (access?.classes || []).find((c: any) => c.classId === classId)?.name || 'this class';
    const msg = enabled
      ? `Turn the student dashboard ON for ${what}?`
      : `Turn the student dashboard OFF for ${what}?\n\nStudents will not be able to use their dashboard, and assignments, quizzes, notes, materials, videos and resource sharing will disappear for them and for their teachers.`;
    if (!window.confirm(msg)) return;
    setAccessBusy(scope + (classId || ''));
    try {
      const res: any = await api.put(`/admin/institutions/${id}/student-access`, { scope, classId, enabled });
      setAccess(res && res.data ? res.data : res);
      setAccessError('');
    } catch (e: any) {
      setAccessError(e?.message || 'Could not save');
    } finally {
      setAccessBusy(null);
    }
  };

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res: any = await api.get(`/admin/institutions/${id}/insights`);
      const payload = res && res.data ? res.data : res;
      setData(payload);
      const i = payload.institution || {};
      setForm({ name: i.name || '', nameNepali: i.nameNepali || '', type: i.type || 'COMMUNITY', status: i.status || 'ACTIVE', province: i.province || '', district: i.district || '', localLevel: i.localLevel || '', ward: i.ward ?? '', email: i.email || '', phone: i.phone || '', website: i.website || '' });
    } catch (e: any) {
      setError(e?.message || 'Could not load this school');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/admin/institutions/${id}`, form);
      setEditing(false);
      await load();
    } catch (err: any) {
      alert(err?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const inst = data?.institution;
  const counts = data?.counts || {};
  const peopleSplit = useMemo(() => [
    { name: 'Students', value: counts.students || 0, color: C.teal },
    { name: 'Teachers', value: counts.teachers || 0, color: C.purple },
    { name: 'Leadership', value: counts.leaders || 0, color: C.amber },
  ].filter((x) => x.value > 0), [counts]);
  const gradeRows = data?.studentsPerGrade || [];
  const totalStudents = counts.students || 0;
  const ratio = counts.teachers ? (totalStudents / counts.teachers).toFixed(1) : '—';

  const [navOpen, setNavOpen] = useState(false);
  const [, setDashTab] = usePersistentState<string>('superadmin.tab', 'OVERVIEW');

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setNavOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navOpen]);

  useEffect(() => { if (tab === 'ACCESS') loadAccess(); /* eslint-disable-next-line */ }, [tab, id]);

  const goDashboard = (key: string) => { setDashTab(key); navigate('/super-admin'); };

  if (loading && !data) return <div style={{ padding: 60, textAlign: 'center', color: C.grey }}>Loading school dashboard…</div>;
  if (error) return (
    <div style={{ padding: 60, textAlign: 'center' }}>
      <div style={{ color: C.red, fontWeight: 800, marginBottom: 12 }}>{error}</div>
      <button onClick={() => navigate('/super-admin')} style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${C.line}`, cursor: 'pointer' }}>Back to Super Admin</button>
    </div>
  );

  const sub = data?.subscription;

  const SCHOOL_NAV: { label: string; items: { key: Tab; label: string; icon: React.ComponentType<any> }[] }[] = [
    { label: 'This school', items: [
      { key: 'OVERVIEW', label: 'School Overview', icon: LayoutDashboard },
      { key: 'PEOPLE', label: 'Students & Teachers', icon: GraduationCap },
    ] },
    { label: 'Account', items: [
      { key: 'ACCESS', label: 'Student Access', icon: ToggleRight },
      { key: 'SUBSCRIPTION', label: 'Subscription', icon: CreditCard },
      { key: 'PROFILE', label: 'School Profile & Leadership', icon: UserCog },
    ] },
  ];
  const PLATFORM_NAV: { key: string; label: string; icon: React.ComponentType<any> }[] = [
    { key: 'OVERVIEW', label: 'Central Overview', icon: Building2 },
    { key: 'INSTITUTIONS', label: 'Institutions Directory', icon: Building2 },
    { key: 'PLATFORM', label: 'Platform Operations', icon: TrendingUp },
    { key: 'REQUESTS', label: 'Registration Requests', icon: ShieldCheck },
    { key: 'IMPORT', label: 'Bulk Onboarding', icon: FileSpreadsheet },
    { key: 'SUBSCRIPTIONS', label: 'Subscriptions & Licensing', icon: Clock },
  ];
  const currentLabel = SCHOOL_NAV.flatMap((g) => g.items).find((i) => i.key === tab)?.label || '';
  const pick = (k: Tab) => { setTab(k); setNavOpen(false); };

  const Switch: React.FC<{ on: boolean; busy?: boolean; disabled?: boolean; onClick: () => void; label: string }> = ({ on, busy, disabled, onClick, label }) => (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={busy || disabled}
      onClick={onClick}
      style={{ width: 52, height: 30, borderRadius: 30, border: 'none', cursor: busy || disabled ? 'not-allowed' : 'pointer', background: on ? C.teal : '#cbd5d1', position: 'relative', transition: 'background .15s', opacity: busy || disabled ? 0.6 : 1, flexShrink: 0 }}
    >
      <span style={{ position: 'absolute', top: 3, left: on ? 25 : 3, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }} />
    </button>
  );

  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(340px,100%),1fr))', gap: 16 } as React.CSSProperties;
  const statList = (rows: [string, any, string][]) => (
    <div style={{ display: 'grid', gap: 10 }}>
      {rows.map(([l, v, col]) => (
        <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: `1px solid ${C.line}`, borderRadius: 12, padding: '12px 14px' }}>
          <span style={{ color: C.grey, fontWeight: 700, fontSize: 13 }}>{l}</span>
          <span style={{ color: col, fontWeight: 900, fontSize: 22 }}>{v}</span>
        </div>
      ))}
    </div>
  );

  const gradeBars = (height: number) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={gradeRows} margin={{ left: -12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5efeb" />
        <XAxis dataKey="grade" tick={{ fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={55} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip cursor={{ fill: 'rgba(234,88,12,0.08)' }} />
        <Bar dataKey="students" name="Students" radius={[6, 6, 0, 0]} onClick={(d: any) => setGradeFocus((g) => (g === d.grade ? null : d.grade))}>
          {gradeRows.map((r: any) => <Cell key={r.grade} fill={gradeFocus && gradeFocus !== r.grade ? '#bfe3da' : C.teal} cursor="pointer" />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
  const focusRow = gradeFocus ? gradeRows.find((r: any) => r.grade === gradeFocus) : null;
  const focusNote = focusRow && (
    <div style={{ marginTop: 6, fontSize: 13, color: C.dark, fontWeight: 800 }}>
      {focusRow.grade}: {fmt(focusRow.students)} students ({totalStudents ? Math.round((focusRow.students / totalStudents) * 100) : 0}% of the school)
    </div>
  );

  const donut = (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={peopleSplit} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3}>
          {peopleSplit.map((p) => <Cell key={p.name} fill={p.color} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );

  const regChart = (height: number) => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={(data?.registrations || []).map((r: any) => ({ ...r, month: r.month.slice(2) }))} margin={{ left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5efeb" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="students" name="Students registered" stroke={C.teal} fill={C.teal} fillOpacity={0.18} strokeWidth={2.5} />
        <Area type="monotone" dataKey="teachers" name="Teachers registered" stroke={C.purple} fill={C.purple} fillOpacity={0.18} strokeWidth={2.5} />
      </AreaChart>
    </ResponsiveContainer>
  );
  const hasRegistrations = (data?.registrations || []).some((r: any) => r.students || r.teachers);

  const sectionsChart = (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data?.sectionsPerGrade || []} margin={{ left: -12 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5efeb" />
        <XAxis dataKey="grade" tick={{ fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={55} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip cursor={{ fill: 'rgba(37,99,235,0.08)' }} />
        <Bar dataKey="sections" name="Sections" fill={C.blue} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );

  const kpiRow = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(200px,100%),1fr))', gap: 14, marginBottom: 18 }}>
      <Kpi icon={<GraduationCap size={15} />} label="Registered students" value={counts.students} sub={`${fmt(counts.studentsActive)} active accounts`} color={C.teal} onClick={() => pick('PEOPLE')} />
      <Kpi icon={<Users size={15} />} label="Registered teachers" value={counts.teachers} sub={`${fmt(counts.teachersActive)} active accounts`} color={C.purple} onClick={() => pick('PEOPLE')} />
      <Kpi icon={<Layers size={15} />} label="Classes / sections" value={`${counts.classes ?? 0} / ${counts.sections ?? 0}`} sub="in this school" color={C.blue} onClick={() => pick('PEOPLE')} />
      <Kpi icon={<Users size={15} />} label="Student : teacher" value={`${ratio} : 1`} sub="students per teacher" color={C.amber} onClick={() => pick('PEOPLE')} />
    </div>
  );

  return (
    <div className="sa-root" style={{ display: 'flex', minHeight: '100vh', background: '#f4faf8', color: '#0e3e3b' }}>
      <div className={`sa-overlay${navOpen ? ' is-open' : ''}`} onClick={() => setNavOpen(false)} aria-hidden="true" />

      {/* Sidebar: this school's pages first, then the platform's own navigation */}
      <div className={`sa-sidebar${navOpen ? ' is-open' : ''}`} role="navigation" aria-label="School navigation" style={{ width: 260, background: '#fff', borderRight: '1px solid #dcebe6', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #dcebe6' }}>
          <img src="/brand/logo/logo-horizontal.svg" alt="Nepal Digital Education Platform" style={{ height: 40, width: 'auto', maxWidth: '100%', display: 'block' }} />
          <div style={{ fontSize: 11, color: '#5f736f', fontWeight: 700, marginTop: 8, letterSpacing: '0.04em' }}>Central Super Admin</div>
        </div>

        <div style={{ margin: '12px 10px 0', padding: '10px 12px', borderRadius: 12, background: '#e6f7f0', border: '1px solid #cdeee1' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.teal, letterSpacing: 0.5 }}>VIEWING SCHOOL</div>
          <div style={{ fontWeight: 900, color: C.dark, fontSize: 13, lineHeight: 1.25, marginTop: 2 }}>{inst?.name}</div>
          <div style={{ fontSize: 11, color: C.grey }}>EMIS {inst?.emisCode}</div>
        </div>

        <nav aria-label="Sections" style={{ flex: 1, padding: '12px 10px 16px', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
          <button type="button" className="sa-nav-item" onClick={() => goDashboard('INSTITUTIONS')}>
            <ArrowLeft size={18} aria-hidden="true" /><span className="sa-nav-text">All schools</span>
          </button>
          {SCHOOL_NAV.map((g) => (
            <div key={g.label}>
              <div className="sa-nav-label">{g.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
                {g.items.map((it) => {
                  const Icon = it.icon;
                  const active = tab === it.key;
                  return (
                    <button key={it.key} type="button" className={`sa-nav-item${active ? ' is-active' : ''}`} aria-current={active ? 'page' : undefined} onClick={() => pick(it.key)}>
                      <Icon size={18} aria-hidden="true" /><span className="sa-nav-text">{it.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div>
            <div className="sa-nav-label">Platform</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 2 }}>
              {PLATFORM_NAV.map((it) => {
                const Icon = it.icon;
                return (
                  <button key={it.key} type="button" className="sa-nav-item" onClick={() => goDashboard(it.key)}>
                    <Icon size={18} aria-hidden="true" /><span className="sa-nav-text">{it.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <div style={{ padding: 16, borderTop: '1px solid #dcebe6', background: '#f4faf8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#117a6b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 13 }}>SA</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Super Admin</div>
                <div style={{ fontSize: 11, color: '#5f736f' }}>{user?.email || 'superadmin@nepaledu.gov.np'}</div>
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} title="Sign out" style={{ color: '#ef4444', background: 'transparent', padding: 6, cursor: 'pointer', border: 'none' }}><LogOut size={16} /></button>
          </div>
        </div>
      </div>

      <div className="sa-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        <div className="sa-topbar">
          <button type="button" aria-label="Open navigation menu" aria-expanded={navOpen} onClick={() => setNavOpen(true)}><Menu size={20} /></button>
          <div>
            <div className="sa-topbar-title">{inst?.name}</div>
            <div className="sa-topbar-sub">{currentLabel}</div>
          </div>
        </div>
        <DemoBanner />

        <div className="sa-header" style={{ padding: '20px 32px', borderBottom: '1px solid #dcebe6', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg,#117a6b,#0f5f55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><Building2 size={22} /></div>
            <div style={{ minWidth: 0 }}>
              <div className="sa-crumb">
                <span style={{ cursor: 'pointer' }} onClick={() => goDashboard('INSTITUTIONS')}>Super Admin / Institutions</span> / {inst?.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{currentLabel}</h2>
                <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: inst?.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', color: inst?.status === 'ACTIVE' ? '#15803d' : '#b91c1c' }}>{inst?.status}</span>
              </div>
              <div style={{ fontSize: 12, color: '#5f736f', marginTop: 2 }}>{inst?.name} • EMIS {inst?.emisCode} • {[inst?.localLevel, inst?.district, inst?.province].filter(Boolean).join(', ')}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#5f736f', background: '#f4faf8', padding: '6px 12px', borderRadius: 8, border: '1px solid #dcebe6' }}>
              <ShieldCheck size={13} color={C.amber} /> Registration counts only
            </div>
            <button onClick={load} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #cfdcd8', color: '#2f4f4c', padding: '8px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="sa-content" style={{ padding: 28, maxWidth: 1320, width: '100%', boxSizing: 'border-box' }}>
          <div style={{ fontSize: 12, color: C.grey, background: '#fff8e6', border: '1px solid #fde7a8', borderRadius: 10, padding: '8px 12px', marginBottom: 18, display: 'flex', gap: 8, alignItems: 'center' }}>
            <ShieldCheck size={15} color={C.amber} /> Privacy view: the platform sees only how many students and teachers are registered. Marks, attendance, names and personal details stay with the school.
          </div>

          {tab === 'OVERVIEW' && (
            <>
              {kpiRow}
              <div style={grid}>
                <Panel title="Students in each class" hint="Click a bar to focus it" empty={!gradeRows.length} emptyText="No students are enrolled in classes yet">{gradeBars(260)}{focusNote}</Panel>
                <Panel title="Students and teachers" hint="Registered accounts by type" empty={!peopleSplit.length}>{donut}</Panel>
                <Panel title="Registrations over the last 12 months" hint="New student and teacher accounts per month" empty={!hasRegistrations} emptyText="No registrations in the last 12 months">{regChart(260)}</Panel>
              </div>
            </>
          )}

          {tab === 'PEOPLE' && (
            <div style={grid}>
              <Panel title="Students in each class" hint="Click a bar to focus it" empty={!gradeRows.length} emptyText="No students are enrolled in classes yet">{gradeBars(300)}{focusNote}</Panel>
              <Panel title="Students and teachers" hint="Registered accounts by type" empty={!peopleSplit.length}>{donut}</Panel>
              <Panel title="School size">
                {statList([['Registered students', fmt(counts.students), C.teal], ['Registered teachers', fmt(counts.teachers), C.purple], ['Classes', fmt(counts.classes), C.blue], ['Sections', fmt(counts.sections), C.amber], ['Student : teacher', `${ratio} : 1`, C.red]])}
              </Panel>
              <Panel title="Sections per class" empty={!(data?.sectionsPerGrade || []).length}>{sectionsChart}</Panel>
              <Panel title="Class strength" hint="Students per class" empty={!gradeRows.length}>
                <div style={{ display: 'grid', gap: 8 }}>
                  {gradeRows.map((r: any) => {
                    const max = Math.max(...gradeRows.map((x: any) => x.students), 1);
                    return (
                      <div key={r.grade} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 40px', gap: 8, alignItems: 'center', fontSize: 12 }}>
                        <span style={{ fontWeight: 700 }}>{r.grade}</span>
                        <div style={{ height: 10, background: '#e6f2ee', borderRadius: 6, overflow: 'hidden' }}><div style={{ width: `${(r.students / max) * 100}%`, height: '100%', background: C.teal }} /></div>
                        <span style={{ textAlign: 'right', fontWeight: 800 }}>{r.students}</span>
                      </div>
                    );
                  })}
                </div>
              </Panel>
              <Panel title="Registrations over the last 12 months" hint="New student and teacher accounts per month" empty={!hasRegistrations} emptyText="No registrations in the last 12 months">{regChart(280)}</Panel>
            </div>
          )}

          {tab === 'ACCESS' && (
            <div style={{ display: 'grid', gap: 16 }}>
              {accessError && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700 }}>{accessError}</div>}
              {!access && !accessError && <div style={{ color: C.grey }}>Loading access settings…</div>}
              {access && (
                <>
                  <Panel title="Student dashboard for the whole school" hint="The master switch for this school. Only the Super Admin can change it.">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ minWidth: 240, flex: 1 }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: access.schoolEnabled ? '#15803d' : C.red }}>
                          {access.schoolEnabled ? 'ON: students can use their dashboard' : 'OFF: students cannot use their dashboard'}
                        </div>
                        <div style={{ fontSize: 13, color: C.grey, marginTop: 4, lineHeight: 1.5 }}>
                          When this is off, students cannot sign in to a dashboard, and assignments, quizzes, notes, study materials, videos and resource sharing are hidden for the students and for their teachers. Teachers keep all their other tools.
                          Switching the whole school resets any class choices below so every class follows this switch.
                        </div>
                      </div>
                      <Switch on={access.schoolEnabled} busy={accessBusy === 'SCHOOL'} onClick={() => setStudentAccess('SCHOOL', !access.schoolEnabled)} label="Student dashboard for the whole school" />
                    </div>
                  </Panel>

                  <Panel title="Student dashboard by class" hint="Turn the dashboard on or off for one class at a time" empty={!(access.classes || []).length} emptyText="This school has no classes yet">
                    <div style={{ display: 'grid', gap: 8 }}>
                      {(access.classes || []).map((c: any) => (
                        <div key={c.classId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, border: `1px solid ${C.line}`, borderRadius: 12, padding: '10px 14px', background: c.enabled ? '#fff' : '#fff7f7' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 800, color: C.dark }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: C.grey }}>
                              {fmt(c.students)} students
                              {c.customised && <span style={{ marginLeft: 8, color: C.amber, fontWeight: 800 }}>• set for this class</span>}
                              {c.lockedByPackage && <span style={{ marginLeft: 8, color: C.red, fontWeight: 800 }}>• not in the school's package</span>}
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 12, fontWeight: 800, color: c.enabled ? '#15803d' : C.red, minWidth: 28, textAlign: 'right' }}>{c.enabled ? 'On' : 'Off'}</span>
                            <Switch on={c.enabled} busy={accessBusy === 'CLASS' + c.classId} disabled={c.lockedByPackage} onClick={() => setStudentAccess('CLASS', !c.enabled, c.classId)} label={`Student dashboard for ${c.name}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                  <Panel title="Learning features by class" hint="Fine control for classes whose student dashboard is on. A feature switched off here also disappears from the teachers of that class." empty={!(matrix?.classes || []).length} emptyText="No class settings to show">
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 640 }}>
                        <thead>
                          <tr style={{ textAlign: 'center', color: C.grey, fontSize: 11, textTransform: 'uppercase' }}>
                            <th style={{ textAlign: 'left', padding: '8px 10px' }}>Class</th>
                            {FEATURE_COLUMNS.map(([k, label]) => <th key={k} style={{ padding: '8px 6px' }}>{label}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {(matrix?.classes || []).map((row: any) => {
                            const dash = (access.classes || []).find((c: any) => c.classId === row.classId);
                            const dashOff = dash ? !dash.enabled : false;
                            return (
                              <tr key={row.classId} style={{ borderTop: `1px solid ${C.line}` }}>
                                <td style={{ padding: '8px 10px', fontWeight: 800, color: C.dark }}>{row.className || row.name || (dash && dash.name)}</td>
                                {FEATURE_COLUMNS.map(([k]) => {
                                  const f = row.features?.[k];
                                  const on = !!f?.enabled && !dashOff;
                                  const locked = !f || !f.isEditable || dashOff;
                                  return (
                                    <td key={k} style={{ textAlign: 'center', padding: '6px' }}>
                                      <button
                                        type="button"
                                        disabled={locked || accessBusy === `F${row.classId}${k}`}
                                        title={dashOff ? 'Student dashboard is off for this class' : f?.source === 'SUBSCRIPTION_BLOCKED' ? 'Not in the school package' : undefined}
                                        onClick={() => toggleClassFeature(row.classId, k, !f.enabled)}
                                        style={{ minWidth: 48, padding: '4px 10px', borderRadius: 20, border: 'none', fontWeight: 800, fontSize: 12, cursor: locked ? 'not-allowed' : 'pointer', background: on ? '#dcfce7' : '#f1f5f4', color: on ? '#15803d' : C.grey, opacity: locked ? 0.55 : 1 }}
                                      >{on ? 'On' : 'Off'}</button>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Panel>
                </>
              )}
            </div>
          )}

          {tab === 'SUBSCRIPTION' && (
            <div style={grid}>
              <Panel title="Current package" hint="Package and licence period">
                {sub ? (
                  <div style={{ display: 'grid', gap: 10 }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: C.purple }}>{sub.packageName}</div>
                    <div style={{ fontSize: 13, color: C.grey }}>Status: <strong style={{ color: sub.status === 'ACTIVE' ? '#15803d' : C.red }}>{sub.status}</strong></div>
                    <div style={{ fontSize: 13, color: C.grey }}>{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '—'} → {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '—'}</div>
                    {sub.daysLeft != null && (
                      <div style={{ padding: '10px 12px', borderRadius: 10, background: sub.daysLeft < 30 ? '#fee2e2' : '#e6f7f0', color: sub.daysLeft < 30 ? '#b91c1c' : C.teal, fontWeight: 800 }}>
                        {sub.daysLeft >= 0 ? `${sub.daysLeft} days left` : `Expired ${Math.abs(sub.daysLeft)} days ago`}
                      </div>
                    )}
                  </div>
                ) : <div style={{ color: C.grey }}>No subscription found</div>}
              </Panel>
              <Panel title="Licence use" hint="How much of the package this school is using" empty={!sub?.limits}>
                {sub?.limits && [
                  ['Students', counts.students || 0, sub.limits.maxStudents, C.teal],
                  ['Teachers', counts.teachers || 0, sub.limits.maxTeachers, C.purple],
                ].map(([label, used, max, color]: any) => {
                  const pct = max ? Math.min(100, Math.round((used / max) * 100)) : 0;
                  return (
                    <div key={label} style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: C.dark }}><span>{label}</span><span>{fmt(used)} of {max ? fmt(max) : 'unlimited'}{max ? ` (${pct}%)` : ''}</span></div>
                      <div style={{ height: 12, background: '#e6f2ee', borderRadius: 8, marginTop: 6, overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: pct > 90 ? C.red : color }} /></div>
                    </div>
                  );
                })}
              </Panel>
            </div>
          )}

          {tab === 'PROFILE' && (
            <div style={grid}>
              <Panel title="School leadership" hint="The only people shown by name">
                {(data?.leadership || []).length === 0 && <div style={{ color: C.grey, fontSize: 13 }}>No principal or administrator assigned</div>}
                {(data?.leadership || []).map((p: any) => (
                  <div key={p.username} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, marginBottom: 8 }}>
                    <div style={{ fontWeight: 900, color: C.dark }}>{p.fullName}</div>
                    <div style={{ fontSize: 12, color: C.grey }}>{p.role === 'PRINCIPAL' ? 'Principal' : 'School Administrator'} • {p.username}{p.email ? ` • ${p.email}` : ''}</div>
                  </div>
                ))}
              </Panel>
              <div style={{ gridColumn: '1 / -1' }}>
                <Panel
                  title="School information"
                  right={!editing ? <button onClick={() => setEditing(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: `1px solid ${C.line}`, background: '#fff', color: C.teal, fontWeight: 800, cursor: 'pointer' }}><Pencil size={14} /> Edit</button> : undefined}
                >
                  {!editing ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12, fontSize: 13 }}>
                      {[['Name', inst?.name], ['Name (Nepali)', inst?.nameNepali], ['Type', inst?.type], ['Status', inst?.status], ['Province', inst?.province], ['District', inst?.district], ['Local level', inst?.localLevel], ['Ward', inst?.ward], ['Email', inst?.email], ['Phone', inst?.phone], ['Website', inst?.website]].map(([l, v]: any) => (
                        <div key={l}><div style={{ color: C.grey, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>{l}</div><div style={{ color: C.dark, fontWeight: 700 }}>{v || '—'}</div></div>
                      ))}
                    </div>
                  ) : (
                    <form onSubmit={save}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
                        {[['name', 'Name'], ['nameNepali', 'Name (Nepali)'], ['province', 'Province'], ['district', 'District'], ['localLevel', 'Local level'], ['ward', 'Ward'], ['email', 'Email'], ['phone', 'Phone'], ['website', 'Website']].map(([k, l]) => (
                          <label key={k} style={{ fontSize: 12, fontWeight: 800, color: C.grey }}>{l}
                            <input value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.line}`, fontSize: 13, boxSizing: 'border-box' }} />
                          </label>
                        ))}
                        <label style={{ fontSize: 12, fontWeight: 800, color: C.grey }}>Type
                          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.line}`, fontSize: 13 }}>
                            {['COMMUNITY', 'INSTITUTIONAL', 'RELIGIOUS', 'TECHNICAL', 'COLLEGE'].map((x) => <option key={x}>{x}</option>)}
                          </select>
                        </label>
                        <label style={{ fontSize: 12, fontWeight: 800, color: C.grey }}>Status
                          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={{ display: 'block', width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 8, border: `1px solid ${C.line}`, fontSize: 13 }}>
                            {['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE'].map((x) => <option key={x}>{x}</option>)}
                          </select>
                        </label>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                        <button type="submit" disabled={saving} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', background: C.teal, color: '#fff', fontWeight: 800, cursor: 'pointer' }}>{saving ? 'Saving…' : 'Save changes'}</button>
                        <button type="button" onClick={() => setEditing(false)} style={{ padding: '9px 18px', borderRadius: 10, border: `1px solid ${C.line}`, background: '#fff', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </form>
                  )}
                </Panel>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
