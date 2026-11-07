import mongoose from 'mongoose';
async function inspectCh9() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nepal_edu_ecosystem');
  const sims = await mongoose.connection.collection('simulations').find({
    gradeLevels: 1,
    subjectCode: 'MATH',
    chapterNumber: 9
  }).toArray();
  console.log('Chapter 9 simulations count:', sims.length);
  sims.forEach(s => console.log(`- ${s.code}: ${s.title} (published: ${s.isPublished})`));
  await mongoose.disconnect();
}
inspectCh9();

