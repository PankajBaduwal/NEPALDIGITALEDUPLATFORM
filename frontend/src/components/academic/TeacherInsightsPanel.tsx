import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../../services/api';

export type InsightScope = {
  key: string;
  sectionId: string;
  subjectId?: string;
  label: string;
};

type Props = {
  /** What to emphasise: overview cards + matrix, the at-risk list, or the full roster. */
  view: 'INSIGHTS' | 'MONITORING' | 'PROGRESS';
  scopes: InsightScope[];
  /** Hide the scope picker (used inside a single subject workspace). */
  fixedScope?: boolean;
};

type Student = {
  studentId: string;
  rollNumber: number;
  fullName: string;
  username?: string;
  guardianName: string | null;
  guardianPhone: string | null;
  attendance: number | null;
  avgPercent: number | null;
  gpa: number | null;
  assignmentRate: number | null;
  quizAvg: number | null;
  status: 'ON_TRACK' | 'EXCELLENT' | 'NEEDS_SUPPORT' | 'FLAGGED';
  flagReason: string;
};

const pct = (v: number | null) => (v === null || v === undefined ? '—' : `${v}%`);

const statusStyle: Record<string, string> = {
  FLAGGED: 'bg-rose-50 text-rose-700 border-rose-200',
  NEEDS_SUPPORT: 'bg-amber-50 text-amber-800 border-amber-200',
  EXCELLENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ON_TRACK: 'bg-slate-50 text-slate-600 border-slate-200',
};
const statusLabel: Record<string, string> = {
  FLAGGED: 'At risk',
  NEEDS_SUPPORT: 'Needs support',
  EXCELLENT: 'Excellent',
  ON_TRACK: 'On track',
};

export const TeacherInsightsPanel: React.FC<Props> = ({ view, scopes, fixedScope }) => {
  const [scopeKey, setScopeKey] = useState<string>(scopes[0]?.key || '');
  const [data, setData] = useState<any>(null);
  const [remarks, setRemarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(view === 'MONITORING' ? 'ATTENTION' : 'ALL');

  const [remarkFor, setRemarkFor] = useState<Student | null>(null);
  const [remarkText, setRemarkText] = useState('');
  const [remarkKind, setRemarkKind] = useState<'REMARK' | 'INTERVENTION'>('REMARK');
  const [remarkNotify, setRemarkNotify] = useState(false);
  const [saving, setSaving] = useState(false);

  // Keep the selected scope valid if the list of scopes changes
  useEffect(() => {
    if (!scopes.some((s) => s.key === scopeKey)) setScopeKey(scopes[0]?.key || '');
  }, [scopes, scopeKey]);

  const scope = useMemo(() => scopes.find((s) => s.key === scopeKey), [scopes, scopeKey]);

  const load = useCallback(async () => {
    if (!scope) return;
    setLoading(true);
    setError(null);
    try {
      const q = scope.subjectId ? `?centralSubjectId=${scope.subjectId}` : '';
      const [insights, remarkList] = await Promise.all([
        api.get<any>(`/teacher/insights/${scope.sectionId}${q}`),
        api.get<any[]>(`/teacher/remarks/${scope.sectionId}`).catch(() => []),
      ]);
      setData(insights);
      setRemarks(Array.isArray(remarkList) ? remarkList : []);
    } catch (err: any) {
      setData(null);
      setError(err.message || 'Could not load student insights');
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    load();
  }, [load]);

  const students: Student[] = data?.students || [];
  const statusData = [
    { name: 'Excellent', value: students.filter((x) => x.status === 'EXCELLENT').length, color: '#6d4fd6' },
    { name: 'On track', value: students.filter((x) => x.status === 'ON_TRACK').length, color: '#a08be6' },
    { name: 'Needs support', value: students.filter((x) => x.status === 'NEEDS_SUPPORT').length, color: '#f1b434' },
    { name: 'At risk', value: students.filter((x) => x.status === 'FLAGGED').length, color: '#e5533d' },
  ].filter((d) => d.value > 0);
  const scoreBands = [
    { band: 'Below 40', min: 0, max: 40, color: '#e5533d' },
    { band: '40–59', min: 40, max: 60, color: '#f1b434' },
    { band: '60–79', min: 60, max: 80, color: '#a08be6' },
    { band: '80–100', min: 80, max: 101, color: '#6d4fd6' },
  ].map((b) => ({ ...b, count: students.filter((x) => x.avgPercent !== null && x.avgPercent >= b.min && x.avgPercent < b.max).length }));
  const visible = students.filter((s) => {
    if (search && !`${s.fullName} ${s.rollNumber}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ATTENTION') return s.status === 'FLAGGED' || s.status === 'NEEDS_SUPPORT';
    return s.status === statusFilter;
  });

  const openRemark = (s: Student, kind: 'REMARK' | 'INTERVENTION' = 'REMARK', notify = false) => {
    setRemarkFor(s);
    setRemarkKind(kind);
    setRemarkNotify(notify);
    setRemarkText(kind === 'INTERVENTION' && s.flagReason ? `Support plan — ${s.flagReason}. ` : '');
  };

  const saveRemark = async () => {
    if (!remarkFor || !scope) return;
    if (!remarkText.trim()) {
      alert('Please write the remark first.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/teacher/remarks', {
        studentId: remarkFor.studentId,
        sectionId: scope.sectionId,
        centralSubjectId: scope.subjectId,
        kind: remarkKind,
        text: remarkText,
        notifyStudent: remarkNotify,
      });
      setRemarkFor(null);
      await load();
    } catch (err: any) {
      alert(err.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const summary = data?.summary;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            {view === 'INSIGHTS' ? 'Class Insights' : view === 'MONITORING' ? 'Academic Monitoring & Early Intervention' : 'Student Progress Roster'}
          </h3>
          <p className="text-xs text-slate-500">Calculated from recorded attendance (90 days), published marks, assignments and quizzes.</p>
        </div>
        {!fixedScope && scopes.length > 1 && (
          <select
            value={scopeKey}
            onChange={(e) => setScopeKey(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold bg-white"
          >
            {scopes.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        )}
      </div>

      {!scope && <div className="text-sm text-slate-500">No class or subject is assigned to you yet.</div>}
      {loading && <div className="text-sm text-slate-500">Loading…</div>}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={load} className="font-bold underline">Retry</button>
        </div>
      )}

      {data && summary && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              ['Students', String(summary.studentCount), 'text-slate-900'],
              ['Average GPA', summary.avgGpa ?? '—', 'text-emerald-700'],
              ['Average attendance', pct(summary.avgAttendance), 'text-blue-700'],
              ['Average score', pct(summary.avgScore), 'text-violet-700'],
              ['At risk / needs support', `${summary.flaggedCount} / ${summary.needsSupportCount}`, 'text-rose-700'],
            ].map(([label, value, color]) => (
              <div key={String(label)} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="text-[11px] font-bold text-slate-500">{label}</div>
                <div className={`text-2xl font-black mt-1 ${color}`}>{value as any}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="font-bold text-sm text-slate-900">Class standing</div>
              <div className="text-xs text-slate-500 mb-1">How the {students.length} students are doing overall</div>
              <div style={{ height: 190 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={46} outerRadius={72} paddingAngle={3} stroke="none" animationDuration={900}>
                      {statusData.map((d) => <Cell key={d.name} fill={d.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-slate-600">
                {statusData.map((d) => (
                  <span key={d.name}><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: d.color, marginRight: 6 }} />{d.name} ({d.value})</span>
                ))}
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="font-bold text-sm text-slate-900">Score distribution</div>
              <div className="text-xs text-slate-500 mb-1">Number of students in each average-score band</div>
              <div style={{ height: 222 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreBands} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="band" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                    <Tooltip cursor={{ fill: 'rgba(31,181,137,0.06)' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={900}>
                      {scoreBands.map((b) => <Cell key={b.band} fill={b.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {data.scope === 'ALL_SUBJECTS' && view !== 'PROGRESS' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 font-bold text-sm">Subject-wise performance (all subjects of this class)</div>
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600">
                  <tr><th className="p-3">Subject</th><th className="p-3">Average score</th><th className="p-3">Pass rate</th><th className="p-3">Marks recorded</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.subjectMatrix.length === 0 && <tr><td className="p-4 text-slate-500" colSpan={4}>No published marks yet.</td></tr>}
                  {data.subjectMatrix.map((m: any) => (
                    <tr key={m.subjectId}>
                      <td className="p-3 font-semibold">{m.subject}</td>
                      <td className="p-3">{pct(m.average)}</td>
                      <td className="p-3">{pct(m.passRate)}</td>
                      <td className="p-3">{m.entries}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="font-bold text-sm">
                {view === 'MONITORING' ? 'Students needing attention' : 'Student roster'}
                <span className="ml-2 text-xs font-normal text-slate-500">{visible.length} shown</span>
              </div>
              <div className="flex gap-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or roll"
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs">
                  <option value="ALL">All students</option>
                  <option value="ATTENTION">Needs attention</option>
                  <option value="FLAGGED">At risk</option>
                  <option value="NEEDS_SUPPORT">Needs support</option>
                  <option value="ON_TRACK">On track</option>
                  <option value="EXCELLENT">Excellent</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3">Roll</th><th className="p-3">Student</th><th className="p-3">Attendance</th>
                    <th className="p-3">Avg score</th><th className="p-3">GPA</th><th className="p-3">Assignments</th>
                    <th className="p-3">Quiz avg</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visible.length === 0 && <tr><td className="p-4 text-slate-500" colSpan={9}>No students match.</td></tr>}
                  {visible.map((s) => (
                    <tr key={s.studentId} className="hover:bg-slate-50/60 align-top">
                      <td className="p-3 font-bold text-blue-700">#{s.rollNumber}</td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{s.fullName}</div>
                        {s.flagReason && <div className="text-[11px] text-rose-700 mt-0.5">{s.flagReason}</div>}
                        {s.guardianPhone && <div className="text-[11px] text-slate-500">Guardian: {s.guardianName || '—'} · {s.guardianPhone}</div>}
                      </td>
                      <td className={`p-3 font-semibold ${s.attendance !== null && s.attendance < 75 ? 'text-rose-600' : ''}`}>{pct(s.attendance)}</td>
                      <td className="p-3">{pct(s.avgPercent)}</td>
                      <td className="p-3">{s.gpa ?? '—'}</td>
                      <td className="p-3">{pct(s.assignmentRate)}</td>
                      <td className="p-3">{pct(s.quizAvg)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${statusStyle[s.status]}`}>{statusLabel[s.status]}</span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button onClick={() => openRemark(s, 'REMARK')} className="px-2 py-1 border border-slate-300 rounded text-[11px] font-bold mr-1">Remark</button>
                        {(s.status === 'FLAGGED' || s.status === 'NEEDS_SUPPORT') && (
                          <button onClick={() => openRemark(s, 'INTERVENTION', true)} className="px-2 py-1 bg-amber-500 text-white rounded text-[11px] font-bold">
                            Notify student
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {view !== 'INSIGHTS' && (
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-4 py-3 border-b border-slate-100 font-bold text-sm">Remarks & intervention log</div>
              <div className="divide-y divide-slate-100">
                {remarks.length === 0 && <div className="p-4 text-xs text-slate-500">Nothing recorded yet.</div>}
                {remarks.slice(0, 20).map((r) => (
                  <div key={r.id} className="p-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.kind === 'INTERVENTION' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                        {r.kind === 'INTERVENTION' ? 'Intervention' : 'Remark'}
                      </span>
                      <span className="font-semibold text-slate-800">{r.studentId?.fullName || 'Student'}</span>
                      <span className="text-slate-400 ml-auto">{new Date(r.createdAt).toLocaleDateString()} · {r.teacherId?.fullName || ''}</span>
                    </div>
                    <div className="mt-1 text-slate-600 whitespace-pre-wrap">{r.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {remarkFor && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-slate-900">{remarkKind === 'INTERVENTION' ? 'Support note' : 'Remark'} — {remarkFor.fullName}</h4>
                <p className="text-[11px] text-slate-500">Saved to the student's record for the school.</p>
              </div>
              <button onClick={() => setRemarkFor(null)} className="text-sm font-bold text-slate-500">Close</button>
            </div>
            <div className="flex gap-2 text-xs">
              {(['REMARK', 'INTERVENTION'] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setRemarkKind(k)}
                  className={`px-3 py-1 rounded-lg border font-bold ${remarkKind === k ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 text-slate-600'}`}
                >
                  {k === 'REMARK' ? 'Remark' : 'Intervention'}
                </button>
              ))}
            </div>
            <textarea
              rows={5}
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              maxLength={2000}
              className="w-full border border-slate-300 rounded-lg p-2 text-sm"
              placeholder="Observation, feedback or the support plan agreed…"
            />
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input type="checkbox" checked={remarkNotify} onChange={(e) => setRemarkNotify(e.target.checked)} />
              Also send this to the student as a notification
            </label>
            {remarkFor.guardianPhone && (
              <div className="text-[11px] text-slate-500">Guardian contact on file: {remarkFor.guardianName || '—'} · {remarkFor.guardianPhone} (call or message them yourself; the platform does not send SMS).</div>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setRemarkFor(null)} className="px-3 py-1.5 text-sm font-bold text-slate-600">Cancel</button>
              <button onClick={saveRemark} disabled={saving} className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-bold disabled:opacity-60">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
