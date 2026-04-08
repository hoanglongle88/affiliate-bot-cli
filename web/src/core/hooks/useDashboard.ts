import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getDashboardStats, checkHealth } from '../services/commonAPI';
import type { DashboardStats as DashboardStatsResponse } from '../interfaces/dashboard.interface';
import { AUTO_REFRESH_INTERVAL, type ServerStatus } from '../constants';
import toast from 'react-hot-toast';

export interface DashboardSummary {
  products: number;
  scripts: number;
  captions: number;
  trends: number;
}

export function useDashboard() {
  const [stats, setStats] = useState<DashboardSummary>({
    products: 0,
    scripts: 0,
    captions: 0,
    trends: 0,
  });
  const [serverStatus, setServerStatus] = useState<ServerStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const isMountedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadStats = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      const data: DashboardStatsResponse = await getDashboardStats();
      if (!isMountedRef.current) return;

      setStats({
        products: data.totalProducts,
        scripts: data.totalScripts,
        captions: data.totalDescriptions,
        trends: data.totalTrends,
      });
      setError(null);
    } catch (e) {
      if (!isMountedRef.current) return;
      const message = e instanceof Error ? e.message : 'Không thể tải thống kê';
      setError(message);
      toast.error(message);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setLastRefresh(new Date());
      }
    }
  }, []);

  const checkServerHealth = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      await checkHealth();
      if (isMountedRef.current) {
        setServerStatus('online');
      }
    } catch {
      if (isMountedRef.current) {
        setServerStatus('offline');
      }
    }
  }, []);

  const loadAll = useCallback(async () => {
    if (!isMountedRef.current) return;

    setLoading(true);
    setError(null);
    await Promise.all([loadStats(), checkServerHealth()]);
  }, [loadStats, checkServerHealth]);

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;
    loadAll();

    // Auto-refresh every 30 seconds
    intervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        loadStats();
        checkServerHealth();
      }
    }, AUTO_REFRESH_INTERVAL);

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [loadAll, loadStats, checkServerHealth]);

  const retry = useCallback(() => {
    loadAll();
  }, [loadAll]);

  const formattedLastRefresh = useMemo(() => {
    if (!lastRefresh) return null;
    return lastRefresh.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [lastRefresh]);

  return {
    stats,
    serverStatus,
    error,
    loading,
    lastRefresh,
    formattedLastRefresh,
    retry,
  };
}
