import { useState } from 'react';
import { Wand2, Copy, Check } from 'lucide-react';

const PLATFORMS = ['tiktok', 'youtube', 'facebook_reels', 'instagram_reels', 'facebook_ads'] as const;

export default function Captions() {
  const [form, setForm] = useState({ name: '', description: '', price: '', platform: 'tiktok', scriptSummary: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/captions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: { name: form.name, description: form.description, price: form.price, rating: '5', sold: '100' },
          scriptSummary: form.scriptSummary || form.description,
          platform: form.platform,
        }),
      });
      const data = await res.json();
      if (data.description) setResult(data.description);
      else alert(data.error || 'Failed to generate');
    } catch {
      alert('API server not running. Start with: npm run server');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const tags = result.hashtags.map((t: string) => `#${t}`).join(' ');
    navigator.clipboard.writeText(`${result.caption}\n\n${tags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-8">Captions</h2>

      <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)] mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <input className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm" placeholder="Product name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <select className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}>
            {PLATFORMS.map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
          </select>
        </div>
        <textarea className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm mb-4" placeholder="Product description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required />
        <input className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm mb-4" placeholder="Script summary (optional, uses description if empty)" value={form.scriptSummary} onChange={e => setForm({ ...form, scriptSummary: e.target.value })} />
        <input className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm mb-4" placeholder="Price (optional)" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--accent-purple)] text-white font-medium disabled:opacity-50">
          {loading ? <span className="animate-spin">⏳</span> : <Wand2 size={18} />}
          {loading ? 'Generating...' : 'Generate Caption'}
        </button>
      </form>

      {result && (
        <div className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--accent-purple)]">{result.headline || 'Caption'}</h3>
            <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--bg-secondary)] text-sm">
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[var(--text-secondary)] mb-1">📝 Caption</p>
              <p className="whitespace-pre-wrap">{result.caption}</p>
            </div>
            <div>
              <p className="text-[var(--text-secondary)] mb-1">🏷️ Hashtags</p>
              <p className="text-green-400">{result.hashtags.map((t: string) => `#${t}`).join(' ')}</p>
            </div>
            <div className="flex gap-4 text-[var(--text-secondary)] text-xs pt-2 border-t border-[var(--border-color)]">
              <span>~{result.wordCount} words</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
