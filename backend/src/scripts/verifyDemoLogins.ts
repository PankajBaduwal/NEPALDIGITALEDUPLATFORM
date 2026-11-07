async function testDemoLogins() {
  const roles = [
    'SUPER_ADMIN',
    'SCHOOL_ADMIN',
    'COLLEGE_ADMIN',
    'PRINCIPAL',
    'TEACHER',
    'CLASS_TEACHER',
    'STUDENT',
  ];

  console.log('--- TESTING ALL 7 DEMO LOGIN ROLES ---');
  for (const role of roles) {
    try {
      const res = await fetch('http://localhost:5000/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const json: any = await res.json();
      const payload = json.data || json;
      if (!res.ok) {
        console.error(`❌ [${role}] Failed with HTTP ${res.status}:`, json);
      } else {
        console.log(`✅ [${role}] -> User: ${payload.user?.username} | Role: ${payload.user?.role} | Institution: "${payload.user?.institutionName}" | Token: ${payload.token ? 'Present (' + payload.token.substring(0, 15) + '...)' : 'MISSING'}`);
      }
    } catch (err: any) {
      console.error(`❌ [${role}] -> Network error:`, err.message);
    }
  }
}

testDemoLogins();
