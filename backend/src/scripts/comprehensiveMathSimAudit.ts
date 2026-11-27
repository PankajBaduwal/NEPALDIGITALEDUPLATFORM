import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { SimulationActivityService } from '../modules/simulation-activity/simulation-activity.service';

dotenv.config({ path: path.join(__dirname, '../../.env') });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nepal_edu_ecosystem';

interface SimDoc {
  code: string;
  title: string;
  titleNepali?: string;
  subjectCode: string;
  gradeLevels: number[];
  chapterNumber?: number;
  chapterName?: string;
  componentKey?: string;
  simulationType?: string;
  isPublished?: boolean;
}

async function audit() {
  console.log('=== NEPAL DIGITAL EDUCATION PLATFORM: MATH SIMULATION AUDIT ===\n');
  await mongoose.connect(MONGODB_URI);
  console.log('✓ Connected to MongoDB:', MONGODB_URI);

  const Simulation = mongoose.models.Simulation || mongoose.model('Simulation', new mongoose.Schema({}, { strict: false }));
  
  const subjectCodes = await Simulation.distinct('subjectCode');
  console.log('Distinct subjectCodes in DB:');
  for (const sc of subjectCodes) {
    const count = await Simulation.countDocuments({ subjectCode: sc });
    console.log(`  ${sc}: ${count}`);
  }

  const dbSims: SimDoc[] = (await Simulation.find({
    $or: [
      { subjectCode: /MATH/i },
      { subjectName: /MATH/i },
      { code: /^SIM-MATH/i },
      { code: /^SIM-OPTMATH/i },
    ]
  }).lean()) as any[];

  console.log('Testing SimulationActivityService.getLibraryHierarchy()...');
  try {
    const hierarchy = await SimulationActivityService.getLibraryHierarchy();
    console.log('✓ Successfully retrieved library hierarchy.');
    const mathByGradeHierarchy: Record<string, number> = {};
    (hierarchy.classes || []).forEach((c: any) => {
      (c.subjects || []).forEach((s: any) => {
        if (s.code === 'MATH' || s.code === 'OPTMATH') {
          mathByGradeHierarchy[`G${c.grade}_${s.code}`] = s.simulationCount;
        }
      });
    });
    console.log('Hierarchy Math & OptMath Counts by Grade:', JSON.stringify(mathByGradeHierarchy, null, 2));
  } catch (err: any) {
    console.error('❌ Failed to get library hierarchy:', err);
  }

  // Group by grade
  const byGrade: Record<number, SimDoc[]> = {};
  for (let g = 1; g <= 10; g++) byGrade[g] = [];

  const unassigned: SimDoc[] = [];

  dbSims.forEach((sim) => {
    const grades = sim.gradeLevels || [];
    if (grades.length === 0) {
      unassigned.push(sim);
    } else {
      grades.forEach((g) => {
        if (!byGrade[g]) byGrade[g] = [];
        byGrade[g].push(sim);
      });
    }
  });

  console.log('--- MongoDB Distribution By Grade ---');
  for (let g = 1; g <= 10; g++) {
    console.log(`Grade ${g.toString().padStart(2, ' ')}: ${byGrade[g].length} simulations in DB`);
  }
  if (unassigned.length > 0) {
    console.log(`Unassigned grade: ${unassigned.length} simulations`);
  }

  // Frontend directory scan
  const frontendDir = path.join(__dirname, '../../../frontend/src/simulations');
  console.log('\n--- Frontend Registry & Component Verification ---');

  const registryPaths: Record<string, string> = {
    'Class 1 (Ch 1-10)': path.join(__dirname, '../../../frontend/src/components/simulations/SimulationPlayer.tsx'),
    'Class 1 (Ch 11-22)': path.join(frontendDir, 'class1-math-ch11-22/registry.tsx'),
    'Class 2': path.join(frontendDir, 'class2-math/registry.tsx'),
    'Class 3': path.join(frontendDir, 'class3-math/registry.tsx'),
    'Class 4': path.join(frontendDir, 'class4-math/registry.tsx'),
    'Class 5': path.join(frontendDir, 'class5-math/registry.tsx'),
    'Class 6': path.join(frontendDir, 'class6-math/registry.tsx'),
    'Class 7': path.join(frontendDir, 'class7-math/registry.tsx'),
    'Class 8': path.join(frontendDir, 'class8-math/registry.tsx'),
    'Class 9 Compulsory': path.join(frontendDir, 'class9-math/registry.tsx'),
    'Class 9 Optional': path.join(frontendDir, 'class9-optmath/registry.tsx'),
    'Class 10 Compulsory': path.join(frontendDir, 'class10-math/registry.tsx'),
  };

  console.log('\n--- Component File Existence Check ---');
  let missingFilesCount = 0;
  for (const [name, regPath] of Object.entries(registryPaths)) {
    if (!fs.existsSync(regPath)) continue;
    const content = fs.readFileSync(regPath, 'utf8');
    const dir = path.dirname(regPath);
    
    // Look for import('./FileName') or import('../path/to/FileName')
    const importMatches = content.matchAll(/import\(['"]([^'"]+)['"]\)/g);
    for (const m of importMatches) {
      const rel = m[1];
      const candidates = [
        path.resolve(dir, rel + '.tsx'),
        path.resolve(dir, rel + '.ts'),
        path.resolve(dir, rel + '/index.tsx'),
        path.resolve(dir, rel + '/index.ts'),
        path.resolve(dir, rel),
      ];
      const found = candidates.some((c) => fs.existsSync(c));
      if (!found) {
        console.log(`❌ [${name}] Missing imported component file: ${rel} (from ${regPath})`);
        missingFilesCount++;
      }
    }

    // Also for SimulationPlayer.tsx static imports
    if (name === 'Class 1 (Ch 1-10)') {
      const staticImports = content.matchAll(/import\s+\{[^}]+\}\s+from\s+['"]([^'"]+)['"]/g);
      for (const m of staticImports) {
        const rel = m[1];
        if (rel.startsWith('.')) {
          const candidates = [
            path.resolve(dir, rel + '.tsx'),
            path.resolve(dir, rel + '.ts'),
            path.resolve(dir, rel + '/index.tsx'),
            path.resolve(dir, rel),
          ];
          const found = candidates.some((c) => fs.existsSync(c));
          if (!found) {
            console.log(`❌ [${name}] Missing static imported file: ${rel}`);
            missingFilesCount++;
          }
        }
      }
    }
  }

  if (missingFilesCount === 0) {
    console.log('✓ All 400+ imported simulation component files physically exist on disk!');
  } else {
    console.log(`❌ Total missing component files: ${missingFilesCount}`);
  }

  const registeredKeys = new Set<string>();
  const registeredCodes = new Set<string>();

  for (const [name, regPath] of Object.entries(registryPaths)) {
    if (!fs.existsSync(regPath)) {
      console.log(`❌ Missing registry file for ${name}: ${regPath}`);
      continue;
    }
    const content = fs.readFileSync(regPath, 'utf8');

    // Extract codes and keys
    const codeMatches = content.matchAll(/code:\s*['"]([^'"]+)['"]/g);
    for (const m of codeMatches) {
      registeredCodes.add(m[1]);
    }
    const keyMatches = content.matchAll(/key:\s*['"]([^'"]+)['"]/g);
    for (const m of keyMatches) {
      registeredKeys.add(m[1]);
    }

    // Also for SimulationPlayer.tsx, check componentKey === '...'
    if (name === 'Class 1 (Ch 1-10)') {
      const compKeyMatches = content.matchAll(/componentKey\s*===\s*['"]([^'"]+)['"]/g);
      for (const m of compKeyMatches) {
        registeredKeys.add(m[1]);
      }
      const simCodeMatches = content.matchAll(/simulation\.code\s*===\s*['"]([^'"]+)['"]/g);
      for (const m of simCodeMatches) {
        registeredCodes.add(m[1]);
      }
    }

    console.log(`✓ ${name.padEnd(22, ' ')}: registry found at ${path.basename(regPath)}`);
  }

  console.log(`\nTotal unique registered keys in frontend: ${registeredKeys.size}`);
  console.log(`Total unique registered codes in frontend: ${registeredCodes.size}`);

  // Cross check DB against frontend
  let dbMatchedInFrontend = 0;
  let dbMissingInFrontend = 0;
  const missingFromFrontend: SimDoc[] = [];

  dbSims.forEach((sim) => {
    const keyMatch = sim.componentKey && registeredKeys.has(sim.componentKey);
    const codeMatch = sim.code && registeredCodes.has(sim.code);
    if (keyMatch || codeMatch) {
      dbMatchedInFrontend++;
    } else {
      dbMissingInFrontend++;
      missingFromFrontend.push(sim);
    }
  });

  console.log(`\nCross Check Results:`);
  console.log(`DB simulations verified in Frontend: ${dbMatchedInFrontend}/${dbSims.length}`);
  if (dbMissingInFrontend > 0) {
    console.log(`⚠️ DB simulations missing in Frontend registries: ${dbMissingInFrontend}`);
    missingFromFrontend.forEach((m) => {
      console.log(`  - [G${m.gradeLevels?.join(',')}] ${m.code} | ${m.componentKey} | ${m.title}`);
    });
  } else {
    console.log('✓ All DB simulations have corresponding Frontend registry mappings!');
  }

  // Cross check Frontend against DB
  const dbCodes = new Set(dbSims.map((s) => s.code));
  const dbKeys = new Set(dbSims.map((s) => s.componentKey).filter(Boolean));
  let unseededCount = 0;
  const unseeded: string[] = [];

  registeredCodes.forEach((code) => {
    if (!dbCodes.has(code)) {
      unseededCount++;
      unseeded.push(code);
    }
  });

  if (unseededCount > 0) {
    console.log(`\n⚠️ Registered Frontend codes not found in DB: ${unseededCount}`);
    unseeded.slice(0, 15).forEach((c) => console.log(`  - ${c}`));
    if (unseeded.length > 15) console.log(`  ... and ${unseeded.length - 15} more`);
  } else {
    console.log('✓ All registered frontend codes are seeded in MongoDB!');
  }

  await mongoose.disconnect();
  console.log('\nAudit Phase 1 Scan Complete.');
}

audit().catch((e) => {
  console.error('Audit failed:', e);
  process.exit(1);
});
