import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'SUPER_ADMIN' | 'SCHOOL_ADMIN' | 'COLLEGE_ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface IUser extends Document {
  id: string;
  institutionId?: mongoose.Types.ObjectId | string;
  username: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  fullName: string;
  fullNameNepali?: string;
  phone?: string;
  status: UserStatus;
  avatarUrl?: string;
  metadata?: Record<string, any>;
  lastLoginAt?: Date;
  lastSeenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    institutionId: {
      type: Schema.Types.ObjectId,
      ref: 'Institution',
      index: true,
      default: null,
    },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, index: true, sparse: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT'],
      required: true,
      index: true,
    },
    fullName: { type: String, required: true },
    fullNameNepali: { type: String },
    phone: { type: String },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true,
    },
    avatarUrl: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
    lastLoginAt: { type: Date, index: true },
    lastSeenAt: { type: Date, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        if (ret.institutionId && ret.institutionId.toString) {
          ret.institutionId = ret.institutionId.toString();
        }
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash; // Protect passwords
        return ret;
      },
    },
  }
);

// Multi-tenant composite index
UserSchema.index({ institutionId: 1, role: 1 });

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

