import mongoose, { Schema, Document } from 'mongoose';

// ══════════════════════════════════════════════════════════════════
// 1. SUBSCRIPTION PLAN (PACKAGES: Foundation, Middle School, Secondary)
// ══════════════════════════════════════════════════════════════════
export type PlanTier = 'FOUNDATION' | 'MIDDLE_SCHOOL' | 'SECONDARY' | 'K12' | 'CUSTOM';

export interface IPlanFeatures {
  gradesCovered: number[];
  isTextbooksIncluded: boolean;
  isSimulationsIncluded: boolean;
  isActivitiesIncluded: boolean;
  isSmartBoardIncluded: boolean;
  isAiAssistantIncluded: boolean;
  isAcademicManagementIncluded: boolean;
  isAnalyticsIncluded: boolean;
}

export interface IPlanLimits {
  maxStudents: number;
  maxTeachers: number;
  maxSmartBoards: number;
  monthlyAiTokens: number;
}

export interface ISubscriptionPlan extends Document {
  id: string;
  code: string; // e.g. "FOUNDATION", "MIDDLE_SCHOOL", "SECONDARY", "K12_ALL"
  tier: PlanTier;
  name: string;
  nameNepali?: string;
  description?: string;
  applicableGrades: number[];
  pricing: {
    currency: string; // "NPR"
    annualPriceNpr: number;
    monthlyPriceNpr: number;
    perStudentPriceNpr: number;
  };
  features: IPlanFeatures;
  limits: IPlanLimits;
  isActive: boolean;
  isPublic: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;

  // Backward compatibility fields
  gradesCovered?: string;
  isSimulationsIncluded?: boolean;
  isSmartBoardIncluded?: boolean;
  pricePerYearNpr?: number;
}

const SubscriptionPlanSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    tier: {
      type: String,
      enum: ['FOUNDATION', 'MIDDLE_SCHOOL', 'SECONDARY', 'K12', 'CUSTOM'],
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    nameNepali: { type: String },
    description: { type: String },
    applicableGrades: { type: [Number], required: true, index: true },
    pricing: {
      currency: { type: String, default: 'NPR' },
      annualPriceNpr: { type: Number, required: true, default: 0 },
      monthlyPriceNpr: { type: Number, default: 0 },
      perStudentPriceNpr: { type: Number, default: 0 },
    },
    features: {
      gradesCovered: { type: [Number], default: [] },
      isTextbooksIncluded: { type: Boolean, default: true },
      isSimulationsIncluded: { type: Boolean, default: true },
      isActivitiesIncluded: { type: Boolean, default: true },
      isSmartBoardIncluded: { type: Boolean, default: true },
      isAiAssistantIncluded: { type: Boolean, default: true },
      isAcademicManagementIncluded: { type: Boolean, default: true },
      isAnalyticsIncluded: { type: Boolean, default: true },
    },
    limits: {
      maxStudents: { type: Number, default: 1000 },
      maxTeachers: { type: Number, default: 100 },
      maxSmartBoards: { type: Number, default: 10 },
      monthlyAiTokens: { type: Number, default: 100000 },
    },
    isActive: { type: Boolean, default: true, index: true },
    isPublic: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    // Virtual compatibility
    gradesCovered: { type: String },
    isSimulationsIncluded: { type: Boolean, default: true },
    isSmartBoardIncluded: { type: Boolean, default: true },
    pricePerYearNpr: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        // backward compat mapping
        if (!ret.gradesCovered && ret.applicableGrades) {
          ret.gradesCovered = ret.applicableGrades.join(',');
        }
        if (ret.pricing && ret.pricePerYearNpr === undefined) {
          ret.pricePerYearNpr = ret.pricing.annualPriceNpr;
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ══════════════════════════════════════════════════════════════════
// 2. INSTITUTION SUBSCRIPTION
// ══════════════════════════════════════════════════════════════════
export type SubscriptionStatus =
  | 'TRIAL'
  | 'ACTIVE'
  | 'GRACE_PERIOD'
  | 'EXPIRED'
  | 'SUSPENDED'
  | 'CANCELLED';

export interface IInstitutionSubscription extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  planId: mongoose.Types.ObjectId | string;
  packageId?: mongoose.Types.ObjectId | string; // backward compat
  planCode: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  gracePeriodEndDate: Date;
  billingCycle: 'ANNUAL' | 'MONTHLY' | 'CUSTOM';
  pricePaidNpr: number;
  autoRenew: boolean;
  maxStudents: number;
  maxTeachers: number;
  maxSmartBoards: number;
  customEntitlements?: {
    allowedGrades?: number[];
    isAiAssistantIncluded?: boolean;
    isSimulationsIncluded?: boolean;
    isSmartBoardIncluded?: boolean;
    monthlyAiTokens?: number;
  };
  lastRenewalReminderSentAt?: Date;
  suspendedReason?: string;
  assignedBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const InstitutionSubscriptionSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true, index: true },
    packageId: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan' }, // alias for backward compatibility
    planCode: { type: String, required: true },
    status: {
      type: String,
      enum: ['TRIAL', 'ACTIVE', 'GRACE_PERIOD', 'EXPIRED', 'SUSPENDED', 'CANCELLED'],
      default: 'ACTIVE',
      index: true,
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true, index: true },
    gracePeriodEndDate: { type: Date, required: true, index: true },
    billingCycle: { type: String, enum: ['ANNUAL', 'MONTHLY', 'CUSTOM'], default: 'ANNUAL' },
    pricePaidNpr: { type: Number, default: 0 },
    autoRenew: { type: Boolean, default: false },
    maxStudents: { type: Number, default: 1000 },
    maxTeachers: { type: Number, default: 100 },
    maxSmartBoards: { type: Number, default: 10 },
    customEntitlements: {
      allowedGrades: { type: [Number] },
      isAiAssistantIncluded: { type: Boolean },
      isSimulationsIncluded: { type: Boolean },
      isSmartBoardIncluded: { type: Boolean },
      monthlyAiTokens: { type: Number },
    },
    lastRenewalReminderSentAt: { type: Date },
    suspendedReason: { type: String },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        ret.planId = ret.planId?.toString();
        ret.packageId = ret.packageId?.toString() || ret.planId;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);
InstitutionSubscriptionSchema.index({ institutionId: 1, status: 1 });

// ══════════════════════════════════════════════════════════════════
// 3. SUBSCRIPTION ENTITLEMENTS (RESOLVED INSTITUTION ACCESS)
// ══════════════════════════════════════════════════════════════════
export interface ISubscriptionEntitlement extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  subscriptionId?: mongoose.Types.ObjectId | string;
  allowedGrades: number[];
  allowedModules: string[];
  isTextbooksEnabled: boolean;
  isSimulationsEnabled: boolean;
  isActivitiesEnabled: boolean;
  isSmartBoardEnabled: boolean;
  isAiAssistantEnabled: boolean;
  isAcademicManagementEnabled: boolean;
  isAnalyticsEnabled: boolean;
  maxStudents: number;
  maxTeachers: number;
  maxSmartBoards: number;
  status: SubscriptionStatus;
  inGracePeriod: boolean;
  isExpired: boolean;
  daysRemaining: number;
  expiresAt: Date;
  updatedAt: Date;
}

const SubscriptionEntitlementSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, unique: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'InstitutionSubscription' },
    allowedGrades: { type: [Number], default: [] },
    allowedModules: {
      type: [String],
      default: ['CURRICULUM', 'TEXTBOOKS', 'SIMULATIONS', 'ACTIVITIES', 'SMARTBOARD', 'ACADEMIC', 'AI_ASSISTANT', 'ANALYTICS'],
    },
    isTextbooksEnabled: { type: Boolean, default: true },
    isSimulationsEnabled: { type: Boolean, default: true },
    isActivitiesEnabled: { type: Boolean, default: true },
    isSmartBoardEnabled: { type: Boolean, default: true },
    isAiAssistantEnabled: { type: Boolean, default: true },
    isAcademicManagementEnabled: { type: Boolean, default: true },
    isAnalyticsEnabled: { type: Boolean, default: true },
    maxStudents: { type: Number, default: 1000 },
    maxTeachers: { type: Number, default: 100 },
    maxSmartBoards: { type: Number, default: 10 },
    status: { type: String, default: 'ACTIVE' },
    inGracePeriod: { type: Boolean, default: false },
    isExpired: { type: Boolean, default: false },
    daysRemaining: { type: Number, default: 365 },
    expiresAt: { type: Date },
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

// ══════════════════════════════════════════════════════════════════
// 4. INVOICE MODEL
// ══════════════════════════════════════════════════════════════════
export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED' | 'VOID';

export interface IInvoiceItem {
  description: string;
  gradeCoverage?: string;
  quantity: number;
  unitPriceNpr: number;
  totalNpr: number;
}

export interface IInvoice extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  subscriptionId?: mongoose.Types.ObjectId | string;
  invoiceNumber: string; // e.g. "INV-2081-0012"
  billingPeriodStart: Date;
  billingPeriodEnd: Date;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  lineItems: IInvoiceItem[];
  subtotalNpr: number;
  taxPercent: number; // e.g. 13 for VAT, 0 for educational exemption
  taxAmountNpr: number;
  totalAmountNpr: number;
  currency: string;
  status: InvoiceStatus;
  notes?: string;
  generatedBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'InstitutionSubscription', index: true },
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    billingPeriodStart: { type: Date, required: true },
    billingPeriodEnd: { type: Date, required: true },
    issueDate: { type: Date, default: Date.now, index: true },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    lineItems: [
      {
        description: { type: String, required: true },
        gradeCoverage: { type: String },
        quantity: { type: Number, default: 1 },
        unitPriceNpr: { type: Number, required: true },
        totalNpr: { type: Number, required: true },
      },
    ],
    subtotalNpr: { type: Number, required: true, min: 0 },
    taxPercent: { type: Number, default: 0 },
    taxAmountNpr: { type: Number, default: 0 },
    totalAmountNpr: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'NPR' },
    status: {
      type: String,
      enum: ['DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED', 'VOID'],
      default: 'ISSUED',
      index: true,
    },
    notes: { type: String },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        if (ret.subscriptionId) ret.subscriptionId = ret.subscriptionId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ══════════════════════════════════════════════════════════════════
// 5. PAYMENT MODEL (PROVIDER-AGNOSTIC ARCHITECTURE)
// ══════════════════════════════════════════════════════════════════
export type PaymentGatewayType = 'KHALTI' | 'ESEWA' | 'CONNECT_IPS' | 'BANK_TRANSFER' | 'MANUAL';
export type PaymentStatusType = 'INITIATED' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface IPayment extends Document {
  id: string;
  invoiceId: mongoose.Types.ObjectId | string;
  institutionId: mongoose.Types.ObjectId | string;
  subscriptionId?: mongoose.Types.ObjectId | string;
  paymentReference: string; // Internal reference: "PAY-20810715-9921"
  gateway: PaymentGatewayType;
  amountNpr: number;
  currency: string;
  status: PaymentStatusType;
  gatewayTransactionId?: string; // Khalti pidx or eSewa refId
  gatewayCallbackPayload?: any;
  voucherNumber?: string; // For bank transfer
  voucherImageUrl?: string;
  remarks?: string;
  initiatedAt: Date;
  completedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema(
  {
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true, index: true },
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'InstitutionSubscription', index: true },
    paymentReference: { type: String, required: true, unique: true, index: true },
    gateway: {
      type: String,
      enum: ['KHALTI', 'ESEWA', 'CONNECT_IPS', 'BANK_TRANSFER', 'MANUAL'],
      required: true,
      index: true,
    },
    amountNpr: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'NPR' },
    status: {
      type: String,
      enum: ['INITIATED', 'PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'INITIATED',
      index: true,
    },
    gatewayTransactionId: { type: String, index: true },
    gatewayCallbackPayload: { type: Schema.Types.Mixed },
    voucherNumber: { type: String },
    voucherImageUrl: { type: String },
    remarks: { type: String },
    initiatedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.invoiceId = ret.invoiceId?.toString();
        ret.institutionId = ret.institutionId?.toString();
        if (ret.subscriptionId) ret.subscriptionId = ret.subscriptionId.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ══════════════════════════════════════════════════════════════════
// 6. SUBSCRIPTION AUDIT HISTORY
// ══════════════════════════════════════════════════════════════════
export type SubscriptionActionType =
  | 'CREATED'
  | 'ACTIVATED'
  | 'RENEWED'
  | 'EXTENDED'
  | 'SUSPENDED'
  | 'EXPIRED'
  | 'UPGRADED'
  | 'CANCELLED';

export interface ISubscriptionHistory extends Document {
  id: string;
  institutionId: mongoose.Types.ObjectId | string;
  subscriptionId: mongoose.Types.ObjectId | string;
  action: SubscriptionActionType;
  previousStatus?: string;
  newStatus: string;
  durationDaysAdded?: number;
  reason?: string;
  performedBy?: mongoose.Types.ObjectId | string;
  metadata?: any;
  createdAt: Date;
}

const SubscriptionHistorySchema = new Schema(
  {
    institutionId: { type: Schema.Types.ObjectId, ref: 'Institution', required: true, index: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'InstitutionSubscription', required: true, index: true },
    action: {
      type: String,
      enum: ['CREATED', 'ACTIVATED', 'RENEWED', 'EXTENDED', 'SUSPENDED', 'EXPIRED', 'UPGRADED', 'CANCELLED'],
      required: true,
      index: true,
    },
    previousStatus: { type: String },
    newStatus: { type: String, required: true },
    durationDaysAdded: { type: Number, default: 0 },
    reason: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString();
        ret.institutionId = ret.institutionId?.toString();
        ret.subscriptionId = ret.subscriptionId?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ══════════════════════════════════════════════════════════════════
// EXPORTS & BACKWARD-COMPATIBLE ALIASES
// ══════════════════════════════════════════════════════════════════
export const SubscriptionPlan =
  mongoose.models.SubscriptionPlan ||
  mongoose.model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema, 'subscriptionPlans');

export const InstitutionSubscription =
  mongoose.models.InstitutionSubscription ||
  mongoose.model<IInstitutionSubscription>('InstitutionSubscription', InstitutionSubscriptionSchema, 'institutionSubscriptions');

export const SubscriptionEntitlement =
  mongoose.models.SubscriptionEntitlement ||
  mongoose.model<ISubscriptionEntitlement>('SubscriptionEntitlement', SubscriptionEntitlementSchema, 'subscriptionEntitlements');

export const Invoice =
  mongoose.models.Invoice ||
  mongoose.model<IInvoice>('Invoice', InvoiceSchema, 'invoices');

export const Payment =
  mongoose.models.Payment ||
  mongoose.model<IPayment>('Payment', PaymentSchema, 'payments');

export const SubscriptionHistory =
  mongoose.models.SubscriptionHistory ||
  mongoose.model<ISubscriptionHistory>('SubscriptionHistory', SubscriptionHistorySchema, 'subscriptionHistory');

// Backward Compatibility Aliases for Phase 1-11
export const Package = SubscriptionPlan;
export type IPackage = ISubscriptionPlan;
export const Subscription = InstitutionSubscription;
export type ISubscription = IInstitutionSubscription;
