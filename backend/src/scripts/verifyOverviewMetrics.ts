async function run() {
  const loginRes = await fetch('http://localhost:5000/api/auth/demo-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'SUPER_ADMIN' }),
  });
  const loginData: any = await loginRes.json();
  const token = loginData.data?.token || loginData.token;

  const res = await fetch('http://localhost:5000/api/admin/overview', {
    headers: { Authorization: 'Bearer ' + token },
  });
  const json: any = await res.json();
  const d = json.data;

  console.log('=== REAL-TIME OVERVIEW METRICS ===');
  console.log('Institutions Total:', d.institutions?.total, 'Active:', d.institutions?.active);
  console.log('Teachers Provisioned:', d.users?.teachers);
  console.log('Students Enrolled:', d.users?.students);
  console.log('CDC Textbooks:', d.stats?.totalTextbooks);
  console.log('Colleges Count:', d.institutions?.colleges);
  console.log('Pending Requests:', d.requests?.pending);
  console.log('Recent Requests Count:', d.requests?.recent?.length);
  console.log('Recent Request Items:', d.requests?.recent?.map((r: any) => ({
    code: r.requestCode,
    name: r.institutionName,
    emis: r.emisCode,
    status: r.status,
  })));
}

run();

