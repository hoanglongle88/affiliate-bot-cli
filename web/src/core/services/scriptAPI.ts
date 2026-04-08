import { api } from '../config/axios';
import type { ScriptResponse, VideoScript } from '../interfaces';

export const createScript = (data: {
  product: {
    name: string;
    description: string;
    price: string;
    rating: string;
    sold: string;
    usp?: string;
  };
  platform: string;
  productId?: string | null;
}) =>
  api
    .post<{
      script: ScriptResponse['script'];
      warnings?: string[];
      message: string;
    }>('/scripts', data)
    .then((r) => r.data);

export const regenerateScript = (id: string) =>
  api
    .post<{
      script: ScriptResponse['script'];
      warnings?: string[];
      message: string;
    }>(`/scripts/${id}/regenerate`)
    .then((r) => r.data);

export interface ScriptHistoryParams {
  page: number;
  limit: number;
  platform?: string;
}

export const getScriptHistory = (page = 1, limit = 10, platform?: string) => {
  const params: ScriptHistoryParams = { page, limit };
  if (platform) params.platform = platform;
  return api
    .get<{
      scripts: VideoScript[];
      total: number;
      page: number;
      totalPages: number;
    }>('/scripts/history', { params })
    .then((r) => r.data)
    .catch((error) => {
      // If endpoint doesn't exist yet, return empty data
      if (error.response?.status === 404) {
        return { scripts: [], total: 0, page: 1, totalPages: 1 };
      }
      throw error;
    });
};

export const deleteScript = (id: string) =>
  api.delete(`/scripts/${id}`).then((r) => r.data);

export const bulkDeleteScripts = (ids: string[]) =>
  api
    .post<{
      message: string;
      deletedCount: number;
      notFoundCount?: number;
      notFound?: string[];
    }>('/scripts/bulk-delete', { ids })
    .then((r) => r.data);

export const exportScripts = (scriptIds?: string[], platform?: string) =>
  api
    .post(
      '/scripts/export',
      { ids: scriptIds, platform },
      { responseType: 'blob' }
    )
    .then((r) => r.data);

export const updateScript = (id: string, data: Partial<VideoScript>) =>
  api.put<ScriptResponse>(`/scripts/${id}`, data).then((r) => r.data);
