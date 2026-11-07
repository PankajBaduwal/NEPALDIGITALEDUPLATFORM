import { Response, NextFunction } from 'express';
import { ApiResponse } from '../../common/utils/response.util';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { AcademicPlanningService } from './academic-planning.service';

const actor = (req: AuthenticatedRequest) => ({ userId: req.user!.userId, role: req.user!.role });

type Handler = (req: AuthenticatedRequest, res: Response) => Promise<any>;
const wrap = (fn: Handler, message: string) => async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    return ApiResponse.success(res, await fn(req, res), message);
  } catch (err) {
    next(err);
  }
};

export class AcademicPlanningController {
  static structure = wrap((req) => AcademicPlanningService.structure(req.institutionId!, req.query.academicYearId as string), 'School structure loaded');
  static explorer = wrap(
    (req) =>
      AcademicPlanningService.explorer(req.institutionId!, {
        academicYearId: req.query.academicYearId as string,
        classId: String(req.query.classId || ''),
        medium: req.query.medium as string,
      }),
    'Class subjects loaded'
  );
  static setSectionMedium = wrap((req) => AcademicPlanningService.setSectionMedium(req.institutionId!, req.params.sectionId, req.body.medium, actor(req)), 'Section medium updated');
  static setSectionSubjects = wrap(
    (req) => AcademicPlanningService.setSectionSubjects(req.institutionId!, req.params.sectionId, Array.isArray(req.body.subjects) ? req.body.subjects : [], actor(req)),
    'Section subjects configured'
  );
  static listAllocations = wrap(
    (req) => AcademicPlanningService.listAllocations(req.institutionId!, { sectionId: req.query.sectionId as string, teacherId: req.query.teacherId as string }),
    'Allocations loaded'
  );
  static allocate = wrap((req) => AcademicPlanningService.allocate(req.institutionId!, req.body, actor(req)), 'Teacher allocated');
  static removeAllocation = wrap((req) => AcademicPlanningService.removeAllocation(req.institutionId!, req.params.id, actor(req)), 'Allocation removed');
  static workload = wrap((req) => AcademicPlanningService.workload(req.institutionId!), 'Teacher workload loaded');
}
