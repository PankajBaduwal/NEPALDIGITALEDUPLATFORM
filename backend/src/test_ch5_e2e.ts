async function runChapter5E2E() {
  console.log('=== STARTING CHAPTER 5: ZERO (शून्य) E2E VERIFICATION ===');
  const baseUrl = 'http://localhost:5000/api/v1';

  // 1. Authenticate as teacher
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
  console.log('✅ Authentication successful! Token received.');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Fetch hierarchy and verify Chapter 5
  console.log('\n2. Verifying Centralized Library Hierarchy for Class 1 Mathematics Chapter 5...');
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

  const ch5 = math.chapters.find((c: any) => c.chapterNumber === 5);
  if (!ch5) {
    throw new Error('Chapter 5 not found in Class 1 Mathematics!');
  }

  console.log(`✅ Found Chapter 5: "${ch5.title}" / "${ch5.titleNepali}"`);
  console.log(`✅ Simulation count for Chapter 5: ${ch5.simulationCount}`);
  if (ch5.simulationCount !== 5) {
    throw new Error(`Expected simulationCount 5, but got ${ch5.simulationCount}`);
  }

  // 3. Query Simulations List for Chapter 5
  console.log('\n3. Fetching Simulations for Grade 1, Chapter 5...');
  const simListRes = await fetch(
    `${baseUrl}/simulation-activity/simulations?gradeLevel=1&subjectCode=MATH&chapterNumber=5`,
    { headers: authHeaders }
  );

  if (!simListRes.ok) {
    throw new Error(`Simulations list failed: ${simListRes.status}`);
  }

  const simListData: any = await simListRes.json();
  const sims = simListData.data || [];
  console.log(`✅ Total simulations returned: ${sims.length}`);

  const expectedSims = [
    { code: 'SIM-MATH-G1-CH5-01', key: 'class1-math-ch5-playground' },
    { code: 'SIM-MATH-G1-CH5-02', key: 'class1-math-ch5-empty-basket' },
    { code: 'SIM-MATH-G1-CH5-03', key: 'class1-math-ch5-where-did-it-go' },
    { code: 'SIM-MATH-G1-CH5-04', key: 'class1-math-ch5-count-village' },
    { code: 'SIM-MATH-G1-CH5-05', key: 'class1-math-ch5-zero-challenge' },
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

  // 4. Test Progress Tracking for all 5 Chapter 5 simulations
  console.log('\n4. Testing Progress Tracking API for all 5 simulations...');
  for (const expected of expectedSims) {
    const progressRes = await fetch(
      `${baseUrl}/simulation-activity/simulations/${expected.code}/progress`,
      {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          score: 100,
          completionStatus: 'COMPLETED',
          timeSpentSeconds: 150,
          attemptsCount: 1,
          metadata: {
            testRun: true,
            chapter: 5,
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
    console.log(`  [OK] Progress recorded for ${expected.code}: status 200, success = true`);
  }

  console.log('\n=== ALL CHAPTER 5 TESTS PASSED SUCCESSFULLY! ===');
}

runChapter5E2E().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});

