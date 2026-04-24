import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { authRateLimiter } from '../../middleware/rateLimiter.middleware';
import * as controller from './auth.controller';
import {
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  changePasswordValidators,
} from './auth.validators';

const router = Router();

router.post('/login', authRateLimiter, validate(loginValidators), controller.login);
router.post('/logout', authenticate, controller.logout);
router.post('/refresh', controller.refresh);
router.post('/forgot-password', validate(forgotPasswordValidators), controller.forgotPassword);
router.post('/reset-password', validate(resetPasswordValidators), controller.resetPassword);
router.put('/change-password', authenticate, validate(changePasswordValidators), controller.changePassword);
router.get('/me', authenticate, controller.getMe);

export default router;
