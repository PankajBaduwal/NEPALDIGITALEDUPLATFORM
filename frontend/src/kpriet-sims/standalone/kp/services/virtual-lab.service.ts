import { api } from '../lib/api/client';

export interface ApparatusItem {
  id: string;
  name: string;
  category: 'GLASSWARE' | 'SUPPORT_EQUIPMENT' | 'MEASURING_DEVICE' | 'SAFETY_GEAR' | 'ACCESSORY' | string;
  capacityMl?: number;
  precision?: number;
  unit?: string;
  graduated?: boolean;
  minScale?: number;
  maxScale?: number;
  initialQuantity?: number;
  description?: string;
}

export interface ReagentItem {
  id: string;
  name: string;
  formula: string;
  state: 'SOLID' | 'LIQUID' | 'SOLUTION' | 'GAS';
  concentrationMolar?: number;
  soluteMassG?: number;
  volumePreparedMl?: number;
  molecularWeight?: number;
  ghsPictograms: string[];
  hazardSignalWord?: 'DANGER' | 'WARNING';
  hazardStatements?: string[];
  precautionaryStatements?: string[];
  colorHex?: string;
}

export interface ProcedureStep {
  stepNumber: number;
  phase: string;
  instruction: string;
  actionRequired: string;
  benchValidationKey?: string;
  safetyCheck?: string;
  hint?: string;
}

export interface CalculationModel {
  formulaDisplayLatex: string;
  titrationReactionType?: string;
  molesRatioPrimaryStandard?: number;
  molesRatioAnalyte?: number;
  primaryStandardMolarityDefault?: number;
  primaryStandardAliquotVolumeMl?: number;
  expectedTitreRangeMl?: { min: number; max: number };
  molecularWeightAnalyte?: number;
  precisionDecimalsMolarity?: number;
  precisionDecimalsStrength?: number;
}

export interface VirtualLabExperimentData {
  _id: string;
  experimentId: string;
  title: string;
  classLevel: string;
  subject: string;
  board: string;
  academicYear: string;
  curriculumStatus: string;
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
  apparatus: ApparatusItem[];
  reagents: ReagentItem[];
  procedureSteps: ProcedureStep[];
  calculationModel?: CalculationModel;
  published: boolean;
}

export interface VesselState {
  vesselId: string;
  name: string;
  type: string;
  capacityMl: number;
  currentVolumeMl: number;
  reagentId?: string;
  contentsDescription: string;
  molarity?: number;
  ph?: number;
  temperatureC?: number;
  indicatorPresent?: string;
  solutionColorHex?: string;
  precipitateColorHex?: string;
  isStirring?: boolean;
  notes?: string;
}

export interface ObservationTrial {
  trialNumber: number;
  initialReadingMl: number;
  finalReadingMl: number;
  volumeUsedMl: number;
  recordedAt: string;
  notes?: string;
}

export interface BenchMistake {
  type: string;
  message: string;
  penalizedMarks: number;
  timestamp: string;
}

export interface BenchActionLog {
  actionType: string;
  sourceVesselId?: string;
  targetVesselId?: string;
  reagentId?: string;
  volumeMl?: number;
  timestamp: string;
  resultSummary?: string;
}

export interface VirtualLabSessionData {
  _id: string;
  sessionCode: string;
  student: string;
  experiment: VirtualLabExperimentData;
  startedAt: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  safetyAcknowledged: boolean;
  safetyAcknowledgedAt?: string;
  currentStepIndex: number;
  benchState: {
    vessels: VesselState[];
    buretteReadingMl: number;
    buretteLiquidReagentId?: string;
    analyticalBalanceTareG: number;
    analyticalBalanceCurrentG: number;
    ambientTemperatureC: number;
    stirrerActive: boolean;
    activeColorHex: string;
    isEndpointReached: boolean;
    isOvershot: boolean;
  };
  observationNotebook: {
    trials: ObservationTrial[];
    concordantVolumeMl?: number;
    isConcordanceAchieved: boolean;
    studentNotes?: string;
  };
  calculationsAttempted: {
    reportedMolarityNaOH?: number;
    reportedStrengthGL?: number;
    serverVerified: boolean;
    molarityPercentageError?: number;
    strengthPercentageError?: number;
  };
  actionLogs: BenchActionLog[];
  mistakesMade: BenchMistake[];
  finalReportId?: string;
}

export interface VirtualLabReportData {
  _id: string;
  reportCode: string;
  session: string;
  student: {
    _id: string;
    name: string;
    collegeEmail: string;
  };
  experiment: {
    experimentId: string;
    title: string;
    classLevel: string;
    subject?: string;
    board: string;
    officialSourceReference: {
      authority: string;
      documentTitle: string;
      experimentNumber: string;
    };
  };
  generatedAt: string;
  verifiedBySystem: boolean;
  academicScore: {
    conductScore: number;
    accuracyScore: number;
    calculationsScore: number;
    totalScore: number;
    gradeAwarded: string;
  };
  sections: {
    aim: string;
    principle: string;
    equations: string[];
    apparatusList: string[];
    reagentsList: string[];
    safetyPrecautionsTaken: string[];
    observationTable: Array<{
      trialNumber: number;
      initialReadingMl: number;
      finalReadingMl: number;
      volumeUsedMl: number;
    }>;
    concordantReadingMl: number;
    calculations: {
      formulaUsed: string;
      stepByStepText: string[];
      calculatedMolarityAnalyte: number;
      calculatedStrengthAnalyteGL: number;
    };
    resultSummary: string;
    precautionsNoted: string[];
  };
  teacherRemarks?: {
    evaluatedBy?: string;
    evaluatedAt?: string;
    remarksText?: string;
    status: 'PENDING_REVIEW' | 'APPROVED' | 'REQUIRES_REDO';
  };
}

export function normalizeExperiment(raw: any): VirtualLabExperimentData {
  if (!raw) return {} as VirtualLabExperimentData;
  return {
    ...raw,
    procedureSteps: raw.procedureSteps || raw.steps || [],
    apparatus: raw.apparatus || [],
    reagents: raw.reagents || [],
    safetyBriefing: raw.safetyBriefing || {
      requiredPpe: ['Lab Coat', 'Safety Goggles', 'Nitrile Gloves'],
      criticalHazards: ['Corrosive NaOH', 'Oxalic Acid Irritant'],
      spillManagement: 'Neutralize with dilute acetic acid and flush with water.',
      wasteDisposal: 'Dispose of neutralized solution into inorganic chemical waste carboy.',
    },
  };
}

export function normalizeSession(raw: any): VirtualLabSessionData {
  if (!raw) return {} as VirtualLabSessionData;
  const s = raw.session ?? raw;

  // Extract apparatus state if benchState is an array
  let bench = s.benchState;
  if (Array.isArray(bench)) {
    const burette = bench.find((b: any) => b.apparatusId === 'app_burette');
    const flask = bench.find((b: any) => b.apparatusId === 'app_conical_flask');
    const balance = bench.find((b: any) => b.apparatusId === 'app_analytical_balance');

    const currentVol = typeof burette?.currentVolumeMl === 'number' ? burette.currentVolumeMl : 50;
    const deliveredMl = Math.max(0, 50 - currentVol);
    const buretteReading = Number(deliveredMl.toFixed(2));
    const isEndpoint = Math.abs(buretteReading - 10.0) <= 0.05;
    const isOvershot = buretteReading > 10.15;

    const flaskVol = flask?.currentVolumeMl ?? 0;
    const hasIndicator = flask?.contents?.some(
      (c: any) => c.reagentId?.includes('phenolphthalein') || c.name?.toLowerCase().includes('phenolphthalein')
    );
    const hasAnalyte =
      flaskVol > 0 &&
      flask?.contents?.some(
        (c: any) => c.reagentId?.includes('oxalic') || c.name?.toLowerCase().includes('oxalic')
      );

    const vessels: VesselState[] = [
      {
        vesselId: 'vessel_conical_flask',
        name: 'Conical Flask',
        type: 'CONICAL_FLASK',
        capacityMl: 250,
        currentVolumeMl: flaskVol,
        contentsDescription:
          flask?.contents?.map((c: any) => c.name).join(', ') ||
          (flaskVol > 0 ? 'Standard Oxalic Acid Solution' : 'Empty'),
        molarity: hasAnalyte ? 0.05 : undefined,
        ph: isOvershot ? 11.2 : isEndpoint ? 8.3 : hasAnalyte ? 2.5 : 7.0,
        indicatorPresent: hasIndicator ? 'Phenolphthalein' : undefined,
        solutionColorHex: isOvershot
          ? '#db2777'
          : isEndpoint
          ? '#f472b6'
          : hasIndicator && flaskVol > 0
          ? '#fbcfe8'
          : '#e0f2fe',
      },
      {
        vesselId: 'vessel_stock_oxalic',
        name: 'Stock Beaker (0.05 M H₂C₂O₄)',
        type: 'BEAKER',
        capacityMl: 250,
        currentVolumeMl: 100,
        contentsDescription: 'Standard Primary Oxalic Acid Solution (0.050 M)',
        molarity: 0.05,
        ph: 2.5,
      },
      {
        vesselId: 'vessel_stock_naoh',
        name: 'Stock Beaker (~0.1 M NaOH)',
        type: 'BEAKER',
        capacityMl: 250,
        currentVolumeMl: 200,
        contentsDescription: 'Sodium Hydroxide Titrant (~0.1 M)',
        molarity: 0.1,
        ph: 13.0,
      },
    ];

    bench = {
      vessels,
      buretteReadingMl: buretteReading,
      buretteLiquidReagentId: 'reag_naoh',
      analyticalBalanceTareG: balance?.tareGrams ?? 0,
      analyticalBalanceCurrentG: 0,
      ambientTemperatureC: burette?.temperatureC ?? 25,
      stirrerActive: false,
      activeColorHex: isOvershot ? '#db2777' : isEndpoint ? '#f472b6' : '#e0f2fe',
      isEndpointReached: isEndpoint,
      isOvershot: isOvershot,
    };
  } else if (!bench || typeof bench !== 'object') {
    bench = {
      vessels: [
        {
          vesselId: 'vessel_conical_flask',
          name: 'Conical Flask',
          type: 'CONICAL_FLASK',
          capacityMl: 250,
          currentVolumeMl: 0,
          contentsDescription: 'Empty',
          ph: 7.0,
        },
      ],
      buretteReadingMl: 0,
      buretteLiquidReagentId: 'reag_naoh',
      analyticalBalanceTareG: 0,
      analyticalBalanceCurrentG: 0,
      ambientTemperatureC: 25,
      stirrerActive: false,
      activeColorHex: '#e0f2fe',
      isEndpointReached: false,
      isOvershot: false,
    };
  } else {
    bench = {
      vessels: Array.isArray(bench.vessels) ? bench.vessels : [],
      buretteReadingMl: typeof bench.buretteReadingMl === 'number' ? bench.buretteReadingMl : 0,
      buretteLiquidReagentId: bench.buretteLiquidReagentId ?? 'reag_naoh',
      analyticalBalanceTareG: bench.analyticalBalanceTareG ?? 0,
      analyticalBalanceCurrentG: bench.analyticalBalanceCurrentG ?? 0,
      ambientTemperatureC: bench.ambientTemperatureC ?? 25,
      stirrerActive: !!bench.stirrerActive,
      activeColorHex: bench.activeColorHex ?? '#e0f2fe',
      isEndpointReached: !!bench.isEndpointReached,
      isOvershot: !!bench.isOvershot,
    };
  }

  // Normalize observation notebook
  let notebook = s.observationNotebook;
  if (Array.isArray(notebook)) {
    const trials = notebook.map((t: any) => ({
      trialNumber: t.trialNumber ?? 1,
      initialReadingMl: t.initialReadingMl ?? 0,
      finalReadingMl: t.finalReadingMl ?? 0,
      volumeUsedMl:
        t.volumeDeliveredMl ??
        t.volumeUsedMl ??
        Math.abs(Number(((t.finalReadingMl || 0) - (t.initialReadingMl || 0)).toFixed(2))),
      recordedAt: t.timestamp ? new Date(t.timestamp).toISOString() : new Date().toISOString(),
      notes: t.notes ?? '',
    }));
    notebook = {
      trials,
      concordantVolumeMl: s.calculatedResult?.concordantVolumeMl,
      isConcordanceAchieved: trials.length >= 2,
      studentNotes: '',
    };
  } else if (!notebook || typeof notebook !== 'object') {
    notebook = {
      trials: [],
      isConcordanceAchieved: false,
      studentNotes: '',
    };
  } else {
    notebook = {
      trials: Array.isArray(notebook.trials) ? notebook.trials : [],
      concordantVolumeMl: notebook.concordantVolumeMl,
      isConcordanceAchieved: !!notebook.isConcordanceAchieved,
      studentNotes: notebook.studentNotes ?? '',
    };
  }

  // Normalize calculations attempted
  let calcs = s.calculationsAttempted;
  if (!calcs || typeof calcs !== 'object') {
    calcs = {
      reportedMolarityNaOH: s.calculatedResult?.value,
      reportedStrengthGL: s.calculatedResult?.value ? Number((s.calculatedResult.value * 40.0).toFixed(3)) : undefined,
      serverVerified: s.calculatedResult?.verifiedByServer ?? false,
      molarityPercentageError: 0,
      strengthPercentageError: 0,
    };
  }

  return {
    _id: String(s._id ?? s.id ?? ''),
    sessionCode: s.sessionCode || `VL-${String(s._id ?? '0000').slice(-6).toUpperCase()}`,
    student: typeof s.user === 'string' ? s.user : String(s.user?._id ?? s.student ?? ''),
    experiment: raw.experiment ? normalizeExperiment(raw.experiment) : s.experiment,
    startedAt: s.startedAt ? new Date(s.startedAt).toISOString() : new Date().toISOString(),
    status: s.status ?? 'IN_PROGRESS',
    safetyAcknowledged: !!(s.safetyAcknowledged ?? s.safetyBriefingAcknowledged),
    safetyAcknowledgedAt: s.safetyAcknowledgedAt,
    currentStepIndex: s.currentStepIndex ?? 0,
    benchState: bench,
    observationNotebook: notebook,
    calculationsAttempted: calcs,
    actionLogs: Array.isArray(s.actionLogs) ? s.actionLogs : [],
    mistakesMade: Array.isArray(s.mistakeLog)
      ? s.mistakeLog.map((m: any) => ({
          type: 'PROCEDURE_WARNING',
          message: m.warningGiven ?? m.actionAttempted ?? 'Bench safety warning',
          penalizedMarks: 1,
          timestamp: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
        }))
      : Array.isArray(s.mistakesMade)
      ? s.mistakesMade
      : [],
    finalReportId: s.finalReportId ? String(s.finalReportId) : undefined,
  };
}

export const VirtualLabApi = {
  listExperiments: async (params?: { classLevel?: string; subject?: string }) => {
    const raw = (await api.get<any[]>('/virtual-labs/experiments', { params })).data;
    return (raw || []).map(normalizeExperiment);
  },

  getExperiment: async (experimentId: string) => {
    const raw = (await api.get<any>(`/virtual-labs/experiments/${encodeURIComponent(experimentId)}`)).data;
    return normalizeExperiment(raw);
  },

  startSession: async (experimentId: string) => {
    const raw = (await api.post<any>('/virtual-labs/sessions', { experimentId })).data;
    return normalizeSession(raw);
  },

  getSession: async (sessionId: string) => {
    const raw = (await api.get<any>(`/virtual-labs/sessions/${encodeURIComponent(sessionId)}`)).data;
    return normalizeSession(raw);
  },

  acknowledgeSafety: async (sessionId: string) => {
    const raw = (
      await api.post<any>(`/virtual-labs/sessions/${encodeURIComponent(sessionId)}/safety`, {
        acknowledged: true,
      })
    ).data;
    return normalizeSession(raw);
  },

  performAction: async (
    sessionId: string,
    action: {
      actionType: string;
      sourceVesselId?: string;
      targetVesselId?: string;
      volumeMl?: number;
      reagentId?: string;
      readingValue?: number;
    }
  ) => {
    const raw = (
      await api.post<any>(`/virtual-labs/sessions/${encodeURIComponent(sessionId)}/action`, action)
    ).data;
    return {
      session: normalizeSession(raw?.session ?? raw),
      actionResult: raw?.actionResult ?? { success: true, message: 'Action completed.' },
    };
  },

  recordObservation: async (
    sessionId: string,
    trial: {
      trialNumber: number;
      initialReadingMl: number;
      finalReadingMl: number;
      volumeUsedMl: number;
      notes?: string;
    }
  ) => {
    const raw = (
      await api.post<any>(`/virtual-labs/sessions/${encodeURIComponent(sessionId)}/observations`, trial)
    ).data;
    return {
      session: normalizeSession(raw?.session ?? raw),
      concordanceAchieved: !!(raw?.concordanceAchieved ?? raw?.concordanceValid),
      concordantVolumeMl: raw?.concordantVolumeMl,
      message: raw?.message ?? 'Observation recorded.',
    };
  },

  submitCalculation: async (
    sessionId: string,
    calc: {
      reportedMolarityNaOH: number;
      reportedStrengthGL: number;
      concordantVolumeMl: number;
    }
  ) => {
    const payload = {
      concordantTitreMl: calc.concordantVolumeMl,
      studentCalculatedMolarity: calc.reportedMolarityNaOH,
      studentCalculatedStrengthGPerL: calc.reportedStrengthGL,
    };
    const raw = (
      await api.post<any>(`/virtual-labs/sessions/${encodeURIComponent(sessionId)}/calculate`, payload)
    ).data;
    return {
      session: normalizeSession(raw?.session ?? raw),
      verification: {
        serverVerified: !!(raw?.verification?.serverVerified ?? raw?.verified),
        expectedMolarity: raw?.verification?.expectedMolarity ?? raw?.serverMolarity ?? 0.1,
        expectedStrengthGL: raw?.verification?.expectedStrengthGL ?? raw?.serverStrengthGPerL ?? 4.0,
        molarityPercentageError: raw?.verification?.molarityPercentageError ?? raw?.discrepancyPercent ?? 0,
        strengthPercentageError: raw?.verification?.strengthPercentageError ?? 0,
        isWithinAcceptableMargin: !!(raw?.verification?.isWithinAcceptableMargin ?? raw?.verified),
        feedback: raw?.verification?.feedback ?? (raw?.verified ? 'Calculations verified by server!' : 'Calculations deviate from standard stoichiometry.'),
      },
    };
  },

  finalizeReport: async (
    sessionId: string,
    data: {
      precautionsTaken?: string[];
      resultSummary?: string;
    } = {}
  ) =>
    (await api.post<VirtualLabReportData>(`/virtual-labs/sessions/${encodeURIComponent(sessionId)}/report`, data)).data,

  getReport: async (reportId: string) =>
    (await api.get<VirtualLabReportData>(`/virtual-labs/reports/${encodeURIComponent(reportId)}`)).data,
};
