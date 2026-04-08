export interface HistoryEntry {
  id: string;
  productId: string | null;
  scriptId: string | null;
  descriptionId: string | null;
  workflow: string;
  createdAt: string;
  product?: { name: string } | null;
}

export interface HistoryResponse {
  history: HistoryEntry[];
  total: number;
}
