import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api.service';
import { useThemeStore } from '../store/theme.store';

interface SchoolSettings {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  academicYearStart: string;
  academicYearEnd: string;
  timezone: string;
  workingDays: number[];
  lateThresholdMin: number;
  absenceThreshold: number;
}

const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'Europe/London', 'Europe/Paris', 'Asia/Tokyo', 'Asia/Kolkata', 'Australia/Sydney', 'UTC',
];

export default function Settings() {
  const { isDark, toggle } = useThemeStore();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data: school, isLoading } = useQuery<SchoolSettings>({
    queryKey: ['school-settings'],
    queryFn: () => apiService.get('/schools/me'),
  });

  const [form, setForm] = useState<Partial<SchoolSettings>>({});

  React.useEffect(() => {
    if (school) setForm(school);
  }, [school]);

  const mutation = useMutation({
    mutationFn: (data: Partial<SchoolSettings>) => apiService.put('/schools/me', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  function toggleWorkingDay(day: number) {
    const days = form.workingDays ?? [1, 2, 3, 4, 5];
    setForm((f) => ({
      ...f,
      workingDays: days.includes(day) ? days.filter((d) => d !== day) : [...days, day].sort(),
    }));
  }

  if (isLoading) {
    return <div className="animate-pulse space-y-4">{Array(4).fill(null).map((_, i) => <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />)}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      {saved && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
          Settings saved successfully.
        </div>
      )}

      {/* Appearance */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark theme for the entire app</p>
          </div>
          <button
            onClick={toggle}
            className={`relative w-12 h-6 rounded-full transition-colors ${isDark ? 'bg-indigo-600' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${isDark ? 'translate-x-6' : ''}`} />
          </button>
        </div>
      </section>

      {/* School info */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">School Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(['name', 'address', 'phone', 'email'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">{field}</label>
              <input
                type={field === 'email' ? 'email' : 'text'}
                value={(form[field] as string) ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Academic year */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Academic Year</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              value={form.academicYearStart?.split('T')[0] ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, academicYearStart: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              value={form.academicYearEnd?.split('T')[0] ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, academicYearEnd: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
            <select
              value={form.timezone ?? 'UTC'}
              onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Attendance rules */}
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Attendance Rules</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Working Days</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleWorkingDay(value)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                  (form.workingDays ?? []).includes(value)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Late Threshold (minutes)
            </label>
            <input
              type="number"
              min={1}
              max={120}
              value={form.lateThresholdMin ?? 15}
              onChange={(e) => setForm((f) => ({ ...f, lateThresholdMin: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Students arriving within this window are PRESENT</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Absence Warning Threshold (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={form.absenceThreshold ?? 75}
              onChange={(e) => setForm((f) => ({ ...f, absenceThreshold: parseFloat(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Students below this % receive at-risk alerts</p>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          onClick={() => mutation.mutate(form)}
          disabled={mutation.isPending}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
        >
          {mutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
