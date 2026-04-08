import { api } from '../config/axios';
import type { ImageResponse } from '../interfaces';

export const createImageBrief = (data: {
  productName: string;
  adPlatform: string;
  aspectRatio: string;
  productId?: string | null;
}) => api.post<ImageResponse>('/image', data).then((r) => r.data);
