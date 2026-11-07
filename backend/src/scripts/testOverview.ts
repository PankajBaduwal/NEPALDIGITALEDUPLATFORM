import mongoose from 'mongoose';
import { RegistrationRequest } from '../models/RegistrationRequest';
import { Institution } from '../models/Institution';
import { User } from '../models/User';

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nepal_edu_ecosystem');
  const reqCount = await RegistrationRequest.countDocuments();
  const reqs = await RegistrationRequest.find({}, 'requestCode institutionName status emisCode createdAt');
  const instCount = await Institution.countDocuments();
  const userCount = await User.countDocuments();

  console.log('INSTITUTIONS COUNT:', instCount);
  console.log('USERS COUNT:', userCount);
  console.log('REGISTRATION REQUESTS COUNT:', reqCount);
  console.log('REGISTRATION REQUESTS:', JSON.stringify(reqs, null, 2));
  process.exit(0);
}

check();
