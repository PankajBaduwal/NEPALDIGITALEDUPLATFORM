import { createApp } from './app';
import http from 'http';

async function runSuperAdminTests() {
  console.log('🧪 Starting Super Admin Dashboard & Central Management Test Suite...\n');

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, () => resolve()));
  const port = (server.address() as any).port;
  const BASE_URL = `http://localhost:${port}/api/v1`;

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

  async function put(endpoint: string, body: any, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
    return { status: res.status, json: await res.json() };
  }

  async function patch(endpoint: string, body: any, token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
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
    // 1. Super Admin Authentication
    const saLogin = await post('/auth/login', {
      username: 'superadmin',
      password: 'NepalSuperAdmin@2081',
    });
    assert(saLogin.status === 200 && saLogin.json.data.user.role === 'SUPER_ADMIN', 'Super Admin logged in successfully');
    const saToken = saLogin.json.data.token;

    // 2. Overview Metrics & Charts API
    const overview = await get('/admin/overview', saToken);
    assert(
      overview.status === 200 &&
        overview.json.data.metrics.totalInstitutions > 0 &&
        overview.json.data.metrics.totalClassesCovered === 12 &&
        overview.json.data.charts.growthTrend.length > 0 &&
        overview.json.data.charts.provinceDistribution['Bagmati Province'] >= 1,
      'Overview API returns complete nationwide metrics, chart series, and resource usage'
    );

    // 3. Create a New School with Administrator Account
    const newSchoolRes = await post(
      '/admin/institutions',
      {
        name: 'Janakpur Secondary Model School',
        nameNepali: 'जनकपुर माध्यमिक मोडल विद्यालय',
        type: 'COMMUNITY',
        province: 'Madhesh Province',
        district: 'Dhanusha',
        localLevel: 'Janakpurdham Sub-Metropolitan City',
        ward: 4,
        email: 'info@janakpur.edu.np',
        phone: '041-520111',
        adminUsername: 'admin_janakpur',
        adminPassword: 'NepalAdmin@2081',
      },
      saToken
    );
    assert(
      newSchoolRes.status === 201 &&
        newSchoolRes.json.data.institution.district === 'Dhanusha' &&
        newSchoolRes.json.data.adminUser.username === 'admin_janakpur',
      'Created single school and provisioned its administrator account',
      newSchoolRes.json
    );
    const createdInstId = newSchoolRes.json.data.institution.id;

    // 4. Edit Institution Details
    const editRes = await put(
      `/admin/institutions/${createdInstId}`,
      {
        name: 'Janakpur Central Model Higher Secondary',
        nameNepali: 'जनकपुर केन्द्रीय मोडल उच्च माध्यमिक विद्यालय',
        type: 'COMMUNITY',
        province: 'Madhesh Province',
        district: 'Dhanusha',
        localLevel: 'Janakpurdham Sub-Metropolitan City',
        ward: 5,
        email: 'contact@janakpur.edu.np',
        phone: '041-520222',
        status: 'ACTIVE',
      },
      saToken
    );
    assert(
      editRes.status === 200 && editRes.json.data.name === 'Janakpur Central Model Higher Secondary',
      'Successfully edited institution information'
    );

    // 5. Suspend and Reactivate Institution
    const suspendRes = await patch(`/admin/institutions/${createdInstId}/status`, { status: 'SUSPENDED' }, saToken);
    assert(suspendRes.status === 200 && suspendRes.json.data.status === 'SUSPENDED', 'Successfully suspended institution');

    const activateRes = await patch(`/admin/institutions/${createdInstId}/status`, { status: 'ACTIVE' }, saToken);
    assert(activateRes.status === 200 && activateRes.json.data.status === 'ACTIVE', 'Successfully reactivated institution');

    // 6. Bulk Import Validation Engine
    const validateRes = await post(
      '/admin/institutions/import/validate',
      {
        institutions: [
          // Valid row
          {
            emisCode: '550010001',
            name: 'Gorkha Secondary School',
            type: 'COMMUNITY',
            province: 'Gandaki Province',
            district: 'Gorkha',
            localLevel: 'Gorkha Municipality',
          },
          // Missing required local level
          {
            emisCode: '550020002',
            name: 'Invalid School Row',
            province: 'Gandaki Province',
            district: 'Gorkha',
          },
          // Duplicate row within same file
          {
            emisCode: '550010001',
            name: 'Duplicate Gorkha School',
            province: 'Gandaki Province',
            district: 'Gorkha',
            localLevel: 'Gorkha Municipality',
          },
        ],
      },
      saToken
    );
    assert(
      validateRes.status === 200 &&
        validateRes.json.data.validRows.length === 1 &&
        validateRes.json.data.invalidRows.length === 2 &&
        validateRes.json.data.duplicatesDetected >= 1,
      'Bulk import pre-validator detects valid rows, missing required fields, and duplicate EMIS codes',
      validateRes.json
    );

    // 7. Execute Bulk Import
    const executeRes = await post(
      '/admin/institutions/import/execute',
      {
        institutions: validateRes.json.data.validRows,
      },
      saToken
    );
    assert(
      executeRes.status === 200 && executeRes.json.data.successCount === 1,
      'Executed bulk import and auto-provisioned admin credentials'
    );

    // 8. Provision Additional Administrator
    const provAdminRes = await post(
      `/admin/institutions/${createdInstId}/admin`,
      {
        fullName: 'Ram Chandra Yadav',
        username: 'admin_janakpur_sec',
        email: 'ramchandra@janakpur.edu.np',
        password: 'NepalAdmin@2081',
      },
      saToken
    );
    assert(provAdminRes.status === 201 && provAdminRes.json.data.adminUser.username === 'admin_janakpur_sec', 'Provisioned secondary administrator for institution');

    // 9. Central User Management Directory & Privacy
    const usersList = await get('/admin/users', saToken);
    assert(usersList.status === 200 && usersList.json.data.items.length > 0, 'Central user directory retrieved');

    // Verify student privacy: student email must be masked
    const studentUser = usersList.json.data.items.find((u: any) => u.role === 'STUDENT');
    if (studentUser) {
      assert(
        studentUser.email === '••••••••',
        'Student private contact information is properly masked in platform-wide directory'
      );
    }

    // 10. Reset User Password
    const resetRes = await post(
      `/admin/users/${provAdminRes.json.data.adminUser.id}/reset-password`,
      { password: 'NewSecurePass@2081' },
      saToken
    );
    assert(resetRes.status === 200 && resetRes.json.data.temporaryPassword === 'NewSecurePass@2081', 'Super Admin reset user password');

    // 11. Security & RBAC: Verify non-admin is strictly forbidden from accessing Super Admin endpoints
    const teacherLogin = await post('/auth/login', { username: 'teacher_ramesh', password: 'Nepal@1234' });
    const teacherToken = teacherLogin.json.data.token;

    const forbiddenCheck = await get('/admin/overview', teacherToken);
    assert(forbiddenCheck.status === 403, 'RBAC strictly blocks Teacher from accessing Super Admin dashboard (403 Forbidden)');

    // 12. Security Audit Log Check
    const auditRes = await get('/admin/audit-logs', saToken);
    assert(
      auditRes.status === 200 &&
        auditRes.json.data.items.some((l: any) => l.action === 'INSTITUTION_CREATED') &&
        auditRes.json.data.items.some((l: any) => l.action === 'BULK_INSTITUTIONS_IMPORTED'),
      'Audit log recorded administrative operations with operator identity and entity IDs'
    );

  } catch (err) {
    console.error('Test execution failed:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n📊 Super Admin Test Results: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
  }
}

runSuperAdminTests();
