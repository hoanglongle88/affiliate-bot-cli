import { api } from '../config/axios';
import type { TrendResponse } from '../interfaces';

export const scanTrend = (data: { nicheId?: string }) =>
  api.post<TrendResponse>('/trends/scan', data).then((r) => r.data);
