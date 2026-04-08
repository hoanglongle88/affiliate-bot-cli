import { useState, useEffect } from 'react';
import { checkHealth } from '../core/services';
import type { HealthResponse } from '../core/interfaces';
import { CheckCircle, XCircle, RefreshCw, Clock } from 'lucide-react';

export default function ServerStatus() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch {
      setError('API chưa chạy hoặc không kết nối được');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-[var(--text-secondary)]">Đang kiểm tra...</div>
    );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between sm:mb-8">
        <h2 className="text-xl font-bold sm:text-2xl">Trạng thái máy chủ</h2>
        <button
          onClick={load}
          className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-2 hover:bg-[var(--bg-secondary)]"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-4">
          {health ? (
            <CheckCircle className="shrink-0 text-green-400" size={32} />
          ) : (
            <XCircle className="shrink-0 text-red-400" size={32} />
          )}
          <div>
            <p className="text-lg font-semibold">
              {health ? 'Đang hoạt động' : 'Ngắt kết nối'}
            </p>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </div>

        {health && (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-[var(--bg-secondary)] p-4">
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Clock size={16} /> Thời gian chạy
              </div>
              <p className="mt-1 text-xl font-bold">
                {Math.round(health.uptime)}s
              </p>
            </div>
            <div className="rounded-lg bg-[var(--bg-secondary)] p-4">
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Clock size={16} /> Thời điểm
              </div>
              <p className="mt-1 font-mono text-xs break-all sm:text-sm">
                {health.timestamp}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6">
        <h3 className="mb-4 font-semibold">API Endpoints</h3>
        <div className="grid grid-cols-1 gap-2 font-mono text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-green-400">POST</span>{' '}
            <span className="truncate">/api/scripts</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-green-400">POST</span>{' '}
            <span className="truncate">/api/captions</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-green-400">GET</span>{' '}
            <span className="truncate">/api/products</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-green-400">POST</span>{' '}
            <span className="truncate">/api/products</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-green-400">DEL</span>{' '}
            <span className="truncate">/api/products/:id</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-green-400">POST</span>{' '}
            <span className="truncate">/api/trends/scan</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-green-400">GET</span>{' '}
            <span className="truncate">/api/history</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-green-400">DEL</span>{' '}
            <span className="truncate">/api/history/:id</span>
          </div>
        </div>
      </div>

      {!health && (
        <div className="mt-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6">
          <h3 className="mb-2 font-semibold">Cách khởi động máy chủ</h3>
          <pre className="overflow-x-auto rounded-lg bg-[var(--bg-secondary)] p-4 font-mono text-sm">
            npm run server
          </pre>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Cổng mặc định: 3000
          </p>
        </div>
      )}
    </div>
  );
}
