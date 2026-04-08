import { useState, useEffect } from 'react';
import { checkHealth } from '../lib/api';
import { CheckCircle, XCircle, RefreshCw, Clock } from 'lucide-react';

export default function ServerStatus() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealth(data);
    } catch {
      setError('API server is not running');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <div className="p-8 text-[var(--text-secondary)]">Checking...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Server Status</h2>
        <button onClick={load} className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)] mb-6">
        <div className="flex items-center gap-4 mb-4">
          {health ? <CheckCircle className="text-green-400" size={32} /> : <XCircle className="text-red-400" size={32} />}
          <div>
            <p className="text-lg font-semibold">{health ? 'Online' : 'Offline'}</p>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </div>

        {health && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                <Clock size={16} /> Uptime
              </div>
              <p className="text-xl font-bold mt-1">{Math.round(health.uptime)}s</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
              <div className="flex items-center gap-2 text-[var(--text-secondary)] text-sm">
                <Clock size={16} /> Timestamp
              </div>
              <p className="text-sm mt-1 font-mono">{health.timestamp}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)]">
        <h3 className="font-semibold mb-4">API Endpoints</h3>
        <div className="space-y-2 text-sm font-mono">
          <div className="flex items-center gap-2"><span className="text-green-400">POST</span> /api/scripts</div>
          <div className="flex items-center gap-2"><span className="text-green-400">POST</span> /api/captions</div>
          <div className="flex items-center gap-2"><span className="text-green-400">GET</span> /api/products</div>
          <div className="flex items-center gap-2"><span className="text-green-400">POST</span> /api/products</div>
          <div className="flex items-center gap-2"><span className="text-green-400">DELETE</span> /api/products/:id</div>
          <div className="flex items-center gap-2"><span className="text-green-400">POST</span> /api/trends/scan</div>
          <div className="flex items-center gap-2"><span className="text-green-400">GET</span> /api/history</div>
          <div className="flex items-center gap-2"><span className="text-green-400">DELETE</span> /api/history/:id</div>
        </div>
      </div>

      {!health && (
        <div className="mt-6 bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)]">
          <h3 className="font-semibold mb-2">How to start the server</h3>
          <pre className="bg-[var(--bg-secondary)] rounded-lg p-4 text-sm font-mono">npm run server</pre>
          <p className="text-sm text-[var(--text-secondary)] mt-2">Default port: 3000</p>
        </div>
      )}
    </div>
  );
}
