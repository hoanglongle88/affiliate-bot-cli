import { api } from '../config/axios';
import type { ProductsResponse } from '../interfaces';

// Products
export const getProducts = (params?: {
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.q) query.set('q', params.q);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));
  if (params?.sort) query.set('sort', params.sort);
  return api.get<ProductsResponse>(`/products?${query}`).then((r) => r.data);
};

export const createProduct = (data: {
  name: string;
  description: string;
  price?: string;
  rating?: string;
  sold?: string;
  usp?: string;
}) => api.post('/products', data).then((r) => r.data);

export const updateProduct = (
  id: string,
  data: {
    name: string;
    description: string;
    price?: string;
    rating?: string;
    sold?: string;
    usp?: string;
  }
) => api.put(`/products/${id}`, data).then((r) => r.data);

export const deleteProduct = (id: string) =>
  api.delete(`/products/${id}`).then((r) => r.data);

export const bulkDeleteProducts = (ids: string[]) =>
  api
    .post<{
      message: string;
      deletedCount: number;
      notFoundCount?: number;
      notFound?: string[];
    }>('/products/bulk-delete', { ids })
    .then((r) => r.data);

export const deleteAllProducts = () =>
  api.delete('/products').then((r) => r.data);

export const exportProducts = async () => {
  const res = await api.get('/products/export', { responseType: 'blob' });

  // Check if response is actually a blob (not a JSON error wrapped in blob)
  const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });

  // Detect if server returned an error (JSON wrapped in blob)
  if (blob.type.includes('json') || (res.data as Blob).type?.includes('json')) {
    const text = await blob.text();
    try {
      const json = JSON.parse(text);
      throw new Error(json.error || 'Server error');
    } catch {
      throw new Error('Server returned invalid response');
    }
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `products_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const importProducts = (csvContent: string) =>
  api.post('/products/import', { csvContent }).then((r) => r.data);
