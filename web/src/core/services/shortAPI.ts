import { api } from '../config/axios';
import type { ShortResponse } from '../interfaces';

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
}) => api.post<ShortResponse>('/short', data).then((r) => r.data);
