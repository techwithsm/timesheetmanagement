import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

interface AtRiskItem {
  studentId: string;
  studentNo: string;
  name: string;
  class: { id: string; name: string; grade: string; section: string } | null;
  attendanceRate: number;
  totalDays: number;
  presentDays: number;
}

export default function AtRiskStudentsTable({ students }: { students: AtRiskItem[] }) {
  const navigate = useNavigate();

  if (!students || students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <AlertTriangle className="w-10 h-10 mb-2 text-green-500" />
        <p>No at-risk students — great job!</p>
      </div>
    );
  }

  const tierColor = (rate: number) => {
    if (rate < 60) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    if (rate < 75) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
  };

  const tierLabel = (rate: number) => {
    if (rate < 60) return 'AT RISK';
    if (rate < 75) return 'WARNING';
    return 'LOW';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="px-4 py-2 text-left text-gray-500 font-medium">Student</th>
            <th className="px-4 py-2 text-left text-gray-500 font-medium">Class</th>
            <th className="px-4 py-2 text-left text-gray-500 font-medium">Days Present</th>
            <th className="px-4 py-2 text-left text-gray-500 font-medium">Attendance</th>
            <th className="px-4 py-2 text-left text-gray-500 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr
              key={s.studentId}
              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 cursor-pointer transition-colors"
              onClick={() => navigate(`/students/${s.studentId}`)}
            >
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900 dark:text-gray-100">{s.name}</p>
                <p className="text-xs text-gray-400">{s.studentNo}</p>
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {s.class?.name ?? '—'}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {s.presentDays} / {s.totalDays}
              </td>
              <td className="px-4 py-3 font-semibold text-red-600">
                {s.attendanceRate}%
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tierColor(s.attendanceRate)}`}>
                  {tierLabel(s.attendanceRate)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
