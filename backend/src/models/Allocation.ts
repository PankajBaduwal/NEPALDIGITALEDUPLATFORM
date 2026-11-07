import mongoose, { Schema, Document } from 'mongoose';

/** Serialise a reference: ObjectIds become strings, populated documents are kept as objects. */
const refOut = (v: any) => (v && typeof v === 'object' && !(v instanceof mongoose.Types.ObjectId) ? v : v?.toString());

// Subject Allocation (Class Section -> Central Subject -> Teacher)
export interface ISubjectAllocation extends Document {
  id: string;
  institutionId?: mongoose.Types.ObjectId | string;
  academicYearId?: mongoose.Types.ObjectId | string;
  classId?: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  centralSubjectId: mongoose.Types.ObjectId | string;
  teacherId: mongoose.Types.ObjectId | string;
  medium?: 'ENGLISH' | 'NEPALI';
  status?: 'ACTIVE' | 'INACTIVE';
  assignedBy?: mongoose.Types.ObjectId | string;
  assignedAt?: Date;
}

const SubjectAllocationSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', required: true, index: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    medium: { type: String, enum: ['ENGLISH', 'NEPALI'] },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE', index: true },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.sectionId = refOut(ret.sectionId);
        ret.centralSubjectId = refOut(ret.centralSubjectId);
        ret.teacherId = refOut(ret.teacherId);
        if (ret.institutionId) ret.institutionId = refOut(ret.institutionId);
        if (ret.academicYearId) ret.academicYearId = refOut(ret.academicYearId);
        if (ret.classId) ret.classId = refOut(ret.classId);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
SubjectAllocationSchema.index({ sectionId: 1, centralSubjectId: 1, teacherId: 1 }, { unique: true });

// Section Subject Offering (which central subjects a section actually takes)
export interface ISectionSubject extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  academicYearId: mongoose.Types.ObjectId | string;
  classId: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  centralSubjectId: mongoose.Types.ObjectId | string;
  medium: 'ENGLISH' | 'NEPALI';
  periodsPerWeek: number;
  /** Periods per week that must be taught as consecutive double periods (practicals). */
  practicalPeriodsPerWeek: number;
  isOptional: boolean;
  isActive: boolean;
  configuredBy?: mongoose.Types.ObjectId | string;
}

const SectionSubjectSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', required: true, index: true },
    medium: { type: String, enum: ['ENGLISH', 'NEPALI'], required: true },
    periodsPerWeek: { type: Number, default: 5, min: 0, max: 20 },
    practicalPeriodsPerWeek: { type: Number, default: 0, min: 0, max: 20 },
    isOptional: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    configuredBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ['institutionId', 'academicYearId', 'classId', 'sectionId', 'centralSubjectId', 'configuredBy'].forEach((k) => {
          if (ret[k]) ret[k] = refOut(ret[k]);
        });
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
SectionSubjectSchema.index({ sectionId: 1, centralSubjectId: 1 }, { unique: true });

// Timetable Slot
export interface ITimetableSlot extends Document {
  id: string;
  sectionId: mongoose.Types.ObjectId | string;
  centralSubjectId: mongoose.Types.ObjectId | string;
  teacherId: mongoose.Types.ObjectId | string;
  dayOfWeek: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  roomNumber?: string;
}

const TimetableSlotSchema = new Schema(
  {
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    centralSubjectId: { type: Schema.Types.ObjectId, ref: 'CentralSubject', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    dayOfWeek: {
      type: String,
      enum: ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'],
      required: true,
    },
    periodNumber: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    roomNumber: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.sectionId = refOut(ret.sectionId);
        ret.centralSubjectId = refOut(ret.centralSubjectId);
        ret.teacherId = refOut(ret.teacherId);
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
TimetableSlotSchema.index({ sectionId: 1, dayOfWeek: 1, periodNumber: 1 }, { unique: true });

export const SubjectAllocation = mongoose.models.SubjectAllocation || mongoose.model<ISubjectAllocation>('SubjectAllocation', SubjectAllocationSchema);
export const SectionSubject = mongoose.models.SectionSubject || mongoose.model<ISectionSubject>('SectionSubject', SectionSubjectSchema, 'sectionSubjects');
export const TimetableSlot = mongoose.models.TimetableSlot || mongoose.model<ITimetableSlot>('TimetableSlot', TimetableSlotSchema);
