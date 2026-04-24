import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { useStudents, useDeleteStudent } from '../../hooks/useStudents';
import DataTable from '../../components/common/DataTable';
import { getFullName, formatDate } from '../../utils/formatters';
import type { Student } from '../../types';

export default function StudentsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useStudents({ page, search: search || undefined, limit: 20 });
  const deleteMutation = useDeleteStudent();

  const handleDelete = (s: Student) => {
    if (!confirm(`Delete student "${getFullName(s)}"? This action cannot be undone.`)) return;
    deleteMutation.mutate(s.id);
  };

  const columns = [
    {
      key: 'studentId',
      header: 'ID',
      render: (s: Student) => <span className="font-mono text-xs text-gray-500">{s.studentId}</span>,
    },
    {
      key: 'name',
      header: 'Name',
      render: (s: Student) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">{getFullName(s)}</span>
      ),
    },
    {
      key: 'class',
      header: 'Class',
      render: (s: Student) => s.class?.name ?? '—',
    },
    {
      key: 'gender',
      header: 'Gender',
      render: (s: Student) => <span className="capitalize">{s.gender.toLowerCase()}</span>,
    },
    {
      key: 'enrollmentDate',
      header: 'Enrolled',
      render: (s: Student) => formatDate(s.enrollmentDate),
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (s: Student) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
          {s.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (s: Student) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/students/${s.id}/edit`)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
            title="Edit student"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(s)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
            title="Delete student"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Students</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{data?.pagination.total ?? 0} total students</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/students/new')}>
          <Plus className="w-4 h-4 mr-2" /> Add Student
        </button>
      </div>

      <div className="card p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search by name or student ID..."
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
          emptyMessage="No students found"
        />
      </div>
    </div>
  );
}
