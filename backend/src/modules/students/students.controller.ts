import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { successResponse, paginatedResponse } from '../../utils/response.util';
import { AppError } from '../../middleware/errorHandler.middleware';
import { HTTP_STATUS } from '../../config/constants';
import * as studentsService from './students.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const result = await studentsService.listStudents(req, req.user.schoolId);
    paginatedResponse(res, result, 'Students retrieved');
  } catch (e) { next(e); }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const student = await studentsService.getStudentById(req.params.id, req.user.schoolId);
    successResponse(res, student);
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const student = await studentsService.createStudent({
      ...req.body,
      schoolId: req.user.schoolId, // always use the authenticated user's school
    });
    successResponse(res, student, 'Student created', HTTP_STATUS.CREATED);
  } catch (e) { next(e); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const student = await studentsService.updateStudent(req.params.id, req.user.schoolId, req.body);
    successResponse(res, student, 'Student updated');
  } catch (e) { next(e); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    await studentsService.deleteStudent(req.params.id, req.user.schoolId);
    successResponse(res, null, 'Student deactivated');
  } catch (e) { next(e); }
}

export async function getAttendanceHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const result = await studentsService.getStudentAttendanceHistory(req.params.id, req.user.schoolId, req);
    paginatedResponse(res, result, 'Attendance history retrieved');
  } catch (e) { next(e); }
}
