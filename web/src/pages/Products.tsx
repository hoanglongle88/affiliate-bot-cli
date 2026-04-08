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
} from "lucide-react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../lib/api";
import ErrorBoundary from "../components/ErrorBoundary";

function ProductsContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
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
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const PAGE_SIZE = 20;

  const load = useCallback(async (searchQuery?: string, pageNum?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts({
        q: searchQuery || undefined,
        page: pageNum || 1,
        limit: PAGE_SIZE,
      });
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setPage(data.page || 1);
    } catch (e: any) {
      setError(e.message || "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Debounced search
  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      load(value, 1);
    }, 300);
  };

  const handlePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    load(search, newPage);
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
      await createProduct(form);
      resetForm();
      load(search, page);
    } catch (e: any) {
      alert(e.response?.data?.error || "Không thể tạo sản phẩm");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: any) => {
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
    try {
      await updateProduct(editId, form);
      resetForm();
      load(search, page);
    } catch (e: any) {
      alert(e.response?.data?.error || "Không thể cập nhật");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      await deleteProduct(id);
      load(search, page);
    } catch {
      alert("Không thể xóa");
    }
  };

  const inputClass =
    "w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]";
  const btnPrimary =
    "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-medium hover:opacity-90 text-sm disabled:opacity-50";
  const btnSecondary =
    "px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm hover:bg-[var(--bg-card)]";
  const btnDanger =
    "p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300";

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => load(search, page)}
              className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"
              title="Làm mới"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={() => setShowForm(true)} className={btnPrimary}>
              <Plus size={18} />{" "}
              <span className="hidden sm:inline">Thêm sản phẩm</span>
              <span className="sm:hidden">Thêm</span>
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-4 relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
          />
          <input
            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]"
            placeholder="Tìm kiếm theo tên, mô tả, giá..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                load("", 1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X size={16} />
            </button>
          )}
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
              onClick={() => load(search, page)}
              className="mt-3 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] text-sm"
            >
              Thử lại
            </button>
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
              {products.length === 0 && (
                <div className="text-center py-16 text-[var(--text-secondary)]">
                  <p className="text-sm">
                    {search ? "Không tìm thấy kết quả" : "Chưa có sản phẩm nào"}
                  </p>
                </div>
              )}
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
              {products.length === 0 && (
                <div className="text-center py-12 text-[var(--text-secondary)] text-sm">
                  {search ? "Không tìm thấy kết quả" : "Chưa có sản phẩm nào"}
                </div>
              )}
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
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-[var(--accent-cyan)] text-[var(--bg-primary)]" : "hover:bg-[var(--bg-card)]"}`}
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
                  ) : editId ? (
                    <Check size={16} />
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
