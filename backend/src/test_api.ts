import { createApp } from './app';
import http from 'http';

async function runTests() {
  console.log('🧪 Starting API Verification & Multi-Tenant RBAC Test Suite...\n');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(5001, () => resolve()));
  const BASE_URL = 'http://localhost:5001/api/v1';

  async function post(endpoint: string, body: any, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    return { status: res.status, json: await res.json() };
  }

  async function get(endpoint: string, token?: string) {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    return { status: res.status, json: await res.json() };
  }

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`, detail || '');
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await get('/../../health');
    assert(health.status === 200 && health.json.status === 'UP', 'Health check returns UP');

    // 2. Super Admin Login
    const saLogin = await post('/auth/login', {
      username: 'superadmin',
      password: 'NepalSuperAdmin@2081',
    });
    assert(saLogin.status === 200 && saLogin.json.data.user.role === 'SUPER_ADMIN', 'Super Admin Login successful');
    const saToken = saLogin.json.data.token;

    // 3. Super Admin Bulk Onboarding Institutions (CSV format via JSON array)
    const bulkImportRes = await post(
      '/institutions/bulk-import',
      {
        institutions: [
          {
            emisCode: '480020002',
            name: 'Pokhara Public Secondary School',
            nameNepali: 'पोखरा पब्लिक माध्यमिक विद्यालय',
            type: 'COMMUNITY',
            province: 'Gandaki Province',
            district: 'Kaski',
            localLevel: 'Pokhara Metropolitan City',
            ward: 8,
            email: 'info@ppss.edu.np',
            phone: '061-552233',
          },
          {
            emisCode: '120030003',
            name: 'Biratnagar Adarsha Higher Secondary',
            nameNepali: 'विराटनगर आदर्श उच्च माध्यमिक विद्यालय',
            type: 'INSTITUTIONAL',
            province: 'Koshi Province',
            district: 'Morang',
            localLevel: 'Biratnagar Metropolitan City',
            ward: 3,
            email: 'admin@adarsha.edu.np',
          },
        ],
      },
      saToken
    );
    assert(
      bulkImportRes.status === 200 && bulkImportRes.json.data.successCount === 2,
      'Super Admin bulk imports schools & provisions admin accounts',
      bulkImportRes.json
    );

    // 4. Super Admin lists institutions
    const instList = await get('/institutions', saToken);
    assert(instList.status === 200 && instList.json.data.items.length >= 3, 'Institutions list retrieved with pagination');

    // 5. Teacher (Ramesh) Login
    const teacherLogin = await post('/auth/login', {
      username: 'teacher_ramesh',
      password: 'Nepal@1234',
    });
    assert(teacherLogin.status === 200 && teacherLogin.json.data.user.role === 'TEACHER', 'Teacher Ramesh Login successful');
    const teacherToken = teacherLogin.json.data.token;

    // 6. Teacher allocates Smart Board session
    const sbSession = await post(
      '/auth/smartboard-session',
      {
        subjectId: 'MATH-10',
      },
      teacherToken
    );
    assert(sbSession.status === 200 && !!sbSession.json.data.token, 'Teacher generated single-click Smart Board session token');

    // 7. Smart Board Bridge context hydration (mimicking smartboard/modules/rbac/rbac-bridge.js)
    const sbContext = await get('/academic/subjects/MATH-10/smartboard-context', teacherToken);
    assert(
      sbContext.status === 200 &&
        sbContext.json.data.subject === 'Compulsory Mathematics' &&
        sbContext.json.data.units.length > 0 &&
        sbContext.json.data.pdfUrl.includes('/pdf'),
      'Smart Board Bridge /smartboard-context successfully returns subject metadata, CDC chapters & textbook PDF stream URL',
      sbContext.json
    );

    // 8. Smart Board Share Notes to Section
    // First get teacher allocations to find sectionId
    const allocations = await get('/academic/my-allocations', teacherToken);
    assert(allocations.status === 200 && allocations.json.data.length > 0, 'Teacher retrieved assigned subject allocations');
    const sectionId = allocations.json.data[0].sectionId;

    const shareNotesRes = await post(
      '/academic/smartboard/share-notes',
      {
        sectionId,
        subjectId: 'MATH-10',
        title: 'Sets & Venn Diagrams - Class Notes',
        notesPdf: 'data:application/pdf;base64,JVBERi0xLjQK...',
        pageCount: 3,
      },
      teacherToken
    );
    assert(shareNotesRes.status === 200 && shareNotesRes.json.data.title === 'Sets & Venn Diagrams - Class Notes', 'Teacher pushed live Smart Board notes to enrolled students');

    // 9. Smart Board AI Copilot Query (mimicking smartboard/tools/ai-assistant.js)
    const aiQueryDevanagari = await post(
      '/ai/query',
      {
        subjectId: 'MATH-10',
        chapter: 1,
        question: 'समूह (Sets) को गणनात्मकता भनेको के हो?',
      },
      teacherToken
    );
    assert(
      aiQueryDevanagari.status === 200 &&
        aiQueryDevanagari.json.data.courseMaterialStatus === 'FOUND' &&
        aiQueryDevanagari.json.data.citations.length > 0,
      'Smart Board AI Copilot answers in Devanagari with CDC textbook citations'
    );

    // 10. Subscription Entitlement verification (mimicking smartboard/components/access-guard.js)
    const entitlementsRes = await get('/simulations/entitlements', teacherToken);
    assert(
      entitlementsRes.status === 200 &&
        entitlementsRes.json.data.bands.includes('GRADES_9_12'),
      'Smart Board access-guard receives entitled bands (GRADES_9_12)'
    );

    // 11. RBAC Guard: Student attempting to publish results is forbidden
    const studentLogin = await post('/auth/login', {
      username: 'student_aarav',
      password: 'Nepal@1234',
    });
    const studentToken = studentLogin.json.data.token;

    const forbiddenAttempt = await post('/academic/years', { name: 'Unauthorized Year' }, studentToken);
    assert(forbiddenAttempt.status === 403, 'RBAC correctly blocks Student from performing administrative actions (403 Forbidden)');

  } catch (err) {
    console.error('Test execution crashed:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n📊 Test Results: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
  }
}

runTests();

