import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { HolidaysService } from './holidays.service';
import { successResponse, paginatedResponse } from '../../utils/response.util';
import { HTTP_STATUS } from '../../config/constants';

const service = new HolidaysService();

export async function createHoliday(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const holiday = await service.createHoliday({ ...req.body, schoolId: req.user!.schoolId });
    return successResponse(res, holiday, 'Holiday created', HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
}

export async function getHolidays(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.getHolidays(req.query as Record<string, string>, req);
    return paginatedResponse(res, result, 'Holidays fetched');
  } catch (err) {
    next(err);
  }
}

export async function getHolidayById(req: Request, res: Response, next: NextFunction) {
  try {
    const holiday = await service.getHolidayById(req.params.id);
    return successResponse(res, holiday);
  } catch (err) {
    next(err);
  }
}

export async function updateHoliday(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const holiday = await service.updateHoliday(req.params.id, req.body);
    return successResponse(res, holiday, 'Holiday updated');
  } catch (err) {
    next(err);
  }
}

export async function deleteHoliday(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.deleteHoliday(req.params.id);
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
}

export async function getUpcomingHolidays(req: Request, res: Response, next: NextFunction) {
  try {
    const { schoolId } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    const holidays = await service.getUpcomingHolidays(schoolId, days);
    return successResponse(res, holidays);
  } catch (err) {
    next(err);
  }
}
