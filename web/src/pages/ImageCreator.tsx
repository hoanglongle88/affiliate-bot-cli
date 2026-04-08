import { useState, useEffect } from 'react';
import { Copy, Check, Image } from 'lucide-react';
import { getProducts } from '../lib/api';

const AD_PLATFORMS = ['facebook', 'tiktok', 'shopee', 'lazada'] as const;
const AD_PLATFORM_LABELS: Record<string, string> = {
  facebook: 'Facebook / Instagram',
  tiktok: 'TikTok Ads',
  shopee: 'Shopee',
  lazada: 'Lazada',
};

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1 — Vuông (Feed, Shopee)' },
  { value: '9:16', label: '9:16 — Dọc (Stories, Reels, TikTok)' },
  { value: '16:9', label: '16:9 — Ngang (YouTube, Banner)' },
];

export default function ImageCreator() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adPlatform, setAdPlatform] = useState('facebook');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getProducts().then(setProducts).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    // Mock API call since we don't have an image brief endpoint yet
    setTimeout(() => {
      setResult({
        adFormat: 'feed-square',
        visualStyle: 'Product photography, clean background',
        colorPalette: ['#FFFFFF', '#F5F5F5', '#333333'],
        prompts: {
          safe: 'Professional product photo on clean white background, studio lighting, 45-degree angle, soft shadows, e-commerce style',
          bold: 'Eye-catching product showcase, dramatic rim lighting, vibrant color pop, stop-scroll visual, high contrast',
          lifestyle: 'Product in real-life setting, natural window lighting, lifestyle photography, warm tones, authentic feel',
        },
        negativePrompt: 'blurry, text overlay, watermark, low quality, pixelated, distorted, cartoon, illustration',
        shootingNotes: 'Chụp sản phẩm trên nền trắng, ánh sáng studio, góc 45 độ, có bóng đổ nhẹ',
      });
      setLoading(false);
    }, 1500);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `SAFE:\n${result.prompts.safe}\n\nBOLD:\n${result.prompts.bold}\n\nLIFESTYLE:\n${result.prompts.lifestyle}\n\nNegative: ${result.negativePrompt}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Creative Brief Ảnh Ads</h2>

      <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] rounded-xl p-4 sm:p-6 border border-[var(--border-color)] mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <select
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm"
            value={selectedProductId}
            onChange={e => setSelectedProductId(e.target.value)}
            required
          >
            <option value="">-- Chọn sản phẩm --</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm"
            value={adPlatform}
            onChange={e => setAdPlatform(e.target.value)}
          >
            {AD_PLATFORMS.map(p => <option key={p} value={p}>{AD_PLATFORM_LABELS[p]}</option>)}
          </select>
          <select
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm"
            value={aspectRatio}
            onChange={e => setAspectRatio(e.target.value)}
          >
            {ASPECT_RATIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        <button type="submit" disabled={loading || !selectedProductId} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-medium disabled:opacity-50 text-sm">
          {loading ? <span className="animate-spin">⏳</span> : <Image size={18} />}
          {loading ? 'Đang tạo...' : 'Tạo Brief Ảnh'}
        </button>
      </form>

      {result && (
        <div className="bg-[var(--bg-card)] rounded-xl p-4 sm:p-6 border border-[var(--border-color)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="font-semibold text-[var(--accent-cyan)] text-sm sm:text-base">📸 Creative Brief</h3>
            <button onClick={handleCopy} className="self-start flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--bg-secondary)] text-sm">
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? 'Đã copy!' : 'Copy Prompts'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--text-secondary)]">🎬 Format</p>
              <p className="font-semibold text-sm">{result.adFormat}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--text-secondary)]">🎨 Visual</p>
              <p className="font-semibold text-sm">{result.visualStyle}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs text-[var(--text-secondary)] mb-2">🎨 Bảng màu đề xuất</p>
            <div className="flex gap-3">
              {result.colorPalette.map((c: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded border border-[var(--border-color)]" style={{ backgroundColor: c }} />
                  <span className="text-xs font-mono">{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: '🟢 SAFE', key: 'safe', color: 'text-green-400' },
              { label: '🟡 BOLD', key: 'bold', color: 'text-yellow-400' },
              { label: '🔵 LIFESTYLE', key: 'lifestyle', color: 'text-blue-400' },
            ].map(({ label, key, color }) => (
              <div key={key} className="bg-[var(--bg-secondary)] rounded-lg p-4">
                <p className={`text-sm font-semibold mb-2 ${color}`}>{label}</p>
                <p className="text-sm">{(result.prompts as any)[key]}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-[var(--bg-secondary)] rounded-lg p-4">
            <p className="text-sm font-semibold text-red-400 mb-2">🚫 Negative Prompt</p>
            <p className="text-sm">{result.negativePrompt}</p>
          </div>

          <div className="mt-4 bg-[var(--bg-secondary)] rounded-lg p-4">
            <p className="text-sm font-semibold text-[var(--text-secondary)] mb-2">📸 Ghi chú chụp</p>
            <p className="text-sm">{result.shootingNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
