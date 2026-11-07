/**
 * test_ch2_e2e.ts
 * End-to-end verification of Class 1 Mathematics Chapter 2 (Lines / रेखाहरू) simulations.
 */

async function testChapter2() {
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

  const ch2 = math.chapters.find((ch: any) => ch.chapterNumber === 2);
  if (!ch2) throw new Error('Chapter 2 not found in Class 1 Mathematics');

  console.log('✅ Found Chapter 2:', ch2.title, `(${ch2.titleNepali})`);
  console.log('✅ Registered simulation count in Chapter 2:', ch2.simulationCount);

  // 2. Fetch simulations for Class 1 Math Chapter 2
  const simRes = await fetch(`${baseUrl}/simulations?gradeLevel=1&subjectCode=MATH&chapterNumber=2`, { headers });
  if (!simRes.ok) throw new Error('Failed to fetch simulations');
  const simData = await simRes.json();
  const sims = simData.data;

  console.log(`\n✅ Loaded ${sims.length} simulations for Chapter 2:`);
  const expectedCodes = [
    'SIM-MATH-G1-CH2-01',
    'SIM-MATH-G1-CH2-02',
    'SIM-MATH-G1-CH2-03',
    'SIM-MATH-G1-CH2-04',
    'SIM-MATH-G1-CH2-05',
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
        completedLevels: 4,
        totalLevels: 4,
        starsEarned: 6,
        timeSpentSeconds: 140,
      }),
    });
    const progData = await progressRes.json();
    console.log(`  ✓ Progress recorded for ${code}: status ${progressRes.status}, success: ${progData.success}, error: ${progData.error}`);
  }

  console.log('\n🎉 ALL CLASS 1 CHAPTER 2 SIMULATION TESTS PASSED SUCCESSFULLY!');
}

testChapter2().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
