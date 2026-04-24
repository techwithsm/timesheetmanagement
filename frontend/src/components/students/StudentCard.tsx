import React from 'react';
import { Link } from 'react-router-dom';
import type { Student } from '../../types';

interface Props {
  student: Student;
  attendancePercentage?: number;
}

function tier(pct: number): { label: string; color: string } {
  if (pct >= 90) return { label: 'Excellent', color: 'text-green-600 bg-green-50' };
  if (pct >= 75) return { label: 'Good', color: 'text-blue-600 bg-blue-50' };
  if (pct >= 60) return { label: 'Warning', color: 'text-amber-600 bg-amber-50' };
  return { label: 'At Risk', color: 'text-red-600 bg-red-50' };
}

export default function StudentCard({ student, attendancePercentage }: Props) {
  const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
  const badge = attendancePercentage !== undefined ? tier(attendancePercentage) : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold text-lg flex-shrink-0">
          {student.photoUrl ? (
            <img src={student.photoUrl} alt={initials} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            initials
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link
            to={`/students/${student.id}`}
            className="font-medium text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate block"
          >
            {student.lastName}, {student.firstName}
          </Link>
          <p className="text-sm text-gray-500 dark:text-gray-400">ID: {student.studentId}</p>
          {student.class && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {student.class.name}
            </p>
          )}
        </div>

        {badge && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${badge.color}`}>
            {attendancePercentage?.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
}
