import { apiClient } from './api.service';
import type { AttendanceRecord, PaginatedResponse, ApiResponse } from '../types';

export interface AttendanceFilters {
  classId?: string;
  studentId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface BulkAttendancePayload {
  classId: string;
  date: string;
  entries: Array<{
    studentId: string;
    status: string;
    note?: string;
    lateMinutes?: number;
  }>;
}

export async function getAttendance(filters: AttendanceFilters = {}) {
  const { data } = await apiClient.get<PaginatedResponse<AttendanceRecord>>('/attendance', { params: filters });
  return data;
}

export async function markAttendance(dto: Partial<AttendanceRecord>) {
  const { data } = await apiClient.post<ApiResponse<AttendanceRecord>>('/attendance', dto);
  return data.data;
}

export async function bulkMarkAttendance(dto: BulkAttendancePayload) {
  const { data } = await apiClient.post('/attendance/bulk', dto);
  return data.data;
}

export async function updateAttendance(id: string, dto: Partial<AttendanceRecord>) {
  const { data } = await apiClient.put<ApiResponse<AttendanceRecord>>(`/attendance/${id}`, dto);
  return data.data;
}

export async function getAttendanceSummary(classId: string, month?: string) {
  const { data } = await apiClient.get('/attendance/summary', { params: { classId, month } });
  return data.data;
}

export async function getDashboardOverview() {
  const { data } = await apiClient.get('/dashboard/overview');
  return data.data;
}

export async function getAttendanceTrend(months?: number) {
  const { data } = await apiClient.get('/dashboard/trend', { params: { months } });
  return data.data;
}

export async function getAtRiskStudents(threshold?: number) {
  const { data } = await apiClient.get('/dashboard/at-risk', { params: { threshold } });
  return data.data;
}

export async function getClassSummary() {
  const { data } = await apiClient.get('/dashboard/class-summary');
  return data.data;
}

// Namespace export for components that prefer object style
export const attendanceService = {
  list: getAttendance,
  mark: markAttendance,
  bulkMark: bulkMarkAttendance,
  update: updateAttendance,
  getSummary: getAttendanceSummary,
};
