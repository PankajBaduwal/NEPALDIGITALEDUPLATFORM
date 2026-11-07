async function runChapter8E2E() {
  console.log('=== STARTING CHAPTER 8: SUBTRACTION UP TO 10 (१० सम्मका सङ्ख्याहरूको घटाउ) E2E VERIFICATION ===');
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

  // 2. Fetch hierarchy and verify Chapter 8
  console.log('\n2. Verifying Centralized Library Hierarchy for Class 1 Mathematics Chapter 8...');
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

  const ch8 = math.chapters.find((c: any) => c.chapterNumber === 8);
  if (!ch8) {
    throw new Error('Chapter 8 not found in Class 1 Mathematics!');
  }

  console.log(`✅ Found Chapter 8: "${ch8.title}" / "${ch8.titleNepali}"`);
  console.log(`✅ Simulation count for Chapter 8: ${ch8.simulationCount}`);
  if (ch8.simulationCount !== 5) {
    throw new Error(`Expected simulationCount 5, but got ${ch8.simulationCount}`);
  }

  // 3. Fetch simulations for Grade 1 Chapter 8
  console.log('\n3. Fetching Simulations for Grade 1, Chapter 8...');
  const simsRes = await fetch(
    `${baseUrl}/simulation-activity/simulations?gradeLevel=1&subjectCode=MATH&chapterNumber=8`,
    { headers: authHeaders }
  );

  if (!simsRes.ok) {
    throw new Error(`Failed to fetch simulations: ${simsRes.status}`);
  }

  const simsData: any = await simsRes.json();
  const simsList = simsData.data?.simulations || simsData.data || [];
  console.log(`✅ Total simulations returned: ${simsList.length}`);

  const expectedCodes = [
    'SIM-MATH-G1-CH8-01',
    'SIM-MATH-G1-CH8-02',
    'SIM-MATH-G1-CH8-03',
    'SIM-MATH-G1-CH8-04',
    'SIM-MATH-G1-CH8-05',
  ];

  for (const expCode of expectedCodes) {
    const found = simsList.find((s: any) => s.code === expCode);
    if (!found) {
      throw new Error(`Missing expected simulation: ${expCode}`);
    }
    console.log(`  [OK] ${found.code}: "${found.title}" (${found.componentKey})`);
  }

  // 4. Test Progress Tracking Endpoint for each simulation
  console.log('\n4. Testing Progress Tracking API for all 5 simulations...');
  for (const code of expectedCodes) {
    const progressRes = await fetch(
      `${baseUrl}/simulation-activity/simulations/${code}/progress`,
      {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          timeSpentSeconds: 100,
          completed: true,
          score: 100,
          metrics: { testVerify: true, chapter: 8 },
        }),
      }
    );

    if (!progressRes.ok) {
      throw new Error(`Progress tracking failed for ${code}: ${progressRes.status}`);
    }
    const progData: any = await progressRes.json();
    console.log(`  [OK] Progress recorded for ${code}: status ${progressRes.status}, success = ${progData.success}`);
  }

  console.log('\n=== CHAPTER 8 VERIFICATION COMPLETED SUCCESSFULLY ===');
}

runChapter8E2E().catch((err) => {
  console.error('❌ Chapter 8 E2E Verification Failed:', err);
  process.exit(1);
});

