import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';

type Props = {
  /** Classes with their sections, as loaded by the School Admin dashboard. */
  classes: any[];
  /** Examinations of the institution. */
  examinations: any[];
  /** Called after an assessment changes state so the dashboard can refresh its own numbers. */
  onChanged?: () => void;
};

const STATUS_STYLE: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-700',
  SUBMITTED: 'bg-blue-100 text-blue-800',
  REVIEWED: 'bg-amber-100 text-amber-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  PUBLISHED: 'bg-teal-100 text-teal-800',
};

const idOf = (x: any) => String(x?.id || x?._id || x || '');

export const ExamOperationsPanel: React.FC<Props> = ({ classes, examinations, onChanged }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'REVIEWED' | 'ALL' | 'SUBMITTED' | 'APPROVED' | 'PUBLISHED' | 'DRAFT'>('REVIEWED');
  const [busy, setBusy] = useState<string | null>(null);

  const [exportSection, setExportSection] = useState('');
  const [exportExam, setExportExam] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>('/assessment/items');
      setItems(Array.isArray(res) ? res : res?.items || []);
    } catch (e: any) {
      setError(e.message || 'Could not load assessments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sections = useMemo(() => {
    const out: Array<{ id: string; label: string }> = [];
    (classes || []).forEach((c: any) =>
      (c.sections || []).forEach((s: any) =>
        out.push({
          id: idOf(s),
          label: `${c.name || (c.gradeNumber ? `Class ${c.gradeNumber}` : 'Class')} · ${/^section/i.test(s.name || '') ? s.name : `Section ${s.name}`}`,
        })
      )
    );
    return out;
  }, [classes]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { DRAFT: 0, SUBMITTED: 0, REVIEWED: 0, APPROVED: 0, PUBLISHED: 0 };
    items.forEach((i) => {
      c[i.workflowStatus] = (c[i.workflowStatus] || 0) + 1;
    });
    return c;
  }, [items]);

  const visible = items.filter((i) => filter === 'ALL' || i.workflowStatus === filter);

  const approve = async (item: any) => {
    setBusy(idOf(item));
    try {
      await api.patch(`/assessment/items/${idOf(item)}/workflow`, {
        targetStatus: 'APPROVED',
        reason: 'Approved by school administration',
      });
      await load();
      onChanged?.();
    } catch (e: any) {
      alert(e.message || 'Could not approve this assessment');
    } finally {
      setBusy(null);
    }
  };

  const approveAll = async () => {
    const reviewed = items.filter((i) => i.workflowStatus === 'REVIEWED');
    if (reviewed.length === 0) return;
    if (!window.confirm(`Approve all ${reviewed.length} reviewed assessments?`)) return;
    setBusy('ALL');
    let failed = 0;
    for (const item of reviewed) {
      try {
        await api.patch(`/assessment/items/${idOf(item)}/workflow`, { targetStatus: 'APPROVED', reason: 'Approved by school administration' });
      } catch {
        failed++;
      }
    }
    await load();
    onChanged?.();
    setBusy(null);
    if (failed) alert(`${failed} assessment(s) could not be approved.`);
  };

  const download = async (kind: 'RESULTS' | 'ATTENDANCE') => {
    if (!exportSection) {
      alert('Choose a class section first.');
      return;
    }
    try {
      if (kind === 'RESULTS') {
        if (!exportExam) {
          alert('Choose an examination for the results export.');
          return;
        }
        await api.downloadBlob(`/analytics/export/results-csv/${exportSection}/${exportExam}`, 'section_results.csv');
      } else {
        await api.downloadBlob(`/analytics/export/attendance-csv/${exportSection}`, 'section_attendance.csv');
      }
    } catch (e: any) {
      alert(e.message || 'Export failed');
    }
  };

  const th = 'p-3 text-left text-[11px] font-bold uppercase text-slate-500';
  return (
    <div className="space-y-5 mb-7">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Marks approval</h3>
            <p className="text-xs text-slate-500">
              Teachers submit marks, class teachers review them, then you approve them. Only approved marks can be published to students.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white">
              <option value="REVIEWED">Awaiting approval ({counts.REVIEWED})</option>
              <option value="SUBMITTED">Submitted ({counts.SUBMITTED})</option>
              <option value="APPROVED">Approved ({counts.APPROVED})</option>
              <option value="PUBLISHED">Published ({counts.PUBLISHED})</option>
              <option value="DRAFT">Draft ({counts.DRAFT})</option>
              <option value="ALL">All ({items.length})</option>
            </select>
            <button
              onClick={approveAll}
              disabled={counts.REVIEWED === 0 || busy !== null}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold disabled:opacity-50"
            >
              Approve all reviewed
            </button>
          </div>
        </div>

        {error && <div className="p-3 text-xs text-rose-700 bg-rose-50">{error} <button className="underline font-bold" onClick={load}>Retry</button></div>}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className={th}>Examination</th>
                <th className={th}>Section</th>
                <th className={th}>Subject</th>
                <th className={th}>Total marks</th>
                <th className={th}>Status</th>
                <th className={`${th} text-right`}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td className="p-4 text-slate-500" colSpan={6}>Loading…</td></tr>}
              {!loading && visible.length === 0 && (
                <tr><td className="p-4 text-slate-500" colSpan={6}>{filter === 'REVIEWED' ? 'Nothing is waiting for approval.' : 'No assessments in this state.'}</td></tr>
              )}
              {visible.map((i) => (
                <tr key={idOf(i)}>
                  <td className="p-3 font-semibold text-slate-800">{i.examinationId?.name || i.name}</td>
                  <td className="p-3">{i.sectionId?.name || '—'}</td>
                  <td className="p-3">{i.centralSubjectId?.name || '—'}</td>
                  <td className="p-3">{i.totalMarks ?? '—'}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${STATUS_STYLE[i.workflowStatus] || ''}`}>{i.workflowStatus}</span></td>
                  <td className="p-3 text-right">
                    {i.workflowStatus === 'REVIEWED' && (
                      <button
                        onClick={() => approve(i)}
                        disabled={busy !== null}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold disabled:opacity-50"
                      >
                        {busy === idOf(i) ? 'Approving…' : 'Approve'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <h3 className="font-bold text-sm text-slate-900 mb-1">Export to CSV</h3>
        <p className="text-xs text-slate-500 mb-3">Download a section's examination results or attendance register as a spreadsheet.</p>
        <div className="flex flex-wrap items-center gap-2">
          <select value={exportSection} onChange={(e) => setExportSection(e.target.value)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white">
            <option value="">Choose class section…</option>
            {sections.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <select value={exportExam} onChange={(e) => setExportExam(e.target.value)} className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white">
            <option value="">Choose examination…</option>
            {(examinations || []).map((e: any) => <option key={idOf(e)} value={idOf(e)}>{e.name}</option>)}
          </select>
          <button onClick={() => download('RESULTS')} className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold">Results CSV</button>
          <button onClick={() => download('ATTENDANCE')} className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold">Attendance CSV</button>
        </div>
      </div>
    </div>
  );
};
