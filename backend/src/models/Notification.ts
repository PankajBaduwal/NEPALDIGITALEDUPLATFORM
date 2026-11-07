import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'ASSIGNMENT_DEADLINE'
  | 'ASSIGNMENT_NEW'
  | 'ATTENDANCE_WARNING'
  | 'MARKS_PUBLISHED'
  | 'TIMETABLE_PUBLISHED'
  | 'ANNOUNCEMENT'
  | 'SYSTEM_ALERT';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface INotification extends Document {
  id: string;
  recipientId: mongoose.Types.ObjectId | string;
  institutionId: mongoose.Types.ObjectId | string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    type: {
      type: String,
      enum: [
        'ASSIGNMENT_DEADLINE',
        'ASSIGNMENT_NEW',
        'ATTENDANCE_WARNING',
        'MARKS_PUBLISHED',
        'TIMETABLE_PUBLISHED',
        'ANNOUNCEMENT',
        'SYSTEM_ALERT',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    priority: {
      type: String,
      enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'],
      default: 'NORMAL',
      index: true,
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.recipientId = ret.recipientId?.toString();
        ret.institutionId = ret.institutionId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ institutionId: 1, type: 1 });

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema, 'notifications');

