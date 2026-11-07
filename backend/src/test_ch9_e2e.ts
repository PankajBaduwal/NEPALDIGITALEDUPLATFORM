/**
 * test_ch9_e2e.ts
 * End-to-End Verification Test for Class 1 Mathematics Chapter 9
 * Numbers 11–20 (११ देखि २० सम्मका सङ्ख्याहरू)
 */

async function runChapter9E2E() {
  console.log('=== STARTING CHAPTER 9: NUMBERS 11–20 (११ देखि २० सम्मका सङ्ख्याहरू) E2E VERIFICATION ===');
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

  // 2. Fetch hierarchy and verify Chapter 9
  console.log('\n2. Verifying Centralized Library Hierarchy for Class 1 Mathematics Chapter 9...');
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

  const ch9 = math.chapters.find((c: any) => c.chapterNumber === 9);
  if (!ch9) {
    throw new Error('Chapter 9 not found in Class 1 Mathematics!');
  }

  console.log(`✅ Found Chapter 9: "${ch9.title}" / "${ch9.titleNepali}"`);
  console.log(`✅ Simulation count for Chapter 9: ${ch9.simulationCount}`);
  if (ch9.simulationCount !== 5) {
    throw new Error(`Expected simulationCount 5, but got ${ch9.simulationCount}`);
  }

  // 3. Fetch simulations for Grade 1 Chapter 9
  console.log('\n3. Fetching Simulations for Grade 1, Chapter 9...');
  const simsRes = await fetch(
    `${baseUrl}/simulation-activity/simulations?gradeLevel=1&subjectCode=MATH&chapterNumber=9`,
    { headers: authHeaders }
  );

  if (!simsRes.ok) {
    throw new Error(`Failed to fetch simulations: ${simsRes.status}`);
  }

  const simsData: any = await simsRes.json();
  const simsList = simsData.data?.simulations || simsData.data || [];
  console.log(`✅ Total simulations returned: ${simsList.length}`);

  const expectedCodes = [
    'SIM-MATH-G1-CH9-01',
    'SIM-MATH-G1-CH9-02',
    'SIM-MATH-G1-CH9-03',
    'SIM-MATH-G1-CH9-04',
    'SIM-MATH-G1-CH9-05',
  ];

  for (const expCode of expectedCodes) {
    const found = simsList.find((s: any) => s.code === expCode);
    if (!found) {
      throw new Error(`Missing expected simulation: ${expCode}`);
    }
    console.log(`  [OK] ${found.code}: "${found.title}" (${found.componentKey})`);
  }

  // 4. Test Progress Tracking API for all 5 simulations
  console.log('\n4. Testing Progress Tracking API for all 5 simulations...');
  for (const code of expectedCodes) {
    const progressRes = await fetch(
      `${baseUrl}/simulation-activity/simulations/${code}/progress`,
      {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          timeSpentSeconds: 150,
          metrics: {
            score: 10,
            starsAwarded: 3,
            completedAt: new Date().toISOString(),
          },
        }),
      }
    );

    if (!progressRes.ok) {
      throw new Error(`Progress recording failed for ${code}: ${progressRes.status}`);
    }

    const progressData: any = await progressRes.json();
    console.log(`  [OK] Progress recorded for ${code}: status=${progressRes.status}, data=${JSON.stringify(progressData.data?.metrics || {})}`);
  }

  // 5. Test Progress Retrieval API
  console.log('\n5. Verifying Progress Retrieval for SIM-MATH-G1-CH9-01...');
  const getProgressRes = await fetch(
    `${baseUrl}/simulation-activity/simulations/SIM-MATH-G1-CH9-01/progress`,
    { headers: authHeaders }
  );

  if (!getProgressRes.ok) {
    throw new Error(`Failed to retrieve progress: ${getProgressRes.status}`);
  }

  const retrievedProgress: any = await getProgressRes.json();
  console.log(`✅ Retrieved progress record: totalSessions=${retrievedProgress.data?.totalSessions || 1}`);

  console.log('\n================================================================');
  console.log('🎉 ALL CHAPTER 9 E2E VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('================================================================');
}

runChapter9E2E().catch((err) => {
  console.error('❌ E2E VERIFICATION FAILED:', err);
  process.exit(1);
});

