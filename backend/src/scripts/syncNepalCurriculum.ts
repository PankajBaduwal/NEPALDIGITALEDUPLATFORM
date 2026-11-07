import { connectDB, disconnectDB } from '../config/db';
import { NepalCurriculumSyncService } from '../modules/curriculum/nepal-data/nepal-curriculum-sync.service';

/**
 * Stage 3: load the extraction snapshot into the central curriculum library
 * (CentralSubject, Textbook, TextbookChapter, ReferenceDocument).
 * Run after `npm run curriculum:extract`: npm run curriculum:sync
 */
async function main() {
  await connectDB();
  const summary = await NepalCurriculumSyncService.syncFromSnapshot();
  console.log('[Curriculum Sync] Done:', JSON.stringify(summary, null, 2));
  await disconnectDB();
}

main().catch(async (err) => {
  console.error(err);
  await disconnectDB();
  process.exit(1);
});
