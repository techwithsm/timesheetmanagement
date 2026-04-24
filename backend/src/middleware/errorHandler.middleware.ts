import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { HTTP_STATUS } from '../config/constants';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public errors: Record<string, string>[];

  constructor(errors: Record<string, string>[]) {
    super('Validation failed', HTTP_STATUS.BAD_REQUEST);
    this.errors = errors;
  }
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, HTTP_STATUS.NOT_FOUND));
}

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn(`Operational error: ${err.message}`, {
      path: req.path,
      method: req.method,
      statusCode: err.statusCode,
    });

    if (err instanceof ValidationError) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
        errors: err.errors,
      });
      return;
    }

    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Prisma errors
  if ((err as NodeJS.ErrnoException).code === 'P2002') {
    res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'A record with this data already exists',
    });
    return;
  }

  if ((err as NodeJS.ErrnoException).code === 'P2025') {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'Record not found',
    });
    return;
  }

  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(HTTP_STATUS.INTERNAL_ERROR).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
