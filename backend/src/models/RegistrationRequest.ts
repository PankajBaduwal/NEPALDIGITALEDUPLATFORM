import mongoose, { Schema, Document } from 'mongoose';

export type RegistrationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'PENDING'
  | 'UNDER_VERIFICATION'
  | 'MORE_INFO_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PROVISIONING'
  | 'ACTIVE';

export interface IRegistrationRequest extends Document {
  requestCode: string; // or applicationCode, e.g. REG-2083-XXXX
  institutionName: string;
  nameNepali?: string;
  shortName?: string;
  logoUrl?: string;
  emisCode: string;
  registrationNumber?: string;
  institutionKind: 'SCHOOL' | 'COLLEGE';
  institutionType: 'COMMUNITY' | 'INSTITUTIONAL' | 'RELIGIOUS' | 'TECHNICAL';
  province: string;
  district: string;
  localLevel: string;
  ward?: number;
  street?: string;
  contactPerson: string;
  designation?: string;
  email: string;
  phone: string;
  alternativePhone?: string;
  requestedPackages: string[];
  estimatedStudents?: number;
  academicYear?: string;
  educationLevels?: string[];
  mediumOfInstruction?: 'ENGLISH' | 'NEPALI' | 'BOTH';
  adminDetails?: {
    fullName: string;
    email: string;
    phone: string;
    username: string;
    designation?: string;
    passwordHash?: string;
  };
  status: RegistrationStatus;
  rejectionReason?: string;
  moreInfoNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  provisionedInstitutionId?: mongoose.Types.ObjectId | string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationRequestSchema = new Schema(
  {
    requestCode: { type: String, required: true, unique: true, index: true },
    institutionName: { type: String, required: true, index: true },
    nameNepali: { type: String },
    shortName: { type: String },
    logoUrl: { type: String },
    emisCode: { type: String, required: true, index: true },
    registrationNumber: { type: String },
    institutionKind: { type: String, enum: ['SCHOOL', 'COLLEGE'], default: 'SCHOOL' },
    institutionType: {
      type: String,
      enum: ['COMMUNITY', 'INSTITUTIONAL', 'RELIGIOUS', 'TECHNICAL'],
      default: 'COMMUNITY',
    },
    province: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    localLevel: { type: String, required: true },
    ward: { type: Number },
    street: { type: String },
    contactPerson: { type: String, required: true },
    designation: { type: String, default: 'Principal / Administrator' },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: { type: String, required: true },
    alternativePhone: { type: String },
    requestedPackages: {
      type: [String],
      default: ['PACKAGE_1_FOUNDATION', 'PACKAGE_2_MIDDLE', 'PACKAGE_3_SECONDARY'],
    },
    estimatedStudents: { type: Number, default: 250 },
    academicYear: { type: String, default: '2081/2082' },
    educationLevels: {
      type: [String],
      default: ['BASIC_1_5', 'BASIC_6_8', 'SECONDARY_9_10', 'HIGHER_SECONDARY_11_12'],
    },
    mediumOfInstruction: { type: String, enum: ['ENGLISH', 'NEPALI', 'BOTH'], default: 'BOTH' },
    adminDetails: {
      fullName: { type: String },
      email: { type: String },
      phone: { type: String },
      username: { type: String },
      designation: { type: String },
      passwordHash: { type: String },
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'SUBMITTED',
        'PENDING',
        'UNDER_VERIFICATION',
        'MORE_INFO_REQUIRED',
        'APPROVED',
        'REJECTED',
        'PROVISIONING',
        'ACTIVE',
      ],
      default: 'SUBMITTED',
      index: true,
    },
    rejectionReason: { type: String },
    moreInfoNotes: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    provisionedInstitutionId: { type: Schema.Types.ObjectId, ref: 'Institution' },
    notes: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        if (ret.adminDetails) {
          delete ret.adminDetails.passwordHash;
        }
        return ret;
      },
    },
  }
);

export const RegistrationRequest =
  mongoose.models.RegistrationRequest ||
  mongoose.model<IRegistrationRequest>('RegistrationRequest', RegistrationRequestSchema);
