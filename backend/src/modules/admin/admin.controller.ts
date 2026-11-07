import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service';
import { ProvisioningService } from './provisioning.service';
import { RegistrationService } from './registration.service';
import { ApiResponse } from '../../common/utils/response.util';
import { saveLogoDataUrl } from '../../common/utils/logo.util';
import { Institution } from '../../models';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import csv from 'csv-parser';
import { Readable } from 'stream';

export class AdminController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const overview = await AdminService.getDashboardOverview();
      return ApiResponse.success(res, overview, 'Platform overview statistics retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getInstitutions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getInstitutions(req.query);
      return ApiResponse.success(res, result, 'Institutions list loaded');
    } catch (error) {
      next(error);
    }
  }

  static async assignLeadership(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { userId, targetRole } = req.body;
      const user = await AdminService.assignInstitutionLeadership(id, userId, targetRole, req.user);
      return ApiResponse.success(res, user, `User successfully updated to ${targetRole}`);
    } catch (error) {
      next(error);
    }
  }

  static async getInstitutionDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const details = await AdminService.getInstitutionDetails(req.params.id);
      return ApiResponse.success(res, details, 'Institution details loaded');
    } catch (error) {
      next(error);
    }
  }

  static async createInstitution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.createInstitution(req.body, {
        userId: req.user!.userId,
        userEmail: req.user!.username,
        ip: req.ip,
      });
      return ApiResponse.success(res, result, 'Institution registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateInstitution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await AdminService.updateInstitution(req.params.id, req.body, {
        userId: req.user!.userId,
        userEmail: req.user!.username,
        ip: req.ip,
      });
      return ApiResponse.success(res, updated, 'Institution updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateInstitutionLogo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { logoDataUrl, remove } = req.body || {};
      const logoUrl = remove ? '' : saveLogoDataUrl(logoDataUrl, `inst-${req.params.id}`);
      const updated = await Institution.findByIdAndUpdate(req.params.id, { $set: { logoUrl } }, { new: true });
      if (!updated) throw { status: 404, message: 'Institution not found', code: 'INSTITUTION_NOT_FOUND' };
      return ApiResponse.success(res, { id: String(updated._id), logoUrl: updated.logoUrl || null }, remove ? 'Logo removed' : 'Logo updated');
    } catch (error) {
      next(error);
    }
  }

  static async setInstitutionStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const updated = await AdminService.setInstitutionStatus(req.params.id, status, {
        userId: req.user!.userId,
        userEmail: req.user!.username,
        ip: req.ip,
      });
      return ApiResponse.success(res, updated, `Institution status updated to ${status}`);
    } catch (error) {
      next(error);
    }
  }

  static async downloadImportTemplate(req: Request, res: Response) {
    const csvContent =
      'name,nameNepali,emisCode,type,province,district,localLevel,ward,email,phone,adminUsername,adminPassword\n' +
      'Shree Himalaya Secondary School,श्री हिमालय माध्यमिक विद्यालय,270050001,COMMUNITY,Bagmati Province,Kathmandu,Kathmandu Metropolitan City,16,info@himalaya.edu.np,01-4355667,admin_himalaya,Nepal@2081\n' +
      'Annapurna Model Higher Secondary,अन्नपूर्ण मोडल उच्च माध्यमिक विद्यालय,480090002,INSTITUTIONAL,Gandaki Province,Kaski,Pokhara Metropolitan City,05,admin@annapurna.edu.np,061-534455,admin_annapurna,Nepal@2081\n';

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="nepal_schools_import_template.csv"');
    return res.status(200).send(csvContent);
  }

  static async validateBulkImport(req: Request, res: Response, next: NextFunction) {
    try {
      let records: any[] = [];
      if (req.file) {
        const stream = Readable.from(req.file.buffer.toString());
        records = await new Promise((resolve, reject) => {
          const list: any[] = [];
          stream
            .pipe(csv())
            .on('data', (d) => list.push(d))
            .on('end', () => resolve(list))
            .on('error', (err) => reject(err));
        });
      } else if (Array.isArray(req.body.institutions)) {
        records = req.body.institutions;
      } else if (Array.isArray(req.body)) {
        records = req.body;
      } else {
        return ApiResponse.error(res, 'File or JSON array of records required', 400, 'MISSING_PAYLOAD');
      }

      const preview = await AdminService.validateBulkImportRecords(records);
      return ApiResponse.success(res, preview, 'Import records validated');
    } catch (error) {
      next(error);
    }
  }

  static async executeBulkImport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const records = req.body.institutions || req.body;
      if (!Array.isArray(records) || records.length === 0) {
        return ApiResponse.error(res, 'Array of valid records required to execute import', 400, 'INVALID_RECORDS');
      }

      const report = await AdminService.executeBulkImport(records, {
        userId: req.user!.userId,
        userEmail: req.user!.username,
        ip: req.ip,
      });

      return ApiResponse.success(res, report, `Bulk onboarding finished: ${report.successCount} succeeded, ${report.failedCount} failed`);
    } catch (error) {
      next(error);
    }
  }

  static async provisionAdministrator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.provisionAdministrator(req.params.id, req.body, {
        userId: req.user!.userId,
        userEmail: req.user!.username,
        ip: req.ip,
      });
      return ApiResponse.success(res, result, 'Administrator account provisioned', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getUsers(req.query);
      return ApiResponse.success(res, result, 'User directory loaded');
    } catch (error) {
      next(error);
    }
  }

  static async setUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const updated = await AdminService.setUserStatus(req.params.id, status, {
        userId: req.user!.userId,
        userEmail: req.user!.username,
        ip: req.ip,
      });
      return ApiResponse.success(res, updated, `User account ${status.toLowerCase()}`);
    } catch (error) {
      next(error);
    }
  }

  static async resetUserPassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.resetUserPassword(req.params.id, req.body.password, {
        userId: req.user!.userId,
        userEmail: req.user!.username,
        ip: req.ip,
      });
      return ApiResponse.success(res, result, 'Password reset successful');
    } catch (error) {
      next(error);
    }
  }

  static async getContentSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await AdminService.getContentSummary();
      return ApiResponse.success(res, summary, 'Content summary loaded');
    } catch (error) {
      next(error);
    }
  }

  static async exportAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const csvText = await AdminService.exportAuditLogsCsv(req.query);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="audit-log.csv"');
      return res.send('\uFEFF' + csvText);
    } catch (error) {
      next(error);
    }
  }

  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AdminService.getAuditLogs(req.query);
      return ApiResponse.success(res, result, 'Audit logs loaded');
    } catch (error) {
      next(error);
    }
  }

  static async getAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const announcements = await AdminService.getAnnouncements();
      return ApiResponse.success(res, announcements, 'Announcements loaded');
    } catch (error) {
      next(error);
    }
  }

  static async createAnnouncement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const announcement = await AdminService.createAnnouncement(req.body);
      return ApiResponse.success(res, announcement, 'Announcement created', 201);
    } catch (error) {
      next(error);
    }
  }

  // 7. Full 12-Step Provisioning Engine
  static async provisionInstitution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ProvisioningService.provisionInstitution(req.body, req.user?.userId);
      return ApiResponse.success(res, result, 'Institution fully provisioned and activated', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getProvisioningHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 20;
      const history = await ProvisioningService.getProvisioningHistory(limit);
      return ApiResponse.success(res, history, 'Provisioning jobs history loaded');
    } catch (error) {
      next(error);
    }
  }

  static async getProvisioningJobStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const job = await ProvisioningService.getJobStatus(req.params.jobCode);
      if (!job) {
        return ApiResponse.error(res, 'Provisioning job not found', 404, 'NOT_FOUND');
      }
      return ApiResponse.success(res, job, 'Provisioning job status loaded');
    } catch (error) {
      next(error);
    }
  }

  // 8. Registration Requests Management
  static async getRegistrationRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RegistrationService.listRequests(req.query);
      return ApiResponse.success(res, result, 'Registration requests retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getRegistrationRequestDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const details = await RegistrationService.getRequestById(req.params.id);
      return ApiResponse.success(res, details, 'Registration request details loaded');
    } catch (error) {
      next(error);
    }
  }

  static async updateRegistrationRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await RegistrationService.updateRequest(
        req.params.id,
        req.body,
        req.user?.userId
      );
      return ApiResponse.success(res, updated, 'Registration request updated successfully', 200);
    } catch (error) {
      next(error);
    }
  }

  static async approveRegistrationRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await RegistrationService.approveAndProvision(
        req.params.id,
        req.body,
        req.user?.userId
      );
      return ApiResponse.success(res, result, 'Registration request approved and institution provisioned', 200);
    } catch (error) {
      next(error);
    }
  }

  static async rejectRegistrationRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { reason } = req.body;
      if (!reason) {
        return ApiResponse.error(res, 'Rejection reason is required', 400, 'REASON_REQUIRED');
      }
      const updated = await RegistrationService.rejectRequest(req.params.id, reason, req.user?.userId);
      return ApiResponse.success(res, updated, 'Registration request rejected');
    } catch (error) {
      next(error);
    }
  }

  static async requestMoreInfoForRegistration(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { notes } = req.body;
      if (!notes) {
        return ApiResponse.error(res, 'Information clarification notes are required', 400, 'NOTES_REQUIRED');
      }
      const updated = await RegistrationService.requestMoreInfo(req.params.id, notes, req.user?.userId);
      return ApiResponse.success(res, updated, 'More information requested from applicant');
    } catch (error) {
      next(error);
    }
  }
}

