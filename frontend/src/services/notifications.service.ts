import { apiClient } from './api.service';
import type { Notification } from '../types';

export async function getNotifications(params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get('/notifications', { params });
  return data as { data: Notification[]; unreadCount: number; pagination: object };
}

export async function markNotificationRead(id: string) {
  await apiClient.put(`/notifications/${id}/read`);
}

export async function markAllNotificationsRead() {
  await apiClient.put('/notifications/read-all');
}
