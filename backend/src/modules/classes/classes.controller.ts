import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { successResponse, paginatedResponse } from '../../utils/response.util';
import { AppError } from '../../middleware/errorHandler.middleware';
import { HTTP_STATUS } from '../../config/constants';
import * as classesService from './classes.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const result = await classesService.listClasses(req, req.user.schoolId);
    paginatedResponse(res, result);
  } catch (e) { next(e); }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const cls = await classesService.getClassById(req.params.id, req.user.schoolId);
    successResponse(res, cls);
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const cls = await classesService.createClass({ ...req.body, schoolId: req.user.schoolId });
    successResponse(res, cls, 'Class created', HTTP_STATUS.CREATED);
  } catch (e) { next(e); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const cls = await classesService.updateClass(req.params.id, req.user.schoolId, req.body);
    successResponse(res, cls, 'Class updated');
  } catch (e) { next(e); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    await classesService.deleteClass(req.params.id, req.user.schoolId);
    successResponse(res, null, 'Class deleted');
  } catch (e) { next(e); }
}

export async function getStudents(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const students = await classesService.getClassStudents(req.params.id, req.user.schoolId);
    successResponse(res, students);
  } catch (e) { next(e); }
}

export async function getAttendance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const date = req.query.date as string || new Date().toISOString().split('T')[0];
    const records = await classesService.getClassAttendanceByDate(req.params.id, req.user.schoolId, date);
    successResponse(res, records);
  } catch (e) { next(e); }
}
