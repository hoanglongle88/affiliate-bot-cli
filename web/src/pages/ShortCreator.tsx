import { useState, useEffect } from 'react';
import { Copy, Check, Film } from 'lucide-react';
import { getProducts } from '../lib/api';

const PLATFORMS = ['tiktok', 'youtube', 'facebook_reels', 'instagram_reels', 'facebook_ads'] as const;

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: 'TikTok',
  youtube: 'YouTube Shorts',
  facebook_reels: 'Facebook Reels',
  instagram_reels: 'Instagram Reels',
  facebook_ads: 'Facebook Ads',
};

export default function ShortCreator() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedScriptId, setSelectedScriptId] = useState('');
  const [scripts, setScripts] = useState<any[]>([]);
  const [platform, setPlatform] = useState('tiktok');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetch(`/api/products/${selectedProductId}`)
        .then(r => r.json())
        .then(() => {
          // Fetch scripts for this product
          fetch('/api/history')
            .then(r => r.json())
            .then(data => {
              const productScripts = (data.history || []).filter(
                (h: any) => h.productId === selectedProductId && h.workflow === 'script'
              );
              setScripts(productScripts);
            })
            .catch(() => {});
        })
        .catch(() => {});
    }
  }, [selectedProductId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Mock API call since we don't have a short_video endpoint yet
    setTimeout(() => {
      setResult({
        styleAnalysis: 'Phong cách thực tế, năng động, phù hợp TikTok',
        totalDuration: '30s',
        visualStyle: 'Quay cận cảnh, ánh sáng tự nhiên',
        timeline: [
          { range: '00s-05s', content: 'Hook thu hút', prompt: 'Close-up product shot, natural lighting, dynamic entrance' },
          { range: '05s-20s', content: 'Giới thiệu sản phẩm', prompt: 'Product demonstration, hand holding product, smooth camera pan' },
          { range: '20s-25s', content: 'Lợi ích nổi bật', prompt: 'Split screen comparison, before/after, zoom in on features' },
          { range: '25s-30s', content: 'Kêu gọi hành động', prompt: 'Product on clean background, text overlay "Mua ngay", hand pointing to cart' },
        ],
        videoPromptFull: 'Hyper-realistic short video showcasing a modern product, natural lighting, smooth transitions between shots, cinematic color grading, 9:16 aspect ratio, professional product photography style',
        aspectRatio: '9:16',
        visualQuality: '1080p, 60fps',
      });
      setLoading(false);
    }, 2000);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.videoPromptFull);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Video Prompt cho AI Veo</h2>

      <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] rounded-xl p-4 sm:p-6 border border-[var(--border-color)] mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <select
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm"
            value={selectedProductId}
            onChange={e => { setSelectedProductId(e.target.value); setSelectedScriptId(''); }}
            required
          >
            <option value="">-- Chọn sản phẩm --</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm"
            value={platform}
            onChange={e => setPlatform(e.target.value)}
          >
            {PLATFORMS.map(p => <option key={p} value={p}>{PLATFORM_LABELS[p]}</option>)}
          </select>
        </div>

        {scripts.length > 0 && (
          <select
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm mb-4"
            value={selectedScriptId}
            onChange={e => setSelectedScriptId(e.target.value)}
          >
            <option value="">-- Chọn kịch bản (tuỳ chọn) --</option>
            {scripts.map((s: any) => (
              <option key={s.id} value={s.scriptId}>{s.history?.product?.name || 'Script'}</option>
            ))}
          </select>
        )}

        <button type="submit" disabled={loading || !selectedProductId} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--accent-purple)] text-white font-medium disabled:opacity-50 text-sm">
          {loading ? <span className="animate-spin">⏳</span> : <Film size={18} />}
          {loading ? 'Đang tạo...' : 'Tạo Video Prompt'}
        </button>
      </form>

      {result && (
        <div className="bg-[var(--bg-card)] rounded-xl p-4 sm:p-6 border border-[var(--border-color)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="font-semibold text-[var(--accent-purple)] text-sm sm:text-base">🎬 Storyboard Timeline</h3>
            <button onClick={handleCopy} className="self-start flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--bg-secondary)] text-sm">
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? 'Đã copy!' : 'Copy Prompt'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--text-secondary)]">⏱️ Tổng thời lượng</p>
              <p className="font-semibold text-sm">{result.totalDuration}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--text-secondary)]">📐 Tỷ lệ</p>
              <p className="font-semibold text-sm">{result.aspectRatio}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--text-secondary)]">📊 Chất lượng</p>
              <p className="font-semibold text-sm">{result.visualQuality}</p>
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] mb-3">🎨 Phong cách: {result.visualStyle}</p>

          {/* Timeline segments */}
          <div className="space-y-3 mb-4">
            {result.timeline.map((seg: any, i: number) => (
              <div key={i} className="bg-[var(--bg-secondary)] rounded-lg p-4 border-l-2 border-[var(--accent-purple)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[var(--accent-cyan)]">{seg.range}</span>
                  <span className="text-xs text-[var(--text-secondary)]">{seg.content}</span>
                </div>
                <p className="text-sm text-[var(--text-primary)]">{seg.prompt}</p>
              </div>
            ))}
          </div>

          {/* Full prompt */}
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
            <p className="text-xs text-[var(--text-secondary)] mb-2">📝 Full Prompt (copy để gửi cho Veo)</p>
            <pre className="text-sm whitespace-pre-wrap break-words font-mono text-[var(--text-primary)]">{result.videoPromptFull}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
