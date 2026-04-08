import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  FileText,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useDashboard } from '../core/hooks/useDashboard';
import Tooltip from '../core/components/Tooltip';

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, serverStatus, error, loading, formattedLastRefresh, retry } =
    useDashboard();

  const cards = useMemo(
    () => [
      {
        label: 'Sản phẩm',
        value: stats.products,
        icon: Package,
        color: 'text-[var(--accent-cyan)]',
        tooltip: 'Tổng số sản phẩm đang quản lý',
        route: '/products',
      },
      {
        label: 'Kịch bản',
        value: stats.scripts,
        icon: FileText,
        color: 'text-[var(--accent-pink)]',
        tooltip: 'Tổng số kịch bản AI đã tạo',
        route: '/scripts',
      },
      {
        label: 'Caption',
        value: stats.captions,
        icon: MessageSquare,
        color: 'text-[var(--accent-purple)]',
        tooltip: 'Tổng số caption đã tạo',
        route: '/captions',
      },
      {
        label: 'Quét Trend',
        value: stats.trends,
        icon: TrendingUp,
        color: 'text-green-400',
        tooltip: 'Số xu hướng đã thu thập',
        route: '/trends',
      },
    ],
    [stats]
  );

  const quickStartActions = useMemo(
    () => [
      {
        step: '1',
        title: 'Thêm sản phẩm',
        description: 'Nhập từ CSV hoặc thêm thủ công',
        color: 'text-[var(--accent-cyan)]',
        route: '/products',
        icon: Package,
      },
      {
        step: '2',
        title: 'Tạo nội dung',
        description: 'Tạo kịch bản & caption tự động',
        color: 'text-[var(--accent-pink)]',
        route: '/scripts',
        icon: FileText,
      },
      {
        step: '3',
        title: 'Xuất & sử dụng',
        description: 'Copy, xuất file hoặc dùng TTS',
        color: 'text-[var(--accent-purple)]',
        route: '/captions',
        icon: MessageSquare,
      },
    ],
    []
  );

  const statusConfig = {
    loading: {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      label: '⏳ Đang tải...',
    },
    online: {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      label: 'API hoạt động',
    },
    offline: {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      label: 'API ngoại tuyến',
    },
  };

  const currentStatus = statusConfig[serverStatus];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Error banner with retry */}
      {error && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="shrink-0 text-red-400" size={20} />
            <div>
              <p className="text-sm font-medium text-red-400">
                Không thể tải dữ liệu
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-secondary)]">
                {error}
              </p>
            </div>
          </div>
          <button
            onClick={retry}
            className="ml-4 flex items-center gap-2 rounded-lg bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/30"
          >
            <RotateCcw size={14} />
            Thử lại
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">Tổng quan</h2>
          {formattedLastRefresh && !loading && (
            <p className="mt-1 flex items-center gap-1 text-xs text-[var(--text-secondary)]">
              <Clock size={12} />
              Cập nhật lúc {formattedLastRefresh}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Tooltip
            content={
              serverStatus === 'online'
                ? 'Máy chủ đang hoạt động'
                : serverStatus === 'offline'
                  ? 'Máy chủ không khả dụng'
                  : 'Đang kết nối...'
            }
            position="left"
          >
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${currentStatus.bg} ${currentStatus.text}`}
            >
              {currentStatus.label}
            </span>
          </Tooltip>
          {!loading && serverStatus === 'online' && (
            <Tooltip content="Làm mới dữ liệu" position="left">
              <button
                onClick={retry}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-1.5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
              >
                <RotateCcw size={16} />
              </button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color, tooltip, route }) => (
          <button
            key={label}
            onClick={() => navigate(route)}
            className="group cursor-pointer rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 text-left transition-all hover:border-[var(--accent-cyan)]/50 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Tooltip content={tooltip} position="top">
                  <p className="text-sm text-[var(--text-secondary)]">
                    {label}
                  </p>
                </Tooltip>
                {loading ? (
                  <div className="mt-1 h-9 w-16 animate-pulse rounded bg-[var(--bg-secondary)]" />
                ) : (
                  <p className="mt-1 text-3xl font-bold">{value}</p>
                )}
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-secondary)] transition-transform group-hover:scale-110">
                {loading ? (
                  <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--bg-secondary)]" />
                ) : (
                  <Icon className={color} size={28} />
                )}
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1 text-xs text-[var(--text-secondary)] opacity-0 transition-opacity group-hover:opacity-100">
              <span>Xem chi tiết</span>
              <ArrowRight size={12} />
            </div>
          </button>
        ))}
      </div>

      {/* Quick start */}
      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 sm:p-6">
        <h3 className="mb-4 text-base font-semibold sm:text-lg">
          Bắt đầu nhanh
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickStartActions.map(
            ({ step, title, description, color, route }) => (
              <button
                key={step}
                onClick={() => navigate(route)}
                className="group cursor-pointer rounded-lg bg-[var(--bg-secondary)] p-4 text-left transition-all hover:border hover:border-[var(--accent-cyan)]/30 hover:bg-[var(--bg-card)]"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-card)] font-bold ${color} transition-transform group-hover:scale-110`}
                  >
                    {step}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${color}`}>{title}</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      {description}
                    </p>
                  </div>
                  <ArrowRight
                    size={16}
                    className="mt-1 text-[var(--text-secondary)] opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"
                  />
                </div>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
