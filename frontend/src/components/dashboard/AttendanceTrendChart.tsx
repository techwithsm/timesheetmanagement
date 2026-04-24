import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type { TrendDataPoint } from '../../types';

interface Props {
  data: TrendDataPoint[];
  isLoading?: boolean;
}

export default function AttendanceTrendChart({ data, isLoading }: Props) {
  if (isLoading) {
    return <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number) => [`${value}%`, 'Attendance']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="percentage"
          name="Attendance %"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
