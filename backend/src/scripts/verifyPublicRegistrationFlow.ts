async function testPublicRegistration() {
  const emis = '45001' + Math.floor(1000 + Math.random() * 9000);
  console.log('Testing public registration with EMIS:', emis);

  const regRes = await fetch('http://localhost:5000/api/auth/register-institution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      institutionName: 'Pokhara Valley Secondary School',
      nameNepali: 'पोखरा उपत्यका माध्यमिक विद्यालय',
      emisCode: emis,
      institutionKind: 'SCHOOL',
      institutionType: 'COMMUNITY',
      province: 'Gandaki Province',
      district: 'Kaski',
      localLevel: 'Pokhara Metropolitan City',
      ward: 8,
      street: 'New Road, Pokhara',
      contactPerson: 'Khem Raj Adhikari',
      designation: 'Headmaster',
      email: `headmaster_${emis}@pokharaschool.edu.np`,
      phone: '9856012345',
      requestedPackages: ['PACKAGE_1_FOUNDATION', 'PACKAGE_2_MIDDLE', 'PACKAGE_3_SECONDARY'],
      estimatedStudents: 620,
      adminPassword: 'Password@2081',
      notes: 'Submitted via public school registration page for immediate CDC rollout.',
    }),
  });

  const regData: any = await regRes.json();
  console.log('Registration Response HTTP:', regRes.status, regData.data || regData);

  // Now verify as Super Admin that it immediately appears in overview
  const loginRes = await fetch('http://localhost:5000/api/auth/demo-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'SUPER_ADMIN' }),
  });
  const loginData: any = await loginRes.json();
  const token = loginData.data?.token || loginData.token;

  const overviewRes = await fetch('http://localhost:5000/api/admin/overview', {
    headers: { Authorization: 'Bearer ' + token },
  });
  const overviewData: any = await overviewRes.json();
  console.log('Pending requests in Super Admin overview now:', overviewData.data?.requests?.pending);
  console.log('Latest request in overview:', overviewData.data?.requests?.recent?.[0]?.institutionName);
}

testPublicRegistration();

