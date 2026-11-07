import mongoose from 'mongoose';
import { AuthService } from './modules/auth/auth.service';
import { connectDB, disconnectDB } from './config/db';

async function runTests() {
  console.log('🧪 Starting Public Auth, Demo Login, and Registration Tests...');
  await connectDB();

  let passed = 0;
  let failed = 0;

  // 1. Test Demo Logins for all 6 roles
  const roles = [
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'PRINCIPAL',
    'TEACHER',
    'CLASS_TEACHER',
    'STUDENT',
  ];

  for (const role of roles) {
    try {
      const res = await AuthService.demoLogin(role);
      if (res && res.token && res.user && res.user.role) {
        console.log(`  ✅ Demo Login successful for ${role} (${res.user.fullName}, isDemo: ${res.user.isDemo})`);
        passed++;
      } else {
        console.error(`  ❌ Demo Login response malformed for ${role}`);
        failed++;
      }
    } catch (err: any) {
      console.error(`  ❌ Demo Login failed for ${role}:`, err.message || err);
      failed++;
    }
  }

  // 2. Test Institutional Registration Request
  let sampleEmis = `999${Math.floor(100000 + Math.random() * 900000)}`;
  try {
    const regRes = await AuthService.registerInstitution({
      institutionName: 'Himalayan Apex Model Academy',
      nameNepali: 'हिमालयन एपेक्स मोडल एकेडेमी',
      emisCode: sampleEmis,
      institutionType: 'INSTITUTIONAL',
      province: 'Gandaki Province',
      district: 'Kaski',
      localLevel: 'Pokhara Metropolitan City',
      ward: 8,
      contactPerson: 'Kalyan Gurung',
      designation: 'Principal',
      email: `principal.${sampleEmis}@himalayan.edu.np`,
      phone: '9856012345',
      requestedPackages: ['PACKAGE_1_FOUNDATION', 'PACKAGE_2_MIDDLE', 'PACKAGE_3_SECONDARY'],
      estimatedStudents: 450,
      notes: 'Interested in smart boards for classes 6 to 10 with offline simulations.',
    });

    if (regRes && regRes.requestCode) {
      console.log(`  ✅ Institution Registration submitted (Code: ${regRes.requestCode})`);
      passed++;
    } else {
      console.error('  ❌ Institution Registration returned invalid response');
      failed++;
    }
  } catch (err: any) {
    console.error('  ❌ Institution Registration failed:', err.message || err);
    failed++;
  }

  // 3. Test Forgot Password
  try {
    const forgotRes = await AuthService.forgotPassword('teacher_ramesh');
    if (forgotRes && forgotRes.resetToken) {
      console.log(`  ✅ Forgot Password token generated for teacher_ramesh`);
      passed++;

      // 4. Test Reset Password
      const resetRes = await AuthService.resetPassword(forgotRes.resetToken, 'Nepal@NewSecure2081');
      if (resetRes && resetRes.success) {
        console.log(`  ✅ Reset Password successful with new credentials`);
        passed++;

        // Restore default password for continuity
        const user = await AuthService.forgotPassword('teacher_ramesh');
        await AuthService.resetPassword(user.resetToken!, 'Nepal@1234');
        console.log(`  🔄 Restored original password for demo user teacher_ramesh`);
      } else {
        console.error('  ❌ Reset Password returned false');
        failed++;
      }
    } else {
      console.error('  ❌ Forgot Password failed to generate token');
      failed++;
    }
  } catch (err: any) {
    console.error('  ❌ Forgot / Reset Password flow error:', err.message || err);
    failed++;
  }

  // 5. Test Fetch Registration Requests
  try {
    const requests = await AuthService.getRegistrationRequests('PENDING');
    if (requests && requests.length > 0) {
      console.log(`  ✅ Super Admin fetched ${requests.length} pending registration requests`);
      passed++;
    } else {
      console.error('  ❌ No registration requests found');
      failed++;
    }
  } catch (err: any) {
    console.error('  ❌ Error fetching registration requests:', err.message || err);
    failed++;
  }

  await disconnectDB();

  console.log(`\n📊 RESULTS: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

