import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as teachersService from '../services/teachers.service';
import type { TeacherFilters } from '../services/teachers.service';

export function useTeachers(filters: TeacherFilters = {}) {
  return useQuery({
    queryKey: ['teachers', filters],
    queryFn: () => teachersService.getTeachers(filters),
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: ['teacher', id],
    queryFn: () => teachersService.getTeacherById(id),
    enabled: !!id,
  });
}

export function useCreateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teachersService.createTeacher,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teachers'] }),
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & Record<string, unknown>) =>
      teachersService.updateTeacher(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teachers'] }),
  });
}

export function useDeleteTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: teachersService.deleteTeacher,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['teachers'] }),
  });
}
