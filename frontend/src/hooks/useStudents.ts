import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as studentsService from '../services/students.service';
import type { StudentFilters } from '../services/students.service';

export function useStudents(filters: StudentFilters = {}) {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentsService.getStudents(filters),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => studentsService.getStudentById(id),
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: studentsService.createStudent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string } & Record<string, unknown>) =>
      studentsService.updateStudent(id, dto),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['student', vars.id] });
      qc.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: studentsService.deleteStudent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['classes'] });
    },
  });
}

export function useStudentAttendanceHistory(studentId: string, params?: { page?: number }) {
  return useQuery({
    queryKey: ['student-attendance', studentId, params],
    queryFn: () => studentsService.getStudentAttendanceHistory(studentId, params),
    enabled: !!studentId,
  });
}
