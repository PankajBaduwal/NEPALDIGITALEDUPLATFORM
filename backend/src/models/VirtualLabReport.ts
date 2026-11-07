import { Schema, Types, model, type Document } from 'mongoose';

export const LabReportStatus = {
  SUBMITTED: 'SUBMITTED',
  REVIEWED: 'REVIEWED',
  REVISION_REQUESTED: 'REVISION_REQUESTED',
} as const;
export type LabReportStatus = (typeof LabReportStatus)[keyof typeof LabReportStatus];

export interface IVirtualLabReport extends Document {
  reportId: string;
  session: Types.ObjectId;
  user: Types.ObjectId;
  institution?: Types.ObjectId;
  experimentId: string;
  experimentTitle: string;
  classLevel: string;
  academicYear: string;
  aim: string;
  principle: string;
  chemicalEquations: string[];
  apparatusUsed: string[];
  chemicalsUsed: string[];
  observationTable: Array<Record<string, unknown>>;
  calculationsWorkedOut: string[];
  finalResultText: string;
  numericalResult: {
    value: number;
    unit: string;
    targetReferenceRange?: [number, number];
  };
  sourcesOfErrorDiscussed: string[];
  precautionsObserved: string[];
  studentReflection?: string;
  teacherReview?: {
    teacherId: Types.ObjectId;
    teacherName: string;
    gradeOrMarks?: string;
    feedbackComments: string;
    reviewedAt: Date;
  };
  status: LabReportStatus;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const virtualLabReportSchema = new Schema<IVirtualLabReport>(
  {
    reportId: { type: String, required: true, unique: true, index: true },
    session: { type: Schema.Types.ObjectId, ref: 'VirtualLabSession', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    institution: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
    experimentId: { type: String, required: true, index: true },
    experimentTitle: { type: String, required: true },
    classLevel: { type: String, required: true },
    academicYear: { type: String, required: true },
    aim: { type: String, required: true },
    principle: { type: String, required: true },
    chemicalEquations: [{ type: String }],
    apparatusUsed: [{ type: String }],
    chemicalsUsed: [{ type: String }],
    observationTable: [{ type: Schema.Types.Mixed }],
    calculationsWorkedOut: [{ type: String }],
    finalResultText: { type: String, required: true },
    numericalResult: {
      value: { type: Number, required: true },
      unit: { type: String, required: true },
      targetReferenceRange: [{ type: Number }],
    },
    sourcesOfErrorDiscussed: [{ type: String }],
    precautionsObserved: [{ type: String }],
    studentReflection: { type: String },
    teacherReview: {
      teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
      teacherName: { type: String },
      gradeOrMarks: { type: String },
      feedbackComments: { type: String },
      reviewedAt: { type: Date },
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(LabReportStatus),
      default: LabReportStatus.SUBMITTED,
      index: true,
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


export const VirtualLabReport = model<IVirtualLabReport>(
  'VirtualLabReport',
  virtualLabReportSchema
);
