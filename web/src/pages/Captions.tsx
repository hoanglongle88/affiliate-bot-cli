import { useState } from "react";
import { Wand2, Copy, Check } from "lucide-react";

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

export default function Captions() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    platform: "tiktok",
    scriptSummary: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: {
            name: form.name,
            description: form.description,
            price: form.price,
            rating: "5",
            sold: "100",
          },
          scriptSummary: form.scriptSummary || form.description,
          platform: form.platform,
        }),
      });
      const data = await res.json();
      if (data.description) setResult(data.description);
      else alert(data.error || "Không thể tạo caption");
    } catch {
      alert("API chưa chạy. Khởi động bằng: npm run server");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const tags = result.hashtags.map((t: string) => `#${t}`).join(" ");
    navigator.clipboard.writeText(`${result.caption}\n\n${tags}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass =
    "w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm";

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">
        Caption Bài Đăng
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-[var(--bg-card)] rounded-xl p-4 sm:p-6 border border-[var(--border-color)] mb-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--accent-purple)] text-white font-medium disabled:opacity-50 text-sm"
        >
          {loading ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <Wand2 size={18} />
          )}
          {loading ? "Đang tạo..." : "Tạo Caption"}
        </button>
      </form>

      {result && (
        <div className="bg-[var(--bg-card)] rounded-xl p-4 sm:p-6 border border-[var(--border-color)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="font-semibold text-[var(--accent-purple)] text-sm sm:text-base">
              {result.headline || "Caption"}
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
              {copied ? "Đã copy!" : "Copy"}
            </button>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-[var(--text-secondary)] mb-1">📝 Caption</p>
              <p className="whitespace-pre-wrap">{result.caption}</p>
            </div>
            <div>
              <p className="text-[var(--text-secondary)] mb-1">🏷️ Hashtags</p>
              <p className="text-green-400 break-words">
                {result.hashtags.map((t: string) => `#${t}`).join(" ")}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-[var(--text-secondary)] text-xs pt-2 border-t border-[var(--border-color)]">
              <span>~{result.wordCount} từ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
