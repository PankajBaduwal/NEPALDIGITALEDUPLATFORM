/**
 * Registers the Class 1 and Class 2 simulations ported from KPRIET in our simulation library, so they appear
 * under their class → subject → chapter in "Explore Simulations".
 *
 *   npx tsx src/scripts/seedKprietClassSimulations.ts          (idempotent: upserts by code)
 *
 * Reads src/data/kprietClassSimulations.json (made by tools/buildKprietClassSimCatalog.ts from the copied
 * simulations). The simulation code itself lives in frontend/src/kpriet-sims; the database only stores the catalogue
 * entry and the component key that opens it.
 */
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { Simulation } from '../models';
import catalog from '../data/kprietClassSimulations.json';

async function main() {
  await connectDB();
  let created = 0;
  let updated = 0;
  for (const doc of catalog as any[]) {
    const existed = await Simulation.exists({ code: doc.code });
    await Simulation.updateOne({ code: doc.code }, { $set: doc, $setOnInsert: { viewsCount: 0, smartBoardLaunches: 0, currentVersion: '1.0.0' } }, { upsert: true });
    existed ? updated++ : created++;
  }
  console.log(`KPRIET class simulations: ${created} created, ${updated} updated`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
