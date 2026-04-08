export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  rating: string;
  sold: string;
  usp?: string; // Unique Selling Point - Điểm bán hàng độc nhất
  usageCount: number;
  createdAt: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}
