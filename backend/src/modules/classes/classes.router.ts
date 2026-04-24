import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { authorize } from '../../middleware/rbac.middleware';
import * as controller from './classes.controller';

const router = Router();
router.use(authenticate);

router.get('/', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'VIEWER'), controller.list);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), controller.create);
router.get('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'VIEWER'), controller.getById);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), controller.update);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), controller.remove);
router.get('/:id/students', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), controller.getStudents);
router.get('/:id/attendance', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), controller.getAttendance);

export default router;
