import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Timetable, TimetableEntry } from '../models';

/**
 * Repairs teacher double-booking in PUBLISHED timetables by swapping periods inside the same section
 * (so every section keeps the same subjects/teachers per week; only their day/period changes).
 *   npx tsx src/scripts/fixTimetableClashes.ts [--dry]
 * A JSON backup of every entry that moves is written to backend/data/timetable-repair-backup-<ts>.json
 */
const dry = process.argv.includes('--dry');
const key = (t: any, d: string, p: number, y: any) => `${t}|${d}|${p}|${y}`;

async function main() {
  await connectDB();
  const pubs: any[] = await Timetable.find({ status: 'PUBLISHED' }).select('_id sectionId').lean();
  const ids = pubs.map((t) => t._id);
  const entries: any[] = await TimetableEntry.find({ timetableId: { $in: ids } }).lean();
  const slot = new Map<string, any[]>();
  const add = (e: any) => { const k = key(e.teacherId, e.dayOfWeek, e.periodNumber, e.academicYearId); (slot.get(k) || slot.set(k, []).get(k)!).push(e); };
  const del = (e: any) => { const k = key(e.teacherId, e.dayOfWeek, e.periodNumber, e.academicYearId); slot.set(k, (slot.get(k) || []).filter((x) => x !== e)); };
  entries.forEach(add);
  const bySection = new Map<string, any[]>();
  entries.forEach((e) => (bySection.get(String(e.timetableId)) || bySection.set(String(e.timetableId), []).get(String(e.timetableId))!).push(e));
  const free = (t: any, d: string, p: number, y: any, ignore: any[]) => (slot.get(key(t, d, p, y)) || []).filter((x) => !ignore.includes(x)).length === 0;
  const moved = new Map<string, any>();
  const swap = (a: any, b: any) => {
    [a, b].forEach((x) => { if (!moved.has(String(x._id))) moved.set(String(x._id), { _id: x._id, dayOfWeek: x.dayOfWeek, periodNumber: x.periodNumber, periodId: x.periodId, startTime: x.startTime, endTime: x.endTime }); });
    del(a); del(b);
    for (const f of ['dayOfWeek', 'periodNumber', 'periodId', 'startTime', 'endTime']) { const t = a[f]; a[f] = b[f]; b[f] = t; }
    add(a); add(b);
  };
  const clashes = () => [...slot.values()].filter((v) => v.length > 1);
  const cost = () => [...slot.values()].reduce((n, v) => n + Math.max(0, v.length - 1), 0);
  const before = clashes().length;
  // Local search: swap two periods of the same section when it does not add clashes
  // (occasionally accept a worse move to escape dead ends)
  const secKeys = [...bySection.keys()];
  const clashCount = (e: any) => Math.max(0, (slot.get(key(e.teacherId, e.dayOfWeek, e.periodNumber, e.academicYearId)) || []).length - 1);
  let cur = cost();
  for (let it = 0; it < 3_000_000 && cur > 0; it++) {
    const temp = Math.max(0.02, 0.4 * (1 - it / 2_000_000));
    const mates = bySection.get(secKeys[Math.floor(Math.random() * secKeys.length)])!;
    const a = mates[Math.floor(Math.random() * mates.length)];
    if (clashCount(a) === 0 && Math.random() > 0.15) continue; // focus on entries that clash
    const b = mates[Math.floor(Math.random() * mates.length)];
    if (a === b || (a.dayOfWeek === b.dayOfWeek && a.periodNumber === b.periodNumber)) continue;
    swap(a, b);
    const next = cost();
    if (next <= cur || Math.random() < Math.exp((cur - next) / temp)) cur = next;
    else swap(a, b);
  }
  // only entries that really ended up somewhere else are written
  for (const [id, o] of [...moved]) {
    const e = entries.find((x) => String(x._id) === id);
    if (e && e.dayOfWeek === o.dayOfWeek && e.periodNumber === o.periodNumber) moved.delete(id);
  }
  const after = clashes().length;
  console.log(`clashing slots before: ${before}, after: ${after}, entries moved: ${moved.size}`);
  if (!dry && moved.size) {
    const backup = path.resolve(__dirname, `../../data/timetable-repair-backup-${Date.now()}.json`);
    fs.writeFileSync(backup, JSON.stringify([...moved.values()], null, 1));
    // two-phase write so the unique (timetableId, day, period) index never collides
    const touched = entries.filter((e) => moved.has(String(e._id)));
    await TimetableEntry.bulkWrite(touched.map((e) => ({ updateOne: { filter: { _id: e._id }, update: { $set: { periodNumber: -1 - Number(String(e._id).slice(-4).length) } } } })), { ordered: true }).catch(() => {});
    for (const e of touched) await TimetableEntry.updateOne({ _id: e._id }, { $set: { periodNumber: -(1000 + Math.floor(Math.random() * 1e6)) } });
    for (const e of touched) await TimetableEntry.updateOne({ _id: e._id }, { $set: { dayOfWeek: e.dayOfWeek, periodNumber: e.periodNumber, periodId: e.periodId, startTime: e.startTime, endTime: e.endTime } });
    console.log('written; backup:', backup);
  }
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
