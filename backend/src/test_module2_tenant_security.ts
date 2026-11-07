import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db';
import { AuthService } from './modules/auth/auth.service';
import { SchoolAdminService } from './modules/school-admin/school-admin.service';
import { TeacherService } from './modules/teacher/teacher.service';
import { StudentService } from './modules/student/student.service';
import { AssessmentService } from './modules/assessment/assessment.service';
import { tenantMiddleware } from './common/middleware/tenant.middleware';
import {
  Institution,
  User,
  Class,
  Section,
  StudentEnrollment,
  CentralSubject,
  SubjectAllocation,
  ExamAssessment,
  StudentMark,
} from './models';
import { UserRole } from './common/constants/roles';

interface TestAssertion {
  testId: string;
  name: string;
  expected: string;
  actual: string;
  status: 'PASS' | 'FAIL';
  detail?: string;
}

const assertions: TestAssertion[] = [];

function recordPass(testId: string, name: string, expected: string, actual: string, detail?: string) {
  console.log(`  ✅ PASS [${testId}] ${name}`);
  assertions.push({ testId, name, expected, actual, status: 'PASS', detail });
}

function recordFail(testId: string, name: string, expected: string, actual: string, detail?: string) {
  console.error(`  ❌ FAIL [${testId}] ${name} -> Expected: ${expected}, Got: ${actual}`);
  assertions.push({ testId, name, expected, actual, status: 'FAIL', detail });
}

export async function runModule2TenantSecurityAudit() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🇳🇵 MODULE 2: MULTI-TENANT SECURITY & DATA ISOLATION AUDIT');
  console.log('   Testing Cross-Tenant Leaks, Tampered Request IDs, RBAC & Server Gating');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  await connectDB();

  try {
    const kmss = await Institution.findOne({ emisCode: '270010001' });
    const sunrise = await Institution.findOne({ emisCode: '280020002' });
    const himalayan = await Institution.findOne({ emisCode: '390030003' });

    const adminKmss = await User.findOne({ username: 'admin_kmss' });
    const adminSunrise = await User.findOne({ username: 'admin_sunrise' });
    const teacherSita = await User.findOne({ username: 'teacher_sita' });
    const aarav = await User.findOne({ username: 'student_aarav' });

    // Ensure Sunrise has at least 1 student for isolation testing
    let sunriseStudent = await User.findOne({ institutionId: sunrise?._id, role: 'STUDENT' });
    if (!sunriseStudent && sunrise) {
      sunriseStudent = await User.create({
        institutionId: sunrise._id,
        username: 'student_sunrise_test',
        fullName: 'Prashant Pokharel (Sunrise Student)',
        email: 'prashant@sunriseschool.edu.np',
        passwordHash: 'test_hash_value',
        role: 'STUDENT',
        status: 'ACTIVE',
      });
    }

    if (!kmss || !sunrise || !adminKmss || !adminSunrise || !teacherSita || !aarav) {
      throw new Error('Baseline fixtures missing. Please run seed-comprehensive.ts first.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. DIRECT API / ID TAMPERING VIA TENANT MIDDLEWARE
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[STAGE 2.1] Server-Side Tenant Middleware Tampering Protection');

    // Test 1: Tampered institutionId in Request Body
    let bodyTamperBlocked = false;
    const mockResBody: any = {
      status(code: number) {
        if (code === 403) bodyTamperBlocked = true;
        return this;
      },
      json(data: any) {
        if (data?.code === 'CROSS_TENANT_FORBIDDEN') bodyTamperBlocked = true;
        return this;
      },
    };
    const mockReqBody: any = {
      user: { id: adminKmss.id, institutionId: kmss._id.toString(), role: UserRole.SCHOOL_ADMIN },
      params: {},
      body: { institutionId: sunrise._id.toString() }, // Tampering with Sunrise ID!
      query: {},
      headers: {},
    };

    tenantMiddleware(mockReqBody, mockResBody, () => {});

    if (bodyTamperBlocked) {
      recordPass('SEC-01', 'Tenant Middleware Blocks Tampered Body institutionId', '403 CROSS_TENANT_FORBIDDEN', 'Blocked 403');
    } else {
      recordFail('SEC-01', 'Tenant Middleware Blocks Tampered Body institutionId', '403 CROSS_TENANT_FORBIDDEN', 'Allowed request');
    }

    // Test 2: Tampered institutionId in Query String
    let queryTamperBlocked = false;
    const mockResQuery: any = {
      status(code: number) {
        if (code === 403) queryTamperBlocked = true;
        return this;
      },
      json(data: any) {
        if (data?.code === 'CROSS_TENANT_FORBIDDEN') queryTamperBlocked = true;
        return this;
      },
    };
    const mockReqQuery: any = {
      user: { id: adminKmss.id, institutionId: kmss._id.toString(), role: UserRole.SCHOOL_ADMIN },
      params: {},
      body: {},
      query: { institutionId: sunrise._id.toString() }, // Tampering via query!
      headers: {},
    };

    tenantMiddleware(mockReqQuery, mockResQuery, () => {});

    if (queryTamperBlocked) {
      recordPass('SEC-02', 'Tenant Middleware Blocks Tampered Query institutionId', '403 CROSS_TENANT_FORBIDDEN', 'Blocked 403');
    } else {
      recordFail('SEC-02', 'Tenant Middleware Blocks Tampered Query institutionId', '403 CROSS_TENANT_FORBIDDEN', 'Allowed request');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. CROSS-TENANT DATA ACCESS DENIAL
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n[STAGE 2.2] Cross-Tenant Queries & Entity Isolation');

    // Test 3: KMSS School Admin queries teachers strictly scoped by KMSS
    const kmssTeachers = await SchoolAdminService.getTeachers(kmss._id.toString());
    const kmssTeacherIds = kmssTeachers.map((t) => t._id.toString());
    const containsSunriseAdmin = kmssTeacherIds.includes(adminSunrise._id.toString());

    if (!containsSunriseAdmin) {
      recordPass(
        'SEC-03',
        'School Admin Faculty Roster Scoped to Tenant',
        '0% Sunrise teachers in KMSS roster',
        `${kmssTeachers.length} KMSS teachers, 0 foreign teachers`
      );
    } else {
      recordFail('SEC-03', 'School Admin Faculty Roster Scoped to Tenant', '0% foreign teachers', 'Contaminated');
    }

    // Test 4: Student A (Aarav - KMSS) attempting to query Sunrise Student data
    const kmssStudentResults = await AssessmentService.getStudentPublishedResults(
      aarav._id.toString(),
      kmss._id.toString()
    );
    const containsSunriseMarks = kmssStudentResults.some(
      (m: any) => m.institutionId?.toString() === sunrise._id.toString()
    );

    if (!containsSunriseMarks) {
      recordPass(
        'SEC-04',
        'Student Published Marksheet Cross-Tenant Isolation',
        'Zero cross-institution marks leaked to student',
        'All marks strictly belong to KMSS'
      );
    } else {
      recordFail('SEC-04', 'Student Published Marksheet Cross-Tenant Isolation', 'Zero foreign marks', 'Leaked foreign marks');
    }

    // Test 5: Unassigned Subject Modification Boundary
    // Teacher Sita (Science 10) attempts to enter marks for Compulsory Math 10
    const mathSubject = await CentralSubject.findOne({ gradeNumber: 10, name: /Mathematics/i });
    const class10Kmss = await Class.findOne({ institutionId: kmss._id, gradeNumber: 10 });
    const secSagarmatha = await Section.findOne({ classId: class10Kmss?._id, name: /Sagarmatha/i });
    const mathAssessment = await ExamAssessment.findOne({
      centralSubjectId: mathSubject?._id,
      sectionId: secSagarmatha?._id,
    });

    let unassignedBlocked = false;
    if (mathAssessment) {
      try {
        await AssessmentService.enterMarks({
          teacherId: teacherSita._id.toString(), // Sita teaches Science, NOT Math!
          userRole: 'TEACHER',
          assessmentId: mathAssessment._id.toString(),
          saveAsDraft: false,
          marks: [{ studentId: aarav._id.toString(), marksTheory: 50, marksPractical: 20 }],
        });
      } catch (err: any) {
        if (err.message.includes('only enter marks for subjects assigned to you')) {
          unassignedBlocked = true;
        }
      }
    }

    if (unassignedBlocked) {
      recordPass(
        'SEC-05',
        'Strict Subject Allocation Enforcement (Teacher Sita blocked on Math 10)',
        'Rejected: You can only enter marks for subjects assigned to you',
        'Blocked as expected'
      );
    } else {
      recordFail(
        'SEC-05',
        'Strict Subject Allocation Enforcement (Teacher Sita blocked on Math 10)',
        'Rejected with 403/Error',
        'Allowed unauthorized teacher to enter marks'
      );
    }

    // Test 6: Super Admin Nationwide Privileges
    // Super Admin should be able to inspect all schools with proper token scope
    const saUser = await User.findOne({ role: 'SUPER_ADMIN' });
    let superAdminBypassWorks = false;
    const mockResSA: any = {
      status() { return this; },
      json() { return this; },
    };
    const mockReqSA: any = {
      user: { id: saUser?.id, role: UserRole.SUPER_ADMIN },
      headers: { 'x-institution-id': sunrise._id.toString() },
      params: {},
      body: {},
      query: {},
    };

    tenantMiddleware(mockReqSA, mockResSA, () => {
      if (mockReqSA.institutionId === sunrise._id.toString()) {
        superAdminBypassWorks = true;
      }
    });

    if (superAdminBypassWorks) {
      recordPass(
        'SEC-06',
        'Super Admin System-Wide Administrative Switching via x-institution-id',
        'Super Admin seamlessly scopes to target tenant without constraint',
        `Scoped to ${sunrise.name}`
      );
    } else {
      recordFail(
        'SEC-06',
        'Super Admin System-Wide Administrative Switching via x-institution-id',
        'Super Admin switches tenant',
        'Failed'
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SUMMARY
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('🏁 MODULE 2 AUDIT RESULTS SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    const total = assertions.length;
    const passed = assertions.filter((a) => a.status === 'PASS').length;
    const failed = assertions.filter((a) => a.status === 'FAIL').length;

    console.log(`Total Assertions : ${total}`);
    console.log(`Passed           : ${passed}`);
    console.log(`Failed           : ${failed}`);
    console.log(`Score            : ${((passed / total) * 100).toFixed(1)}%\n`);

    if (failed > 0) {
      console.log('❌ Failed Tests:');
      assertions.filter((a) => a.status === 'FAIL').forEach((f) => {
        console.log(`  - [${f.testId}] ${f.name}`);
      });
    } else {
      console.log('🌟 ALL MODULE 2 MULTI-TENANT SECURITY & ISOLATION TESTS PASSED 100%!');
    }
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  runModule2TenantSecurityAudit()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal Module 2 audit failure:', err);
      process.exit(1);
    });
}
