import { AuditLog } from '../../models';

export class AuditService {
  static async log(data: {
    operatorId?: string;
    userId?: string;
    userEmail?: string | null;
    operatorRole?: string;
    userRole?: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    details?: any;
    ipAddress?: string | null;
  }) {
    try {
      const opId = data.operatorId || data.userId || 'system';
      const opRole = data.operatorRole || data.userRole || 'SUPER_ADMIN';
      return await AuditLog.create({
        operatorId: opId,
        operatorRole: opRole,
        action: data.action,
        targetEntity: data.entityType,
        targetId: data.entityId || undefined,
        details: data.details || {},
        ipAddress: data.ipAddress || undefined,
      });
    } catch (e) {
      console.error('Failed to write audit log to MongoDB:', e);
    }
  }
}
