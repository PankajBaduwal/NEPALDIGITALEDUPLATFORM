import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Timetable, TimetableEntry, SubjectAllocation, CentralSubject, User } from '../models';

/**
 * Moves whole section+subject teaching assignments away from teachers scheduled for more periods per week
 * than there are slots (default 42) to teachers with spare capacity, preferring a teacher who already teaches
 * the same subject. Updates SubjectAllocation and the timetable entries together so they stay consistent.
 *   npx tsx src/scripts/rebalanceTeacherLoad.ts [--dry] [--max 42] [--target 40]
 * A JSON backup of every changed allocation / entry is written to backend/data/.
 */
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const num = (n: string, d: number) => { const i = args.indexOf(`--${n}`); return i >= 0 ? Number(args[i + 1]) : d; };
const MAX = num('max', 42), TARGET = num('target', 40);

async function main() {
  await connectDB();
  const pubIds = (await Timetable.find({ status: 'PUBLISHED' }).select('_id').lean()).map((t: any) => t._id);
  const entries: any[] = await TimetableEntry.find({ timetableId: { $in: pubIds } }).select('teacherId sectionId centralSubjectId').lean();
  const load = new Map<string, number>();
  entries.forEach((e) => load.set(String(e.teacherId), (load.get(String(e.teacherId)) || 0) + 1));
  const allocs: any[] = await SubjectAllocation.find({ status: { $ne: 'INACTIVE' } }).lean();
  const subs: any[] = await CentralSubject.find({ _id: { $in: allocs.map((a) => a.centralSubjectId) } }).select('name logicalKey gradeNumber').lean();
  const subKey = new Map(subs.map((s) => [String(s._id), s.logicalKey || s.name]));
  const names = new Map((await User.find({ _id: { $in: [...load.keys()] } }).select('fullName').lean() as any[]).map((u) => [String(u._id), u.fullName]));
  const periods = (a: any) => entries.filter((e) => String(e.sectionId) === String(a.sectionId) && String(e.centralSubjectId) === String(a.centralSubjectId)).length;
  const teachesKey = (t: string, k: string) => allocs.some((a) => String(a.teacherId) === t && subKey.get(String(a.centralSubjectId)) === k);

  const plan: Array<{ allocationId: any; sectionId: any; centralSubjectId: any; from: string; to: string; periods: number }> = [];
  const over = [...load.entries()].filter(([, n]) => n > MAX).sort((a, b) => b[1] - a[1]);
  for (const [t] of over) {
    // smallest assignments first so the move is as small as possible
    const mine = allocs.filter((a) => String(a.teacherId) === t).map((a) => ({ a, p: periods(a) })).filter((x) => x.p > 0).sort((x, y) => x.p - y.p);
    for (const { a, p } of mine) {
      if ((load.get(t) || 0) <= MAX) break;
      const key = subKey.get(String(a.centralSubjectId))!;
      const cands = [...load.entries()].filter(([u, n]) => u !== t && n + p <= TARGET).sort((x, y) => {
        const sx = teachesKey(x[0], key) ? 0 : 1, sy = teachesKey(y[0], key) ? 0 : 1;
        return (x[1] - y[1]) || (sx - sy);
      });
      if (!cands.length) continue;
      const to = cands[0][0];
      load.set(t, load.get(t)! - p); load.set(to, load.get(to)! + p);
      plan.push({ allocationId: a._id, sectionId: a.sectionId, centralSubjectId: a.centralSubjectId, from: t, to, periods: p });
    }
  }
  // Second pass (chain move): when no one has room for a block, let a receiver pass one of its own blocks on first
  const owner = (a: any) => plan.filter((m) => String(m.allocationId) === String(a._id)).pop()?.to || String(a.teacherId);
  for (const [t] of [...load.entries()].filter(([, n]) => n > MAX)) {
    const blocks = allocs.filter((a) => owner(a) === t).map((a) => ({ a, p: periods(a) })).filter((x) => x.p > 0).sort((x, y) => x.p - y.p);
    let done = false;
    for (const { a, p } of blocks) {
      for (const [r, nr] of [...load.entries()].sort((x, y) => x[1] - y[1])) {
        if (r === t || done) continue;
        const rBlocks = allocs.filter((b) => owner(b) === r && String(b._id) !== String(a._id)).map((b) => ({ b, q: periods(b) })).filter((x) => x.q > 0);
        for (const { b, q } of rBlocks) {
          if (nr + p - q > MAX) continue;
          const s = [...load.entries()].find(([u, nu]) => u !== t && u !== r && nu + q <= MAX);
          if (!s) continue;
          load.set(t, load.get(t)! - p + 0); load.set(r, load.get(r)! + p - q); load.set(s[0], load.get(s[0])! + q);
          plan.push({ allocationId: b._id, sectionId: b.sectionId, centralSubjectId: b.centralSubjectId, from: r, to: s[0], periods: q });
          plan.push({ allocationId: a._id, sectionId: a.sectionId, centralSubjectId: a.centralSubjectId, from: t, to: r, periods: p });
          done = true; break;
        }
        if (done) break;
      }
      if (done || (load.get(t) || 0) <= MAX) break;
    }
  }
  for (const m of plan) console.log(`${m.periods} periods: ${names.get(m.from)} -> ${names.get(m.to) || m.to} (${subKey.get(String(m.centralSubjectId))})`);
  const stillOver = [...load.entries()].filter(([, n]) => n > MAX).length;
  console.log(`moves: ${plan.length}, teachers still over ${MAX}: ${stillOver}`);
  if (!dry && plan.length) {
    const backup = path.resolve(__dirname, `../../data/teacher-rebalance-backup-${Date.now()}.json`);
    fs.writeFileSync(backup, JSON.stringify(plan, null, 1));
    for (const m of plan) {
      await SubjectAllocation.updateOne({ _id: m.allocationId }, { $set: { teacherId: m.to } });
      await TimetableEntry.updateMany({ sectionId: m.sectionId, centralSubjectId: m.centralSubjectId, teacherId: m.from }, { $set: { teacherId: m.to } });
    }
    console.log('applied; backup:', backup);
  }
  await mongoose.disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
