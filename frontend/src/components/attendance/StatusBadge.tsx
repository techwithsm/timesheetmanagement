import { ATTENDANCE_STATUS_COLORS, ATTENDANCE_STATUS_LABELS } from '../../utils/constants';
import type { AttendanceStatus } from '../../types';

interface Props {
  status: AttendanceStatus | string;
  compact?: boolean;
}

export default function StatusBadge({ status, compact = false }: Props) {
  const key = status as AttendanceStatus;
  const color = ATTENDANCE_STATUS_COLORS[key] ?? 'bg-gray-100 text-gray-800';
  const label = ATTENDANCE_STATUS_LABELS[key] ?? status;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${color}`}
        title={label}
      >
        {label[0]}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
