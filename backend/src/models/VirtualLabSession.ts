import { Schema, Types, model, type Document } from 'mongoose';

export const LabSessionStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  RESET: 'RESET',
  ABANDONED: 'ABANDONED',
} as const;
export type LabSessionStatus = (typeof LabSessionStatus)[keyof typeof LabSessionStatus];

export interface IBenchApparatusState {
  instanceId: string;
  apparatusId: string;
  positionX: number;
  positionY: number;
  isClamped?: boolean;
  stopcockOpenPercent?: number; // 0 = closed, 100 = full flow
  currentVolumeMl: number;
  maxCapacityMl: number;
  contents: Array<{
    reagentId: string;
    volumeMl: number;
    molarity?: number;
    name: string;
    color: string;
  }>;
  temperatureC: number;
  tareGrams?: number;
}

export interface IObservationRecord {
  trialNumber: number;
  label: string;
  initialReadingMl: number;
  finalReadingMl: number;
  volumeDeliveredMl: number;
  colorObserved: string;
  isEndpointReached: boolean;
  isOvershot: boolean;
  notes?: string;
  timestamp: Date;
}

export interface IVirtualLabSession extends Document {
  user: Types.ObjectId;
  institution?: Types.ObjectId;
  experimentId: string;
  experimentVersion: number;
  status: LabSessionStatus;
  safetyBriefingAcknowledged: boolean;
  currentStepIndex: number;
  completedStepIds: string[];
  benchState: IBenchApparatusState[];
  observationNotebook: IObservationRecord[];
  rawMeasurements: Record<string, number | string>;
  mistakeLog: Array<{
    timestamp: Date;
    actionAttempted: string;
    warningGiven: string;
    stepIndex: number;
  }>;
  calculatedResult?: {
    value: number;
    unit: string;
    concordantVolumeMl?: number;
    verifiedByServer: boolean;
    computedAt: Date;
  };
  startedAt: Date;
  lastActiveAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const benchApparatusSchema = new Schema<IBenchApparatusState>(
  {
    instanceId: { type: String, required: true },
    apparatusId: { type: String, required: true },
    positionX: { type: Number, required: true, default: 0 },
    positionY: { type: Number, required: true, default: 0 },
    isClamped: { type: Boolean, default: false },
    stopcockOpenPercent: { type: Number, default: 0 },
    currentVolumeMl: { type: Number, required: true, default: 0 },
    maxCapacityMl: { type: Number, required: true },
    contents: [
      {
        reagentId: { type: String, required: true },
        volumeMl: { type: Number, required: true },
        molarity: { type: Number },
        name: { type: String, required: true },
        color: { type: String, required: true },
      },
    ],
    temperatureC: { type: Number, default: 25 },
    tareGrams: { type: Number, default: 0 },
  },
  { _id: false }
);

const observationSchema = new Schema<IObservationRecord>(
  {
    trialNumber: { type: Number, required: true },
    label: { type: String, required: true },
    initialReadingMl: { type: Number, required: true },
    finalReadingMl: { type: Number, required: true },
    volumeDeliveredMl: { type: Number, required: true },
    colorObserved: { type: String, required: true },
    isEndpointReached: { type: Boolean, default: false },
    isOvershot: { type: Boolean, default: false },
    notes: { type: String },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const virtualLabSessionSchema = new Schema<IVirtualLabSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    institution: { type: Schema.Types.ObjectId, ref: 'Institution', index: true },
    experimentId: { type: String, required: true, index: true },
    experimentVersion: { type: Number, required: true, default: 1 },
    status: {
      type: String,
      required: true,
      enum: Object.values(LabSessionStatus),
      default: LabSessionStatus.IN_PROGRESS,
      index: true,
    },
    safetyBriefingAcknowledged: { type: Boolean, default: false },
    currentStepIndex: { type: Number, default: 0 },
    completedStepIds: [{ type: String }],
    benchState: [benchApparatusSchema],
    observationNotebook: [observationSchema],
    rawMeasurements: { type: Schema.Types.Mixed, default: {} },
    mistakeLog: [
      {
        timestamp: { type: Date, default: Date.now },
        actionAttempted: { type: String, required: true },
        warningGiven: { type: String, required: true },
        stepIndex: { type: Number, required: true },
      },
    ],
    calculatedResult: {
      value: { type: Number },
      unit: { type: String },
      concordantVolumeMl: { type: Number },
      verifiedByServer: { type: Boolean, default: false },
      computedAt: { type: Date },
    },
    startedAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

virtualLabSessionSchema.index({ user: 1, experimentId: 1, status: 1 });

export const VirtualLabSession = model<IVirtualLabSession>(
  'VirtualLabSession',
  virtualLabSessionSchema
);
