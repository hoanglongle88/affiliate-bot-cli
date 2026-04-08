import { api } from '../config/axios';
import type {
  DashboardStats,
  HealthResponse,
  HistoryResponse,
} from '../interfaces';

// History
export const getHistory = () =>
  api.get<HistoryResponse>('/history').then((r) => r.data.history);

// Health
export const checkHealth = () =>
  api.get<HealthResponse>('/health').then((r) => r.data);

// Dashboard Stats

export const getDashboardStats = () =>
  api.get<DashboardStats>('/stats').then((r) => r.data);
