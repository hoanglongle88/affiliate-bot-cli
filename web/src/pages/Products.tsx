import { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { getProducts, createProduct, deleteProduct } from '../lib/api';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', rating: '', sold: '' });

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

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProduct(form);
      setShowForm(false);
      setForm({ name: '', description: '', price: '', rating: '', sold: '' });
      load();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to create');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      load();
    } catch (e) {
      alert('Failed to delete');
    }
  };

  if (loading) return <div className="p-8 text-[var(--text-secondary)]">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Products ({products.length})</h2>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)]">
            <RefreshCw size={18} />
          </button>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-medium hover:opacity-90">
            <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 bg-[var(--bg-card)] rounded-xl p-6 border border-[var(--border-color)]">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm" placeholder="Product name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          </div>
          <textarea className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm mb-4" placeholder="Description *" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} required />
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm" placeholder="Rating" value={form.rating} onChange={e => setForm({ ...form, rating: e.target.value })} />
            <input className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-sm" placeholder="Sold" value={form.sold} onChange={e => setForm({ ...form, sold: e.target.value })} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-[var(--bg-primary)] font-medium">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-secondary)]">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-[var(--text-secondary)]">Name</th>
              <th className="text-left px-6 py-3 font-medium text-[var(--text-secondary)]">Price</th>
              <th className="text-left px-6 py-3 font-medium text-[var(--text-secondary)]">Used</th>
              <th className="text-right px-6 py-3 font-medium text-[var(--text-secondary)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-t border-[var(--border-color)]">
                <td className="px-6 py-4">{p.name}</td>
                <td className="px-6 py-4">{p.price}</td>
                <td className="px-6 py-4">{p.usageCount || 0}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-[var(--text-secondary)]">No products yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
