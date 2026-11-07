import mongoose, { Schema, Document } from 'mongoose';

// Academic Year Model
export interface IAcademicYear extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  name: string; // e.g. "2081/2082"
  nameNepali?: string;
  isCurrent: boolean;
  startDate?: Date;
  endDate?: Date;
}

const AcademicYearSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    name: { type: String, required: true },
    nameNepali: { type: String },
    isCurrent: { type: Boolean, default: false, index: true },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
AcademicYearSchema.index({ institutionId: 1, name: 1 }, { unique: true });

// Class Model (Grade 1 - 12)
export interface IClass extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  gradeNumber: number; // 1 to 12
  name: string;
  board: string;
  stream?: string;
}

const ClassSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    gradeNumber: { type: Number, required: true, min: 1, max: 20 },
    name: { type: String, required: true },
    board: { type: String, default: 'Nepal CDC' },
    stream: { type: String, default: 'GENERAL' }, // e.g. SCIENCE, MANAGEMENT, HUMANITIES, LAW
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
ClassSchema.index({ institutionId: 1, gradeNumber: 1, stream: 1 }, { unique: true });

// Section Model
export interface ISection extends Document {
  id: string;
  classId: mongoose.Types.ObjectId | string;
  academicYearId: mongoose.Types.ObjectId | string;
  name: string; // e.g. "Sagarmatha", "Annapurna", "A", "B"
  medium: string; // 'NEPALI' | 'ENGLISH' | 'BILINGUAL'
  capacity: number;
  classTeacherId?: mongoose.Types.ObjectId | string;
}

const SectionSchema = new Schema(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    name: { type: String, required: true },
    medium: { type: String, enum: ['NEPALI', 'ENGLISH', 'BILINGUAL'], default: 'BILINGUAL' },
    capacity: { type: Number, default: 45 },
    roomNumber: { type: String },
    classTeacherId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        // Keep populated documents (Class / AcademicYear) intact; only stringify raw ObjectIds.
        // A blanket toString() turned populated values into the literal string "[object Object]".
        const isPopulated = (v: any) => v && typeof v === 'object' && !v._bsontype && (v.name !== undefined || v.gradeNumber !== undefined || v.isCurrent !== undefined);
        if (!isPopulated(ret.classId)) ret.classId = ret.classId?.toString();
        if (!isPopulated(ret.academicYearId)) ret.academicYearId = ret.academicYearId?.toString();
        if (ret.classTeacherId) {
          if (typeof ret.classTeacherId === 'object' && !ret.classTeacherId._bsontype && (ret.classTeacherId.id || ret.classTeacherId._id || ret.classTeacherId.fullName)) {
            const tid = (ret.classTeacherId.id || ret.classTeacherId._id || '').toString();
            ret.classTeacherId = {
              id: tid,
              _id: tid,
              fullName: ret.classTeacherId.fullName,
              username: ret.classTeacherId.username,
              email: ret.classTeacherId.email,
            };
          } else {
            ret.classTeacherId = ret.classTeacherId.toString();
          }
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
SectionSchema.index({ classId: 1, academicYearId: 1, name: 1 }, { unique: true });

// Student Enrollment Model
export interface IStudentEnrollment extends Document {
  id: string;
  studentId: mongoose.Types.ObjectId | string;
  sectionId: mongoose.Types.ObjectId | string;
  academicYearId: mongoose.Types.ObjectId | string;
  rollNumber: number;
  admissionNumber: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  status: string;
}

const StudentEnrollmentSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sectionId: { type: Schema.Types.ObjectId, ref: 'Section', required: true, index: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true, index: true },
    rollNumber: { type: Number, required: true },
    admissionNumber: { type: String, required: true, index: true },
    guardianName: { type: String },
    guardianPhone: { type: String },
    guardianRelation: { type: String },
    status: { type: String, enum: ['ENROLLED', 'TRANSFERRED', 'GRADUATED'], default: 'ENROLLED' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        if (ret.studentId && typeof ret.studentId === 'object') {
          const sid = ret.studentId._id || ret.studentId.id;
          if (sid) {
            ret.student = { ...ret.studentId, id: sid.toString() };
            ret.studentId = sid.toString();
          } else {
            ret.studentId = ret.studentId.toString();
          }
        } else if (ret.studentId) {
          ret.studentId = ret.studentId.toString();
        }

        if (ret.sectionId && typeof ret.sectionId === 'object') {
          const sid = ret.sectionId._id || ret.sectionId.id;
          if (sid) {
            ret.section = { ...ret.sectionId, id: sid.toString() };
            ret.sectionId = sid.toString();
          } else {
            ret.sectionId = ret.sectionId.toString();
          }
        } else if (ret.sectionId) {
          ret.sectionId = ret.sectionId.toString();
        }

        if (ret.academicYearId && typeof ret.academicYearId === 'object') {
          const yid = ret.academicYearId._id || ret.academicYearId.id;
          if (yid) {
            ret.academicYear = { ...ret.academicYearId, id: yid.toString() };
            ret.academicYearId = yid.toString();
          } else {
            ret.academicYearId = ret.academicYearId.toString();
          }
        } else if (ret.academicYearId) {
          ret.academicYearId = ret.academicYearId.toString();
        }

        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
StudentEnrollmentSchema.index({ sectionId: 1, rollNumber: 1 });
StudentEnrollmentSchema.index({ sectionId: 1, studentId: 1 }, { unique: true });

export const AcademicYear = mongoose.models.AcademicYear || mongoose.model<IAcademicYear>('AcademicYear', AcademicYearSchema);
export const Class = mongoose.models.Class || mongoose.model<IClass>('Class', ClassSchema);
export const Section = mongoose.models.Section || mongoose.model<ISection>('Section', SectionSchema);
export const StudentEnrollment = mongoose.models.StudentEnrollment || mongoose.model<IStudentEnrollment>('StudentEnrollment', StudentEnrollmentSchema);

