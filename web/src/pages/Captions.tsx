import { useState } from 'react';
import { Wand2, Copy, Check } from 'lucide-react';
import type { PostDescription } from '../core/interfaces';

const PLATFORMS = [
  'tiktok',
  'youtube',
  'facebook_reels',
  'instagram_reels',
  'facebook_ads',
] as const;

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: 'TikTok',
  youtube: 'YouTube Shorts',
  facebook_reels: 'Facebook Reels',
  instagram_reels: 'Instagram Reels',
  facebook_ads: 'Facebook Ads',
};

export default function Captions() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    platform: 'tiktok',
    scriptSummary: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PostDescription | null>(null);
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
          product: {
            name: form.name,
            description: form.description,
            price: form.price,
            rating: '5',
            sold: '100',
          },
          scriptSummary: form.scriptSummary || form.description,
          platform: form.platform,
        }),
      });
      const data = await res.json();
      if (data.description) setResult(data.description);
      else alert(data.error || 'Không thể tạo caption');
    } catch {
      alert('API chưa chạy. Khởi động bằng: npm run server');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const tags = result.hashtags.map((t) => `#${t}`).join(' ');
    navigator.clipboard.writeText(`${result.caption}\n\n${tags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass =
    'w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="mb-6 text-xl font-bold sm:mb-8 sm:text-2xl">
        Caption Bài Đăng
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mb-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6"
      >
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            className={inputClass}
            placeholder="Tên sản phẩm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <select
            className={inputClass}
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <textarea
          className={`${inputClass} mb-4`}
          placeholder="Mô tả sản phẩm"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          required
        />
        <input
          className={`${inputClass} mb-4`}
          placeholder="Tóm tắt kịch bản (tuỳ chọn)"
          value={form.scriptSummary}
          onChange={(e) => setForm({ ...form, scriptSummary: e.target.value })}
        />
        <input
          className={`${inputClass} mb-4`}
          placeholder="Giá (tuỳ chọn)"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-[var(--accent-purple)] px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <Wand2 size={18} />
          )}
          {loading ? 'Đang tạo...' : 'Tạo Caption'}
        </button>
      </form>

      {result && (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-[var(--accent-purple)] sm:text-base">
              {result.headline || 'Caption'}
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
          <div className="space-y-4 text-sm">
            <div>
              <p className="mb-1 text-[var(--text-secondary)]">📝 Caption</p>
              <p className="whitespace-pre-wrap">{result.caption}</p>
            </div>
            <div>
              <p className="mb-1 text-[var(--text-secondary)]">🏷️ Hashtags</p>
              <p className="break-words text-green-400">
                {result.hashtags.map((t) => `#${t}`).join(' ')}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 border-t border-[var(--border-color)] pt-2 text-xs text-[var(--text-secondary)]">
              <span>~{result.wordCount} từ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
