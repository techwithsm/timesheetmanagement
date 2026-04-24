import { apiClient } from './api.service';
import type { Class, ApiResponse } from '../types';

export async function getClasses() {
  const { data } = await apiClient.get('/classes');
  return data.data as Class[];
}

export async function getClassById(id: string) {
  const { data } = await apiClient.get<ApiResponse<Class>>(`/classes/${id}`);
  return data.data;
}

export async function createClass(dto: Record<string, unknown>) {
  const { data } = await apiClient.post<ApiResponse<Class>>('/classes', dto);
  return data.data;
}

export async function updateClass(id: string, dto: Record<string, unknown>) {
  const { data } = await apiClient.put<ApiResponse<Class>>(`/classes/${id}`, dto);
  return data.data;
}

export async function deleteClass(id: string) {
  await apiClient.delete(`/classes/${id}`);
}
