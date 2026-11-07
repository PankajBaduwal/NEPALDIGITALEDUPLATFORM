import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { ApiResponse } from '../../common/utils/response.util';
import { User } from '../../models';
import { TimetableService } from './timetable.service';
import { TimetableBuilderService as B } from './timetable-builder.service';

const actor = (req: AuthenticatedRequest) => ({ userId: req.user!.userId, role: req.user!.role });
const inst = (req: AuthenticatedRequest) => req.institutionId!;

type Handler = (req: AuthenticatedRequest, res: Response) => Promise<any>;
const wrap = (fn: Handler, message: string) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return ApiResponse.success(res, await fn(req, res), message);
  } catch (err) {
    next(err);
  }
};

const yearOf = async (req: AuthenticatedRequest) => {
  const y = (req.query.academicYearId as string) || (await TimetableService.currentYearId(inst(req)));
  if (!y) throw { status: 400, message: 'No academic year configured' };
  return String(y);
};

export class TimetableController {
  // ── Configuration ──
  static getPeriods = wrap((req) => TimetableService.getPeriods(inst(req)), 'Period configuration');
  static getConfig = wrap(async (req) => B.getConfig(inst(req), await yearOf(req)), 'Timetable configuration');
  static configureTemplate = wrap((req) => TimetableService.configureTemplate(inst(req), req.body, actor(req)), 'Timetable configuration saved');

  // ── Builder ──
  static overview = wrap(async (req) => B.overview(inst(req), await yearOf(req)), 'Timetable overview');
  static builderContext = wrap((req) => B.builderContext(inst(req), req.params.sectionId), 'Builder context');
  static createDraft = wrap((req) => B.createDraft(inst(req), req.params.sectionId, actor(req), { copyFrom: req.body?.copyFrom }), 'Draft created');
  static getTimetable = wrap((req) => B.getTimetable(inst(req), req.params.id), 'Timetable loaded');
  static setEntry = wrap((req) => B.setEntry(inst(req), req.params.id, req.body, actor(req)), 'Period saved');
  static removeDraftEntry = wrap((req) => B.removeEntry(inst(req), req.params.id, req.params.entryId, actor(req)), 'Period cleared');
  static validate = wrap((req) => B.runValidation(inst(req), req.params.id), 'Validation complete');
  static submit = wrap((req) => B.submitForReview(inst(req), req.params.id, actor(req)), 'Submitted for review');
  static returnToDraft = wrap((req) => B.returnToDraft(inst(req), req.params.id, actor(req), req.body?.reason), 'Returned to draft');
  static publish = wrap((req) => B.publish(inst(req), req.params.id, actor(req)), 'Timetable published');
  static archive = wrap((req) => B.archive(inst(req), req.params.id, actor(req)), 'Timetable archived');
  static history = wrap((req) => B.history(inst(req), { sectionId: req.query.sectionId as string, limit: Number(req.query.limit) || 100 }), 'Change history');

  // ── Single-slot API (edits the section draft) ──
  static checkConflicts = wrap((req) => TimetableService.detectConflicts(inst(req), req.body), 'Conflict check');
  static assignEntry = wrap((req) => TimetableService.assignTimetableEntry(inst(req), req.body, actor(req)), 'Period saved to draft');
  static removeEntry = wrap((req) => TimetableService.removeTimetableEntry(inst(req), req.params.id, actor(req)), 'Period removed from draft');

  static assignSubstitution = wrap(
    (req) => TimetableService.assignSubstitution({ ...req.body, institutionId: inst(req), assignedBy: req.user!.userId, assignedByRole: req.user!.role }),
    'Substitute assigned'
  );

  // ── Published views ──
  static getTeacherSchedule = wrap(async (req) => {
    const teacherId = req.params.teacherId || req.user!.userId;
    if (req.user!.role === 'TEACHER' && teacherId !== req.user!.userId) throw { status: 403, message: 'Teachers can only view their own schedule' };
    if (req.user!.role !== 'SUPER_ADMIN' && req.user!.role !== 'TEACHER') {
      const t: any = await User.findById(teacherId, 'institutionId');
      if (String(t?.institutionId) !== String(inst(req))) throw { status: 403, message: 'Teacher belongs to another institution', code: 'CROSS_TENANT_FORBIDDEN' };
    }
    return TimetableService.getTeacherSchedule(teacherId);
  }, 'Teaching schedule');
  static getStudentSchedule = wrap(async (req) => {
    await TimetableService.assertCanViewSection(req.user!, req.params.sectionId);
    return TimetableService.getSectionSchedule(req.params.sectionId);
  }, 'Class timetable');
  static getTodaySchedule = wrap((req) => TimetableService.getTodaySchedule(inst(req)), 'Today schedule');
  static getPrincipalOverview = wrap((req) => TimetableService.getPrincipalOverview(inst(req)), 'Principal overview');
  static getSmartBoardSuggestion = wrap((req) => TimetableService.getSmartBoardSuggestion(req.user!.userId), 'Smart Board suggestion');
}
