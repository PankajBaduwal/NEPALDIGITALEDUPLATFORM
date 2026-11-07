const API_BASE = 'http://localhost:5000/api/v1';

async function runTests() {
  console.log('================================================================');
  console.log('🇳🇵 NEPAL EDUCATION PLATFORM — BRAND, HOMEPAGE & AUTH FLOW TESTS');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  // 1. Verify Public Institutions API
  try {
    const res = await fetch(`${API_BASE}/auth/institutions`);
    const json: any = await res.json();
    const list = json.data;
    if (json.success && Array.isArray(list) && list.length > 0) {
      console.log(`✅ [1/5] Public institutions list loaded successfully (${list.length} schools/colleges available)`);
      const dhambojhi = list.find((i: any) => i.emisCode === '570010001');
      if (dhambojhi) {
        console.log(`   Found Dhambojhi Higher Secondary School: ${dhambojhi.name} (${dhambojhi.district})`);
      }
      passed++;
    } else {
      throw new Error('Institutions response invalid');
    }
  } catch (err: any) {
    console.error('❌ [1/5] Public institutions list test failed:', err.message);
    failed++;
  }

  // 2. Verify Super Admin Authentication
  try {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'SUPER_ADMIN' }),
    });
    const json: any = await res.json();
    if (json.success && json.data.token && json.data.user.role === 'SUPER_ADMIN') {
      console.log('✅ [2/5] Super Admin demo authentication succeeded (MoEST Central Admin Session)');
      passed++;
    } else {
      throw new Error('Super Admin session invalid');
    }
  } catch (err: any) {
    console.error('❌ [2/5] Super Admin authentication failed:', err.message);
    failed++;
  }

  // 3. Verify Institutional Role Logins (Principal, School Admin, Teacher, Student)
  const rolesToTest = ['PRINCIPAL', 'SCHOOL_ADMIN', 'TEACHER', 'STUDENT'];
  let rolePasses = 0;
  for (const r of rolesToTest) {
    try {
      const res = await fetch(`${API_BASE}/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: r }),
      });
      const json: any = await res.json();
      if (json.success && json.data.token) {
        rolePasses++;
      }
    } catch (err: any) {
      console.error(`   Failed demo login for role ${r}:`, err.message);
    }
  }
  if (rolePasses === rolesToTest.length) {
    console.log(`✅ [3/5] Institutional multi-role authentication succeeded for all 4 roles (${rolesToTest.join(', ')})`);
    passed++;
  } else {
    console.error(`❌ [3/5] Institutional multi-role authentication failed (${rolePasses}/${rolesToTest.length})`);
    failed++;
  }

  // 4. Verify 3-Step Institution Registration Submission
  const testEmis = `99${Date.now().toString().slice(-7)}`;
  let generatedTrackingCode = '';
  try {
    const regPayload = {
      institutionName: 'Janakpur Adarsh Secondary School',
      nameNepali: 'जनकपुर आदर्श माध्यमिक विद्यालय',
      emisCode: testEmis,
      province: 'Madhesh Province',
      district: 'Dhanusha',
      localLevel: 'Janakpurdham Sub-Metropolitan City',
      institutionType: 'COMMUNITY',
      institutionKind: 'SCHOOL',
      category: 'COMMUNITY',
      mediumOfInstruction: 'BOTH',
      contactPerson: 'Bikash Kumar Jha',
      designation: 'Principal',
      email: `principal.${testEmis}@janakpur.edu.np`,
      phone: '9844012345',
      adminFullName: 'Bikash Kumar Jha',
      adminUsername: `admin_${testEmis}`,
      adminPassword: 'Password@123',
      adminEmail: `admin.${testEmis}@janakpur.edu.np`,
      adminPhone: '9844012345',
      academicYear: '2083',
      educationLevels: ['BASIC_1_5', 'BASIC_6_8', 'SECONDARY_9_10', 'HIGHER_SECONDARY_11_12'],
      requestedPackages: ['PACKAGE_3_SECONDARY'],
    };

    const res = await fetch(`${API_BASE}/auth/register-institution`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload),
    });
    const regRes: any = await res.json();
    if (regRes.success && regRes.data.requestCode) {
      generatedTrackingCode = regRes.data.requestCode;
      console.log(`✅ [4/5] 3-Step Institution Self-Registration succeeded! Generated Code: ${generatedTrackingCode}`);
      passed++;
    } else {
      throw new Error(regRes.message || 'Registration payload failed');
    }
  } catch (err: any) {
    console.error('❌ [4/5] Institution self-registration failed:', err.message);
    failed++;
  }

  // 5. Verify Registration Status Tracking
  if (generatedTrackingCode) {
    try {
      const res = await fetch(`${API_BASE}/auth/institution-registration-status/${generatedTrackingCode}`);
      const statusRes: any = await res.json();
      if (statusRes.success && (statusRes.data.status === 'SUBMITTED' || statusRes.data.status === 'PENDING')) {
        console.log(`✅ [5/5] Application tracking succeeded: Status is ${statusRes.data.status} for ${statusRes.data.institutionName}`);
        passed++;
      } else {
        throw new Error('Tracking status failed');
      }
    } catch (err: any) {
      console.error('❌ [5/5] Application status tracking failed:', err.message);
      failed++;
    }
  } else {
    failed++;
  }

  console.log('================================================================');
  console.log(`📊 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
  process.exit(0);
}

runTests();
