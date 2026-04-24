import { body, query } from 'express-validator';

export const createStudentValidators = [
  body('firstName').trim().notEmpty().withMessage('First name required'),
  body('lastName').trim().notEmpty().withMessage('Last name required'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth required'),
  body('gender').isIn(['MALE', 'FEMALE', 'OTHER']).withMessage('Invalid gender'),
  body('classId').notEmpty().withMessage('Class ID required'),
  body('schoolId').optional().isString(), // injected from JWT in controller
];

export const listStudentValidators = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];
