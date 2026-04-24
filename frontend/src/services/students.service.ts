import { apiClient } from './api.service';
import type { Student, PaginatedResponse, ApiResponse } from '../types';

export interface StudentFilters {
  page?: number;
  limit?: number;
  search?: string;
  classId?: string;
  isActive?: boolean;
}

export async function getStudents(filters: StudentFilters = {}) {
  const { data } = await apiClient.get<PaginatedResponse<Student>>('/students', { params: filters });
  return data;
}

export async function getStudentById(id: string) {
  const { data } = await apiClient.get<ApiResponse<Student>>(`/students/${id}`);
  return data.data;
}

export async function createStudent(dto: Partial<Student>) {
  const { data } = await apiClient.post<ApiResponse<Student>>('/students', dto);
  return data.data;
}

export async function updateStudent(id: string, dto: Partial<Student>) {
  const { data } = await apiClient.put<ApiResponse<Student>>(`/students/${id}`, dto);
  return data.data;
}

export async function deleteStudent(id: string) {
  await apiClient.delete(`/students/${id}`);
}

export async function getStudentAttendanceHistory(id: string, params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get(`/students/${id}/attendance`, { params });
  return data;
}

export async function getClassStudents(classId: string) {
  const { data } = await apiClient.get(`/classes/${classId}/students`);
  return data.data as Student[];
}

// Namespace export for components that prefer object style
export const studentsService = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAttendanceHistory,
  getClassStudents,
};
