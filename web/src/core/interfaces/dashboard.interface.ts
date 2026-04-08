// Raw API response from /stats endpoint
import type { Product } from './product.interface';

export interface DashboardStats {
  totalProducts: number;
  totalScripts: number;
  totalDescriptions: number;
  totalTrends: number;
  totalShorts: number;
  totalImages: number;
  totalHistory: number;
  historyByWorkflow: Record<string, number>;
  recentProducts: Product[];
}

// Transformed stats for UI display
export interface DashboardSummary {
  products: number;
  scripts: number;
  captions: number;
  trends: number;
}
