import axios from "axios";
import type {
  ProductsResponse,
  HistoryResponse,
  HealthResponse,
  ShortVideoResult,
  ImageBriefResult,
} from "../interfaces";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Products
export const getProducts = (params?: {
  q?: string;
  page?: number;
  limit?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.q) query.set("q", params.q);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  return api.get<ProductsResponse>(`/products?${query}`).then((r) => r.data);
};
export const createProduct = (data: {
  name: string;
  description: string;
  price?: string;
  rating?: string;
  sold?: string;
}) => api.post("/products", data).then((r) => r.data);
export const updateProduct = (
  id: string,
  data: {
    name: string;
    description: string;
    price?: string;
    rating?: string;
    sold?: string;
  },
) => api.put(`/products/${id}`, data).then((r) => r.data);
export const deleteProduct = (id: string) =>
  api.delete(`/products/${id}`).then((r) => r.data);

// Scripts
interface ScriptResponse {
  script: {
    id: string;
    platform: string;
    title: string;
    hook: string;
    body: string;
    voiceoverCTA: string;
    wordCount: number;
    estimatedDuration: string;
  };
}
export const createScript = (data: {
  product: {
    name: string;
    description: string;
    price: string;
    rating: string;
    sold: string;
  };
  platform: string;
  productId?: string | null;
}) => api.post<ScriptResponse>("/scripts", data).then((r) => r.data);

// Captions
interface CaptionResponse {
  description: {
    id: string;
    platform: string;
    headline: string;
    content: string;
    offer: string;
    cta: string;
    hashtags: string[];
    caption: string;
    wordCount: number;
  };
}
export const createCaption = (data: {
  product: {
    name: string;
    description: string;
    price: string;
    rating: string;
    sold: string;
  };
  scriptSummary: string;
  platform: string;
  productId?: string | null;
}) => api.post<CaptionResponse>("/captions", data).then((r) => r.data);

// Short Video (Veo)
interface ShortResponse {
  prompt?: ShortVideoResult;
  error?: string;
}
export const createShortVideo = (data: {
  productName: string;
  script: {
    platform: string;
    hook: string;
    body: string;
    voiceoverCTA: string;
    estimatedDuration: string;
    wordCount?: number;
    title?: string;
  };
  productId?: string | null;
}) => api.post<ShortResponse>("/short", data).then((r) => r.data);

// Image Brief
interface ImageResponse {
  brief: ImageBriefResult;
}
export const createImageBrief = (data: {
  productName: string;
  adPlatform: string;
  aspectRatio: string;
  productId?: string | null;
}) => api.post<ImageResponse>("/image", data).then((r) => r.data);

// Trend
interface TrendResponse {
  brief: {
    product: {
      name: string;
      price: string;
      views: string;
      trendPercent: string;
    };
    hook: string;
    angle: string;
    painPoint: string;
    ctaAngle: string;
    hashtags: string[];
  };
  product: { id: string; name: string };
}
export const scanTrend = (data: { nicheId?: string }) =>
  api.post<TrendResponse>("/trends/scan", data).then((r) => r.data);

// History
export const getHistory = () =>
  api.get<HistoryResponse>("/history").then((r) => r.data.history);

// Health
export const checkHealth = () =>
  api.get<HealthResponse>("/health").then((r) => r.data);

// Dashboard Stats
interface DashboardStats {
  totalProducts: number;
  totalScripts: number;
  totalDescriptions: number;
  totalTrends: number;
  totalShorts: number;
  totalImages: number;
  totalHistory: number;
  historyByWorkflow: Record<string, number>;
  recentProducts: any[];
}
export const getDashboardStats = () =>
  api.get<DashboardStats>("/stats").then((r) => r.data);
