import mongoose from 'mongoose';

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nepal_edu_ecosystem');
  const db = mongoose.connection.db!;
  const sims = await db.collection('simulations').find({ chapterNumber: 5, gradeLevels: 1 }).toArray();
  console.log(`Current Grade 1, Chapter 5 simulations in MongoDB: ${sims.length}`);
  for (const s of sims) {
    console.log(` - ${s.code}: ${s.title} (${s.componentKey})`);
  }
  await mongoose.disconnect();
}

check().catch(console.error);

