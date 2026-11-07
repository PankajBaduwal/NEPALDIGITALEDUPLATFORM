import fs from 'fs';
import path from 'path';
import { ENV } from '../config/env';
import { inspectNepalData } from '../modules/curriculum/nepal-data/nepal-data-extractor';
import { writeNepalDataReports } from '../modules/curriculum/nepal-data/nepal-data-reports';

/**
 * Stage 1–2: inspect every PDF in `Nepal data/`, write the extraction snapshot
 * (backend/data/nepal-curriculum-extraction.json) and the four review reports
 * in the project root. Run: npm run curriculum:extract
 */
async function main() {
  const baseDir = ENV.NEPAL_DATA_PATH;
  if (!fs.existsSync(baseDir)) throw new Error(`Nepal data folder not found: ${baseDir}`);

  console.log(`[Nepal Data] Inspecting ${baseDir}`);
  const docs = await inspectNepalData(baseDir, (d, i, n) => {
    console.log(`  [${i}/${n}] ${d.status === 'CLASSIFIED' ? '✓' : '?'} ${d.relativePath} → ${d.subjectKey || d.documentType} / ${d.medium || '-'} / ${d.textLayer} / ${d.chapters.length} ch`);
  });

  const outDir = path.resolve(__dirname, '../../data');
  fs.mkdirSync(outDir, { recursive: true });
  const snapshot = { generatedAt: new Date().toISOString(), sourceFolder: 'Nepal data', documents: docs };
  fs.writeFileSync(path.join(outDir, 'nepal-curriculum-extraction.json'), JSON.stringify(snapshot, null, 1), 'utf8');

  const reportDir = path.resolve(__dirname, '../../..');
  writeNepalDataReports(snapshot, reportDir);
  console.log(`[Nepal Data] ${docs.length} PDFs inspected. Snapshot and reports written.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
