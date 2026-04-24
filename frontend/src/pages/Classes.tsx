import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Users, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass } from '../hooks/useClasses';
import { apiClient } from '../services/api.service';
import { getFullName } from '../utils/formatters';
import type { Class, Teacher } from '../types';

const classSchema = z.object({
  name:         z.string().min(1, 'Class name required'),
  grade:        z.string().min(1, 'Grade required'),
  section:      z.string().min(1, 'Section required'),
  academicYear: z.string().min(1, 'Academic year required'),
  capacity:     z.coerce.number().int().min(1).max(200).optional(),
  roomNumber:   z.string().optional(),
  teacherId:    z.string().optional(),
});
type ClassFormData = z.infer<typeof classSchema>;

function ClassModal({ cls, onClose }: { cls?: Class; onClose: () => void }) {
  const isEdit = !!cls;
  const [serverError, setServerError] = useState('');
  const create = useCreateClass();
  const update = useUpdateClass();

  const { data: teachers } = useQuery({
    queryKey: ['teachers-list'],
    queryFn: () => apiClient.get('/teachers', { params: { limit: 100 } }).then((r) => r.data.data as Teacher[]),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: isEdit ? {
      name:         cls.name,
      grade:        cls.grade,
      section:      cls.section,
      academicYear: cls.academicYear,
      capacity:     cls.capacity,
      roomNumber:   cls.roomNumber ?? '',
      teacherId:    cls.teacherId ?? '',
    } : {
      academicYear: new Date().getFullYear().toString(),
      capacity: 30,
    },
  });

  const onSubmit = async (data: ClassFormData) => {
    setServerError('');
    const payload = { ...data, teacherId: data.teacherId || undefined };
    try {
      if (isEdit) {
        await update.mutateAsync({ id: cls.id, ...payload });
      } else {
        await create.mutateAsync(payload);
      }
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: { message: string }[] } } };
      setServerError(e?.response?.data?.errors?.[0]?.message || e?.response?.data?.message || 'Failed to save class.');
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEdit ? 'Edit Class' : 'Add Class'}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {serverError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">{serverError}</div>
          )}
          <div>
            <label className="label">Class Name *</label>
            <input className="input" placeholder="e.g. Grade 1A" {...register('name')} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Grade *</label>
              <input className="input" placeholder="e.g. 1" {...register('grade')} />
              {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade.message}</p>}
            </div>
            <div>
              <label className="label">Section *</label>
              <input className="input" placeholder="e.g. A" {...register('section')} />
              {errors.section && <p className="text-red-500 text-xs mt-1">{errors.section.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Academic Year *</label>
              <input className="input" placeholder="e.g. 2026" {...register('academicYear')} />
              {errors.academicYear && <p className="text-red-500 text-xs mt-1">{errors.academicYear.message}</p>}
            </div>
            <div>
              <label className="label">Capacity</label>
              <input type="number" className="input" {...register('capacity')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Room Number</label>
              <input className="input" placeholder="e.g. 101" {...register('roomNumber')} />
            </div>
            <div>
              <label className="label">Homeroom Teacher</label>
              <select className="input" {...register('teacherId')}>
                <option value="">None</option>
                {teachers?.map((t) => (
                  <option key={t.id} value={t.id}>{getFullName(t.user)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting || isPending} className="btn-primary">
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClassesPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [editClass, setEditClass] = useState<Class | null>(null);

  const { data, isLoading } = useClasses();
  const deleteMutation = useDeleteClass();

  const handleDelete = (cls: Class) => {
    if (!confirm(`Delete class "${cls.name}"? Students in this class will be unassigned.`)) return;
    deleteMutation.mutate(cls.id);
  };

  return (
    <div className="space-y-5">
      {showAdd && <ClassModal onClose={() => setShowAdd(false)} />}
      {editClass && <ClassModal cls={editClass} onClose={() => setEditClass(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Classes</h1>
          <p className="text-sm text-gray-500">{data?.length ?? 0} classes</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />Add Class
        </button>
      </div>

      {isLoading ? (
        <div className="card p-8 text-center text-gray-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {data?.map((cls) => (
            <div key={cls.id} className="card p-5 space-y-3 group relative">
              {/* Action buttons */}
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditClass(cls)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                  title="Edit class"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cls)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Delete class"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 pr-16">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{cls.name}</h3>
                  <p className="text-xs text-gray-500">Grade {cls.grade} · Section {cls.section}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{cls.studentCount ?? 0} students</span>
                </div>
                {cls.roomNumber && <span>Room {cls.roomNumber}</span>}
                <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{cls.academicYear}</span>
              </div>

              {cls.teacher && (
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
                  Homeroom: <span className="font-medium text-gray-700 dark:text-gray-300">
                    {getFullName((cls.teacher as { user: { firstName: string; lastName: string } }).user)}
                  </span>
                </div>
              )}
            </div>
          ))}
          {data?.length === 0 && (
            <p className="col-span-3 text-center py-16 text-gray-400">No classes found. Add your first class.</p>
          )}
        </div>
      )}
    </div>
  );
}
