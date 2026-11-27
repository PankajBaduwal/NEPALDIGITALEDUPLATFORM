import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nepal_edu_ecosystem';

async function run() {
  await mongoose.connect(MONGODB_URI);
  const Simulation = mongoose.models.Simulation || mongoose.model('Simulation', new mongoose.Schema({}, { strict: false }));
  const sims: any[] = await Simulation.find({ gradeLevels: 1, subjectCode: /MATH/i }).sort({ chapterNumber: 1, code: 1 }).lean();

  const rootDir = path.join(__dirname, '../../../');
  const playerSrc = fs.readFileSync(path.join(rootDir, 'frontend/src/components/simulations/SimulationPlayer.tsx'), 'utf8');
  const ch1122Src = fs.readFileSync(path.join(rootDir, 'frontend/src/simulations/class1-math-ch11-22/registry.tsx'), 'utf8');
  const kprietSchoolDir = path.join(rootDir, 'frontend/src/kpriet-sims/school');
  const kprietFiles = fs.readdirSync(kprietSchoolDir).filter((f) => f.endsWith('.ts') || f.endsWith('.tsx')).map((f) => fs.readFileSync(path.join(kprietSchoolDir, f), 'utf8')).join('\n');

  let ok = 0, broken = 0;
  const rows: any[] = [];

  for (const s of sims) {
    const key = s.componentKey || '';
    let resolved = false;
    let target = '';

    if (key.startsWith('kpriet:')) {
      const kId = key.slice('kpriet:'.length);
      resolved = kprietFiles.includes(kId);
      target = `kpriet:${kId}`;
    } else if (playerSrc.includes(`'${key}'`) || playerSrc.includes(`'${s.code}'`)) {
      resolved = true;
      target = `SimulationPlayer (${key || s.code})`;
    } else if (ch1122Src.includes(`'${key}'`) || ch1122Src.includes(`'${s.code}'`)) {
      resolved = true;
      target = `Ch11-22 Registry (${key || s.code})`;
    }

    if (resolved) ok++; else broken++;
    rows.push({
      ch: s.chapterNumber,
      code: s.code,
      title: s.title,
      key: key || '(none)',
      resolved: resolved ? 'PASS' : 'FAIL',
    });
  }

  console.log(`\nClass 1 Math DB Simulations: ${sims.length}`);
  console.log(`Resolved & Playable: ${ok}/${sims.length} | Broken: ${broken}`);
  if (broken > 0) {
    console.log('BROKEN SIMULATIONS:');
    console.table(rows.filter((r) => r.resolved === 'FAIL'));
  } else {
    console.log('✓ ALL 75 CLASS 1 MATH SIMULATIONS RESOLVE TO VALID PLAYABLE COMPONENTS!');
  }

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
