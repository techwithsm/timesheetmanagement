import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import {
  getSchoolOverview,
  getClassSummary,
  getAttendanceTrend,
  getAtRiskStudents,
} from './dashboard.controller';

const router = Router();

router.use(authenticate);

router.get('/overview', getSchoolOverview);
router.get('/class-summary', getClassSummary);
router.get('/trend', getAttendanceTrend);
router.get('/at-risk', getAtRiskStudents);

export default router;
