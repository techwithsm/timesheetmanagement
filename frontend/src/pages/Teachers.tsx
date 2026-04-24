import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, X, Pencil, Trash2 } from 'lucide-react';
import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher } from '../hooks/useTeachers';
import DataTable from '../components/common/DataTable';
import { getFullName, formatDate } from '../utils/formatters';
import type { Teacher } from '../types';

// ── Add schema ──────────────────────────────────────────────────────────────
const addSchema = z.object({
  firstName:     z.string().min(1, 'First name required'),
  lastName:      z.string().min(1, 'Last name required'),
  email:         z.string().email('Valid email required'),
  phone:         z.string().optional(),
  employeeId:    z.string().min(1, 'Employee ID required'),
  department:    z.string().optional(),
  qualification: z.string().optional(),
  joiningDate:   z.string().min(1, 'Joining date required'),
});
type AddFormData = z.infer<typeof addSchema>;

// ── Edit schema ──────────────────────────────────────────────────────────────
const editSchema = z.object({
  department:    z.string().optional(),
  qualification: z.string().optional(),
  joiningDate:   z.string().min(1, 'Joining date required'),
});
type EditFormData = z.infer<typeof editSchema>;

// ── Add Modal ────────────────────────────────────────────────────────────────
function AddTeacherModal({ onClose }: { onClose: () => void }) {
  const [serverError, setServerError] = useState('');
  const create = useCreateTeacher();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AddFormData>({
    resolver: zodResolver(addSchema),
    defaultValues: { joiningDate: new Date().toISOString().split('T')[0] },
  });

  const onSubmit = async (data: AddFormData) => {
    setServerError('');
    try {
      await create.mutateAsync(data);
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: { message: string }[] } } };
      setServerError(e?.response?.data?.errors?.[0]?.message || e?.response?.data?.message || 'Failed to add teacher.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Add Teacher</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {serverError && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">{serverError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input className="input" {...register('firstName')} />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input className="input" {...register('lastName')} />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Email *</label>
            <input type="email" className="input" {...register('email')} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Employee ID *</label>
              <input className="input" placeholder="EMP0001" {...register('employeeId')} />
              {errors.employeeId && <p className="text-red-500 text-xs mt-1">{errors.employeeId.message}</p>}
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" {...register('phone')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Department</label>
              <input className="input" placeholder="e.g. Mathematics" {...register('department')} />
            </div>
            <div>
              <label className="label">Qualification</label>
              <input className="input" placeholder="e.g. M.Ed." {...register('qualification')} />
            </div>
          </div>
          <div>
            <label className="label">Joining Date *</label>
            <input type="date" className="input" {...register('joiningDate')} />
            {errors.joiningDate && <p className="text-red-500 text-xs mt-1">{errors.joiningDate.message}</p>}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Default password: <span className="font-mono font-medium">Welcome@123</span></p>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting || create.isPending} className="btn-primary">
              {create.isPending ? 'Adding...' : 'Add Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Modal ───────────────────────────────────────────────────────────────
function EditTeacherModal({ teacher, onClose }: { teacher: Teacher; onClose: () => void }) {
  const [serverError, setServerError] = useState('');
  const update = useUpdateTeacher();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      department:    teacher.department ?? '',
      qualification: teacher.qualification ?? '',
      joiningDate:   teacher.joiningDate?.slice(0, 10) ?? '',
    },
  });

  const onSubmit = async (data: EditFormData) => {
    setServerError('');
    try {
      await update.mutateAsync({ id: teacher.id, ...data });
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: { message: string }[] } } };
      setServerError(e?.response?.data?.errors?.[0]?.message || e?.response?.data?.message || 'Failed to update teacher.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Teacher — {getFullName(teacher.user)}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
          {serverError && <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">{serverError}</div>}
          <div>
            <label className="label">Department</label>
            <input className="input" placeholder="e.g. Mathematics" {...register('department')} />
          </div>
          <div>
            <label className="label">Qualification</label>
            <input className="input" placeholder="e.g. M.Ed." {...register('qualification')} />
          </div>
          <div>
            <label className="label">Joining Date *</label>
            <input type="date" className="input" {...register('joiningDate')} />
            {errors.joiningDate && <p className="text-red-500 text-xs mt-1">{errors.joiningDate.message}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting || update.isPending} className="btn-primary">
              {update.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function TeachersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);

  const { data, isLoading } = useTeachers({ page, search: search || undefined });
  const deleteMutation = useDeleteTeacher();

  const handleDelete = (t: Teacher) => {
    if (!confirm(`Deactivate teacher "${getFullName(t.user)}"?`)) return;
    deleteMutation.mutate(t.id);
  };

  const columns = [
    {
      key: 'employeeId', header: 'ID',
      render: (t: Teacher) => <span className="font-mono text-xs">{t.employeeId}</span>,
    },
    {
      key: 'name', header: 'Name',
      render: (t: Teacher) => <span className="font-medium">{getFullName(t.user)}</span>,
    },
    {
      key: 'email', header: 'Email',
      render: (t: Teacher) => <span className="text-gray-500 text-xs">{t.user.email}</span>,
    },
    { key: 'department', header: 'Department', render: (t: Teacher) => t.department ?? '—' },
    {
      key: 'classes', header: 'Classes',
      render: (t: Teacher) => `${t.classes?.length ?? 0} class(es)`,
    },
    { key: 'joiningDate', header: 'Joined', render: (t: Teacher) => formatDate(t.joiningDate) },
    {
      key: 'status', header: 'Status',
      render: (t: Teacher) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
          {t.user.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions', header: '',
      render: (t: Teacher) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => setEditTeacher(t)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
            title="Edit teacher"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(t)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Deactivate teacher"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {showAdd && <AddTeacherModal onClose={() => setShowAdd(false)} />}
      {editTeacher && <EditTeacherModal teacher={editTeacher} onClose={() => setEditTeacher(null)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Teachers</h1>
          <p className="text-sm text-gray-500">{data?.pagination?.total ?? 0} total teachers</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4 mr-2" />Add Teacher
        </button>
      </div>

      <div className="card p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search teachers..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100"
        />
      </div>

      <div className="card overflow-hidden">
        <DataTable
          columns={columns as Parameters<typeof DataTable>[0]['columns']}
          data={(data?.data ?? []) as Record<string, unknown>[]}
          pagination={data?.pagination}
          onPageChange={setPage}
          isLoading={isLoading}
          emptyMessage="No teachers found"
        />
      </div>
    </div>
  );
}
