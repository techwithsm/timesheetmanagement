import { body } from 'express-validator';

export const loginValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
];

export const forgotPasswordValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
];

export const resetPasswordValidators = [
  body('token').notEmpty().withMessage('Token required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be 8+ chars with uppercase, lowercase, and number'),
];

export const changePasswordValidators = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must be 8+ chars with uppercase, lowercase, and number'),
];
