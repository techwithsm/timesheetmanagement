import { body, param, query } from 'express-validator';

export const bulkAttendanceValidators = [
  body('classId').notEmpty().withMessage('Class ID is required'),
  body('date').isISO8601().withMessage('Valid date (YYYY-MM-DD) is required'),
  body('entries').isArray({ min: 1 }).withMessage('At least one attendance entry is required'),
  body('entries.*.studentId').notEmpty().withMessage('Student ID is required for each entry'),
  body('entries.*.status')
    .isIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'HALF_DAY'])
    .withMessage('Invalid attendance status'),
  body('entries.*.lateMinutes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Late minutes must be a non-negative integer'),
];

export const updateAttendanceValidators = [
  param('id').notEmpty().withMessage('Attendance ID is required'),
  body('status')
    .optional()
    .isIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'HALF_DAY'])
    .withMessage('Invalid attendance status'),
  body('note').optional().isString().withMessage('Note must be a string'),
  body('lateMinutes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Late minutes must be a non-negative integer'),
];

export const attendanceQueryValidators = [
  query('classId').optional().isString(),
  query('studentId').optional().isString(),
  query('status')
    .optional()
    .isIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'HALF_DAY'])
    .withMessage('Invalid status filter'),
  query('date').optional().isISO8601().withMessage('Invalid date (use YYYY-MM-DD)'),
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
];
