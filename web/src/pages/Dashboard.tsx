import { useState, useEffect } from 'react';
import { Package, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { getProducts, getHistory, checkHealth } from '../lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, scripts: 0, captions: 0, trends: 0 });
  const [status, setStatus] = useState<string>('checking...');

  useEffect(() => {
    const load = async () => {
      try {
        const [products, history] = await Promise.all([getProducts(), getHistory()]);
        const scripts = history.filter((h: any) => h.workflow === 'script').length;
        const captions = history.filter((h: any) => h.workflow === 'description').length;
        const trends = history.filter((h: any) => h.workflow === 'trend').length;
        setStats({ products: products.length, scripts, captions, trends });
      } catch {
        setStats({ products: 0, scripts: 0, captions: 0, trends: 0 });
      }
    };
    load();

    checkHealth()
      .then(() => setStatus('online'))
      .catch(() => setStatus('offline'));
  }, []);

  const cards = [
    { label: 'Products', value: stats.products, icon: Package, color: 'text-[var(--accent-cyan)]' },
    { label: 'Scripts', value: stats.scripts, icon: FileText, color: 'text-[var(--accent-pink)]' },
    { label: 'Captions', value: stats.captions, icon: MessageSquare, color: 'text-[var(--accent-purple)]' },
    { label: 'Trend Scans', value: stats.trends, icon: TrendingUp, color: 'text-green-400' },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          API {status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
              </div>
              <Icon className={color} size={32} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)]">
        <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
            <p className="font-medium text-[var(--accent-cyan)]">1. Add Product</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Import from CSV or add manually</p>
          </div>
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
            <p className="font-medium text-[var(--accent-pink)]">2. Create Content</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Generate scripts & captions</p>
          </div>
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
            <p className="font-medium text-[var(--accent-purple)]">3. Export & Use</p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Copy, export, or use TTS</p>
          </div>
        </div>
      </div>
    </div>
  );
}
