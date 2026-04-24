import { AttendanceStatus } from '../../config/constants';

export interface BulkAttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  checkInTime?: string;
  checkOutTime?: string;
  lateMinutes?: number;
}

export interface BulkAttendancePayload {
  classId: string;
  date: string;
  entries: BulkAttendanceEntry[];
}

export interface AttendanceFilters {
  classId?: string;
  studentId?: string;
  schoolId?: string;
  status?: AttendanceStatus;
  date?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
}

export interface AttendanceSummary {
  studentId: string;
  studentName: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  halfDay: number;
  attendanceRate: number;
  lateRate: number;
}

export interface ClassAttendanceStats {
  classId: string;
  className: string;
  date: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  halfDay: number;
  attendanceRate: number;
}
