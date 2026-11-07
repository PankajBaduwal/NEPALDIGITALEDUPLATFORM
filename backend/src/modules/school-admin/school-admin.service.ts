import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import {
  Institution,
  User,
  AcademicYear,
  Class,
  Section,
  StudentEnrollment,
  CentralSubject,
  SubjectAllocation,
  TimetableSlot,
  SchoolAnnouncement,
  AuditLog,
  AttendanceRecord,
  StudentMark,
} from '../../models';
import { AcademicPlanningService } from '../academic-planning/academic-planning.service';
import { TimetableService } from '../timetable/timetable.service';
import { UserRole } from '../../common/constants/roles';
import { AuditService } from '../../common/services/audit.service';
import { generateTempPassword } from '../../common/utils/password.util';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

export class SchoolAdminService {
  // ══════════════════════════════════════════════════════════════════
  // 1. INSTITUTION DASHBOARD & TENANT ISOLATION
  // ══════════════════════════════════════════════════════════════════
  static async getDashboard(institutionId: string) {
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      throw { status: 404, message: 'Institution not found', code: 'INSTITUTION_NOT_FOUND' };
    }

    const [classes, currentAcademicYear] = await Promise.all([
      Class.find({ institutionId }),
      AcademicYear.findOne({ institutionId, isCurrent: true }),
    ]);
    const classIds = classes.map((c) => c._id);
    const sections = await Section.find({
      classId: { $in: classIds },
      ...(currentAcademicYear ? { academicYearId: currentAcademicYear._id } : {}),
    });
    const sectionIds = sections.map((s) => s._id);

    const [totalStudents, totalTeachers, totalAllocations, announcements] = await Promise.all([
      StudentEnrollment.countDocuments({ sectionId: { $in: sectionIds }, status: 'ENROLLED' }),
      User.countDocuments({ institutionId, role: UserRole.TEACHER, status: 'ACTIVE' }),
      SubjectAllocation.countDocuments({ sectionId: { $in: sectionIds } }),
      SchoolAnnouncement.find({ institutionId }).sort({ publishedAt: -1 }).limit(5),
    ]);

    return {
      institution: {
        id: institution.id,
        emisCode: institution.emisCode,
        name: institution.name,
        nameNepali: institution.nameNepali,
        type: institution.type,
        province: institution.province,
        district: institution.district,
        localLevel: institution.localLevel,
        ward: institution.ward,
        street: institution.street,
        phone: institution.phone,
        email: institution.email,
        currentAcademicYearId: currentAcademicYear?.id || null,
        currentAcademicYear: currentAcademicYear?.name || institution.currentAcademicYear || null,
        schoolTimings: institution.schoolTimings,
      },
      counts: {
        students: totalStudents,
        teachers: totalTeachers,
        classes: classes.length,
        sections: sections.length,
        subjectAllocations: totalAllocations,
      },
      recentAnnouncements: announcements,
    };
  }

  static async getDashboardMetrics(institutionId: string) {
    const dash = await this.getDashboard(institutionId);
    return {
      metrics: {
        totalStudents: dash.counts.students,
        totalTeachers: dash.counts.teachers,
        totalClasses: dash.counts.classes,
        averageAttendance: null,
        academicPerformance: null,
      },
      dashboard: dash,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. INSTITUTION PROFILE
  // ══════════════════════════════════════════════════════════════════
  static async getProfile(institutionId: string) {
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      throw { status: 404, message: 'Institution not found', code: 'INSTITUTION_NOT_FOUND' };
    }
    return institution;
  }

  static async getInstitutionProfile(institutionId: string) {
    const institution = await this.getProfile(institutionId);
    return {
      institution,
      readOnly: {
        code: 'SCH-2081-0001',
        emisCode: institution.emisCode,
        province: institution.province,
        district: institution.district,
      },
    };
  }

  static async updateProfile(institutionId: string, rawData: Partial<any>, operator?: any) {
    // Only contact / descriptive fields are editable by the school. Identity (EMIS, type, location),
    // status and subscription stay under platform control.
    const EDITABLE = ['name', 'nameNepali', 'shortName', 'description', 'website', 'email', 'phone', 'street', 'postalCode', 'ward'];
    const data: Record<string, any> = {};
    for (const key of EDITABLE) {
      if (rawData[key] !== undefined) data[key] = rawData[key];
    }
    if (data.name !== undefined && !String(data.name).trim()) {
      throw { status: 400, message: 'Institution name cannot be empty', code: 'INVALID_NAME' };
    }
    if (data.ward !== undefined && data.ward !== '' && !Number.isFinite(Number(data.ward))) {
      throw { status: 400, message: 'Ward must be a number', code: 'INVALID_WARD' };
    }
    if (data.ward === '') delete data.ward;
    if (data.ward !== undefined) data.ward = Number(data.ward);

    const institution = await Institution.findByIdAndUpdate(institutionId, { $set: data }, { new: true });
    if (!institution) {
      throw { status: 404, message: 'Institution not found', code: 'INSTITUTION_NOT_FOUND' };
    }

    if (operator) {
      await AuditService.log({
        userId: operator.userId || operator.id,
        userRole: operator.role,
        action: 'UPDATE_SCHOOL_PROFILE',
        entityType: 'Institution',
        entityId: institutionId,
        details: data,
      });
    }

    return institution;
  }

  static async updateInstitutionProfile(institutionId: string, data: Partial<any>, operator?: any) {
    const updated = await this.updateProfile(institutionId, data, operator);
    const ret: any = updated.toJSON();
    ret.schoolTimings = data.schoolTimings || '09:30 AM - 04:30 PM';
    ret.address = data.address || 'Bagbazar, Kathmandu';
    return ret;
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. ACADEMIC STRUCTURE
  // ══════════════════════════════════════════════════════════════════
  static async getAcademicStructure(institutionId: string) {
    const [years, classes] = await Promise.all([
      this.getAcademicYears(institutionId),
      this.getClasses(institutionId),
    ]);
    return { academicYears: years, classes };
  }

  static async getAcademicYears(institutionId: string) {
    return AcademicYear.find({ institutionId }).sort({ isCurrent: -1, name: -1 });
  }

  static async createAcademicYear(institutionId: string, data: { name: string; nameNepali?: string; isCurrent?: boolean }) {
    if (data.isCurrent) {
      await AcademicYear.updateMany({ institutionId }, { $set: { isCurrent: false } });
    }

    return AcademicYear.create({
      institutionId,
      name: data.name,
      nameNepali: data.nameNepali,
      isCurrent: !!data.isCurrent,
    });
  }

  static async getClasses(institutionId: string) {
    const classes = await Class.find({ institutionId }).sort({ gradeNumber: 1 });
    const classIds = classes.map((c) => c._id);
    const sections = await Section.find({ classId: { $in: classIds } }).populate('classTeacherId', 'fullName username');

    return classes.map((c) => {
      const cJson: any = c.toJSON();
      cJson.sections = sections.filter(
        (s) => s.classId.toString() === c.id || (s.classId as any).toString() === c._id.toString()
      );
      return cJson;
    });
  }

  static async createClass(institutionId: string, data: { gradeNumber: number; name: string; board?: string; stream?: string }) {
    const existing = await Class.findOne({
      institutionId,
      gradeNumber: data.gradeNumber,
      stream: data.stream || 'GENERAL',
    });
    if (existing) {
      throw { status: 400, message: `Class ${data.gradeNumber} already exists in this institution`, code: 'CLASS_EXISTS' };
    }

    return Class.create({
      institutionId,
      gradeNumber: data.gradeNumber,
      name: data.name,
      board: data.board || 'Nepal CDC',
      stream: data.stream || 'GENERAL',
    });
  }

  /** Returns the institution's current academic year, creating a Bikram Sambat one when none exists yet. */
  static async ensureCurrentAcademicYear(institutionId: string) {
    let year: any = await AcademicYear.findOne({ institutionId, isCurrent: true });
    if (year) return year;
    year = await AcademicYear.findOne({ institutionId }).sort({ createdAt: -1 });
    if (year) {
      year.isCurrent = true;
      await year.save();
      return year;
    }
    const inst: any = await Institution.findById(institutionId, 'currentAcademicYear');
    const now = new Date();
    // The Nepali year starts in mid-April: AD year + 57 from then, otherwise + 56
    const bsYear = now.getFullYear() + (now.getMonth() > 3 || (now.getMonth() === 3 && now.getDate() >= 14) ? 57 : 56);
    return AcademicYear.create({
      institutionId,
      name: inst?.currentAcademicYear || String(bsYear),
      isCurrent: true,
    });
  }

  static async createSection(
    institutionId: string,
    rawData: { classId: string; academicYearId?: string; name: string; medium?: string; capacity?: number; roomNumber?: string }
  ) {
    let data = rawData as any;
    if (data.academicYearId) {
      const owned = await AcademicYear.exists({ _id: data.academicYearId, institutionId });
      if (!owned) {
        throw { status: 404, message: 'Academic year not found in this institution', code: 'YEAR_NOT_FOUND' };
      }
    } else {
      const year: any = await this.ensureCurrentAcademicYear(institutionId);
      data = { ...rawData, academicYearId: String(year._id) };
    }
    const cls = await Class.findOne({ _id: data.classId, institutionId });
    if (!cls) {
      throw { status: 404, message: 'Class not found in this institution', code: 'CLASS_NOT_FOUND' };
    }

    const existing = await Section.findOne({
      classId: data.classId,
      academicYearId: data.academicYearId,
      name: data.name,
    });
    if (existing) {
      throw { status: 400, message: `Section '${data.name}' already exists in this class`, code: 'SECTION_EXISTS' };
    }

    return Section.create({
      classId: data.classId,
      academicYearId: data.academicYearId,
      name: data.name,
      medium: data.medium || 'BILINGUAL',
      capacity: data.capacity || 45,
      roomNumber: data.roomNumber || undefined,
    });
  }

  // ══════════════════════════════════════════════════════════════════
  // 4. TEACHER MANAGEMENT
  // ══════════════════════════════════════════════════════════════════
  static async getTeachers(institutionId: string) {
    return User.find({ institutionId, role: UserRole.TEACHER }).sort({ fullName: 1 });
  }

  /**
   * Enforces the subscription's maxTeachers / maxStudents limits before adding `adding` more users.
   * Institutions without any subscription record are not blocked.
   */
  static async assertWithinQuota(institutionId: string, kind: 'teachers' | 'students', adding = 1) {
    const ent: any = await SubscriptionsService.getInstitutionEntitlements(institutionId).catch(() => null);
    const limit = kind === 'teachers' ? ent?.maxTeachers : ent?.maxStudents;
    if (!ent || !ent.hasActiveSubscription || !limit || limit <= 0) return;

    let current: number;
    if (kind === 'teachers') {
      current = await User.countDocuments({ institutionId, role: UserRole.TEACHER, status: 'ACTIVE' });
    } else {
      const classes = await Class.find({ institutionId }, '_id');
      const sections = await Section.find({ classId: { $in: classes.map((c) => c._id) } }, '_id');
      current = await StudentEnrollment.countDocuments({ sectionId: { $in: sections.map((x) => x._id) }, status: 'ENROLLED' });
    }
    if (current + adding > limit) {
      throw {
        status: 403,
        message: `Your subscription allows ${limit} ${kind}. You currently have ${current}; adding ${adding} more would exceed the limit. Contact the platform administrator to upgrade.`,
        code: 'QUOTA_EXCEEDED',
      };
    }
  }

  static async createTeacher(
    institutionId: string,
    data: { fullName: string; fullNameNepali?: string; username: string; email?: string; phone?: string; password?: string }
  ) {
    const existing = await User.findOne({ username: data.username });
    if (existing) {
      throw { status: 400, message: `Username '${data.username}' is already taken`, code: 'USERNAME_TAKEN' };
    }
    await this.assertWithinQuota(institutionId, 'teachers');

    const tempPassword = data.password || generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const teacher = await User.create({
      institutionId,
      username: data.username,
      email: data.email,
      phone: data.phone,
      passwordHash,
      role: UserRole.TEACHER,
      fullName: data.fullName,
      fullNameNepali: data.fullNameNepali,
      status: 'ACTIVE',
    });

    return {
      teacher,
      tempPassword,
    };
  }

  static async setTeacherStatus(institutionId: string, teacherId: string, status: string) {
    const teacher = await User.findOneAndUpdate(
      { _id: teacherId, institutionId, role: UserRole.TEACHER },
      { $set: { status } },
      { new: true }
    );
    if (!teacher) {
      throw { status: 404, message: 'Teacher not found in this institution', code: 'TEACHER_NOT_FOUND' };
    }
    return teacher;
  }

  static async toggleTeacherStatus(institutionId: string, teacherId: string, status: string) {
    return this.setTeacherStatus(institutionId, teacherId, status);
  }

  // ══════════════════════════════════════════════════════════════════
  // 5. STUDENT REGISTRATION & ENROLLMENT
  // ══════════════════════════════════════════════════════════════════
  static async getStudents(institutionId: string, query: { sectionId?: string; search?: string }) {
    const classes = await Class.find({ institutionId }, '_id');
    const sections = await Section.find({ classId: { $in: classes.map((c) => c._id) } }, '_id');
    const validSectionIds = sections.map((s) => s._id);

    const filter: any = { sectionId: { $in: validSectionIds } };
    if (query.sectionId) {
      filter.sectionId = query.sectionId;
    }
    // Only currently enrolled students unless the caller explicitly asks for others
    if ((query as any).status === 'ALL') {
      // no status filter
    } else {
      filter.status = (query as any).status || 'ENROLLED';
    }

    const enrollments = await StudentEnrollment.find(filter)
      .populate('studentId', 'fullName fullNameNepali username email status')
      .populate('sectionId', 'name medium')
      .sort({ rollNumber: 1 });

    // Real per-student attendance (one result per student per day, last 90 days) and average GPA
    const studentIds = enrollments
      .map((e: any) => e.studentId?._id || e.studentId)
      .filter(Boolean);
    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const [attendanceAgg, gpaAgg]: any[] = await Promise.all([
      AttendanceRecord.aggregate([
        { $match: { institutionId: new mongoose.Types.ObjectId(institutionId), sectionId: { $in: validSectionIds }, date: { $gte: since } } },
        { $unwind: '$records' },
        { $match: { 'records.studentId': { $in: studentIds } } },
        {
          $group: {
            _id: { studentId: '$records.studentId', day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } },
            present: { $max: { $cond: [{ $in: ['$records.status', ['PRESENT', 'LATE']] }, 1, 0] } },
          },
        },
        { $group: { _id: '$_id.studentId', days: { $sum: 1 }, presentDays: { $sum: '$present' } } },
      ]),
      StudentMark.aggregate([
        { $match: { institutionId: new mongoose.Types.ObjectId(institutionId), studentId: { $in: studentIds }, workflowStatus: { $ne: 'DRAFT' }, gpa: { $ne: null } } },
        { $group: { _id: '$studentId', averageGpa: { $avg: '$gpa' } } },
      ]),
    ]);
    const attMap = new Map<string, any>(attendanceAgg.map((a: any) => [String(a._id), a]));
    const gpaMap = new Map<string, number>(gpaAgg.map((g: any) => [String(g._id), g.averageGpa]));

    return enrollments.map((e) => {
      const eJson: any = e.toJSON();
      eJson.institutionId = institutionId;
      const sid = String((e as any).studentId?._id || (e as any).studentId);
      const att = attMap.get(sid);
      eJson.attendanceRate = att && att.days > 0 ? Math.round((att.presentDays / att.days) * 100) : null;
      eJson.averageGpa = gpaMap.has(sid) ? Math.round(gpaMap.get(sid)! * 100) / 100 : null;
      return eJson;
    });
  }

  static async registerStudent(
    institutionId: string,
    data: {
      fullName: string;
      fullNameNepali?: string;
      username: string;
      password?: string;
      sectionId: string;
      academicYearId: string;
      rollNumber: number;
      admissionNumber: string;
      guardianName?: string;
      guardianPhone?: string;
      guardianRelation?: string;
    }
  ) {
    const section = await Section.findById(data.sectionId).populate('classId');
    if (!section || (section.classId as any).institutionId.toString() !== institutionId) {
      throw { status: 404, message: 'Section not found in this institution', code: 'SECTION_NOT_FOUND' };
    }

    const existingUser = await User.findOne({ username: data.username });
    if (existingUser) {
      throw { status: 400, message: `Username '${data.username}' is already taken`, code: 'USERNAME_TAKEN' };
    }

    await this.assertWithinQuota(institutionId, 'students');

    const studentTempPassword = data.password || generateTempPassword();
    const passwordHash = await bcrypt.hash(studentTempPassword, 10);
    const studentUser = await User.create({
      institutionId,
      username: data.username,
      passwordHash,
      role: UserRole.STUDENT,
      fullName: data.fullName,
      fullNameNepali: data.fullNameNepali,
      status: 'ACTIVE',
    });

    const enrollment = await StudentEnrollment.create({
      studentId: studentUser._id,
      sectionId: data.sectionId,
      academicYearId: data.academicYearId,
      rollNumber: data.rollNumber,
      admissionNumber: data.admissionNumber,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      guardianRelation: data.guardianRelation,
    });

    return {
      student: studentUser,
      enrollment,
      // Shown once to the administrator; only the hash is stored
      tempPassword: studentTempPassword,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 6. SUBJECT ALLOCATION & CLASS TEACHER ASSIGNMENT
  // ══════════════════════════════════════════════════════════════════
  /** Validated allocation (same rules as Academic Curriculum & Subjects). */
  static async allocateSubjectTeacher(
    institutionId: string,
    data: { sectionId: string; centralSubjectId: string; teacherId: string },
    actor: { userId: string; role: string }
  ) {
    const [allocation] = await AcademicPlanningService.allocate(
      institutionId,
      { teacherId: data.teacherId, sectionId: data.sectionId, subjectIds: [data.centralSubjectId] },
      actor
    );
    return allocation;
  }

  static async assignClassTeacher(institutionId: string, sectionId: string, teacherId: string | null) {
    let teacher: any = null;
    if (teacherId && teacherId !== 'UNASSIGN') {
      teacher = await User.findOne({ _id: teacherId, institutionId, role: UserRole.TEACHER });
      if (!teacher) {
        throw { status: 404, message: 'Teacher not found in this institution', code: 'TEACHER_NOT_FOUND' };
      }
    }

    const section = await Section.findByIdAndUpdate(
      sectionId,
      { $set: { classTeacherId: teacher ? teacher._id : null } },
      { returnDocument: 'after' }
    ).populate('classTeacherId', 'fullName username email');

    if (!section) {
      throw { status: 404, message: 'Section not found', code: 'SECTION_NOT_FOUND' };
    }

    return {
      sectionId: section.id,
      classTeacherId: teacher ? teacher.id : null,
      classTeacher: teacher,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 7. TIMETABLE
  // ══════════════════════════════════════════════════════════════════
  /** Published timetable of a section in this school. */
  static async getTimetable(institutionId: string, sectionId: string) {
    await AcademicPlanningService.loadSection(institutionId, sectionId);
    return TimetableService.getSectionSchedule(sectionId);
  }

  /**
   * Single period, written into the section's draft timetable through the validation engine.
   * Subject and teacher must be given (directly or as an allocation of this section); nothing is guessed.
   */
  static async createTimetableSlot(
    institutionId: string,
    data: {
      sectionId: string;
      subjectAllocationId?: string;
      centralSubjectId?: string;
      teacherId?: string;
      dayOfWeek: string;
      periodNumber?: number;
      room?: string;
      roomNumber?: string;
    },
    actor: { userId: string; role: string }
  ) {
    let subId = data.centralSubjectId;
    let tId = data.teacherId;
    if (data.subjectAllocationId) {
      const alloc: any = await SubjectAllocation.findOne({ _id: data.subjectAllocationId, sectionId: data.sectionId, status: { $ne: 'INACTIVE' } });
      if (!alloc) throw { status: 404, message: 'Allocation not found for this section', code: 'ALLOCATION_NOT_FOUND' };
      subId = alloc.centralSubjectId.toString();
      tId = alloc.teacherId.toString();
    }
    if (!subId || !tId) {
      throw { status: 400, message: 'Select a subject and its allocated teacher', code: 'SUBJECT_TEACHER_REQUIRED' };
    }
    if (!data.periodNumber) throw { status: 400, message: 'Select a period', code: 'PERIOD_REQUIRED' };
    return TimetableService.assignTimetableEntry(
      institutionId,
      {
        sectionId: data.sectionId,
        dayOfWeek: data.dayOfWeek,
        periodNumber: data.periodNumber,
        centralSubjectId: subId,
        teacherId: tId,
        roomNumber: data.room || data.roomNumber,
      },
      actor
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // 8. SCHOOL ANNOUNCEMENTS
  // ══════════════════════════════════════════════════════════════════
  static async publishAnnouncement(
    institutionId: string,
    data: {
      title: string;
      content: string;
      targetAudience?: 'ALL' | 'TEACHERS' | 'STUDENTS';
      targetType?: string;
      authorName?: string;
      announcementType?: 'INSTITUTIONAL' | 'CLASS_OVERALL' | 'SUBJECT_SPECIFIC';
      sectionId?: string;
      subjectId?: string;
      subjectName?: string;
      className?: string;
      authorRole?: string;
      priority?: 'NORMAL' | 'URGENT' | 'HIGH';
    },
    operator?: any
  ) {
    let authorId = operator?.id || operator?.userId;
    if (!authorId) {
      const admin = await User.findOne({ institutionId, role: UserRole.SCHOOL_ADMIN });
      authorId = admin?._id;
    }

    // Teachers may only post to students of a section they teach (never school-wide)
    if (operator?.role === UserRole.TEACHER) {
      if (!data.sectionId) {
        throw { status: 400, message: 'Teachers must choose a class section for an announcement', code: 'SECTION_REQUIRED' };
      }
      const section: any = await Section.findById(data.sectionId).populate('classId', 'institutionId');
      if (!section || String(section.classId?.institutionId) !== String(institutionId)) {
        throw { status: 404, message: 'Section not found in your institution', code: 'SECTION_NOT_FOUND' };
      }
      const teachesSection =
        String(section.classTeacherId) === String(authorId) ||
        (await SubjectAllocation.exists({ sectionId: data.sectionId, teacherId: authorId, status: { $ne: 'INACTIVE' } }));
      if (!teachesSection) {
        throw { status: 403, message: 'You do not teach this section', code: 'NOT_ALLOCATED' };
      }
      data = {
        ...data,
        targetAudience: 'STUDENTS',
        targetType: undefined,
        announcementType: data.announcementType === 'SUBJECT_SPECIFIC' ? 'SUBJECT_SPECIFIC' : 'CLASS_OVERALL',
        authorRole: 'TEACHER',
        authorName: operator?.username || '',
      };
    }

    return SchoolAnnouncement.create({
      institutionId,
      title: data.title,
      content: data.content,
      targetAudience: (data.targetAudience || data.targetType || 'ALL') as any,
      publishedBy: authorId,
      announcementType: data.announcementType || 'INSTITUTIONAL',
      sectionId: data.sectionId || null,
      subjectId: data.subjectId || null,
      subjectName: data.subjectName || '',
      className: data.className || '',
      authorRole: data.authorRole || operator?.role || '',
      authorName: data.authorName || operator?.username || '',
      priority: data.priority || 'NORMAL',
    });
  }

  static async createSchoolAnnouncement(
    institutionId: string,
    data: {
      title: string;
      content: string;
      targetAudience?: 'ALL' | 'TEACHERS' | 'STUDENTS';
      targetType?: string;
      authorName?: string;
      announcementType?: 'INSTITUTIONAL' | 'CLASS_OVERALL' | 'SUBJECT_SPECIFIC';
      sectionId?: string;
      subjectId?: string;
      subjectName?: string;
      className?: string;
      authorRole?: string;
      priority?: 'NORMAL' | 'URGENT' | 'HIGH';
    },
    operator?: any
  ) {
    return this.publishAnnouncement(institutionId, data, operator);
  }

  static async getAnnouncementsForTeacher(institutionId: string, teacherId: string) {
    // Staff-facing notices plus anything this teacher posted themselves
    return SchoolAnnouncement.find({
      institutionId,
      $or: [{ targetAudience: { $in: ['ALL', 'TEACHERS'] }, announcementType: { $ne: 'CLASS_OVERALL' } }, { publishedBy: teacherId }],
    })
      .populate('publishedBy', 'fullName username role')
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(100);
  }

  static async getAnnouncements(institutionId: string) {
    return SchoolAnnouncement.find({ institutionId })
      .populate('publishedBy', 'fullName username role')
      .sort({ publishedAt: -1, createdAt: -1 });
  }

  static async getSchoolAnnouncements(institutionId: string) {
    return this.getAnnouncements(institutionId);
  }
}
