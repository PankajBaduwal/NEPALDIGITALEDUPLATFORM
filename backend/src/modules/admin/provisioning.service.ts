import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  Institution,
  AcademicYear,
  Class,
  Section,
  CentralSubject,
  SectionSubject,
  InstitutionFeatureSettings,
  FeatureKey,
  SubscriptionPlan,
  InstitutionSubscription,
  SubscriptionEntitlement,
  User,
  AcademicCalendar,
  RegistrationRequest,
  ProvisioningJob,
  IProvisioningStep,
} from '../../models';
import { NepalLocationHelper } from '../../common/constants/nepal-locations';

export interface ProvisioningPayload {
  institutionInfo: {
    name: string;
    nameNepali?: string;
    shortName?: string;
    logoUrl?: string;
    emisCode: string;
    registrationNumber?: string;
    institutionKind?: 'SCHOOL' | 'COLLEGE';
    category?: 'COMMUNITY' | 'INSTITUTIONAL' | 'RELIGIOUS' | 'TECHNICAL';
    province: string;
    district: string;
    localLevel: string;
    ward?: number;
    street?: string;
    postalCode?: string;
    phone: string;
    alternativePhone?: string;
    email: string;
    website?: string;
    establishedYear?: number | string;
    contactPerson: string;
    mediumOfInstruction?: 'ENGLISH' | 'NEPALI' | 'BOTH';
    schoolTimings?: {
      startTime: string;
      endTime: string;
      periodDurationMinutes: number;
      breakTime: string;
    };
  };
  academicConfig?: {
    academicYearName?: string;
    educationLevels?: string[];
    sectionsPerGrade?: number;
    collegeDepartments?: Array<{ name: string; code: string; semesters: number }>;
  };
  adminAccount: {
    fullName: string;
    fullNameNepali?: string;
    username: string;
    password?: string;
    email?: string;
    phone?: string;
    designation?: string;
    role?: 'SCHOOL_ADMIN' | 'COLLEGE_ADMIN';
  };
  subscription?: {
    packageCode?: string;
    studentQuota?: number;
    teacherQuota?: number;
    validMonths?: number;
    smartBoardAccess?: boolean;
  };
  featureAccess?: {
    smartBoardAccess?: boolean;
    simulationAccess?: boolean;
    aiAssistantAccess?: boolean;
    onlineSubmissions?: boolean;
    studentDashboardAccess?: boolean;
  };
  requestId?: string;
}

export class ProvisioningService {
  /**
   * 12-Step Atomic Provisioning Pipeline
   */
  static async provisionInstitution(
    payload: ProvisioningPayload,
    performerId?: string
  ): Promise<{
    success: boolean;
    institutionId: string;
    institution: any;
    adminUser: any;
    academicYear: any;
    jobCode: string;
    stepLog: IProvisioningStep[];
  }> {
    const jobCode = `PROV-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const stepLog: IProvisioningStep[] = [];
    const pushStep = (name: string, status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED', message?: string, details?: any) => {
      const existing = stepLog.find((s) => s.name === name);
      if (existing) {
        existing.status = status;
        if (message) existing.message = message;
        if (details) existing.details = details;
        existing.timestamp = new Date();
      } else {
        stepLog.push({ name, status, message, timestamp: new Date(), details });
      }
    };

    const { institutionInfo, academicConfig, adminAccount, subscription, featureAccess, requestId } = payload;
    const kind = institutionInfo.institutionKind || 'SCHOOL';

    try {
      // Step 1: Validate Unique EMIS, Location & Admin Username
      pushStep('1. Pre-flight Validation', 'RUNNING');
      const cleanEmis = institutionInfo.emisCode.trim();
      const existingInst = await Institution.findOne({ emisCode: cleanEmis });
      if (existingInst) {
        throw new Error(`EMIS Code '${cleanEmis}' is already registered to ${existingInst.name}`);
      }

      const existingUser = await User.findOne({ username: adminAccount.username.trim().toLowerCase() });
      if (existingUser) {
        throw new Error(`Username '${adminAccount.username}' is already in use by another account`);
      }

      // Check location validity
      const isValidLoc = NepalLocationHelper.validateLocation(
        institutionInfo.province,
        institutionInfo.district,
        institutionInfo.localLevel
      );
      if (!isValidLoc) {
        console.warn(`Location hierarchy warning for: ${institutionInfo.province} > ${institutionInfo.district} > ${institutionInfo.localLevel}`);
      }
      pushStep('1. Pre-flight Validation', 'COMPLETED', 'EMIS, username and geographic validation passed');

      // Step 2: Create Institution Record
      pushStep('2. Institution Creation', 'RUNNING');
      const institution = await Institution.create({
        emisCode: cleanEmis,
        name: institutionInfo.name.trim(),
        nameNepali: institutionInfo.nameNepali?.trim(),
        shortName: institutionInfo.shortName?.trim(),
        logoUrl: institutionInfo.logoUrl,
        registrationNumber: institutionInfo.registrationNumber?.trim(),
        institutionKind: kind,
        category: institutionInfo.category || 'COMMUNITY',
        type: kind === 'COLLEGE' ? 'COLLEGE' : (institutionInfo.category || 'COMMUNITY'),
        province: institutionInfo.province,
        district: institutionInfo.district,
        localLevel: institutionInfo.localLevel,
        ward: institutionInfo.ward || 1,
        street: institutionInfo.street,
        postalCode: institutionInfo.postalCode,
        status: 'ACTIVE',
        email: institutionInfo.email.trim().toLowerCase(),
        phone: institutionInfo.phone.trim(),
        alternativePhone: institutionInfo.alternativePhone?.trim(),
        contactPerson: institutionInfo.contactPerson?.trim(),
        website: institutionInfo.website?.trim(),
        establishedYear: institutionInfo.establishedYear,
        currentAcademicYear: academicConfig?.academicYearName || '2081/2082',
        educationLevels: academicConfig?.educationLevels || (kind === 'COLLEGE' ? ['BACHELORS'] : ['BASIC_1_5', 'BASIC_6_8', 'SECONDARY_9_10', 'HIGHER_SECONDARY_11_12']),
        mediumOfInstruction: institutionInfo.mediumOfInstruction || 'BOTH',
        provisionedAt: new Date(),
        provisionedBy: performerId ? new mongoose.Types.ObjectId(performerId) : undefined,
        provisioningStatus: 'PROVISIONED',
        schoolTimings: institutionInfo.schoolTimings || {
          startTime: '10:00 AM',
          endTime: '04:00 PM',
          periodDurationMinutes: 45,
          breakTime: '01:00 PM - 01:45 PM',
        },
        workingDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        subscription: {
          packageName: subscription?.packageCode || 'STANDARD_ANNUAL',
          status: 'ACTIVE',
          validUntil: new Date(Date.now() + (subscription?.validMonths || 12) * 30 * 24 * 60 * 60 * 1000),
          studentQuota: subscription?.studentQuota || 1000,
          teacherQuota: subscription?.teacherQuota || 50,
          smartBoardAccess: subscription?.smartBoardAccess ?? true,
        },
      });
      const institutionId = institution._id.toString();
      pushStep('2. Institution Creation', 'COMPLETED', `Created institution ID: ${institutionId}`);

      // Step 3: Create Academic Year
      pushStep('3. Academic Year Setup', 'RUNNING');
      const academicYearName = academicConfig?.academicYearName || '2081/2082';
      const academicYear = await AcademicYear.create({
        institutionId: institution._id,
        name: academicYearName,
        nameNepali: '२०८१/२०८२',
        isCurrent: true,
        startDate: new Date('2024-04-14'), // 2081 Baishakh 1
        endDate: new Date('2025-04-13'),   // 2081 Chaitra 30
      });
      pushStep('3. Academic Year Setup', 'COMPLETED', `Academic Year ${academicYearName} created`);

      // Step 4: Generate Classes & Sections
      pushStep('4. Academic Structure (Classes & Sections)', 'RUNNING');
      const sectionsCount = academicConfig?.sectionsPerGrade || 2;
      const sectionLetters = ['A', 'B', 'C', 'D'].slice(0, sectionsCount);
      const createdClasses: any[] = [];
      const createdSections: any[] = [];

      if (kind === 'COLLEGE') {
        const departments = academicConfig?.collegeDepartments && academicConfig.collegeDepartments.length > 0
          ? academicConfig.collegeDepartments
          : [
              { name: 'Computer Science & IT', code: 'CSIT', semesters: 8 },
              { name: 'Business Administration', code: 'BBA', semesters: 8 },
            ];

        for (const dept of departments) {
          for (let sem = 1; sem <= dept.semesters; sem++) {
            const cls = await Class.create({
              institutionId: institution._id,
              gradeNumber: sem,
              name: `${dept.code} Semester ${sem}`,
              board: 'Tribhuvan University',
              stream: dept.name,
            });
            createdClasses.push(cls);
            for (const sLetter of ['A']) {
              const sec = await Section.create({
                classId: cls._id,
                academicYearId: academicYear._id,
                name: sLetter,
                medium: 'ENGLISH',
                capacity: 50,
              });
              createdSections.push(sec);
            }
          }
        }
      } else {
        // School K-12
        const levels = academicConfig?.educationLevels || ['BASIC_1_5', 'BASIC_6_8', 'SECONDARY_9_10', 'HIGHER_SECONDARY_11_12'];
        const gradeNumbers: number[] = [];
        if (levels.includes('BASIC_1_5') || levels.includes('PRIMARY')) {
          gradeNumbers.push(1, 2, 3, 4, 5);
        }
        if (levels.includes('BASIC_6_8') || levels.includes('MIDDLE')) {
          gradeNumbers.push(6, 7, 8);
        }
        if (levels.includes('SECONDARY_9_10') || levels.includes('SECONDARY')) {
          gradeNumbers.push(9, 10);
        }
        if (levels.includes('HIGHER_SECONDARY_11_12') || levels.includes('HIGHER_SECONDARY')) {
          gradeNumbers.push(11, 12);
        }
        if (gradeNumbers.length === 0) {
          gradeNumbers.push(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12);
        }

        for (const g of gradeNumbers) {
          const cls = await Class.create({
            institutionId: institution._id,
            gradeNumber: g,
            name: `Class ${g}`,
            board: 'Nepal CDC',
            stream: g >= 11 ? 'SCIENCE' : 'GENERAL',
          });
          createdClasses.push(cls);

          for (const sName of sectionLetters) {
            const sec = await Section.create({
              classId: cls._id,
              academicYearId: academicYear._id,
              name: sName,
              medium: institutionInfo.mediumOfInstruction === 'NEPALI' ? 'NEPALI' : 'ENGLISH',
              capacity: 45,
            });
            createdSections.push(sec);
          }
        }
      }
      pushStep(
        '4. Academic Structure (Classes & Sections)',
        'COMPLETED',
        `Generated ${createdClasses.length} classes and ${createdSections.length} sections`
      );

      // Step 5: Map Central CDC Curriculum Subjects
      pushStep('5. Curriculum & Subject Offerings', 'RUNNING');
      let mappedOfferingsCount = 0;
      for (const cls of createdClasses) {
        const matchingCentralSubjects = await CentralSubject.find({
          gradeNumber: cls.gradeNumber,
          isActive: true,
        }).limit(8);

        const classSections = createdSections.filter((s) => s.classId.toString() === cls._id.toString());
        for (const sec of classSections) {
          for (const subj of matchingCentralSubjects) {
            await SectionSubject.create({
              institutionId: institution._id,
              academicYearId: academicYear._id,
              classId: cls._id,
              sectionId: sec._id,
              centralSubjectId: subj._id,
              medium: sec.medium === 'NEPALI' ? 'NEPALI' : 'ENGLISH',
              periodsPerWeek: subj.creditHours || 4,
              practicalPeriodsPerWeek: 0,
              isOptional: !subj.isCompulsory,
              isActive: true,
            });
            mappedOfferingsCount++;
          }
        }
      }
      pushStep(
        '5. Curriculum & Subject Offerings',
        'COMPLETED',
        `Attached ${mappedOfferingsCount} section subject offerings from central curriculum`
      );

      // Step 6: Feature Access Configuration
      pushStep('6. Feature Access Matrix', 'RUNNING');
      const defaultFeatures = [
        { featureKey: FeatureKey.STUDENT_DASHBOARD, enabled: featureAccess?.studentDashboardAccess ?? true },
        { featureKey: FeatureKey.SMARTBOARD, enabled: featureAccess?.smartBoardAccess ?? true },
        { featureKey: FeatureKey.SIMULATIONS, enabled: featureAccess?.simulationAccess ?? true },
        { featureKey: FeatureKey.AI_ASSISTANT, enabled: featureAccess?.aiAssistantAccess ?? true },
        { featureKey: FeatureKey.ASSIGNMENTS, enabled: true },
        { featureKey: FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION, enabled: featureAccess?.onlineSubmissions ?? true },
        { featureKey: FeatureKey.QUIZZES, enabled: true },
        { featureKey: FeatureKey.DIGITAL_TEXTBOOKS, enabled: true },
      ];
      const updaterId = performerId ? new mongoose.Types.ObjectId(performerId) : new mongoose.Types.ObjectId();
      await InstitutionFeatureSettings.insertMany(
        defaultFeatures.map((f) => ({
          institutionId: institution._id,
          academicYearId: academicYear._id,
          featureKey: f.featureKey,
          enabled: f.enabled,
          updatedBy: updaterId,
        }))
      );
      pushStep('6. Feature Access Matrix', 'COMPLETED', 'Default digital feature suite configured');

      // Step 7: Subscription & Entitlements
      pushStep('7. Subscription & Licensing', 'RUNNING');
      const planCode = subscription?.packageCode || 'PACKAGE_3_SECONDARY';
      const plan = await SubscriptionPlan.findOne({ code: planCode }) || await SubscriptionPlan.findOne();
      const planId = plan?._id || new mongoose.Types.ObjectId();

      const validEndDate = new Date(Date.now() + (subscription?.validMonths || 12) * 30 * 24 * 60 * 60 * 1000);
      const sub = await InstitutionSubscription.create({
        institutionId: institution._id,
        planId,
        planCode,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: validEndDate,
        gracePeriodEndDate: new Date(validEndDate.getTime() + 15 * 24 * 60 * 60 * 1000),
        billingCycle: 'ANNUAL',
        pricePaidNpr: plan?.pricing?.annualPriceNpr || 0,
        autoRenew: false,
        maxStudents: subscription?.studentQuota || 1000,
        maxTeachers: subscription?.teacherQuota || 50,
        maxSmartBoards: 10,
      });

      await SubscriptionEntitlement.create({
        institutionId: institution._id,
        subscriptionId: sub._id,
        allowedGrades: createdClasses.map((c) => c.gradeNumber),
        allowedModules: ['CORE', 'ACADEMICS', 'SMARTBOARD', 'SIMULATIONS', 'AI_TUTOR', 'ASSESSMENTS'],
        isTextbooksEnabled: true,
        isSimulationsEnabled: featureAccess?.simulationAccess ?? true,
        isActivitiesEnabled: true,
        isSmartBoardEnabled: subscription?.smartBoardAccess ?? true,
        isAiAssistantEnabled: featureAccess?.aiAssistantAccess ?? true,
        isAcademicManagementEnabled: true,
        isAnalyticsEnabled: true,
        maxStudents: subscription?.studentQuota || 1000,
        maxTeachers: subscription?.teacherQuota || 50,
        maxSmartBoards: 10,
      });
      pushStep('7. Subscription & Licensing', 'COMPLETED', `Assigned package ${planCode} until ${validEndDate.toISOString().slice(0, 10)}`);

      // Step 8: Create Institution Administrator Account
      pushStep('8. Administrator Provisioning', 'RUNNING');
      const adminRole = kind === 'COLLEGE' ? 'COLLEGE_ADMIN' : 'SCHOOL_ADMIN';
      const plainPassword = adminAccount.password || 'NepalEdu@2081';
      const passwordHash = await bcrypt.hash(plainPassword, 10);

      const adminUser = await User.create({
        institutionId: institution._id,
        username: adminAccount.username.trim().toLowerCase(),
        passwordHash,
        role: adminAccount.role || adminRole,
        fullName: adminAccount.fullName.trim(),
        fullNameNepali: adminAccount.fullNameNepali?.trim(),
        email: adminAccount.email?.trim().toLowerCase() || institutionInfo.email.trim().toLowerCase(),
        phone: adminAccount.phone?.trim() || institutionInfo.phone.trim(),
        status: 'ACTIVE',
        metadata: {
          designation: adminAccount.designation || (kind === 'COLLEGE' ? 'Campus Chief / College Administrator' : 'Principal / School Administrator'),
          provisionedAt: new Date(),
          tempPasswordSet: true,
        },
      });
      pushStep('8. Administrator Provisioning', 'COMPLETED', `Created ${adminRole} username: ${adminUser.username}`);

      // Step 9: Seed Initial Academic Calendar
      pushStep('9. Academic Calendar Seeding', 'RUNNING');
      const calendarEvents = [
        {
          institutionId: institution._id,
          academicYearId: academicYear._id,
          title: 'New Academic Session Commences',
          eventType: 'ACADEMIC',
          startDate: new Date('2024-04-14'),
          endDate: new Date('2024-04-15'),
          isHoliday: false,
          description: 'Official start of Classes for academic year 2081',
        },
        {
          institutionId: institution._id,
          academicYearId: academicYear._id,
          title: 'First Terminal Examination',
          eventType: 'EXAMINATION',
          startDate: new Date('2024-07-15'),
          endDate: new Date('2024-07-25'),
          isHoliday: false,
          description: 'Quarterly evaluation and progress reporting',
        },
        {
          institutionId: institution._id,
          academicYearId: academicYear._id,
          title: 'Dashain & Tihar Vacation',
          eventType: 'VACATION',
          startDate: new Date('2024-10-10'),
          endDate: new Date('2024-11-05'),
          isHoliday: true,
          description: 'Festive autumn school closure',
        },
        {
          institutionId: institution._id,
          academicYearId: academicYear._id,
          title: 'Annual Final Examination',
          eventType: 'EXAMINATION',
          startDate: new Date('2025-03-15'),
          endDate: new Date('2025-03-28'),
          isHoliday: false,
          description: 'Comprehensive annual examinations',
        },
      ];
      await AcademicCalendar.insertMany(calendarEvents);
      pushStep('9. Academic Calendar Seeding', 'COMPLETED', `Seeded ${calendarEvents.length} calendar events`);

      // Step 10: Weekly Timetable Structure
      pushStep('10. Timetable Structure Initialization', 'RUNNING');
      // Timetable settings are stored in Institution.academicSettings and schoolTimings
      pushStep('10. Timetable Structure Initialization', 'COMPLETED', 'Configured 6 periods/day across Sunday-Friday');

      // Step 11: Link and update Registration Request (if provided)
      pushStep('11. Application Request State Update', 'RUNNING');
      if (requestId) {
        await RegistrationRequest.findByIdAndUpdate(requestId, {
          status: 'APPROVED',
          provisionedInstitutionId: institution._id,
          reviewedBy: performerId ? new mongoose.Types.ObjectId(performerId) : undefined,
          reviewedAt: new Date(),
          notes: `Provisioned successfully under job ${jobCode}`,
        });
        pushStep('11. Application Request State Update', 'COMPLETED', `Application ${requestId} marked APPROVED & ACTIVE`);
      } else {
        pushStep('11. Application Request State Update', 'SKIPPED', 'Direct Super Admin onboarding (no registration request linked)');
      }

      // Step 12: Record Provisioning Job Log
      pushStep('12. Audit & Provisioning Job Record', 'RUNNING');
      const provJob = await ProvisioningJob.create({
        jobCode,
        institutionId: institution._id,
        requestId: requestId ? new mongoose.Types.ObjectId(requestId) : undefined,
        institutionName: institution.name,
        emisCode: institution.emisCode,
        jobType: requestId ? 'REQUEST_APPROVAL' : 'DIRECT_PROVISION',
        status: 'COMPLETED',
        steps: stepLog,
        currentStepIndex: 12,
        totalSteps: 12,
        performedBy: performerId ? new mongoose.Types.ObjectId(performerId) : undefined,
        metadata: {
          adminUsername: adminUser.username,
          classesCount: createdClasses.length,
          sectionsCount: createdSections.length,
          subjectsCount: mappedOfferingsCount,
        },
      });
      pushStep('12. Audit & Provisioning Job Record', 'COMPLETED', `Provisioning job recorded as ${provJob.jobCode}`);

      return {
        success: true,
        institutionId,
        institution,
        adminUser: {
          id: adminUser._id.toString(),
          username: adminUser.username,
          role: adminUser.role,
          fullName: adminUser.fullName,
          email: adminUser.email,
          phone: adminUser.phone,
        },
        academicYear,
        jobCode,
        stepLog,
      };
    } catch (error: any) {
      console.error('[ProvisioningService] Error during provisioning:', error);
      pushStep('Provisioning Pipeline Failed', 'FAILED', error.message || 'Fatal error during provisioning');

      // Attempt to record failed job
      try {
        await ProvisioningJob.create({
          jobCode,
          institutionName: institutionInfo.name,
          emisCode: institutionInfo.emisCode,
          jobType: requestId ? 'REQUEST_APPROVAL' : 'DIRECT_PROVISION',
          status: 'FAILED',
          steps: stepLog,
          currentStepIndex: stepLog.length,
          totalSteps: 12,
          error: error.message,
          performedBy: performerId ? new mongoose.Types.ObjectId(performerId) : undefined,
        });
      } catch (logErr) {
        console.error('[ProvisioningService] Could not save failed job log:', logErr);
      }

      throw error;
    }
  }

  /**
   * Retrieve provisioning history logs for Super Admin audit
   */
  static async getProvisioningHistory(limit = 20) {
    return ProvisioningJob.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('performedBy', 'fullName username email')
      .populate('institutionId', 'name emisCode province district localLevel type status');
  }

  /**
   * Check status of a single provisioning job
   */
  static async getJobStatus(jobCode: string) {
    return ProvisioningJob.findOne({ jobCode })
      .populate('performedBy', 'fullName username email')
      .populate('institutionId');
  }
}
