import mongoose, { Schema } from 'mongoose';

const clean = {
  toJSON: {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      ret.id = String(ret._id);
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};
const ref = (to: string, extra: any = {}) => ({ type: Schema.Types.ObjectId, ref: to, ...extra });

/** An emergency broadcast (school closed, weather or safety alert) sent by the principal. */
const EmergencyAlertSchema = new Schema(
  {
    institutionId: ref('Institution', { required: true, index: true }),
    kind: { type: String, enum: ['CLOSURE', 'WEATHER', 'SAFETY', 'OTHER'], default: 'CLOSURE' },
    title: { type: String, required: true, maxlength: 160 },
    message: { type: String, required: true, maxlength: 480 },
    closureDate: { type: Date },
    audience: { teachers: { type: Boolean, default: true }, students: { type: Boolean, default: true }, guardiansSms: { type: Boolean, default: true } },
    sentBy: ref('User', { required: true }),
    status: { type: String, enum: ['ACTIVE', 'CLEARED'], default: 'ACTIVE', index: true },
    clearedAt: { type: Date },
    clearMessage: { type: String },
    stats: {
      inApp: { type: Number, default: 0 },
      smsSent: { type: Number, default: 0 },
      smsPrepared: { type: Number, default: 0 },
      smsFailed: { type: Number, default: 0 },
      smsInvalid: { type: Number, default: 0 },
      smsConfigured: { type: Boolean, default: false },
    },
  },
  { timestamps: true, ...clean }
);

/** Server-side history of notices the principal has sent (replaces the browser-only log). */
const PrincipalNoticeSchema = new Schema(
  {
    institutionId: ref('Institution', { required: true, index: true }),
    sentBy: ref('User', { required: true }),
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, default: '', maxlength: 2000 },
    recipient: { type: String, default: '', maxlength: 200 },
    recipientRole: { type: String, enum: ['STUDENT', 'TEACHER', 'ALL'], default: 'ALL' },
    type: { type: String, default: 'ANNOUNCEMENT', maxlength: 40 },
    priority: { type: String, enum: ['HIGH', 'NORMAL', 'URGENT'], default: 'NORMAL' },
  },
  { timestamps: true, ...clean }
);
PrincipalNoticeSchema.index({ institutionId: 1, createdAt: -1 });

/** A teacher who is away on a day; the cover plan fills their periods. */
const TeacherAbsenceSchema = new Schema(
  {
    institutionId: ref('Institution', { required: true, index: true }),
    teacherId: ref('User', { required: true, index: true }),
    date: { type: Date, required: true, index: true },
    leaveType: { type: String, enum: ['SICK', 'CASUAL', 'OFFICIAL', 'OTHER'], default: 'SICK' },
    reason: { type: String, default: '', maxlength: 300 },
    recordedBy: ref('User', { required: true }),
    periodsAffected: { type: Number, default: 0 },
    periodsCovered: { type: Number, default: 0 },
  },
  { timestamps: true, ...clean }
);
TeacherAbsenceSchema.index({ institutionId: 1, teacherId: 1, date: 1 }, { unique: true });

/** The school's stamp and the principal's signature (PNG), used on approved marksheets, certificates and reports. */
const SchoolSealSchema = new Schema(
  {
    institutionId: ref('Institution', { required: true, unique: true }),
    stamp: { type: Buffer },
    signature: { type: Buffer },
    signerName: { type: String, default: '', maxlength: 120 },
    signerTitle: { type: String, default: 'Principal', maxlength: 80 },
    updatedBy: ref('User'),
  },
  { timestamps: true, ...clean }
);

/** A transfer (leaving) certificate issued by the school. */
const TransferCertificateSchema = new Schema(
  {
    institutionId: ref('Institution', { required: true, index: true }),
    studentId: ref('User', { required: true, index: true }),
    certificateNumber: { type: String, required: true },
    issuedBy: ref('User', { required: true }),
    issuedOn: { type: Date, default: Date.now },
    leavingDate: { type: Date, required: true },
    reason: { type: String, default: '', maxlength: 300 },
    conduct: { type: String, default: 'Good', maxlength: 60 },
    duesCleared: { type: Boolean, default: true },
    remarks: { type: String, default: '', maxlength: 400 },
    snapshot: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, ...clean }
);
TransferCertificateSchema.index({ institutionId: 1, certificateNumber: 1 }, { unique: true });

export const EmergencyAlert = mongoose.models.EmergencyAlert || mongoose.model('EmergencyAlert', EmergencyAlertSchema, 'emergencyAlerts');
export const PrincipalNotice = mongoose.models.PrincipalNotice || mongoose.model('PrincipalNotice', PrincipalNoticeSchema, 'principalNotices');
export const TeacherAbsence = mongoose.models.TeacherAbsence || mongoose.model('TeacherAbsence', TeacherAbsenceSchema, 'teacherAbsences');
export const SchoolSeal = mongoose.models.SchoolSeal || mongoose.model('SchoolSeal', SchoolSealSchema, 'schoolSeals');
export const TransferCertificate = mongoose.models.TransferCertificate || mongoose.model('TransferCertificate', TransferCertificateSchema, 'transferCertificates');
