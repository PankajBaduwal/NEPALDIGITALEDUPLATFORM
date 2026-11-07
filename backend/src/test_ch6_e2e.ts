async function runChapter6E2E() {
  console.log('=== STARTING CHAPTER 6: TEN (दश) E2E VERIFICATION ===');
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

  // 2. Fetch hierarchy and verify Chapter 6
  console.log('\n2. Verifying Centralized Library Hierarchy for Class 1 Mathematics Chapter 6...');
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

  const ch6 = math.chapters.find((c: any) => c.chapterNumber === 6);
  if (!ch6) {
    throw new Error('Chapter 6 not found in Class 1 Mathematics!');
  }

  console.log(`✅ Found Chapter 6: "${ch6.title}" / "${ch6.titleNepali}"`);
  console.log(`✅ Simulation count for Chapter 6: ${ch6.simulationCount}`);
  if (ch6.simulationCount !== 5) {
    throw new Error(`Expected simulationCount 5, but got ${ch6.simulationCount}`);
  }

  // 3. Query Simulations List for Chapter 6
  console.log('\n3. Fetching Simulations for Grade 1, Chapter 6...');
  const simListRes = await fetch(
    `${baseUrl}/simulation-activity/simulations?gradeLevel=1&subjectCode=MATH&chapterNumber=6`,
    { headers: authHeaders }
  );

  if (!simListRes.ok) {
    throw new Error(`Simulations list failed: ${simListRes.status}`);
  }

  const simListData: any = await simListRes.json();
  const sims = simListData.data || [];
  console.log(`✅ Total simulations returned: ${sims.length}`);

  const expectedSims = [
    { code: 'SIM-MATH-G1-CH6-01', key: 'class1-math-ch6-ten-objects' },
    { code: 'SIM-MATH-G1-CH6-02', key: 'class1-math-ch6-discovery' },
    { code: 'SIM-MATH-G1-CH6-03', key: 'class1-math-ch6-make-ten' },
    { code: 'SIM-MATH-G1-CH6-04', key: 'class1-math-ch6-count-match' },
    { code: 'SIM-MATH-G1-CH6-05', key: 'class1-math-ch6-writing' },
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

  // 4. Test Progress Tracking API for all 5 Chapter 6 simulations
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
            chapter: 6,
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

  console.log('\n=== ALL CHAPTER 6 TESTS PASSED SUCCESSFULLY! ===');
}

runChapter6E2E().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});

