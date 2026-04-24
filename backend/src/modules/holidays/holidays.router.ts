import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  createHoliday,
  getHolidays,
  getHolidayById,
  updateHoliday,
  deleteHoliday,
  getUpcomingHolidays,
} from './holidays.controller';
import {
  createHolidayValidators,
  updateHolidayValidators,
  holidayQueryValidators,
} from './holidays.validators';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize('SUPER_ADMIN', 'ADMIN'),
  validate(createHolidayValidators),
  createHoliday
);

router.get('/', validate(holidayQueryValidators), getHolidays);

router.get('/upcoming/:schoolId', getUpcomingHolidays);

router.get('/:id', getHolidayById);

router.patch(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN'),
  validate(updateHolidayValidators),
  updateHoliday
);

router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteHoliday);

export default router;
