import { useState, useEffect } from "react";
import { Plus, Trash2, RefreshCw } from "lucide-react";
import { getProducts, createProduct, deleteProduct } from "../lib/api";

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    rating: "",
    sold: "",
  });

  const load = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct(form);
      setShowForm(false);
      setForm({ name: "", description: "", price: "", rating: "", sold: "" });
      load();
    } catch (e: any) {
      alert(e.response?.data?.error || "Không thể tạo sản phẩm");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    try {
      await deleteProduct(id);
      load();
    } catch (e) {
      alert("Không thể xóa");
    }
  };

  const inputClass =
    "w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm";
  const btnPrimary =
    "flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-medium hover:opacity-90 text-sm";
  const btnSecondary =
    "px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm";

  if (loading)
    return <div className="p-8 text-[var(--text-secondary)]">Đang tải...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold">
          Sản phẩm ({products.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]"
          >
            <RefreshCw size={18} />
          </button>
          <button onClick={() => setShowForm(!showForm)} className={btnPrimary}>
            <Plus size={18} />{" "}
            <span className="hidden sm:inline">Thêm sản phẩm</span>
            <span className="sm:hidden">Thêm</span>
          </button>
        </div>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="mb-6 bg-[var(--bg-card)] rounded-xl p-4 sm:p-6 border border-[var(--border-color)]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              className={inputClass}
              placeholder="Tên sản phẩm *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className={inputClass}
              placeholder="Giá"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <textarea
            className={`${inputClass} mb-4`}
            placeholder="Mô tả *"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input
              className={inputClass}
              placeholder="Đánh giá"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            />
            <input
              className={inputClass}
              placeholder="Đã bán"
              value={form.sold}
              onChange={(e) => setForm({ ...form, sold: e.target.value })}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button type="submit" className={btnPrimary}>
              Lưu
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className={btnSecondary}
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Desktop table */}
      <div className="hidden sm:block bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-secondary)]">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-[var(--text-secondary)]">
                Tên
              </th>
              <th className="text-left px-6 py-3 font-medium text-[var(--text-secondary)]">
                Giá
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
              <tr key={p.id} className="border-t border-[var(--border-color)]">
                <td className="px-6 py-4">{p.name}</td>
                <td className="px-6 py-4">{p.price}</td>
                <td className="px-6 py-4">{p.usageCount || 0} lần</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-[var(--text-secondary)]"
                >
                  Chưa có sản phẩm nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-color)] flex items-center justify-between"
          >
            <div>
              <p className="font-medium text-sm">{p.name}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {p.price} • Đã dùng {p.usageCount || 0} lần
              </p>
            </div>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-red-400 p-2"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-center py-12 text-[var(--text-secondary)] text-sm">
            Chưa có sản phẩm nào
          </div>
        )}
      </div>
    </div>
  );
}
