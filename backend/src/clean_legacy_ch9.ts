import mongoose from 'mongoose';

async function cleanLegacy() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nepal_edu_ecosystem');
  const res = await mongoose.connection.collection('simulations').updateOne(
    { code: 'KP-g18-class1-counting' },
    { $set: { chapterNumber: null, isPublished: false } }
  );
  console.log('Cleaned legacy sim:', res.modifiedCount);
  await mongoose.disconnect();
}

cleanLegacy();

