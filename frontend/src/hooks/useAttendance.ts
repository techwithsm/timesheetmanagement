import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as attendanceService from '../services/attendance.service';
import type { AttendanceFilters, BulkAttendancePayload } from '../services/attendance.service';

export function useAttendance(filters: AttendanceFilters = {}) {
  return useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => attendanceService.getAttendance(filters),
  });
}

export function useAttendanceSummary(classId: string, month?: string) {
  return useQuery({
    queryKey: ['attendance-summary', classId, month],
    queryFn: () => attendanceService.getAttendanceSummary(classId, month),
    enabled: !!classId,
  });
}

export function useBulkMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: BulkAttendancePayload) => attendanceService.bulkMarkAttendance(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });
}

export function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: attendanceService.markAttendance,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
  });
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: attendanceService.getDashboardOverview,
    refetchInterval: 1000 * 60 * 5,
  });
}

export function useAttendanceTrend(months?: number) {
  return useQuery({
    queryKey: ['attendance-trend', months],
    queryFn: () => attendanceService.getAttendanceTrend(months),
  });
}

export function useAtRiskStudents(threshold?: number) {
  return useQuery({
    queryKey: ['at-risk-students', threshold],
    queryFn: () => attendanceService.getAtRiskStudents(threshold),
  });
}

export function useClassSummary() {
  return useQuery({
    queryKey: ['class-summary'],
    queryFn: attendanceService.getClassSummary,
  });
}
