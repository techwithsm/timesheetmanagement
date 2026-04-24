import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar } from 'lucide-react';
import { useStudent, useStudentAttendanceHistory } from '../../hooks/useStudents';
import StatusBadge from '../../components/attendance/StatusBadge';
import { formatDate, getFullName } from '../../utils/formatters';
import type { AttendanceRecord } from '../../types';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: student, isLoading } = useStudent(id!);
  const { data: history } = useStudentAttendanceHistory(id!);

  if (isLoading) return <div className="card p-8 text-center text-gray-500">Loading...</div>;
  if (!student) return <div className="card p-8 text-center text-red-500">Student not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/students')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getFullName(student)}</h1>
          <p className="text-gray-500 text-sm">{student.studentId} · {student.class?.name}</p>
        </div>
        <button className="btn-secondary" onClick={() => navigate(`/students/${id}/edit`)}>
          <Edit className="w-4 h-4 mr-2" /> Edit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="card p-6 space-y-4 lg:col-span-1">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Student Info</h2>
          <dl className="space-y-3 text-sm">
            {[
              ['Date of Birth', formatDate(student.dateOfBirth)],
              ['Gender', student.gender],
              ['Blood Group', student.bloodGroup ?? '—'],
              ['Enrollment Date', formatDate(student.enrollmentDate)],
              ['Status', student.isActive ? 'Active' : 'Inactive'],
              ['Parent', student.parent ? getFullName(student.parent) : '—'],
              ['Parent Email', student.parent?.email ?? '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium text-gray-900 dark:text-gray-100 text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Attendance History */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Attendance History</h2>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(history?.data as AttendanceRecord[] | undefined)?.map((r: AttendanceRecord) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-sm text-gray-600 dark:text-gray-400">{formatDate(r.date)}</span>
                <div className="flex items-center gap-3">
                  {r.lateMinutes > 0 && (
                    <span className="text-xs text-gray-400">{r.lateMinutes}min late</span>
                  )}
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
            {!history?.data?.length && (
              <p className="text-center text-gray-400 py-8">No attendance records</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
