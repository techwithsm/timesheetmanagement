export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'PARENT' | 'VIEWER';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'HALF_DAY';
export type AttendanceTier = 'EXCELLENT' | 'GOOD' | 'WARNING' | 'AT_RISK';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  schoolId: string | null;
  avatarUrl: string | null;
  mustChangePassword: boolean;
  school?: { id: string; name: string; logoUrl: string | null };
}

export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email: string;
  logoUrl?: string;
  academicYearStart: string;
  academicYearEnd: string;
  timezone: string;
  workingDays: number[];
  lateThresholdMin: number;
  absenceThreshold: number;
}

export interface Teacher {
  id: string;
  userId: string;
  employeeId: string;
  department?: string;
  qualification?: string;
  joiningDate: string;
  schoolId: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'> & { phone?: string; avatarUrl?: string; isActive: boolean };
  classes?: Class[];
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  section: string;
  academicYear: string;
  roomNumber?: string;
  capacity: number;
  schoolId: string;
  teacherId?: string;
  teacher?: { user: Pick<User, 'firstName' | 'lastName'> };
  studentCount?: number;
}

export interface Student {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  address?: string;
  photoUrl?: string;
  enrollmentDate: string;
  isActive: boolean;
  classId: string;
  schoolId: string;
  parentId?: string;
  emergencyContact?: { name: string; phone: string; relation: string };
  medicalNotes?: string;
  class?: Class;
  parent?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  markedById: string;
  note?: string;
  lateMinutes: number;
  student?: Pick<Student, 'id' | 'firstName' | 'lastName' | 'studentId'>;
  class?: Pick<Class, 'id' | 'name' | 'grade' | 'section'>;
  markedBy?: Pick<User, 'firstName' | 'lastName'>;
}

export interface AttendanceStats {
  totalWorkingDays: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  totalHalfDay: number;
  attendancePercentage: number;
  tier: AttendanceTier;
}

export interface Holiday {
  id: string;
  schoolId: string;
  name: string;
  date: string;
  endDate?: string;
  type: string;
  isRecurring: boolean;
  description?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedEntityId?: string;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DashboardOverview {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  workingDays: number;
  todayAttendance: Record<AttendanceStatus, number>;
  avgAttendance: number;
}

export interface TrendDataPoint {
  month: string;
  total: number;
  present: number;
  percentage: number;
}

export interface ClassSummaryItem {
  class: Pick<Class, 'id' | 'name' | 'grade' | 'section'>;
  totalStudents: number;
  present: number;
  absent: number;
  unmarked: number;
  attendanceRate: number;
}

export interface AtRiskStudent {
  student: Student & { class: Class };
  stats: AttendanceStats;
}
