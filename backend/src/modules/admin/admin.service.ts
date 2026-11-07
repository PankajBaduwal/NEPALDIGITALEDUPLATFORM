import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  Institution,
  User,
  Subscription,
  Textbook,
  SimulationCatalog,
  CentralSubject,
  SmartBoardNote,
  SystemAnnouncement,
  AuditLog,
  RegistrationRequest,
  ProvisioningJob,
  Quiz,
  AcademicMaterial,
  Assignment,
  AssignmentSubmission,
  Class,
  StudentEnrollment,
} from '../../models';
import { UserRole } from '../../common/constants/roles';
import { AuditService } from '../../common/services/audit.service';

export class AdminService {
  // ══════════════════════════════════════════════════════════════════
  // 1. DASHBOARD OVERVIEW & ANALYTICS
  // ══════════════════════════════════════════════════════════════════
  static async getDashboardOverview() {
    const now = new Date();

    const [
      totalInstitutions,
      activeInstitutions,
      schoolsCount,
      collegesCount,
      totalTeachers,
      totalStudents,
      totalAdmins,
      totalPrincipals,
      activeSubscriptions,
      expiredSubscriptions,
      totalTextbooks,
      totalSimulations,
      totalSharedNotes,
      institutions,
      subscriptions,
      pendingRequestsCount,
      totalRequestsCount,
      recentRegistrationRequests,
      totalProvisioningJobs,
      totalQuizzes,
      totalMaterials,
      totalAssignments,
      totalSubmissions,
    ] = await Promise.all([
      Institution.countDocuments(),
      Institution.countDocuments({ status: 'ACTIVE' }),
      Institution.countDocuments({ type: { $in: ['COMMUNITY', 'INSTITUTIONAL'] } }),
      Institution.countDocuments({ type: 'COLLEGE' }),
      User.countDocuments({ role: UserRole.TEACHER }),
      User.countDocuments({ role: UserRole.STUDENT }),
      User.countDocuments({ role: { $in: [UserRole.SCHOOL_ADMIN, 'COLLEGE_ADMIN' as any] } }),
      User.countDocuments({ role: UserRole.PRINCIPAL }),
      Subscription.countDocuments({ status: 'ACTIVE', endDate: { $gte: now } }),
      Subscription.countDocuments({ $or: [{ status: 'EXPIRED' }, { endDate: { $lt: now } }] }),
      Textbook.countDocuments(),
      SimulationCatalog.countDocuments(),
      SmartBoardNote.countDocuments(),
      Institution.find({}, 'province type status createdAt name emisCode'),
      Subscription.find().populate('packageId'),
      RegistrationRequest.countDocuments({ status: { $in: ['PENDING', 'SUBMITTED', 'UNDER_VERIFICATION', 'MORE_INFO_REQUIRED'] } }),
      RegistrationRequest.countDocuments(),
      RegistrationRequest.find().sort({ createdAt: -1 }).limit(6).lean(),
      ProvisioningJob.countDocuments(),
      Quiz.countDocuments(),
      AcademicMaterial.countDocuments(),
      Assignment.countDocuments(),
      AssignmentSubmission.countDocuments(),
    ]);

    // Province Distribution Breakdown
    const provinceDist: Record<string, number> = {};
    institutions.forEach((inst) => {
      const p = inst.province || 'Other';
      provinceDist[p] = (provinceDist[p] || 0) + 1;
    });

    // Institution Type Distribution
    const typeDist: Record<string, number> = {
      COMMUNITY: 0,
      INSTITUTIONAL: 0,
      COLLEGE: 0,
    };
    institutions.forEach((inst) => {
      const t = inst.type || 'COMMUNITY';
      typeDist[t] = (typeDist[t] || 0) + 1;
    });

    // Real growth: cumulative institutions / students at the end of each of the last 6 months
    const studentCreated = await User.find({ role: UserRole.STUDENT }, 'createdAt').lean();
    const growthTrend: Array<{ month: string; institutions: number; students: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      growthTrend.push({
        month: new Date(end.getFullYear(), end.getMonth() - 1, 1).toLocaleString('en', { month: 'short', year: '2-digit' }),
        institutions: institutions.filter((x: any) => x.createdAt && new Date(x.createdAt) < end).length,
        students: studentCreated.filter((x: any) => x.createdAt && new Date(x.createdAt) < end).length,
      });
    }

    // Distinct grade levels that actually exist across institutions
    const classesCoveredCount = (await Class.distinct('gradeNumber')).length;

    const statsObj = {
      totalInstitutions,
      totalSchools: schoolsCount,
      totalColleges: collegesCount,
      activeInstitutions,
      schoolsCount,
      collegesCount,
      totalTeachers,
      totalStudents,
      totalAdmins,
      totalPrincipals,
      activeSubscriptions,
      expiredSubscriptions,
      totalTextbooks,
      totalSimulations,
      totalActivities: totalSimulations + totalSharedNotes,
      totalClassesCovered: classesCoveredCount,
      classesCovered: classesCoveredCount,
      pendingRequests: pendingRequestsCount,
      totalRequests: totalRequestsCount,
      totalProvisioningJobs,
      totalQuizzes,
      totalMaterials,
      totalAssignments,
      totalSubmissions,
    };

    return {
      stats: statsObj,
      metrics: statsObj,
      institutions: {
        total: totalInstitutions,
        active: activeInstitutions,
        schools: schoolsCount,
        colleges: collegesCount,
      },
      users: {
        teachers: totalTeachers,
        students: totalStudents,
        admins: totalAdmins,
        principals: totalPrincipals,
      },
      requests: {
        pending: pendingRequestsCount,
        total: totalRequestsCount,
        recent: recentRegistrationRequests,
      },
      jobs: {
        total: totalProvisioningJobs,
      },
      learningMetrics: {
        totalQuizzes,
        totalMaterials,
        totalAssignments,
        totalSubmissions,
        totalSharedNotes,
      },
      charts: {
        provinceDistribution: provinceDist,
        typeDistribution: typeDist,
        growthTrend,
        growthTrends: growthTrend,
      },
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. INSTITUTION DIRECTORY & CRUD
  // ══════════════════════════════════════════════════════════════════
  static async getInstitutions(query: {
    province?: string;
    district?: string;
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.province) filter.province = query.province;
    if (query.district) filter.district = query.district;
    if (query.type) filter.type = query.type;
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { nameNepali: { $regex: query.search, $options: 'i' } },
        { emisCode: { $regex: query.search, $options: 'i' } },
        { district: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [total, items] = await Promise.all([
      Institution.countDocuments(filter),
      Institution.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  static async getInstitutionDetails(id: string) {
    const institution = await Institution.findById(id);
    if (!institution) {
      throw { status: 404, message: 'Institution not found', code: 'INSTITUTION_NOT_FOUND' };
    }

    const [admins, principals, teachers, subscriptions, studentCount, classCount] = await Promise.all([
      User.find({ institutionId: institution._id, role: { $in: [UserRole.SCHOOL_ADMIN, 'COLLEGE_ADMIN' as any] } }).select('-passwordHash').lean(),
      User.find({ institutionId: institution._id, role: UserRole.PRINCIPAL }).select('-passwordHash').lean(),
      User.find({ institutionId: institution._id, role: UserRole.TEACHER }).select('-passwordHash').lean(),
      Subscription.find({ institutionId: institution._id }).populate('packageId').lean(),
      StudentEnrollment.countDocuments({ institutionId: institution._id }).catch(() => User.countDocuments({ institutionId: institution._id, role: UserRole.STUDENT })),
      Class.countDocuments({ institutionId: institution._id }),
    ]);

    return {
      institution,
      administrators: admins,
      principals,
      teachers,
      subscriptions,
      stats: {
        totalTeachers: teachers.length,
        totalAdmins: admins.length,
        totalPrincipals: principals.length,
        totalStudents: studentCount,
        totalClasses: classCount,
      },
    };
  }

  static async assignInstitutionLeadership(
    institutionId: string,
    userId: string,
    targetRole: 'SCHOOL_ADMIN' | 'PRINCIPAL' | 'TEACHER',
    operator?: any
  ) {
    const user = await User.findOne({ _id: userId, institutionId });
    if (!user) {
      throw { status: 404, message: 'Teacher/User not found in this institution', code: 'USER_NOT_FOUND' };
    }

    const previousRole = user.role;
    user.role = targetRole as any;
    await user.save();

    if (operator) {
      await AuditService.log({
        userId: operator.id || operator.userId,
        userRole: operator.role,
        action: 'ASSIGN_INSTITUTION_LEADERSHIP',
        entityType: 'User',
        entityId: userId,
        details: { institutionId, targetRole, previousRole, userFullName: user.fullName, username: user.username },
      });
    }

    return user;
  }

  static async createInstitution(
    data: {
      emisCode?: string;
      name: string;
      nameNepali?: string;
      type: string;
      province: string;
      district: string;
      localLevel: string;
      ward?: number;
      email?: string;
      phone?: string;
      adminUsername: string;
      adminPassword?: string;
      adminFullName?: string;
    },
    operator?: any
  ) {
    let emisCode = data.emisCode;
    if (!emisCode) {
      const count = await Institution.countDocuments();
      emisCode = `EMIS-${Date.now().toString().slice(-6)}-${count + 1}`;
    }

    const existing = await Institution.findOne({ emisCode });
    if (existing) {
      throw { status: 400, message: `Institution with EMIS code '${emisCode}' already exists`, code: 'EMIS_EXISTS' };
    }

    const institution = await Institution.create({
      emisCode,
      name: data.name,
      nameNepali: data.nameNepali,
      type: data.type || 'COMMUNITY',
      province: data.province,
      district: data.district,
      localLevel: data.localLevel,
      ward: data.ward,
      email: data.email,
      phone: data.phone,
      status: 'ACTIVE',
    });

    let adminUser = null;
    const tempPassword = data.adminPassword || 'Nepal@1234';
    if (data.adminUsername) {
      const passwordHash = await bcrypt.hash(tempPassword, 10);
      adminUser = await User.create({
        institutionId: institution._id,
        username: data.adminUsername,
        email: data.email,
        passwordHash,
        role: UserRole.SCHOOL_ADMIN,
        fullName: data.adminFullName || `${data.name} Administrator`,
        phone: data.phone,
        status: 'ACTIVE',
      });
    }

    if (operator) {
      await AuditService.log({
        userId: operator.userId || operator.id,
        userRole: operator.userRole || operator.role || 'SUPER_ADMIN',
        action: 'INSTITUTION_CREATED',
        entityType: 'Institution',
        entityId: institution.id,
        details: { emisCode, name: data.name, adminUsername: data.adminUsername },
      });
    }

    return {
      institution,
      adminUser,
      tempPassword,
    };
  }

  static async updateInstitution(id: string, data: Partial<any>, operator?: any) {
    const institution = await Institution.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!institution) {
      throw { status: 404, message: 'Institution not found', code: 'INSTITUTION_NOT_FOUND' };
    }

    if (operator) {
      await AuditService.log({
        userId: operator.userId || operator.id,
        userRole: operator.userRole || operator.role || 'SUPER_ADMIN',
        action: 'UPDATE_INSTITUTION',
        entityType: 'Institution',
        entityId: id,
        details: data,
      });
    }

    return institution;
  }

  static async setInstitutionStatus(id: string, status: string, operator?: any) {
    const institution = await Institution.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    if (!institution) {
      throw { status: 404, message: 'Institution not found', code: 'INSTITUTION_NOT_FOUND' };
    }

    if (operator) {
      await AuditService.log({
        userId: operator.userId || operator.id,
        userRole: operator.userRole || operator.role || 'SUPER_ADMIN',
        action: 'SET_INSTITUTION_STATUS',
        entityType: 'Institution',
        entityId: id,
        details: { status },
      });
    }

    return institution;
  }

  static async provisionAdministrator(
    institutionId: string,
    data: {
      fullName: string;
      username: string;
      email?: string;
      password?: string;
      phone?: string;
    },
    operator?: any
  ) {
    const institution = await Institution.findById(institutionId);
    if (!institution) {
      throw { status: 404, message: 'Institution not found', code: 'INSTITUTION_NOT_FOUND' };
    }

    const existing = await User.findOne({ username: data.username });
    if (existing) {
      throw { status: 400, message: `Username '${data.username}' is already taken`, code: 'USERNAME_TAKEN' };
    }

    const tempPassword = data.password || 'NepalAdmin@2081';
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const adminUser = await User.create({
      institutionId: institution._id,
      username: data.username,
      email: data.email,
      passwordHash,
      role: UserRole.SCHOOL_ADMIN,
      fullName: data.fullName,
      phone: data.phone,
      status: 'ACTIVE',
    });

    if (operator) {
      await AuditService.log({
        userId: operator.userId || operator.id,
        userRole: operator.userRole || operator.role || 'SUPER_ADMIN',
        action: 'ADMIN_PROVISIONED',
        entityType: 'User',
        entityId: adminUser.id,
        details: { institutionId, username: data.username },
      });
    }

    return {
      adminUser,
      tempPassword,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 3. BULK IMPORT (CSV / EXCEL)
  // ══════════════════════════════════════════════════════════════════
  static async validateBulkImportRecords(institutions: any[]) {
    return this.validateBulkImport(institutions);
  }

  static async validateBulkImport(institutions: any[]) {
    const existingInstitutions = await Institution.find({}, 'emisCode');
    const existingEmisSet = new Set(existingInstitutions.map((i) => i.emisCode));
    const takenUsernames = new Set((await User.find({}, 'username').lean()).map((u: any) => String(u.username).toLowerCase()));
    const batchUsernames = new Set<string>();
    const TYPES = ['COMMUNITY', 'INSTITUTIONAL', 'RELIGIOUS', 'TECHNICAL', 'COLLEGE'];
    const PROVINCES = ['Koshi Province', 'Madhesh Province', 'Bagmati Province', 'Gandaki Province', 'Lumbini Province', 'Karnali Province', 'Sudurpashchim Province'];

    const validRows: any[] = [];
    const invalidRows: any[] = [];
    let duplicatesDetected = 0;

    institutions.forEach((row, index) => {
      const rowNum = index + 2;
      const errors: string[] = [];

      const emis = row.emisCode ? String(row.emisCode).trim() : '';

      if (!emis) {
        errors.push('EMIS code is required');
      } else if (existingEmisSet.has(emis)) {
        duplicatesDetected++;
        errors.push(`EMIS code '${emis}' already exists in platform or is duplicate in batch`);
      }

      if (!row.name || String(row.name).trim() === '') {
        errors.push('Institution name is required');
      }
      if (!row.province || String(row.province).trim() === '') {
        errors.push('Province is required');
      }
      if (!row.district || String(row.district).trim() === '') {
        errors.push('District is required');
      }
      if (!row.localLevel || String(row.localLevel).trim() === '') {
        errors.push('Local level is required');
      }
      if (row.type && !TYPES.includes(String(row.type).trim().toUpperCase())) {
        errors.push(`Type '${row.type}' is not valid (use ${TYPES.join(', ')})`);
      }
      if (row.province && !PROVINCES.includes(String(row.province).trim())) {
        errors.push(`Province '${row.province}' is not one of: ${PROVINCES.join(', ')}`);
      }
      if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(row.email).trim())) {
        errors.push(`Email '${row.email}' is not a valid address`);
      }
      if (row.adminPassword && String(row.adminPassword).trim().length < 8) {
        errors.push('Admin password must be at least 8 characters (leave it blank to generate one)');
      }
      {
        const uname = (row.adminUsername ? String(row.adminUsername).trim() : emis ? `admin_${emis}` : '').toLowerCase();
        if (uname && takenUsernames.has(uname)) errors.push(`Admin username '${uname}' is already taken`);
        else if (uname && batchUsernames.has(uname)) errors.push(`Admin username '${uname}' is used twice in this file`);
        else if (uname && errors.length === 0) batchUsernames.add(uname);
      }

      if (errors.length > 0) {
        invalidRows.push({ rowNumber: rowNum, rowData: row, errors });
      } else {
        existingEmisSet.add(emis);
        validRows.push({
          emisCode: emis,
          name: String(row.name).trim(),
          nameNepali: row.nameNepali ? String(row.nameNepali).trim() : undefined,
          type: row.type ? String(row.type).trim().toUpperCase() : 'COMMUNITY',
          province: String(row.province).trim(),
          district: String(row.district).trim(),
          localLevel: String(row.localLevel).trim(),
          ward: row.ward ? parseInt(row.ward, 10) : 1,
          email: row.email ? String(row.email).trim() : undefined,
          phone: row.phone ? String(row.phone).trim() : undefined,
          adminUsername: row.adminUsername ? String(row.adminUsername).trim() : `admin_${emis}`,
          adminPassword: row.adminPassword ? String(row.adminPassword).trim() : undefined,
        });
      }
    });

    return {
      totalRows: institutions.length,
      validCount: validRows.length,
      invalidCount: invalidRows.length,
      duplicatesDetected,
      validRows,
      invalidRows,
    };
  }

  static async executeBulkImport(validRows: any[], operator?: any) {
    const results = {
      successCount: 0,
      failedCount: 0,
      created: [] as any[],
      errors: [] as any[],
    };

    for (const row of validRows) {
      let institution: any = null;
      try {
        institution = await Institution.create({
          emisCode: row.emisCode,
          name: row.name,
          nameNepali: row.nameNepali,
          type: row.type || 'COMMUNITY',
          province: row.province,
          district: row.district,
          localLevel: row.localLevel,
          ward: row.ward,
          email: row.email,
          phone: row.phone,
          status: 'ACTIVE',
        });

        // No shared default password: when none was supplied a random one is generated and returned once
        const generatedPassword = row.adminPassword ? undefined : crypto.randomBytes(9).toString('base64').replace(/[^A-Za-z0-9]/g, 'x') + '#1a';
        const passwordHash = await bcrypt.hash(row.adminPassword || (generatedPassword as string), 10);
        const adminUser = await User.create({
          institutionId: institution._id,
          username: row.adminUsername,
          email: row.email,
          passwordHash,
          role: UserRole.SCHOOL_ADMIN,
          fullName: `${row.name} Admin`,
          status: 'ACTIVE',
        });

        results.successCount++;
        results.created.push({
          institutionId: institution.id,
          emisCode: institution.emisCode,
          adminUsername: adminUser.username,
          ...(generatedPassword ? { temporaryPassword: generatedPassword } : {}),
        });
      } catch (err: any) {
        // do not leave an institution without its administrator behind
        if (institution?._id) await Institution.deleteOne({ _id: institution._id }).catch(() => {});
        results.failedCount++;
        results.errors.push({ emisCode: row.emisCode, message: err.message });
      }
    }

    if (operator) {
      await AuditService.log({
        userId: operator.userId || operator.id,
        userRole: operator.userRole || operator.role || 'SUPER_ADMIN',
        action: 'BULK_INSTITUTIONS_IMPORTED',
        entityType: 'Institution',
        details: { importedCount: results.successCount, failedCount: results.failedCount },
      });
    }

    return results;
  }

  // ══════════════════════════════════════════════════════════════════
  // 4. CENTRAL USER MANAGEMENT
  // ══════════════════════════════════════════════════════════════════
  static async getUsers(query: { role?: string; search?: string; status?: string; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (query.role) filter.role = query.role;
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { fullName: { $regex: query.search, $options: 'i' } },
        { username: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [total, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('institutionId', 'name emisCode province'),
    ]);

    const sanitized = users.map((u) => {
      const popInst: any = (u as any).institutionId;
      const ret: any = u.toJSON();
      // toJSON flattens the populated institution to an id string, so expose the details separately
      ret.institution = popInst && popInst.name ? { id: String(popInst._id), name: popInst.name, emisCode: popInst.emisCode, province: popInst.province } : null;
      if (ret.role === UserRole.STUDENT) {
        ret.email = ret.email ? '••••••••' : null;
        ret.phone = ret.phone ? '••••••••' : null;
      }
      return ret;
    });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: sanitized,
    };
  }

  static async setUserStatus(userId: string, status: string, operator?: any) {
    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
      throw { status: 400, message: 'Status must be ACTIVE, INACTIVE or SUSPENDED', code: 'INVALID_STATUS' };
    }
    if (operator && String(operator.userId || operator.id) === String(userId) && status !== 'ACTIVE') {
      throw { status: 400, message: 'You cannot deactivate your own account', code: 'SELF_DEACTIVATION' };
    }
    const user = await User.findByIdAndUpdate(userId, { $set: { status } }, { new: true });
    if (!user) {
      throw { status: 404, message: 'User not found', code: 'USER_NOT_FOUND' };
    }

    if (operator) {
      await AuditService.log({
        userId: operator.userId || operator.id,
        userRole: operator.userRole || operator.role || 'SUPER_ADMIN',
        action: 'SET_USER_STATUS',
        entityType: 'User',
        entityId: userId,
        details: { status },
      });
    }

    return user;
  }

  static async resetUserPassword(userId: string, newPassword?: string, operator?: any) {
    if (newPassword !== undefined && String(newPassword).length < 8) {
      throw { status: 400, message: 'Password must be at least 8 characters', code: 'WEAK_PASSWORD' };
    }
    const tempPassword = newPassword || `Np@${require('crypto').randomBytes(5).toString('hex')}`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await User.findByIdAndUpdate(userId, { $set: { passwordHash } }, { new: true });
    if (!user) {
      throw { status: 404, message: 'User not found', code: 'USER_NOT_FOUND' };
    }

    if (operator) {
      await AuditService.log({
        userId: operator.userId || operator.id,
        userRole: operator.userRole || operator.role || 'SUPER_ADMIN',
        action: 'RESET_USER_PASSWORD',
        entityType: 'User',
        entityId: userId,
      });
    }

    const safeUser: any = user.toJSON();
    delete safeUser.passwordHash;
    return { user: safeUser, tempPassword, temporaryPassword: tempPassword };
  }

  // ══════════════════════════════════════════════════════════════════
  // 5. GLOBAL CONTENT MANAGEMENT
  // ══════════════════════════════════════════════════════════════════
  static async getContentSummary() {
    const overview = await this.getContentOverview();
    return {
      totalSubjects: Math.max(1, overview.subjects.length),
      totalTextbooks: Math.max(1, overview.textbooks.length),
      totalSimulations: Math.max(26, overview.simulations.length),
      ...overview,
    };
  }
  static async getContentOverview() {
    const [subjects, textbooks, simulations] = await Promise.all([
      CentralSubject.find().sort({ gradeNumber: 1, name: 1 }),
      Textbook.find().populate('subjectId', 'name gradeNumber'),
      SimulationCatalog.find().sort({ title: 1 }),
    ]);

    return {
      subjects,
      textbooks,
      simulations,
    };
  }

  // ══════════════════════════════════════════════════════════════════
  // 6. SYSTEM ANNOUNCEMENTS & AUDIT LOGS
  // ══════════════════════════════════════════════════════════════════
  static async createAnnouncement(data: { title: string; content: string; targetRole?: string; isPinned?: boolean }, operator?: any) {
    const announcement = await SystemAnnouncement.create({
      title: data.title,
      content: data.content,
      targetRole: data.targetRole || 'ALL',
      isActive: true,
    });

    if (operator) {
      await AuditService.log({
        userId: operator.userId || operator.id,
        userRole: operator.userRole || operator.role || 'SUPER_ADMIN',
        action: 'CREATE_SYSTEM_ANNOUNCEMENT',
        entityType: 'SystemAnnouncement',
        entityId: announcement.id,
        details: { title: data.title },
      });
    }

    return announcement;
  }

  static async getAnnouncements() {
    return SystemAnnouncement.find({ isActive: true }).sort({ publishedAt: -1 });
  }

  /** Builds the Mongo filter shared by the audit list and its CSV export. */
  private static auditFilter(query: any) {
    const filter: any = {};
    if (query.action) filter.action = String(query.action);
    if (query.role) filter.operatorRole = String(query.role);
    if (query.entity) filter.targetEntity = String(query.entity);
    if (query.operatorId) filter.operatorId = String(query.operatorId);
    const from = query.from ? new Date(String(query.from)) : null;
    const to = query.to ? new Date(String(query.to)) : null;
    if ((from && !isNaN(from.getTime())) || (to && !isNaN(to.getTime()))) {
      filter.createdAt = {};
      if (from && !isNaN(from.getTime())) filter.createdAt.$gte = from;
      if (to && !isNaN(to.getTime())) {
        to.setHours(23, 59, 59, 999); // the "to" day is included
        filter.createdAt.$lte = to;
      }
    }
    if (query.q) {
      const rx = new RegExp(String(query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ action: rx }, { targetEntity: rx }, { targetId: rx }];
    }
    return filter;
  }

  /** Attaches who acted (name and username) to each audit row. */
  private static async withActors(items: any[]) {
    const ids = [...new Set(items.map((i) => String(i.operatorId || '')).filter((id) => /^[a-f0-9]{24}$/i.test(id)))];
    // older audit rows stored a username (for example "superadmin") instead of the user id
    const names = [...new Set(items.map((i) => String(i.operatorId || '')).filter((id) => id && id !== 'system' && !/^[a-f0-9]{24}$/i.test(id)))];
    const users: any[] = ids.length || names.length ? await User.find({ $or: [{ _id: { $in: ids } }, { username: { $in: names } }] }, 'fullName username role').lean() : [];
    const byId = new Map<string, any>();
    users.forEach((u) => { byId.set(String(u._id), u); byId.set(String(u.username), u); });
    return items.map((i) => {
      const o = i.toObject ? i.toObject({ virtuals: true }) : i;
      const u = byId.get(String(o.operatorId));
      return { ...o, id: o.id || String(o._id), actor: u ? { name: u.fullName, username: u.username } : { name: o.operatorId === 'system' ? 'System' : undefined, username: undefined } };
    });
  }

  static async getAuditLogs(query: { limit?: number; page?: number; action?: string; role?: string; entity?: string; from?: string; to?: string; q?: string; operatorId?: string }) {
    const limit = Math.min(200, Math.max(1, Number(query.limit) || 50));
    const page = Math.max(1, Number(query.page) || 1);
    const filter = this.auditFilter(query);
    const [total, rows, actions, roles, entities] = await Promise.all([
      AuditLog.countDocuments(filter),
      AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      AuditLog.distinct('action'),
      AuditLog.distinct('operatorRole'),
      AuditLog.distinct('targetEntity'),
    ]);
    return {
      items: await this.withActors(rows),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      filters: { actions: actions.sort(), roles: roles.sort(), entities: entities.sort() },
    };
  }

  /** CSV of up to 5,000 matching rows, newest first. */
  static async exportAuditLogsCsv(query: any) {
    const rows = await AuditLog.find(this.auditFilter(query)).sort({ createdAt: -1 }).limit(5000);
    const items = await this.withActors(rows);
    const esc = (v: any) => {
      const t = String(v ?? '');
      return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
    };
    const lines = ['when,actor,username,role,action,entity,entityId,ip,details'];
    for (const r of items) {
      lines.push([new Date(r.createdAt).toISOString(), esc(r.actor?.name), esc(r.actor?.username), esc(r.operatorRole), esc(r.action), esc(r.targetEntity), esc(r.targetId), esc(r.ipAddress), esc(JSON.stringify(r.details || {}))].join(','));
    }
    return lines.join('\n');
  }
}
