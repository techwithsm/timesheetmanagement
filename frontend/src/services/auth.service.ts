import { apiClient } from './api.service';
import type { User } from '../types';

export async function login(email: string, password: string) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data.data as { user: User; accessToken: string };
}

export async function logout() {
  await apiClient.post('/auth/logout');
}

export async function getMe() {
  const { data } = await apiClient.get('/auth/me');
  return data.data as User;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await apiClient.put('/auth/change-password', { currentPassword, newPassword });
}

export async function forgotPassword(email: string) {
  await apiClient.post('/auth/forgot-password', { email });
}
