export const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  EXCUSED: 'Excused',
  HALF_DAY: 'Half Day',
};

export const ATTENDANCE_STATUS_COLORS: Record<string, string> = {
  PRESENT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  ABSENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  LATE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  EXCUSED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  HALF_DAY: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export const TIER_COLORS: Record<string, string> = {
  EXCELLENT: 'text-green-600 dark:text-green-400',
  GOOD: 'text-blue-600 dark:text-blue-400',
  WARNING: 'text-yellow-600 dark:text-yellow-400',
  AT_RISK: 'text-red-600 dark:text-red-400',
};

export const TIER_BADGE_COLORS: Record<string, string> = {
  EXCELLENT: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  GOOD: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  WARNING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  AT_RISK: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrator',
  TEACHER: 'Teacher',
  PARENT: 'Parent',
  VIEWER: 'Viewer',
};

export const HOLIDAY_TYPE_LABELS: Record<string, string> = {
  PUBLIC: 'Public Holiday',
  SCHOOL: 'School Holiday',
  SUMMER_BREAK: 'Summer Break',
  WINTER_BREAK: 'Winter Break',
  SPRING_BREAK: 'Spring Break',
  EXAM_PERIOD: 'Exam Period',
  CUSTOM: 'Custom',
};

export const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];
