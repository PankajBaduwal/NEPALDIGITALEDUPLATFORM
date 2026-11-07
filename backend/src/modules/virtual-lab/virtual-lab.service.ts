import { Types } from 'mongoose';
import {
  VirtualLabExperiment,
  VirtualLabSession,
  VirtualLabReport,
  type IVirtualLabExperiment,
  type IVirtualLabSession,
  type IVirtualLabReport,
  type IBenchApparatusState,
  type IObservationRecord,
  LabSessionStatus,
  LabReportStatus,
} from '../../models';
import { ApiError } from './api-error';

export interface IStartSessionParams {
  userId: string;
  institutionId?: string;
  experimentId: string;
}

export interface IBenchActionPayload {
  actionType: string;
  apparatusInstanceId?: string;
  targetApparatusInstanceId?: string;
  reagentId?: string;
  volumeMl?: number;
  positionX?: number;
  positionY?: number;
  stopcockOpenPercent?: number;
  readingMl?: number;
}

export interface ICalculateParams {
  concordantTitreMl: number;
  studentCalculatedMolarity: number;
  studentCalculatedStrengthGPerL?: number;
}

export class VirtualLabService {
  /**
   * Returns all published experiments, optionally filtered by class level or board.
   */
  static async listExperiments(filters: { classLevel?: string; board?: string } = {}) {
    const query: Record<string, unknown> = { published: true };
    if (filters.classLevel) query.classLevel = filters.classLevel;
    if (filters.board) query.board = filters.board;
    return VirtualLabExperiment.find(query).sort({ classLevel: 1, experimentId: 1 }).lean();
  }

  /**
   * Retrieves full definition of an experiment.
   */
  static async getExperiment(experimentId: string): Promise<IVirtualLabExperiment> {
    const exp = await VirtualLabExperiment.findOne({ experimentId, published: true });
    if (!exp) {
      throw ApiError.notFound(`Experiment '${experimentId}' not found.`);
    }
    return exp;
  }

  /**
   * Starts a new session or resumes an active in-progress session for a student.
   */
  static async startOrResumeSession(params: IStartSessionParams): Promise<{
    session: IVirtualLabSession;
    experiment: IVirtualLabExperiment;
    isResumed: boolean;
  }> {
    const exp = await this.getExperiment(params.experimentId);

    // Look for existing active session
    let session = await VirtualLabSession.findOne({
      user: new Types.ObjectId(params.userId),
      experimentId: params.experimentId,
      status: LabSessionStatus.IN_PROGRESS,
    });

    let isResumed = false;
    if (session) {
      isResumed = true;
      session.lastActiveAt = new Date();
      await session.save();
    } else {
      // Build initial bench state from experiment apparatus
      const initialBenchState: IBenchApparatusState[] = exp.apparatus.map((app, idx) => ({
        instanceId: `inst_${app.id}_${idx + 1}`,
        apparatusId: app.id,
        positionX: 50 + (idx % 4) * 150,
        positionY: 80 + Math.floor(idx / 4) * 120,
        isClamped: app.id === 'app_burette',
        stopcockOpenPercent: 0,
        currentVolumeMl: 0,
        maxCapacityMl: app.capacityMl ?? 100,
        contents: [],
        temperatureC: 25,
        tareGrams: 0,
      }));

      session = await VirtualLabSession.create({
        user: new Types.ObjectId(params.userId),
        institution: params.institutionId ? new Types.ObjectId(params.institutionId) : undefined,
        experimentId: exp.experimentId,
        experimentVersion: exp.version,
        status: LabSessionStatus.IN_PROGRESS,
        safetyBriefingAcknowledged: false,
        currentStepIndex: 0,
        completedStepIds: [],
        benchState: initialBenchState,
        observationNotebook: [],
        rawMeasurements: {},
        mistakeLog: [],
        startedAt: new Date(),
        lastActiveAt: new Date(),
      });
    }

    return { session, experiment: exp, isResumed };
  }

  /**
   * Acknowledges mandatory safety briefing before bench manipulations.
   */
  static async acknowledgeSafety(sessionId: string, userId: string): Promise<IVirtualLabSession> {
    const session = await VirtualLabSession.findOne({
      _id: new Types.ObjectId(sessionId),
      user: new Types.ObjectId(userId),
    });
    if (!session) throw ApiError.notFound('Lab session not found.');

    session.safetyBriefingAcknowledged = true;
    session.lastActiveAt = new Date();
    await session.save();
    return session;
  }

  /**
   * Executes a physical or chemical bench action with scientific constraints.
   */
  static async executeBenchAction(
    sessionId: string,
    userId: string,
    action: IBenchActionPayload
  ): Promise<{
    session: IVirtualLabSession;
    actionResult: {
      success: boolean;
      message: string;
      observationTriggered?: string;
      isEndpoint?: boolean;
      isOvershot?: boolean;
    };
  }> {
    const session = await VirtualLabSession.findOne({
      _id: new Types.ObjectId(sessionId),
      user: new Types.ObjectId(userId),
    });
    if (!session) throw ApiError.notFound('Lab session not found.');

    if (!session.safetyBriefingAcknowledged) {
      throw ApiError.badRequest(
        'Mandatory lab safety briefing must be reviewed and acknowledged before handling equipment.'
      );
    }

    const exp = await this.getExperiment(session.experimentId);
    let message = 'Action completed.';
    let observationTriggered: string | undefined;
    let isEndpoint = false;
    let isOvershot = false;

    switch (action.actionType) {
      case 'ADJUST_STOPCOCK': {
        const burette = session.benchState.find((b) => b.apparatusId === 'app_burette');
        if (!burette) throw ApiError.badRequest('Burette is not on the bench.');
        burette.stopcockOpenPercent = action.stopcockOpenPercent ?? 0;
        message = `Burette stopcock adjusted to ${burette.stopcockOpenPercent}%.`;
        break;
      }

      case 'TRANSFER_REAGENT': {
        const target = session.benchState.find(
          (b) => b.instanceId === action.targetApparatusInstanceId || b.apparatusId === action.targetApparatusInstanceId
        );
        if (!target) throw ApiError.badRequest('Target container not found.');

        const vol = action.volumeMl ?? 10;
        if (target.currentVolumeMl + vol > target.maxCapacityMl) {
          session.mistakeLog.push({
            timestamp: new Date(),
            actionAttempted: `Overfill vessel ${target.apparatusId}`,
            warningGiven: `Cannot add ${vol} mL. Vessel capacity ${target.maxCapacityMl} mL would overflow.`,
            stepIndex: session.currentStepIndex,
          });
          throw ApiError.badRequest(`Vessel capacity (${target.maxCapacityMl} mL) exceeded!`);
        }

        const reagent = exp.reagents.find((r) => r.id === action.reagentId);
        target.currentVolumeMl += vol;
        if (reagent) {
          target.contents.push({
            reagentId: reagent.id,
            volumeMl: vol,
            molarity: reagent.molarity,
            name: reagent.name,
            color: reagent.color,
          });
        }
        message = `Transferred ${vol} mL of ${reagent?.name ?? 'liquid'} into ${target.apparatusId}.`;
        break;
      }

      case 'ADD_DROPWISE': {
        // Dropwise titration delivery from burette to conical flask
        const burette = session.benchState.find((b) => b.apparatusId === 'app_burette');
        const flask = session.benchState.find((b) => b.apparatusId === 'app_conical_flask');
        if (!burette || !flask) {
          throw ApiError.badRequest('Both burette and conical flask must be prepared.');
        }

        const dropVolume = action.volumeMl ?? 0.05; // 1 drop = 0.05 mL
        if (burette.currentVolumeMl < dropVolume) {
          throw ApiError.badRequest('Burette has insufficient titrant. Refill before proceeding.');
        }

        burette.currentVolumeMl = Math.max(0, burette.currentVolumeMl - dropVolume);
        flask.currentVolumeMl += dropVolume;

        // Model Titration Endpoint:
        // Standard Oxalic Acid (0.05 M, 10 mL aliquot in flask) titrated against NaOH (~0.1 M)
        // Stoichiometry: H2C2O4 + 2NaOH -> Na2C2O4 + 2H2O
        // 10 mL of 0.05 M oxalic acid requires exactly 10.00 mL of 0.100 M NaOH
        const delivered = 50 - burette.currentVolumeMl;
        const theoreticalEquivalence = 10.0; // mL

        if (Math.abs(delivered - theoreticalEquivalence) <= 0.05) {
          isEndpoint = true;
          observationTriggered = 'Faint permanent blush of pink color appears throughout the solution (Endpoint reached!).';
          message = 'Endpoint achieved! Faint pink color persists for 30+ seconds.';
        } else if (delivered > theoreticalEquivalence + 0.15) {
          isOvershot = true;
          observationTriggered = 'Deep dark magenta color observed. Endpoint has been overshot!';
          message = 'Endpoint overshot! Titrant exceeded stoichiometric equivalence.';
        } else {
          message = `Delivered ${dropVolume} mL titrant. Total delivered: ${delivered.toFixed(2)} mL. Solution remains clear.`;
        }
        break;
      }

      case 'FILL_BURETTE': {
        const burette = session.benchState.find((b) => b.apparatusId === 'app_burette');
        if (!burette) throw ApiError.badRequest('Burette is not on the bench.');
        burette.currentVolumeMl = 50.0;
        burette.stopcockOpenPercent = 0;
        const naohReagent = exp.reagents.find((r) => r.id === 'reag_naoh');
        burette.contents = [
          {
            reagentId: 'reag_naoh',
            volumeMl: 50.0,
            molarity: naohReagent?.molarity ?? 0.1,
            name: naohReagent?.name ?? 'Sodium Hydroxide Solution (~0.1 M)',
            color: '#e0f2fe',
          },
        ];
        message = 'Burette filled with 50.0 mL of ~0.1 M NaOH solution to the 0.00 mL mark.';
        break;
      }

      case 'PIPETTE_TRANSFER': {
        const flask = session.benchState.find((b) => b.apparatusId === 'app_conical_flask');
        if (!flask) throw ApiError.badRequest('Conical flask is not on the bench.');
        const vol = action.volumeMl ?? 10.0;
        flask.currentVolumeMl += vol;
        const oxalicReagent = exp.reagents.find((r) => r.id === 'reag_oxalic_acid');
        flask.contents.push({
          reagentId: 'reag_oxalic_acid',
          volumeMl: vol,
          molarity: oxalicReagent?.molarity ?? 0.05,
          name: oxalicReagent?.name ?? 'Standard Oxalic Acid (0.050 M)',
          color: '#e0f2fe',
        });
        message = `Pipetted ${vol} mL of 0.05 M oxalic acid standard solution into conical flask.`;
        break;
      }

      case 'ADD_INDICATOR': {
        const flask = session.benchState.find((b) => b.apparatusId === 'app_conical_flask');
        if (!flask) throw ApiError.badRequest('Conical flask is not on the bench.');
        const indReagent = exp.reagents.find((r) => r.id === (action.reagentId ?? 'reag_phenolphthalein'));
        flask.contents.push({
          reagentId: action.reagentId ?? 'reag_phenolphthalein',
          volumeMl: 0.1,
          name: indReagent?.name ?? 'Phenolphthalein Indicator',
          color: '#fbcfe8',
        });
        message = 'Added 2-3 drops of Phenolphthalein indicator to conical flask.';
        break;
      }

      case 'SWIRL_FLASK': {
        message = 'Conical flask swirled gently. Solution mixed thoroughly.';
        break;
      }

      default:
        message = `Action ${action.actionType} recorded.`;
    }

    session.lastActiveAt = new Date();
    await session.save();

    return {
      session,
      actionResult: {
        success: true,
        message,
        observationTriggered,
        isEndpoint,
        isOvershot,
      },
    };
  }

  /**
   * Records a completed observation trial in the notebook.
   */
  static async recordObservation(
    sessionId: string,
    userId: string,
    data: { trialNumber: number; initialReadingMl: number; finalReadingMl: number; notes?: string }
  ): Promise<IVirtualLabSession> {
    const session = await VirtualLabSession.findOne({
      _id: new Types.ObjectId(sessionId),
      user: new Types.ObjectId(userId),
    });
    if (!session) throw ApiError.notFound('Lab session not found.');

    const isPhysics = session.experimentId.startsWith('EXP-P');
    const delivered = Number((data.finalReadingMl - data.initialReadingMl).toFixed(2));
    if (delivered < 0 && !isPhysics) {
      throw ApiError.badRequest('Final burette reading must be greater than initial reading.');
    }

    const isEndpoint = isPhysics ? true : Math.abs(delivered - 10.0) <= 0.1;
    const isOvershot = isPhysics ? false : delivered > 10.15;

    const obs: IObservationRecord = {
      trialNumber: data.trialNumber,
      label: `Trial ${data.trialNumber}`,
      initialReadingMl: data.initialReadingMl,
      finalReadingMl: data.finalReadingMl,
      volumeDeliveredMl: isPhysics ? (data.initialReadingMl > 0 && data.finalReadingMl > 0 ? Number((data.initialReadingMl / data.finalReadingMl).toFixed(2)) : 5.0) : delivered,
      colorObserved: isPhysics ? 'Meter Deflection Recorded' : isOvershot ? 'Deep magenta (overshot)' : isEndpoint ? 'Faint permanent pink' : 'Colorless',
      isEndpointReached: isEndpoint,
      isOvershot: isOvershot,
      notes: data.notes,
      timestamp: new Date(),
    };

    // Replace if trial exists, otherwise push
    const existingIdx = session.observationNotebook.findIndex((o) => o.trialNumber === data.trialNumber);
    if (existingIdx >= 0) {
      session.observationNotebook[existingIdx] = obs;
    } else {
      session.observationNotebook.push(obs);
    }

    session.lastActiveAt = new Date();
    await session.save();
    return session;
  }

  /**
   * Performs server-validated calculations.
   */
  static async calculateAndVerifyResults(
    sessionId: string,
    userId: string,
    calcParams: ICalculateParams
  ): Promise<{
    session: IVirtualLabSession;
    verified: boolean;
    serverMolarity: number;
    serverStrengthGPerL: number;
    discrepancyPercent: number;
    concordanceValid: boolean;
  }> {
    const session = await VirtualLabSession.findOne({
      _id: new Types.ObjectId(sessionId),
      user: new Types.ObjectId(userId),
    });
    if (!session) throw ApiError.notFound('Lab session not found.');

    if (session.experimentId.startsWith('EXP-P')) {
      // Physics Ohm's Law verification
      const nominalR = 5.0; // 5.00 Ohms
      const studentR = calcParams.studentCalculatedMolarity || calcParams.concordantTitreMl;
      const discrepancy = Math.abs(studentR - nominalR) / nominalR;
      const verified = discrepancy <= 0.10; // 10% experimental tolerance

      session.calculatedResult = {
        value: studentR,
        unit: 'Ω (Ohms)',
        concordantVolumeMl: studentR,
        verifiedByServer: verified,
        computedAt: new Date(),
      };
      session.lastActiveAt = new Date();
      await session.save();

      return {
        session,
        verified,
        serverMolarity: nominalR,
        serverStrengthGPerL: Number((discrepancy * 100).toFixed(2)),
        discrepancyPercent: Number((discrepancy * 100).toFixed(2)),
        concordanceValid: session.observationNotebook.length >= 2,
      };
    }

    // Concordance verification: check that at least 2 trials have identical titres (within 0.1 mL)
    const validTrials = session.observationNotebook.filter((t) => !t.isOvershot && t.volumeDeliveredMl > 0);
    const titres = validTrials.map((t) => t.volumeDeliveredMl);
    let concordanceValid = false;
    for (let i = 0; i < titres.length; i++) {
      for (let j = i + 1; j < titres.length; j++) {
        const ti = titres[i];
        const tj = titres[j];
        if (typeof ti === 'number' && typeof tj === 'number' && Math.abs(ti - tj) <= 0.1) {
          concordanceValid = true;
          break;
        }
      }
      if (concordanceValid) break;
    }

    // Authoritative Stoichiometric Calculation:
    // H2C2O4 (0.05 M, 10.0 mL) + 2NaOH -> Na2C2O4 + 2H2O
    // n_acid = 0.05 * 0.010 = 0.0005 moles
    // n_base = 2 * n_acid = 0.0010 moles
    // M_NaOH = 0.0010 / (concordantTitreMl / 1000) = 1.0 / concordantTitreMl
    const titre = calcParams.concordantTitreMl;
    const serverMolarity = Number(((2 * 0.05 * 10.0) / titre).toFixed(4));
    const molarMassNaOH = 40.0; // g/mol
    const serverStrengthGPerL = Number((serverMolarity * molarMassNaOH).toFixed(2));

    const discrepancy = Math.abs(calcParams.studentCalculatedMolarity - serverMolarity) / serverMolarity;
    const verified = discrepancy <= 0.03; // Within 3% tolerance

    session.calculatedResult = {
      value: serverMolarity,
      unit: 'M (mol/L)',
      concordantVolumeMl: titre,
      verifiedByServer: verified,
      computedAt: new Date(),
    };
    session.lastActiveAt = new Date();
    await session.save();

    return {
      session,
      verified,
      serverMolarity,
      serverStrengthGPerL,
      discrepancyPercent: Number((discrepancy * 100).toFixed(2)),
      concordanceValid,
    };
  }

  /**
   * Completes session and generates formal Virtual Lab Report.
   */
  static async submitLabReport(
    sessionId: string,
    userId: string,
    reportData: { studentReflection?: string; precautionsObserved?: string[]; sourcesOfErrorDiscussed?: string[] }
  ): Promise<IVirtualLabReport> {
    const session = await VirtualLabSession.findOne({
      _id: new Types.ObjectId(sessionId),
      user: new Types.ObjectId(userId),
    });
    if (!session) throw ApiError.notFound('Lab session not found.');
    if (!session.calculatedResult?.verifiedByServer) {
      throw ApiError.badRequest(
        'Valid concordant trials and verified calculations are required before generating the report.'
      );
    }

    const exp = await this.getExperiment(session.experimentId);

    const reportId = `rep_${exp.experimentId}_${session.user}_${Date.now()}`;
    const isPhysics = exp.experimentId.startsWith('EXP-P');
    const workedOutCalculations = isPhysics
      ? [
          "Ohm's Law Relation: V = I · R ⟹ R = V / I",
          `Calculated Experimental Specimen Resistance R = ${session.calculatedResult.value} Ω`,
          `Nominal Reference Resistance = 5.00 Ω (Linear V-I relationship verified)`,
        ]
      : [
          'Balanced Equation: H2C2O4·2H2O + 2NaOH → Na2C2O4 + 4H2O',
          'Stoichiometric Relation: M1·V1 / 1 = M2·V2 / 2 (where M1 = 0.05 M oxalic acid, V1 = 10.0 mL, V2 = concordant titre)',
          `M2 (Molarity of NaOH) = (2 × 0.05 M × 10.0 mL) / ${session.calculatedResult.concordantVolumeMl} mL = ${session.calculatedResult.value} mol/L`,
          `Strength of NaOH = M2 × 40.00 g/mol = ${(session.calculatedResult.value * 40.0).toFixed(2)} g/L`,
        ];

    const report = await VirtualLabReport.create({
      reportId,
      session: session._id,
      user: session.user,
      institution: session.institution,
      experimentId: exp.experimentId,
      experimentTitle: exp.title,
      classLevel: exp.classLevel,
      academicYear: exp.academicYear,
      aim: exp.title,
      principle: exp.theoryPrinciple,
      chemicalEquations: exp.chemicalEquations,
      apparatusUsed: exp.apparatus.map((a) => a.name),
      chemicalsUsed: exp.reagents.map((r) => `${r.name} (${r.formula})`),
      observationTable: session.observationNotebook.map((o) => ({
        trial: o.trialNumber,
        initialReadingMl: o.initialReadingMl,
        finalReadingMl: o.finalReadingMl,
        volumeDeliveredMl: o.volumeDeliveredMl,
        color: o.colorObserved,
      })),
      calculationsWorkedOut: workedOutCalculations,
      finalResultText: isPhysics
        ? `Verified Ohm's Law: Potential difference across the resistor is directly proportional to current. The measured resistance is ${session.calculatedResult.value} Ω.`
        : `The molarity of the supplied Sodium Hydroxide solution is ${session.calculatedResult.value} M and its strength is ${(session.calculatedResult.value * 40.0).toFixed(2)} g/L.`,
      numericalResult: {
        value: session.calculatedResult.value,
        unit: isPhysics ? 'Ω' : 'M',
        targetReferenceRange: isPhysics ? [4.5, 5.5] : [0.09, 0.11],
      },
      sourcesOfErrorDiscussed: reportData.sourcesOfErrorDiscussed ?? (isPhysics ? [
        'Parallax error when reading analog needle positions on voltmeter and ammeter.',
        'Contact resistance at loose terminal binding posts.',
        'Joule heating effect (I²Rt) causing slight temperature rise in nichrome resistor wire.',
      ] : [
        'Parallax error when taking meniscus readings from the burette.',
        'Residual drops remaining on the nozzle of the burette without touching the conical flask wall.',
        'Over-titrating past the faint blush of pink to dark magenta.',
      ]),
      precautionsObserved: reportData.precautionsObserved ?? (isPhysics ? [
        'Cleaned terminal ends with sandpaper to minimize contact resistance.',
        'Connected ammeter strictly in series and voltmeter in parallel with proper polarity.',
        'Removed key plug between successive trials to prevent wire heating.',
      ] : [
        'Rinsed burette with titrant (NaOH solution) before final filling.',
        'Removed funnel from top of burette before taking initial zero reading.',
        'Used a clean white tile under the conical flask to observe faint pink endpoint accurately.',
      ]),
      studentReflection: reportData.studentReflection,
      status: LabReportStatus.SUBMITTED,
      submittedAt: new Date(),
    });

    session.status = LabSessionStatus.COMPLETED;
    session.completedAt = new Date();
    await session.save();

    return report;
  }

  /**
   * Retrieves an existing report by reportId or sessionId.
   */
  static async getReport(reportIdOrSessionId: string): Promise<IVirtualLabReport> {
    const isObjectId = Types.ObjectId.isValid(reportIdOrSessionId);
    const query = isObjectId
      ? { $or: [{ reportId: reportIdOrSessionId }, { session: new Types.ObjectId(reportIdOrSessionId) }] }
      : { reportId: reportIdOrSessionId };

    const report = await VirtualLabReport.findOne(query).populate('user', 'name collegeEmail rollNo');
    if (!report) throw ApiError.notFound('Virtual Lab report not found.');
    return report;
  }
}
