import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { successResponse, paginatedResponse } from '../../utils/response.util';
import { AppError } from '../../middleware/errorHandler.middleware';
import { HTTP_STATUS } from '../../config/constants';
import * as teachersService from './teachers.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const result = await teachersService.listTeachers(req, req.user.schoolId);
    paginatedResponse(res, result);
  } catch (e) { next(e); }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const teacher = await teachersService.getTeacherById(req.params.id, req.user.schoolId);
    successResponse(res, teacher);
  } catch (e) { next(e); }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const teacher = await teachersService.createTeacher({ ...req.body, schoolId: req.user.schoolId });
    successResponse(res, teacher, 'Teacher created', HTTP_STATUS.CREATED);
  } catch (e) { next(e); }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const teacher = await teachersService.updateTeacher(req.params.id, req.user.schoolId, req.body);
    successResponse(res, teacher, 'Teacher updated');
  } catch (e) { next(e); }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    await teachersService.deleteTeacher(req.params.id, req.user.schoolId);
    successResponse(res, null, 'Teacher deactivated');
  } catch (e) { next(e); }
}

export async function getClasses(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user?.schoolId) throw new AppError('School context required', HTTP_STATUS.BAD_REQUEST);
    const classes = await teachersService.getTeacherClasses(req.params.id, req.user.schoolId);
    successResponse(res, classes);
  } catch (e) { next(e); }
}
