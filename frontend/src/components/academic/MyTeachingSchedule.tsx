import React, { useCallback, useEffect, useState } from 'react';
import { api } from '../../services/api';
import { subscribe } from '../../services/realtime';
import { Badge, Button, Card, Notice, Table, classLabel, colors, dayLabel, mediumLabel, td } from './ui';

interface Props {
  /** Opens the subject workspace (textbook, students) for a class the teacher teaches. */
  onOpenSubject?: (sectionId: string, subjectId: string) => void;
  /** Starts the Smart Board for a scheduled period. */
  onLaunchSmartBoard?: (entry: any) => void;
  /** Which section of the schedule to show: today's classes, the weekly grid, or the teaching workload. */
  view?: 'today' | 'week' | 'workload';
}

/** Teacher dashboard view of the published timetable: today, current and next period, the week, and classes. */
export const MyTeachingSchedule: React.FC<Props> = ({ onOpenSubject, onLaunchSmartBoard, view = 'today' }) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedNote, setUpdatedNote] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api.get('/timetable/teacher'));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, 60_000); // keeps current/next period accurate
    const off = subscribe(['timetable:teacher:updated', 'timetable:updated'], (p) => {
      if (p?.action === 'PUBLISHED' || p?.action === 'ARCHIVED' || p?.action === 'CONFIG') {
        setUpdatedNote('Your timetable was just updated.');
        load();
      }
    });
    return () => {
      window.clearInterval(timer);
      off();
    };
  }, [load]);

  if (error) return <Notice tone="danger">{error}</Notice>;
  if (!data) return <p style={{ color: colors.muted, fontSize: 13 }}>Loading your schedule…</p>;

  const periods: any[] = data.periods || [];
  const at = (day: string, n: number) => data.weeklyEntries.find((e: any) => e.dayOfWeek === day && e.periodNumber === n);
  const perDay: { day: string; count: number }[] = (data.workingDays || []).map((d: string) => ({
    day: d,
    count: (data.weeklyEntries || []).filter((e: any) => e.dayOfWeek === d).length,
  }));
  const maxPerDay = Math.max(1, ...perDay.map((x) => x.count));
  const describe = (e: any) => `${classLabel(e)} ${e.sectionName} · ${e.subjectName}`;

  return (
    <div>
      {updatedNote && <Notice tone="brand">{updatedNote}</Notice>}
      {data.message && <Notice tone="warn">{data.message}</Notice>}

      {view !== 'week' && (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <Card style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 12, color: colors.muted, fontWeight: 700 }}>Today</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{dayLabel(data.currentDay)}</div>
          <div style={{ fontSize: 12, color: data.isWorkingDay ? colors.brand : colors.warn, marginTop: 4, fontWeight: 600 }}>
            {data.isWorkingDay ? `${data.todayClasses.length} class(es) today` : 'School holiday'}
          </div>
        </Card>
        <Card style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 12, color: colors.muted, fontWeight: 700 }}>Now</div>
          {data.currentPeriod ? (
            <>
              <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4, color: colors.brand }}>{describe(data.currentPeriod)}</div>
              <div style={{ fontSize: 12, color: colors.muted }}>
                {data.currentPeriod.startTime}–{data.currentPeriod.endTime} · {data.currentPeriod.roomNumber}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4, color: colors.muted }}>{data.currentBreak ? data.currentBreak.name : 'No class right now'}</div>
          )}
        </Card>
        <Card style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 12, color: colors.muted, fontWeight: 700 }}>Next</div>
          {data.nextPeriod ? (
            <>
              <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>{describe(data.nextPeriod)}</div>
              <div style={{ fontSize: 12, color: colors.muted }}>
                {data.nextPeriod.startTime}–{data.nextPeriod.endTime} · {data.nextPeriod.roomNumber}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4, color: colors.muted }}>Nothing more today</div>
          )}
        </Card>
        <Card style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 12, color: colors.muted, fontWeight: 700 }}>This week</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>{data.totalWeeklyPeriods} periods</div>
          <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>{data.workingDays.map(dayLabel).join(', ') || '—'}</div>
        </Card>
      </div>
      )}

      {view === 'today' && (
      <Card title="Today's classes">
        {data.todayClasses.length === 0 ? (
          <p style={{ color: colors.muted, fontSize: 13, margin: 0 }}>{data.isWorkingDay ? 'No classes scheduled for you today.' : 'No teaching today.'}</p>
        ) : (
          <Table head={['Time', 'Class', 'Subject', 'Medium', 'Room', '']}>
            {data.todayClasses.map((c: any) => {
              const isNow = data.currentPeriod?.id === c.id;
              return (
                <tr key={c.id} style={{ background: isNow ? colors.brandSoft : undefined }}>
                  <td style={td}>
                    <strong>{c.startTime}–{c.endTime}</strong>
                    <div style={{ fontSize: 11, color: colors.muted }}>Period {c.periodNumber}</div>
                  </td>
                  <td style={td}>
                    {classLabel(c)} {c.sectionName}
                  </td>
                  <td style={td}>
                    {c.subjectName}
                    {c.isSubstitution && (
                      <div>
                        <Badge tone="warn">Substitution</Badge>
                      </div>
                    )}
                  </td>
                  <td style={td}>
                    <Badge tone={c.medium === 'NEPALI' ? 'warn' : 'brand'}>{mediumLabel(c.medium)}</Badge>
                  </td>
                  <td style={td}>{c.roomNumber}</td>
                  <td style={{ ...td, whiteSpace: 'nowrap', textAlign: 'right' }}>
                    {onOpenSubject && !c.isSubstitution && (
                      <Button small onClick={() => onOpenSubject(c.sectionId, c.subjectId)}>
                        Open subject
                      </Button>
                    )}{' '}
                    {onLaunchSmartBoard && !c.isSubstitution && (
                      <Button small variant="primary" onClick={() => onLaunchSmartBoard(c)}>
                        Smart Board
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </Table>
        )}
      </Card>
      )}

      {view === 'week' && (
      <Card title="Weekly timetable">
        {periods.length === 0 ? (
          <p style={{ color: colors.muted, fontSize: 13, margin: 0 }}>The school has not configured its periods yet.</p>
        ) : (
          <Table head={['Period', ...data.workingDays.map(dayLabel)]}>
            {periods.map((p: any) => (
              <tr key={p.periodNumber} style={{ background: p.isBreak ? colors.soft : undefined }}>
                <td style={{ ...td, whiteSpace: 'nowrap' }}>
                  <strong>{p.name}</strong>
                  <div style={{ fontSize: 11, color: colors.muted }}>
                    {p.startTime}–{p.endTime}
                  </div>
                </td>
                {data.workingDays.map((d: string) => {
                  if (p.isBreak) return <td key={d} style={{ ...td, color: colors.muted, fontSize: 12 }}>Break</td>;
                  const e = at(d, p.periodNumber);
                  return (
                    <td key={d} style={{ ...td, background: d === data.currentDay && e ? colors.brandSoft : undefined }}>
                      {e ? (
                        <>
                          <div style={{ fontWeight: 700, fontSize: 12 }}>{e.subjectName}</div>
                          <div style={{ fontSize: 11, color: colors.muted }}>
                            {classLabel(e)} {e.sectionName} · {e.roomNumber}
                          </div>
                        </>
                      ) : (
                        <span style={{ fontSize: 11, color: '#cfdcd8' }}>Free</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </Table>
        )}
      </Card>
      )}

      {view === 'workload' && (
      <>
      <Card title="Periods per day">
        {perDay.length === 0 ? (
          <p style={{ color: colors.muted, fontSize: 13, margin: 0 }}>No published periods yet.</p>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {perDay.map((x) => (
              <div key={x.day} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 36px', alignItems: 'center', gap: 12, fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: x.day === data.currentDay ? colors.brand : undefined }}>{dayLabel(x.day)}</span>
                <div style={{ height: 10, background: '#eef2f7', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${(x.count / maxPerDay) * 100}%`, height: '100%', background: x.day === data.currentDay ? '#117a6b' : '#2fcf9c', borderRadius: 999 }} />
                </div>
                <span style={{ fontWeight: 800, textAlign: 'right' }}>{x.count}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="My classes and subjects">
        {data.classes.length === 0 ? (
          <p style={{ color: colors.muted, fontSize: 13, margin: 0 }}>No published classes yet.</p>
        ) : (
          <Table head={['Class', 'Subject', 'Medium', 'Periods / week', '']}>
            {data.classes.map((c: any) => (
              <tr key={`${c.sectionId}-${c.subjectId}`}>
                <td style={td}>
                  {classLabel(c)} {c.sectionName}
                </td>
                <td style={td}>{c.subjectName}</td>
                <td style={td}>
                  <Badge tone={c.medium === 'NEPALI' ? 'warn' : 'brand'}>{mediumLabel(c.medium)}</Badge>
                </td>
                <td style={td}>{c.periodsPerWeek}</td>
                <td style={{ ...td, textAlign: 'right' }}>
                  {onOpenSubject && (
                    <Button small onClick={() => onOpenSubject(c.sectionId, c.subjectId)}>
                      Open subject
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
      </>
      )}
    </div>
  );
};
