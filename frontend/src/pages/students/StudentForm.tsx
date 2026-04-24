import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import { useStudent, useCreateStudent, useUpdateStudent } from '../../hooks/useStudents';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../services/api.service';
import { useAuthStore } from '../../store/auth.store';
import type { Class } from '../../types';

const schema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  dateOfBirth: z.string().min(1, 'Date of birth required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  classId: z.string().min(1, 'Class required'),
  bloodGroup: z.string().optional(),
  address: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function StudentFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [submitError, setSubmitError] = useState('');
  const schoolId = useAuthStore((s) => s.user?.schoolId ?? '');

  const { data: student } = useStudent(id ?? '');
  const create = useCreateStudent();
  const update = useUpdateStudent();

  const { data: classesData } = useQuery({
    queryKey: ['classes-list'],
    queryFn: () => apiClient.get('/classes').then((r) => r.data.data as Class[]),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (student && isEdit) {
      reset({
        firstName: student.firstName,
        lastName: student.lastName,
        dateOfBirth: student.dateOfBirth?.slice(0, 10),
        gender: student.gender as 'MALE' | 'FEMALE' | 'OTHER',
        classId: student.classId,
        bloodGroup: student.bloodGroup ?? '',
        address: student.address ?? '',
      });
    }
  }, [student, isEdit, reset]);

  const onSubmit = async (data: FormData) => {
    setSubmitError('');
    try {
      if (isEdit) {
        await update.mutateAsync({ id: id!, ...data, schoolId });
      } else {
        await create.mutateAsync({ ...data, schoolId });
      }
      navigate('/students');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; errors?: { message: string }[] } } })
          ?.response?.data?.errors?.[0]?.message ||
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to save student. Please try again.';
      setSubmitError(msg);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/students')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {isEdit ? 'Edit Student' : 'Add Student'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        {submitError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {submitError}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="label">First Name</label>
            <input className="input" {...register('firstName')} />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="label">Last Name</label>
            <input className="input" {...register('lastName')} />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
          </div>
          <div>
            <label className="label">Date of Birth</label>
            <input type="date" className="input" {...register('dateOfBirth')} />
            {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
          </div>
          <div>
            <label className="label">Gender</label>
            <select className="input" {...register('gender')}>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Class</label>
            <select className="input" {...register('classId')}>
              <option value="">Select class</option>
              {classesData?.map((c: Class) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.classId && <p className="text-red-500 text-xs mt-1">{errors.classId.message}</p>}
          </div>
          <div>
            <label className="label">Blood Group</label>
            <input className="input" {...register('bloodGroup')} />
          </div>
        </div>

        <div>
          <label className="label">Address</label>
          <textarea className="input" rows={2} {...register('address')} />
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" className="btn-secondary" onClick={() => navigate('/students')}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Student' : 'Add Student'}
          </button>
        </div>
      </form>
    </div>
  );
}
