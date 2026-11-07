import { Request, Response, NextFunction } from 'express';
import { TokenUtil, TokenPayload } from '../utils/token.util';
import { ApiResponse } from '../utils/response.util';
import { User } from '../../models';
import { AuditService } from '../services/audit.service';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  institutionId?: string;
}

const QUERY_TOKEN_PATHS = /^\/api(\/v1)?\/(smartboard\/|curriculum\/textbooks\/[^/]+\/pdf|academic-materials\/[^/]+\/file|assignments\/files\/|analytics\/export\/)/;

// "Last seen" is stored at most once every 10 minutes per user, so it costs almost nothing
const seen = new Map<string, number>();
function touchLastSeen(userId: string) {
  const now = Date.now();
  if (now - (seen.get(userId) || 0) < 10 * 60_000) return;
  seen.set(userId, now);
  if (seen.size > 5000) seen.clear();
  User.updateOne({ _id: userId }, { $set: { lastSeenAt: new Date(now) } }).catch(() => {});
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    let token = '';

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.query.token && req.method === 'GET' && QUERY_TOKEN_PATHS.test(req.originalUrl.split('?')[0])) {
      // Only file-style GET routes (downloads, embedded PDF viewers, the external Smart Board client) may carry
      // a token in the URL, because those cannot send headers. Tokens in URLs end up in logs, so no other route.

      token = String(req.query.token).trim();
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return ApiResponse.error(res, 'Authentication token required', 401, 'AUTH_REQUIRED');
    }

    const decoded = TokenUtil.verify(token);
    req.user = decoded;
    if (decoded.institutionId) {
      req.institutionId = decoded.institutionId;
    }

    if (decoded.impersonatedBy) {
      // A Super Admin "viewing as" someone can look around and work, but cannot change credentials or security
      // settings, and every change is written to the audit log under the Super Admin's name.
      const path = req.originalUrl.split('?')[0];
      const writes = !['GET', 'HEAD', 'OPTIONS'].includes(req.method);
      if (writes && /^\/api(\/v1)?\/auth\/(change-password|2fa|profile|preferences)/.test(path)) {
        return ApiResponse.error(res, 'This action is not available while viewing as another user.', 403, 'IMPERSONATION_RESTRICTED');
      }
      if (writes) {
        res.on('finish', () => {
          AuditService.log({
            operatorId: decoded.impersonatedBy,
            operatorRole: 'SUPER_ADMIN',
            action: 'IMPERSONATED_ACTION',
            entityType: 'User',
            entityId: decoded.userId,
            details: { viewingAs: decoded.username, role: decoded.role, method: req.method, path, status: res.statusCode },
          });
        });
      }
    } else {
      touchLastSeen(decoded.userId);
    }

    next();
  } catch (error: any) {
    return ApiResponse.error(res, 'Invalid or expired session token', 401, 'INVALID_TOKEN');
  }
}

