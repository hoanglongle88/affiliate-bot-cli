import { useState, useEffect } from "react";
import { FileText, MessageSquare, RefreshCw } from "lucide-react";
import { getHistory } from "../lib/api";
import type { HistoryEntry } from "../interfaces";

const WORKFLOW_LABELS: Record<string, string> = {
  script: "Kịch bản",
  description: "Caption",
  full: "Đầy đủ",
  trend: "Trend",
  image_brief: "Image Brief",
  short_video: "Short Video",
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading)
    return <div className="p-8 text-[var(--text-secondary)]">Đang tải...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold">
          Lịch sử ({history.length})
        </h2>
        <button
          onClick={load}
          className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-color)] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              {entry.workflow === "script" ||
              entry.workflow === "full" ||
              entry.workflow === "short_video" ? (
                <FileText
                  className="text-[var(--accent-pink)] shrink-0"
                  size={18}
                />
              ) : (
                <MessageSquare
                  className="text-[var(--accent-purple)] shrink-0"
                  size={18}
                />
              )}
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">
                  {entry.product?.name || "Không rõ"}
                </p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {WORKFLOW_LABELS[entry.workflow] || entry.workflow} •{" "}
                  {new Date(entry.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>
            <span className="text-xs text-[var(--text-secondary)] shrink-0 hidden sm:inline">
              {entry.id.slice(0, 8)}...
            </span>
          </div>
        ))}
        {history.length === 0 && (
          <div className="text-center py-12 text-[var(--text-secondary)] text-sm">
            Chưa có lịch sử
          </div>
        )}
      </div>
    </div>
  );
}
