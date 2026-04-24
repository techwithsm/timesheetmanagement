import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../config/jwt';
import { HTTP_STATUS } from '../config/constants';
import { AppError } from './errorHandler.middleware';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Access token required', HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid or expired token', HTTP_STATUS.UNAUTHORIZED));
    }
  }
}

export function optionalAuthenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      req.user = verifyAccessToken(token);
    }
  } catch {
    // Token invalid but optional — continue without user
  }
  next();
}
