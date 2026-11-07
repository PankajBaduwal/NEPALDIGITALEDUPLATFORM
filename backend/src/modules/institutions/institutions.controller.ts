import { Request, Response, NextFunction } from 'express';
import { InstitutionsService } from './institutions.service';
import { ApiResponse } from '../../common/utils/response.util';
import csv from 'csv-parser';
import { Readable } from 'stream';

export class InstitutionsController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InstitutionsService.createInstitution(req.body);
      return ApiResponse.success(res, result, 'Institution registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async bulkImport(req: Request, res: Response, next: NextFunction) {
    try {
      let records: any[] = [];

      // Support either JSON array in body OR uploaded file
      if (Array.isArray(req.body.institutions)) {
        records = req.body.institutions;
      } else if (req.file) {
        // Parse CSV buffer
        const stream = Readable.from(req.file.buffer.toString());
        records = await new Promise((resolve, reject) => {
          const list: any[] = [];
          stream
            .pipe(csv())
            .on('data', (data) => list.push(data))
            .on('end', () => resolve(list))
            .on('error', (err) => reject(err));
        });
      } else if (Array.isArray(req.body)) {
        records = req.body;
      } else {
        return ApiResponse.error(res, 'Invalid bulk import payload. Expected JSON array or CSV upload', 400, 'INVALID_PAYLOAD');
      }

      const report = await InstitutionsService.bulkImport(records);
      return ApiResponse.success(res, report, `Bulk onboarding finished: ${report.successCount} succeeded, ${report.failedCount} failed`);
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InstitutionsService.listInstitutions(req.query);
      return ApiResponse.success(res, result, 'Institutions list retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const institution = await InstitutionsService.getInstitutionById(req.params.id);
      return ApiResponse.success(res, institution, 'Institution details retrieved');
    } catch (error) {
      next(error);
    }
  }
}

