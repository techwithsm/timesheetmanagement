import { format, parseISO, formatDistance } from 'date-fns';

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  if (!date) return '—';
  const utc = typeof date === 'string' ? new Date(date) : date;
  // Use UTC components to avoid timezone shifting dates stored at UTC midnight
  const local = new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
  return format(local, fmt);
}

export function formatShortDate(date: string | Date): string {
  return formatDate(date, 'MMM d');
}

export function formatISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatMonthYear(date: string | Date): string {
  return formatDate(date, 'MMMM yyyy');
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(d, new Date(), { addSuffix: true });
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function getFullName(user: { firstName: string; lastName: string }): string {
  return `${user.firstName} ${user.lastName}`;
}

export function getInitials(user: { firstName: string; lastName: string }): string {
  return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
}
