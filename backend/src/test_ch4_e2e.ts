
async function runE2ETests() {
  console.log('=== STARTING CHAPTER 4 E2E VERIFICATION ===');
  const baseUrl = 'http://localhost:5000/api/v1';

  // 1. Login as teacher
  console.log('\n1. Authenticating as teacher_sita...');
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'teacher_sita',
      password: 'Nepal@1234',
    }),
  });

  if (!loginRes.ok) {
    throw new Error(`Login failed with status: ${loginRes.status}`);
  }

  const loginData: any = await loginRes.json();
  const token = loginData.data?.token || loginData.token;
  console.log('Authentication successful! Token received.');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Fetch hierarchy and check Grade 1, Math, Chapter 4
  console.log('\n2. Verifying Hierarchy API for Grade 1 Mathematics Chapter 4...');
  const hierRes = await fetch(`${baseUrl}/simulation-activity/hierarchy`, {
    headers: authHeaders,
  });

  if (!hierRes.ok) {
    throw new Error(`Hierarchy request failed: ${hierRes.status}`);
  }

  const hierData: any = await hierRes.json();
  const class1 = hierData.data.classes.find((c: any) => c.grade === 1);
  if (!class1) {
    throw new Error('Class 1 not found in hierarchy!');
  }

  const math = class1.subjects.find((s: any) => s.code === 'MATH');
  if (!math) {
    throw new Error('Mathematics not found in Class 1!');
  }

  const ch4 = math.chapters.find((c: any) => c.chapterNumber === 4);
  if (!ch4) {
    throw new Error('Chapter 4 not found in Class 1 Mathematics!');
  }

  console.log(`Found Chapter 4: "${ch4.title}" / "${ch4.titleNepali}"`);
  console.log(`Simulation count for Chapter 4: ${ch4.simulationCount}`);
  if (ch4.simulationCount !== 5) {
    throw new Error(`Expected simulationCount 5, but got ${ch4.simulationCount}`);
  }

  // 3. Query Simulations List for Chapter 4
  console.log('\n3. Fetching Simulations for Grade 1, Chapter 4...');
  const simListRes = await fetch(
    `${baseUrl}/simulation-activity/simulations?gradeLevel=1&subjectCode=MATH&chapterNumber=4`,
    { headers: authHeaders }
  );

  if (!simListRes.ok) {
    throw new Error(`Simulations list failed: ${simListRes.status}`);
  }

  const simListData: any = await simListRes.json();
  const sims = simListData.data || [];
  console.log(`Total simulations returned: ${sims.length}`);

  const expectedSims = [
    { code: 'SIM-MATH-G1-CH4-01', key: 'class1-math-ch4-many-few' },
    { code: 'SIM-MATH-G1-CH4-02', key: 'class1-math-ch4-garden' },
    { code: 'SIM-MATH-G1-CH4-03', key: 'class1-math-ch4-matching' },
    { code: 'SIM-MATH-G1-CH4-04', key: 'class1-math-ch4-tracing' },
    { code: 'SIM-MATH-G1-CH4-05', key: 'class1-math-ch4-sequence' },
  ];

  for (const expected of expectedSims) {
    const found = sims.find((s: any) => s.code === expected.code);
    if (!found) {
      throw new Error(`Missing simulation code: ${expected.code}`);
    }
    if (found.componentKey !== expected.key) {
      throw new Error(`Mismatch componentKey for ${expected.code}: expected ${expected.key}, got ${found.componentKey}`);
    }
    console.log(`  [OK] ${found.code}: "${found.title}" (${found.componentKey})`);
  }

  // 4. Test Progress Tracking for all 5 simulations
  console.log('\n4. Testing Progress Tracking API for all 5 simulations...');
  for (const expected of expectedSims) {
    const progressRes = await fetch(
      `${baseUrl}/simulation-activity/simulations/${expected.code}/progress`,
      {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          score: 95,
          completionStatus: 'COMPLETED',
          timeSpentSeconds: 120,
          attemptsCount: 1,
          metadata: {
            testRun: true,
            timestamp: new Date().toISOString(),
          },
        }),
      }
    );

    if (!progressRes.ok) {
      throw new Error(`Progress update failed for ${expected.code}: ${progressRes.status}`);
    }

    const progressData: any = await progressRes.json();
    if (!progressData.success) {
      throw new Error(`Progress API returned success: false for ${expected.code}`);
    }
    console.log(`  [OK] Progress recorded for ${expected.code}: score = ${progressData.data.score}`);
  }

  console.log('\n=== ALL CHAPTER 4 TESTS PASSED SUCCESSFULLY! ===');
}

runE2ETests().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
