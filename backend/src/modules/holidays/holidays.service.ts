import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { HTTP_STATUS } from '../../config/constants';
import { buildPagination } from '../../utils/response.util';
import { getPaginationParams } from '../../utils/pagination.util';
import { CreateHolidayDto, UpdateHolidayDto, HolidayFilters } from './holidays.types';
import { Request } from 'express';

export class HolidaysService {
  async createHoliday(dto: CreateHolidayDto) {
    const school = await prisma.school.findUnique({ where: { id: dto.schoolId } });
    if (!school) throw new AppError('School not found', HTTP_STATUS.NOT_FOUND);

    return prisma.holiday.create({
      data: {
        schoolId: dto.schoolId,
        name: dto.name,
        date: new Date(dto.date),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        type: dto.type,
        isRecurring: dto.isRecurring ?? false,
        description: dto.description,
      },
    });
  }

  async getHolidays(filters: HolidayFilters, req: Request) {
    const { page, limit, skip } = getPaginationParams(req);

    const where: Record<string, unknown> = {};
    if (filters.schoolId) where.schoolId = filters.schoolId;
    if (filters.type) where.type = filters.type;

    if (filters.year) {
      const year = parseInt(filters.year);
      where.date = { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) };
    } else if (filters.startDate || filters.endDate) {
      where.date = {
        ...(filters.startDate && { gte: new Date(filters.startDate) }),
        ...(filters.endDate && { lte: new Date(filters.endDate) }),
      };
    }

    const [data, total] = await Promise.all([
      prisma.holiday.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'asc' },
        include: { school: { select: { id: true, name: true } } },
      }),
      prisma.holiday.count({ where }),
    ]);

    return { data, pagination: buildPagination(page, limit, total) };
  }

  async getHolidayById(id: string) {
    const holiday = await prisma.holiday.findUnique({
      where: { id },
      include: { school: { select: { id: true, name: true } } },
    });
    if (!holiday) throw new AppError('Holiday not found', HTTP_STATUS.NOT_FOUND);
    return holiday;
  }

  async updateHoliday(id: string, dto: UpdateHolidayDto) {
    const holiday = await prisma.holiday.findUnique({ where: { id } });
    if (!holiday) throw new AppError('Holiday not found', HTTP_STATUS.NOT_FOUND);

    return prisma.holiday.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.endDate !== undefined && { endDate: dto.endDate ? new Date(dto.endDate) : null }),
        ...(dto.type && { type: dto.type }),
        ...(dto.isRecurring !== undefined && { isRecurring: dto.isRecurring }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  async deleteHoliday(id: string) {
    const holiday = await prisma.holiday.findUnique({ where: { id } });
    if (!holiday) throw new AppError('Holiday not found', HTTP_STATUS.NOT_FOUND);
    await prisma.holiday.delete({ where: { id } });
  }

  async checkIsHoliday(schoolId: string, date: string): Promise<boolean> {
    const holiday = await prisma.holiday.findFirst({
      where: {
        schoolId,
        date: new Date(date),
      },
    });
    return !!holiday;
  }

  async getUpcomingHolidays(schoolId: string, days = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return prisma.holiday.findMany({
      where: {
        schoolId,
        date: { gte: today, lte: futureDate },
      },
      orderBy: { date: 'asc' },
    });
  }
}
