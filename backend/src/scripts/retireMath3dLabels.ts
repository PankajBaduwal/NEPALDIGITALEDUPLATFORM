/**
 * The Class 1–6 Mathematics simulations are 2D (SVG / Canvas) now. This one-off script brings their stored
 * records in line: it removes the old 3D / WebGL / Three.js wording and rendering type. Codes, component keys,
 * chapters, grades, activities and progress records are not touched. Safe to run more than once.
 *
 *   npx tsx src/scripts/retireMath3dLabels.ts
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { Simulation } from '../models/SimulationActivity';

const clean = (s: any): any => {
  if (typeof s !== 'string') return s;
  return s
    .replace(/\b(a|an) 3D\b ?/gi, 'an interactive ')
    .replace(/\(3D Edition\)/gi, '')
    .replace(/\s*\(थ्रीडी\)/g, '')
    .replace(/\b3D\b ?(?!solid|shape|object|figure|cube|net|tile)/gi, '')
    .replace(/\s+–\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

(async () => {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1/nepal_edu_ecosystem');
  const sims: any[] = await Simulation.find({ subjectCode: { $in: ['MATH', 'MTH'] }, gradeLevels: { $elemMatch: { $lte: 6 } } });
  let changed = 0;
  for (const s of sims) {
    const patch: any = {};
    for (const f of ['title', 'titleNepali', 'description']) {
      const v = clean(s[f]);
      if (v !== s[f]) patch[f] = v;
    }
    if (['3D_WEBGL', 'THREE_JS'].includes(s.simulationType)) patch.simulationType = 'HTML5_CANVAS';
    if (Array.isArray(s.tags)) {
      const tags = s.tags.filter((t: string) => !/(^3d$|webgl|three\.?js)/i.test(t));
      if (tags.length !== s.tags.length) patch.tags = tags;
    }
    if (Array.isArray(s.learningObjectives)) {
      const lo = s.learningObjectives.map(clean);
      if (JSON.stringify(lo) !== JSON.stringify(s.learningObjectives)) patch.learningObjectives = lo;
    }
    if (Object.keys(patch).length) {
      await Simulation.updateOne({ _id: s._id }, { $set: patch });
      changed++;
    }
  }
  console.log(`Class 1-6 Mathematics simulations checked: ${sims.length}, updated: ${changed}`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
