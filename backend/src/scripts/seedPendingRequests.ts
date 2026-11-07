import mongoose from 'mongoose';
import { RegistrationRequest } from '../models/RegistrationRequest';

async function seed() {
  await mongoose.connect('mongodb://127.0.0.1:27017/nepal_edu_ecosystem');

  const pendingCount = await RegistrationRequest.countDocuments({
    status: { $in: ['PENDING', 'SUBMITTED', 'UNDER_VERIFICATION'] },
  });

  if (pendingCount === 0) {
    console.log('Seeding realistic pending requests...');
    await RegistrationRequest.create([
      {
        requestCode: 'REG-2081-7421',
        institutionName: 'Janakpur Secondary Model Academy',
        nameNepali: 'जनकपुर माध्यमिक मोडेल एकेडेमी',
        emisCode: '320010045',
        institutionKind: 'SCHOOL',
        institutionType: 'COMMUNITY',
        province: 'Madhesh Province',
        district: 'Dhanusha',
        localLevel: 'Janakpurdham Sub-Metropolitan City',
        ward: 4,
        street: 'Station Road',
        contactPerson: 'Rameshwar Prasad Yadav',
        designation: 'School Headmaster',
        email: 'headmaster@janakpurmodel.edu.np',
        phone: '9854023456',
        requestedPackages: ['PACKAGE_1_FOUNDATION', 'PACKAGE_2_MIDDLE', 'PACKAGE_3_SECONDARY'],
        estimatedStudents: 740,
        academicYear: '2081/2082',
        educationLevels: ['BASIC_1_5', 'BASIC_6_8', 'SECONDARY_9_10'],
        mediumOfInstruction: 'BOTH',
        status: 'PENDING',
        adminDetails: {
          fullName: 'Rameshwar Prasad Yadav',
          username: 'admin_320010045',
          email: 'admin@janakpurmodel.edu.np',
          phone: '9854023456',
        },
        notes: 'Public school submitted via portal. MoEST accreditation document verified.',
      },
      {
        requestCode: 'REG-2081-8912',
        institutionName: 'Karnali Technical Science College',
        nameNepali: 'कर्णाली प्राविधिक विज्ञान कलेज',
        emisCode: '620020088',
        institutionKind: 'COLLEGE',
        institutionType: 'INSTITUTIONAL',
        province: 'Karnali Province',
        district: 'Surkhet',
        localLevel: 'Birendranagar Municipality',
        ward: 6,
        street: 'Airport Road',
        contactPerson: 'Prof. Narendra Bahadur Shahi',
        designation: 'Campus Chief',
        email: 'chief@karnalitech.edu.np',
        phone: '9858034567',
        requestedPackages: ['COLLEGE_HIGHER_ED', 'K12_ALL'],
        estimatedStudents: 420,
        academicYear: '2081/2082',
        educationLevels: ['HIGHER_SECONDARY_11_12'],
        mediumOfInstruction: 'ENGLISH',
        status: 'UNDER_VERIFICATION',
        adminDetails: {
          fullName: 'Prof. Narendra Bahadur Shahi',
          username: 'admin_620020088',
          email: 'admin@karnalitech.edu.np',
          phone: '9858034567',
        },
        notes: 'TU affiliated bachelor campus requesting digital smart boards and textbook licenses.',
      },
    ]);
    console.log('✅ Seeded 2 realistic pending requests.');
  } else {
    console.log(`Already have ${pendingCount} pending requests.`);
  }

  process.exit(0);
}

seed();

