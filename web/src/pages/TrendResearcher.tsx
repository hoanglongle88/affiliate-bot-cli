import { useState } from 'react';
import { Wand2, Copy, Check } from 'lucide-react';

const NICHES = [
  { id: 'gia-dung', name: 'Gia dụng' },
  { id: 'thoi-trang-nu', name: 'Thời trang nữ' },
  { id: 'thoi-trang-nam', name: 'Thời trang nam' },
  { id: 'cong-nghe', name: 'Công nghệ' },
  { id: 'my-pham', name: 'Mỹ phẩm' },
  { id: 'suc-khoe', name: 'Sức khoẻ' },
  { id: 'me-be', name: 'Mẹ & bé' },
  { id: 'nha-cua', name: 'Nhà cửa' },
  { id: 'the-thao', name: 'Thể thao' },
  { id: 'thu-cung', name: 'Thú cưng' },
  { id: 'oto-xe-may', name: 'Ô tô / Xe máy' },
  { id: 'do-an', name: 'Đồ ăn' },
];

export default function TrendResearcher() {
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [selectedNiche, setSelectedNiche] = useState('');
  const [result, setResult] = useState<any>(null);
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
      <h2 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8">Nghiên cứu Xu hướng</h2>

      <form onSubmit={handleScan} className="bg-[var(--bg-card)] rounded-xl p-4 sm:p-6 border border-[var(--border-color)] mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="mode" checked={autoMode} onChange={() => setAutoMode(true)} className="accent-[var(--accent-cyan)]" />
            <span className="text-sm">🤖 Tự động (AI chọn ngách)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="mode" checked={!autoMode} onChange={() => setAutoMode(false)} className="accent-[var(--accent-cyan)]" />
            <span className="text-sm">🎯 Chọn ngách cụ thể</span>
          </label>
        </div>

        {!autoMode && (
          <select
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm mb-4"
            value={selectedNiche}
            onChange={e => setSelectedNiche(e.target.value)}
            required
          >
            <option value="">-- Chọn ngách --</option>
            {NICHES.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        )}

        <button type="submit" disabled={loading || (!autoMode && !selectedNiche)} className="flex items-center gap-2 px-6 py-2 rounded-lg bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-medium disabled:opacity-50 text-sm">
          {loading ? <span className="animate-spin">⏳</span> : <Wand2 size={18} />}
          {loading ? 'Đang quét...' : 'Quét Trend'}
        </button>
      </form>

      {result && (
        <div className="bg-[var(--bg-card)] rounded-xl p-4 sm:p-6 border border-[var(--border-color)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="font-semibold text-[var(--accent-pink)] text-sm sm:text-base">🏆 {result.brief.product.name}</h3>
            <button onClick={handleCopy} className="self-start flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--bg-secondary)] text-sm">
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? 'Đã copy!' : 'Copy'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--text-secondary)]">💰 Giá</p>
              <p className="font-semibold text-sm">{result.brief.product.price}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--text-secondary)]">📈 Trend</p>
              <p className="font-semibold text-sm">{result.brief.product.trendPercent}</p>
            </div>
            <div className="bg-[var(--bg-secondary)] rounded-lg p-3">
              <p className="text-xs text-[var(--text-secondary)]">👁️ Lượt xem</p>
              <p className="font-semibold text-sm">{result.brief.product.views}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-[var(--text-secondary)] mb-1">🎣 Hook</p>
              <p className="text-yellow-400">{result.brief.hook}</p>
            </div>
            <div>
              <p className="text-[var(--text-secondary)] mb-1">💡 Góc tiếp cận</p>
              <p>{result.brief.angle}</p>
            </div>
            <div>
              <p className="text-[var(--text-secondary)] mb-1">🎯 Pain point</p>
              <p>{result.brief.painPoint}</p>
            </div>
            <div>
              <p className="text-[var(--text-secondary)] mb-1">📢 CTA</p>
              <p className="text-[var(--accent-cyan)]">{result.brief.ctaAngle}</p>
            </div>
            <div>
              <p className="text-[var(--text-secondary)] mb-1">🏷️ Hashtags</p>
              <p className="text-green-400">{result.brief.hashtags.join(' ')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
