import { body, query } from 'express-validator';

export const createClassValidators = [
  body('name').trim().notEmpty().withMessage('Class name required'),
  body('grade').trim().notEmpty().withMessage('Grade required'),
  body('section').trim().notEmpty().withMessage('Section required'),
  body('academicYear').trim().notEmpty().withMessage('Academic year required'),
  body('schoolId').optional().isString(), // injected from JWT in controller
  body('capacity').optional().isInt({ min: 1, max: 200 }),
  body('teacherId').optional().isString(),
];

export const listClassValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];
