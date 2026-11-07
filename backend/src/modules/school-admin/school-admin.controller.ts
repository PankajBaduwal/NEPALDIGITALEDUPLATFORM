import { Request, Response, NextFunction } from 'express';
import { SchoolAdminService } from './school-admin.service';
import { BulkImportService } from './bulk-import.service';
import { NotificationService } from '../notifications/notification.service';
import { ApiResponse } from '../../common/utils/response.util';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';

export class SchoolAdminController {
  // 1. Overview & Direct Dashboard
  static async getOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await SchoolAdminService.getDashboardMetrics(req.institutionId!);
      return ApiResponse.success(res, data, 'Institution dashboard metrics loaded');
    } catch (error) {
      next(error);
    }
  }

  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await SchoolAdminService.getDashboard(req.institutionId!);
      return ApiResponse.success(res, data, 'Institution dashboard loaded');
    } catch (error) {
      next(error);
    }
  }

  // 2. Profile
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const profile = await SchoolAdminService.getInstitutionProfile(req.institutionId!);
      return ApiResponse.success(res, profile, 'Institution profile loaded');
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await SchoolAdminService.updateInstitutionProfile(req.institutionId!, req.body);
      return ApiResponse.success(res, updated, 'Institution profile updated');
    } catch (error) {
      next(error);
    }
  }

  // 3. Academic Structure
  static async getAcademicStructure(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const structure = await SchoolAdminService.getAcademicStructure(req.institutionId!);
      return ApiResponse.success(res, structure, 'Academic structure loaded');
    } catch (error) {
      next(error);
    }
  }

  static async getClasses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const classes = await SchoolAdminService.getClasses(req.institutionId!);
      return ApiResponse.success(res, classes, 'Classes loaded');
    } catch (error) {
      next(error);
    }
  }

  static async createClass(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const cls = await SchoolAdminService.createClass(req.institutionId!, req.body);
      return ApiResponse.success(res, cls, 'Class configured successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async createSection(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const section = await SchoolAdminService.createSection(req.institutionId!, req.body);
      return ApiResponse.success(res, section, 'Section created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // 4. Teachers
  static async getTeachers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const teachers = await SchoolAdminService.getTeachers(req.institutionId!);
      return ApiResponse.success(res, teachers, 'Teachers list loaded');
    } catch (error) {
      next(error);
    }
  }

  static async createTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const teacher = await SchoolAdminService.createTeacher(req.institutionId!, req.body);
      return ApiResponse.success(res, teacher, 'Teacher registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async toggleTeacherStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await SchoolAdminService.toggleTeacherStatus(req.institutionId!, req.params.teacherId, req.body.status);
      return ApiResponse.success(res, updated, `Teacher status updated to ${req.body.status}`);
    } catch (error) {
      next(error);
    }
  }

  // 5. Students
  static async getStudents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const students = await SchoolAdminService.getStudents(req.institutionId!, req.query);
      return ApiResponse.success(res, students, 'Student roster loaded');
    } catch (error) {
      next(error);
    }
  }

  static async registerStudent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await SchoolAdminService.registerStudent(req.institutionId!, req.body);
      return ApiResponse.success(res, result, 'Student registered and enrolled successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // 6. Allocations & Class Teachers
  static async allocateSubject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const allocation = await SchoolAdminService.allocateSubjectTeacher(req.institutionId!, req.body, { userId: req.user!.userId, role: req.user!.role });
      return ApiResponse.success(res, allocation, 'Subject successfully allocated to teacher', 201);
    } catch (error) {
      next(error);
    }
  }

  static async assignClassTeacher(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const section = await SchoolAdminService.assignClassTeacher(req.institutionId!, req.params.sectionId, req.body.teacherId);
      return ApiResponse.success(res, section, 'Primary class teacher assigned');
    } catch (error) {
      next(error);
    }
  }

  // 7. Timetable
  static async getTimetable(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const timetable = await SchoolAdminService.getTimetable(req.institutionId!, req.query.sectionId as string);
      return ApiResponse.success(res, timetable, 'Timetable schedule loaded');
    } catch (error) {
      next(error);
    }
  }

  static async createTimetableSlot(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const slot = await SchoolAdminService.createTimetableSlot(req.institutionId!, req.body, { userId: req.user!.userId, role: req.user!.role });
      return ApiResponse.success(res, slot, 'Timetable period configured', 201);
    } catch (error) {
      next(error);
    }
  }

  // 8. Announcements
  static async getAnnouncements(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      const announcements =
        req.user?.role === 'TEACHER'
          ? await SchoolAdminService.getAnnouncementsForTeacher(institutionId!, req.user.userId)
          : await SchoolAdminService.getSchoolAnnouncements(institutionId!);
      return ApiResponse.success(res, announcements, 'School announcements loaded');
    } catch (error) {
      next(error);
    }
  }

  static async createAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId;
      const announcement = await SchoolAdminService.createSchoolAnnouncement(institutionId!, req.body, req.user);

      // Realtime notification broadcast to target audience
      try {
        const titlePrefix = req.body.announcementType === 'CLASS_OVERALL'
          ? `[Class ${req.body.className || 'Notice'}] 📢 `
          : (req.body.announcementType === 'SUBJECT_SPECIFIC'
              ? `[${req.body.subjectName || 'Subject'}${req.body.className ? ' - ' + req.body.className : ''}] 📢 `
              : '📢 ');

        await NotificationService.broadcastNotification({
          institutionId: institutionId!,
          audience: (req.user?.role === 'TEACHER' || req.body.sectionId ? 'STUDENTS' : (req.body.targetAudience || 'ALL')) as any,
          sectionId: req.body.sectionId || undefined,
          type: 'ANNOUNCEMENT',
          title: `${titlePrefix}${req.body.title}`,
          message: req.body.content && req.body.content.length > 120 ? req.body.content.substring(0, 117) + '...' : req.body.content,
          priority: req.body.priority || 'NORMAL',
          metadata: {
            announcementId: (announcement as any)?._id || (announcement as any)?.id,
            announcementType: req.body.announcementType || 'INSTITUTIONAL',
            sectionId: req.body.sectionId,
            subjectId: req.body.subjectId,
            subjectName: req.body.subjectName,
            className: req.body.className,
          },
        });
      } catch (e) {
        // Safe fallback
      }

      return ApiResponse.success(res, announcement, 'Announcement published successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // 9. Bulk Teacher Import
  static async downloadTeacherTemplate(_req: Request, res: Response) {
    const csvContent = BulkImportService.getTeacherCsvTemplate();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="teacher_import_template.csv"');
    return res.status(200).send(csvContent);
  }

  static async validateTeacherImport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rows = req.body.teachers || req.body;
      if (!Array.isArray(rows)) {
        return ApiResponse.error(res, 'Array of teacher records required', 400, 'INVALID_PAYLOAD');
      }
      const preview = await BulkImportService.validateTeachers(req.institutionId!, rows);
      return ApiResponse.success(res, preview, 'Teacher import records validated');
    } catch (error) {
      next(error);
    }
  }

  static async executeTeacherImport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rows = req.body.teachers || req.body;
      if (!Array.isArray(rows) || rows.length === 0) {
        return ApiResponse.error(res, 'Array of valid teacher records required', 400, 'INVALID_PAYLOAD');
      }
      const result = await BulkImportService.executeTeacherImport(req.institutionId!, rows, req.user!.userId);
      return ApiResponse.success(res, result, `Imported ${result.successCount} teachers`, 201);
    } catch (error) {
      next(error);
    }
  }

  // 10. Bulk Student Import
  static async downloadStudentTemplate(_req: Request, res: Response) {
    const csvContent = BulkImportService.getStudentCsvTemplate();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="student_import_template.csv"');
    return res.status(200).send(csvContent);
  }

  static async validateStudentImport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rows = req.body.students || req.body;
      if (!Array.isArray(rows)) {
        return ApiResponse.error(res, 'Array of student records required', 400, 'INVALID_PAYLOAD');
      }
      const preview = await BulkImportService.validateStudents(req.institutionId!, rows);
      return ApiResponse.success(res, preview, 'Student import records validated');
    } catch (error) {
      next(error);
    }
  }

  static async executeStudentImport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rows = req.body.students || req.body;
      if (!Array.isArray(rows) || rows.length === 0) {
        return ApiResponse.error(res, 'Array of valid student records required', 400, 'INVALID_PAYLOAD');
      }
      const result = await BulkImportService.executeStudentImport(req.institutionId!, rows, req.user!.userId);
      return ApiResponse.success(res, result, `Imported and enrolled ${result.successCount} students`, 201);
    } catch (error) {
      next(error);
    }
  }

  // 11. Bulk Subject Allocation
  static async bulkAllocateSubjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const allocations = req.body.allocations || req.body;
      if (!Array.isArray(allocations) || allocations.length === 0) {
        return ApiResponse.error(res, 'Array of allocations required', 400, 'INVALID_PAYLOAD');
      }
      const result = await BulkImportService.bulkAllocateSubjects(req.institutionId!, allocations, req.user!.userId);
      return ApiResponse.success(res, result, `Successfully allocated ${result.allocatedCount} subjects`);
    } catch (error) {
      next(error);
    }
  }
}

// ── Allocation and subject overviews used by the HOD / department view ──
async function institutionAllocations(institutionId: string) {
  const { Class, Section, SubjectAllocation } = await import('../../models');
  const classes: any[] = await (Class as any).find({ institutionId }).select('_id gradeNumber').lean();
  const sections: any[] = await (Section as any).find({ classId: { $in: classes.map((c) => c._id) } }).select('_id name classId medium').lean();
  const grade = new Map(classes.map((c) => [String(c._id), c.gradeNumber]));
  const secById = new Map(sections.map((s) => [String(s._id), s]));
  const rows: any[] = await (SubjectAllocation as any).find({ sectionId: { $in: sections.map((s) => s._id) }, status: { $ne: 'INACTIVE' } })
    .populate('teacherId', 'fullName')
    .populate('centralSubjectId', 'name code gradeNumber')
    .lean();
  return { rows, secById, grade };
}

export class SchoolAdminOverviewController {
  static async getAllocations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { TimetableEntry } = await import('../../models');
      const { rows, secById, grade } = await institutionAllocations(req.institutionId!);
      const counts: any[] = await (TimetableEntry as any).aggregate([{ $match: { sectionId: { $in: [...secById.keys()].map((k) => new (require('mongoose').Types.ObjectId)(k)) } } }, { $group: { _id: { s: '$sectionId', c: '$centralSubjectId' }, n: { $sum: 1 } } }]);
      const per = new Map(counts.map((c) => [`${c._id.s}|${c._id.c}`, c.n]));
      const data = rows.map((a: any) => {
        const sec: any = secById.get(String(a.sectionId));
        return {
          id: String(a._id),
          sectionId: { id: String(a.sectionId), name: sec?.name, medium: sec?.medium, classId: { gradeNumber: sec ? grade.get(String(sec.classId)) : undefined } },
          centralSubjectId: a.centralSubjectId ? { id: String(a.centralSubjectId._id), name: a.centralSubjectId.name, code: a.centralSubjectId.code } : undefined,
          teacherId: a.teacherId ? { id: String(a.teacherId._id), _id: String(a.teacherId._id), fullName: a.teacherId.fullName } : undefined,
          medium: a.medium,
          periodsPerWeek: per.get(`${a.sectionId}|${a.centralSubjectId?._id}`) ?? 0,
        };
      });
      return ApiResponse.success(res, data, 'Allocations loaded');
    } catch (error) {
      next(error);
    }
  }

  /** One row per subject taught in the institution with real enrolment, weekly periods and results. */
  static async getSubjectOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { StudentEnrollment, StudentMark, TimetableEntry } = await import('../../models');
      const { rows, secById, grade } = await institutionAllocations(req.institutionId!);
      const bySubject = new Map<string, any>();
      for (const a of rows) {
        if (!a.centralSubjectId) continue;
        const k = String(a.centralSubjectId._id);
        const cur = bySubject.get(k) || { id: k, name: a.centralSubjectId.name, code: a.centralSubjectId.code, gradeNumber: a.centralSubjectId.gradeNumber ?? grade.get(String(secById.get(String(a.sectionId))?.classId)), sectionIds: [] as any[] };
        cur.sectionIds.push(a.sectionId);
        bySubject.set(k, cur);
      }
      const out: any[] = [];
      for (const s of bySubject.values()) {
        const enrolled = await (StudentEnrollment as any).countDocuments({ sectionId: { $in: s.sectionIds }, status: 'ENROLLED' });
        const periods = await (TimetableEntry as any).countDocuments({ sectionId: { $in: s.sectionIds }, centralSubjectId: s.id });
        const marks: any[] = await (StudentMark as any).find({ centralSubjectId: s.id, sectionId: { $in: s.sectionIds }, isAbsent: { $ne: true } }).select('percentage').lean();
        const pct = marks.map((m) => Number(m.percentage)).filter((p) => Number.isFinite(p));
        out.push({
          id: s.id, name: s.name, code: s.code, gradeNumber: s.gradeNumber, sections: s.sectionIds.length, enrolled, periodsPerWeek: periods,
          avgPercent: pct.length ? Math.round((pct.reduce((x, y) => x + y, 0) / pct.length) * 10) / 10 : null,
          passPercent: pct.length ? Math.round((pct.filter((p) => p >= 40).length / pct.length) * 100) : null,
          marksRecorded: pct.length,
        });
      }
      out.sort((a, b) => (a.gradeNumber || 0) - (b.gradeNumber || 0) || String(a.name).localeCompare(String(b.name)));
      return ApiResponse.success(res, out, 'Subject overview loaded');
    } catch (error) {
      next(error);
    }
  }
}
