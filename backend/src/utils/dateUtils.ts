import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWeekend,
  isBefore,
  isAfter,
  isSameDay,
  addDays,
  differenceInCalendarDays,
} from 'date-fns';

export { format, parseISO, isSameDay, addDays, differenceInCalendarDays };

export function getMonthDateRange(year: number, month: number): { start: Date; end: Date } {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));
  return { start, end };
}

export function getAllDatesInRange(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end });
}

export function isWorkingDay(date: Date, workingDays: number[] = [1, 2, 3, 4, 5]): boolean {
  return workingDays.includes(date.getDay());
}

export function isWeekendDay(date: Date): boolean {
  return isWeekend(date);
}

export function formatDate(date: Date, fmt = 'yyyy-MM-dd'): string {
  return format(date, fmt);
}

export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return !isBefore(date, start) && !isAfter(date, end);
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}
