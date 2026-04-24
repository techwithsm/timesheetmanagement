import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '../../services/attendance.service';
import StatusBadge from '../../components/attendance/StatusBadge';
import DataTable from '../../components/common/DataTable';
import { format } from 'date-fns';

const STATUSES = ['', 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'HALF_DAY'];

export default function AttendanceHistory() {
  const [filters, setFilters] = useState({
    startDate: format(new Date(Date.now() - 30 * 86400000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    status: '',
    classId: '',
    studentId: '',
    page: 1,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['attendance-history', filters],
    queryFn: () => attendanceService.list(filters),
  });

  function updateFilter(key: string, value: string) {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  }

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (row: Record<string, unknown>) => format(new Date(row.date as string), 'MMM dd, yyyy'),
    },
    {
      key: 'student',
      header: 'Student',
      render: (row: Record<string, unknown>) => {
        const s = row.student as { firstName: string; lastName: string; studentId: string };
        return s ? `${s.lastName}, ${s.firstName} (${s.studentId})` : '—';
      },
    },
    {
      key: 'class',
      header: 'Class',
      render: (row: Record<string, unknown>) => {
        const c = row.class as { name: string } | null;
        return c?.name ?? '—';
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Record<string, unknown>) => <StatusBadge status={row.status as string} />,
    },
    {
      key: 'lateMinutes',
      header: 'Late (min)',
      render: (row: Record<string, unknown>) =>
        row.lateMinutes ? `${row.lateMinutes} min` : '—',
    },
    {
      key: 'markedBy',
      header: 'Marked By',
      render: (row: Record<string, unknown>) => {
        const m = row.markedBy as { firstName: string; lastName: string } | null;
        return m ? `${m.firstName} ${m.lastName}` : '—';
      },
    },
    {
      key: 'note',
      header: 'Note',
      render: (row: Record<string, unknown>) => (row.note as string) || '—',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance History</h1>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter('endDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s || 'All Statuses'}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID</label>
            <input
              type="text"
              placeholder="Filter by student..."
              value={filters.studentId}
              onChange={(e) => updateFilter('studentId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        emptyMessage="No attendance records found for the selected filters."
      />
    </div>
  );
}
