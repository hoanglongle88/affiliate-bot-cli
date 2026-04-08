import { useState, useEffect } from 'react';
import { Copy, Check, Image } from 'lucide-react';
import { getProducts } from '../core/services';
import type {
  Product,
  ImageBriefResult,
  AdPlatform,
  AspectRatio,
} from '../core/interfaces';
import {
  AD_PLATFORM_LABELS,
  AD_PLATFORMS,
  ASPECT_RATIOS,
  PROMPT_COLORS,
  PROMPT_KEYS,
  PROMPT_LABELS,
} from '../core/constants';

export default function ImageCreator() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProductName, setSelectedProductName] = useState('');
  const [adPlatform, setAdPlatform] = useState<AdPlatform>('facebook');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImageBriefResult | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getProducts()
      .then((res) => setProducts(res.products))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      const p = products.find((p) => p.id === selectedProductId);
      if (p) setSelectedProductName(p.name);
    }
  }, [selectedProductId, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const product = products.find((p) => p.id === selectedProductId);
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: selectedProductName || 'Sản phẩm',
          category: 'Đa ngành hàng',
          adPlatform,
          aspectRatio,
          mainMessage: product?.description || selectedProductName,
          price: product?.price || 'Chưa có',
          productId: selectedProductId || null,
        }),
      });
      const data = await res.json();
      if (data.brief) setResult(data.brief);
      else alert(data.error || 'Không thể tạo brief ảnh');
    } catch {
      alert('API chưa chạy. Khởi động bằng: npm run server');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `SAFE:\n${result.prompts.safe}\n\nBOLD:\n${result.prompts.bold}\n\nLIFESTYLE:\n${result.prompts.lifestyle}\n\nNegative: ${result.negativePrompt}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectClass =
    'bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="mb-6 text-xl font-bold sm:mb-8 sm:text-2xl">
        Creative Brief Ảnh Ads
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mb-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6"
      >
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <select
            className={selectClass}
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
          >
            <option value="">-- Chọn sản phẩm --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={adPlatform}
            onChange={(e) => setAdPlatform(e.target.value as AdPlatform)}
          >
            {AD_PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {AD_PLATFORM_LABELS[p]}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
          >
            {ASPECT_RATIOS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !selectedProductId}
          className="flex items-center gap-2 rounded-lg bg-[var(--accent-cyan)] px-6 py-2 text-sm font-medium text-[var(--bg-primary)] disabled:opacity-50"
        >
          {loading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <Image size={18} />
          )}
          {loading ? 'Đang tạo...' : 'Tạo Brief Ảnh'}
        </button>
      </form>

      {result && (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-[var(--accent-cyan)] sm:text-base">
              📸 Creative Brief
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
              {copied ? 'Đã copy!' : 'Copy Prompts'}
            </button>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">🎬 Format</p>
              <p className="text-sm font-semibold">{result.adFormat}</p>
            </div>
            <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">🎨 Visual</p>
              <p className="text-sm font-semibold">{result.visualStyle}</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="mb-2 text-xs text-[var(--text-secondary)]">
              🎨 Bảng màu đề xuất
            </p>
            <div className="flex flex-wrap gap-3">
              {result.colorPalette.map((c: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded border border-[var(--border-color)]"
                    style={{ backgroundColor: c }}
                  />
                  <span className="font-mono text-xs">{c}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {PROMPT_KEYS.map((key, idx) => (
              <div
                key={key}
                className="rounded-lg bg-[var(--bg-secondary)] p-4"
              >
                <p
                  className={`mb-2 text-sm font-semibold ${PROMPT_COLORS[idx]}`}
                >
                  {PROMPT_LABELS[idx]}
                </p>
                <p className="text-sm">{result.prompts[key]}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-lg bg-[var(--bg-secondary)] p-4">
            <p className="mb-2 text-sm font-semibold text-red-400">
              🚫 Negative Prompt
            </p>
            <p className="text-sm">{result.negativePrompt}</p>
          </div>

          <div className="mt-4 rounded-lg bg-[var(--bg-secondary)] p-4">
            <p className="mb-2 text-sm font-semibold text-[var(--text-secondary)]">
              📸 Ghi chú chụp
            </p>
            <p className="text-sm">{result.shootingNotes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
