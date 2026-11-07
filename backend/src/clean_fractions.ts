import { connectDB, disconnectDB } from './config/db';
import { Simulation } from './models/SimulationActivity';

async function update() {
  await connectDB();
  const res = await Simulation.updateOne(
    { code: 'SIM-MATH-G1-FRACTIONS' },
    { $set: { gradeLevels: [3, 4, 5], subjectCode: 'MATH', chapterNumber: 7 } }
  );
  console.log('Update result:', res);
  await disconnectDB();
}
update();

