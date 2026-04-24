import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileText, Loader2 } from 'lucide-react';
import { apiClient } from '../services/api.service';
import type { Class } from '../types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [classId, setClassId] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState<'class' | null>(null);
  const [error, setError] = useState('');

  const { data: classes } = useQuery({
    queryKey: ['classes-list'],
    queryFn: () => apiClient.get('/classes').then((r) => r.data.data as Class[]),
  });

  const selectedClass = classes?.find((c) => c.id === classId);

  const handleDownloadExcel = async () => {
    if (!classId) return;
    setError('');
    setLoading('class');
    const [year, monthNum] = month.split('-').map(Number);
    try {
      const response = await apiClient.get(`/reports/class/${classId}/excel`, {
        params: { year, month: monthNum },
        responseType: 'blob',
      });
      const filename = `${selectedClass?.name ?? 'class'}_${month}_attendance.xlsx`;
      downloadBlob(response.data as Blob, filename);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message ?? e?.message ?? 'Failed to generate report.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reports</h1>
        <p className="text-sm text-gray-500">Generate and download attendance reports</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Class Report */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Class Report</h3>
              <p className="text-xs text-gray-500">Excel export for entire class</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">Class</label>
              <select className="input" value={classId} onChange={(e) => setClassId(e.target.value)}>
                <option value="">Select class</option>
                {classes?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Month</label>
              <input type="month" className="input" value={month} onChange={(e) => setMonth(e.target.value)} />
            </div>
          </div>

          <button
            className="btn-primary w-full"
            disabled={!classId || loading === 'class'}
            onClick={handleDownloadExcel}
          >
            {loading === 'class'
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
              : <><Download className="w-4 h-4 mr-2" /> Download Excel</>
            }
          </button>
        </div>

        {/* Info Card */}
        <div className="card p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-200 dark:border-indigo-800">
          <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-3">Report Types</h3>
          <ul className="space-y-2 text-sm text-indigo-700 dark:text-indigo-300">
            <li>• Student PDF – per-student monthly attendance</li>
            <li>• Class Excel – full class attendance register</li>
            <li>• Both include attendance %, tier status</li>
            <li>• Available from student detail pages too</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
