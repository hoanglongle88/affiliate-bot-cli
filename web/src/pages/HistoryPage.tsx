import { useState, useEffect } from 'react';
import { FileText, MessageSquare, RefreshCw } from 'lucide-react';
import { getHistory } from '../core/services/commonAPI';
import type { HistoryEntry } from '../core/interfaces';
import { WORKFLOW_LABELS } from '../core/constants';

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return <div className="p-8 text-[var(--text-secondary)]">Đang tải...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between sm:mb-8">
        <h2 className="text-xl font-bold sm:text-2xl">
          Lịch sử ({history.length})
        </h2>
        <button
          onClick={load}
          className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-2 hover:bg-[var(--bg-secondary)]"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4"
          >
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              {entry.workflow === 'script' ||
              entry.workflow === 'full' ||
              entry.workflow === 'short_video' ? (
                <FileText
                  className="shrink-0 text-[var(--accent-pink)]"
                  size={18}
                />
              ) : (
                <MessageSquare
                  className="shrink-0 text-[var(--accent-purple)]"
                  size={18}
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {entry.product?.name || 'Không rõ'}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                  {WORKFLOW_LABELS[entry.workflow] || entry.workflow} •{' '}
                  {new Date(entry.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            <span className="hidden shrink-0 text-xs text-[var(--text-secondary)] sm:inline">
              {entry.id.slice(0, 8)}...
            </span>
          </div>
        ))}
        {history.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--text-secondary)]">
            Chưa có lịch sử
          </div>
        )}
      </div>
    </div>
  );
}
