import mongoose from 'mongoose';
import {
  Notification,
  INotification,
  NotificationType,
  NotificationPriority,
  StudentEnrollment,
  User,
} from '../../models';
import { SocketService } from '../../common/services/socket.service';

export class NotificationService {
  /**
   * Create a direct targeted notification for a specific user.
   */
  static async sendNotification(params: {
    recipientId: string;
    institutionId: string;
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    metadata?: Record<string, any>;
  }): Promise<INotification> {
    const notification = new Notification({
      recipientId: params.recipientId,
      institutionId: params.institutionId,
      type: params.type,
      title: params.title,
      message: params.message,
      priority: params.priority || 'NORMAL',
      metadata: params.metadata || {},
      isRead: false,
    });
    const saved = await notification.save();
    SocketService.emitNotification(String(params.recipientId), saved.toJSON ? saved.toJSON() : saved);
    return saved;
  }

  /**
   * Broadcast notification to a scoped audience (e.g. all students in a section, or all teachers in an institution).
   */
  static async broadcastNotification(params: {
    institutionId: string;
    audience: 'ALL' | 'STUDENTS' | 'TEACHERS';
    classId?: string;
    sectionId?: string;
    type: NotificationType;
    title: string;
    message: string;
    priority?: NotificationPriority;
    metadata?: Record<string, any>;
  }): Promise<{ sentCount: number }> {
    const { institutionId, audience, classId, sectionId, type, title, message, priority, metadata } = params;
    let recipientIds: string[] = [];

    if (audience === 'STUDENTS') {
      if (sectionId) {
        const enrollments = await StudentEnrollment.find({
          sectionId,
          status: { $in: ['ENROLLED', 'ACTIVE'] },
        }).select('studentId');
        recipientIds = enrollments.map((e) => e.studentId.toString());
      } else if (classId) {
        const sections = await mongoose.model('Section').find({ classId }).select('_id');
        const secIds = sections.map((s) => s._id);
        const enrollments = await StudentEnrollment.find({
          sectionId: { $in: secIds },
          status: { $in: ['ENROLLED', 'ACTIVE'] },
        }).select('studentId');
        recipientIds = enrollments.map((e) => e.studentId.toString());
      } else {
        const students = await User.find({ institutionId, role: 'STUDENT' }).select('_id');
        recipientIds = students.map((s) => s._id.toString());
      }
    } else if (audience === 'TEACHERS') {
      const teachers = await User.find({ institutionId, role: 'TEACHER' }).select('_id');
      recipientIds = teachers.map((t) => t._id.toString());
    } else {
      // ALL users in the institution
      const allUsers = await User.find({ institutionId }).select('_id');
      recipientIds = allUsers.map((u) => u._id.toString());
    }

    if (recipientIds.length === 0) {
      return { sentCount: 0 };
    }

    const docs = recipientIds.map((rId) => ({
      recipientId: new mongoose.Types.ObjectId(rId),
      institutionId: new mongoose.Types.ObjectId(institutionId),
      type,
      title,
      message,
      priority: priority || 'NORMAL',
      metadata: metadata || {},
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const inserted = await Notification.insertMany(docs);
    inserted.forEach((n: any) => SocketService.emitNotification(String(n.recipientId), n.toJSON ? n.toJSON() : n));
    return { sentCount: docs.length };
  }

  /**
   * Retrieve notifications for a user with unread counter.
   */
  static async getUserNotifications(
    userId: string,
    institutionId: string,
    options?: { unreadOnly?: boolean; limit?: number }
  ) {
    const query: any = { recipientId: userId, institutionId };
    if (options?.unreadOnly) {
      query.isRead = false;
    }

    const limit = options?.limit || 50;
    const items = await Notification.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    const unreadCount = await Notification.countDocuments({ recipientId: userId, institutionId, isRead: false });

    return { items, unreadCount };
  }

  /**
   * Mark single notification as read.
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const result = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true, readAt: new Date() },
      { returnDocument: 'after' }
    );
    return !!result;
  }

  /**
   * Mark all unread notifications for a user as read.
   */
  static async markAllAsRead(userId: string, institutionId: string): Promise<number> {
    const result = await Notification.updateMany(
      { recipientId: userId, institutionId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return result.modifiedCount;
  }

  // ── PRESET NOTIFICATION TRIGGERS ──────────────────────────────

  /**
   * Trigger high-priority warning when student attendance dips below the 75% NEB threshold.
   */
  static async triggerAttendanceWarning(params: {
    studentId: string;
    institutionId: string;
    studentName: string;
    attendancePercentage: number;
  }) {
    return await this.sendNotification({
      recipientId: params.studentId,
      institutionId: params.institutionId,
      type: 'ATTENDANCE_WARNING',
      priority: 'HIGH',
      title: '⚠️ Attendance Warning (NEB 75% Requirement)',
      message: `Dear ${params.studentName}, your current academic attendance is ${params.attendancePercentage}%, which is below the mandatory 75% threshold required by the National Examination Board (NEB) for exam qualification.`,
      metadata: { attendancePercentage: params.attendancePercentage },
    });
  }

  /**
   * Trigger notification to students when exam marks are officially published.
   */
  static async triggerMarksPublished(params: {
    institutionId: string;
    sectionId: string;
    examTitle: string;
    subjectName: string;
  }) {
    return await this.broadcastNotification({
      institutionId: params.institutionId,
      audience: 'STUDENTS',
      sectionId: params.sectionId,
      type: 'MARKS_PUBLISHED',
      priority: 'HIGH',
      title: `📊 Examination Marks Published: ${params.examTitle}`,
      message: `Official marks for ${params.subjectName} (${params.examTitle}) have been approved and published. You may view your graded scorecard in your student dashboard.`,
      metadata: { examTitle: params.examTitle, subjectName: params.subjectName },
    });
  }

  /**
   * Trigger assignment deadline reminder.
   */
  static async triggerAssignmentDeadlineReminder(params: {
    institutionId: string;
    sectionId: string;
    assignmentTitle: string;
    dueDate: Date;
  }) {
    const formattedDate = new Date(params.dueDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return await this.broadcastNotification({
      institutionId: params.institutionId,
      audience: 'STUDENTS',
      sectionId: params.sectionId,
      type: 'ASSIGNMENT_DEADLINE',
      priority: 'NORMAL',
      title: `⏰ Assignment Due Soon: ${params.assignmentTitle}`,
      message: `Reminder: The deadline for '${params.assignmentTitle}' is ${formattedDate}. Please complete and submit your work on time.`,
      metadata: { assignmentTitle: params.assignmentTitle, dueDate: params.dueDate },
    });
  }
}
