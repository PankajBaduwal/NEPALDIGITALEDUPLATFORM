import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Props = {
  attendance: any;
  results: any;
};

const card: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #dcebe6',
  borderRadius: '16px',
  padding: '20px 22px',
  boxShadow: '0 1px 3px rgba(14, 62, 59, 0.04)',
};

const scoreColor = (p: number) => (p >= 80 ? '#6d4fd6' : p >= 60 ? '#a08be6' : p >= 40 ? '#f1b434' : '#e5533d');

/** Two at-a-glance charts for the student overview: attendance split and published results by subject. */
export const StudentSnapshot: React.FC<Props> = ({ attendance, results }) => {
  const present = attendance?.presentDays ?? 0;
  const absent = attendance?.absentDays ?? 0;
  const attendanceData = [
    { name: 'Present', value: present, color: '#6d4fd6' },
    { name: 'Absent / leave', value: absent, color: '#e5533d' },
  ].filter((d) => d.value > 0);

  const rows: any[] = Array.isArray(results?.results) ? results.results : [];
  // average per subject of published results, as a percentage of the marks available
  const bySubject = new Map<string, { sum: number; n: number }>();
  rows.forEach((r) => {
    if (r.marksObtained === null || r.marksObtained === undefined || !r.totalMarks) return;
    const key = r.subjectName || 'Subject';
    const cur = bySubject.get(key) || { sum: 0, n: 0 };
    cur.sum += (Number(r.marksObtained) / Number(r.totalMarks)) * 100;
    cur.n += 1;
    bySubject.set(key, cur);
  });
  const subjectData = [...bySubject.entries()].map(([name, v]) => ({ name: name.replace(/^Compulsory\s+/i, ''), score: Math.round(v.sum / v.n) }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) minmax(320px, 2fr)', gap: '20px' }}>
      <div style={card}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0e3e3b' }}>Attendance snapshot</h3>
        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#5f736f' }}>Days present against days missed</p>
        {attendanceData.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', fontSize: '13px', color: '#8da19d' }}>No attendance recorded yet.</div>
        ) : (
          <div style={{ position: 'relative', height: '190px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attendanceData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={80} paddingAngle={3} stroke="none" animationDuration={900}>
                  {attendanceData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span data-no-count style={{ fontSize: '24px', fontWeight: 800, color: '#0e3e3b' }}>{attendance?.attendanceRate ?? '—'}</span>
              <span style={{ fontSize: '11px', color: '#5f736f' }}>present</span>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px', color: '#4b605b' }}>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#6d4fd6', marginRight: 6 }} />{present} present</span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#e5533d', marginRight: 6 }} />{absent} missed</span>
        </div>
      </div>

      <div style={card}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0e3e3b' }}>Results by subject</h3>
        <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#5f736f' }}>Average of your published results, as a percentage</p>
        {subjectData.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', fontSize: '13px', color: '#8da19d' }}>Results will appear here once your teachers publish them.</div>
        ) : (
          <div style={{ height: '230px', marginTop: '8px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => [`${v}%`, 'Average']} cursor={{ fill: 'rgba(31,181,137,0.06)' }} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]} animationDuration={900}>
                  {subjectData.map((d) => (
                    <Cell key={d.name} fill={scoreColor(d.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
