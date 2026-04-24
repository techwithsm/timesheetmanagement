import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { HTTP_STATUS } from '../config/constants';
import { AppError } from './errorHandler.middleware';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT' | 'VIEWER';

const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  TEACHER: 3,
  VIEWER: 2,
  PARENT: 1,
};

export function authorize(...allowedRoles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED));
    }

    const userRole = req.user.role as Role;
    if (!allowedRoles.includes(userRole)) {
      return next(
        new AppError('Insufficient permissions for this action', HTTP_STATUS.FORBIDDEN)
      );
    }
    next();
  };
}

export function authorizeMinRole(minRole: Role) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED));
    }

    const userLevel = ROLE_HIERARCHY[req.user.role as Role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minRole];

    if (userLevel < requiredLevel) {
      return next(
        new AppError('Insufficient permissions for this action', HTTP_STATUS.FORBIDDEN)
      );
    }
    next();
  };
}

export function authorizeSchool(req: AuthRequest, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED));
  }

  // SUPER_ADMIN can access all schools
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  const schoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;
  if (schoolId && schoolId !== req.user.schoolId) {
    return next(new AppError('Access denied to this school', HTTP_STATUS.FORBIDDEN));
  }
  next();
}
