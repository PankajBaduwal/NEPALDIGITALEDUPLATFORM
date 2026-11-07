import mongoose from 'mongoose';
import { AnalyticsService } from '../modules/analytics/analytics.service';
import { AssignmentService } from '../modules/assignment/assignment.service';
import { QuizService } from '../modules/quiz/quiz.service';
import { Institution, User, Class, Section, StudentEnrollment, CentralSubject } from '../models';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nepal_edu_ecosystem';

async function runPrincipalAndSchoolAdminVerification() {
  console.log('=== STARTING PRINCIPAL & SCHOOL ADMIN DASHBOARD UPGRADE VERIFICATION ===');
  await mongoose.connect(MONGO_URI);
  console.log(' Connected to MongoDB:', MONGO_URI);

  // Find sample institution (Dhambojhi HSS or first active institution)
  let institution = await Institution.findOne({ emisCode: '570010001' });
  if (!institution) {
    institution = await Institution.findOne();
  }
  if (!institution) {
    throw new Error('No institution found in database to verify against.');
  }
  const instId = institution._id.toString();
  console.log(` Verifying against Institution: ${institution.name} (EMIS: ${institution.emisCode || '570010001'})`);

  // ─────────────────────────────────────────────────────────
  // TEST 1: PRINCIPAL EXECUTIVE ANALYTICS & KPIS
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 1. Testing Principal Analytics & Academic KPIs ---');
  const principalAnalytics = await AnalyticsService.getPrincipalAnalytics(instId);
  console.log(' Principal Analytics Retrived Successfully:');
  console.log('   Total Students:', principalAnalytics.kpi.totalStudents);
  console.log('   Total Faculty:', principalAnalytics.kpi.totalFaculty);
  console.log('   Total Classes:', principalAnalytics.kpi.totalClasses);
  console.log('   Overall Attendance Rate:', principalAnalytics.kpi.overallAttendanceRate, '%');
  console.log('   Exam Completion Rate:', principalAnalytics.kpi.examCompletionRate, '%');
  console.log('   Active Assignments:', principalAnalytics.kpi.activeAssignments);
  console.log('   Active Quizzes:', principalAnalytics.kpi.activeQuizzes);
  console.log('   Pending Submissions:', principalAnalytics.kpi.pendingSubmissions);

  console.log('\n   At-Risk Students Identified:', principalAnalytics.atRiskStudents?.length || 0);
  if (principalAnalytics.atRiskStudents && principalAnalytics.atRiskStudents.length > 0) {
    console.log(`   Sample At-Risk Student: ${principalAnalytics.atRiskStudents[0].studentName} (GPA: ${principalAnalytics.atRiskStudents[0].averageGpa}, Level: ${principalAnalytics.atRiskStudents[0].riskLevel})`);
  }

  console.log('   Institutional Academic Alerts Count:', principalAnalytics.academicAlerts?.length || 0);
  (principalAnalytics.academicAlerts || []).forEach((alt: any) => {
    console.log(`     [${alt.type}] ${alt.title}: ${alt.message}`);
  });

  // ─────────────────────────────────────────────────────────
  // TEST 2: INSTITUTIONAL ASSIGNMENT STUDIO OVERSIGHT
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 2. Testing Institutional Assignment Studio Oversight ---');
  const assignmentOversight = await AssignmentService.getInstitutionalAssignments(instId);
  console.log(' Institutional Assignments Retrieved:');
  console.log('   Total Assignments:', assignmentOversight.stats.totalAssignments);
  console.log('   Active Count:', assignmentOversight.stats.activeCount);
  console.log('   Draft Count:', assignmentOversight.stats.draftCount);
  console.log('   Total Submissions:', assignmentOversight.stats.totalSubmissions);
  console.log('   Pending Evaluations:', assignmentOversight.stats.pendingEvaluations);
  console.log('   Copy Detection Flags:', assignmentOversight.stats.flaggedSimilarity);
  console.log('   AI-Generated Count:', assignmentOversight.stats.aiGeneratedCount);

  // ─────────────────────────────────────────────────────────
  // TEST 3: INSTITUTIONAL QUIZ & ASSESSMENT OVERSIGHT
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 3. Testing Institutional Quiz & Assessment Oversight ---');
  const quizOversight = await QuizService.getInstitutionalQuizzes(instId);
  console.log(' Institutional Quizzes Retrieved:');
  console.log('   Total Quizzes:', quizOversight.stats.totalQuizzes);
  console.log('   Published Count:', quizOversight.stats.publishedCount);
  console.log('   Proctored Count:', quizOversight.stats.proctoredCount);
  console.log('   Total Attempts:', quizOversight.stats.totalAttempts);
  console.log('   Overall Pass Percentage:', quizOversight.stats.overallPassPercentage, '%');
  console.log('   Total Security Warnings:', quizOversight.stats.totalSecurityWarnings);

  // ─────────────────────────────────────────────────────────
  // TEST 4: VERIFY ROLES & DATA ISOLATION
  // ─────────────────────────────────────────────────────────
  console.log('\n--- 4. Testing Multi-Tenant Data Isolation ---');
  const fakeInstId = new mongoose.Types.ObjectId().toString();
  const fakeAnalytics = await AnalyticsService.getPrincipalAnalytics(fakeInstId);
  if (fakeAnalytics.kpi.totalStudents !== 0 || fakeAnalytics.kpi.totalFaculty !== 0) {
    throw new Error('Tenant isolation check failed: Unassociated institution returned data.');
  }
  console.log(' Multi-tenant isolation verified: unassociated institution returns zero records.');

  await mongoose.disconnect();
  console.log('\n=== ALL PRINCIPAL & SCHOOL ADMIN DASHBOARD UPGRADE TESTS PASSED! ===\n');
}

runPrincipalAndSchoolAdminVerification().catch((err) => {
  console.error(' Verification Failed:', err);
  process.exit(1);
});

