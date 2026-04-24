import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAttendance } from '../../hooks/useAttendance';
import { apiClient } from '../../services/api.service';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/attendance/StatusBadge';
import { formatDate, getFullName } from '../../utils/formatters';
import type { AttendanceRecord, Class } from '../../types';

export default function AttendancePage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [classId, setClassId] = useState('');

  const { data: classesData } = useQuery({
    queryKey: ['classes-list'],
    queryFn: () => apiClient.get('/classes').then((r) => r.data.data as Class[]),
  });

  const { data, isLoading } = useAttendance({
    date,
    classId: classId || undefined,
    page,
    limit: 30,
  });

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (r: AttendanceRecord) => r.student ? getFullName(r.student) : '—',
    },
    {
      key: 'class',
      header: 'Class',
      render: (r: AttendanceRecord) =>
        r.class ? (
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
            {r.class.name}
          </span>
        ) : '—',
    },
    {
      key: 'date',
      header: 'Date',
      render: (r: AttendanceRecord) => formatDate(r.date),
    },
    {
      key: 'status',
      header: 'Status',
      render: (r: AttendanceRecord) => <StatusBadge status={r.status} />,
    },
    {
      key: 'lateMinutes',
      header: 'Late (min)',
      render: (r: AttendanceRecord) => r.lateMinutes > 0 ? `${r.lateMinutes}min` : '—',
    },
    {
      key: 'note',
      header: 'Note',
      render: (r: AttendanceRecord) => r.note ?? '—',
    },
    {
      key: 'markedBy',
      header: 'Marked By',
      render: (r: AttendanceRecord) => r.markedBy ? getFullName(r.markedBy) : '—',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Attendance</h1>
          <p className="text-sm text-gray-500">{data?.pagination?.total ?? 0} records</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Class filter */}
          <select
            value={classId}
            onChange={(e) => { setClassId(e.target.value); setPage(1); }}
            className="input w-44 text-sm"
          >
            <option value="">All Classes</option>
            {classesData?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Date filter */}
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setPage(1); }}
            className="input w-auto"
          />

          <button className="btn-primary" onClick={() => navigate('/attendance/mark')}>
            <Plus className="w-4 h-4 mr-2" /> Mark Attendance
          </button>
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" /> Export
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <DataTable
          columns={columns as Parameters<typeof DataTable>[0]['columns']}
          data={(data?.data ?? []) as Record<string, unknown>[]}
          pagination={data?.pagination}
          onPageChange={setPage}
          isLoading={isLoading}
          emptyMessage="No attendance records for this date"
        />
      </div>
    </div>
  );
}
