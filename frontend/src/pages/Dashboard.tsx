import { Users, GraduationCap, BookOpen, TrendingUp } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import AttendanceTrendChart from '../components/dashboard/AttendanceTrendChart';
import AtRiskStudentsTable from '../components/dashboard/AtRiskStudentsTable';
import { useDashboardOverview, useAttendanceTrend, useAtRiskStudents, useClassSummary } from '../hooks/useAttendance';
import { formatPercentage } from '../utils/formatters';
import type { ClassSummaryItem } from '../types';

export default function DashboardPage() {
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview();
  const { data: trend, isLoading: trendLoading } = useAttendanceTrend(6);
  const { data: atRisk } = useAtRiskStudents(80);
  const { data: classSummary } = useClassSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">School attendance overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={overviewLoading ? '...' : overview?.totalStudents ?? 0}
          icon={Users}
          iconColor="text-blue-600"
        />
        <StatCard
          title="Teachers"
          value={overviewLoading ? '...' : overview?.totalTeachers ?? 0}
          icon={GraduationCap}
          iconColor="text-green-600"
        />
        <StatCard
          title="Classes"
          value={overviewLoading ? '...' : overview?.totalClasses ?? 0}
          icon={BookOpen}
          iconColor="text-purple-600"
        />
        <StatCard
          title="Today's Avg Attendance"
          value={overviewLoading ? '...' : formatPercentage(overview?.avgAttendance ?? 0, 0)}
          icon={TrendingUp}
          iconColor="text-orange-600"
          subtitle={`${overview?.workingDays ?? 0} working days this month`}
        />
      </div>

      {/* Trend Chart + Class Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card p-6 xl:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Attendance Trend (6 Months)
          </h2>
          <AttendanceTrendChart data={trend ?? []} isLoading={trendLoading} />
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Today by Class
          </h2>
          <div className="space-y-3">
            {(classSummary as ClassSummaryItem[] | undefined)?.map((item: ClassSummaryItem) => (
              <div key={item.class.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.class.name}</p>
                  <p className="text-xs text-gray-500">{item.present}/{item.totalStudents} present</p>
                </div>
                <span className={`text-sm font-bold ${item.attendanceRate >= 90 ? 'text-green-600' : item.attendanceRate >= 75 ? 'text-blue-600' : 'text-red-600'}`}>
                  {item.attendanceRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* At-Risk Students */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          At-Risk Students (below 80%)
        </h2>
        <AtRiskStudentsTable students={atRisk ?? []} />
      </div>
    </div>
  );
}
