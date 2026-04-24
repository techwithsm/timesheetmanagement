import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { ReportsService } from './reports.service';
import { successResponse } from '../../utils/response.util';

const service = new ReportsService();

/**
 * @openapi
 * /reports/student/{studentId}:
 *   get:
 *     tags: [Reports]
 *     summary: Get monthly attendance JSON report for a student
 */
export async function getStudentReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const report = await service.getStudentAttendanceReport(req.params.studentId, year, month);
    return successResponse(res, report);
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /reports/student/{studentId}/pdf:
 *   get:
 *     tags: [Reports]
 *     summary: Download monthly attendance PDF report for a student
 */
export async function downloadStudentPDF(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    await service.exportStudentReportToPDF(req.params.studentId, year, month, res);
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /reports/class/{classId}:
 *   get:
 *     tags: [Reports]
 *     summary: Get monthly attendance JSON report for an entire class
 */
export async function getClassReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const report = await service.getClassAttendanceReport(req.params.classId, year, month);
    return successResponse(res, report);
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /reports/class/{classId}/excel:
 *   get:
 *     tags: [Reports]
 *     summary: Download monthly attendance Excel report for a class
 */
export async function downloadClassExcel(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    await service.exportClassReportToExcel(req.params.classId, year, month, res);
  } catch (err) {
    next(err);
  }
}
