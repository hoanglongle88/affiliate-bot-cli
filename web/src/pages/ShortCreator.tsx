import { useState, useEffect } from 'react';
import { Copy, Check, Film } from 'lucide-react';
import { getProducts, createShortVideo } from '../core/services';
import type {
  Product,
  ShortVideoResult,
  ShortVideoTimelineSegment,
  Platform,
} from '../core/interfaces';
import { PLATFORM_LABELS, PLATFORMS } from '../core/constants';

export default function ShortCreator() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProductName, setSelectedProductName] = useState('');
  const [platform, setPlatform] = useState<Platform>('tiktok');
  const [hook, setHook] = useState('');
  const [body, setBody] = useState('');
  const [cta, setCta] = useState('');
  const [estimatedDuration, setEstimatedDuration] = useState('30 giây');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ShortVideoResult | null>(null);
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
      const data = await createShortVideo({
        productName: selectedProductName || 'Sản phẩm',
        script: { platform, hook, body, voiceoverCTA: cta, estimatedDuration },
        productId: selectedProductId || null,
      });
      if (data.prompt) setResult(data.prompt);
      else alert(data.error || 'Không thể tạo video prompt');
    } catch {
      alert('API chưa chạy. Khởi động bằng: npm run server');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.videoPromptFull);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectClass =
    'bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm';
  const inputClass =
    'w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="mb-6 text-xl font-bold sm:mb-8 sm:text-2xl">
        Video Prompt cho AI Veo
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
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABELS[p]}
              </option>
            ))}
          </select>
          <input
            className={inputClass}
            placeholder="Thời lượng (vd: 30 giây)"
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(e.target.value)}
          />
        </div>

        <textarea
          className={`${inputClass} mb-4`}
          placeholder="Hook (mở đầu)"
          value={hook}
          onChange={(e) => setHook(e.target.value)}
          rows={2}
          required
        />
        <textarea
          className={`${inputClass} mb-4`}
          placeholder="Nội dung chính (body)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          required
        />
        <input
          className={`${inputClass} mb-4`}
          placeholder="CTA (kêu gọi hành động)"
          value={cta}
          onChange={(e) => setCta(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-[var(--accent-purple)] px-6 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <Film size={18} />
          )}
          {loading ? 'Đang tạo...' : 'Tạo Video Prompt'}
        </button>
      </form>

      {result && (
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-[var(--accent-purple)] sm:text-base">
              🎬 Storyboard Timeline
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
              {copied ? 'Đã copy!' : 'Copy Prompt'}
            </button>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">
                ⏱️ Tổng thời lượng
              </p>
              <p className="text-sm font-semibold">{result.totalDuration}</p>
            </div>
            <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">📐 Tỷ lệ</p>
              <p className="text-sm font-semibold">{result.aspectRatio}</p>
            </div>
            <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
              <p className="text-xs text-[var(--text-secondary)]">
                📊 Chất lượng
              </p>
              <p className="text-sm font-semibold">{result.visualQuality}</p>
            </div>
          </div>

          <p className="mb-3 text-xs text-[var(--text-secondary)]">
            🎨 Phong cách: {result.visualStyle}
          </p>

          {/* Timeline segments */}
          <div className="mb-4 space-y-3">
            {result.timeline.map(
              (seg: ShortVideoTimelineSegment, i: number) => (
                <div
                  key={i}
                  className="rounded-lg border-l-2 border-[var(--accent-purple)] bg-[var(--bg-secondary)] p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-mono text-xs text-[var(--accent-cyan)]">
                      {seg.range}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)]">
                      {seg.content}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)]">
                    {seg.prompt}
                  </p>
                </div>
              )
            )}
          </div>

          {/* Full prompt */}
          <div className="rounded-lg bg-[var(--bg-secondary)] p-4">
            <p className="mb-2 text-xs text-[var(--text-secondary)]">
              📝 Full Prompt (copy để gửi cho Veo)
            </p>
            <pre className="font-mono text-sm break-words whitespace-pre-wrap text-[var(--text-primary)]">
              {result.videoPromptFull}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
