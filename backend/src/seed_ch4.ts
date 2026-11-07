/**
 * seed_ch4.ts
 * Seeds Class 1 Mathematics Chapter 4 simulations into MongoDB
 */
import { connectDB, disconnectDB } from './config/db';
import { SimulationActivityService } from './modules/simulation-activity/simulation-activity.service';

async function seed() {
  await connectDB();
  console.log('Seeding Chapter 4 simulations...');
  await SimulationActivityService.seedInitialContent();
  console.log('✅ Seeding Chapter 4 complete.');
  await disconnectDB();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

