import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';
import { subscribe } from '../../services/realtime';
import { Card, Notice, Table, colors, dayLabel, mediumLabel, td } from './ui';

export interface ClassTimetableProps {
  sectionId: string;
  onOpenTextbook?: (textbook: any) => void;
}

/** Published timetable of one section (students, class teachers). Updates live when a new version is published. */
export const ClassTimetable: React.FC<ClassTimetableProps> = ({ sectionId, onOpenTextbook }) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    api.get(`/timetable/student/${sectionId}`).then(setData).catch((e) => setError(e.message));
  }, [sectionId]);

  useEffect(() => {
    load();
    return subscribe(['timetable:section:updated'], (p) => p?.sectionId === sectionId && load(), { sectionId });
  }, [load, sectionId]);

  if (error) return <Notice tone="danger">{error}</Notice>;
  if (!data) return <p style={{ color: colors.muted, fontSize: 13 }}>Loading timetable…</p>;

  const at = (day: string, n: number) => data.weeklyEntries.find((e: any) => e.dayOfWeek === day && e.periodNumber === n);

  return (
    <div>
      {data.message && <Notice tone="warn">{data.message}</Notice>}
      <Card title="Today's classes">
        {data.todayClasses.length === 0 ? (
          <p style={{ color: colors.muted, fontSize: 13, margin: 0 }}>{data.workingDays.includes(data.currentDay) ? 'No classes scheduled today.' : `${dayLabel(data.currentDay)} is a school holiday.`}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {data.todayClasses.map((c: any) => (
              <div key={c.id} style={{ background: colors.soft, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#7c3aed' }}>
                  {c.startTime}–{c.endTime} · Period {c.periodNumber}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4 }}>{c.subjectName}</div>
                <div style={{ fontSize: 12, color: colors.muted }}>{c.teacherName}</div>
                <div style={{ fontSize: 11, color: '#0369a1', marginTop: 4 }}>{c.roomNumber}</div>
                {(c.textbookId || c.textbook) && onOpenTextbook && (
                  <button
                    onClick={() =>
                      onOpenTextbook(
                        c.textbook || {
                          id: c.textbookId,
                          _id: c.textbookId,
                          title: `${c.subjectName} — Class ${data.section?.gradeNumber || ''}`,
                          gradeNumber: data.section?.gradeNumber,
                          medium: data.section?.medium || 'ENGLISH',
                        }
                      )
                    }
                    style={{
                      marginTop: 8,
                      padding: '5px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                      background: '#117a6b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>📖 Read CDC Book PDF</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card title={`Weekly timetable${data.section ? ` · ${mediumLabel(data.section.medium)} medium` : ''}${data.timetable ? ` · version ${data.timetable.version}` : ''}`}>
        {data.periods.length === 0 ? (
          <p style={{ color: colors.muted, fontSize: 13, margin: 0 }}>The school has not configured its periods yet.</p>
        ) : (
          <Table head={['Period', ...data.workingDays.map(dayLabel)]}>
            {data.periods.map((p: any) => (
              <tr key={p.periodNumber} style={{ background: p.isBreak ? colors.soft : undefined }}>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  <strong>{p.name}</strong>
                  <div style={{ fontSize: 11, color: colors.muted }}>
                    {p.startTime}–{p.endTime}
                  </div>
                </td>
                {data.workingDays.map((d: string) => {
                  if (p.isBreak) return <td key={d} style={{ ...td, color: colors.muted, fontSize: 12 }}>{p.name}</td>;
                  const e = at(d, p.periodNumber);
                  return (
                    <td key={d} style={{ ...td, background: d === data.currentDay && e ? '#f5f3ff' : undefined }}>
                      {e ? (
                        <>
                          <div style={{ fontWeight: 700, fontSize: 12 }}>{e.subjectName}</div>
                          <div style={{ fontSize: 11, color: colors.muted }}>{e.teacherName}</div>
                          {e.roomNumber && <div style={{ fontSize: 10, color: '#5f736f' }}>{e.roomNumber}</div>}
                          {(e.textbookId || e.textbook) && onOpenTextbook && (
                            <button
                              onClick={() =>
                                onOpenTextbook(
                                  e.textbook || {
                                    id: e.textbookId,
                                    _id: e.textbookId,
                                    title: `${e.subjectName} — Class ${data.section?.gradeNumber || ''}`,
                                    gradeNumber: data.section?.gradeNumber,
                                    medium: data.section?.medium || 'ENGLISH',
                                  }
                                )
                              }
                              style={{
                                marginTop: 4,
                                padding: '2px 6px',
                                fontSize: 10,
                                fontWeight: 700,
                                background: '#e6f7f0',
                                color: '#117a6b',
                                border: '1px solid #bfeede',
                                borderRadius: 4,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                              }}
                            >
                              📖 Read Book
                            </button>
                          )}
                        </>
                      ) : (
                        <span style={{ fontSize: 11, color: '#cfdcd8' }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
};
