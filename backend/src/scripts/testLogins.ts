import { connectDB, disconnectDB } from '../config/db';
import { AuthService } from '../modules/auth/auth.service';

async function testLogins() {
  await connectDB();
  const testUsers = [
    'dhambojhi_admin',
    'dhambojhi_principal',
    'dhambojhi_t_01',
    'dhambojhi_t_18',
    'dhambojhi_s_g01',
    'dhambojhi_s_g05',
    'dhambojhi_s_g10',
    'dhambojhi_s_g11s',
    'dhambojhi_s_g12m',
  ];
  console.log('🧪 Testing Authentication for Key Dhambojhi Roles & Student Accounts:');
  for (const u of testUsers) {
    try {
      const res = await AuthService.login(u, 'DemoPass123!');
      console.log(`  ✅ SUCCESS: ${u.padEnd(20)} | Role: ${res.user.role.padEnd(14)} | Name: ${res.user.fullName}`);
    } catch (e: any) {
      console.error(`  ❌ FAILED:  ${u.padEnd(20)} | Error: ${e.message}`);
    }
  }
  await disconnectDB();
}

testLogins();
