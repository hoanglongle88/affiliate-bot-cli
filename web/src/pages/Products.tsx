import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Edit2,
  X,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  FileUp,
} from "lucide-react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  exportProducts,
  importProducts,
} from "../lib/api";
import type { Product } from "../interfaces";
import ErrorBoundary from "../components/ErrorBoundary";
import toast from "react-hot-toast";

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    rating: "",
    sold: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PAGE_SIZE = 10;

  const load = useCallback(
    async (searchQuery?: string, pageNum?: number, sortQuery?: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts({
          q: searchQuery || undefined,
          page: pageNum || 1,
          limit: PAGE_SIZE,
          sort: sortQuery || sort,
        });
        setProducts(data.products);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPage(data.page);
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Không thể tải danh sách sản phẩm";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [sort],
  );

  useEffect(() => {
    load();
  }, [load]);

  // Debounced search
  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      load(value, 1, sort);
    }, 300);
  };

  const handleSort = (newSort: string) => {
    setSort(newSort);
    setPage(1);
    load(search, 1, newSort);
  };

  const handlePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    load(search, newPage, sort);
  };

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", rating: "", sold: "" });
    setShowForm(false);
    setEditId(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Optimistic update
      const tempId = "temp_" + Date.now();
      const newProduct: Product = {
        id: tempId,
        name: form.name,
        description: form.description,
        price: form.price || "Chưa có",
        rating: form.rating || "Chưa có",
        sold: form.sold || "Chưa có",
        usageCount: 0,
        createdAt: new Date().toISOString(),
      };
      setProducts((prev) => [newProduct, ...prev]);
      resetForm();

      await createProduct(form);
      toast.success("Đã thêm sản phẩm");
      load(search, page, sort);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Không thể tạo sản phẩm";
      toast.error(message);
      load(search, page, sort); // Rollback
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      rating: product.rating,
      sold: product.sold,
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setSubmitting(true);
    const oldProducts = [...products];

    try {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editId
            ? {
                ...p,
                name: form.name,
                description: form.description,
                price: form.price,
                rating: form.rating,
                sold: form.sold,
              }
            : p,
        ),
      );
      resetForm();

      await updateProduct(editId, form);
      toast.success("Đã cập nhật sản phẩm");
      load(search, page, sort);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Không thể cập nhật";
      toast.error(message);
      setProducts(oldProducts); // Rollback
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const oldProducts = [...products];
    // Optimistic update
    setProducts((prev) => prev.filter((p) => p.id !== id));

    try {
      await deleteProduct(id);
      toast.success("Đã xóa sản phẩm");
      // If current page becomes empty, go to previous page
      if (products.length === 1 && page > 1) {
        handlePage(page - 1);
      }
    } catch {
      toast.error("Không thể xóa");
      setProducts(oldProducts); // Rollback
    }
  };

  const handleExport = () => {
    exportProducts();
    toast.success("Đang tải file CSV...");
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const csvContent = ev.target?.result as string;
      setImporting(true);
      try {
        const result = await importProducts(csvContent);
        toast.success(
          `Đã nhập ${result.success} sản phẩm${result.skipped ? `, bỏ qua ${result.skipped}` : ""}`,
        );
        load(search, page, sort);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Lỗi import CSV";
        toast.error(message);
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const inputClass =
    "w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]";
  const btnPrimary =
    "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-medium hover:opacity-90 text-sm disabled:opacity-50";
  const btnSecondary =
    "px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm hover:bg-[var(--bg-card)]";
  const btnDanger =
    "p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300";

  const SORT_OPTIONS = [
    { value: "date_desc", label: "Mới nhất" },
    { value: "date_asc", label: "Cũ nhất" },
    { value: "name_asc", label: "Tên A-Z" },
    { value: "name_desc", label: "Tên Z-A" },
    { value: "usage_desc", label: "Dùng nhiều nhất" },
    { value: "usage_asc", label: "Dùng ít nhất" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Sản phẩm</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              {total} sản phẩm {search && `• Tìm thấy "${search}"`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => load(search, page, sort)}
              className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"
              title="Làm mới"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={handleExport}
              className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"
              title="Xuất CSV"
            >
              <Download size={18} />
            </button>
            <button
              onClick={handleImportClick}
              disabled={importing}
              className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] disabled:opacity-50"
              title="Nhập CSV"
            >
              {importing ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Upload size={18} />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportFile}
              className="hidden"
            />
            <button onClick={() => setShowForm(true)} className={btnPrimary}>
              <Plus size={18} />{" "}
              <span className="hidden sm:inline">Thêm sản phẩm</span>
              <span className="sm:hidden">Thêm</span>
            </button>
          </div>
        </div>

        {/* Search + Sort bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
            />
            <input
              className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]"
              placeholder="Tìm kiếm theo tên, mô tả, giá..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => {
                  setSearch("");
                  load("", 1, sort);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <select
            className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]"
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table area with scroll */}
      <div className="flex-1 overflow-auto">
        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[var(--accent-cyan)] border-t-transparent" />
          </div>
        ) : error && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--text-secondary)]">
            <AlertCircle size={32} className="text-red-400 mb-3" />
            <p className="text-sm">{error}</p>
            <button
              onClick={() => load(search, page, sort)}
              className="mt-3 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm"
            >
              Thử lại
            </button>
          </div>
        ) : products.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-64 text-center px-4">
            <div className="w-20 h-20 rounded-full bg-[var(--bg-card)] flex items-center justify-center mb-4">
              <FileUp size={32} className="text-[var(--text-secondary)]" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {search ? "Không tìm thấy kết quả" : "Chưa có sản phẩm nào"}
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-sm">
              {search
                ? `Không có sản phẩm nào khớp "${search}". Thử từ khóa khác.`
                : "Bắt đầu bằng cách thêm sản phẩm mới hoặc nhập từ file CSV."}
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
                <thead className="bg-[var(--bg-secondary)] sticky top-0 z-10">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium text-[var(--text-secondary)]">
                      Tên
                    </th>
                    <th className="text-left px-6 py-3 font-medium text-[var(--text-secondary)]">
                      Giá
                    </th>
                    <th className="text-left px-6 py-3 font-medium text-[var(--text-secondary)]">
                      Đánh giá
                    </th>
                    <th className="text-left px-6 py-3 font-medium text-[var(--text-secondary)]">
                      Đã bán
                    </th>
                    <th className="text-left px-6 py-3 font-medium text-[var(--text-secondary)]">
                      Đã dùng
                    </th>
                    <th className="text-right px-6 py-3 font-medium text-[var(--text-secondary)]">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-[var(--border-color)] hover:bg-[var(--bg-secondary)]/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">{p.name}</td>
                      <td className="px-6 py-4">{p.price}</td>
                      <td className="px-6 py-4">{p.rating}</td>
                      <td className="px-6 py-4">{p.sold}</td>
                      <td className="px-6 py-4">{p.usageCount || 0} lần</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] hover:bg-[var(--bg-card)]"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className={btnDanger}
                            title="Xóa"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3 p-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-color)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{p.name}</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {p.price} • Đã dùng {p.usageCount || 0} lần
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-cyan)]"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-2 rounded-lg text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
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
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between">
          <p className="text-xs text-[var(--text-secondary)]">
            Trang {page}/{totalPages} ({total} sản phẩm)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePage(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-[var(--border-color)] disabled:opacity-30 hover:bg-[var(--bg-card)]"
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
                  onClick={() => handlePage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-[var(--accent-cyan)] text-[var(--bg-primary)]"
                      : "hover:bg-[var(--bg-card)]"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => handlePage(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-[var(--border-color)] disabled:opacity-30 hover:bg-[var(--bg-card)]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showForm || editId) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          onClick={resetForm}
        >
          <div
            className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h3 className="text-lg font-semibold">
                {editId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h3>
              <button
                onClick={resetForm}
                className="p-1 rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={editId ? handleUpdate : handleCreate}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Tên sản phẩm *
                </label>
                <input
                  className={inputClass}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mô tả *
                </label>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Giá</label>
                  <input
                    className={inputClass}
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    placeholder="299.000đ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Đánh giá
                  </label>
                  <input
                    className={inputClass}
                    value={form.rating}
                    onChange={(e) =>
                      setForm({ ...form, rating: e.target.value })
                    }
                    placeholder="4.8/5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Đã bán</label>
                <input
                  className={inputClass}
                  value={form.sold}
                  onChange={(e) => setForm({ ...form, sold: e.target.value })}
                  placeholder="10k+"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={btnPrimary}
                >
                  {submitting ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <Check size={16} />
                  )}
                  {editId ? "Cập nhật" : "Lưu"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={btnSecondary}
                >
                  Hủy
                </button>
              </div>
            </form>
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
