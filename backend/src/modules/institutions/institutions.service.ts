import bcrypt from 'bcryptjs';
import { Institution, User } from '../../models';
import { UserRole } from '../../common/constants/roles';

export interface CreateInstitutionDTO {
  name: string;
  nameNepali?: string;
  emisCode?: string;
  type?: string;
  province: string;
  district: string;
  localLevel: string;
  ward?: number;
  email?: string;
  phone?: string;
  adminUsername?: string;
  adminFullName?: string;
  adminPassword?: string;
}

export class InstitutionsService {
  static async generateInstitutionCode(prefix = 'SCH'): Promise<string> {
    const currentYear = 2081;
    const count = await Institution.countDocuments();
    const sequence = String(count + 1).padStart(4, '0');
    return `${prefix}-${currentYear}-${sequence}`;
  }

  static async createInstitution(data: CreateInstitutionDTO) {
    const emisCode = data.emisCode || (await this.generateInstitutionCode());

    // Check unique emis
    const existing = await Institution.findOne({ emisCode });
    if (existing) {
      throw {
        status: 400,
        message: `Institution with EMIS code '${emisCode}' already exists`,
        code: 'INSTITUTION_EXISTS',
      };
    }

    const institution = await Institution.create({
      emisCode,
      name: data.name,
      nameNepali: data.nameNepali,
      type: (data.type as any) || 'COMMUNITY',
      province: data.province,
      district: data.district,
      localLevel: data.localLevel,
      ward: data.ward,
      email: data.email,
      phone: data.phone,
      status: 'ACTIVE',
    });

    let adminUser = null;
    if (data.adminUsername && data.adminPassword) {
      const existingUser = await User.findOne({ username: data.adminUsername });
      if (existingUser) {
        throw {
          status: 400,
          message: `Username '${data.adminUsername}' already taken`,
          code: 'USERNAME_TAKEN',
        };
      }

      const passwordHash = await bcrypt.hash(data.adminPassword, 10);
      adminUser = await User.create({
        institutionId: institution._id,
        username: data.adminUsername,
        email: data.email,
        passwordHash,
        role: UserRole.SCHOOL_ADMIN,
        fullName: data.adminFullName || `${data.name} Admin`,
        phone: data.phone,
        status: 'ACTIVE',
      });
    }

    return {
      institution,
      adminUser,
    };
  }

  static async listInstitutions(filter: any) {
    return this.getInstitutions(filter);
  }

  static async bulkImport(institutions: any[]) {
    const { AdminService } = await import('../admin/admin.service');
    return AdminService.executeBulkImport(institutions);
  }

  static async getInstitutions(filter: {
    province?: string;
    district?: string;
    type?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(filter.page) || 1;
    const limit = Number(filter.limit) || 20;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filter.province) query.province = filter.province;
    if (filter.district) query.district = filter.district;
    if (filter.type) query.type = filter.type;
    if (filter.status) query.status = filter.status;
    if (filter.search) {
      query.$or = [
        { name: { $regex: filter.search, $options: 'i' } },
        { nameNepali: { $regex: filter.search, $options: 'i' } },
        { emisCode: { $regex: filter.search, $options: 'i' } },
      ];
    }

    const [total, items] = await Promise.all([
      Institution.countDocuments(query),
      Institution.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items,
    };
  }

  static async getInstitutionById(id: string) {
    const institution = await Institution.findById(id);
    if (!institution) {
      throw { status: 404, message: 'Institution not found', code: 'INSTITUTION_NOT_FOUND' };
    }
    return institution;
  }

  static async updateInstitution(id: string, data: Partial<CreateInstitutionDTO>) {
    const institution = await Institution.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!institution) {
      throw { status: 404, message: 'Institution not found', code: 'INSTITUTION_NOT_FOUND' };
    }
    return institution;
  }

  static async setStatus(id: string, status: string) {
    const institution = await Institution.findByIdAndUpdate(id, { $set: { status } }, { new: true });
    if (!institution) {
      throw { status: 404, message: 'Institution not found', code: 'INSTITUTION_NOT_FOUND' };
    }
    return institution;
  }
}
