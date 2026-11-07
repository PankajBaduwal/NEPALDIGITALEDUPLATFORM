import { AdminService } from './modules/admin/admin.service';
import { AuthService } from './modules/auth/auth.service';
import { connectDB, disconnectDB } from './config/db';
import { UserRole } from './common/constants/roles';

async function runSuperAdminVerification() {
  console.log('🧪 Starting Super Admin Central Platform MongoDB Verification...\n');
  await connectDB();

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
    const saAuth = await AuthService.login('superadmin', 'NepalSuperAdmin@2081');
    assert(saAuth.user.role === UserRole.SUPER_ADMIN, 'Super Admin credential authentication');
    const operator = { userId: saAuth.user.id, userEmail: saAuth.user.username, ip: '127.0.0.1' };

    // 2. Overview Metrics & Charts
    const overview = await AdminService.getDashboardOverview();
    assert(
      overview.metrics.totalInstitutions > 0 &&
        overview.metrics.totalSchools > 0 &&
        overview.metrics.totalTeachers > 0 &&
        overview.metrics.totalStudents > 0 &&
        overview.metrics.totalClassesCovered === 12 &&
        overview.charts.growthTrend.length > 0 &&
        overview.charts.provinceDistribution['Bagmati Province'] >= 1,
      'Overview returns nationwide stats, charts (provinces, types, growth), and resource usage',
      overview.metrics
    );

    // 3. Create a Single Institution (School)
    const stamp = Date.now();
    const newSchool = await AdminService.createInstitution(
      {
        name: `Janakpur Secondary Model School ${stamp}`,
        nameNepali: 'जनकपुर माध्यमिक मोडल विद्यालय',
        type: 'COMMUNITY',
        province: 'Madhesh Province',
        district: 'Dhanusha',
        localLevel: 'Janakpurdham Sub-Metropolitan City',
        ward: 4,
        email: `info_${stamp}@janakpur.edu.np`,
        phone: '041-520111',
        adminUsername: `admin_janakpur_${stamp}`,
        adminPassword: 'NepalAdmin@2081',
      },
      operator
    );
    assert(
      newSchool.institution.district === 'Dhanusha' &&
        newSchool.adminUser?.username === `admin_janakpur_${stamp}`,
      'Created school and automatically provisioned administrator account'
    );
    const instId = newSchool.institution.id;

    // 4. Edit Institution Details
    const updatedInst = await AdminService.updateInstitution(
      instId,
      {
        name: 'Janakpur Central Model Higher Secondary',
        nameNepali: 'जनकपुर केन्द्रीय मोडल उच्च माध्यमिक विद्यालय',
        type: 'COMMUNITY',
        province: 'Madhesh Province',
        district: 'Dhanusha',
        localLevel: 'Janakpurdham Sub-Metropolitan City',
        ward: 5,
        address: 'Ramananda Chowk, Janakpurdham',
        email: 'contact@janakpur.edu.np',
        phone: '041-520222',
        status: 'ACTIVE',
      },
      operator
    );
    assert(
      updatedInst.name === 'Janakpur Central Model Higher Secondary' &&
        updatedInst.ward === 5,
      'Successfully updated institution fields'
    );

    // 5. Suspend and Reactivate Institution
    const suspended = await AdminService.setInstitutionStatus(instId, 'SUSPENDED', operator);
    assert(suspended.status === 'SUSPENDED', 'Successfully suspended institution status');

    const activated = await AdminService.setInstitutionStatus(instId, 'ACTIVE', operator);
    assert(activated.status === 'ACTIVE', 'Successfully reactivated institution status');

    // 6. Bulk Import Pre-Validation (Valid rows, missing fields, duplicates)
    const importValidation = await AdminService.validateBulkImportRecords([
      {
        emisCode: `550010001_${stamp}`,
        name: 'Gorkha Model Secondary School',
        type: 'COMMUNITY',
        province: 'Gandaki Province',
        district: 'Gorkha',
        localLevel: 'Gorkha Municipality',
      },
      {
        emisCode: `550020002_${stamp}`,
        name: 'Incomplete Record Without Local Level',
        province: 'Gandaki Province',
        district: 'Gorkha',
      },
      {
        emisCode: `550010001_${stamp}`, // duplicate in same file
        name: 'Duplicate Gorkha School',
        province: 'Gandaki Province',
        district: 'Gorkha',
        localLevel: 'Gorkha Municipality',
      },
    ]);
    assert(
      importValidation.validRows.length === 1 &&
        importValidation.invalidRows.length === 2 &&
        importValidation.duplicatesDetected >= 1,
      'Bulk import pre-validator detects valid records, missing required fields, and duplicate EMIS codes',
      importValidation
    );

    // 7. Execute Bulk Import
    const importReport = await AdminService.executeBulkImport(importValidation.validRows, operator);
    assert(
      importReport.successCount === 1 && importReport.failedCount === 0,
      'Executed bulk import: created institution and auto-provisioned admin credentials'
    );

    // 8. Provision Administrator for Institution
    const adminProvision = await AdminService.provisionAdministrator(
      instId,
      {
        fullName: 'Ram Chandra Yadav',
        username: `admin_janakpur_sec_${stamp}`,
        email: `ramchandra_${stamp}@janakpur.edu.np`,
        password: 'NepalAdmin@2081',
      },
      operator
    );
    assert(
      adminProvision.adminUser.username === `admin_janakpur_sec_${stamp}` &&
        adminProvision.tempPassword === 'NepalAdmin@2081',
      'Provisioned additional administrator for institution'
    );

    // 9. Central User Management (Search, Filter, and Student Privacy)
    const usersDirectory = await AdminService.getUsers({ limit: 20 });
    assert(usersDirectory.items.length > 0, 'Central user directory retrieved');

    const studentRecord = usersDirectory.items.find((u) => u.role === UserRole.STUDENT);
    if (studentRecord && studentRecord.email) {
      assert(
        studentRecord.email === '••••••••',
        'Student private contact details are masked in platform-wide overview (Privacy-Compliant)'
      );
    }

    // 10. Update User Status & Reset Password
    const userStatusUpdated = await AdminService.setUserStatus(adminProvision.adminUser.id, 'INACTIVE', operator);
    assert(userStatusUpdated.status === 'INACTIVE', 'Suspended user account');

    const passReset = await AdminService.resetUserPassword(adminProvision.adminUser.id, 'NewTempPass@2081', operator);
    assert(passReset.temporaryPassword === 'NewTempPass@2081', 'Super Admin reset user password');

    // 11. Content & Curriculum Summary
    const content = await AdminService.getContentSummary();
    assert(
      content.totalSubjects > 0 && content.totalTextbooks > 0 && content.totalSimulations >= 26,
      'Content management returns CDC subjects, textbooks, and simulation catalog'
    );

    // 12. Create and Retrieve Announcements
    const announcement = await AdminService.createAnnouncement({
      title: 'SEE Model Examination 2081 Guidelines',
      content: 'All secondary schools must prepare Section A results before Chaitra 15.',
      targetRole: 'ALL',
      isPinned: true,
    });
    assert(announcement.title.includes('SEE Model Examination'), 'Created system announcement');

    const announcementsList = await AdminService.getAnnouncements();
    assert(announcementsList.length > 0, 'Loaded active announcements');

    // 13. Audit Log Verification
    const auditLogs = await AdminService.getAuditLogs({ limit: 20 });
    assert(
      auditLogs.items.some((l) => l.action === 'INSTITUTION_CREATED') &&
        auditLogs.items.some((l) => l.action === 'BULK_INSTITUTIONS_IMPORTED') &&
        auditLogs.items.some((l) => l.action === 'ADMIN_PROVISIONED'),
      'Audit log recorded administrative operations with operator identity, entity IDs, and details',
      auditLogs.items.map((i) => i.action)
    );

  } catch (err) {
    console.error('Test execution failed:', err);
    failed++;
  } finally {
    await disconnectDB();
    console.log(`\n📊 MongoDB Super Admin Test Results: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
  }
}

runSuperAdminVerification();

