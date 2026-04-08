// Captions

import { api } from '../config/axios';
import type { CaptionResponse } from '../interfaces';

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
}) => api.post<CaptionResponse>('/captions', data).then((r) => r.data);
