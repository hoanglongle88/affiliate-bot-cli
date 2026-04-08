import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Wand2,
  Copy,
  Check,
  Trash2,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Filter,
  Search,
  RotateCw,
  ChevronDown,
  Square,
  CheckSquare,
  FileText,
} from 'lucide-react';
import type { VideoScript } from '../core/interfaces';
import { PLATFORM_LABELS, PLATFORMS } from '../core/constants';
import { useScripts } from '../core/hooks/useScripts';
import { useProducts } from '../core/hooks/useProducts';
import ErrorBoundary from '../core/components/ErrorBoundary';
import toast from 'react-hot-toast';

const MAX_DESCRIPTION_LENGTH = 500;

const ScriptDetail = ({
  script,
  onCopy,
  onCopySection,
  onRegenerate,
  onClose,
  copiedSection,
  regenerating,
}: {
  script: VideoScript;
  onCopy: () => void;
  onCopySection: (section: 'hook' | 'body' | 'cta') => void;
  onRegenerate: () => void;
  onClose: () => void;
  copiedSection: string | null;
  regenerating: boolean;
}) => (
  <div className="h-fit overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 shadow-sm sm:p-6">
    <div className="mb-6 flex flex-col gap-3 border-b border-[var(--border-color)] pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-[var(--accent-pink)] sm:text-base">
          {script.title}
        </h3>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
            {PLATFORM_LABELS[script.platform] || script.platform}
          </span>
          <span className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
            {script.wordCount} từ
          </span>
          <span className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
            ⏱️ {script.estimatedDuration}
          </span>
          {script.productId && (
            <span className="rounded-full bg-[var(--accent-cyan)]/10 px-2 py-0.5 text-[10px] text-[var(--accent-cyan)]">
              Có sản phẩm liên kết
            </span>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={onCopy}
          className="flex items-center gap-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-1.5 text-sm transition-colors hover:bg-[var(--border-color)]"
        >
          <FileText size={14} />
          <span>Copy toàn bộ</span>
        </button>
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className="flex items-center gap-2 rounded-lg border border-[var(--accent-cyan)] px-3 py-1.5 text-sm text-[var(--accent-cyan)] transition-colors hover:bg-[var(--accent-cyan)]/10 disabled:opacity-50"
        >
          <RotateCw size={14} className={regenerating ? 'animate-spin' : ''} />
          <span>{regenerating ? 'Đang viết...' : 'Viết lại'}</span>
        </button>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] lg:hidden"
        >
          <X size={18} />
        </button>
      </div>
    </div>

    <div className="space-y-5 text-sm">
      <div className="group">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase">
            🎣 Hook
          </p>
          <button
            onClick={() => onCopySection('hook')}
            className="rounded p-1 text-[var(--text-secondary)] opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--bg-card)] hover:text-[var(--accent-cyan)]"
          >
            {copiedSection === 'hook' ? (
              <Check size={12} className="text-green-400" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>
        <div className="rounded-lg border border-[var(--border-color)]/50 bg-[var(--bg-secondary)] p-3.5 text-yellow-400">
          {script.hook}
        </div>
      </div>
      <div className="group">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase">
            📝 Nội dung
          </p>
          <button
            onClick={() => onCopySection('body')}
            className="rounded p-1 text-[var(--text-secondary)] opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--bg-card)] hover:text-[var(--accent-cyan)]"
          >
            {copiedSection === 'body' ? (
              <Check size={12} className="text-green-400" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>
        <div className="rounded-lg border border-[var(--border-color)]/50 bg-[var(--bg-secondary)] p-3.5 whitespace-pre-wrap">
          {script.body}
        </div>
      </div>
      <div className="group">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-xs font-bold tracking-wider text-[var(--text-secondary)] uppercase">
            📢 CTA
          </p>
          <button
            onClick={() => onCopySection('cta')}
            className="rounded p-1 text-[var(--text-secondary)] opacity-0 transition-all group-hover:opacity-100 hover:bg-[var(--bg-card)] hover:text-[var(--accent-cyan)]"
          >
            {copiedSection === 'cta' ? (
              <Check size={12} className="text-green-400" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>
        <div className="rounded-lg border border-[var(--border-color)]/50 bg-[var(--bg-secondary)] p-3.5 text-[var(--accent-cyan)]">
          {script.voiceoverCTA}
        </div>
      </div>
    </div>
  </div>
);

function ScriptsContent() {
  const {
    scripts,
    loading,
    generating,
    regenerating,
    page,
    totalPages,
    total,
    selectedPlatform,
    selectedScript,
    setSelectedScript,
    selectedIds,
    generateScript,
    regenerateScript,
    deleteScript,
    bulkDeleteScripts,
    exportScripts,
    goToPage,
    changePlatform,
    refresh,
    toggleSelect,
    selectAll,
    clearSelection,
  } = useScripts();

  const { products } = useProducts();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    rating: '',
    sold: '',
    usp: '',
    platform: 'tiktok',
    productId: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [showPlatformFilter, setShowPlatformFilter] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [lastGenTime, setLastGenTime] = useState<number>(0);
  const GEN_COOLDOWN = 3000; // 3 seconds debounce

  const resetForm = useCallback(() => {
    setForm({
      name: '',
      description: '',
      price: '',
      rating: '',
      sold: '',
      usp: '',
      platform: 'tiktok',
      productId: '',
    });
    setFormErrors({});
  }, []);

  const handleProductSelect = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      if (product) {
        setForm({
          name: product.name,
          description: product.description,
          price: product.price === 'Chưa có' ? '' : product.price,
          rating: product.rating === 'Chưa có' ? '' : product.rating,
          sold: product.sold === 'Chưa có' ? '' : product.sold,
          usp: product.usp || '',
          platform: form.platform,
          productId: product.id,
        });
      }
      setShowProductSearch(false);
      setProductSearch('');
    },
    [products, form.platform]
  );

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [products, productSearch]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      // Debounce check
      const now = Date.now();
      if (now - lastGenTime < GEN_COOLDOWN) {
        const remaining = Math.ceil(
          (GEN_COOLDOWN - (now - lastGenTime)) / 1000
        );
        toast.error(`Vui lòng đợi ${remaining}s trước khi tạo kịch bản mới`);
        return;
      }

      // Validation đơn giản nhưng hiệu quả
      const errors: Record<string, string> = {};
      if (form.name.trim().length < 2) errors.name = 'Tên quá ngắn';
      if (form.description.trim().length < 10)
        errors.description = 'Mô tả cần ít nhất 10 ký tự';

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }

      setLastGenTime(now);

      const result = await generateScript({
        product: {
          name: form.name.trim(),
          description: form.description.trim(),
          price: form.price || '',
          rating: form.rating || '',
          sold: form.sold || '',
          usp: form.usp || undefined,
        },
        platform: form.platform,
        productId: form.productId || null,
      });

      if (result) {
        resetForm();
        setActiveTab('list');
      }
    },
    [form, generateScript, resetForm, lastGenTime]
  );

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !generating) {
        if (form.name && form.description) handleSubmit();
      }
      if (e.key === 'Escape') {
        setSelectedScript(null);
        setShowProductSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generating, form, handleSubmit, setSelectedScript]);

  const handleCopy = useCallback(() => {
    if (!selectedScript) return;
    const text = `# ${selectedScript.title}\n\nHook: ${selectedScript.hook}\n\nNội dung: ${selectedScript.body}\n\nCTA: ${selectedScript.voiceoverCTA}`;
    navigator.clipboard.writeText(text);
    toast.success('Đã copy toàn bộ kịch bản!');
  }, [selectedScript]);

  const handleCopySection = useCallback(
    (section: 'hook' | 'body' | 'cta') => {
      if (!selectedScript) return;
      const text =
        section === 'hook'
          ? selectedScript.hook
          : section === 'body'
            ? selectedScript.body
            : selectedScript.voiceoverCTA;
      navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast.success(
        `Đã copy ${section === 'hook' ? 'Hook' : section === 'body' ? 'Nội dung' : 'CTA'}!`
      );
      setTimeout(() => setCopiedSection(null), 2000);
    },
    [selectedScript]
  );

  const handleRegenerate = useCallback(() => {
    if (!selectedScript?.id) return;
    regenerateScript(selectedScript.id);
  }, [selectedScript, regenerateScript]);

  const handleExportFiltered = useCallback(() => {
    if (selectedIds.size > 0) {
      exportScripts(Array.from(selectedIds));
    } else if (selectedPlatform) {
      exportScripts(undefined, selectedPlatform);
    } else {
      exportScripts();
    }
    toast.success('Đang tải file kịch bản...');
  }, [selectedIds, selectedPlatform, exportScripts]);

  const isSelecting = selectedIds.size > 0;

  const inputClass =
    'w-full rounded-xl border bg-[var(--bg-secondary)] px-4 py-3 text-sm transition-all focus:ring-1 focus:ring-[var(--accent-pink)] focus:outline-none';

  return (
    <div className="flex h-full flex-col bg-[var(--bg-main)]">
      {/* Header */}
      <div className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
              <Sparkles size={24} className="text-[var(--accent-pink)]" />
              Kịch bản Video
            </h2>
            <p className="mt-1 text-xs font-medium tracking-tight text-[var(--text-secondary)] uppercase">
              AI Generator • {total} bản lưu trữ
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Platform filter dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPlatformFilter(!showPlatformFilter)}
                className={`rounded-lg border p-2 hover:opacity-80 ${
                  selectedPlatform
                    ? 'border-[var(--accent-pink)] bg-[var(--accent-pink)]/10 text-[var(--accent-pink)]'
                    : 'border-[var(--border-color)] bg-[var(--bg-card)]'
                }`}
              >
                <Filter size={18} />
              </button>
              {showPlatformFilter && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPlatformFilter(false)}
                  />
                  <div className="absolute top-full right-0 z-50 mt-2 w-48 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-2 shadow-lg">
                    <button
                      onClick={() => {
                        changePlatform(undefined);
                        setShowPlatformFilter(false);
                      }}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        !selectedPlatform
                          ? 'bg-[var(--accent-pink)]/10 text-[var(--accent-pink)]'
                          : 'hover:bg-[var(--bg-secondary)]'
                      }`}
                    >
                      Tất cả nền tảng
                    </button>
                    {PLATFORMS.map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          changePlatform(p);
                          setShowPlatformFilter(false);
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          selectedPlatform === p
                            ? 'bg-[var(--accent-pink)]/10 text-[var(--accent-pink)]'
                            : 'hover:bg-[var(--bg-secondary)]'
                        }`}
                      >
                        {PLATFORM_LABELS[p]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleExportFiltered}
              disabled={total === 0}
              className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2 hover:opacity-80 disabled:opacity-30"
            >
              <Download size={18} />
            </button>
            <button
              onClick={refresh}
              className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2 hover:opacity-80"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex w-fit gap-2 rounded-xl bg-[var(--bg-secondary)] p-1">
          <button
            onClick={() => setActiveTab('list')}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-[var(--accent-pink)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            Lịch sử
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-all ${activeTab === 'create' ? 'bg-[var(--accent-pink)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            Tạo mới
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'list' ? (
          <div className="h-full p-4 sm:p-6">
            <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-12">
              {/* List danh sách bên trái */}
              <div className="flex h-full flex-col overflow-hidden lg:col-span-4">
                {/* Bulk actions bar */}
                {isSelecting && (
                  <div className="mb-3 flex items-center gap-2 rounded-xl border border-[var(--accent-pink)] bg-[var(--accent-pink)]/10 p-3">
                    <span className="flex-1 text-xs font-bold text-[var(--accent-pink)]">
                      Đã chọn {selectedIds.size}
                    </span>
                    <button
                      onClick={bulkDeleteScripts}
                      className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/30"
                    >
                      Xóa đã chọn
                    </button>
                    <button
                      onClick={() => {
                        exportScripts(Array.from(selectedIds));
                        toast.success('Đang tải file...');
                      }}
                      className="rounded-lg bg-[var(--accent-cyan)]/20 px-3 py-1.5 text-xs font-bold text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/30"
                    >
                      Xuất
                    </button>
                    <button
                      onClick={clearSelection}
                      className="rounded-lg px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}

                {/* Select all / header */}
                <div className="mb-2 flex items-center gap-2 px-1">
                  <button
                    onClick={selectAll}
                    className="text-[var(--text-secondary)] hover:text-[var(--accent-pink)]"
                  >
                    {selectedIds.size === scripts.length &&
                    scripts.length > 0 ? (
                      <CheckSquare size={16} />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {isSelecting
                      ? `${selectedIds.size}/${scripts.length} đã chọn`
                      : `Chọn nhiều`}
                  </span>
                </div>

                <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto pr-2">
                  {scripts.length === 0 && !loading ? (
                    <div className="py-20 text-center text-sm opacity-30">
                      Chưa có kịch bản
                    </div>
                  ) : (
                    scripts.map((script) => (
                      <div
                        key={script.id}
                        onClick={() => {
                          if (!isSelecting) setSelectedScript(script);
                        }}
                        className={`group relative w-full cursor-pointer rounded-xl border p-4 transition-all ${
                          selectedScript?.id === script.id
                            ? 'border-[var(--accent-pink)] bg-[var(--bg-secondary)]'
                            : 'border-[var(--border-color)] bg-[var(--bg-card)] hover:border-[var(--text-secondary)]'
                        } ${isSelecting ? 'pr-10' : ''}`}
                      >
                        <div className="flex items-start gap-2">
                          {isSelecting && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelect(script.id!);
                              }}
                              className="mt-0.5 shrink-0"
                            >
                              {selectedIds.has(script.id!) ? (
                                <CheckSquare
                                  size={16}
                                  className="text-[var(--accent-pink)]"
                                />
                              ) : (
                                <Square size={16} />
                              )}
                            </button>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold">
                              {script.title}
                            </p>
                            <p className="mt-1 line-clamp-2 text-[11px] text-[var(--text-secondary)] opacity-70">
                              {script.hook}
                            </p>
                            <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-[var(--text-secondary)]">
                              <span>{PLATFORM_LABELS[script.platform]}</span>
                              <span>•</span>
                              <span>⏱️ {script.estimatedDuration}</span>
                            </div>
                          </div>
                        </div>
                        {!isSelecting && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteScript(script.id!);
                            }}
                            className="absolute top-4 right-4 rounded p-1 text-red-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-400/10"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-2">
                    <button
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      className="p-1 disabled:opacity-20"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-xs font-bold text-[var(--text-secondary)]">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= totalPages}
                      className="p-1 disabled:opacity-20"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Chi tiết bên phải (Desktop) */}
              <div className="custom-scrollbar hidden overflow-y-auto pr-2 lg:col-span-8 lg:block">
                {selectedScript ? (
                  <ScriptDetail
                    script={selectedScript}
                    onCopy={handleCopy}
                    onCopySection={handleCopySection}
                    onRegenerate={handleRegenerate}
                    onClose={() => setSelectedScript(null)}
                    copiedSection={copiedSection}
                    regenerating={regenerating === selectedScript.id}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-card)]/50 opacity-40">
                    <p className="text-sm font-bold">CHỌN KỊCH BẢN ĐỂ XEM</p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile View Detail */}
            {selectedScript && (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--bg-main)] p-4 lg:hidden">
                <ScriptDetail
                  script={selectedScript}
                  onCopy={handleCopy}
                  onCopySection={handleCopySection}
                  onRegenerate={handleRegenerate}
                  onClose={() => setSelectedScript(null)}
                  copiedSection={copiedSection}
                  regenerating={regenerating === selectedScript.id}
                />
              </div>
            )}
          </div>
        ) : (
          /* Form Tạo Mới */
          <div className="h-full overflow-y-auto p-4 sm:p-6">
            <form
              onSubmit={handleSubmit}
              className="mx-auto max-w-2xl rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6 shadow-sm sm:p-8"
            >
              <div className="mb-8 border-b border-[var(--border-color)] pb-4">
                <h3 className="text-lg font-bold">Cấu hình sản phẩm</h3>
                <p className="text-xs text-[var(--text-secondary)]">
                  Chọn sản phẩm có sẵn hoặc nhập thủ công
                </p>
              </div>

              <div className="space-y-6">
                {/* Product selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                    Chọn sản phẩm (không bắt buộc)
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProductSearch(!showProductSearch);
                        setProductSearch('');
                      }}
                      className={`flex w-full items-center justify-between rounded-xl border bg-[var(--bg-secondary)] px-4 py-3 text-sm transition-all focus:ring-1 focus:ring-[var(--accent-pink)] focus:outline-none ${
                        form.productId
                          ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5'
                          : 'border-[var(--border-color)]'
                      }`}
                    >
                      <span
                        className={
                          form.productId
                            ? 'text-[var(--accent-cyan)]'
                            : 'text-[var(--text-secondary)]'
                        }
                      >
                        {form.productId
                          ? products.find((p) => p.id === form.productId)
                              ?.name || 'Đã chọn'
                          : 'Tìm sản phẩm...'}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${showProductSearch ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {showProductSearch && (
                      <div className="absolute top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] shadow-lg">
                        <div className="sticky top-0 border-b border-[var(--border-color)] bg-[var(--bg-card)] p-2">
                          <div className="relative">
                            <Search
                              size={14}
                              className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--text-secondary)]"
                            />
                            <input
                              className="w-full rounded-lg bg-[var(--bg-secondary)] py-2 pr-3 pl-9 text-xs focus:ring-1 focus:ring-[var(--accent-pink)] focus:outline-none"
                              placeholder="Tìm theo tên, mô tả..."
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              autoFocus
                            />
                          </div>
                        </div>
                        {filteredProducts.length === 0 ? (
                          <div className="p-4 text-center text-xs text-[var(--text-secondary)]">
                            Không tìm thấy sản phẩm
                          </div>
                        ) : (
                          filteredProducts.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleProductSelect(p.id)}
                              className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--bg-secondary)] ${
                                form.productId === p.id
                                  ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]'
                                  : ''
                              }`}
                            >
                              <p className="truncate font-medium">{p.name}</p>
                              <p className="truncate text-xs text-[var(--text-secondary)]">
                                {p.price}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                      Tên sản phẩm *
                    </label>
                    <input
                      className={`${inputClass} ${formErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Ví dụ: Tai nghe Gaming"
                      value={form.name}
                      onChange={(e) => {
                        setForm({ ...form, name: e.target.value });
                        setFormErrors({ ...formErrors, name: '' });
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                      Nền tảng *
                    </label>
                    <select
                      className={`${inputClass} border-[var(--border-color)]`}
                      value={form.platform}
                      onChange={(e) =>
                        setForm({ ...form, platform: e.target.value })
                      }
                    >
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {PLATFORM_LABELS[p]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                      Mô tả chi tiết *
                    </label>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {form.description.length}/{MAX_DESCRIPTION_LENGTH}
                    </span>
                  </div>
                  <textarea
                    className={`${inputClass} ${formErrors.description ? 'border-red-500 focus:ring-red-500' : 'border-[var(--border-color)]'} min-h-[120px] resize-none`}
                    placeholder="Những điểm mạnh nhất của sản phẩm..."
                    value={form.description}
                    onChange={(e) => {
                      setForm({ ...form, description: e.target.value });
                      setFormErrors({ ...formErrors, description: '' });
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                    Giá bán (không bắt buộc)
                  </label>
                  <input
                    className={`${inputClass} border-[var(--border-color)]`}
                    placeholder="Ví dụ: 500k"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                      Đánh giá (không bắt buộc)
                    </label>
                    <input
                      className={`${inputClass} border-[var(--border-color)]`}
                      placeholder="Ví dụ: 4.8/5"
                      value={form.rating}
                      onChange={(e) =>
                        setForm({ ...form, rating: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                      Đã bán (không bắt buộc)
                    </label>
                    <input
                      className={`${inputClass} border-[var(--border-color)]`}
                      placeholder="Ví dụ: 10k+"
                      value={form.sold}
                      onChange={(e) =>
                        setForm({ ...form, sold: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">
                    USP - Điểm bán hàng độc nhất (không bắt buộc)
                  </label>
                  <input
                    className={`${inputClass} border-[var(--border-color)]`}
                    placeholder="Ví dụ: Bảo hành trọn đời, freeship 24h..."
                    value={form.usp}
                    onChange={(e) => setForm({ ...form, usp: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={generating}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent-pink)] py-4 text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                  >
                    {generating ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <Wand2 size={18} />
                    )}
                    {generating ? 'Đang viết kịch bản...' : 'Tạo kịch bản ngay'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 transition-colors hover:bg-[var(--bg-card)]"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Scripts() {
  return (
    <ErrorBoundary>
      <ScriptsContent />
    </ErrorBoundary>
  );
}
