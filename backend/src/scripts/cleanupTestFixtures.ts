import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';

/**
 * Removes the records that the old test_module*.ts scripts created in the real database when they were run
 * on 2026-11-06 between 03:30 and 03:45 UTC (09:00-09:15 IST). Everything is backed up to JSON first.
 *   npx tsx src/scripts/cleanupTestFixtures.ts [--dry]
 * Only documents CREATED inside that window are removed; nothing that existed before is touched.
 */
const dry = process.argv.includes('--dry');
const FROM = new Date('2026-11-06T03:30:00Z');
const TO = new Date('2026-11-06T03:45:00Z');
// collections written by the platform's own work, never by the test scripts
const SKIP = /^(system\.|rag)/;

(async () => {
  const c = await MongoClient.connect(process.env.MONGODB_URI?.replace(/\/[^/]*$/, '') || 'mongodb://127.0.0.1:27017');
  const db = c.db('nepal_edu_ecosystem');
  const backup: Record<string, any[]> = {};
  let total = 0;
  for (const { name } of await db.listCollections().toArray()) {
    if (SKIP.test(name)) continue;
    const docs = await db.collection(name).find({ createdAt: { $gte: FROM, $lte: TO } }).toArray();
    if (!docs.length) continue;
    backup[name] = docs;
    total += docs.length;
    console.log(name.padEnd(32), docs.length);
  }
  console.log('total documents created in the window:', total);
  if (!dry && total) {
    const file = path.resolve(__dirname, `../../data/test-fixture-cleanup-backup-${Date.now()}.json`);
    fs.writeFileSync(file, JSON.stringify(backup));
    for (const [name, docs] of Object.entries(backup)) await db.collection(name).deleteMany({ _id: { $in: docs.map((d) => d._id) } });
    console.log('deleted; backup:', file);
  }
  await c.close();
})();
