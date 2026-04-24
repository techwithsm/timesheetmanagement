import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { apiClient } from '../services/api.service';
import { formatDate } from '../utils/formatters';
import { HOLIDAY_TYPE_LABELS } from '../utils/constants';
import type { Holiday } from '../types';

const HOLIDAY_TYPES = [
  { value: 'PUBLIC',       label: 'Public Holiday' },
  { value: 'SCHOOL',       label: 'School Holiday' },
  { value: 'SUMMER_BREAK', label: 'Summer Break' },
  { value: 'WINTER_BREAK', label: 'Winter Break' },
  { value: 'SPRING_BREAK', label: 'Spring Break' },
  { value: 'EXAM_PERIOD',  label: 'Exam Period' },
  { value: 'CUSTOM',       label: 'Custom' },
];

const schema = z.object({
  name:        z.string().min(1, 'Holiday name required'),
  date:        z.string().min(1, 'Start date required'),
  endDate:     z.string().optional(),
  type:        z.string().min(1, 'Type required'),
  isRecurring: z.boolean().optional(),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function HolidayModal({ holiday, onClose }: { holiday?: Holiday; onClose: () => void }) {
  const isEdit = !!holiday;
  const [serverError, setServerError] = useState('');
  const qc = useQueryClient();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: isEdit ? {
      name:        holiday.name,
      date:        holiday.date?.slice(0, 10),
      endDate:     holiday.endDate?.slice(0, 10) ?? '',
      type:        holiday.type,
      isRecurring: holiday.isRecurring,
      description: holiday.description ?? '',
    } : {
      type: 'PUBLIC',
      isRecurring: false,
      date: new Date().toISOString().slice(0, 10),
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit
        ? apiClient.patch(`/holidays/${holiday.id}`, data).then((r) => r.data)
        : apiClient.post('/holidays', data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['holidays'] });
      onClose();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { message?: string; errors?: { message: string }[] } } };
      setServerError(e?.response?.data?.errors?.[0]?.message || e?.response?.data?.message || 'Failed to save holiday.');
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEdit ? 'Edit Holiday' : 'Add Holiday'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="px-6 py-5 space-y-4">
          {serverError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">{serverError}</div>
          )}
          <div>
            <label className="label">Holiday Name *</label>
            <input className="input" placeholder="e.g. Independence Day" {...register('name')} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date *</label>
              <input type="date" className="input" {...register('date')} />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
            </div>
            <div>
              <label className="label">End Date <span className="text-gray-400 text-xs">(optional)</span></label>
              <input type="date" className="input" {...register('endDate')} />
            </div>
          </div>
          <div>
            <label className="label">Type *</label>
            <select className="input" {...register('type')}>
              {HOLIDAY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Description <span className="text-gray-400 text-xs">(optional)</span></label>
            <textarea className="input" rows={2} placeholder="Optional notes..." {...register('description')} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" {...register('isRecurring')} />
            <span className="text-sm text-gray-700 dark:text-gray-300">Recurring every year</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary">
              {mutation.isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HolidaysPage() {
  const year = new Date().getFullYear();
  const [showAdd, setShowAdd] = useState(false);
  const [editHoliday, setEditHoliday] = useState<Holiday | null>(null);
  const qc = useQueryClient();

  const { data: holidays, isLoading } = useQuery({
    queryKey: ['holidays', year],
    queryFn: () => apiClient.get('/holidays', { params: { year } }).then((r) => r.data.data as Holiday[]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/holidays/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['holidays'] }),
  });

  const handleDelete = (h: Holiday) => {
    if (!confirm(`Delete holiday "${h.name}"?`)) return;
    deleteMutation.mutate(h.id);
  };

  return (
    <div className="space-y-5">
      {showAdd && <HolidayModal onClose={() => setShowAdd(false)} />}
      {editHoliday && <HolidayModal holiday={editHoliday} onClose={() => setEditHoliday(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Holidays</h1>
          <p className="text-sm text-gray-500">{year} academic calendar</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />Add Holiday
        </button>
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-gray-400">Loading...</div>
      ) : (
        <div className="card divide-y divide-gray-100 dark:divide-gray-700">
          {holidays?.map((h) => (
            <div key={h.id} className="flex items-center gap-4 px-5 py-4 group">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{h.name}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(h.date)}{h.endDate ? ` – ${formatDate(h.endDate)}` : ''}
                  {h.isRecurring && <span className="ml-2 text-xs text-indigo-500">Recurring</span>}
                </p>
                {h.description && <p className="text-xs text-gray-400 mt-0.5">{h.description}</p>}
              </div>
              <span className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
                {HOLIDAY_TYPE_LABELS[h.type] ?? h.type}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditHoliday(h)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                  title="Edit holiday"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(h)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Delete holiday"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {holidays?.length === 0 && (
            <p className="px-5 py-10 text-center text-gray-400">No holidays configured</p>
          )}
        </div>
      )}
    </div>
  );
}
