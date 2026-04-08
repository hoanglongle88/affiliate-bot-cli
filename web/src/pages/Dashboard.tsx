import { useState, useEffect } from "react";
import {
  Package,
  FileText,
  MessageSquare,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { getProducts, getHistory, checkHealth } from "../lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    scripts: 0,
    captions: 0,
    trends: 0,
  });
  const [status, setStatus] = useState<string>("đang kiểm tra...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, history] = await Promise.all([
          getProducts({ limit: 1 }), // Chỉ lấy 1 để lấy total count
          getHistory(),
        ]);
        const scripts = history.filter((h) => h.workflow === "script").length;
        const captions = history.filter(
          (h) => h.workflow === "description",
        ).length;
        const trends = history.filter((h) => h.workflow === "trend").length;
        setStats({
          products: productsRes.products.length,
          scripts,
          captions,
          trends,
        });
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Không thể tải dữ liệu");
      }
    };
    load();

    checkHealth()
      .then(() => setStatus("hoạt động"))
      .catch(() => setStatus("ngoại tuyến"));
  }, []);

  const cards = [
    {
      label: "Sản phẩm",
      value: stats.products,
      icon: Package,
      color: "text-[var(--accent-cyan)]",
    },
    {
      label: "Kịch bản",
      value: stats.scripts,
      icon: FileText,
      color: "text-[var(--accent-pink)]",
    },
    {
      label: "Caption",
      value: stats.captions,
      icon: MessageSquare,
      color: "text-[var(--accent-purple)]",
    },
    {
      label: "Quét Trend",
      value: stats.trends,
      icon: TrendingUp,
      color: "text-green-400",
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-400 shrink-0" size={20} />
          <div>
            <p className="font-medium text-sm text-red-400">
              Không thể tải dữ liệu
            </p>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {error}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold">Tổng quan</h2>
        <span
          className={`self-start px-3 py-1 rounded-full text-sm font-medium ${status === "hoạt động" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
        >
          API {status}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{label}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
              </div>
              <Icon className={color} size={32} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--bg-card)] rounded-xl p-4 sm:p-6 border border-[var(--border-color)]">
        <h3 className="text-base sm:text-lg font-semibold mb-4">
          Bắt đầu nhanh
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
            <p className="font-medium text-[var(--accent-cyan)]">
              1. Thêm sản phẩm
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Nhập từ CSV hoặc thêm thủ công
            </p>
          </div>
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
            <p className="font-medium text-[var(--accent-pink)]">
              2. Tạo nội dung
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Tạo kịch bản & caption tự động
            </p>
          </div>
          <div className="p-4 bg-[var(--bg-secondary)] rounded-lg">
            <p className="font-medium text-[var(--accent-purple)]">
              3. Xuất & sử dụng
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Copy, xuất file hoặc dùng TTS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
