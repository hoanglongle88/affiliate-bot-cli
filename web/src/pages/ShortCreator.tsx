import { useState, useEffect } from "react";
import { Copy, Check, Film } from "lucide-react";
import { getProducts } from "../lib/api";

const PLATFORMS = [
  "tiktok",
  "youtube",
  "facebook_reels",
  "instagram_reels",
  "facebook_ads",
] as const;

const PLATFORM_LABELS: Record<string, string> = {
  tiktok: "TikTok",
  youtube: "YouTube Shorts",
  facebook_reels: "Facebook Reels",
  instagram_reels: "Instagram Reels",
  facebook_ads: "Facebook Ads",
};

export default function ShortCreator() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProductName, setSelectedProductName] = useState("");
  const [platform, setPlatform] = useState("tiktok");
  const [hook, setHook] = useState("");
  const [body, setBody] = useState("");
  const [cta, setCta] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("30 giây");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getProducts()
      .then(setProducts)
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
      const res = await fetch("/api/short", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: selectedProductName || "Sản phẩm",
          script: {
            platform,
            hook,
            body,
            voiceoverCTA: cta,
            estimatedDuration,
          },
          productId: selectedProductId || null,
          scriptId: null,
        }),
      });
      const data = await res.json();
      if (data.prompt) setResult(data.prompt);
      else alert(data.error || "Không thể tạo video prompt");
    } catch {
      alert("API chưa chạy. Khởi động bằng: npm run server");
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
    "bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm";
  const inputClass =
    "w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">
        Video Prompt cho AI Veo
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--bg-card)] rounded-xl p-4 sm:p-6 border border-[var(--border-color)] mb-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
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
            onChange={(e) => setPlatform(e.target.value)}
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
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--accent-purple)] text-white font-medium disabled:opacity-50 text-sm"
        >
          {loading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <Film size={18} />
          )}
          {loading ? "Đang tạo..." : "Tạo Video Prompt"}
        </button>
      </form>

      {result && (
        <div className="bg-[var(--bg-card)] rounded-xl p-4 sm:p-6 border border-[var(--border-color)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="font-semibold text-[var(--accent-purple)] text-sm sm:text-base">
              🎬 Storyboard Timeline
            </h3>
            <button
              onClick={handleCopy}
              className="self-start flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--bg-secondary)] text-sm"
            >
              {copied ? (
                <Check size={14} className="text-green-400" />
              ) : (
                <Copy size={14} />
              )}
              {copied ? "Đã copy!" : "Copy Prompt"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--text-secondary)]">
                ⏱️ Tổng thời lượng
              </p>
              <p className="font-semibold text-sm">{result.totalDuration}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--text-secondary)]">📐 Tỷ lệ</p>
              <p className="font-semibold text-sm">{result.aspectRatio}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--text-secondary)]">
                📊 Chất lượng
              </p>
              <p className="font-semibold text-sm">{result.visualQuality}</p>
            </div>
          </div>

          <p className="text-xs text-[var(--text-secondary)] mb-3">
            🎨 Phong cách: {result.visualStyle}
          </p>

          {/* Timeline segments */}
          <div className="space-y-3 mb-4">
            {result.timeline.map((seg: any, i: number) => (
              <div
                key={i}
                className="bg-[var(--bg-secondary)] rounded-lg p-4 border-l-2 border-[var(--accent-purple)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[var(--accent-cyan)]">
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
            ))}
          </div>

          {/* Full prompt */}
          <div className="bg-[var(--bg-secondary)] rounded-lg p-4">
            <p className="text-xs text-[var(--text-secondary)] mb-2">
              📝 Full Prompt (copy để gửi cho Veo)
            </p>
            <pre className="text-sm whitespace-pre-wrap break-words font-mono text-[var(--text-primary)]">
              {result.videoPromptFull}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
