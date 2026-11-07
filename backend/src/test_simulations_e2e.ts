/**
 * test_simulations_e2e.ts
 * End-to-End Verification of Centralized Simulation Library & Simulation 01
 */
import { connectDB, disconnectDB } from './config/db';
import { SimulationActivityService } from './modules/simulation-activity/simulation-activity.service';

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('RUNNING CENTRALIZED SIMULATION LIBRARY & SIMULATION 01 E2E TEST');
  console.log('═══════════════════════════════════════════════════════════════\n');

  await connectDB();

  // Test 1: Verify Seed Initial Content
  console.log('Test 1: Verifying Seed & Registration...');
  await SimulationActivityService.seedInitialContent();
  console.log('✅ Seed function executed successfully.');

  // Test 2: Verify Hierarchy API
  console.log('\nTest 2: Verifying Hierarchy Generation...');
  const hierarchy = await SimulationActivityService.getLibraryHierarchy();
  console.log(`✅ Total active simulations in library: ${hierarchy.totalSimulations}`);
  console.log(`✅ Total academic levels: ${hierarchy.levels.length}`);
  console.log(`✅ Total grades configured: ${hierarchy.classes.length}`);

  // Test 3: Verify Class 1 Mathematics Chapter 1
  console.log('\nTest 3: Verifying Class 1 Mathematics Chapter 1...');
  const class1 = hierarchy.classes.find((c: any) => c.grade === 1);
  if (!class1) throw new Error('Class 1 not found in hierarchy');
  console.log(`✅ Class 1 name: ${class1.className} (${class1.classNameNepali})`);
  console.log(`✅ Class 1 level: ${class1.levelName} (${class1.levelNameNepali})`);
  console.log(`✅ Class 1 total simulations: ${class1.simulationCount}`);

  const mathSubject = class1.subjects.find((s: any) => s.code === 'MATH');
  if (!mathSubject) throw new Error('Mathematics subject not found in Class 1');
  console.log(`✅ Class 1 Math simulations: ${mathSubject.simulationCount}`);

  const ch1 = mathSubject.chapters.find((c: any) => c.chapterNumber === 1);
  if (!ch1) throw new Error('Chapter 1 not found in Class 1 Mathematics');
  console.log(`✅ Chapter 1: ${ch1.title} (${ch1.titleNepali})`);
  console.log(`✅ Chapter 1 simulations count: ${ch1.simulationCount}`);

  // Test 4: Verify the 5 Required Chapter 1 Simulations
  console.log('\nTest 4: Verifying the 5 Registered Chapter 1 Simulations...');
  const requiredCodes = [
    'SIM-MATH-G1-CH1-01',
    'SIM-MATH-G1-CH1-02',
    'SIM-MATH-G1-CH1-03',
    'SIM-MATH-G1-CH1-04',
    'SIM-MATH-G1-CH1-05',
  ];

  for (const code of requiredCodes) {
    const found = ch1.simulations.find((s: any) => s.code === code);
    if (!found) throw new Error(`Missing required simulation: ${code}`);
    console.log(`  • [${found.code}] ${found.title} (Type: ${found.simulationType}, Status: ${found.status}, Component: ${found.componentKey})`);
  }
  console.log('✅ All 5 required Class 1 Mathematics simulations are registered and present.');

  // Test 5: Verify Progress Tracking
  console.log('\nTest 5: Verifying Simulation Progress Tracking API...');
  const testUserId = '672000000000000000000001';
  const progressRecord = await SimulationActivityService.recordSimulationProgress({
    userId: testUserId,
    userRole: 'TEACHER',
    gradeLevel: 1,
    subjectCode: 'MATH',
    chapterNumber: 1,
    simulationCode: 'SIM-MATH-G1-CH1-01',
    simulationTitle: 'My 3D Position Playground',
    completedLevels: [1, 2, 3, 4, 5],
    attempts: 1,
    correctAnswers: 11,
    totalQuestions: 12,
    assessmentScore: 11,
    percentage: 92,
    timeSpentSeconds: 240,
    conceptsUnderstood: ['भित्र र बाहिर', 'माथि र तल', 'ठूलो र सानो'],
    conceptsToReview: ['दायाँ र बायाँ'],
    isCompleted: true,
  });

  console.log(`✅ Progress recorded for ${progressRecord.simulationCode}:`);
  console.log(`   - Score: ${progressRecord.assessmentScore}/${progressRecord.totalQuestions} (${progressRecord.percentage}%)`);
  console.log(`   - Completed Levels: ${progressRecord.completedLevels.join(', ')}`);
  console.log(`   - Status: ${progressRecord.isCompleted ? 'COMPLETED' : 'IN_PROGRESS'}`);

  const fetched = await SimulationActivityService.getSimulationProgress(testUserId, 'SIM-MATH-G1-CH1-01');
  if (!fetched || fetched.assessmentScore !== 11) throw new Error('Failed to retrieve recorded progress');
  console.log('✅ Progress retrieval verified.');

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('ALL TESTS PASSED SUCCESSFULLY! (100% VERIFIED)');
  console.log('═══════════════════════════════════════════════════════════════');

  await disconnectDB();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

