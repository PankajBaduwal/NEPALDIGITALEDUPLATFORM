const fs = require('fs');

// 1. Update backend/src/modules/admin/admin.service.ts
let adminService = fs.readFileSync('backend/src/modules/admin/admin.service.ts', 'utf8').replace(/\r\n/g, '\n');

// Add Class, StudentEnrollment to imports
adminService = adminService.replace(
  `  AssignmentSubmission,
} from '../../models';`,
  `  AssignmentSubmission,
  Class,
  StudentEnrollment,
} from '../../models';`
);

// Enhance getInstitutionDetails
const oldDetails = `  static async getInstitutionDetails(id: string) {
    const institution = await Institution.findById(id);
    if (!institution) {
      throw { status: 404, message: 'Institution not found', code: 'INSTITUTION_NOT_FOUND' };
    }

    const [admins, subscriptions] = await Promise.all([
      User.find({ institutionId: institution._id, role: UserRole.SCHOOL_ADMIN }),
      Subscription.find({ institutionId: institution._id }).populate('packageId'),
    ]);

    return {
      institution,
      administrators: admins,
      subscriptions,
    };
  }`;

const newDetails = `  static async getInstitutionDetails(id: string) {
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
  }`;

adminService = adminService.replace(oldDetails, newDetails);
fs.writeFileSync('backend/src/modules/admin/admin.service.ts', adminService, 'utf8');
console.log('admin.service.ts updated with getInstitutionDetails and assignInstitutionLeadership');

// 2. Update backend/src/modules/admin/admin.controller.ts
let adminCtrl = fs.readFileSync('backend/src/modules/admin/admin.controller.ts', 'utf8').replace(/\r\n/g, '\n');

if (!adminCtrl.includes('assignLeadership')) {
  adminCtrl = adminCtrl.replace(
    `  static async getInstitutionDetails(req: Request, res: Response, next: NextFunction) {`,
    `  static async assignLeadership(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { userId, targetRole } = req.body;
      const user = await AdminService.assignInstitutionLeadership(id, userId, targetRole, req.user);
      return ApiResponse.success(res, user, \`User successfully updated to \${targetRole}\`);
    } catch (error) {
      next(error);
    }
  }

  static async getInstitutionDetails(req: Request, res: Response, next: NextFunction) {`
  );
  fs.writeFileSync('backend/src/modules/admin/admin.controller.ts', adminCtrl, 'utf8');
  console.log('admin.controller.ts updated with assignLeadership');
}

// 3. Update backend/src/modules/admin/admin.routes.ts
let adminRoutes = fs.readFileSync('backend/src/modules/admin/admin.routes.ts', 'utf8').replace(/\r\n/g, '\n');

if (!adminRoutes.includes('assign-leadership')) {
  adminRoutes = adminRoutes.replace(
    `router.get('/institutions/:id', AdminController.getInstitutionDetails);`,
    `router.get('/institutions/:id', AdminController.getInstitutionDetails);
router.patch('/institutions/:id/assign-leadership', AdminController.assignLeadership);`
  );
  fs.writeFileSync('backend/src/modules/admin/admin.routes.ts', adminRoutes, 'utf8');
  console.log('admin.routes.ts updated with assign-leadership route');
}

