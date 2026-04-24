import { apiClient } from './api.service';
import type { Teacher, PaginatedResponse, ApiResponse } from '../types';

export interface TeacherFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getTeachers(filters: TeacherFilters = {}) {
  const { data } = await apiClient.get<PaginatedResponse<Teacher>>('/teachers', { params: filters });
  return data;
}

export async function getTeacherById(id: string) {
  const { data } = await apiClient.get<ApiResponse<Teacher>>(`/teachers/${id}`);
  return data.data;
}

export async function createTeacher(dto: Record<string, unknown>) {
  const { data } = await apiClient.post<ApiResponse<Teacher>>('/teachers', dto);
  return data.data;
}

export async function updateTeacher(id: string, dto: Record<string, unknown>) {
  const { data } = await apiClient.put<ApiResponse<Teacher>>(`/teachers/${id}`, dto);
  return data.data;
}

export async function deleteTeacher(id: string) {
  await apiClient.delete(`/teachers/${id}`);
}
