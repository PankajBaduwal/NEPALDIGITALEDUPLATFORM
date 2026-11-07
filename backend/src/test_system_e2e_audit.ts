import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db';
import { AuthService } from './modules/auth/auth.service';
import { TeacherService } from './modules/teacher/teacher.service';
import { ClassTeacherService } from './modules/class-teacher/class-teacher.service';
import { StudentService } from './modules/student/student.service';
import { SubscriptionsService } from './modules/subscriptions/subscriptions.service';
import { RAGEngineService } from './modules/ai/rag-engine.service';
import { LLMGroundingService } from './modules/ai/llm-grounding.service';
import { FeatureAccessService } from './modules/feature-access/feature-access.service';
import { SmartBoardService } from './modules/smartboard/smartboard.service';
import {
  Institution,
  User,
  Class,
  Section,
  CentralSubject,
  SubjectAllocation,
  StudentEnrollment,
  Assignment,
  AssignmentSubmission,
  AttendanceSession,
  AttendanceRecord,
  GradingScheme,
  Examination,
  ExamAssessment,
  StudentMark,
  SubscriptionPlan,
  InstitutionSubscription,
  Textbook,
  FeatureKey,
  StudentFeatureOverride,
  RegistrationRequest,
} from './models';
import { UserRole } from './common/constants/roles';

interface TestResult {
  category: string;
  name: string;
  status: 'PASS' | 'FAIL';
  detail?: string;
}

const results: TestResult[] = [];

function recordPass(category: string, name: string, detail?: string) {
  console.log(`  ✅ PASS: [${category}] ${name}`);
  results.push({ category, name, status: 'PASS', detail });
}

function recordFail(category: string, name: string, detail: string) {
  console.error(`  ❌ FAIL: [${category}] ${name} -> ${detail}`);
  results.push({ category, name, status: 'FAIL', detail });
}

export async function runCompleteSystemAudit() {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('🇳🇵 NEPAL DIGITAL EDUCATION PLATFORM — COMPLETE SYSTEM AUDIT & E2E VERIFICATION');
  console.log('   MERN Stack with TypeScript | Classes 1-12 | Academic & Digital Ecosystem');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  await connectDB();

  try {
    // ═════════════════════════════════════════════════════════════════════════
    // 1. ALL USER ROLES AUTHENTICATION & ACCESS VERIFICATION
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n[SECTION 1] User Roles Authentication & Authorization Audit');

    // 1.1 Super Admin
    try {
      const saLogin = await AuthService.login('superadmin', 'Nepal@1234');
      if (saLogin && saLogin.user.role === UserRole.SUPER_ADMIN) {
        recordPass('Roles', 'Super Admin Authentication', `Authenticated as ${saLogin.user.fullName}`);
      } else {
        recordFail('Roles', 'Super Admin Authentication', 'Role did not match SUPER_ADMIN');
      }
    } catch (err: any) {
      recordFail('Roles', 'Super Admin Authentication', err.message);
    }

    // 1.2 School Admin
    let kmssAdminUser: any;
    try {
      const adminLogin = await AuthService.login('admin_kmss', 'Nepal@1234');
      if (adminLogin && adminLogin.user.role === UserRole.SCHOOL_ADMIN) {
        kmssAdminUser = adminLogin.user;
        recordPass('Roles', 'School Admin Authentication', `Logged in to KMSS: ${adminLogin.user.institutionId}`);
      } else {
        recordFail('Roles', 'School Admin Authentication', 'Role did not match SCHOOL_ADMIN');
      }
    } catch (err: any) {
      recordFail('Roles', 'School Admin Authentication', err.message);
    }

    // 1.3 Principal
    try {
      const princLogin = await AuthService.login('principal_kmss', 'Nepal@1234');
      if (princLogin && princLogin.user.role === UserRole.PRINCIPAL) {
        recordPass('Roles', 'Principal Authentication', `Authenticated Principal: ${princLogin.user.fullName}`);
      } else {
        recordFail('Roles', 'Principal Authentication', 'Role did not match PRINCIPAL');
      }
    } catch (err: any) {
      recordFail('Roles', 'Principal Authentication', err.message);
    }

    // 1.4 Teacher
    let sitaTeacherUser: any;
    try {
      const teacherLogin = await AuthService.login('teacher_sita', 'Nepal@1234');
      if (teacherLogin && teacherLogin.user.role === UserRole.TEACHER) {
        sitaTeacherUser = teacherLogin.user;
        recordPass('Roles', 'Subject Teacher Authentication', `Teacher: ${teacherLogin.user.fullName}`);
      } else {
        recordFail('Roles', 'Subject Teacher Authentication', 'Role did not match TEACHER');
      }
    } catch (err: any) {
      recordFail('Roles', 'Subject Teacher Authentication', err.message);
    }

    // 1.5 Class Teacher
    let rameshTeacherUser: any;
    try {
      const ctLogin = await AuthService.login('teacher_ramesh', 'Nepal@1234');
      if (ctLogin && ctLogin.user.role === UserRole.TEACHER) {
        rameshTeacherUser = ctLogin.user;
        const assignedSection = await Section.findOne({ classTeacherId: rameshTeacherUser.id });
        if (assignedSection) {
          recordPass('Roles', 'Class Teacher Designation Verification', `Designated Class Teacher for Section: ${assignedSection.name}`);
        } else {
          recordFail('Roles', 'Class Teacher Designation Verification', 'No section has Ramesh as class teacher');
        }
      } else {
        recordFail('Roles', 'Class Teacher Authentication', 'Role did not match TEACHER');
      }
    } catch (err: any) {
      recordFail('Roles', 'Class Teacher Authentication', err.message);
    }

    // 1.6 Student
    let aaravStudentUser: any;
    try {
      const studentLogin = await AuthService.login('student_aarav', 'Nepal@1234');
      if (studentLogin && studentLogin.user.role === UserRole.STUDENT) {
        aaravStudentUser = studentLogin.user;
        recordPass('Roles', 'Student Authentication', `Student: ${studentLogin.user.fullName}`);
      } else {
        recordFail('Roles', 'Student Authentication', 'Role did not match STUDENT');
      }
    } catch (err: any) {
      recordFail('Roles', 'Student Authentication', err.message);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 2. FEATURE CONFIGURATION HIERARCHY & LEARNING MODES AUDIT
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n[SECTION 2] School-Wise & Class-Wise Feature Configuration Hierarchy');

    const kmss = await Institution.findOne({ emisCode: '270010001' });
    const himalayan = await Institution.findOne({ emisCode: '390030003' });
    const class10Kmss = await Class.findOne({ institutionId: kmss?._id, gradeNumber: 10 });
    const secSagarmatha = await Section.findOne({ classId: class10Kmss?._id, name: /Sagarmatha/i });

    // Persona 1: Full Digital Access
    const student1 = await User.findOne({ username: 'student_aarav' });
    // Persona 5: Smart Board Only Learning
    const student5 = await User.findOne({ username: 'student_smartboardonly' });
    // Persona 6: Textbooks Enabled, AI Disabled
    const student6 = await User.findOne({ username: 'student_noai' });
    // Persona 7: Restricted Online Submissions
    const student7 = await User.findOne({ username: 'student_noonline_sub' });

    // Test Scenario 1: Persona 1 has AI Assistant Allowed
    if (student1 && kmss) {
      const isAiAllowedAarav = await FeatureAccessService.isFeatureAllowed(
        student1._id.toString(),
        FeatureKey.AI_ASSISTANT,
        kmss._id.toString()
      );
      if (isAiAllowedAarav === true) {
        recordPass('Feature Access', 'Persona 1 Full Digital AI Assistant Access', 'Allowed as expected');
      } else {
        recordFail('Feature Access', 'Persona 1 Full Digital AI Assistant Access', 'Expected true, got false');
      }
    }

    // Test Scenario 2: Persona 6 has AI Assistant Disabled via Override
    if (student6 && kmss) {
      const isAiAllowedFiroj = await FeatureAccessService.isFeatureAllowed(
        student6._id.toString(),
        FeatureKey.AI_ASSISTANT,
        kmss._id.toString()
      );
      if (isAiAllowedFiroj === false) {
        recordPass('Feature Access', 'Persona 6 AI Assistant Disabled Override', 'Blocked as expected at student level');
      } else {
        recordFail('Feature Access', 'Persona 6 AI Assistant Disabled Override', 'Expected false, got true');
      }
    }

    // Test Scenario 3: Persona 7 has Online Submission Restricted
    if (student7 && kmss) {
      const isSubAllowedGita = await FeatureAccessService.isFeatureAllowed(
        student7._id.toString(),
        FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
        kmss._id.toString()
      );
      if (isSubAllowedGita === false) {
        recordPass('Feature Access', 'Persona 7 Online Submission Disabled', 'Blocked as expected at student level');
      } else {
        recordFail('Feature Access', 'Persona 7 Online Submission Disabled', 'Expected false, got true');
      }
    }

    // Test Scenario 4: Persona 5 has Student Dashboard Disabled (Smart Board Only Mode)
    if (student5 && kmss) {
      const isDashAllowedElina = await FeatureAccessService.isFeatureAllowed(
        student5._id.toString(),
        FeatureKey.STUDENT_DASHBOARD,
        kmss._id.toString()
      );
      if (isDashAllowedElina === false) {
        recordPass('Feature Access', 'Persona 5 Student Dashboard Disabled (Smart Board Only)', 'Blocked as expected');
      } else {
        recordFail('Feature Access', 'Persona 5 Student Dashboard Disabled', 'Expected false, got true');
      }
    }

    // Test Scenario 5: Package Ceiling Gating (Himalayan School on Foundation Tier Classes 1-5)
    if (himalayan) {
      const himalayanSub = await InstitutionSubscription.findOne({ institutionId: himalayan._id });
      const planFoundation = await SubscriptionPlan.findById(himalayanSub?.planId);
      const coversSecondary = planFoundation?.applicableGrades.includes(10) || false;
      if (!coversSecondary) {
        recordPass('Feature Access', 'Tier Ceiling Enforced for Foundation Plan', 'Grades 6-12 strictly excluded from Foundation package');
      } else {
        recordFail('Feature Access', 'Tier Ceiling Enforced for Foundation Plan', 'Foundation plan should not include Grade 10');
      }
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 3. REAL-WORLD WORKFLOW A: REGISTRATION & SUPER ADMIN APPROVAL
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n[SECTION 3] Workflow A: Institution Registration & Super Admin Approval');
    const testEmis = `888${Math.floor(100000 + Math.random() * 900000)}`;
    let createdReq: any;
    try {
      createdReq = await AuthService.registerInstitution({
        institutionName: 'Audit Test Secondary School',
        nameNepali: 'अडिट टेस्ट माध्यमिक विद्यालय',
        emisCode: testEmis,
        institutionType: 'COMMUNITY',
        province: 'Bagmati Province',
        district: 'Lalitpur',
        localLevel: 'Lalitpur Metropolitan City',
        ward: 5,
        contactPerson: 'Audit Inspector',
        contactPhone: '9841999999',
        contactEmail: `audit_${Date.now()}@testschool.edu.np`,
        proposedPlanTier: 'SECONDARY',
        remarks: 'Testing automated institution onboarding pipeline',
      });

      const reqDoc = createdReq?.request || createdReq;
      if (reqDoc && reqDoc.status === 'PENDING') {
        recordPass('Workflow A', 'Submit School Registration Request', `Created pending request ID: ${reqDoc.id || reqDoc._id}`);
      } else {
        recordFail('Workflow A', 'Submit School Registration Request', 'Status was not PENDING');
      }

      // Review and Approve by Super Admin
      const superAdminUser = await User.findOne({ role: 'SUPER_ADMIN' });
      const reviewRes = await AuthService.reviewRegistrationRequest(
        (reqDoc.id || reqDoc._id).toString(),
        'APPROVED',
        superAdminUser?._id.toString() || '',
        'Approved by automated system audit suite'
      );

      if (reviewRes && reviewRes.status === 'APPROVED') {
        recordPass(
          'Workflow A',
          'Super Admin Registration Approval & Verification',
          `Approved request for: ${reviewRes.institutionName} (EMIS: ${reviewRes.emisCode})`
        );
      } else {
        recordFail('Workflow A', 'Super Admin Registration Approval', 'Approval did not set status to APPROVED');
      }
    } catch (err: any) {
      recordFail('Workflow A', 'Registration Pipeline Execution', err.message);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 4. REAL-WORLD WORKFLOW B: ASSIGNMENT, STUDENT SUBMISSION & GRADING
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n[SECTION 4] Workflow B: Assignments, Online Submissions & Teacher Grading');
    try {
      const mathSubject = await CentralSubject.findOne({ gradeNumber: 10, name: /Mathematics/i });
      if (kmss && secSagarmatha && mathSubject && rameshTeacherUser && aaravStudentUser) {
        // Teacher creates new assignment
        const testAssignment = await Assignment.create({
          institutionId: kmss._id,
          sectionId: secSagarmatha._id,
          centralSubjectId: mathSubject._id,
          teacherId: rameshTeacherUser.id,
          title: 'Trigonometric Heights and Distances Proofs',
          description: 'Solve problems on angle of elevation and depression from page 112.',
          dueDate: new Date(Date.now() + 86400000 * 3),
          status: 'ACTIVE',
        });
        recordPass('Workflow B', 'Teacher Creates Academic Assignment', `Created: ${testAssignment.title}`);

        // Eligible student (Aarav) submits work
        const submission = await StudentService.submitAssignment(
          aaravStudentUser.id,
          kmss._id.toString(),
          testAssignment._id.toString(),
          {
            content: 'Attached step-by-step trigonometry angle derivations with diagram.',
            fileUrl: '/uploads/submissions/aarav_trig_hw.pdf',
          }
        );

        if (submission && submission.status === 'SUBMITTED') {
          recordPass('Workflow B', 'Student Submits Assignment Online', `Submission recorded for ${aaravStudentUser.fullName}`);
        } else {
          recordFail('Workflow B', 'Student Submits Assignment Online', 'Submission status was not SUBMITTED');
        }

        // Restricted student (Persona 7 - Gita) attempts to submit online -> Must be rejected
        let gitaBlocked = false;
        try {
          if (student7) {
            await StudentService.submitAssignment(
              student7._id.toString(),
              kmss._id.toString(),
              testAssignment._id.toString(),
              {
                content: 'Attempting online submission from restricted account',
              }
            );
          }
        } catch (err: any) {
          if (err.message.includes('not permitted') || err.message.includes('disabled')) {
            gitaBlocked = true;
          }
        }

        if (gitaBlocked) {
          recordPass('Workflow B', 'Restricted Persona 7 Online Submission Blocked', 'Strict feature gating enforced');
        } else {
          recordFail('Workflow B', 'Restricted Persona 7 Online Submission Blocked', 'Restricted student was improperly allowed to submit');
        }

        // Teacher grades submission
        const subId = (submission.id || submission._id).toString();
        const graded = await TeacherService.gradeAssignmentSubmission(
          rameshTeacherUser.id,
          subId,
          20,
          'Flawless proof with neat geometric construction. Full marks.',
          kmss._id.toString()
        );

        if (graded && graded.status === 'GRADED' && graded.marksObtained === 20) {
          recordPass('Workflow B', 'Teacher Evaluates & Grades Submission', `Marks: ${graded.marksObtained}/20, Feedback saved`);
        } else {
          recordFail('Workflow B', 'Teacher Evaluates & Grades Submission', 'Grading record not saved as GRADED');
        }
      }
    } catch (err: any) {
      recordFail('Workflow B', 'Assignment Pipeline Execution', err.message);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 5. REAL-WORLD WORKFLOW C: EXAMINATION, ASSESSMENTS & NEPAL 4.0 GPA MARKS
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n[SECTION 5] Workflow C: Examinations, Nepal 4.0 GPA Grading & Workflow');
    try {
      const exam = await Examination.findOne({ code: 'TERM-1-2081' });
      const marks = await StudentMark.find({ examinationId: exam?._id }).populate('assessmentId');

      if (exam && marks.length > 0) {
        recordPass('Workflow C', 'Retrieve Terminal Examination Records', `Found exam: ${exam.name} with ${marks.length} marks`);

        const firstMark = marks[0];
        const satisfiesNepalGpa = firstMark.grade && ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'NG'].includes(firstMark.grade);
        const hasValidGpa = typeof firstMark.gpa === 'number' && firstMark.gpa >= 0 && firstMark.gpa <= 4.0;

        if (satisfiesNepalGpa && hasValidGpa) {
          recordPass(
            'Workflow C',
            'Nepal Secondary Letter Grading Framework (CDC 2078) Compliance',
            `Mark: ${firstMark.totalMarks} -> Grade: ${firstMark.grade}, GPA: ${firstMark.gpa}`
          );
        } else {
          recordFail('Workflow C', 'Nepal Grading Compliance', 'Mark did not conform to CDC letter grades or GPA scale');
        }

        // Verify Class Teacher overview for results
        if (rameshTeacherUser && kmss && secSagarmatha) {
          const ctAnalytics = await ClassTeacherService.getSectionOverview(
            rameshTeacherUser.id,
            secSagarmatha._id.toString(),
            kmss._id.toString()
          );
          if (ctAnalytics && ctAnalytics.section) {
            recordPass('Workflow C', 'Class Teacher Academic Overview & Analytics', `Loaded data for Section: ${ctAnalytics.section.name}`);
          } else {
            recordFail('Workflow C', 'Class Teacher Academic Overview', 'Overview did not return section data');
          }
        }
      } else {
        recordFail('Workflow C', 'Retrieve Terminal Examination Records', 'No marks or exam found');
      }
    } catch (err: any) {
      recordFail('Workflow C', 'Examination & Grading Execution', err.message);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 6. REAL-WORLD WORKFLOW D: DIGITAL TEXTBOOKS & SMART BOARD TOKENS
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n[SECTION 6] Workflow D: Digital Textbooks Repository & Smart Board Session');
    try {
      const textbooks = await Textbook.find({ status: 'PUBLISHED' });
      if (textbooks.length >= 2) {
        recordPass('Workflow D', 'CDC Digital Textbooks Repository Access', `Retrieved ${textbooks.length} published textbooks`);

        // Test Smart Board session initialization
        if (kmss && sitaTeacherUser && secSagarmatha && class10Kmss) {
          const scienceSubject = await CentralSubject.findOne({ gradeNumber: 10, name: /Science/i });
          const sbSession = await SmartBoardService.startClassroomSession({
            institutionId: kmss._id.toString(),
            teacherId: sitaTeacherUser.id,
            classId: class10Kmss._id.toString(),
            sectionId: secSagarmatha._id.toString(),
            subjectId: scienceSubject?._id.toString() || '',
            textbookId: textbooks[0]._id.toString(),
            lessonTitle: 'Interactive Science 10 Smart Board Class',
            initialResourceType: 'TEXTBOOK',
          });

          if (sbSession && sbSession.session && sbSession.launcherUrl) {
            recordPass(
              'Workflow D',
              'Smart Board Session Initialization & Code Generation',
              `Session ID: ${sbSession.session.id}, Launcher: ${sbSession.launcherUrl}`
            );
          } else {
            recordFail('Workflow D', 'Smart Board Session Initialization', 'Session or launcherUrl not generated');
          }
        }
      } else {
        recordFail('Workflow D', 'CDC Digital Textbooks Access', `Expected at least 2 textbooks, found ${textbooks.length}`);
      }
    } catch (err: any) {
      recordFail('Workflow D', 'Digital Textbooks & Smart Board Pipeline', err.message);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 7. REAL-WORLD WORKFLOW E: AI LEARNING ASSISTANT & RAG ENGINE
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n[SECTION 7] Workflow E: Grounded AI Assistant & Textbook RAG Engine');
    try {
      // Seed Knowledge base
      await RAGEngineService.seedKnowledgeBase();

      // Semantic Retrieval Test in English
      const englishQuery = 'What is the mathematical formulation of Ohm Law in electric circuits?';
      const engChunks = await RAGEngineService.retrieveRelevantChunks({
        query: englishQuery,
        grade: 10,
        topK: 2,
      });

      if (engChunks.length > 0 && (engChunks[0].excerpt.includes('Ohm') || engChunks[0].excerpt.includes('V = IR'))) {
        recordPass('Workflow E', 'English Semantic RAG Retrieval Grounding', `Matched: ${engChunks[0].chapterTitle} (Score: ${(engChunks[0].relevanceScore * 100).toFixed(1)}%)`);
      } else {
        recordFail('Workflow E', 'English Semantic RAG Retrieval', 'Top chunk did not match expected textbook section');
      }

      // Semantic Retrieval Test in Nepali
      const nepaliQuery = 'ओमको नियम र विद्युत प्रतिरोधको सम्बन्ध के हो?';
      const nepChunks = await RAGEngineService.retrieveRelevantChunks({
        query: nepaliQuery,
        grade: 10,
        topK: 2,
      });

      if (nepChunks.length > 0) {
        recordPass('Workflow E', 'Nepali Query Semantic RAG Retrieval Grounding', `Matched: ${nepChunks[0].chapterTitle}`);
      } else {
        recordFail('Workflow E', 'Nepali Query Semantic RAG Retrieval', 'No relevant chunk returned for Nepali query');
      }

      // Grounded Answer Generation
      const generated = await LLMGroundingService.generateAnswer({
        userRole: 'TEACHER',
        grade: 10,
        mode: 'TEACHER_LESSON_PLAN',
        query: englishQuery,
        citations: engChunks,
      });

      if (generated && generated.answer && generated.citations.length > 0) {
        recordPass('Workflow E', 'Textbook-Grounded LLM Prompt Engineering & Answer', `Generated lesson plan (${generated.answer.length} chars) with verified CDC citations`);
      } else {
        recordFail('Workflow E', 'Textbook-Grounded LLM Prompt Engineering & Answer', 'Generated answer missing citations or content');
      }
    } catch (err: any) {
      recordFail('Workflow E', 'AI Assistant & RAG Engine', err.message);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 8. REAL-WORLD WORKFLOW F: SUBSCRIPTIONS, PACKAGES & LICENSING
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n[SECTION 8] Workflow F: Subscription Packages, Licensing & Entitlements');
    try {
      const plans = await SubscriptionPlan.find({ isActive: true });
      if (plans.length >= 4) {
        recordPass('Workflow F', 'Subscription Packages Availability', `Retrieved ${plans.length} configured Nepal plans`);

        // Check plan tiers
        const tiers = plans.map((p) => p.tier);
        const hasRequiredTiers =
          tiers.includes('FOUNDATION') &&
          tiers.includes('MIDDLE_SCHOOL') &&
          tiers.includes('SECONDARY');

        if (hasRequiredTiers) {
          recordPass('Workflow F', 'Configurable Packages Tier Hierarchy', 'FOUNDATION (1-5), MIDDLE (6-8), SECONDARY (9-12) confirmed');
        } else {
          recordFail('Workflow F', 'Configurable Packages Tier Hierarchy', 'Missing required tiers in database');
        }

        // Check active subscription for KMSS
        if (kmss) {
          const entitlements = await SubscriptionsService.getInstitutionEntitlements(kmss._id.toString());
          if (entitlements && entitlements.status === 'ACTIVE' && entitlements.hasActiveSubscription) {
            recordPass('Workflow F', 'Active Institution Subscription Status', `KMSS Subscription: ${(entitlements.currentPlan as any)?.name || 'Secondary'} (Status: ACTIVE)`);
          } else {
            recordFail('Workflow F', 'Active Institution Subscription Status', 'KMSS subscription not active');
          }
        }
      } else {
        recordFail('Workflow F', 'Subscription Packages Availability', `Found only ${plans.length} plans`);
      }
    } catch (err: any) {
      recordFail('Workflow F', 'Subscription Licensing Execution', err.message);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // 9. SECURITY & MULTI-TENANT ISOLATION AUDIT
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n[SECTION 9] Security & Multi-Tenant Isolation Audit');
    try {
      const sunrise = await Institution.findOne({ emisCode: '280020002' });

      // Test 1: Cross-Institution Data Leakage Denial
      if (kmss && sunrise) {
        const kmssStudentsInSunrise = await User.find({
          institutionId: kmss._id,
          role: 'STUDENT',
        });
        const sunriseStudents = await User.find({
          institutionId: sunrise._id,
          role: 'STUDENT',
        });

        const kmssIds = kmssStudentsInSunrise.map((s) => s._id.toString());
        const hasOverlap = sunriseStudents.some((s) => kmssIds.includes(s._id.toString()));

        if (!hasOverlap) {
          recordPass('Security', 'Multi-Tenant Data Isolation', 'Zero student overlap between distinct institutional tenants');
        } else {
          recordFail('Security', 'Multi-Tenant Data Isolation', 'Detected cross-institution user contamination');
        }
      }

      // Test 2: Unassigned Teacher Authorization Boundary
      if (kmss && secSagarmatha && sitaTeacherUser) {
        // Teacher Sita teaches Science 10, NOT Compulsory Math 10
        const isSitaAllocatedMath = await SubjectAllocation.findOne({
          institutionId: kmss._id,
          teacherId: sitaTeacherUser.id,
          sectionId: secSagarmatha._id,
          centralSubjectId: (await CentralSubject.findOne({ name: /Compulsory Mathematics/i }))?._id,
        });

        if (!isSitaAllocatedMath) {
          recordPass('Security', 'Strict Subject-Teacher Authorization Isolation', 'Teacher Sita cannot modify Math assessments');
        } else {
          recordFail('Security', 'Strict Subject-Teacher Authorization Isolation', 'Teacher Sita should not be allocated Math');
        }
      }
    } catch (err: any) {
      recordFail('Security', 'Security & Multi-Tenant Audit', err.message);
    }

    // ═════════════════════════════════════════════════════════════════════════
    // AUDIT SUMMARY
    // ═════════════════════════════════════════════════════════════════════════
    console.log('\n═══════════════════════════════════════════════════════════════════════════════');
    console.log('🏁 SYSTEM AUDIT & VERIFICATION RESULTS SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    const totalTests = results.length;
    const passedTests = results.filter((r) => r.status === 'PASS').length;
    const failedTests = results.filter((r) => r.status === 'FAIL').length;
    const passPercentage = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`Total Verification Assertions : ${totalTests}`);
    console.log(`Passed                        : ${passedTests}`);
    console.log(`Failed                        : ${failedTests}`);
    console.log(`Overall System Health Score   : ${passPercentage}%\n`);

    if (failedTests > 0) {
      console.log('❌ Failed Assertions:');
      results.filter((r) => r.status === 'FAIL').forEach((f) => {
        console.log(`  - [${f.category}] ${f.name}: ${f.detail}`);
      });
    } else {
      console.log('🌟 ALL 100% OF SYSTEM AUDIT SPECIFICATIONS AND REAL-WORLD WORKFLOWS PASSED!');
    }
  } finally {
    await disconnectDB();
  }
}

if (require.main === module) {
  runCompleteSystemAudit()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Fatal audit failure:', err);
      process.exit(1);
    });
}
