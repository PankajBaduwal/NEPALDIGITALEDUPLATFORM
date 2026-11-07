import { Router, Response, NextFunction } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { tenantMiddleware } from '../../common/middleware/tenant.middleware';
import { authorize } from '../../common/middleware/rbac.middleware';
import { ApiResponse } from '../../common/utils/response.util';
import { CalendarEvent } from '../../models/CalendarEvent';

const router = Router();
router.use(authMiddleware);
router.use(tenantMiddleware);

const WRITERS = ['PRINCIPAL', 'SCHOOL_ADMIN', 'COLLEGE_ADMIN', 'SUPER_ADMIN'];
const TERMS = ['FIRST', 'SECOND', 'THIRD', 'FINAL'];
const TYPES = ['EXAMINATION', 'HOLIDAY', 'MILESTONE', 'MEETING'];

// Standard Nepal academic-year skeleton that a school can start from and then edit.
const TEMPLATE_EVENTS = [
    {
      title: 'Nepali New Year 2083 & Academic Session Commencement',
      date: '2083-01-01 (Apr 14)',
      term: 'FIRST',
      type: 'MILESTONE',
      description: 'Orientation, national anthem assembly, and free textbook distribution under CEHRD scheme.'
    },
    {
      title: 'Unit Test 1 (Formative Assessment - Classes 1–12)',
      date: '2083-02-15 (May 28)',
      term: 'FIRST',
      type: 'EXAMINATION',
      description: 'Continuous assessment portfolio review and first monthly formative evaluation.'
    },
    {
      title: 'First Terminal Examination (Grades 1–12)',
      date: '2083-03-20 to 2083-03-30 (Jul 4–14)',
      term: 'FIRST',
      type: 'EXAMINATION',
      description: 'Summative examinations based on CDC curriculum term syllabus, followed by class marks entry.'
    },
    {
      title: 'Mid-Term Science & Innovation Exhibition',
      date: '2083-05-12 (Aug 27)',
      term: 'SECOND',
      type: 'MILESTONE',
      description: 'Inter-house STEM project displays, robotics demonstrations, and parents open house.'
    },
    {
      title: 'Bijaya Dashami, Dipawali & Chhath Autumn Vacation',
      date: '2083-06-25 to 2083-07-22 (Oct 11 – Nov 7)',
      term: 'SECOND',
      type: 'HOLIDAY',
      description: 'National festival recess for faculty, staff, and students across Nepal.'
    },
    {
      title: 'Second Terminal Examination',
      date: '2083-08-15 to 2083-08-25 (Nov 30 – Dec 10)',
      term: 'SECOND',
      type: 'EXAMINATION',
      description: 'Comprehensive mid-session evaluations and PTA progress reporting conferences.'
    },
    {
      title: 'Winter Vacation & Faculty Pedagogical Workshop',
      date: '2083-09-18 to 2083-09-28 (Jan 2 – Jan 12)',
      term: 'THIRD',
      type: 'HOLIDAY',
      description: 'Winter break with 3-day digital curriculum and smart board teaching refresher for teachers.'
    },
    {
      title: 'SEE & NEB Pre-Board Model Examinations (Grades 10 & 12)',
      date: '2083-10-20 to 2083-10-30 (Feb 2 – Feb 12)',
      term: 'THIRD',
      type: 'EXAMINATION',
      description: 'Full-syllabus mock tests strictly conforming to NEB Sanothimi examination pattern.'
    },
    {
      title: 'Saraswati Puja / Shree Panchami (Vasant Panchami)',
      date: '2083-11-04 (Feb 15)',
      term: 'THIRD',
      type: 'MILESTONE',
      description: 'Veneration of Goddess Saraswati, student cultural presentations, and academic awards.'
    },
    {
      title: 'Annual Final Board & Terminal Examinations (Grades 1–9 & 11)',
      date: '2083-12-10 to 2083-12-24 (Mar 23 – Apr 6)',
      term: 'FINAL',
      type: 'EXAMINATION',
      description: 'Year-end evaluation, SEE exam center supervision, and preparation of final grade sheets.'
    }
  ];

const inst = (req: AuthenticatedRequest) => String(req.institutionId || req.user?.institutionId);
const hasInst = (req: AuthenticatedRequest) => !!(req.institutionId || req.user?.institutionId);

// Platform-level accounts (e.g. super admin) belong to no institution: reading returns an empty calendar,
// changing one is a clear 400 instead of a database cast error
router.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (hasInst(req)) return next();
  if (req.method === 'GET') return ApiResponse.success(res, [], 'No institution calendar for this account');
  return ApiResponse.error(res, 'Select an institution to manage its academic calendar', 400, 'INSTITUTION_REQUIRED');
});

// Everyone in the institution can read the calendar
router.get('/', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const items = await CalendarEvent.find({ institutionId: inst(req) }).sort({ createdAt: 1 });
    return ApiResponse.success(res, items, 'Academic calendar loaded');
  } catch (e) {
    next(e);
  }
});

router.post('/', authorize(...WRITERS), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { title, date, term, type, description } = req.body || {};
    if (!title || !String(title).trim() || !date || !String(date).trim()) {
      return ApiResponse.error(res, 'Title and date are required', 400, 'INVALID_INPUT');
    }
    if (term && !TERMS.includes(term)) return ApiResponse.error(res, 'Invalid term', 400, 'INVALID_INPUT');
    if (type && !TYPES.includes(type)) return ApiResponse.error(res, 'Invalid event type', 400, 'INVALID_INPUT');
    const ev = await CalendarEvent.create({ institutionId: inst(req), title, date, term, type, description: description || '', createdBy: req.user!.userId });
    return ApiResponse.success(res, ev, 'Calendar event created', 201);
  } catch (e) {
    next(e);
  }
});

router.post('/template', authorize(...WRITERS), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const existing = await CalendarEvent.countDocuments({ institutionId: inst(req) });
    if (existing > 0) return ApiResponse.error(res, 'The calendar already has events', 409, 'CALENDAR_NOT_EMPTY');
    const created = await CalendarEvent.insertMany(TEMPLATE_EVENTS.map((e) => ({ ...e, institutionId: inst(req), createdBy: req.user!.userId })));
    return ApiResponse.success(res, created, 'Standard calendar loaded', 201);
  } catch (e) {
    next(e);
  }
});

router.put('/:id', authorize(...WRITERS), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const update: any = {};
    for (const k of ['title', 'date', 'term', 'type', 'description']) if (req.body[k] !== undefined) update[k] = req.body[k];
    if (update.term && !TERMS.includes(update.term)) return ApiResponse.error(res, 'Invalid term', 400, 'INVALID_INPUT');
    if (update.type && !TYPES.includes(update.type)) return ApiResponse.error(res, 'Invalid event type', 400, 'INVALID_INPUT');
    const ev = await CalendarEvent.findOneAndUpdate({ _id: req.params.id, institutionId: inst(req) }, { $set: update }, { new: true });
    if (!ev) return ApiResponse.error(res, 'Event not found', 404, 'NOT_FOUND');
    return ApiResponse.success(res, ev, 'Calendar event updated');
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', authorize(...WRITERS), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const ev = await CalendarEvent.findOneAndDelete({ _id: req.params.id, institutionId: inst(req) });
    if (!ev) return ApiResponse.error(res, 'Event not found', 404, 'NOT_FOUND');
    return ApiResponse.success(res, { id: req.params.id }, 'Calendar event deleted');
  } catch (e) {
    next(e);
  }
});

export const calendarRoutes = router;
