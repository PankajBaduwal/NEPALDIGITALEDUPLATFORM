import mongoose, { Schema, Document } from 'mongoose';

export type InstitutionType = 'COMMUNITY' | 'INSTITUTIONAL' | 'RELIGIOUS' | 'TECHNICAL' | 'COLLEGE';
export type InstitutionKind = 'SCHOOL' | 'COLLEGE';
export type InstitutionStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
export type ProvisioningStatus = 'PENDING' | 'PROVISIONING' | 'PROVISIONED' | 'FAILED';

export interface IInstitution extends Document {
  id: string;
  emisCode: string;
  name: string;
  nameNepali?: string;
  shortName?: string;
  registrationNumber?: string;
  description?: string;
  website?: string;
  establishedYear?: number | string;
  ownershipType?: string;
  institutionKind?: InstitutionKind;
  category?: 'COMMUNITY' | 'INSTITUTIONAL' | 'RELIGIOUS' | 'TECHNICAL';
  type: InstitutionType;
  province: string;
  district: string;
  localLevel: string;
  ward?: number;
  street?: string;
  postalCode?: string;
  status: InstitutionStatus;
  email?: string;
  phone?: string;
  alternativePhone?: string;
  contactPerson?: string;
  logoUrl?: string;
  currentAcademicYear?: string;
  educationLevels?: string[];
  mediumOfInstruction?: 'ENGLISH' | 'NEPALI' | 'BOTH';
  provisionedAt?: Date;
  provisionedBy?: mongoose.Types.ObjectId | string;
  provisioningStatus?: ProvisioningStatus;
  schoolTimings?: {
    startTime: string;
    endTime: string;
    periodDurationMinutes: number;
    breakTime: string;
  };
  workingDays?: string[];
  subscription?: {
    packageName: string;
    status: string;
    validUntil: Date;
    studentQuota: number;
    teacherQuota: number;
    smartBoardAccess: boolean;
  };
  academicSettings?: {
    /** Roles allowed to publish timetables for this school. */
    timetablePublishRoles: string[];
    /** Roles allowed to create and edit timetable drafts. */
    timetableEditRoles: string[];
    /** Platform Super Admin may edit this school's timetable only when this is enabled. */
    superAdminTimetableAccess: boolean;
    maxTeacherPeriodsPerWeek: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionSchema: Schema = new Schema(
  {
    emisCode: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, index: true },
    nameNepali: { type: String },
    shortName: { type: String },
    registrationNumber: { type: String },
    description: { type: String },
    website: { type: String },
    establishedYear: { type: Schema.Types.Mixed },
    ownershipType: { type: String },
    institutionKind: { type: String, enum: ['SCHOOL', 'COLLEGE'], default: 'SCHOOL' },
    category: {
      type: String,
      enum: ['COMMUNITY', 'INSTITUTIONAL', 'RELIGIOUS', 'TECHNICAL'],
      default: 'COMMUNITY',
    },
    type: {
      type: String,
      enum: ['COMMUNITY', 'INSTITUTIONAL', 'RELIGIOUS', 'TECHNICAL', 'COLLEGE'],
      default: 'COMMUNITY',
      index: true,
    },
    province: { type: String, required: true, index: true },
    district: { type: String, required: true, index: true },
    localLevel: { type: String, required: true },
    ward: { type: Number },
    street: { type: String },
    postalCode: { type: String },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE'],
      default: 'ACTIVE',
      index: true,
    },
    email: { type: String },
    phone: { type: String },
    alternativePhone: { type: String },
    contactPerson: { type: String },
    logoUrl: { type: String },
    currentAcademicYear: { type: String, default: '2081/2082' },
    educationLevels: { type: [String], default: ['BASIC_1_5', 'BASIC_6_8', 'SECONDARY_9_10', 'HIGHER_SECONDARY_11_12'] },
    mediumOfInstruction: { type: String, enum: ['ENGLISH', 'NEPALI', 'BOTH'], default: 'BOTH' },
    provisionedAt: { type: Date, default: Date.now },
    provisionedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    provisioningStatus: {
      type: String,
      enum: ['PENDING', 'PROVISIONING', 'PROVISIONED', 'FAILED'],
      default: 'PROVISIONED',
    },
    schoolTimings: {
      startTime: { type: String, default: '10:00 AM' },
      endTime: { type: String, default: '04:00 PM' },
      periodDurationMinutes: { type: Number, default: 45 },
      breakTime: { type: String, default: '01:00 PM - 01:45 PM' },
    },
    workingDays: {
      type: [String],
      default: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    subscription: {
      packageName: { type: String, default: 'STANDARD_ANNUAL' },
      status: { type: String, default: 'ACTIVE' },
      validUntil: {
        type: Date,
        default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      studentQuota: { type: Number, default: 1000 },
      teacherQuota: { type: Number, default: 50 },
      smartBoardAccess: { type: Boolean, default: true },
    },
    academicSettings: {
      timetablePublishRoles: { type: [String], default: ['PRINCIPAL', 'SCHOOL_ADMIN', 'COLLEGE_ADMIN'] },
      timetableEditRoles: { type: [String], default: ['PRINCIPAL', 'SCHOOL_ADMIN', 'COLLEGE_ADMIN'] },
      superAdminTimetableAccess: { type: Boolean, default: false },
      maxTeacherPeriodsPerWeek: { type: Number, default: 30 },
    },
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

export const Institution = mongoose.models.Institution || mongoose.model<IInstitution>('Institution', InstitutionSchema);
