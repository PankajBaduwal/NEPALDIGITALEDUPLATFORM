import mongoose from 'mongoose';
import {
  FeatureKey,
  FEATURE_DEFINITIONS,
  InstitutionFeatureSettings,
  ClassFeatureSettings,
  SectionFeatureSettings,
  StudentFeatureOverride,
  StudentDeviceProfile,
  FeatureConfigurationHistory,
  DeviceAccessType,
} from '../../models/FeatureAccess';
import { Class, Section, StudentEnrollment, User } from '../../models';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

export interface ResolveFeatureContext {
  institutionId: string;
  academicYearId?: string;
  classId?: string;
  sectionId?: string;
  studentId?: string;
  featureKey: FeatureKey;
}

export interface FeatureResolutionResult {
  featureKey: FeatureKey;
  isAllowed: boolean;
  effectiveEnabled: boolean;
  source: 'PLATFORM_SUBSCRIPTION_LIMITATION' | 'STUDENT_OVERRIDE' | 'SECTION_OVERRIDE' | 'CLASS_OVERRIDE' | 'INSTITUTION_DEFAULT' | 'PLATFORM_DEFAULT';
  inherited: boolean;
  reason?: string;
  classId?: string;
  sectionId?: string;
  studentId?: string;
  metadata?: any;
}

export class FeatureAccessService {
  /**
   * ─────────────────────────────────────────────────────────────────────────────
   * 1. PRECEDENCE RESOLUTION ENGINE
   * ─────────────────────────────────────────────────────────────────────────────
   * Rule:
   * 1. Platform Subscription Limits (Absolute Upper Ceiling)
   * 2. Individual Student Override
   * 3. Section Override
   * 4. Class Override
   * 5. Institution Default
   * 6. Platform Default
   */
  static async resolveFeatureAccess(ctx: ResolveFeatureContext): Promise<FeatureResolutionResult> {
    const { institutionId, featureKey, studentId } = ctx;
    let { classId, sectionId } = ctx;

    // Resolve enrollment, classId, and sectionId from studentId if needed
    let enrollmentDoc: any = null;
    if (studentId && mongoose.isValidObjectId(studentId)) {
      const studentBelongsToInstitution = await User.exists({
        _id: studentId,
        institutionId,
        role: 'STUDENT',
        status: 'ACTIVE',
      });
      const enrollments = studentBelongsToInstitution
        ? await StudentEnrollment.find({ studentId, status: 'ENROLLED' })
        .populate({ path: 'sectionId', populate: { path: 'classId' } })
        .populate('academicYearId')
        .sort({ createdAt: -1 })
        .lean()
        : [];
      const institutionEnrollments = enrollments.filter((entry: any) => {
        const academicYear = entry.academicYearId as any;
        const section = entry.sectionId as any;
        const cls = section?.classId as any;
        return (
          academicYear?.institutionId?.toString() === institutionId &&
          cls?.institutionId?.toString() === institutionId
        );
      });
      enrollmentDoc =
        institutionEnrollments.find((entry: any) => (entry.academicYearId as any)?.isCurrent) ||
        institutionEnrollments[0] ||
        null;

      if (enrollmentDoc && enrollmentDoc.sectionId) {
        if (!sectionId) {
          sectionId = (enrollmentDoc.sectionId as any)._id?.toString() || (enrollmentDoc.sectionId as any).id?.toString();
        }
        if (!classId) {
          const sectionClass = (enrollmentDoc.sectionId as any).classId;
          classId = sectionClass?._id?.toString() || sectionClass?.toString();
        }
      }
    } else if (!classId && sectionId) {
      const sec = await Section.findById(sectionId).populate('classId').lean();
      const sectionClass = (sec as any)?.classId;
      if (!sectionClass || sectionClass.institutionId?.toString() !== institutionId) {
        return {
          featureKey,
          isAllowed: false,
          effectiveEnabled: false,
          source: 'PLATFORM_DEFAULT',
          inherited: true,
          reason: 'Section does not belong to this institution.',
          sectionId,
          studentId,
        };
      }
      classId = sectionClass._id.toString();
    }

    if (sectionId && classId) {
      const section = await Section.findById(sectionId).populate('classId').lean();
      const sectionClass = (section as any)?.classId;
      if (
        !sectionClass ||
        sectionClass.institutionId?.toString() !== institutionId ||
        sectionClass._id.toString() !== classId
      ) {
        return {
          featureKey,
          isAllowed: false,
          effectiveEnabled: false,
          source: 'PLATFORM_DEFAULT',
          inherited: true,
          reason: 'Section does not belong to the requested class and institution.',
          classId,
          sectionId,
          studentId,
        };
      }
    }

    // Determine target grade number if class is known
    let gradeNumber: number | null = null;
    if (classId) {
      const cls = await Class.findOne({ _id: classId, institutionId }).select('gradeNumber').lean();
      if (cls) {
        gradeNumber = cls.gradeNumber;
      } else {
        return {
          featureKey,
          isAllowed: false,
          effectiveEnabled: false,
          source: 'PLATFORM_DEFAULT',
          inherited: true,
          reason: 'Class does not belong to this institution.',
          classId,
          sectionId,
          studentId,
        };
      }
    }

    // ── STEP 1: Upper Bound Subscription Entitlement Check ─────────────────
    try {
      const entitlements = await SubscriptionsService.getInstitutionEntitlements(institutionId);
      const allowedGrades: number[] = entitlements.allowedGrades || (entitlements as any).grades?.allowedGrades || [];

      // A) Check Grade Entitlement
      if (gradeNumber !== null && allowedGrades.length > 0) {
        if (!allowedGrades.includes(gradeNumber)) {
          return {
            featureKey,
            isAllowed: false,
            effectiveEnabled: false,
            source: 'PLATFORM_SUBSCRIPTION_LIMITATION',
            inherited: true,
            reason: `Grade ${gradeNumber} is not included in the institution's active subscription package tier (Allowed: ${allowedGrades.join(', ')}).`,
            classId,
            sectionId,
            studentId,
          };
        }
      }

      // B) Check Feature Category Entitlement
      if (featureKey.startsWith('AI_') || featureKey === FeatureKey.AI_ASSISTANT) {
        if (entitlements.isAiAssistantEnabled === false || (entitlements as any).features?.aiLearningAssistant === false) {
          return {
            featureKey,
            isAllowed: false,
            effectiveEnabled: false,
            source: 'PLATFORM_SUBSCRIPTION_LIMITATION',
            inherited: true,
            reason: 'Nepal Curriculum AI Assistant is not included in your school subscription package.',
            classId,
            sectionId,
            studentId,
          };
        }
      } else if (featureKey.startsWith('SIMULATIONS_') || featureKey === FeatureKey.SIMULATIONS) {
        if (entitlements.hasSimulations === false || (entitlements as any).features?.simulations === false) {
          return {
            featureKey,
            isAllowed: false,
            effectiveEnabled: false,
            source: 'PLATFORM_SUBSCRIPTION_LIMITATION',
            inherited: true,
            reason: 'Interactive Simulations are not enabled for this institution subscription.',
            classId,
            sectionId,
            studentId,
          };
        }
      } else if (featureKey.startsWith('SMARTBOARD_') || featureKey === FeatureKey.SMARTBOARD) {
        if (entitlements.hasSmartBoard === false || (entitlements as any).features?.smartBoardHub === false) {
          return {
            featureKey,
            isAllowed: false,
            effectiveEnabled: false,
            source: 'PLATFORM_SUBSCRIPTION_LIMITATION',
            inherited: true,
            reason: 'Smart Board Hub is not enabled for this institution subscription.',
            classId,
            sectionId,
            studentId,
          };
        }
      }
    } catch (subErr) {
      // In case of standalone testing without populated subscriptions, continue resolution
      console.warn('[FeatureAccessService] Subscription check notice:', subErr);
    }

    // ── STEP 2: Individual Student Override ────────────────────────────────
    if (studentId) {
      const studentIdsToCheck = [studentId];
      if (enrollmentDoc?._id) {
        studentIdsToCheck.push(enrollmentDoc._id.toString());
      }
      if (enrollmentDoc?.studentId) {
        studentIdsToCheck.push(enrollmentDoc.studentId.toString());
      }

      const studentOverride = await StudentFeatureOverride.findOne({
        institutionId,
        studentId: { $in: studentIdsToCheck },
        featureKey,
      }).lean();

      if (studentOverride) {
        return {
          featureKey,
          isAllowed: studentOverride.enabled,
          effectiveEnabled: studentOverride.enabled,
          source: 'STUDENT_OVERRIDE',
          inherited: false,
          reason: studentOverride.reason || 'Individual student exception configured',
          classId,
          sectionId,
          studentId,
        };
      }
    }

    // ── STEP 3: Section Override ───────────────────────────────────────────
    if (sectionId) {
      const sectionSetting = await SectionFeatureSettings.findOne({
        institutionId,
        sectionId,
        featureKey,
      }).lean();

      if (sectionSetting) {
        return {
          featureKey,
          isAllowed: sectionSetting.enabled,
          effectiveEnabled: sectionSetting.enabled,
          source: 'SECTION_OVERRIDE',
          inherited: false,
          classId,
          sectionId,
          studentId,
          metadata: sectionSetting.configOptions,
        };
      }
    }

    // ── STEP 4: Class Override ─────────────────────────────────────────────
    if (classId) {
      const classSetting = await ClassFeatureSettings.findOne({
        institutionId,
        classId,
        featureKey,
      }).lean();

      if (classSetting) {
        return {
          featureKey,
          isAllowed: classSetting.enabled,
          effectiveEnabled: classSetting.enabled,
          source: 'CLASS_OVERRIDE',
          inherited: Boolean(sectionId || studentId),
          classId,
          sectionId,
          studentId,
          metadata: classSetting.configOptions,
        };
      }
    }

    // ── STEP 5: Institution Default ────────────────────────────────────────
    const instSetting = await InstitutionFeatureSettings.findOne({
      institutionId,
      featureKey,
    }).lean();

    if (instSetting) {
      return {
        featureKey,
        isAllowed: instSetting.enabled,
        effectiveEnabled: instSetting.enabled,
        source: 'INSTITUTION_DEFAULT',
        inherited: Boolean(classId || sectionId || studentId),
        classId,
        sectionId,
        studentId,
        metadata: instSetting.configOptions,
      };
    }

    // ── STEP 6: Platform Registry Default ──────────────────────────────────
    const def = FEATURE_DEFINITIONS[featureKey];
    const defaultEnabled = def ? def.defaultEnabled : true;

    return {
      featureKey,
      isAllowed: defaultEnabled,
      effectiveEnabled: defaultEnabled,
      source: 'PLATFORM_DEFAULT',
      inherited: true,
      classId,
      sectionId,
      studentId,
    };
  }

  /**
   * Convenience check if feature is allowed for student or context.
   */
  static async isFeatureAllowed(
    studentId: string,
    featureKey: FeatureKey,
    institutionId: string
  ): Promise<boolean> {
    const res = await this.resolveFeatureAccess({
      institutionId,
      featureKey,
      studentId,
    });
    return res.effectiveEnabled;
  }

  /**
   * ─────────────────────────────────────────────────────────────────────────────
   * 2. FULL 12-CLASS CONFIGURATION MATRIX
   * ─────────────────────────────────────────────────────────────────────────────
   * Returns complete class-by-class matrix for Classes 1–12 with inheritance tags.
   */
  static async getClassFeatureMatrix(institutionId: string, academicYearId?: string) {
    // 1. Fetch or synthesize Classes 1–12
    const existingClasses = await Class.find({ institutionId }).sort({ gradeNumber: 1 }).lean();

    // 2. Fetch institution subscription package to check grade upper limit
    let allowedGrades: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let subscriptionFeatures: any = {};
    try {
      const entitlements = await SubscriptionsService.getInstitutionEntitlements(institutionId);
      if (entitlements?.allowedGrades?.length) {
        allowedGrades = entitlements.allowedGrades;
      } else if ((entitlements as any)?.grades?.allowedGrades?.length) {
        allowedGrades = (entitlements as any).grades.allowedGrades;
      }
      subscriptionFeatures = {
        aiLearningAssistant: entitlements.isAiAssistantEnabled,
        simulations: entitlements.hasSimulations,
        smartBoardHub: entitlements.hasSmartBoard,
      };
    } catch (e) {
      // default open in dev/tests
    }

    // 3. Fetch all institution-level settings
    const instSettings = await InstitutionFeatureSettings.find({ institutionId }).lean();
    const instMap = new Map<string, boolean>();
    instSettings.forEach((s) => instMap.set(s.featureKey, s.enabled));

    // 4. Fetch all class-level overrides
    const classSettings = await ClassFeatureSettings.find({ institutionId }).lean();
    const classMap = new Map<string, boolean>(); // key: `${classId}_${featureKey}`
    classSettings.forEach((s) => classMap.set(`${s.classId.toString()}_${s.featureKey}`, s.enabled));

    // 5. Fetch section counts per class
    const sectionCounts = await Section.aggregate([
      { $match: { institutionId: new mongoose.Types.ObjectId(institutionId) } },
      { $group: { _id: '$classId', count: { $sum: 1 } } },
    ]);
    const sectionCountMap = new Map<string, number>();
    sectionCounts.forEach((sc) => sectionCountMap.set(sc._id.toString(), sc.count));

    // 6. Fetch device profiles per class
    const deviceProfiles = await StudentDeviceProfile.find({ institutionId }).lean();
    const classDeviceMap = new Map<string, string>();
    deviceProfiles.forEach((dp) => {
      if (dp.classId) {
        classDeviceMap.set(dp.classId.toString(), dp.deviceType);
      }
    });

    // Key Matrix Features
    const matrixFeatureKeys = [
      FeatureKey.STUDENT_DASHBOARD,
      FeatureKey.ASSIGNMENTS,
      FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION,
      FeatureKey.QUIZZES,
      FeatureKey.QUIZZES_ONLINE_ACCESS,
      FeatureKey.NOTES,
      FeatureKey.MATERIALS,
      FeatureKey.PRESENTATIONS,
      FeatureKey.VIDEOS,
      FeatureKey.DIGITAL_TEXTBOOKS,
      FeatureKey.SIMULATIONS,
      FeatureKey.SIMULATIONS_STUDENT_ACCESS,
      FeatureKey.AI_ASSISTANT,
      FeatureKey.AI_STUDENT_ACCESS,
      FeatureKey.SMARTBOARD,
    ];

    // Build Rows
    const matrix = existingClasses.map((cls) => {
      const classIdStr = (cls._id || (cls as any).id).toString();
      const grade = cls.gradeNumber;
      const isGradeSubscribed = allowedGrades.includes(grade);

      const features: Record<string, {
        enabled: boolean;
        source: 'EXPLICIT_CLASS' | 'INHERITED_INSTITUTION' | 'PLATFORM_DEFAULT' | 'SUBSCRIPTION_BLOCKED';
        isInherited: boolean;
        isEditable: boolean;
      }> = {};

      for (const featKey of matrixFeatureKeys) {
        // Check platform subscription upper bound
        let isBlockedBySub = false;
        if (!isGradeSubscribed) {
          isBlockedBySub = true;
        } else if ((featKey === FeatureKey.AI_ASSISTANT || featKey === FeatureKey.AI_STUDENT_ACCESS) && subscriptionFeatures.aiLearningAssistant === false) {
          isBlockedBySub = true;
        } else if ((featKey === FeatureKey.SIMULATIONS || featKey === FeatureKey.SIMULATIONS_STUDENT_ACCESS) && subscriptionFeatures.simulations === false) {
          isBlockedBySub = true;
        } else if (featKey === FeatureKey.SMARTBOARD && subscriptionFeatures.smartBoardHub === false) {
          isBlockedBySub = true;
        }

        if (isBlockedBySub) {
          features[featKey] = {
            enabled: false,
            source: 'SUBSCRIPTION_BLOCKED',
            isInherited: true,
            isEditable: false,
          };
          continue;
        }

        // Check explicit class override
        const explicitClassVal = classMap.get(`${classIdStr}_${featKey}`);
        if (explicitClassVal !== undefined) {
          features[featKey] = {
            enabled: explicitClassVal,
            source: 'EXPLICIT_CLASS',
            isInherited: false,
            isEditable: true,
          };
          continue;
        }

        // Check institution default
        const instVal = instMap.get(featKey);
        if (instVal !== undefined) {
          features[featKey] = {
            enabled: instVal,
            source: 'INHERITED_INSTITUTION',
            isInherited: true,
            isEditable: true,
          };
          continue;
        }

        // Fall back to platform default
        const def = FEATURE_DEFINITIONS[featKey];
        features[featKey] = {
          enabled: def ? def.defaultEnabled : true,
          source: 'PLATFORM_DEFAULT',
          isInherited: true,
          isEditable: true,
        };
      }

      return {
        classId: classIdStr,
        gradeNumber: grade,
        className: cls.name || `Class ${grade}`,
        stream: cls.stream || 'GENERAL',
        sectionCount: sectionCountMap.get(classIdStr) || 0,
        deviceType: classDeviceMap.get(classIdStr) || 'UNKNOWN',
        isGradeSubscribed,
        features,
      };
    });

    return {
      institutionId,
      academicYearId,
      matrixFeatureKeys,
      classes: matrix,
    };
  }

  /**
   * ─────────────────────────────────────────────────────────────────────────────
   * 3. INSTITUTION-WIDE SETTINGS MANAGEMENT
   * ─────────────────────────────────────────────────────────────────────────────
   */
  static async getInstitutionSettings(institutionId: string) {
    const list = await InstitutionFeatureSettings.find({ institutionId }).lean();
    const map: Record<string, boolean> = {};
    list.forEach((s) => (map[s.featureKey] = s.enabled));

    // Combine with all available features from registry
    const fullSettings = Object.values(FeatureKey).map((key) => {
      const def = FEATURE_DEFINITIONS[key];
      const hasCustom = map[key] !== undefined;
      return {
        featureKey: key,
        name: def?.name || key,
        category: def?.category || 'GENERAL',
        description: def?.description || '',
        enabled: hasCustom ? map[key] : (def?.defaultEnabled ?? true),
        isCustomized: hasCustom,
      };
    });

    return fullSettings;
  }

  static async updateInstitutionSetting(params: {
    institutionId: string;
    featureKey: FeatureKey;
    enabled: boolean;
    configOptions?: Record<string, any>;
    userId: string;
    reason?: string;
  }) {
    const { institutionId, featureKey, enabled, configOptions, userId, reason } = params;

    const existing = await InstitutionFeatureSettings.findOne({ institutionId, featureKey });
    const previousSetting = existing ? existing.enabled : null;

    const updated = await InstitutionFeatureSettings.findOneAndUpdate(
      { institutionId, featureKey },
      {
        enabled,
        configOptions: configOptions || {},
        updatedBy: userId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Audit log
    await FeatureConfigurationHistory.create({
      institutionId,
      scope: 'INSTITUTION',
      featureKey,
      previousSetting,
      newSetting: enabled,
      reason: reason || 'Institution default feature setting updated',
      affectedScopeDescription: `Institution-wide default for ${FEATURE_DEFINITIONS[featureKey]?.name || featureKey}`,
      changedBy: userId,
    });

    return updated;
  }

  /**
   * ─────────────────────────────────────────────────────────────────────────────
   * 4. CLASS-WISE SETTINGS MANAGEMENT
   * ─────────────────────────────────────────────────────────────────────────────
   */
  static async getClassSettings(institutionId: string, classId: string) {
    const cls = await Class.findOne({ _id: classId, institutionId }).lean();
    if (!cls) throw new Error('Class not found');

    const classOverrides = await ClassFeatureSettings.find({ institutionId, classId }).lean();
    const overrideMap = new Map<string, boolean>();
    classOverrides.forEach((s) => overrideMap.set(s.featureKey, s.enabled));

    const instSettings = await InstitutionFeatureSettings.find({ institutionId }).lean();
    const instMap = new Map<string, boolean>();
    instSettings.forEach((s) => instMap.set(s.featureKey, s.enabled));

    return Object.values(FeatureKey).map((key) => {
      const def = FEATURE_DEFINITIONS[key];
      const hasClassOverride = overrideMap.has(key);
      const hasInstSetting = instMap.has(key);

      const effectiveEnabled = hasClassOverride
        ? overrideMap.get(key)!
        : hasInstSetting
        ? instMap.get(key)!
        : (def?.defaultEnabled ?? true);

      return {
        featureKey: key,
        name: def?.name || key,
        category: def?.category,
        description: def?.description,
        enabled: effectiveEnabled,
        isOverridden: hasClassOverride,
        inheritedFrom: hasClassOverride ? 'CLASS' : hasInstSetting ? 'INSTITUTION' : 'PLATFORM_DEFAULT',
      };
    });
  }

  static async updateClassSetting(params: {
    institutionId: string;
    classId: string;
    featureKey: FeatureKey;
    enabled: boolean;
    configOptions?: Record<string, any>;
    userId: string;
    reason?: string;
  }) {
    const { institutionId, classId, featureKey, enabled, configOptions, userId, reason } = params;

    const cls = await Class.findById(classId);
    if (!cls) throw new Error('Class not found');
    if (cls.institutionId.toString() !== institutionId) {
      throw { status: 403, message: 'Class does not belong to this institution', code: 'FORBIDDEN_TENANT' };
    }

    const existing = await ClassFeatureSettings.findOne({ institutionId, classId, featureKey });
    const previousSetting = existing ? existing.enabled : null;

    const updated = await ClassFeatureSettings.findOneAndUpdate(
      { institutionId, classId, featureKey },
      {
        gradeNumber: cls.gradeNumber,
        enabled,
        configOptions: configOptions || {},
        updatedBy: userId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Audit log
    await FeatureConfigurationHistory.create({
      institutionId,
      scope: 'CLASS',
      targetId: classId,
      targetName: cls.name || `Class ${cls.gradeNumber}`,
      featureKey,
      previousSetting,
      newSetting: enabled,
      reason: reason || `Class ${cls.gradeNumber} override updated`,
      affectedScopeDescription: `${cls.name || `Class ${cls.gradeNumber}`} — ${FEATURE_DEFINITIONS[featureKey]?.name || featureKey}`,
      changedBy: userId,
    });

    return updated;
  }

  static async bulkUpdateClassSettings(params: {
    institutionId: string;
    classIds: string[];
    featureKey: FeatureKey;
    enabled: boolean;
    userId: string;
    reason?: string;
  }) {
    const { institutionId, classIds, featureKey, enabled, userId, reason } = params;
    const results = [];

    for (const classId of classIds) {
      const res = await this.updateClassSetting({
        institutionId,
        classId,
        featureKey,
        enabled,
        userId,
        reason: reason || 'Bulk class feature configuration update',
      });
      results.push(res);
    }

    return results;
  }

  /**
   * ─────────────────────────────────────────────────────────────────────────────
   * 5. SECTION-WISE SETTINGS MANAGEMENT
   * ─────────────────────────────────────────────────────────────────────────────
   */
  static async getSectionSettings(institutionId: string, sectionId: string) {
    const sec = await Section.findById(sectionId).populate('classId').lean();
    if (!sec) throw new Error('Section not found');
    const sectionClass = (sec as any).classId;
    if (!sectionClass?.institutionId || sectionClass.institutionId.toString() !== institutionId) {
      throw { status: 403, message: 'Section does not belong to this institution', code: 'FORBIDDEN_TENANT' };
    }

    const sectionOverrides = await SectionFeatureSettings.find({ institutionId, sectionId }).lean();
    const sectionMap = new Map<string, boolean>();
    sectionOverrides.forEach((s) => sectionMap.set(s.featureKey, s.enabled));

    const classIdStr = sectionClass._id?.toString() || sectionClass.id?.toString();
    const classOverrides = classIdStr ? await ClassFeatureSettings.find({ institutionId, classId: classIdStr }).lean() : [];
    const classMap = new Map<string, boolean>();
    classOverrides.forEach((s) => classMap.set(s.featureKey, s.enabled));

    const instSettings = await InstitutionFeatureSettings.find({ institutionId }).lean();
    const instMap = new Map<string, boolean>();
    instSettings.forEach((s) => instMap.set(s.featureKey, s.enabled));

    return Object.values(FeatureKey).map((key) => {
      const def = FEATURE_DEFINITIONS[key];
      const hasSecOverride = sectionMap.has(key);
      const hasClassOverride = classMap.has(key);
      const hasInstSetting = instMap.has(key);

      const effectiveEnabled = hasSecOverride
        ? sectionMap.get(key)!
        : hasClassOverride
        ? classMap.get(key)!
        : hasInstSetting
        ? instMap.get(key)!
        : (def?.defaultEnabled ?? true);

      return {
        featureKey: key,
        name: def?.name || key,
        category: def?.category,
        description: def?.description,
        enabled: effectiveEnabled,
        isOverridden: hasSecOverride,
        inheritedFrom: hasSecOverride
          ? 'SECTION'
          : hasClassOverride
          ? 'CLASS'
          : hasInstSetting
          ? 'INSTITUTION'
          : 'PLATFORM_DEFAULT',
      };
    });
  }

  static async updateSectionSetting(params: {
    institutionId: string;
    sectionId: string;
    featureKey: FeatureKey;
    enabled: boolean;
    configOptions?: Record<string, any>;
    userId: string;
    reason?: string;
  }) {
    const { institutionId, sectionId, featureKey, enabled, configOptions, userId, reason } = params;

    const sec = await Section.findById(sectionId).populate('classId');
    if (!sec) throw new Error('Section not found');
    const sectionClass = sec.classId as any;
    if (!sectionClass?.institutionId || sectionClass.institutionId.toString() !== institutionId) {
      throw { status: 403, message: 'Section does not belong to this institution', code: 'FORBIDDEN_TENANT' };
    }

    const classId = sectionClass._id || sec.classId;

    const existing = await SectionFeatureSettings.findOne({ institutionId, sectionId, featureKey });
    const previousSetting = existing ? existing.enabled : null;

    const updated = await SectionFeatureSettings.findOneAndUpdate(
      { institutionId, sectionId, featureKey },
      {
        classId,
        enabled,
        configOptions: configOptions || {},
        updatedBy: userId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Audit log
    await FeatureConfigurationHistory.create({
      institutionId,
      scope: 'SECTION',
      targetId: sectionId,
      targetName: `${(sec.classId as any)?.name || 'Class'} - Section ${sec.name}`,
      featureKey,
      previousSetting,
      newSetting: enabled,
      reason: reason || `Section ${sec.name} override updated`,
      affectedScopeDescription: `Section ${sec.name} — ${FEATURE_DEFINITIONS[featureKey]?.name || featureKey}`,
      changedBy: userId,
    });

    return updated;
  }

  /**
   * ─────────────────────────────────────────────────────────────────────────────
   * 6. INDIVIDUAL STUDENT OVERRIDES
   * ─────────────────────────────────────────────────────────────────────────────
   */
  static async setStudentOverride(params: {
    institutionId: string;
    studentId: string;
    featureKey: FeatureKey;
    enabled: boolean;
    reason?: string;
    userId: string;
  }) {
    const { institutionId, studentId, featureKey, enabled, reason, userId } = params;

    const student = await StudentEnrollment.findById(studentId).populate('studentId').lean();
    if (!student) throw new Error('Student enrollment record not found');

    const existing = await StudentFeatureOverride.findOne({ institutionId, studentId, featureKey });
    const previousSetting = existing ? existing.enabled : null;

    const updated = await StudentFeatureOverride.findOneAndUpdate(
      { institutionId, studentId, featureKey },
      {
        sectionId: student.sectionId,
        enabled,
        reason: reason || 'Individual student exception granted by School Admin',
        updatedBy: userId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const studentName = (student.studentId as any)?.fullName || (student as any).user?.fullName || `Student #${student.rollNumber}`;

    await FeatureConfigurationHistory.create({
      institutionId,
      scope: 'STUDENT',
      targetId: studentId,
      targetName: studentName,
      featureKey,
      previousSetting,
      newSetting: enabled,
      reason: reason || 'Individual student override set',
      affectedScopeDescription: `${studentName} — ${FEATURE_DEFINITIONS[featureKey]?.name || featureKey}`,
      changedBy: userId,
    });

    return updated;
  }

  /**
   * ─────────────────────────────────────────────────────────────────────────────
   * 7. RESET OVERRIDES TO INHERITED VALUES
   * ─────────────────────────────────────────────────────────────────────────────
   */
  static async resetOverrides(params: {
    institutionId: string;
    scope: 'CLASS' | 'SECTION' | 'STUDENT';
    targetId: string;
    featureKey?: FeatureKey;
    userId: string;
  }) {
    const { institutionId, scope, targetId, featureKey, userId } = params;
    const filter: any = { institutionId };

    if (featureKey) filter.featureKey = featureKey;

    if (scope === 'CLASS') {
      filter.classId = targetId;
      await ClassFeatureSettings.deleteMany(filter);
    } else if (scope === 'SECTION') {
      filter.sectionId = targetId;
      await SectionFeatureSettings.deleteMany(filter);
    } else if (scope === 'STUDENT') {
      filter.studentId = targetId;
      await StudentFeatureOverride.deleteMany(filter);
    }

    await FeatureConfigurationHistory.create({
      institutionId,
      scope,
      targetId,
      featureKey: featureKey || FeatureKey.STUDENT_DASHBOARD,
      previousSetting: true,
      newSetting: false,
      reason: `Overrides reset to inherited hierarchy defaults for ${scope} ${targetId}`,
      affectedScopeDescription: `Reset ${scope} overrides back to parent inheritance`,
      changedBy: userId,
    });

    return { success: true, message: `Overrides reset for ${scope} ${targetId}` };
  }

  /**
   * ─────────────────────────────────────────────────────────────────────────────
   * 8. STUDENT DEVICE AVAILABILITY PROFILES
   * ─────────────────────────────────────────────────────────────────────────────
   */
  static async getDeviceProfiles(institutionId: string, filter?: { classId?: string; sectionId?: string }) {
    const query: any = { institutionId };
    if (filter?.classId) query.classId = filter.classId;
    if (filter?.sectionId) query.sectionId = filter.sectionId;

    return StudentDeviceProfile.find(query).populate('classId sectionId studentId').sort({ createdAt: -1 }).lean();
  }

  static async upsertDeviceProfile(params: {
    institutionId: string;
    classId?: string;
    sectionId?: string;
    studentId?: string;
    deviceType: DeviceAccessType;
    internetAvailability?: 'BROADBAND' | 'MOBILE_DATA' | 'SCHOOL_ONLY' | 'NONE';
    sharedDeviceCount?: number;
    notes?: string;
    userId: string;
  }) {
    const {
      institutionId,
      classId,
      sectionId,
      studentId,
      deviceType,
      internetAvailability = 'SCHOOL_ONLY',
      sharedDeviceCount = 0,
      notes,
      userId,
    } = params;

    const query: any = { institutionId };
    if (studentId) query.studentId = studentId;
    else if (sectionId) query.sectionId = sectionId;
    else if (classId) query.classId = classId;

    return StudentDeviceProfile.findOneAndUpdate(
      query,
      {
        institutionId,
        classId,
        sectionId,
        studentId,
        deviceType,
        internetAvailability,
        sharedDeviceCount,
        notes,
        updatedBy: userId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  /**
   * ─────────────────────────────────────────────────────────────────────────────
   * 9. CONFIGURATION CHANGE AUDIT LOG
   * ─────────────────────────────────────────────────────────────────────────────
   */
  static async getConfigurationHistory(institutionId: string, limit = 50) {
    return FeatureConfigurationHistory.find({ institutionId })
      .populate('changedBy', 'fullName username role')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * ─────────────────────────────────────────────────────────────────────────────
   * 10. LEARNING MODE PRESETS (FULL_DIGITAL, SMARTBOARD_ONLY, HYBRID, OFFLINE_FIRST)
   * ─────────────────────────────────────────────────────────────────────────────
   */
  static async applyLearningMode(params: {
    institutionId: string;
    learningMode: 'FULL_DIGITAL' | 'SMARTBOARD_ONLY' | 'HYBRID' | 'OFFLINE_FIRST';
    userId: string;
    classId?: string;
  }) {
    const { institutionId, learningMode, userId, classId } = params;
    const modeConfig: Record<string, boolean> = {};

    switch (learningMode) {
      case 'FULL_DIGITAL':
        modeConfig[FeatureKey.STUDENT_DASHBOARD] = true;
        modeConfig[FeatureKey.ASSIGNMENTS] = true;
        modeConfig[FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION] = true;
        modeConfig[FeatureKey.QUIZZES] = true;
        modeConfig[FeatureKey.QUIZZES_ONLINE_ACCESS] = true;
        modeConfig[FeatureKey.SMARTBOARD] = true;
        modeConfig[FeatureKey.SIMULATIONS] = true;
        modeConfig[FeatureKey.SIMULATIONS_STUDENT_ACCESS] = true;
        modeConfig[FeatureKey.AI_ASSISTANT] = true;
        modeConfig[FeatureKey.AI_STUDENT_ACCESS] = true;
        modeConfig[FeatureKey.DIGITAL_TEXTBOOKS] = true;
        modeConfig[FeatureKey.TEXTBOOKS_STUDENT_ACCESS] = true;
        break;

      case 'SMARTBOARD_ONLY':
        modeConfig[FeatureKey.STUDENT_DASHBOARD] = false;
        modeConfig[FeatureKey.ASSIGNMENTS] = true;
        modeConfig[FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION] = false;
        modeConfig[FeatureKey.QUIZZES] = true;
        modeConfig[FeatureKey.QUIZZES_ONLINE_ACCESS] = false;
        modeConfig[FeatureKey.SMARTBOARD] = true;
        modeConfig[FeatureKey.SMARTBOARD_WHITEBOARD] = true;
        modeConfig[FeatureKey.SIMULATIONS] = true;
        modeConfig[FeatureKey.SIMULATIONS_STUDENT_ACCESS] = false;
        modeConfig[FeatureKey.SIMULATIONS_SMARTBOARD] = true;
        modeConfig[FeatureKey.AI_ASSISTANT] = true;
        modeConfig[FeatureKey.AI_STUDENT_ACCESS] = false;
        modeConfig[FeatureKey.AI_SMARTBOARD_ACCESS] = true;
        modeConfig[FeatureKey.DIGITAL_TEXTBOOKS] = true;
        modeConfig[FeatureKey.TEXTBOOKS_STUDENT_ACCESS] = false;
        modeConfig[FeatureKey.TEXTBOOKS_TEACHER_ACCESS] = true;
        break;

      case 'HYBRID':
        modeConfig[FeatureKey.STUDENT_DASHBOARD] = true;
        modeConfig[FeatureKey.ASSIGNMENTS] = true;
        modeConfig[FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION] = true;
        modeConfig[FeatureKey.QUIZZES] = true;
        modeConfig[FeatureKey.QUIZZES_ONLINE_ACCESS] = true;
        modeConfig[FeatureKey.SMARTBOARD] = true;
        modeConfig[FeatureKey.SIMULATIONS] = true;
        modeConfig[FeatureKey.SIMULATIONS_STUDENT_ACCESS] = true;
        modeConfig[FeatureKey.AI_ASSISTANT] = true;
        modeConfig[FeatureKey.AI_STUDENT_ACCESS] = true;
        modeConfig[FeatureKey.DIGITAL_TEXTBOOKS] = true;
        modeConfig[FeatureKey.TEXTBOOKS_STUDENT_ACCESS] = true;
        break;

      case 'OFFLINE_FIRST':
        modeConfig[FeatureKey.STUDENT_DASHBOARD] = true;
        modeConfig[FeatureKey.ASSIGNMENTS] = true;
        modeConfig[FeatureKey.ASSIGNMENTS_ONLINE_SUBMISSION] = false;
        modeConfig[FeatureKey.QUIZZES] = true;
        modeConfig[FeatureKey.QUIZZES_ONLINE_ACCESS] = false;
        modeConfig[FeatureKey.SMARTBOARD] = true;
        modeConfig[FeatureKey.SIMULATIONS] = true;
        modeConfig[FeatureKey.SIMULATIONS_STUDENT_ACCESS] = false;
        modeConfig[FeatureKey.AI_ASSISTANT] = false;
        modeConfig[FeatureKey.AI_STUDENT_ACCESS] = false;
        modeConfig[FeatureKey.DIGITAL_TEXTBOOKS] = true;
        modeConfig[FeatureKey.TEXTBOOKS_STUDENT_ACCESS] = true;
        break;
    }

    if (classId) {
      for (const [key, enabled] of Object.entries(modeConfig)) {
        await this.updateClassSetting({
          institutionId,
          classId,
          featureKey: key as FeatureKey,
          enabled,
          userId,
          reason: `Applied learning mode '${learningMode}' to class`,
        });
      }
    } else {
      for (const [key, enabled] of Object.entries(modeConfig)) {
        await this.updateInstitutionSetting({
          institutionId,
          featureKey: key as FeatureKey,
          enabled,
          userId,
          reason: `Applied institution learning mode '${learningMode}'`,
        });
      }
    }

    return { success: true, learningMode, updatedFeaturesCount: Object.keys(modeConfig).length };
  }
}
