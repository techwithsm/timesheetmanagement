import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler.middleware';
import { HTTP_STATUS } from '../../config/constants';
import { buildPagination } from '../../utils/response.util';
import { getPaginationParams } from '../../utils/pagination.util';
import { CreateNotificationDto, NotificationFilters } from './notifications.types';
import { Request } from 'express';

export class NotificationsService {
  async createNotification(dto: CreateNotificationDto) {
    return prisma.notification.create({ data: dto });
  }

  async getUserNotifications(userId: string, filters: NotificationFilters, req: Request) {
    const { page, limit, skip } = getPaginationParams(req);

    const where: Record<string, unknown> = { userId };
    if (filters.isRead !== undefined) where.isRead = filters.isRead === 'true';
    if (filters.type) where.type = filters.type;

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    return { data, pagination: buildPagination(page, limit, total) };
  }

  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
    if (notification.userId !== userId) {
      throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
    }
    return prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteNotification(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification) throw new AppError('Notification not found', HTTP_STATUS.NOT_FOUND);
    if (notification.userId !== userId) {
      throw new AppError('Access denied', HTTP_STATUS.FORBIDDEN);
    }
    await prisma.notification.delete({ where: { id } });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }
}
