import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useBulkMarkAttendance } from '../../hooks/useAttendance';
import { apiClient } from '../../services/api.service';
import type { Class, Student } from '../../types';

type Status = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'HALF_DAY';

interface Row { studentId: string; status: Status; lateMinutes?: number; note?: string }

export default function MarkAttendancePage() {
  const navigate = useNavigate();
  const [classId, setClassId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Record<string, Row>>({});
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const { data: classes } = useQuery({
    queryKey: ['classes-list'],
    queryFn: () => apiClient.get('/classes').then((r) => r.data.data as Class[]),
  });

  const { data: students } = useQuery({
    queryKey: ['class-students', classId],
    queryFn: () => apiClient.get(`/classes/${classId}/students`).then((r) => r.data.data as Student[]),
    enabled: !!classId,
  });

  const bulk = useBulkMarkAttendance();

  const updateRow = (studentId: string, field: keyof Row, value: string | number) => {
    setRows((prev) => ({
      ...prev,
      [studentId]: { ...(prev[studentId] ?? { studentId, status: 'PRESENT' }), [field]: value },
    }));
  };

  const markAll = (status: Status) => {
    const next: Record<string, Row> = {};
    students?.forEach((s) => { next[s.id] = { studentId: s.id, status }; });
    setRows(next);
  };

  const handleSave = async () => {
    if (!classId || !students) return;
    setSaveError('');
    try {
      const entries = students.map((s) => rows[s.id] ?? { studentId: s.id, status: 'PRESENT' as Status });
      await bulk.mutateAsync({ classId, date, entries });
      setSaved(true);
      setTimeout(() => navigate('/attendance'), 1500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: { message: string }[] } } };
      setSaveError(
        e?.response?.data?.errors?.[0]?.message ||
        e?.response?.data?.message ||
        'Failed to save attendance. Please try again.'
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/attendance')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mark Attendance</h1>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
          <CheckCircle className="w-5 h-5" /> Attendance saved successfully!
        </div>
      )}
      {saveError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {saveError}
        </div>
      )}

      <div className="card p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Class</label>
          <select className="input" value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">Select a class</option>
            {classes?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {students && students.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{students.length} students</span>
            <div className="flex gap-2">
              {(['PRESENT', 'ABSENT'] as Status[]).map((s) => (
                <button key={s} className="btn-secondary text-xs py-1" onClick={() => markAll(s)}>
                  All {s.toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {students.map((student) => {
              const row = rows[student.id] ?? { studentId: student.id, status: 'PRESENT' as Status };
              return (
                <div key={student.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {student.firstName} {student.lastName}
                    <span className="text-xs text-gray-400 ml-2">{student.studentId}</span>
                  </div>
                  <select
                    className="input w-36 text-xs"
                    value={row.status}
                    onChange={(e) => updateRow(student.id, 'status', e.target.value)}
                  >
                    {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'HALF_DAY'] as Status[]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {row.status === 'LATE' && (
                    <input
                      type="number"
                      min={1}
                      max={120}
                      placeholder="min late"
                      className="input w-24 text-xs"
                      value={row.lateMinutes ?? ''}
                      onChange={(e) => updateRow(student.id, 'lateMinutes', parseInt(e.target.value))}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={!classId || bulk.isPending}
            >
              {bulk.isPending ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
