import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { changePassword as changePasswordApi } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must include uppercase')
    .regex(/[a-z]/, 'Must include lowercase')
    .regex(/\d/, 'Must include a number'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordForm = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user } = useAuthStore();
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: PasswordForm) =>
      changePasswordApi(data.currentPassword, data.newPassword),
    onSuccess: () => {
      setPasswordSuccess(true);
      reset();
      setTimeout(() => setPasswordSuccess(false), 4000);
    },
  });

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>

      {/* Profile info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-2xl font-bold">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
            <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full">
              {user?.role}
            </span>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Email</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Role</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{user?.role}</dd>
          </div>
          {user?.schoolId && (
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">School ID</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white font-mono text-xs">{user.schoolId}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Change password */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>

        {passwordSuccess && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
            Password changed successfully.
          </div>
        )}

        {passwordMutation.isError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            {(passwordMutation.error as Error)?.message ?? 'Failed to change password.'}
          </div>
        )}

        <form onSubmit={handleSubmit((d) => passwordMutation.mutate(d))} className="space-y-4">
          {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                {field.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input
                type="password"
                {...register(field)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {errors[field] && (
                <p className="mt-1 text-xs text-red-500">{errors[field]?.message}</p>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
          >
            {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
