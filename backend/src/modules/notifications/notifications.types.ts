export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: 'ABSENCE_ALERT' | 'AT_RISK' | 'ATTENDANCE_REMINDER' | 'ENROLLMENT' | 'HOLIDAY_UPDATE' | 'SYSTEM';
  relatedEntityId?: string;
}

export interface NotificationFilters {
  isRead?: string;
  type?: string;
  page?: string;
  limit?: string;
}
