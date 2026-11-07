import mongoose from 'mongoose';
import { Institution, User, Class, Section, StudentEnrollment } from './models';
import { Notification } from './models/Notification';
import { NotificationService } from './modules/notifications/notification.service';

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

async function runModule10Tests() {
  console.log('\n===============================================================');
  console.log(' MODULE 10: NOTIFICATIONS & INSTITUTION COMMUNICATION AUDIT    ');
  console.log('===============================================================\n');

  await mongoose.connect(MONGO_URI);

  // 1. Setup Test Fixtures
  let instA = await Institution.findOne({ emisCode: '270010001' });
  if (!instA) instA = await Institution.findOne();
  if (!instA) throw new Error('No institution found');

  let instB = await Institution.findOne({ emisCode: '270020002' });
  if (!instB) {
    instB = await Institution.create({
      name: 'Himalayan Model Academy',
      code: 'HIMALAYAN-TEST',
      emisCode: '270020002',
      type: 'COMMUNITY',
      province: 'Bagmati',
      district: 'Lalitpur',
      localLevel: 'Lalitpur Metropolitan City',
      subscriptionTier: 'MIDDLE_SCHOOL',
    });
  }

  // Students in School A
  let student1 = await User.findOne({ email: 'student1.notif@sunrise.edu.np' });
  if (!student1) {
    student1 = await User.create({
      fullName: 'Suman Shrestha',
      email: 'student1.notif@sunrise.edu.np',
      username: 'suman_notif',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role: 'STUDENT',
      institutionId: instA._id,
      roles: ['STUDENT'],
    });
  }

  let student2 = await User.findOne({ email: 'student2.notif@sunrise.edu.np' });
  if (!student2) {
    student2 = await User.create({
      fullName: 'Pooja Karki',
      email: 'student2.notif@sunrise.edu.np',
      username: 'pooja_notif',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role: 'STUDENT',
      institutionId: instA._id,
      roles: ['STUDENT'],
    });
  }

  // Student in School B (Cross-Tenant check)
  let studentB = await User.findOne({ email: 'student.himalayan@himalayan.edu.np' });
  if (!studentB) {
    studentB = await User.create({
      fullName: 'Kiran Thapa',
      email: 'student.himalayan@himalayan.edu.np',
      username: 'kiran_himalayan',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890',
      role: 'STUDENT',
      institutionId: instB._id,
      roles: ['STUDENT'],
    });
  }

  // Class & Sections in School A
  let testClass = await Class.findOne({ institutionId: instA._id, gradeNumber: 10 });
  if (!testClass) {
    testClass = await Class.create({
      institutionId: instA._id,
      name: 'Class 10',
      gradeNumber: 10,
      stream: 'GENERAL',
      academicYear: '2081',
    });
  }

  let secA = await Section.findOne({ classId: testClass._id, name: 'Section 10-A' });
  if (!secA) {
    secA = await Section.create({
      institutionId: instA._id,
      classId: testClass._id,
      name: 'Section 10-A',
      academicYearId: new mongoose.Types.ObjectId(),
    });
  }

  let secB = await Section.findOne({ classId: testClass._id, name: 'Section 10-B' });
  if (!secB) {
    secB = await Section.create({
      institutionId: instA._id,
      classId: testClass._id,
      name: 'Section 10-B',
      academicYearId: new mongoose.Types.ObjectId(),
    });
  }

  // Enrollments
  await StudentEnrollment.findOneAndUpdate(
    { studentId: student1._id },
    {
      studentId: student1._id,
      institutionId: instA._id,
      academicYearId: new mongoose.Types.ObjectId(),
      classId: testClass._id,
      sectionId: secA._id,
      admissionNumber: 'ADM-NOTIF-01',
      rollNumber: 1,
      status: 'ENROLLED',
      admissionDate: new Date(),
    },
    { upsert: true }
  );

  await StudentEnrollment.findOneAndUpdate(
    { studentId: student2._id },
    {
      studentId: student2._id,
      institutionId: instA._id,
      academicYearId: new mongoose.Types.ObjectId(),
      classId: testClass._id,
      sectionId: secA._id,
      admissionNumber: 'ADM-NOTIF-02',
      rollNumber: 2,
      status: 'ENROLLED',
      admissionDate: new Date(),
    },
    { upsert: true }
  );

  // Clear previous test notifications
  await Notification.deleteMany({
    recipientId: { $in: [student1._id, student2._id, studentB._id] },
  });

  // ── TEST SUITE 1: Targeted Attendance Warning (NEB 75% Rule) ──
  console.log('\n--- 1. Attendance Warning Notification ---');
  const attWarning = await NotificationService.triggerAttendanceWarning({
    studentId: student1._id.toString(),
    institutionId: instA._id.toString(),
    studentName: student1.fullName,
    attendancePercentage: 68.5,
  });

  assertTest(
    'Attendance Warning Notification Created with High Priority',
    'type: ATTENDANCE_WARNING, priority: HIGH',
    `type: ${attWarning.type}, priority: ${attWarning.priority}`,
    attWarning.type === 'ATTENDANCE_WARNING' && attWarning.priority === 'HIGH'
  );

  assertTest(
    'Attendance Notification Message Contains Exact Percentage and NEB Rule',
    'contains "68.5%" & "NEB"',
    attWarning.message,
    attWarning.message.includes('68.5%') && attWarning.message.includes('NEB')
  );

  // ── TEST SUITE 2: Scoped Broadcast (Marks Published) ──
  console.log('\n--- 2. Scoped Audience Broadcast (Marks Published) ---');
  const marksBroadcast = await NotificationService.triggerMarksPublished({
    institutionId: instA._id.toString(),
    sectionId: secA._id.toString(),
    examTitle: 'First Terminal Examination 2081',
    subjectName: 'Compulsory Science',
  });

  assertTest(
    'Marks Published Broadcast Sent to All Enrolled Section 10-A Students',
    'sentCount: 2',
    `sentCount: ${marksBroadcast.sentCount}`,
    marksBroadcast.sentCount === 2
  );

  // ── TEST SUITE 3: Assignment Deadline Reminder ──
  console.log('\n--- 3. Assignment Deadline Reminder ---');
  const deadlineDate = new Date(Date.now() + 86400000 * 2);
  const deadlineBroadcast = await NotificationService.triggerAssignmentDeadlineReminder({
    institutionId: instA._id.toString(),
    sectionId: secA._id.toString(),
    assignmentTitle: 'Newton Laws Numerical Problems',
    dueDate: deadlineDate,
  });

  assertTest(
    'Assignment Deadline Reminder Delivered to Section Students',
    'sentCount: 2',
    `sentCount: ${deadlineBroadcast.sentCount}`,
    deadlineBroadcast.sentCount === 2
  );

  // ── TEST SUITE 4: Unread Count and Listing ──
  console.log('\n--- 4. Unread Notification Counts & Query Filtering ---');
  // student1 received: 1 attendance warning + 1 marks published + 1 assignment reminder = 3 notifications
  const userNotifs = await NotificationService.getUserNotifications(
    student1._id.toString(),
    instA._id.toString()
  );

  assertTest(
    'Student 1 Has Exactly 3 Unread Notifications',
    'items: 3, unreadCount: 3',
    `items: ${userNotifs.items.length}, unreadCount: ${userNotifs.unreadCount}`,
    userNotifs.items.length === 3 && userNotifs.unreadCount === 3
  );

  // ── TEST SUITE 5: Mark Single Notification as Read ──
  console.log('\n--- 5. Single Notification Mark-As-Read ---');
  const firstNotifId = userNotifs.items[0]._id.toString();
  const readSuccess = await NotificationService.markAsRead(firstNotifId, student1._id.toString());

  const afterSingleRead = await NotificationService.getUserNotifications(
    student1._id.toString(),
    instA._id.toString()
  );

  assertTest(
    'Single Notification Marked as Read Decrements Unread Counter to 2',
    'readSuccess: true, unreadCount: 2',
    `readSuccess: ${readSuccess}, unreadCount: ${afterSingleRead.unreadCount}`,
    readSuccess === true && afterSingleRead.unreadCount === 2
  );

  // ── TEST SUITE 6: Mark All Notifications as Read ──
  console.log('\n--- 6. Bulk Mark-All-As-Read ---');
  const modifiedCount = await NotificationService.markAllAsRead(
    student1._id.toString(),
    instA._id.toString()
  );

  const afterBulkRead = await NotificationService.getUserNotifications(
    student1._id.toString(),
    instA._id.toString()
  );

  assertTest(
    'Mark All As Read Clears All Remaining Unread Notifications (unreadCount: 0)',
    'modified: 2, unreadCount: 0',
    `modified: ${modifiedCount}, unreadCount: ${afterBulkRead.unreadCount}`,
    modifiedCount === 2 && afterBulkRead.unreadCount === 0
  );

  // ── TEST SUITE 7: Tenant Scoping & Isolation ──
  console.log('\n--- 7. Cross-Tenant Notification Isolation ---');
  const studentBNotifs = await NotificationService.getUserNotifications(
    studentB._id.toString(),
    instB._id.toString()
  );

  assertTest(
    'Student in Institution B Receives Zero Notifications from Institution A',
    'unreadCount: 0, items: 0',
    `unreadCount: ${studentBNotifs.unreadCount}, items: ${studentBNotifs.items.length}`,
    studentBNotifs.unreadCount === 0 && studentBNotifs.items.length === 0
  );

  // ── FINAL SUMMARY ──
  console.log('\n===============================================================');
  console.log('                MODULE 10 AUDIT RESULTS SUMMARY                ');
  console.log('===============================================================');
  const passedCount = testResults.filter((r) => r.status === 'PASSED').length;
  console.log(`TOTAL AUDIT CHECKS: ${testResults.length}`);
  console.log(`PASSED: ${passedCount} (${((passedCount / testResults.length) * 100).toFixed(1)}%)`);
  console.log(`FAILED: ${testResults.length - passedCount}`);

  await mongoose.disconnect();
  process.exit(passedCount === testResults.length ? 0 : 1);
}

runModule10Tests().catch((err) => {
  console.error('Fatal Module 10 Test Error:', err);
  process.exit(1);
});
