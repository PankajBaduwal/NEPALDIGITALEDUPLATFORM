import mongoose, { Schema, Document } from 'mongoose';

// School Announcement
export interface ISchoolAnnouncement extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  title: string;
  content: string;
  targetAudience: 'ALL' | 'TEACHERS' | 'STUDENTS';
  publishedBy: mongoose.Types.ObjectId | string;
  publishedAt: Date;
  announcementType?: 'INSTITUTIONAL' | 'CLASS_OVERALL' | 'SUBJECT_SPECIFIC';
  sectionId?: mongoose.Types.ObjectId | string;
  subjectId?: mongoose.Types.ObjectId | string;
  subjectName?: string;
  className?: string;
  authorRole?: string;
  authorName?: string;
  priority?: 'NORMAL' | 'URGENT' | 'HIGH';
  platformBatchId?: string;
  platformScope?: string;
}

const SchoolAnnouncementSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    targetAudience: { type: String, enum: ['ALL', 'TEACHERS', 'STUDENTS'], default: 'ALL' },
    publishedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date, default: Date.now },
    announcementType: {
      type: String,
      enum: ['INSTITUTIONAL', 'CLASS_OVERALL', 'SUBJECT_SPECIFIC'],
      default: 'INSTITUTIONAL',
    },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', default: null },
    subjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', default: null },
    subjectName: { type: String, default: '' },
    className: { type: String, default: '' },
    authorRole: { type: String, default: '' },
    authorName: { type: String, default: '' },
    priority: { type: String, enum: ['NORMAL', 'URGENT', 'HIGH'], default: 'NORMAL' },
    // set when a Super Admin sends one message to many schools
    platformBatchId: { type: String, index: true },
    platformScope: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        // keep a populated publisher ({ fullName, role }) instead of turning it into "[object Object]"
        if (!(ret.publishedBy && typeof ret.publishedBy === 'object' && !(ret.publishedBy as any)._bsontype && (ret.publishedBy as any).fullName !== undefined)) ret.publishedBy = ret.publishedBy?.toString();
        if (ret.sectionId) ret.sectionId = ret.sectionId?.toString();
        if (ret.subjectId) ret.subjectId = ret.subjectId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// System Announcement (Super Admin)
export interface ISystemAnnouncement extends Document {
  id: string;
  title: string;
  content: string;
  targetRole: string;
  isActive: boolean;
  publishedAt: Date;
}

const SystemAnnouncementSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    targetRole: { type: String, default: 'ALL' },
    isActive: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Audit Log
export interface IAuditLog extends Document {
  id: string;
  institutionId?: mongoose.Types.ObjectId | string;
  operatorId: mongoose.Types.ObjectId | string;
  operatorRole: string;
  action: string;
  targetEntity: string;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema(
  {
    institutionId: { type: Schema.Types.Mixed, index: true },
    operatorId: { type: Schema.Types.Mixed, index: true },
    operatorRole: { type: String, default: 'SUPER_ADMIN' },
    action: { type: String, required: true },
    targetEntity: { type: String, required: true },
    targetId: { type: String },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        if (ret.institutionId) ret.institutionId = ret.institutionId.toString();
        ret.operatorId = ret.operatorId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const SchoolAnnouncement = mongoose.models.SchoolAnnouncement || mongoose.model<ISchoolAnnouncement>('SchoolAnnouncement', SchoolAnnouncementSchema);
export const SystemAnnouncement = mongoose.models.SystemAnnouncement || mongoose.model<ISystemAnnouncement>('SystemAnnouncement', SystemAnnouncementSchema);
export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

