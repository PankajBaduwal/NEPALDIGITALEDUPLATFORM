import mongoose, { Schema, Document } from 'mongoose';

export interface IProvisioningStep {
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  message?: string;
  timestamp?: Date;
  details?: Record<string, any>;
}

export interface IProvisioningJob extends Document {
  id: string;
  jobCode: string;
  institutionId?: mongoose.Types.ObjectId | string;
  requestId?: mongoose.Types.ObjectId | string;
  institutionName: string;
  emisCode: string;
  jobType: 'DIRECT_PROVISION' | 'REQUEST_APPROVAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK';
  steps: IProvisioningStep[];
  currentStepIndex: number;
  totalSteps: number;
  error?: string;
  performedBy?: mongoose.Types.ObjectId | string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ProvisioningJobSchema = new Schema(
  {
    jobCode: { type: String, required: true, unique: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
    requestId: { type: Schema.Types.ObjectId, ref: 'RegistrationRequest', index: true },
    institutionName: { type: String, required: true },
    emisCode: { type: String, required: true, index: true },
    jobType: {
      type: String,
      enum: ['DIRECT_PROVISION', 'REQUEST_APPROVAL'],
      default: 'DIRECT_PROVISION',
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'ROLLED_BACK'],
      default: 'PENDING',
      index: true,
    },
    steps: [
      {
        name: { type: String, required: true },
        status: {
          type: String,
          enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'SKIPPED'],
          default: 'PENDING',
        },
        message: { type: String },
        timestamp: { type: Date, default: Date.now },
        details: { type: Schema.Types.Mixed },
      },
    ],
    currentStepIndex: { type: Number, default: 0 },
    totalSteps: { type: Number, default: 12 },
    error: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: Schema.Types.Mixed, default: {} },
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

export interface IBulkImportJob extends Document {
  id: string;
  jobCode: string;
  institutionId: mongoose.Types.ObjectId | string;
  importType: 'TEACHERS' | 'STUDENTS';
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  importedCount: number;
  status: 'UPLOADED' | 'VALIDATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  rowErrors: Array<{
    row: number;
    field?: string;
    value?: any;
    message: string;
  }>;
  previewData?: any[];
  performedBy: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const BulkImportJobSchema = new Schema(
  {
    jobCode: { type: String, required: true, unique: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    importType: { type: String, enum: ['TEACHERS', 'STUDENTS'], required: true, index: true },
    fileName: { type: String, required: true },
    totalRows: { type: Number, default: 0 },
    validRows: { type: Number, default: 0 },
    invalidRows: { type: Number, default: 0 },
    duplicateRows: { type: Number, default: 0 },
    importedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['UPLOADED', 'VALIDATED', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'UPLOADED',
      index: true,
    },
    rowErrors: [
      {
        row: { type: Number, required: true },
        field: { type: String },
        value: { type: Schema.Types.Mixed },
        message: { type: String, required: true },
      },
    ],
    previewData: { type: [Schema.Types.Mixed], default: [] },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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

export const ProvisioningJob =
  mongoose.models.ProvisioningJob ||
  mongoose.model<IProvisioningJob>('ProvisioningJob', ProvisioningJobSchema);

export const BulkImportJob =
  mongoose.models.BulkImportJob ||
  mongoose.model<IBulkImportJob>('BulkImportJob', BulkImportJobSchema);
