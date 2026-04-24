import React, { useMemo } from 'react';
import type { AttendanceRecord } from '../../types';

interface Props {
  attendances: AttendanceRecord[];
  months?: number;
}

type DayStatus = 'present' | 'absent' | 'late' | 'excused' | 'half_day' | 'weekend' | 'holiday' | 'future' | 'empty';

const STATUS_COLORS: Record<DayStatus, string> = {
  present:  'bg-green-500 dark:bg-green-400',
  absent:   'bg-red-500 dark:bg-red-400',
  late:     'bg-yellow-400 dark:bg-yellow-300',
  excused:  'bg-blue-400 dark:bg-blue-300',
  half_day: 'bg-orange-400 dark:bg-orange-300',
  weekend:  'bg-gray-100 dark:bg-gray-700',
  holiday:  'bg-purple-200 dark:bg-purple-700',
  future:   'bg-gray-50 dark:bg-gray-800',
  empty:    'bg-gray-100 dark:bg-gray-700',
};

const STATUS_LABELS: Record<string, string> = {
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LATE: 'Late',
  EXCUSED: 'Excused',
  HALF_DAY: 'Half Day',
};

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function getDayStatus(dateStr: string, map: Map<string, string>, today: Date): DayStatus {
  const date = new Date(dateStr + 'T00:00:00');
  if (date > today) return 'future';
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return 'weekend';
  const status = map.get(dateStr);
  if (!status) return 'empty';
  return status.toLowerCase() as DayStatus;
}

export default function AttendanceCalendarHeatmap({ attendances, months = 3 }: Props) {
  const { weeks, attendanceMap } = useMemo(() => {
    const map = new Map<string, string>();
    attendances.forEach((a) => {
      const key = typeof a.date === 'string' ? a.date.split('T')[0] : formatDate(new Date(a.date));
      map.set(key, a.status);
    });

    const today = new Date();
    const end = new Date(today);
    // align to Sunday of current week
    end.setDate(end.getDate() + (6 - end.getDay()));

    const start = new Date(today);
    start.setMonth(start.getMonth() - months);
    // align to Sunday
    start.setDate(start.getDate() - start.getDay());

    const allWeeks: string[][] = [];
    let current = new Date(start);
    while (current <= end) {
      const week: string[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(formatDate(new Date(current)));
        current.setDate(current.getDate() + 1);
      }
      allWeeks.push(week);
    }

    return { weeks: allWeeks, attendanceMap: map, today };
  }, [attendances, months]);

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="overflow-x-auto">
      <div className="inline-flex flex-col gap-1 min-w-max">
        {/* Day labels */}
        <div className="flex gap-1 ml-8">
          {dayLabels.map((l, i) => (
            <span key={i} className="w-4 text-center text-xs text-gray-400 dark:text-gray-500 leading-4">{l}</span>
          ))}
        </div>

        {/* Grid: each row = one week column */}
        <div className="flex gap-1">
          {/* Month labels on left side */}
          <div className="flex flex-col justify-between text-xs text-gray-400 dark:text-gray-500 w-7 text-right pr-1">
            {weeks.filter((_, i) => i % 4 === 0).map((week, i) => {
              const d = new Date(week[0] + 'T00:00:00');
              return (
                <span key={i} className="leading-4" style={{ height: '18px' }}>
                  {d.toLocaleString('default', { month: 'short' })}
                </span>
              );
            })}
          </div>

          {/* Columns: one per week, 7 rows per column */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((dateStr, di) => {
                const today = new Date();
                const status = getDayStatus(dateStr, attendanceMap, today);
                const record = attendanceMap.get(dateStr);
                const title = record
                  ? `${dateStr}: ${STATUS_LABELS[record] ?? record}`
                  : `${dateStr}`;
                return (
                  <div
                    key={di}
                    title={title}
                    className={`w-4 h-4 rounded-sm cursor-default ${STATUS_COLORS[status]}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mt-2 flex-wrap">
          {[
            { status: 'present', label: 'Present' },
            { status: 'absent', label: 'Absent' },
            { status: 'late', label: 'Late' },
            { status: 'excused', label: 'Excused' },
            { status: 'half_day', label: 'Half Day' },
            { status: 'weekend', label: 'Weekend' },
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded-sm ${STATUS_COLORS[status as DayStatus]}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
