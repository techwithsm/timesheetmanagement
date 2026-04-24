import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { reportRateLimiter } from '../../middleware/rateLimiter.middleware';
import {
  getStudentReport,
  downloadStudentPDF,
  getClassReport,
  downloadClassExcel,
} from './reports.controller';

const router = Router();

router.use(authenticate);
router.use(reportRateLimiter);

router.get('/student/:studentId', getStudentReport);
router.get('/student/:studentId/pdf', downloadStudentPDF);

router.get('/class/:classId', getClassReport);
router.get('/class/:classId/excel', downloadClassExcel);

export default router;
