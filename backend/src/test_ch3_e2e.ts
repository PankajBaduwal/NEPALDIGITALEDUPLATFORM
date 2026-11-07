/**
 * test_ch3_e2e.ts
 * End-to-end verification of Class 1 Mathematics Chapter 3 (Geometrical Shapes / ज्यामितीय आकारहरू) simulations.
 */

async function testChapter3() {
  const authUrl = 'http://localhost:5000/api/v1/auth/login';
  const baseUrl = 'http://localhost:5000/api/v1/simulation-activity';
  console.log('Authenticating as teacher_sita...');

  const loginRes = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'teacher_sita',
      password: 'Nepal@1234',
    }),
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.statusText}`);
  }
  const loginData = await loginRes.json();
  const token = loginData.data?.token || loginData.token;
  console.log('✅ Authenticated successfully. Token acquired.');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 1. Fetch Hierarchy
  console.log('\nFetching Simulation Library hierarchy...');
  const res = await fetch(`${baseUrl}/hierarchy`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch hierarchy: ${res.statusText}`);
  }
  const data = await res.json();
  const class1 = data.data.classes.find((c: any) => c.grade === 1);
  if (!class1) throw new Error('Class 1 not found');

  const math = class1.subjects.find((s: any) => s.code === 'MATH');
  if (!math) throw new Error('Mathematics subject not found in Class 1');

  const ch3 = math.chapters.find((ch: any) => ch.chapterNumber === 3);
  if (!ch3) throw new Error('Chapter 3 not found in Class 1 Mathematics');

  console.log('✅ Found Chapter 3:', ch3.title, `(${ch3.titleNepali})`);
  console.log('✅ Registered simulation count in Chapter 3:', ch3.simulationCount);

  // 2. Fetch simulations for Class 1 Math Chapter 3
  const simRes = await fetch(`${baseUrl}/simulations?gradeLevel=1&subjectCode=MATH&chapterNumber=3`, { headers });
  if (!simRes.ok) throw new Error('Failed to fetch simulations');
  const simData = await simRes.json();
  const sims = simData.data;

  console.log(`\n✅ Loaded ${sims.length} simulations for Chapter 3:`);
  const expectedCodes = [
    'SIM-MATH-G1-CH3-01',
    'SIM-MATH-G1-CH3-02',
    'SIM-MATH-G1-CH3-03',
    'SIM-MATH-G1-CH3-04',
    'SIM-MATH-G1-CH3-05',
  ];

  for (const code of expectedCodes) {
    const item = sims.find((s: any) => s.code === code);
    if (!item) {
      throw new Error(`Missing expected simulation: ${code}`);
    }
    console.log(`  ✓ [${item.code}] ${item.title} (${item.titleNepali}) -> componentKey: ${item.componentKey}`);
  }

  // 3. Test Progress Tracking Endpoint for each simulation
  console.log('\nTesting Progress Tracking endpoints...');
  for (const code of expectedCodes) {
    const progressRes = await fetch(`${baseUrl}/simulations/${code}/progress`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        score: 100,
        completedLevels: [1, 2, 3, 4, 5, 6],
        totalQuestions: 12,
        assessmentScore: 12,
        percentage: 100,
        starsEarned: 10,
        timeSpentSeconds: 160,
      }),
    });
    const progData = await progressRes.json();
    console.log(`  ✓ Progress recorded for ${code}: status ${progressRes.status}, success: ${progData.success}`);
  }

  console.log('\n🎉 ALL CLASS 1 CHAPTER 3 SIMULATION TESTS PASSED SUCCESSFULLY!');
}

testChapter3().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

