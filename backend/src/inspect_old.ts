import mongoose from 'mongoose';
async function inspectOldSim() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nepal_edu_ecosystem');
  const sim = await mongoose.connection.collection('simulations').findOne({ code: 'KP-g18-class1-counting' });
  console.log(JSON.stringify(sim, null, 2));
  await mongoose.disconnect();
}
inspectOldSim();

