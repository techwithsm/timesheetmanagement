import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { AttendanceService } from './attendance.service';
import { successResponse, paginatedResponse } from '../../utils/response.util';
import { HTTP_STATUS } from '../../config/constants';
import { BulkAttendancePayload } from './attendance.types';

const service = new AttendanceService();

/**
 * @openapi
 * /attendance/bulk:
 *   post:
 *     tags: [Attendance]
 *     summary: Mark attendance for an entire class in bulk
 */
export async function bulkMarkAttendance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.bulkMarkAttendance(
      req.body as BulkAttendancePayload,
      req.user!.userId
    );
    return successResponse(res, result, 'Attendance marked successfully', HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /attendance:
 *   get:
 *     tags: [Attendance]
 *     summary: List attendance records with filters
 */
export async function getAttendance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.getAttendance(req.query as Record<string, string>, req);
    return paginatedResponse(res, result, 'Attendance fetched');
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /attendance/{id}:
 *   get:
 *     tags: [Attendance]
 *     summary: Get a single attendance record by ID
 */
export async function getAttendanceById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const record = await service.getAttendanceById(req.params.id);
    return successResponse(res, record);
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /attendance/{id}:
 *   patch:
 *     tags: [Attendance]
 *     summary: Update a single attendance record
 */
export async function updateAttendance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const record = await service.updateAttendance(req.params.id, req.body);
    return successResponse(res, record, 'Attendance updated');
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /attendance/{id}:
 *   delete:
 *     tags: [Attendance]
 *     summary: Delete an attendance record
 */
export async function deleteAttendance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.deleteAttendance(req.params.id);
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /attendance/student/{studentId}/summary:
 *   get:
 *     tags: [Attendance]
 *     summary: Get monthly attendance summary for a student
 */
export async function getStudentSummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { studentId } = req.params;
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const month = parseInt(req.query.month as string) || new Date().getMonth() + 1;
    const summary = await service.getStudentSummary(studentId, year, month);
    return successResponse(res, summary);
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /attendance/class/{classId}/date/{date}:
 *   get:
 *     tags: [Attendance]
 *     summary: Get all attendance records for a class on a specific date
 */
export async function getClassAttendanceForDate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { classId, date } = req.params;
    const result = await service.getClassAttendanceForDate(classId, date);
    return successResponse(res, result);
  } catch (err) {
    next(err);
  }
}
