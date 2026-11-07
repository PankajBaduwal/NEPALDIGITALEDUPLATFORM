import mongoose from 'mongoose';
async function inspectCh7() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nepal_edu_ecosystem');
  const sims = await mongoose.connection.collection('simulations').find({
    code: { $in: ['KP-g18-class1-addition-subtraction-stories', 'KP-g18-class1-addition-objects'] }
  }).toArray();
  console.log(sims.map(s => ({ code: s.code, chapterNumber: s.chapterNumber, isPublished: s.isPublished })));
  await mongoose.disconnect();
}
inspectCh7();

