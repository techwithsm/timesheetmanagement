import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceService } from '../../services/attendance.service';
import { studentsService } from '../../services/students.service';
import StatusBadge from './StatusBadge';
import type { AttendanceStatus } from '../../types';

const STATUSES: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'HALF_DAY'];

interface StudentRow {
  studentId: string;
  status: AttendanceStatus;
  note: string;
  lateMinutes: number;
}

interface Props {
  classId: string;
  date: string;
  onSuccess?: () => void;
}

export default function BulkMarkForm({ classId, date, onSuccess }: Props) {
  const queryClient = useQueryClient();

  const { data: students, isLoading } = useQuery({
    queryKey: ['class-students', classId],
    queryFn: () => studentsService.getClassStudents(classId),
    enabled: !!classId,
  });

  const [rows, setRows] = useState<Record<string, StudentRow>>({});

  // Initialise rows once students load
  React.useEffect(() => {
    if (students?.length) {
      const initial: Record<string, StudentRow> = {};
      students.forEach((s: { id: string }) => {
        initial[s.id] = { studentId: s.id, status: 'PRESENT', note: '', lateMinutes: 0 };
      });
      setRows(initial);
    }
  }, [students]);

  const [saveError, setSaveError] = useState('');

  const mutation = useMutation({
    mutationFn: () =>
      attendanceService.bulkMark({
        classId,
        date,
        entries: Object.values(rows),
      }),
    onSuccess: () => {
      setSaveError('');
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      onSuccess?.();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string; errors?: { message: string }[] } } };
      setSaveError(
        e?.response?.data?.errors?.[0]?.message ||
        e?.response?.data?.message ||
        'Failed to save attendance. Please try again.'
      );
    },
  });

  function markAll(status: AttendanceStatus) {
    setRows((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([id, row]) => [id, { ...row, status }])
      )
    );
  }

  function updateRow(studentId: string, field: keyof StudentRow, value: string | number) {
    setRows((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
  }

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Loading students...</div>;
  }

  if (!students?.length) {
    return <div className="text-center py-8 text-gray-500">No students in this class.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Mark all as:</span>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => markAll(s)}
            className="px-3 py-1 text-xs rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Student rows */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Student</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Late (min)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Note</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {students.map((student: { id: string; firstName: string; lastName: string; studentId: string }) => {
              const row = rows[student.id];
              if (!row) return null;
              return (
                <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {student.lastName}, {student.firstName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{student.studentId}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateRow(student.id, 'status', s)}
                          className={`transition-opacity ${row.status === s ? 'opacity-100 ring-2 ring-offset-1 ring-indigo-500 rounded' : 'opacity-40 hover:opacity-70'}`}
                        >
                          <StatusBadge status={s} />
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      max={120}
                      value={row.lateMinutes}
                      onChange={(e) => updateRow(student.id, 'lateMinutes', parseInt(e.target.value) || 0)}
                      disabled={row.status !== 'LATE'}
                      className="w-16 px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-600 disabled:opacity-30"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      placeholder="Optional note"
                      value={row.note}
                      onChange={(e) => updateRow(student.id, 'note', e.target.value)}
                      className="w-full px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-600"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Submit */}
      {saveError && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {saveError}
        </div>
      )}
      {mutation.isSuccess && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
          Attendance saved successfully!
        </div>
      )}
      <div className="flex justify-end gap-3">
        <span className="text-sm text-gray-500 dark:text-gray-400 self-center">
          {Object.keys(rows).length} students
        </span>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors font-medium"
        >
          {mutation.isPending ? 'Saving...' : 'Save Attendance'}
        </button>
      </div>
    </div>
  );
}
