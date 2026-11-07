import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { RegistrationRequest, Institution } from '../../models';
import { ProvisioningService, ProvisioningPayload } from './provisioning.service';
import { NepalLocationHelper } from '../../common/constants/nepal-locations';
import { saveLogoDataUrl } from '../../common/utils/logo.util';

export class RegistrationService {
  /**
   * Public Self-Registration submission
   */
  static async submitPublicRegistration(payload: {
    institutionName: string;
    nameNepali?: string;
    shortName?: string;
    logoDataUrl?: string;
    emisCode: string;
    registrationNumber?: string;
    institutionKind?: 'SCHOOL' | 'COLLEGE';
    institutionType?: 'COMMUNITY' | 'INSTITUTIONAL' | 'RELIGIOUS' | 'TECHNICAL';
    province: string;
    district: string;
    localLevel: string;
    ward?: number;
    street?: string;
    contactPerson: string;
    designation?: string;
    email: string;
    phone: string;
    alternativePhone?: string;
    requestedPackages?: string[];
    estimatedStudents?: number;
    academicYear?: string;
    educationLevels?: string[];
    mediumOfInstruction?: 'ENGLISH' | 'NEPALI' | 'BOTH';
    adminFullName?: string;
    adminUsername?: string;
    adminPassword?: string;
    adminEmail?: string;
    adminPhone?: string;
    notes?: string;
  }) {
    const cleanEmis = payload.emisCode.trim();

    // Check if EMIS is already provisioned
    const existingInst = await Institution.findOne({ emisCode: cleanEmis });
    if (existingInst) {
      throw {
        status: 409,
        message: `EMIS Code '${cleanEmis}' is already registered to active institution '${existingInst.name}'.`,
        code: 'EMIS_ALREADY_EXISTS',
      };
    }

    // Check if duplicate pending application exists
    const existingReq = await RegistrationRequest.findOne({
      emisCode: cleanEmis,
      status: { $in: ['SUBMITTED', 'PENDING', 'UNDER_VERIFICATION', 'MORE_INFO_REQUIRED'] },
    });
    if (existingReq) {
      throw {
        status: 409,
        message: `An active registration application (${existingReq.requestCode}) is already under review for EMIS '${cleanEmis}'.`,
        code: 'REQUEST_ALREADY_EXISTS',
        requestCode: existingReq.requestCode,
      };
    }

    // Generate Application Reference: e.g. REG-2081-XXXX or REG-2083-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const requestCode = `REG-2081-${randomSuffix}`;

    let passwordHash: string | undefined;
    if (payload.adminPassword) {
      passwordHash = await bcrypt.hash(payload.adminPassword, 10);
    }

    const logoUrl = payload.logoDataUrl ? saveLogoDataUrl(payload.logoDataUrl, `reg-${requestCode}`) : undefined;

    const regRequest = await RegistrationRequest.create({
      requestCode,
      logoUrl,
      institutionName: payload.institutionName.trim(),
      nameNepali: payload.nameNepali?.trim(),
      shortName: payload.shortName?.trim(),
      emisCode: cleanEmis,
      registrationNumber: payload.registrationNumber?.trim(),
      institutionKind: payload.institutionKind || 'SCHOOL',
      institutionType: payload.institutionType || 'COMMUNITY',
      province: payload.province,
      district: payload.district,
      localLevel: payload.localLevel,
      ward: payload.ward || 1,
      street: payload.street,
      contactPerson: payload.contactPerson.trim(),
      designation: payload.designation || 'Principal / Administrator',
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      alternativePhone: payload.alternativePhone?.trim(),
      requestedPackages: payload.requestedPackages || ['PACKAGE_1_FOUNDATION', 'PACKAGE_2_MIDDLE', 'PACKAGE_3_SECONDARY'],
      estimatedStudents: payload.estimatedStudents || 300,
      academicYear: payload.academicYear || '2081/2082',
      educationLevels: payload.educationLevels || ['BASIC_1_5', 'BASIC_6_8', 'SECONDARY_9_10', 'HIGHER_SECONDARY_11_12'],
      mediumOfInstruction: payload.mediumOfInstruction || 'BOTH',
      adminDetails: {
        fullName: payload.adminFullName || payload.contactPerson,
        email: payload.adminEmail || payload.email,
        phone: payload.adminPhone || payload.phone,
        username: payload.adminUsername || `admin_${cleanEmis}`,
        designation: payload.designation || 'Principal',
        passwordHash,
      },
      status: 'SUBMITTED',
      notes: payload.notes,
    });

    return {
      success: true,
      requestCode: regRequest.requestCode,
      status: regRequest.status,
      institutionName: regRequest.institutionName,
      emisCode: regRequest.emisCode,
      message: 'Registration request successfully submitted for Super Admin review.',
      submissionDate: regRequest.createdAt,
    };
  }

  /**
   * Public tracking by tracking code or EMIS code
   */
  static async getPublicStatus(code: string) {
    const cleanCode = code.trim();
    const req = await RegistrationRequest.findOne({
      $or: [{ requestCode: new RegExp(`^${cleanCode}$`, 'i') }, { emisCode: cleanCode }],
    }).select('-adminDetails.passwordHash');

    if (!req) {
      throw { status: 404, message: `Application with tracking code or EMIS '${cleanCode}' not found`, code: 'NOT_FOUND' };
    }

    return {
      requestCode: req.requestCode,
      institutionName: req.institutionName,
      nameNepali: req.nameNepali,
      emisCode: req.emisCode,
      institutionKind: req.institutionKind,
      institutionType: req.institutionType,
      province: req.province,
      district: req.district,
      localLevel: req.localLevel,
      status: req.status,
      rejectionReason: req.rejectionReason,
      moreInfoNotes: req.moreInfoNotes,
      submittedAt: req.createdAt,
      updatedAt: req.updatedAt,
      isProvisioned: !!req.provisionedInstitutionId,
    };
  }

  /**
   * Super Admin: List all registration requests with filters
   */
  static async listRequests(query: {
    status?: string;
    province?: string;
    institutionType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const filter: any = {};
    if (query.status && query.status !== 'ALL') {
      filter.status = query.status;
    }
    if (query.province && query.province !== 'ALL') {
      filter.province = query.province;
    }
    if (query.institutionType && query.institutionType !== 'ALL') {
      filter.institutionType = query.institutionType;
    }
    if (query.search) {
      // escape regex characters so a typed "(" or "*" cannot break the query
      const s = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { institutionName: new RegExp(s, 'i') },
        { emisCode: new RegExp(s, 'i') },
        { requestCode: new RegExp(s, 'i') },
        { contactPerson: new RegExp(s, 'i') },
        { email: new RegExp(s, 'i') },
      ];
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const [total, requests] = await Promise.all([
      RegistrationRequest.countDocuments(filter),
      RegistrationRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reviewedBy', 'fullName username email')
        .populate('provisionedInstitutionId', 'name emisCode status'),
    ]);

    const duplicates = await this.findPossibleDuplicates(requests);
    return {
      requests: requests.map((r: any) => Object.assign(r.toJSON(), { possibleDuplicates: duplicates.get(String(r._id)) || [] })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Flags requests that look like the same school submitted twice (or one that already exists):
   * same normalised name in the same district, or the same phone number or email.
   */
  private static async findPossibleDuplicates(listed: any[]) {
    const norm = (v: any) => String(v || '').toLowerCase().replace(/[^a-z0-9\u0900-\u097f ]/g, ' ').replace(/\b(school|secondary|higher|basic|primary|vidyalaya|college|campus|the)\b/g, ' ').replace(/\s+/g, ' ').trim();
    const digits = (v: any) => String(v || '').replace(/\D/g, '').slice(-9);
    const [allReqs, insts]: [any[], any[]] = await Promise.all([
      RegistrationRequest.find({}, 'requestCode institutionName district phone email emisCode status').lean() as any,
      Institution.find({}, 'name district emisCode phone email').lean() as any,
    ]);
    const result = new Map<string, Array<{ kind: 'REQUEST' | 'INSTITUTION'; ref: string; name: string; emisCode?: string; status?: string; why: string }>>();
    for (const r of listed) {
      const mine = { name: norm(r.institutionName), district: norm(r.district), phone: digits(r.phone), email: String(r.email || '').toLowerCase() };
      const hits: any[] = [];
      const why = (name: string, district: string, phone: string, email: string) => {
        const reasons: string[] = [];
        if (mine.name && name === mine.name && district === mine.district) reasons.push('same name and district');
        if (mine.phone && phone && phone === mine.phone) reasons.push('same phone number');
        if (mine.email && email && email === mine.email) reasons.push('same email');
        return reasons.join(', ');
      };
      for (const o of allReqs) {
        if (String(o._id) === String(r._id)) continue;
        const w = why(norm(o.institutionName), norm(o.district), digits(o.phone), String(o.email || '').toLowerCase());
        if (w) hits.push({ kind: 'REQUEST', ref: o.requestCode, name: o.institutionName, emisCode: o.emisCode, status: o.status, why: w });
      }
      for (const i of insts) {
        if (String(i.emisCode) === String(r.emisCode)) continue;
        const w = why(norm(i.name), norm(i.district), digits(i.phone), String(i.email || '').toLowerCase());
        if (w) hits.push({ kind: 'INSTITUTION', ref: i.emisCode, name: i.name, emisCode: i.emisCode, status: 'EXISTING', why: w });
      }
      if (hits.length) result.set(String(r._id), hits.slice(0, 5));
    }
    return result;
  }

  /**
   * Super Admin: Get single request details
   */
  static async getRequestById(id: string) {
    const req = await RegistrationRequest.findById(id)
      .populate('reviewedBy', 'fullName username email')
      .populate('provisionedInstitutionId');

    if (!req) {
      throw { status: 404, message: 'Registration request not found', code: 'NOT_FOUND' };
    }

    // Check duplicate warnings
    const duplicates = await Institution.find({
      $or: [{ emisCode: req.emisCode }, { email: req.email }],
    });

    return {
      request: req,
      duplicateWarnings: duplicates.map((d) => ({
        id: d._id,
        name: d.name,
        emisCode: d.emisCode,
        status: d.status,
      })),
    };
  }

  /**
   * Super Admin: Update/Edit registration request data
   */
  static async updateRequest(id: string, updates: any, reviewerId?: string) {
    const req = await RegistrationRequest.findById(id);
    if (!req) {
      throw { status: 404, message: 'Registration request not found', code: 'NOT_FOUND' };
    }

    if (updates.institutionName) req.institutionName = updates.institutionName.trim();
    if (updates.nameNepali !== undefined) req.nameNepali = updates.nameNepali?.trim();
    if (updates.shortName !== undefined) req.shortName = updates.shortName?.trim();
    if (updates.emisCode) req.emisCode = updates.emisCode.trim();
    if (updates.registrationNumber !== undefined) req.registrationNumber = updates.registrationNumber?.trim();
    if (updates.institutionKind) req.institutionKind = updates.institutionKind;
    if (updates.institutionType) req.institutionType = updates.institutionType;
    if (updates.province) req.province = updates.province;
    if (updates.district) req.district = updates.district;
    if (updates.localLevel) req.localLevel = updates.localLevel;
    if (updates.ward !== undefined) req.ward = Number(updates.ward);
    if (updates.street !== undefined) req.street = updates.street;
    if (updates.contactPerson) req.contactPerson = updates.contactPerson.trim();
    if (updates.designation !== undefined) req.designation = updates.designation;
    if (updates.email) req.email = updates.email.trim();
    if (updates.phone) req.phone = updates.phone.trim();
    if (updates.alternativePhone !== undefined) req.alternativePhone = updates.alternativePhone;
    if (updates.requestedPackages) req.requestedPackages = updates.requestedPackages;
    if (updates.estimatedStudents !== undefined) req.estimatedStudents = Number(updates.estimatedStudents);
    if (updates.academicYear) req.academicYear = updates.academicYear;
    if (updates.mediumOfInstruction) req.mediumOfInstruction = updates.mediumOfInstruction;
    if (updates.notes !== undefined) req.notes = updates.notes;
    if (updates.logoDataUrl) req.logoUrl = saveLogoDataUrl(updates.logoDataUrl, `reg-${req.requestCode}`);

    if (updates.adminDetails || updates.adminFullName || updates.adminUsername || updates.adminEmail || updates.adminPhone) {
      req.adminDetails = {
        fullName: updates.adminFullName || updates.adminDetails?.fullName || req.adminDetails?.fullName || req.contactPerson,
        username: updates.adminUsername || updates.adminDetails?.username || req.adminDetails?.username || `admin_${req.emisCode}`,
        email: updates.adminEmail || updates.adminDetails?.email || req.adminDetails?.email || req.email,
        phone: updates.adminPhone || updates.adminDetails?.phone || req.adminDetails?.phone || req.phone,
        passwordHash: req.adminDetails?.passwordHash,
      };
    }

    if (reviewerId) req.reviewedBy = new mongoose.Types.ObjectId(reviewerId);
    req.reviewedAt = new Date();
    await req.save();

    return req;
  }

  /**
   * Super Admin: Request more information from institution
   */
  static async requestMoreInfo(id: string, notes: string, reviewerId?: string) {
    const req = await RegistrationRequest.findById(id);
    if (!req) {
      throw { status: 404, message: 'Registration request not found', code: 'NOT_FOUND' };
    }

    req.status = 'MORE_INFO_REQUIRED';
    req.moreInfoNotes = notes;
    if (reviewerId) req.reviewedBy = new mongoose.Types.ObjectId(reviewerId);
    req.reviewedAt = new Date();
    await req.save();

    return req;
  }

  /**
   * Super Admin: Reject registration request
   */
  static async rejectRequest(id: string, reason: string, reviewerId?: string) {
    const req = await RegistrationRequest.findById(id);
    if (!req) {
      throw { status: 404, message: 'Registration request not found', code: 'NOT_FOUND' };
    }

    req.status = 'REJECTED';
    req.rejectionReason = reason;
    if (reviewerId) req.reviewedBy = new mongoose.Types.ObjectId(reviewerId);
    req.reviewedAt = new Date();
    await req.save();

    return req;
  }

  /**
   * Super Admin: Approve request and execute 12-step provisioning
   */
  static async approveAndProvision(
    id: string,
    overrides?: {
      packageCode?: string;
      studentQuota?: number;
      teacherQuota?: number;
      adminUsername?: string;
      adminPassword?: string;
      educationLevels?: string[];
      sectionsPerGrade?: number;
    },
    reviewerId?: string
  ) {
    const req = await RegistrationRequest.findById(id);
    if (!req) {
      throw { status: 404, message: 'Registration request not found', code: 'NOT_FOUND' };
    }

    if (req.status === 'APPROVED' && req.provisionedInstitutionId) {
      throw {
        status: 400,
        message: 'This registration request has already been approved and provisioned.',
        code: 'ALREADY_PROVISIONED',
      };
    }

    req.status = 'PROVISIONING';
    await req.save();

    const provisioningPayload: ProvisioningPayload = {
      institutionInfo: {
        name: req.institutionName,
        nameNepali: req.nameNepali,
        shortName: req.shortName,
        logoUrl: req.logoUrl,
        emisCode: req.emisCode,
        registrationNumber: req.registrationNumber,
        institutionKind: req.institutionKind || 'SCHOOL',
        category: req.institutionType || 'COMMUNITY',
        province: req.province,
        district: req.district,
        localLevel: req.localLevel,
        ward: req.ward || 1,
        street: req.street,
        phone: req.phone,
        alternativePhone: req.alternativePhone,
        email: req.email,
        contactPerson: req.contactPerson,
        mediumOfInstruction: req.mediumOfInstruction || 'BOTH',
      },
      academicConfig: {
        academicYearName: req.academicYear || '2081/2082',
        educationLevels: overrides?.educationLevels || req.educationLevels || ['BASIC_1_5', 'BASIC_6_8', 'SECONDARY_9_10', 'HIGHER_SECONDARY_11_12'],
        sectionsPerGrade: overrides?.sectionsPerGrade || 2,
      },
      adminAccount: {
        fullName: req.adminDetails?.fullName || req.contactPerson,
        username: overrides?.adminUsername || req.adminDetails?.username || `admin_${req.emisCode}`,
        password: overrides?.adminPassword || 'NepalEdu@2081',
        email: req.adminDetails?.email || req.email,
        phone: req.adminDetails?.phone || req.phone,
        role: req.institutionKind === 'COLLEGE' ? 'COLLEGE_ADMIN' : 'SCHOOL_ADMIN',
      },
      subscription: {
        packageCode: overrides?.packageCode || 'PACKAGE_3_SECONDARY',
        studentQuota: overrides?.studentQuota || req.estimatedStudents || 500,
        teacherQuota: overrides?.teacherQuota || 50,
      },
      requestId: req._id.toString(),
    };

    const result = await ProvisioningService.provisionInstitution(provisioningPayload, reviewerId);
    return result;
  }
}

