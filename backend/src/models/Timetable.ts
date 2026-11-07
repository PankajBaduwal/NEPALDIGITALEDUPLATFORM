import mongoose, { Schema, Document } from 'mongoose';

/** Serialise a reference: ObjectIds become strings, populated documents are kept as objects. */
const refOut = (v: any) => (v && typeof v === 'object' && !(v instanceof mongoose.Types.ObjectId) ? v : v?.toString());

// ══════════════════════════════════════════════════════════════════
// 1. SCHOOL PERIOD (Academic Periods & Breaks)
// ══════════════════════════════════════════════════════════════════
export type BreakType = 'NONE' | 'SHORT_BREAK' | 'LUNCH' | 'ASSEMBLY';

export interface ISchoolPeriod extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  academicYearId?: mongoose.Types.ObjectId | string;
  name: string; // e.g. "Period 1", "Morning Assembly", "Tiffin Break"
  periodNumber: number; // 0 for assembly/breaks, 1..8 for academic periods
  startTime: string; // "10:00"
  endTime: string; // "10:45"
  durationMinutes: number; // 45
  isBreak: boolean;
  breakType: BreakType;
  /** Sort key across teaching periods and breaks, in minutes from midnight. */
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolPeriodSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', index: true },
    name: { type: String, required: true },
    periodNumber: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    durationMinutes: { type: Number, required: true, default: 45 },
    isBreak: { type: Boolean, default: false },
    breakType: {
      type: String,
      enum: ['NONE', 'SHORT_BREAK', 'LUNCH', 'ASSEMBLY'],
      default: 'NONE',
    },
    sortOrder: { type: Number },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = refOut(ret.institutionId);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
SchoolPeriodSchema.index({ institutionId: 1, periodNumber: 1 });

// ══════════════════════════════════════════════════════════════════
// 2. TIMETABLE TEMPLATE (Working Days & Shift Timings)
// ══════════════════════════════════════════════════════════════════
export interface ITimetableTemplate extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  academicYearId: mongoose.Types.ObjectId | string;
  name: string;
  workingDays: string[]; // ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
  schoolStartTime: string; // "10:00"
  schoolEndTime: string; // "16:00"
  periods: ISchoolPeriod[];
  periodDurationMinutes?: number;
  numberOfPeriods?: number;
  breaks?: Array<{ name: string; afterPeriod?: number; startTime?: string; endTime?: string; durationMinutes: number; breakType: BreakType }>;
  isDefault: boolean;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
}

const TimetableTemplateSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    name: { type: String, required: true },
    workingDays: {
      type: [String],
      default: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
    },
    schoolStartTime: { type: String, default: '10:00' },
    schoolEndTime: { type: String, default: '16:00' },
    periodDurationMinutes: { type: Number },
    numberOfPeriods: { type: Number },
    breaks: [
      {
        name: { type: String, required: true },
        afterPeriod: { type: Number },
        startTime: { type: String },
        endTime: { type: String },
        durationMinutes: { type: Number, required: true },
        breakType: { type: String, enum: ['SHORT_BREAK', 'LUNCH', 'ASSEMBLY'], default: 'LUNCH' },
      },
    ],
    isDefault: { type: Boolean, default: true },
    status: { type: String, enum: ['ACTIVE', 'DRAFT', 'ARCHIVED'], default: 'ACTIVE' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = refOut(ret.institutionId);
        ret.academicYearId = refOut(ret.academicYearId);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
TimetableTemplateSchema.index({ institutionId: 1, academicYearId: 1, name: 1 }, { unique: true });

// ══════════════════════════════════════════════════════════════════
// 3. TIMETABLE ENTRY (Class -> Section -> Day -> Period -> Subject -> Teacher -> Room)
// ══════════════════════════════════════════════════════════════════
export type DayOfWeekType =
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY';

export interface ITimetableEntry extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  academicYearId?: mongoose.Types.ObjectId | string;
  templateId?: mongoose.Types.ObjectId | string;
  timetableId?: mongoose.Types.ObjectId | string;
  classId?: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  medium?: 'ENGLISH' | 'NEPALI';
  textbookId?: mongoose.Types.ObjectId | string;
  dayOfWeek: DayOfWeekType;
  periodNumber: number;
  periodId?: mongoose.Types.ObjectId | string;
  startTime: string;
  endTime: string;
  centralSubjectId: mongoose.Types.ObjectId | string;
  teacherId: mongoose.Types.ObjectId | string;
  roomNumber?: string;
  isDoublePeriod?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimetableEntrySchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', index: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'TimetableTemplate', index: true },
    timetableId: { type: Schema.Types.ObjectId, ref: 'Timetable', index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    medium: { type: String, enum: ['ENGLISH', 'NEPALI'] },
    textbookId: { type: Schema.Types.ObjectId, ref: 'Textbook' },
    dayOfWeek: {
      type: String,
      enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
      required: true,
      index: true,
    },
    periodNumber: { type: Number, required: true },
    periodId: { type: Schema.Types.ObjectId, ref: 'SchoolPeriod' },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roomNumber: { type: String, default: 'Classroom' },
    isDoublePeriod: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = refOut(ret.institutionId);
        ret.sectionId = refOut(ret.sectionId);
        ret.centralSubjectId = refOut(ret.centralSubjectId);
        ret.teacherId = refOut(ret.teacherId);
        if (ret.classId) ret.classId = refOut(ret.classId);
        if (ret.timetableId) ret.timetableId = refOut(ret.timetableId);
        if (ret.textbookId) ret.textbookId = refOut(ret.textbookId);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound Indices for Conflict Prevention:
// 1. No two subjects in the same timetable version at the same day/period
TimetableEntrySchema.index(
  { timetableId: 1, dayOfWeek: 1, periodNumber: 1 },
  { unique: true, partialFilterExpression: { timetableId: { $exists: true } } }
);
TimetableEntrySchema.index({ sectionId: 1, dayOfWeek: 1, periodNumber: 1 });
// 2. Fast lookup for teacher schedule & clashes
TimetableEntrySchema.index({ teacherId: 1, dayOfWeek: 1, periodNumber: 1 });
// 3. Fast lookup for room schedule & clashes
TimetableEntrySchema.index({ institutionId: 1, roomNumber: 1, dayOfWeek: 1, periodNumber: 1 });

// ══════════════════════════════════════════════════════════════════
// 3b. TIMETABLE (one version of a section's weekly timetable)
// ══════════════════════════════════════════════════════════════════
export type TimetableStatus = 'DRAFT' | 'UNDER_REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface ITimetable extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  academicYearId: mongoose.Types.ObjectId | string;
  classId: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  medium: 'ENGLISH' | 'NEPALI';
  version: number;
  status: TimetableStatus;
  basedOnVersion?: number;
  createdBy: mongoose.Types.ObjectId | string;
  submittedBy?: mongoose.Types.ObjectId | string;
  submittedAt?: Date;
  publishedBy?: mongoose.Types.ObjectId | string;
  publishedAt?: Date;
  archivedAt?: Date;
  lastValidation?: { errors: number; warnings: number; checkedAt: Date };
  createdAt: Date;
  updatedAt: Date;
}

const TimetableSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    medium: { type: String, enum: ['ENGLISH', 'NEPALI'], required: true },
    version: { type: Number, required: true },
    status: { type: String, enum: ['DRAFT', 'UNDER_REVIEW', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT', index: true },
    basedOnVersion: { type: Number },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    submittedAt: { type: Date },
    publishedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    publishedAt: { type: Date },
    archivedAt: { type: Date },
    lastValidation: {
      errors: { type: Number },
      warnings: { type: Number },
      checkedAt: { type: Date },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ['institutionId', 'academicYearId', 'classId', 'sectionId', 'createdBy', 'submittedBy', 'publishedBy'].forEach((k) => {
          if (ret[k]) ret[k] = refOut(ret[k]);
        });
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
TimetableSchema.index({ sectionId: 1, academicYearId: 1, version: 1 }, { unique: true });
TimetableSchema.index({ sectionId: 1, status: 1 });

// ══════════════════════════════════════════════════════════════════
// 4. SUBSTITUTE ASSIGNMENT (Teacher Absence / Substitution)
// ══════════════════════════════════════════════════════════════════
export interface ISubstituteAssignment extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  originalTeacherId: mongoose.Types.ObjectId | string;
  substituteTeacherId: mongoose.Types.ObjectId | string;
  timetableEntryId: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  centralSubjectId: mongoose.Types.ObjectId | string;
  date: Date;
  periodNumber: number;
  dayOfWeek: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  reason?: string;
  assignedBy: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const SubstituteAssignmentSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    originalTeacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    substituteTeacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    timetableEntryId: { type: Schema.Types.ObjectId, ref: 'TimetableEntry', required: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', required: true },
    date: { type: Date, required: true, index: true },
    periodNumber: { type: Number, required: true },
    dayOfWeek: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'],
      default: 'CONFIRMED',
      index: true,
    },
    reason: { type: String },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = refOut(ret.institutionId);
        ret.originalTeacherId = refOut(ret.originalTeacherId);
        ret.substituteTeacherId = refOut(ret.substituteTeacherId);
        ret.sectionId = refOut(ret.sectionId);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
SubstituteAssignmentSchema.index({ substituteTeacherId: 1, date: 1, periodNumber: 1 });

// ══════════════════════════════════════════════════════════════════
// 5. TIMETABLE CHANGE (Schedule Alteration Audit Trail)
// ══════════════════════════════════════════════════════════════════
export interface ITimetableChange extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  timetableEntryId?: mongoose.Types.ObjectId | string;
  timetableId?: mongoose.Types.ObjectId | string;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE' | 'SUBSTITUTION' | 'ROOM_CHANGE' | 'PUBLISH' | 'ARCHIVE' | 'NEW_VERSION' | 'CONFIG';
  previousValues?: any;
  newValues?: any;
  changedBy: mongoose.Types.ObjectId | string;
  userRole: string;
  reason?: string;
  affectedTeachers?: mongoose.Types.ObjectId[];
  affectedSections?: mongoose.Types.ObjectId[];
  timestamp: Date;
}

const TimetableChangeSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    timetableEntryId: { type: Schema.Types.ObjectId, ref: 'TimetableEntry' },
    timetableId: { type: Schema.Types.ObjectId, ref: 'Timetable', index: true },
    changeType: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE', 'SUBSTITUTION', 'ROOM_CHANGE', 'PUBLISH', 'ARCHIVE', 'NEW_VERSION', 'CONFIG'],
      required: true,
      index: true,
    },
    previousValues: { type: Schema.Types.Mixed },
    newValues: { type: Schema.Types.Mixed },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userRole: { type: String, required: true },
    reason: { type: String },
    affectedTeachers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    affectedSections: [{ type: Schema.Types.ObjectId, ref: 'Section' }],
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = refOut(ret.institutionId);
        ret.changedBy = refOut(ret.changedBy);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
TimetableChangeSchema.index({ institutionId: 1, timestamp: -1 });

// ══════════════════════════════════════════════════════════════════
// 6. ACADEMIC CALENDAR (Holidays, Terms, Vacation, Suspensions)
// ══════════════════════════════════════════════════════════════════
export type CalendarEventType =
  | 'ACADEMIC'
  | 'EXAMINATION'
  | 'HOLIDAY'
  | 'VACATION'
  | 'EVENT'
  | 'TEACHER_TRAINING';

export interface IAcademicCalendar extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  academicYearId?: mongoose.Types.ObjectId | string;
  title: string;
  eventType: CalendarEventType;
  startDate: Date;
  endDate: Date;
  isHoliday: boolean; // When true, timetable classes are suspended
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AcademicCalendarSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', index: true },
    title: { type: String, required: true },
    eventType: {
      type: String,
      enum: ['ACADEMIC', 'EXAMINATION', 'HOLIDAY', 'VACATION', 'EVENT', 'TEACHER_TRAINING'],
      default: 'ACADEMIC',
      index: true,
    },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date, required: true, index: true },
    isHoliday: { type: Boolean, default: false },
    description: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = refOut(ret.institutionId);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
AcademicCalendarSchema.index({ institutionId: 1, startDate: 1, endDate: 1 });

// ══════════════════════════════════════════════════════════════════
// MODEL EXPORTS
// ══════════════════════════════════════════════════════════════════
export const SchoolPeriod =
  mongoose.models.SchoolPeriod ||
  mongoose.model<ISchoolPeriod>('SchoolPeriod', SchoolPeriodSchema, 'schoolPeriods');

export const TimetableTemplate =
  mongoose.models.TimetableTemplate ||
  mongoose.model<ITimetableTemplate>('TimetableTemplate', TimetableTemplateSchema, 'timetableTemplates');

export const TimetableEntry =
  mongoose.models.TimetableEntry ||
  mongoose.model<ITimetableEntry>('TimetableEntry', TimetableEntrySchema, 'timetableEntries');

export const Timetable =
  mongoose.models.Timetable || mongoose.model<ITimetable>('Timetable', TimetableSchema, 'timetables');

export const SubstituteAssignment =
  mongoose.models.SubstituteAssignment ||
  mongoose.model<ISubstituteAssignment>('SubstituteAssignment', SubstituteAssignmentSchema, 'substituteAssignments');

export const TimetableChange =
  mongoose.models.TimetableChange ||
  mongoose.model<ITimetableChange>('TimetableChange', TimetableChangeSchema, 'timetableChanges');

export const AcademicCalendar =
  mongoose.models.AcademicCalendar ||
  mongoose.model<IAcademicCalendar>('AcademicCalendar', AcademicCalendarSchema, 'academicCalendars');

