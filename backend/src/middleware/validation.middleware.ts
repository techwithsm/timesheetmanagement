import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError } from './errorHandler.middleware';

export function validate(validations: ValidationChain[]) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await Promise.all(validations.map((v) => v.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map((err) => ({
        field: err.type === 'field' ? err.path : 'general',
        message: err.msg,
      }));
      return next(new ValidationError(formattedErrors));
    }
    next();
  };
}
