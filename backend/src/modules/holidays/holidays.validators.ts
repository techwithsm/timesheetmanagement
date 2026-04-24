import { body, param, query } from 'express-validator';

const HOLIDAY_TYPES = ['PUBLIC', 'SCHOOL', 'SUMMER_BREAK', 'WINTER_BREAK', 'SPRING_BREAK', 'EXAM_PERIOD', 'CUSTOM'];

export const createHolidayValidators = [
  body('schoolId').optional().isString(), // injected from JWT in controller
  body('name').notEmpty().trim().withMessage('Holiday name is required'),
  body('date').isISO8601().withMessage('Valid date (YYYY-MM-DD) is required'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('type').isIn(HOLIDAY_TYPES).withMessage('Invalid holiday type'),
  body('isRecurring').optional().isBoolean().withMessage('isRecurring must be boolean'),
  body('description').optional().isString(),
];

export const updateHolidayValidators = [
  param('id').notEmpty().withMessage('Holiday ID is required'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('date').optional().isISO8601().withMessage('Invalid date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('type').optional().isIn(HOLIDAY_TYPES).withMessage('Invalid holiday type'),
  body('isRecurring').optional().isBoolean(),
  body('description').optional().isString(),
];

export const holidayQueryValidators = [
  query('schoolId').optional().isString(),
  query('type').optional().isIn(HOLIDAY_TYPES).withMessage('Invalid type filter'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('year').optional().isInt({ min: 2000, max: 2100 }).withMessage('Year must be 2000-2100'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];
