import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Products
export const getProducts = () =>
  api.get("/products").then((r) => r.data.products);
export const createProduct = (data: {
  name: string;
  description: string;
  price?: string;
  rating?: string;
  sold?: string;
}) => api.post("/products", data).then((r) => r.data);
export const deleteProduct = (id: string) =>
  api.delete(`/products/${id}`).then((r) => r.data);

// Scripts
export const createScript = (data: {
  product: any;
  platform: string;
  productId?: string | null;
}) => api.post("/scripts", data).then((r) => r.data);

// Captions
export const createCaption = (data: {
  product: any;
  scriptSummary: string;
  platform: string;
  productId?: string | null;
}) => api.post("/captions", data).then((r) => r.data);

// Short Video (Veo)
export const createShortVideo = (data: {
  productName: string;
  script: any;
  productId?: string | null;
}) => api.post("/short", data).then((r) => r.data);

// Image Brief
export const createImageBrief = (data: {
  productName: string;
  adPlatform: string;
  aspectRatio: string;
  productId?: string | null;
}) => api.post("/image", data).then((r) => r.data);

// History
export const getHistory = () => api.get("/history").then((r) => r.data.history);

// Health
export const checkHealth = () => api.get("/health").then((r) => r.data);
