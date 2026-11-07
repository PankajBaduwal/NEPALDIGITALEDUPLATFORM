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

/** One line of a teacher's daily teaching diary / lesson plan for a section and subject. */
const TeachingDiaryEntrySchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', required: true, index: true },
    date: { type: Date, required: true, index: true },
    periodNumber: { type: Number },
    chapterNumber: { type: Number },
    chapterTitle: { type: String, default: '', maxlength: 300 },
    topic: { type: String, required: true, trim: true, maxlength: 300 },
    objective: { type: String, default: '', maxlength: 1500 },
    activities: { type: String, default: '', maxlength: 2000 },
    homework: { type: String, default: '', maxlength: 1000 },
    status: { type: String, enum: ['PLANNED', 'TAUGHT', 'SKIPPED'], default: 'PLANNED', index: true },
  },
  { timestamps: true, ...clean }
);
TeachingDiaryEntrySchema.index({ teacherId: 1, sectionId: 1, centralSubjectId: 1, date: -1 });

/** A record of an absence notice prepared or sent by a class teacher. */
const AbsenceNoticeSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sentBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    batchId: { type: String, index: true },
    date: { type: Date, required: true, index: true },
    guardianName: { type: String },
    phone: { type: String },
    language: { type: String, enum: ['en', 'ne'], default: 'en' },
    message: { type: String, required: true },
    channels: { type: [String], default: [] },
    smsStatus: { type: String, enum: ['SENT', 'PREPARED', 'FAILED', 'SKIPPED'], default: 'SKIPPED' },
    smsError: { type: String },
    inAppStatus: { type: String, enum: ['SENT', 'SKIPPED', 'FAILED'], default: 'SKIPPED' },
  },
  { timestamps: true, ...clean }
);
AbsenceNoticeSchema.index({ sectionId: 1, studentId: 1, date: 1 });

/** A teacher's own course outline, used when the textbook's chapters are not mapped in the system. */
const TeachingPlanSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', required: true },
    chapters: [{ _id: false, number: Number, title: { type: String, maxlength: 200 } }],
  },
  { timestamps: true, ...clean }
);
TeachingPlanSchema.index({ teacherId: 1, sectionId: 1, centralSubjectId: 1 }, { unique: true });

export const TeachingPlan = mongoose.models.TeachingPlan || mongoose.model('TeachingPlan', TeachingPlanSchema, 'teachingPlans');
export const TeachingDiaryEntry = mongoose.models.TeachingDiaryEntry || mongoose.model('TeachingDiaryEntry', TeachingDiaryEntrySchema, 'teachingDiary');
export const AbsenceNotice = mongoose.models.AbsenceNotice || mongoose.model('AbsenceNotice', AbsenceNoticeSchema, 'absenceNotices');
