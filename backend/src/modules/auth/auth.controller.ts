import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { RegistrationService } from '../admin/registration.service';
import { ApiResponse } from '../../common/utils/response.util';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { Institution } from '../../models/Institution';
import { TwoFactorService } from './twofactor.service';

export class AuthController {
  static async verifyTwoFactor(req: Request, res: Response, next: NextFunction) {
    try {
      const { challengeToken, code } = req.body || {};
      if (!challengeToken || !code) return ApiResponse.error(res, 'A sign-in token and a code are required', 400, 'MISSING_FIELDS');
      return ApiResponse.success(res, await AuthService.loginWithTwoFactor(String(challengeToken), String(code)), 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async twoFactorStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      return ApiResponse.success(res, await TwoFactorService.status(req.user!.userId), 'Two-factor status loaded');
    } catch (error) {
      next(error);
    }
  }

  static async twoFactorSetup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      return ApiResponse.success(res, await TwoFactorService.setup(req.user!.userId), 'Scan the QR code with an authenticator app');
    } catch (error) {
      next(error);
    }
  }

  static async twoFactorEnable(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      return ApiResponse.success(res, await TwoFactorService.enable(req.user!.userId, String(req.body?.code || '')), 'Two-factor sign-in is on');
    } catch (error) {
      next(error);
    }
  }

  static async twoFactorDisable(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      return ApiResponse.success(res, await TwoFactorService.disable(req.user!.userId, String(req.body?.code || '')), 'Two-factor sign-in is off');
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const username = req.body.username || req.body.identifier;
      const { password } = req.body;
      if (!username || !password) {
        return ApiResponse.error(res, 'Username and password are required', 400, 'MISSING_FIELDS');
      }

      const result = await AuthService.login(username, password);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (error: any) {
      console.log('❌ [AuthController.login] Login failed for username:', req.body?.username || req.body?.identifier, 'error:', error?.message || error);
      next(error);
    }
  }

  static async getPreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      return ApiResponse.success(res, await AuthService.getPreferences(req.user!.userId), 'Preferences loaded');
    } catch (error) {
      next(error);
    }
  }

  static async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      return ApiResponse.success(res, await AuthService.updatePreferences(req.user!.userId, req.body || {}), 'Preferences saved');
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        return ApiResponse.error(res, 'Unauthorized', 401, 'AUTH_REQUIRED');
      }

      const me = await AuthService.getMe(req.user.userId);
      return ApiResponse.success(res, me, 'User identity loaded');
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      let token = '';
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      } else if (req.body?.token) {
        token = req.body.token;
      }

      if (!token) {
        return ApiResponse.error(res, 'Token required for refresh', 400, 'TOKEN_REQUIRED');
      }

      const result = await AuthService.refreshToken(token);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSmartboardSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { subjectId, sectionId } = req.body;
      if (!subjectId) {
        return ApiResponse.error(res, 'Subject ID is required', 400, 'MISSING_SUBJECT');
      }

      const session = await AuthService.generateSmartboardSession(req.user!.userId, subjectId, sectionId);
      return ApiResponse.success(res, session, 'Smart Board session established');
    } catch (error) {
      next(error);
    }
  }

  static async demoLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.body;
      if (!role) {
        return ApiResponse.error(res, 'Role is required for demo login', 400, 'ROLE_REQUIRED');
      }

      const result = await AuthService.demoLogin(role);
      return ApiResponse.success(res, result, `Demo session initiated for ${role}`);
    } catch (error) {
      next(error);
    }
  }

  static async registerInstitution(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RegistrationService.submitPublicRegistration(req.body);
      return ApiResponse.success(res, result, 'Institution registration received successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getInstitutionRegistrationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await RegistrationService.getPublicStatus(req.params.code);
      return ApiResponse.success(res, result, 'Application status loaded');
    } catch (error) {
      next(error);
    }
  }

  static async getRegistrationRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as string;
      const list = await AuthService.getRegistrationRequests(status);
      return ApiResponse.success(res, list, 'Registration requests retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async reviewRegistrationRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
        return ApiResponse.error(res, 'Valid status (APPROVED or REJECTED) required', 400, 'INVALID_STATUS');
      }

      const updated = await AuthService.reviewRegistrationRequest(id, status, req.user?.userId, reason);
      return ApiResponse.success(res, updated, `Registration request ${status.toLowerCase()}`);
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier } = req.body;
      if (!identifier) {
        return ApiResponse.error(res, 'Username or email required', 400, 'IDENTIFIER_REQUIRED');
      }

      const result = await AuthService.forgotPassword(identifier);
      return ApiResponse.success(res, result, 'Password reset request processed');
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return ApiResponse.error(res, 'Token and new password are required', 400, 'MISSING_FIELDS');
      }

      const result = await AuthService.resetPassword(token, newPassword);
      return ApiResponse.success(res, result, 'Password reset successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getPublicInstitutions(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await Institution.find({ status: { $in: ['ACTIVE', 'PROVISIONED'] } })
        .select('id emisCode name nameNepali province district localLevel type status logoUrl mediumOfInstruction')
        .sort({ name: 1 })
        .lean();
      return ApiResponse.success(res, list, 'Public institutions retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return ApiResponse.error(res, 'Current password and new password are required', 400, 'MISSING_FIELDS');
      }

      const result = await AuthService.changePassword(req.user!.userId, currentPassword, newPassword);
      return ApiResponse.success(res, result, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.updateProfile(req.user!.userId, req.body);
      return ApiResponse.success(res, result, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

