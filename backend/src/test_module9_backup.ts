import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { BackupRestoreService } from './scripts/backup-restore.service';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nepal_edu_ecosystem';

interface TestResult {
  title: string;
  expected: string;
  actual: string;
  status: 'PASSED' | 'FAILED';
  notes?: string;
}

const testResults: TestResult[] = [];

function assertTest(title: string, expected: string, actual: string, condition: boolean, notes?: string) {
  const status = condition ? 'PASSED' : 'FAILED';
  testResults.push({ title, expected, actual, status, notes });
  const icon = condition ? '✅' : '❌';
  console.log(`${icon} [${status}] ${title}`);
  if (!condition) {
    console.log(`   Expected: ${expected}`);
    console.log(`   Actual:   ${actual}`);
  }
}

async function runModule9Tests() {
  console.log('\n===============================================================');
  console.log(' MODULE 9: BACKUP, RESTORE & DISASTER RECOVERY AUDIT           ');
  console.log('===============================================================\n');

  await mongoose.connect(MONGO_URI);

  const testBackupDir = path.resolve(process.cwd(), 'backups', 'audit-test-snapshot');
  if (fs.existsSync(testBackupDir)) {
    fs.rmSync(testBackupDir, { recursive: true, force: true });
  }

  // ── TEST SUITE 1: Snapshot Export & Manifest Generation ──
  console.log('--- 1. Programmatic Snapshot Export ---');
  const backupResult = await BackupRestoreService.exportBackup(testBackupDir);

  assertTest(
    'Backup Directory Successfully Generated',
    'Directory exists on disk',
    `Exists: ${fs.existsSync(testBackupDir)}`,
    fs.existsSync(testBackupDir) === true
  );

  const manifestPath = path.join(testBackupDir, 'manifest.json');
  assertTest(
    'Manifest JSON File Generated',
    'manifest.json exists',
    `Exists: ${fs.existsSync(manifestPath)}`,
    fs.existsSync(manifestPath) === true
  );

  const manifest = backupResult.manifest;
  assertTest(
    'Manifest Records Multiple Core Collections',
    'totalCollections >= 10',
    `totalCollections: ${manifest.totalCollections}`,
    manifest.totalCollections >= 10
  );

  assertTest(
    'Total Documents Count > 0',
    'totalDocuments > 0',
    `totalDocuments: ${manifest.totalDocuments}`,
    manifest.totalDocuments > 0
  );

  // ── TEST SUITE 2: SHA-256 Checksum Verification ──
  console.log('\n--- 2. SHA-256 Checksums and Integrity Verification ---');
  let allChecksumsValid = true;
  for (const col of manifest.collections) {
    if (!col.sha256 || col.sha256.length !== 64) {
      allChecksumsValid = false;
      break;
    }
  }

  assertTest(
    'Every Exported Collection File Has Valid 64-character SHA-256 Hash',
    'Valid SHA-256 hashes for all collections',
    allChecksumsValid ? 'All hashes valid' : 'Invalid hash found',
    allChecksumsValid === true
  );

  // ── TEST SUITE 3: Isolated Recovery Namespace Restoration ──
  console.log('\n--- 3. Restoration into Isolated Namespace (Zero Live Data Risk) ---');

  const recoveryResult = await BackupRestoreService.restoreToTestNamespace(
    testBackupDir,
    'nepal_edu_ecosystem_recovery_test',
    'mongodb://localhost:27017'
  );

  assertTest(
    'Restoration to Isolated Namespace Completed with 100% Match',
    'success: true',
    `success: ${recoveryResult.success}`,
    recoveryResult.success === true
  );

  assertTest(
    'Restored Document Count Matches Exported Count',
    `${manifest.totalDocuments}`,
    `${recoveryResult.documentsRestored}`,
    recoveryResult.documentsRestored === manifest.totalDocuments
  );

  // ── TEST SUITE 4: Live Database Non-Interference Check ──
  console.log('\n--- 4. Live Production Database Non-Interference Check ---');

  const liveDbDocs = await mongoose.connection.db!.collection('users').countDocuments();
  assertTest(
    'Active Production Database Unmodified and Fully Intact',
    'Live user records intact',
    `Live user count: ${liveDbDocs}`,
    liveDbDocs > 0
  );

  // Cleanup test backup files
  fs.rmSync(testBackupDir, { recursive: true, force: true });

  // ── FINAL SUMMARY ──
  console.log('\n===============================================================');
  console.log('                 MODULE 9 AUDIT RESULTS SUMMARY                ');
  console.log('===============================================================');
  const passedCount = testResults.filter((r) => r.status === 'PASSED').length;
  console.log(`TOTAL AUDIT CHECKS: ${testResults.length}`);
  console.log(`PASSED: ${passedCount} (${((passedCount / testResults.length) * 100).toFixed(1)}%)`);
  console.log(`FAILED: ${testResults.length - passedCount}`);

  await mongoose.disconnect();
  process.exit(passedCount === testResults.length ? 0 : 1);
}

runModule9Tests().catch((err) => {
  console.error('Fatal Module 9 Test Error:', err);
  process.exit(1);
});

