import { useState } from 'react';
import { Wand2, Copy, Check } from 'lucide-react';
import type { TrendBriefResult } from '../core/interfaces';
import { NICHES } from '../core/constants';

export default function TrendResearcher() {
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [selectedNiche, setSelectedNiche] = useState('');
  const [result, setResult] = useState<TrendBriefResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/trends/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicheId: autoMode ? undefined : selectedNiche }),
      });
      const data = await res.json();
      if (data.product) setResult(data);
      else alert(data.error || 'Không thể quét trend');
    } catch {
      alert('API chưa chạy. Khởi động bằng: npm run server');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const b = result.brief;
    const text = `🏆 ${b.product.name}\n💰 ${b.product.price}\n🎣 ${b.hook}\n💡 ${b.angle}\n🎯 ${b.painPoint}\n📢 ${b.ctaAngle}\n#${b.hashtags.join(' #')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="mb-6 text-xl font-bold sm:mb-8 sm:text-2xl">
        Nghiên cứu Xu hướng
      </h2>

      <form
        onSubmit={handleScan}
        className="mb-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6"
      >
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="mode"
              checked={autoMode}
              onChange={() => setAutoMode(true)}
              className="accent-[var(--accent-cyan)]"
            />
            <span className="text-sm">🤖 Tự động (AI chọn ngách)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="mode"
              checked={!autoMode}
              onChange={() => setAutoMode(false)}
              className="accent-[var(--accent-cyan)]"
            />
            <span className="text-sm">🎯 Chọn ngách cụ thể</span>
          </label>
        </div>

        {!autoMode && (
          <select
            className="mb-4 w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-2 text-sm"
            value={selectedNiche}
            onChange={(e) => setSelectedNiche(e.target.value)}
            required
          >
            <option value="">-- Chọn ngách --</option>
            {NICHES.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        )}

        <button
          type="submit"
          disabled={loading || (!autoMode && !selectedNiche)}
          className="flex items-center gap-2 rounded-lg bg-[var(--accent-cyan)] px-6 py-2 text-sm font-medium text-[var(--bg-primary)] disabled:opacity-50"
        >
          {loading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <Wand2 size={18} />
          )}
          {loading ? 'Đang quét...' : 'Quét Trend'}
        </button>
      </form>

      {result && (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-[var(--accent-pink)] sm:text-base">
              🏆 {result.brief.product.name}
            </h3>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 self-start rounded-lg bg-[var(--bg-secondary)] px-3 py-1 text-sm"
            >
              {copied ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} />
              )}
              {copied ? 'Đã copy!' : 'Copy'}
            </button>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">💰 Giá</p>
              <p className="text-sm font-semibold">
                {result.brief.product.price}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">📈 Trend</p>
              <p className="text-sm font-semibold">
                {result.brief.product.trendPercent}
              </p>
            </div>
            <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">
                👁️ Lượt xem
              </p>
              <p className="text-sm font-semibold">
                {result.brief.product.views}
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="mb-1 text-[var(--text-secondary)]">🎣 Hook</p>
              <p className="text-yellow-400">{result.brief.hook}</p>
            </div>
            <div>
              <p className="mb-1 text-[var(--text-secondary)]">
                💡 Góc tiếp cận
              </p>
              <p>{result.brief.angle}</p>
            </div>
            <div>
              <p className="mb-1 text-[var(--text-secondary)]">🎯 Pain point</p>
              <p>{result.brief.painPoint}</p>
            </div>
            <div>
              <p className="mb-1 text-[var(--text-secondary)]">📢 CTA</p>
              <p className="text-[var(--accent-cyan)]">
                {result.brief.ctaAngle}
              </p>
            </div>
            <div>
              <p className="mb-1 text-[var(--text-secondary)]">🏷️ Hashtags</p>
              <p className="text-green-400">
                {result.brief.hashtags.join(' ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
