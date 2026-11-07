import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { FeatureAccessService } from './feature-access.service';
import { FEATURE_DEFINITIONS, FeatureKey } from '../../models/FeatureAccess';

// Features the student / teacher dashboards can hide. Each lists the registry keys that must ALL be on.
const DASHBOARD_FEATURES: Record<string, { student: FeatureKey[]; teacher: FeatureKey[] }> = {
  ASSIGNMENTS: { student: [FeatureKey.ASSIGNMENTS], teacher: [FeatureKey.ASSIGNMENTS] },
  QUIZZES: { student: [FeatureKey.QUIZZES], teacher: [FeatureKey.QUIZZES] },
  NOTES: { student: [FeatureKey.NOTES], teacher: [FeatureKey.NOTES] },
  MATERIALS: { student: [FeatureKey.MATERIALS], teacher: [FeatureKey.MATERIALS] },
  SIMULATIONS: { student: [FeatureKey.SIMULATIONS], teacher: [FeatureKey.SIMULATIONS] },
  AI: { student: [FeatureKey.AI_ASSISTANT, FeatureKey.AI_STUDENT_ACCESS], teacher: [FeatureKey.AI_ASSISTANT, FeatureKey.AI_TEACHER_ACCESS] },
};

export class FeatureAccessController {
  /**
   * Which dashboard features are switched OFF for the signed-in student (their own class/section) or teacher
   * (off only when off for every class they teach). The dashboards hide those menu items.
   */
  static async getMyFeatures(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = req.user!;
      const institutionId = String(req.institutionId || user.institutionId || '');
      if (!institutionId) return res.json({ success: true, data: { disabled: [] } });
      const role = user.role === 'STUDENT' ? 'student' : 'teacher';

      // Contexts to evaluate: the student themself, or each section a teacher teaches / leads.
      let contexts: Array<{ studentId?: string; sectionId?: string; classId?: string }> = [];
      if (role === 'student') {
        contexts = [{ studentId: user.userId }];
      } else {
        const { SubjectAllocation, Section } = await import('../../models');
        const allocs: any[] = await (SubjectAllocation as any).find({ teacherId: user.userId, status: { $ne: 'INACTIVE' } }).select('sectionId classId').lean();
        const led: any[] = await (Section as any).find({ classTeacherId: user.userId }).select('_id classId').lean();
        const seen = new Set<string>();
        for (const a of allocs) if (a.sectionId && !seen.has(String(a.sectionId))) { seen.add(String(a.sectionId)); contexts.push({ sectionId: String(a.sectionId), classId: a.classId ? String(a.classId) : undefined }); }
        for (const l of led) if (!seen.has(String(l._id))) { seen.add(String(l._id)); contexts.push({ sectionId: String(l._id), classId: l.classId ? String(l.classId) : undefined }); }
      }
      if (contexts.length === 0) return res.json({ success: true, data: { disabled: [] } });

      const disabled: string[] = [];
      for (const [name, def] of Object.entries(DASHBOARD_FEATURES)) {
        let onSomewhere = false;
        for (const ctx of contexts) {
          let on = true;
          for (const key of def[role]) {
            const r = await FeatureAccessService.resolveFeatureAccess({ institutionId, featureKey: key, ...ctx });
            if (!r.effectiveEnabled) { on = false; break; }
          }
          if (on) { onSomewhere = true; break; }
        }
        if (!onSomewhere) disabled.push(name);
      }
      res.json({ success: true, data: { disabled } });
    } catch (err) {
      next(err);
    }
  }

  // ── Registry ──────────────────────────────────────────────────────────
  static async getRegistry(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: {
          features: Object.values(FEATURE_DEFINITIONS),
          keys: Object.values(FeatureKey),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // ── Check / Resolve Feature Access ─────────────────────────────────────
  static async resolveAccess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || req.body.institutionId;
      if (!institutionId) {
        return res.status(400).json({ success: false, error: { message: 'Institution ID required' } });
      }

      const result = await FeatureAccessService.resolveFeatureAccess({
        institutionId: institutionId.toString(),
        academicYearId: req.body.academicYearId,
        classId: req.body.classId,
        sectionId: req.body.sectionId,
        studentId: req.body.studentId,
        featureKey: req.body.featureKey,
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ── Configuration Matrix ───────────────────────────────────────────────
  static async getClassMatrix(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || (req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ success: false, error: { message: 'Institution ID required' } });
      }

      const matrix = await FeatureAccessService.getClassFeatureMatrix(
        institutionId.toString(),
        req.query.academicYearId as string
      );

      res.json({ success: true, data: matrix });
    } catch (err) {
      next(err);
    }
  }

  // ── Institution Settings ───────────────────────────────────────────────
  static async getInstitutionSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || (req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ success: false, error: { message: 'Institution ID required' } });
      }

      const settings = await FeatureAccessService.getInstitutionSettings(institutionId.toString());
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  static async updateInstitutionSetting(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || req.body.institutionId;
      if (!institutionId) {
        return res.status(400).json({ success: false, error: { message: 'Institution ID required' } });
      }

      const updated = await FeatureAccessService.updateInstitutionSetting({
        institutionId: institutionId.toString(),
        featureKey: req.body.featureKey,
        enabled: Boolean(req.body.enabled),
        configOptions: req.body.configOptions,
        userId: req.user?.userId || 'SYSTEM',
        reason: req.body.reason,
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  // ── Class Settings ─────────────────────────────────────────────────────
  static async getClassSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || (req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ success: false, error: { message: 'Institution ID required' } });
      }

      const settings = await FeatureAccessService.getClassSettings(institutionId.toString(), req.params.classId);
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  static async updateClassSetting(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || req.body.institutionId;
      if (!institutionId) {
        return res.status(400).json({ success: false, error: { message: 'Institution ID required' } });
      }

      const updated = await FeatureAccessService.updateClassSetting({
        institutionId: institutionId.toString(),
        classId: req.params.classId,
        featureKey: req.body.featureKey,
        enabled: Boolean(req.body.enabled),
        configOptions: req.body.configOptions,
        userId: req.user?.userId || 'SYSTEM',
        reason: req.body.reason,
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  static async bulkUpdateClassSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || req.body.institutionId;
      if (!institutionId) {
        return res.status(400).json({ success: false, error: { message: 'Institution ID required' } });
      }

      const results = await FeatureAccessService.bulkUpdateClassSettings({
        institutionId: institutionId.toString(),
        classIds: req.body.classIds,
        featureKey: req.body.featureKey,
        enabled: Boolean(req.body.enabled),
        userId: req.user?.userId || 'SYSTEM',
        reason: req.body.reason,
      });

      res.json({ success: true, data: results });
    } catch (err) {
      next(err);
    }
  }

  // ── Section Settings ───────────────────────────────────────────────────
  static async getSectionSettings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || (req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ success: false, error: { message: 'Institution ID required' } });
      }

      const settings = await FeatureAccessService.getSectionSettings(institutionId.toString(), req.params.sectionId);
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  static async updateSectionSetting(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || req.body.institutionId;
      if (!institutionId) {
        return res.status(400).json({ success: false, error: { message: 'Institution ID required' } });
      }

      const updated = await FeatureAccessService.updateSectionSetting({
        institutionId: institutionId.toString(),
        sectionId: req.params.sectionId,
        featureKey: req.body.featureKey,
        enabled: Boolean(req.body.enabled),
        configOptions: req.body.configOptions,
        userId: req.user?.userId || 'SYSTEM',
        reason: req.body.reason,
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  // ── Student Overrides ──────────────────────────────────────────────────
  static async setStudentOverride(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || req.body.institutionId;
      if (!institutionId) {
        return res.status(400).json({ success: false, error: { message: 'Institution ID required' } });
      }

      const updated = await FeatureAccessService.setStudentOverride({
        institutionId: institutionId.toString(),
        studentId: req.params.studentId,
        featureKey: req.body.featureKey,
        enabled: Boolean(req.body.enabled),
        reason: req.body.reason,
        userId: req.user?.userId || 'SYSTEM',
      });

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }

  // ── Reset Overrides ────────────────────────────────────────────────────
  static async resetOverrides(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || req.body.institutionId;
      if (!institutionId) {
        return res.status(400).json({ success: false, error: { message: 'Institution ID required' } });
      }

      const result = await FeatureAccessService.resetOverrides({
        institutionId: institutionId.toString(),
        scope: req.body.scope,
        targetId: req.body.targetId,
        featureKey: req.body.featureKey,
        userId: req.user?.userId || 'SYSTEM',
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  // ── Device Profiles ────────────────────────────────────────────────────
  static async getDeviceProfiles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || (req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ success: false, error: { message: 'Institution ID required' } });
      }

      const profiles = await FeatureAccessService.getDeviceProfiles(institutionId.toString(), {
        classId: req.query.classId as string,
        sectionId: req.query.sectionId as string,
      });

      res.json({ success: true, data: profiles });
    } catch (err) {
      next(err);
    }
  }

  static async upsertDeviceProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || req.body.institutionId;
      if (!institutionId) {
        return res.status(400).json({ success: false, error: { message: 'Institution ID required' } });
      }

      const profile = await FeatureAccessService.upsertDeviceProfile({
        institutionId: institutionId.toString(),
        classId: req.body.classId,
        sectionId: req.body.sectionId,
        studentId: req.body.studentId,
        deviceType: req.body.deviceType,
        internetAvailability: req.body.internetAvailability,
        sharedDeviceCount: req.body.sharedDeviceCount,
        notes: req.body.notes,
        userId: req.user?.userId || 'SYSTEM',
      });

      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  }

  // ── Audit History ──────────────────────────────────────────────────────
  static async getConfigurationHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const institutionId = req.institutionId || req.user?.institutionId || (req.query.institutionId as string);
      if (!institutionId) {
        return res.status(400).json({ success: false, error: { message: 'Institution ID required' } });
      }

      const limit = Number(req.query.limit) || 50;
      const history = await FeatureAccessService.getConfigurationHistory(institutionId.toString(), limit);

      res.json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  }
}

