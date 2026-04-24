import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notificationsService from '../services/notifications.service';
import { useNotificationStore } from '../store/notification.store';
import { useEffect } from 'react';

export function useNotifications() {
  const setNotifications = useNotificationStore((s) => s.setNotifications);

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications({ limit: 20 }),
    refetchInterval: 1000 * 30,
  });

  useEffect(() => {
    if (query.data) {
      setNotifications(query.data.data, query.data.unreadCount);
    }
  }, [query.data, setNotifications]);

  return query;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  const markRead = useNotificationStore((s) => s.markRead);
  return useMutation({
    mutationFn: notificationsService.markNotificationRead,
    onSuccess: (_, id) => {
      markRead(id);
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  return useMutation({
    mutationFn: notificationsService.markAllNotificationsRead,
    onSuccess: () => {
      markAllRead();
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
