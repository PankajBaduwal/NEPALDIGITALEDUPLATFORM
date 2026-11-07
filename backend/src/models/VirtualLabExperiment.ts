import { Schema, model, type Document } from 'mongoose';

export const ExperimentCurriculumStatus = {
  CORE_MANDATORY: 'CORE_MANDATORY',
  RECOMMENDED: 'RECOMMENDED',
  ENRICHMENT: 'ENRICHMENT',
  OPTIONAL: 'OPTIONAL',
} as const;
export type ExperimentCurriculumStatus =
  (typeof ExperimentCurriculumStatus)[keyof typeof ExperimentCurriculumStatus];

export interface IApparatusSpec {
  id: string;
  name: string;
  category: 'GLASSWARE' | 'INSTRUMENT' | 'SUPPORT' | 'HEATING' | 'DISPOSAL' | 'ACCESSORY';
  capacityMl?: number;
  precision?: number;
  unit?: string;
  graduated?: boolean;
  minScale?: number;
  maxScale?: number;
  description: string;
  assetKey?: string;
}

export interface IReagentSpec {
  id: string;
  name: string;
  formula: string;
  state: 'SOLID' | 'LIQUID' | 'GAS' | 'SOLUTION';
  molarity?: number;
  concentrationLabel?: string;
  color: string;
  densityGPerMl?: number;
  molarMass?: number;
  hazardSymbols: Array<'CORROSIVE' | 'TOXIC' | 'FLAMMABLE' | 'IRRITANT' | 'OXIDIZING' | 'ENVIRONMENTAL'>;
  hazardWarnings: string[];
  handlingNotes: string;
  disposalNotes: string;
}

export interface IProcedureStepSpec {
  stepNumber: number;
  stepId: string;
  title: string;
  instruction: string;
  pedagogicalPurpose: string;
  requiredApparatusIds: string[];
  requiredReagentIds: string[];
  allowedActions: string[];
  preconditionDescription: string;
  completionRule: {
    actionType: string;
    targetId?: string;
    sourceId?: string;
    minVolumeMl?: number;
    maxVolumeMl?: number;
    exactValue?: string | number;
  };
  expectedObservation: string;
  hint: string;
  commonMistakes: string[];
  safetyCheck?: string;
}

export interface IScientificCalculationRule {
  formulaName: string;
  reactionEquation: string;
  stoichiometricRatio: {
    reactantA: string;
    reactantB: string;
    ratioAtoB: number;
  };
  formulaString: string;
  calculationStepsTemplate: string[];
  variables: Array<{
    symbol: string;
    label: string;
    unit: string;
    source: 'OBSERVED' | 'PRESET' | 'CALCULATED';
  }>;
  outputMetric: {
    symbol: string;
    label: string;
    unit: string;
    significantFigures: number;
    referenceRange?: [number, number];
  };
}

export interface IVirtualLabExperiment extends Document {
  experimentId: string;
  title: string;
  classLevel: 'class-9' | 'class-10' | 'class-11' | 'class-12';
  subject: string;
  board: string;
  academicYear: string;
  curriculumStatus: ExperimentCurriculumStatus;
  version: number;
  officialSourceReference: {
    authority: string;
    documentTitle: string;
    unitOrChapter: string;
    experimentNumber: string;
    pageReference?: string;
    officialUrl?: string;
  };
  learningOutcomes: string[];
  theoryPrinciple: string;
  chemicalEquations: string[];
  safetyBriefing: {
    requiredPpe: string[];
    criticalHazards: string[];
    spillManagement: string;
    wasteDisposal: string;
  };
  apparatus: IApparatusSpec[];
  reagents: IReagentSpec[];
  steps: IProcedureStepSpec[];
  calculationModel?: IScientificCalculationRule;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const apparatusSchema = new Schema<IApparatusSpec>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    capacityMl: { type: Number },
    precision: { type: Number },
    unit: { type: String },
    graduated: { type: Boolean, default: false },
    minScale: { type: Number },
    maxScale: { type: Number },
    description: { type: String, required: true },
    assetKey: { type: String },
  },
  { _id: false }
);

const reagentSchema = new Schema<IReagentSpec>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    formula: { type: String, required: true },
    state: { type: String, required: true },
    molarity: { type: Number },
    concentrationLabel: { type: String },
    color: { type: String, required: true },
    densityGPerMl: { type: Number },
    molarMass: { type: Number },
    hazardSymbols: [{ type: String }],
    hazardWarnings: [{ type: String }],
    handlingNotes: { type: String, required: true },
    disposalNotes: { type: String, required: true },
  },
  { _id: false }
);

const stepSchema = new Schema<IProcedureStepSpec>(
  {
    stepNumber: { type: Number, required: true },
    stepId: { type: String, required: true },
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    pedagogicalPurpose: { type: String, required: true },
    requiredApparatusIds: [{ type: String }],
    requiredReagentIds: [{ type: String }],
    allowedActions: [{ type: String }],
    preconditionDescription: { type: String, required: true },
    completionRule: { type: Schema.Types.Mixed, required: true },
    expectedObservation: { type: String, required: true },
    hint: { type: String, required: true },
    commonMistakes: [{ type: String }],
    safetyCheck: { type: String },
  },
  { _id: false }
);

const virtualLabExperimentSchema = new Schema<IVirtualLabExperiment>(
  {
    experimentId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    classLevel: {
      type: String,
      required: true,
      enum: ['class-9', 'class-10', 'class-11', 'class-12'],
      index: true,
    },
    subject: { type: String, required: true, default: 'Chemistry' },
    board: { type: String, required: true, default: 'CBSE' },
    academicYear: { type: String, required: true, default: '2024-2025' },
    curriculumStatus: {
      type: String,
      required: true,
      enum: Object.values(ExperimentCurriculumStatus),
      default: ExperimentCurriculumStatus.CORE_MANDATORY,
    },
    version: { type: Number, required: true, default: 1 },
    officialSourceReference: {
      authority: { type: String, required: true },
      documentTitle: { type: String, required: true },
      unitOrChapter: { type: String, required: true },
      experimentNumber: { type: String, required: true },
      pageReference: { type: String },
      officialUrl: { type: String },
    },
    learningOutcomes: [{ type: String }],
    theoryPrinciple: { type: String, required: true },
    chemicalEquations: [{ type: String }],
    safetyBriefing: {
      requiredPpe: [{ type: String }],
      criticalHazards: [{ type: String }],
      spillManagement: { type: String, required: true },
      wasteDisposal: { type: String, required: true },
    },
    apparatus: [apparatusSchema],
    reagents: [reagentSchema],
    steps: [stepSchema],
    calculationModel: { type: Schema.Types.Mixed },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const VirtualLabExperiment = model<IVirtualLabExperiment>(
  'VirtualLabExperiment',
  virtualLabExperimentSchema
);
