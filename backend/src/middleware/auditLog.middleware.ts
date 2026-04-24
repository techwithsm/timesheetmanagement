import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

interface AuditOptions {
  action: string;
  entity: string;
  getEntityId?: (req: AuthRequest) => string;
}

export function auditLog(options: AuditOptions) {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (req.user) {
      try {
        const entityId = options.getEntityId
          ? options.getEntityId(req)
          : (req.params.id ?? '');

        await prisma.auditLog.create({
          data: {
            userId: req.user.userId,
            action: options.action,
            entity: options.entity,
            entityId: entityId || null,
            newValue: req.body ? JSON.stringify(req.body) : null,
            ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
          },
        });
      } catch (error) {
        logger.error('Failed to write audit log:', error);
      }
    }
    next();
  };
}
