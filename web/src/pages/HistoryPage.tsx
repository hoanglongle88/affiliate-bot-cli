import { useState, useEffect } from 'react';
import { FileText, MessageSquare, RefreshCw } from 'lucide-react';
import { getHistory } from '../lib/api';

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
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

  useEffect(() => { load(); }, []);

  if (loading) return <div className="p-8 text-[var(--text-secondary)]">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">History ({history.length})</h2>
        <button onClick={load} className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {history.map((entry) => (
          <div key={entry.id} className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-color)] flex items-center justify-between">
            <div className="flex items-center gap-4">
              {entry.workflow === 'script' ? <FileText className="text-[var(--accent-pink)]" /> : <MessageSquare className="text-[var(--accent-purple)]" />}
              <div>
                <p className="font-medium">{entry.product?.name || 'Unknown'}</p>
                <p className="text-xs text-[var(--text-secondary)]">{entry.workflow} • {new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <span className="text-xs text-[var(--text-secondary)]">{entry.id.slice(0, 8)}...</span>
          </div>
        ))}
        {history.length === 0 && (
          <div className="text-center py-12 text-[var(--text-secondary)]">No history yet</div>
        )}
      </div>
    </div>
  );
}
