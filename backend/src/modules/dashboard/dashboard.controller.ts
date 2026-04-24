import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { DashboardService } from './dashboard.service';
import { successResponse } from '../../utils/response.util';
import { AppError } from '../../middleware/errorHandler.middleware';
import { HTTP_STATUS } from '../../config/constants';

const service = new DashboardService();

export async function getSchoolOverview(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError('School ID is required', HTTP_STATUS.BAD_REQUEST);
    const overview = await service.getSchoolOverview(schoolId);
    return successResponse(res, overview);
  } catch (err) { next(err); }
}

export async function getClassSummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError('School ID is required', HTTP_STATUS.BAD_REQUEST);
    const summary = await service.getClassSummary(schoolId);
    return successResponse(res, summary);
  } catch (err) { next(err); }
}

export async function getAttendanceTrend(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError('School ID is required', HTTP_STATUS.BAD_REQUEST);
    const months = parseInt(req.query.months as string) || 6;
    const trend = await service.getAttendanceTrend(schoolId, months);
    return successResponse(res, trend);
  } catch (err) { next(err); }
}

export async function getAtRiskStudents(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) throw new AppError('School ID is required', HTTP_STATUS.BAD_REQUEST);
    const threshold = parseFloat(req.query.threshold as string) || undefined;
    const students = await service.getAtRiskStudents(schoolId, threshold);
    return successResponse(res, students);
  } catch (err) { next(err); }
}
