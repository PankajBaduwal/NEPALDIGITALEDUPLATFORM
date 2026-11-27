import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';

async function testSimApi() {
  console.log('=== TEST SIMULATION API INTEGRATION ===\n');

  // 1. Authenticate as student
  console.log('1. Authenticating as Student (dhambojhi_s_g10)...');
  const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
    username: 'dhambojhi_s_g10',
    password: 'DemoPass123!',
  });
  const token = loginRes.data.data.accessToken || loginRes.data.data.token || loginRes.data.token;
  console.log('✓ Logged in successfully. Token received.');

  const headers = { Authorization: `Bearer ${token}` };

  // 2. Fetch hierarchy
  console.log('\n2. Testing GET /simulation-activity/hierarchy...');
  const hRes = await axios.get(`${BASE_URL}/simulation-activity/hierarchy`, { headers });
  const hierarchy = hRes.data.data;
  console.log(`✓ Hierarchy response success: ${hRes.data.success}`);
  console.log(`  Classes returned: ${hierarchy.classes?.length}`);

  for (let g = 1; g <= 10; g++) {
    const c = hierarchy.classes?.find((cl: any) => cl.grade === g);
    const mathSub = c?.subjects?.find((s: any) => s.code === 'MATH');
    const optMathSub = c?.subjects?.find((s: any) => s.code === 'OPTMATH');
    const mathCount = mathSub ? mathSub.simulationCount : 0;
    const optCount = optMathSub ? optMathSub.simulationCount : 0;
    console.log(`  Grade ${g.toString().padStart(2, ' ')}: MATH = ${mathCount} sims${optCount ? `, OPTMATH = ${optCount} sims` : ''}`);
  }

  // 3. Test filter queries for simulations
  console.log('\n3. Testing GET /simulation-activity/simulations with subject & grade filters:');
  const testQueries = [
    { grade: 1, subject: 'MATH', expectedMin: 60 },
    { grade: 7, subject: 'MATH', expectedMin: 70 },
    { grade: 8, subject: 'MATH', expectedMin: 60 },
    { grade: 9, subject: 'MATH', expectedMin: 55 },
    { grade: 9, subject: 'OPTMATH', expectedMin: 15 },
    { grade: 10, subject: 'MATH', expectedMin: 15 },
  ];

  for (const q of testQueries) {
    const res = await axios.get(`${BASE_URL}/simulation-activity/simulations?grade=${q.grade}&subjectCode=${q.subject}`, { headers });
    const count = res.data.data?.length || 0;
    const pass = count >= q.expectedMin;
    console.log(`  [G${q.grade} ${q.subject}] -> Count: ${count} (Expected >= ${q.expectedMin}) ${pass ? '✅ PASS' : '❌ FAIL'}`);
  }

  // 4. Test Progress Tracking
  console.log('\n4. Testing Simulation Progress Recording & Retrieval:');
  const testSimCode = 'SIM-MATH-G10-U1-01';
  const saveRes = await axios.post(
    `${BASE_URL}/simulation-activity/simulations/${testSimCode}/progress`,
    {
      progressPercentage: 100,
      completed: true,
      score: 95,
      timeSpentSeconds: 420,
      interactionsCount: 18,
      conceptMasteryLevel: 'ADVANCED',
    },
    { headers }
  );
  console.log(`✓ Save Progress Response: success = ${saveRes.data.success}`);

  const getProgRes = await axios.get(
    `${BASE_URL}/simulation-activity/simulations/${testSimCode}/progress`,
    { headers }
  );
  console.log(`✓ Retrieve Single Progress:`, {
    code: getProgRes.data.data?.simulationCode,
    progress: getProgRes.data.data?.progressPercentage,
    score: getProgRes.data.data?.score,
    completed: getProgRes.data.data?.completed,
  });

  const allProgRes = await axios.get(
    `${BASE_URL}/simulation-activity/simulations/progress/my`,
    { headers }
  );
  console.log(`✓ Retrieve All User Progress: ${allProgRes.data.data?.length} simulations recorded.`);

  console.log('\n🎉 Simulation Backend API Integration Verification Complete!');
}

testSimApi().catch((e) => {
  console.error('API Test Error:', e.response?.data || e.message);
  process.exit(1);
});
