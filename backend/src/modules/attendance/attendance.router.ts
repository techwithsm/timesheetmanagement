import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validation.middleware';
import {
  bulkMarkAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
  deleteAttendance,
  getStudentSummary,
  getClassAttendanceForDate,
} from './attendance.controller';
import {
  bulkAttendanceValidators,
  updateAttendanceValidators,
  attendanceQueryValidators,
} from './attendance.validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post(
  '/bulk',
  authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
  validate(bulkAttendanceValidators),
  bulkMarkAttendance
);

router.get('/', validate(attendanceQueryValidators), getAttendance);

router.get('/student/:studentId/summary', getStudentSummary);

router.get('/class/:classId/date/:date', getClassAttendanceForDate);

router.get('/:id', getAttendanceById);

router.patch(
  '/:id',
  authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'),
  validate(updateAttendanceValidators),
  updateAttendance
);

router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), deleteAttendance);

export default router;
