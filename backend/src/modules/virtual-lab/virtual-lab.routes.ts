import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../common/middleware/auth.middleware';
import { ApiResponse } from '../../common/utils/response.util';
import { VirtualLabService } from './virtual-lab.service';
import { ApiError } from './api-error';
import { VirtualLabReport } from '../../models';

/**
 * Virtual Labs ported from KPRIET: official Classes 9-12 experiments (chemistry and physics) with server-checked
 * bench actions, observations, calculations and lab reports. Every route needs a signed-in user.
 */
const router = Router();
router.use(authMiddleware);

const wrap = (fn: (req: any, res: Response) => Promise<void>) => (req: Request, res: Response, next: NextFunction) => fn(req, res).catch(next);
const uid = (req: any) => String(req.user.userId);

const ACTIONS = ['PLACE_APPARATUS', 'REMOVE_APPARATUS', 'TRANSFER_REAGENT', 'ADD_DROPWISE', 'ADJUST_STOPCOCK', 'RECORD_MENISCUS', 'TARE_BALANCE', 'HEAT_VESSEL', 'FILTER_MIXTURE', 'RINSE_APPARATUS', 'FILL_BURETTE', 'PIPETTE_TRANSFER', 'ADD_INDICATOR', 'SWIRL_FLASK'];
const num = (v: any, min: number, max: number, name: string, required = true) => {
  if (v === undefined || v === null) {
    if (required) throw ApiError.badRequest(`${name} is required`);
    return undefined;
  }
  if (typeof v !== 'number' || Number.isNaN(v) || v < min || v > max) throw ApiError.badRequest(`${name} must be a number between ${min} and ${max}`);
  return v;
};
const str = (v: any, max: number, name: string) => {
  if (v === undefined || v === null) return undefined;
  if (typeof v !== 'string' || v.length > max) throw ApiError.badRequest(`${name} must be text up to ${max} characters`);
  return v;
};

router.get('/experiments', wrap(async (req, res) => {
  const classLevel = req.query.classLevel ? String(req.query.classLevel) : undefined;
  if (classLevel && !['class-9', 'class-10', 'class-11', 'class-12'].includes(classLevel)) throw ApiError.badRequest('classLevel is invalid');
  ApiResponse.success(res, await VirtualLabService.listExperiments({ classLevel, board: req.query.board ? String(req.query.board) : undefined }), 'Virtual Lab experiments');
}));

router.get('/experiments/:experimentId', wrap(async (req, res) => {
  ApiResponse.success(res, await VirtualLabService.getExperiment(req.params.experimentId), 'Virtual Lab experiment');
}));

router.post('/sessions', wrap(async (req, res) => {
  const experimentId = str(req.body?.experimentId, 80, 'experimentId');
  if (!experimentId) throw ApiError.badRequest('experimentId is required');
  const result = await VirtualLabService.startOrResumeSession({
    userId: uid(req),
    institutionId: req.user.institutionId ? String(req.user.institutionId) : undefined,
    experimentId,
  });
  ApiResponse.success(res, result, result.isResumed ? 'Session resumed' : 'Session started');
}));

router.post('/sessions/:sessionId/safety', wrap(async (req, res) => {
  ApiResponse.success(res, await VirtualLabService.acknowledgeSafety(req.params.sessionId, uid(req)), 'Safety acknowledged');
}));

router.post('/sessions/:sessionId/action', wrap(async (req, res) => {
  const b = req.body || {};
  if (!ACTIONS.includes(b.actionType)) throw ApiError.badRequest('actionType is invalid');
  const payload = {
    actionType: b.actionType,
    apparatusInstanceId: str(b.apparatusInstanceId, 120, 'apparatusInstanceId'),
    targetApparatusInstanceId: str(b.targetApparatusInstanceId, 120, 'targetApparatusInstanceId'),
    sourceVesselId: str(b.sourceVesselId, 120, 'sourceVesselId'),
    targetVesselId: str(b.targetVesselId, 120, 'targetVesselId'),
    reagentId: str(b.reagentId, 120, 'reagentId'),
    volumeMl: num(b.volumeMl, 0, 2000, 'volumeMl', false),
    positionX: typeof b.positionX === 'number' ? b.positionX : undefined,
    positionY: typeof b.positionY === 'number' ? b.positionY : undefined,
    stopcockOpenPercent: num(b.stopcockOpenPercent, 0, 100, 'stopcockOpenPercent', false),
    readingMl: num(b.readingMl, 0, 100, 'readingMl', false),
  };
  ApiResponse.success(res, await VirtualLabService.executeBenchAction(req.params.sessionId, uid(req), payload as any), 'Bench action processed');
}));

router.post('/sessions/:sessionId/observations', wrap(async (req, res) => {
  const b = req.body || {};
  if (!Number.isInteger(b.trialNumber) || b.trialNumber < 1 || b.trialNumber > 10) throw ApiError.badRequest('trialNumber must be a whole number from 1 to 10');
  const payload = {
    trialNumber: b.trialNumber,
    initialReadingMl: num(b.initialReadingMl, 0, 100, 'initialReadingMl'),
    finalReadingMl: num(b.finalReadingMl, 0, 100, 'finalReadingMl'),
    notes: str(b.notes, 500, 'notes'),
  };
  ApiResponse.success(res, await VirtualLabService.recordObservation(req.params.sessionId, uid(req), payload as any), 'Observation recorded');
}));

router.post('/sessions/:sessionId/calculate', wrap(async (req, res) => {
  const b = req.body || {};
  const payload = {
    concordantTitreMl: num(b.concordantTitreMl, 0.1, 100, 'concordantTitreMl'),
    studentCalculatedMolarity: num(b.studentCalculatedMolarity, 0.0001, 10, 'studentCalculatedMolarity'),
    studentCalculatedStrengthGPerL: num(b.studentCalculatedStrengthGPerL, 0, 500, 'studentCalculatedStrengthGPerL', false),
  };
  ApiResponse.success(res, await VirtualLabService.calculateAndVerifyResults(req.params.sessionId, uid(req), payload as any), 'Calculation verified');
}));

router.post('/sessions/:sessionId/report', wrap(async (req, res) => {
  const b = req.body || {};
  const list = (v: any) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string').slice(0, 30) : undefined);
  const payload = {
    studentReflection: str(b.studentReflection, 2000, 'studentReflection'),
    precautionsObserved: list(b.precautionsObserved),
    sourcesOfErrorDiscussed: list(b.sourcesOfErrorDiscussed),
  };
  ApiResponse.success(res, await VirtualLabService.submitLabReport(req.params.sessionId, uid(req), payload as any), 'Report submitted successfully');
}));

router.get('/reports/:reportId', wrap(async (req, res) => {
  ApiResponse.success(res, await VirtualLabService.getReport(String(req.params.reportId)), 'Virtual Lab report');
}));

router.get('/my-reports', wrap(async (req, res) => {
  ApiResponse.success(res, await (VirtualLabReport as any).find({ user: uid(req) }).sort({ createdAt: -1 }), 'My Virtual Lab reports');
}));

export const virtualLabRoutes = router;
