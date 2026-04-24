import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createStudentValidators, listStudentValidators } from './students.validators';
import * as controller from './students.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'VIEWER'), validate(listStudentValidators), controller.list);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), validate(createStudentValidators), controller.create);
router.get('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'VIEWER', 'PARENT'), controller.getById);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), controller.update);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), controller.remove);
router.get('/:id/attendance', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PARENT'), controller.getAttendanceHistory);

export default router;
