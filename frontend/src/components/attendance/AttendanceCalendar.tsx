import React, { useState } from 'react';
import type { AttendanceRecord } from '../../types';

interface Props {
  attendances: AttendanceRecord[];
  onDateClick?: (date: string) => void;
  selectedDate?: string;
}

const STATUS_COLORS: Record<string, string> = {
  PRESENT:  'bg-green-500 text-white',
  ABSENT:   'bg-red-500 text-white',
  LATE:     'bg-yellow-400 text-gray-900',
  EXCUSED:  'bg-blue-400 text-white',
  HALF_DAY: 'bg-orange-400 text-white',
};

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function AttendanceCalendar({ attendances, onDateClick, selectedDate }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const attendanceMap = new Map<string, string>();
  attendances.forEach((a) => {
    const key = typeof a.date === 'string' ? a.date.split('T')[0] : a.date.toISOString().split('T')[0];
    attendanceMap.set(key, a.status);
  });

  const days = daysInMonth(viewYear, viewMonth);
  const startDay = firstDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  function dateKey(day: number) {
    return `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const monthName = new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          ‹
        </button>
        <h3 className="font-medium text-gray-900 dark:text-white">{monthName}</h3>
        <button
          onClick={nextMonth}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          disabled={viewYear === today.getFullYear() && viewMonth === today.getMonth()}
        >
          ›
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-xs text-gray-500 dark:text-gray-400 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const key = dateKey(day);
          const status = attendanceMap.get(key);
          const isToday = key === today.toISOString().split('T')[0];
          const isSelected = key === selectedDate;
          const isWeekend = (i % 7 === 0) || (i % 7 === 6);

          return (
            <button
              key={i}
              onClick={() => onDateClick?.(key)}
              className={[
                'aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all',
                status ? STATUS_COLORS[status] : isWeekend ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                isToday && !status ? 'ring-2 ring-indigo-500' : '',
                isSelected ? 'ring-2 ring-offset-1 ring-indigo-600' : '',
              ].join(' ')}
              title={status ? `${key}: ${status}` : key}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${color.split(' ')[0]}`} />
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {status.toLowerCase().replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
