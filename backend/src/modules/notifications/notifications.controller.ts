import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { NotificationsService } from './notifications.service';
import { successResponse, paginatedResponse } from '../../utils/response.util';
import { HTTP_STATUS } from '../../config/constants';

const service = new NotificationsService();

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get current user's notifications
 */
export async function getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.getUserNotifications(
      req.user!.userId,
      req.query as Record<string, string>,
      req
    );
    return paginatedResponse(res, result, 'Notifications fetched');
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Get count of unread notifications for current user
 */
export async function getUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const count = await service.getUnreadCount(req.user!.userId);
    return successResponse(res, { count });
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark a notification as read
 */
export async function markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const notification = await service.markAsRead(req.params.id, req.user!.userId);
    return successResponse(res, notification, 'Notification marked as read');
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     tags: [Notifications]
 *     summary: Mark all notifications as read for the current user
 */
export async function markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await service.markAllAsRead(req.user!.userId);
    return successResponse(res, result, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
}

/**
 * @openapi
 * /notifications/{id}:
 *   delete:
 *     tags: [Notifications]
 *     summary: Delete a notification
 */
export async function deleteNotification(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.deleteNotification(req.params.id, req.user!.userId);
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
}
