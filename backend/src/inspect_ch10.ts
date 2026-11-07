import mongoose from 'mongoose';

async function checkCh10() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nepal_edu_ecosystem');
  const sims = await mongoose.connection.collection('simulations').find({
    gradeLevels: 1,
    subjectCode: 'MATH',
    chapterNumber: 10
  }).toArray();
  console.log('Chapter 10 simulations count:', sims.length);
  sims.forEach(s => console.log(`- ${s.code}: ${s.title} (published: ${s.isPublished})`));
  await mongoose.disconnect();
}

checkCh10();

