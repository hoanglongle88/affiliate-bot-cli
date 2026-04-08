import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Edit2,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  FileUp,
  Square,
  CheckSquare,
  AlertTriangle,
} from 'lucide-react';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  exportProducts,
  importProducts,
  bulkDeleteProducts,
  deleteAllProducts,
} from '../core/services/productAPI';
import type { Product } from '../core/interfaces/';
import ErrorBoundary from '../core/components/ErrorBoundary';
import Tooltip from '../core/components/Tooltip';
import toast from 'react-hot-toast';
import { useProducts } from '../core/hooks/useProducts';
import { isValidPrice, isValidRating, isValidSold } from '../core/helper';

function ProductsContent() {
  const {
    products,
    setProducts,
    loading,
    isSearching,
    error,
    page,
    totalPages,
    total,
    sort,
    search,
    refresh,
    goToPage,
    changeSort,
    changeSearch,
  } = useProducts();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    rating: '',
    sold: '',
    usp: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup file input on unmount
  useEffect(() => {
    return () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
  }, []);

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      rating: '',
      sold: '',
      usp: '',
    });
    setShowForm(false);
    setEditId(null);
    setFormErrors({});
  };

  // Keyboard shortcut: Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDeleteAllConfirm) {
          setShowDeleteAllConfirm(false);
        } else if (showForm || editId) {
          resetForm();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showForm, editId, showDeleteAllConfirm]);

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.name.trim()) {
      errors.name = 'Tên sản phẩm không được để trống';
    } else if (form.name.trim().length > 200) {
      errors.name = 'Tên quá dài (tối đa 200 ký tự)';
    }

    if (!form.description.trim()) {
      errors.description = 'Mô tả không được để trống';
    } else if (form.description.trim().length > 2000) {
      errors.description = 'Mô tả quá dài (tối đa 2000 ký tự)';
    }

    if (form.price && !isValidPrice(form.price)) {
      errors.price = 'Định dạng giá không hợp lệ (VD: 299.000đ)';
    }

    if (form.rating && !isValidRating(form.rating)) {
      errors.rating = 'Định dạng đánh giá không hợp lệ (VD: 4.8/5)';
    }

    if (form.sold && !isValidSold(form.sold)) {
      errors.sold = 'Định dạng không hợp lệ (VD: 10k+, 1.5M)';
    }

    if (form.usp && form.usp.length > 500) {
      errors.usp = 'USP quá dài (tối đa 500 ký tự)';
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Vui lòng kiểm tra lại thông tin nhập');
      return false;
    }

    return true;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const tempId = 'temp_' + Date.now();
      const newProduct: Product = {
        id: tempId,
        name: form.name.trim(),
        description: form.description.trim(),
        price: form.price || 'Chưa có',
        rating: form.rating || 'Chưa có',
        sold: form.sold || 'Chưa có',
        usp: form.usp || undefined,
        usageCount: 0,
        createdAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      resetForm();

      await createProduct(form);
      toast.success('Đã thêm sản phẩm');
      refresh();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Không thể tạo sản phẩm';
      toast.error(message);
      refresh();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price === 'Chưa có' ? '' : product.price,
      rating: product.rating === 'Chưa có' ? '' : product.rating,
      sold: product.sold === 'Chưa có' ? '' : product.sold,
      usp: product.usp || '',
    });
    setFormErrors({});
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    if (!validateForm()) return;

    setSubmitting(true);
    const oldProducts = [...products];

    try {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editId
            ? {
                ...p,
                name: form.name.trim(),
                description: form.description.trim(),
                price: form.price || p.price,
                rating: form.rating || p.rating,
                sold: form.sold || p.sold,
                usp: form.usp || p.usp,
              }
            : p
        )
      );
      resetForm();

      await updateProduct(editId, form);
      toast.success('Đã cập nhật sản phẩm');
      refresh();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Không thể cập nhật';
      toast.error(message);
      setProducts(oldProducts);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`
    );
    if (!confirmed) return;

    const oldProducts = [...products];
    setProducts((prev) => prev.filter((p) => p.id !== product.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(product.id);
      return next;
    });

    try {
      await deleteProduct(product.id);
      toast.success('Đã xóa sản phẩm');
      if (products.length === 1 && page > 1) {
        goToPage(page - 1);
      }
    } catch {
      toast.error('Không thể xóa');
      setProducts(oldProducts);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    const oldProducts = [...products];
    setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));

    try {
      const result = await bulkDeleteProducts(Array.from(selectedIds));
      const deleted = result.deletedCount ?? count;
      const notFound = result.notFoundCount ?? 0;

      if (notFound > 0) {
        toast(`Đã xóa ${deleted}/${count} (có ${notFound} không tồn tại)`, {
          icon: '⚠️',
          duration: 4000,
        });
      } else {
        toast.success(`Đã xóa ${deleted} sản phẩm`);
      }

      setSelectedIds(new Set());
      refresh();
    } catch {
      toast.error('Không thể xóa sản phẩm');
      setProducts(oldProducts);
    }
  };

  const handleDeleteAll = async () => {
    setShowDeleteAllConfirm(false);
    try {
      const result = await deleteAllProducts();
      toast.success(`Đã xóa ${result.deletedCount || 0} sản phẩm`);
      refresh();
    } catch {
      toast.error('Không thể xóa tất cả sản phẩm');
    }
  };

  const handleExport = async () => {
    try {
      await exportProducts();
      toast.success('Đang tải file CSV...');
    } catch {
      toast.error('Không thể xuất file CSV');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      if (!ev.target?.result) {
        toast.error('Không thể đọc file');
        return;
      }
      const csvContent = ev.target.result as string;
      setImporting(true);
      try {
        const result = await importProducts(csvContent);
        toast.success(
          `Đã nhập ${result.success} sản phẩm${result.updated ? ` (${result.updated} cập nhật, ${result.created || result.success - result.updated} mới)` : ''}${result.skipped ? `, bỏ qua ${result.skipped}` : ''}`
        );
        refresh();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Lỗi import CSV';
        toast.error(message);
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      toast.error('Không thể đọc file');
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === products.length) {
        return new Set();
      }
      return new Set(products.map((p) => p.id).filter(Boolean));
    });
  }, [products]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelecting = selectedIds.size > 0;

  const inputClass =
    'w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]';
  const btnPrimary =
    'inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-medium hover:opacity-90 text-sm disabled:opacity-50';
  const btnSecondary =
    'px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm hover:bg-[var(--bg-card)]';

  const SORT_OPTIONS = [
    { value: 'date_desc', label: 'Mới nhất' },
    { value: 'date_asc', label: 'Cũ nhất' },
    { value: 'name_asc', label: 'Tên A-Z' },
    { value: 'name_desc', label: 'Tên Z-A' },
    { value: 'usage_desc', label: 'Dùng nhiều nhất' },
    { value: 'usage_asc', label: 'Dùng ít nhất' },
  ];

  // Skeleton loaders
  const TableSkeleton = () => (
    <div className="animate-pulse">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-[var(--bg-secondary)]">
          <tr>
            {[
              'Tên',
              'Mô tả',
              'Giá',
              'Đánh giá',
              'Đã bán',
              'Đã dùng',
              'Thao tác',
            ].map((h) => (
              <th
                key={h}
                className="px-6 py-3 text-left font-medium text-[var(--text-secondary)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-t border-[var(--border-color)]">
              {Array.from({ length: 7 }).map((_, j) => (
                <td key={j} className="px-6 py-4">
                  <div className="h-4 w-full rounded bg-[var(--bg-secondary)]" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const CardSkeleton = () => (
    <div className="space-y-3 p-4 sm:hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4"
        >
          <div className="h-4 w-3/4 rounded bg-[var(--bg-secondary)]" />
          <div className="mt-2 h-3 w-1/2 rounded bg-[var(--bg-secondary)]" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">Sản phẩm</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {total} sản phẩm {search && `• Tìm thấy "${search}"`}
              {isSearching && ' • Đang tìm...'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Tooltip content="Làm mới">
              <button
                onClick={refresh}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-2 hover:bg-[var(--bg-secondary)]"
              >
                <RefreshCw
                  size={18}
                  className={loading ? 'animate-spin' : ''}
                />
              </button>
            </Tooltip>
            <Tooltip content="Xuất CSV">
              <button
                onClick={handleExport}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-2 hover:bg-[var(--bg-secondary)]"
              >
                <Download size={18} />
              </button>
            </Tooltip>
            <Tooltip content="Nhập CSV">
              <button
                onClick={handleImportClick}
                disabled={importing}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] p-2 hover:bg-[var(--bg-secondary)] disabled:opacity-50"
              >
                {importing ? (
                  <span className="animate-spin">⏳</span>
                ) : (
                  <Upload size={18} />
                )}
              </button>
            </Tooltip>
            <Tooltip content="Xóa tất cả (nguy hiểm)">
              <button
                onClick={() => setShowDeleteAllConfirm(true)}
                className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
              >
                <AlertTriangle size={18} />
              </button>
            </Tooltip>
            <Tooltip content="Thêm sản phẩm">
              <button onClick={() => setShowForm(true)} className={btnPrimary}>
                <Plus size={18} />{' '}
                <span className="hidden sm:inline">Thêm sản phẩm</span>
                <span className="sm:hidden">Thêm</span>
              </button>
            </Tooltip>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>

        {/* Search + Sort bar */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Tooltip content="Tìm kiếm theo tên, mô tả, giá" position="right">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--text-secondary)]"
                />
                <input
                  className="w-full rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] py-2 pr-10 pl-10 text-sm focus:ring-1 focus:ring-[var(--accent-cyan)] focus:outline-none"
                  placeholder="Tìm kiếm theo tên, mô tả, giá..."
                  value={search}
                  onChange={(e) => changeSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => changeSearch('')}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </Tooltip>
          </div>
          <Tooltip content="Sắp xếp" position="left">
            <select
              className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm focus:ring-1 focus:ring-[var(--accent-cyan)] focus:outline-none"
              value={sort}
              onChange={(e) => changeSort(e.target.value)}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Tooltip>
        </div>
      </div>

      {/* Table area with scroll */}
      <div className="flex-1 overflow-auto">
        {/* Bulk actions bar */}
        {isSelecting && (
          <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 px-4 py-3 sm:px-6">
            <span className="flex-1 text-xs font-bold text-[var(--accent-cyan)]">
              Đã chọn {selectedIds.size} sản phẩm
            </span>
            <button
              onClick={handleBulkDelete}
              className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/30"
            >
              Xóa đã chọn
            </button>
            <button
              onClick={clearSelection}
              className="rounded-lg px-2 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {loading && products.length === 0 ? (
          <>
            <div className="hidden sm:block">
              <TableSkeleton />
            </div>
            <CardSkeleton />
          </>
        ) : error && products.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-[var(--text-secondary)]">
            <AlertCircle size={32} className="mb-3 text-red-400" />
            <p className="text-sm">{error}</p>
            <button
              onClick={refresh}
              className="mt-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] px-4 py-2 text-sm"
            >
              Thử lại
            </button>
          </div>
        ) : products.length === 0 ? (
          /* Empty state */
          <div className="flex h-64 flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--bg-card)]">
              <FileUp size={32} className="text-[var(--text-secondary)]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              {search ? 'Không tìm thấy kết quả' : 'Chưa có sản phẩm nào'}
            </h3>
            <p className="mb-4 max-w-sm text-sm text-[var(--text-secondary)]">
              {search
                ? `Không có sản phẩm nào khớp "${search}". Thử từ khóa khác.`
                : 'Bắt đầu bằng cách thêm sản phẩm mới hoặc nhập từ file CSV.'}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowForm(true)} className={btnPrimary}>
                <Plus size={16} /> Thêm sản phẩm
              </button>
              <button onClick={handleImportClick} className={btnSecondary}>
                <FileUp size={16} /> Nhập CSV
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-[var(--bg-secondary)]">
                  <tr>
                    <th className="px-3 py-3 text-left font-medium text-[var(--text-secondary)]">
                      <button
                        onClick={selectAll}
                        className="text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]"
                      >
                        {selectedIds.size === products.length &&
                        products.length > 0 ? (
                          <CheckSquare
                            size={16}
                            className="text-[var(--accent-cyan)]"
                          />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-[var(--text-secondary)]">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-[var(--text-secondary)]">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-[var(--text-secondary)]">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-[var(--text-secondary)]">
                      Đánh giá
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-[var(--text-secondary)]">
                      Đã bán
                    </th>
                    <th className="px-6 py-3 text-left font-medium text-[var(--text-secondary)]">
                      Đã dùng
                    </th>
                    <th className="px-6 py-3 text-right font-medium text-[var(--text-secondary)]">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className={`border-t border-[var(--border-color)] transition-colors hover:bg-[var(--bg-secondary)]/50 ${
                        selectedIds.has(p.id) ? 'bg-[var(--accent-cyan)]/5' : ''
                      }`}
                    >
                      {!isSelecting && (
                        <td className="px-3 py-4">
                          <button
                            onClick={() => toggleSelect(p.id)}
                            className="text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]"
                          >
                            {selectedIds.has(p.id) ? (
                              <CheckSquare
                                size={16}
                                className="text-[var(--accent-cyan)]"
                              />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>
                      )}
                      <td className="px-6 py-4 font-medium">
                        <div className="flex items-center gap-2">
                          {p.usp && (
                            <span className="rounded-full bg-[var(--accent-cyan)]/10 px-1.5 py-0.5 text-[9px] text-[var(--accent-cyan)]">
                              USP
                            </span>
                          )}
                          {p.name}
                        </div>
                      </td>
                      <td className="max-w-xs truncate px-6 py-4 text-[var(--text-secondary)]">
                        {p.description}
                      </td>
                      <td className="px-6 py-4">{p.price}</td>
                      <td className="px-6 py-4">{p.rating}</td>
                      <td className="px-6 py-4">{p.sold}</td>
                      <td className="px-6 py-4">{p.usageCount || 0} lần</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip content="Chỉnh sửa" position="left">
                            <button
                              onClick={() => handleEdit(p)}
                              className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--accent-cyan)]"
                            >
                              <Edit2 size={16} />
                            </button>
                          </Tooltip>
                          <Tooltip content="Xóa" position="left">
                            <button
                              onClick={() => handleDelete(p)}
                              className="rounded-lg p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            >
                              <Trash2 size={16} />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 p-4 sm:hidden">
              {products.map((p) => (
                <div
                  key={p.id}
                  className={`rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-4 ${
                    selectedIds.has(p.id) ? 'border-[var(--accent-cyan)]' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => toggleSelect(p.id)}
                      className="mt-0.5 shrink-0 text-[var(--text-secondary)]"
                    >
                      {selectedIds.has(p.id) ? (
                        <CheckSquare
                          size={16}
                          className="text-[var(--accent-cyan)]"
                        />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        {p.usp && (
                          <span className="shrink-0 rounded-full bg-[var(--accent-cyan)]/10 px-1.5 py-0.5 text-[9px] text-[var(--accent-cyan)]">
                            USP
                          </span>
                        )}
                      </div>
                      <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                        {p.description}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-secondary)]">
                        {p.price} • Đã dùng {p.usageCount || 0} lần
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Tooltip content="Chỉnh sửa" position="left">
                        <button
                          onClick={() => handleEdit(p)}
                          className="rounded-lg p-2 text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]"
                        >
                          <Edit2 size={16} />
                        </button>
                      </Tooltip>
                      <Tooltip content="Xóa" position="left">
                        <button
                          onClick={() => handleDelete(p)}
                          className="rounded-lg p-2 text-red-400 hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
          <p className="text-xs text-[var(--text-secondary)]">
            Trang {page}/{totalPages} ({total} sản phẩm)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-[var(--border-color)] p-2 hover:bg-[var(--bg-card)] disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p: number;
              if (totalPages <= 5) p = i + 1;
              else if (page <= 3) p = i + 1;
              else if (page >= totalPages - 2) p = totalPages - 4 + i;
              else p = page - 2 + i;
              return (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-[var(--accent-cyan)] text-[var(--bg-primary)]'
                      : 'hover:bg-[var(--bg-card)]'
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              className="rounded-lg border border-[var(--border-color)] p-2 hover:bg-[var(--bg-card)] disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showForm || editId) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={resetForm}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border-color)] p-6">
              <h3 className="text-lg font-semibold">
                {editId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button
                onClick={resetForm}
                className="rounded-lg p-1 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={editId ? handleUpdate : handleCreate}
              className="space-y-4 p-6"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Tên sản phẩm *
                </label>
                <input
                  className={`${inputClass} ${formErrors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  value={form.name}
                  onChange={(e) => {
                    setForm({ ...form, name: e.target.value });
                    if (formErrors.name)
                      setFormErrors({ ...formErrors, name: '' });
                  }}
                  maxLength={200}
                />
                {formErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Mô tả *
                </label>
                <textarea
                  className={`${inputClass} ${formErrors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                  rows={3}
                  value={form.description}
                  onChange={(e) => {
                    setForm({ ...form, description: e.target.value });
                    if (formErrors.description)
                      setFormErrors({ ...formErrors, description: '' });
                  }}
                  maxLength={2000}
                />
                {formErrors.description && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.description}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Giá bán (không bắt buộc)
                </label>
                <input
                  className={`${inputClass} ${formErrors.price ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="VD: 299.000đ"
                  value={form.price}
                  onChange={(e) => {
                    setForm({ ...form, price: e.target.value });
                    if (formErrors.price)
                      setFormErrors({ ...formErrors, price: '' });
                  }}
                />
                {formErrors.price && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.price}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Đánh giá (không bắt buộc)
                  </label>
                  <input
                    className={`${inputClass} ${formErrors.rating ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="VD: 4.8/5"
                    value={form.rating}
                    onChange={(e) => {
                      setForm({ ...form, rating: e.target.value });
                      if (formErrors.rating)
                        setFormErrors({ ...formErrors, rating: '' });
                    }}
                  />
                  {formErrors.rating && (
                    <p className="mt-1 text-xs text-red-500">
                      {formErrors.rating}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Đã bán (không bắt buộc)
                  </label>
                  <input
                    className={`${inputClass} ${formErrors.sold ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="VD: 10k+"
                    value={form.sold}
                    onChange={(e) => {
                      setForm({ ...form, sold: e.target.value });
                      if (formErrors.sold)
                        setFormErrors({ ...formErrors, sold: '' });
                    }}
                  />
                  {formErrors.sold && (
                    <p className="mt-1 text-xs text-red-500">
                      {formErrors.sold}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  USP - Điểm bán hàng độc nhất (không bắt buộc)
                </label>
                <textarea
                  className={`${inputClass} ${formErrors.usp ? 'border-red-500 focus:ring-red-500' : ''}`}
                  rows={2}
                  placeholder="VD: Bảo hành trọn đời, freeship 24h..."
                  value={form.usp}
                  onChange={(e) => {
                    setForm({ ...form, usp: e.target.value });
                    if (formErrors.usp)
                      setFormErrors({ ...formErrors, usp: '' });
                  }}
                  maxLength={500}
                />
                {formErrors.usp && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.usp}</p>
                )}
              </div>
              <div className="flex gap-3 border-t border-[var(--border-color)] pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-lg bg-[var(--accent-cyan)] py-2.5 font-medium text-[var(--bg-primary)] disabled:opacity-50"
                >
                  {submitting
                    ? 'Đang lưu...'
                    : editId
                      ? 'Cập nhật'
                      : 'Tạo sản phẩm'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-[var(--border-color)] px-4 py-2.5"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowDeleteAllConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-red-500/30 bg-[var(--bg-card)] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle size={24} />
              <h3 className="text-lg font-bold">Cảnh báo nguy hiểm</h3>
            </div>
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              Hành động này sẽ{' '}
              <strong className="text-red-400">
                xóa vĩnh viễn TẤT CẢ sản phẩm
              </strong>{' '}
              và các kịch bản, mô tả, trend liên quan (cascade delete). Không
              thể hoàn tác.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="rounded-lg border border-[var(--border-color)] px-4 py-2 text-sm"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteAll}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
              >
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Products() {
  return (
    <ErrorBoundary>
      <ProductsContent />
    </ErrorBoundary>
  );
}
