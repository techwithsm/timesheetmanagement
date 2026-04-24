import React from 'react';
import StatusBadge from './StatusBadge';
import type { AttendanceStatus } from '../../types';

interface StudentAttendance {
  studentId: string;
  studentName: string;
  studentCode: string;
  records: Record<string, AttendanceStatus | null>; // dateStr → status
}

interface Props {
  students: StudentAttendance[];
  dates: string[];
}

export default function AttendanceGrid({ students, dates }: Props) {
  if (!students.length) {
    return <p className="text-center py-8 text-gray-500">No data available.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800">
            <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 min-w-[180px]">
              Student
            </th>
            {dates.map((d) => {
              const day = new Date(d + 'T00:00:00');
              return (
                <th key={d} className="px-2 py-3 text-center font-medium text-gray-700 dark:text-gray-300 min-w-[70px]">
                  <div className="text-xs">{day.toLocaleString('default', { month: 'short' })}</div>
                  <div>{day.getDate()}</div>
                  <div className="text-xs text-gray-400">{day.toLocaleString('default', { weekday: 'short' })}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {students.map((s) => (
            <tr key={s.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="sticky left-0 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 px-4 py-2 border-r border-gray-200 dark:border-gray-700">
                <div className="font-medium text-gray-900 dark:text-white">{s.studentName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{s.studentCode}</div>
              </td>
              {dates.map((d) => {
                const status = s.records[d];
                return (
                  <td key={d} className="px-2 py-2 text-center">
                    {status ? (
                      <StatusBadge status={status} compact />
                    ) : (
                      <span className="inline-block w-5 h-5 rounded bg-gray-100 dark:bg-gray-700" title="Not marked" />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
