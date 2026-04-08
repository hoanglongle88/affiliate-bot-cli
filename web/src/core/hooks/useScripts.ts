import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createScript,
  getScriptHistory,
  deleteScript as deleteScriptAPI,
  exportScripts as exportScriptsAPI,
  bulkDeleteScripts,
  regenerateScript,
} from '../services/scriptAPI';
import type { VideoScript } from '../interfaces';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export function useScripts() {
  const [scripts, setScripts] = useState<VideoScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPlatform, setSelectedPlatform] = useState<
    string | undefined
  >();
  const [selectedScript, setSelectedScript] = useState<VideoScript | null>(
    null
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const isMountedRef = useRef(false);

  const loadHistory = useCallback(
    async (pageNum?: number, platform?: string) => {
      if (!isMountedRef.current) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getScriptHistory(
          pageNum || page,
          PAGE_SIZE,
          platform || selectedPlatform
        );
        if (!isMountedRef.current) return;

        // Defensive: handle undefined/null responses
        setScripts(Array.isArray(data?.scripts) ? data.scripts : []);
        setTotal(data?.total ?? 0);
        setTotalPages(data?.totalPages ?? 1);
        setPage(data?.page ?? 1);
      } catch (e) {
        if (!isMountedRef.current) return;
        const message =
          e instanceof Error ? e.message : 'Không thể tải lịch sử kịch bản';
        setError(message);
        toast.error(message);
        // Reset on error
        setScripts([]);
        setTotal(0);
        setTotalPages(1);
        setPage(1);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [page, selectedPlatform]
  );

  useEffect(() => {
    isMountedRef.current = true;
    loadHistory();

    return () => {
      isMountedRef.current = false;
    };
  }, [loadHistory]);

  const generateScript = useCallback(
    async (data: {
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
    }) => {
      if (!isMountedRef.current) return null;

      setGenerating(true);
      setError(null);
      try {
        const result = await createScript(data);
        if (!isMountedRef.current) return null;

        const newScript: VideoScript = {
          id: result.script.id,
          productId: result.script.productId,
          platform: result.script.platform,
          title: result.script.title,
          hook: result.script.hook,
          body: result.script.body,
          voiceoverCTA: result.script.voiceoverCTA,
          wordCount: result.script.wordCount,
          estimatedDuration: result.script.estimatedDuration,
        };

        setSelectedScript(newScript);

        // Show warnings if any
        if (result.warnings && result.warnings.length > 0) {
          toast(
            `⚠️ Script đã lưu — có cảnh báo:\n${result.warnings.join('\n')}`,
            {
              duration: 6000,
              icon: '⚠️',
            }
          );
        } else {
          toast.success('Đã tạo kịch bản thành công!');
        }

        loadHistory(1, selectedPlatform);
        return newScript;
      } catch (e) {
        if (!isMountedRef.current) return null;
        const message =
          e instanceof Error ? e.message : 'Không thể tạo kịch bản';
        setError(message);
        toast.error(message);
        return null;
      } finally {
        if (isMountedRef.current) {
          setGenerating(false);
        }
      }
    },
    [loadHistory, selectedPlatform]
  );

  const regenerateScriptFn = useCallback(
    async (id: string) => {
      if (!isMountedRef.current) return null;

      setRegenerating(id);
      try {
        const result = await regenerateScript(id);
        if (!isMountedRef.current) return null;

        const newScript: VideoScript = {
          id: result.script.id,
          productId: result.script.productId,
          platform: result.script.platform,
          title: result.script.title,
          hook: result.script.hook,
          body: result.script.body,
          voiceoverCTA: result.script.voiceoverCTA,
          wordCount: result.script.wordCount,
          estimatedDuration: result.script.estimatedDuration,
        };

        setSelectedScript(newScript);
        toast.success('Đã viết lại kịch bản!');
        loadHistory(page, selectedPlatform);
        return newScript;
      } catch (e) {
        if (!isMountedRef.current) return null;
        const message =
          e instanceof Error ? e.message : 'Không thể viết lại kịch bản';
        toast.error(message);
        return null;
      } finally {
        if (isMountedRef.current) {
          setRegenerating(null);
        }
      }
    },
    [loadHistory, page, selectedPlatform]
  );

  const deleteScript = useCallback(
    async (id: string) => {
      const oldScripts = [...scripts];
      setScripts((prev) => prev.filter((s) => s.id !== id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      try {
        await deleteScriptAPI(id);
        if (!isMountedRef.current) return;

        toast.success('Đã xóa kịch bản');
        if (scripts.length === 1 && page > 1) {
          setPage((p) => p - 1);
          loadHistory(page - 1, selectedPlatform);
        } else {
          loadHistory(page, selectedPlatform);
        }
      } catch {
        if (!isMountedRef.current) return;
        toast.error('Không thể xóa kịch bản');
        setScripts(oldScripts);
      }
    },
    [scripts, page, selectedPlatform, loadHistory]
  );

  const bulkDeleteScriptsFn = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    const oldScripts = [...scripts];
    setScripts((prev) => prev.filter((s) => !selectedIds.has(s.id!)));

    try {
      const result = await bulkDeleteScripts(Array.from(selectedIds));
      if (!isMountedRef.current) return;

      const deleted = result.deletedCount ?? count;
      const notFound = result.notFoundCount ?? 0;

      if (notFound > 0) {
        toast(`Đã xóa ${deleted}/${count} (có ${notFound} không tồn tại)`, {
          icon: '⚠️',
          duration: 4000,
        });
      } else {
        toast.success(`Đã xóa ${deleted} kịch bản`);
      }

      setSelectedIds(new Set());
      loadHistory(page, selectedPlatform);
    } catch {
      if (!isMountedRef.current) return;
      toast.error('Không thể xóa kịch bản');
      setScripts(oldScripts);
    }
  }, [selectedIds, scripts, page, selectedPlatform, loadHistory]);

  const exportScriptsFn = useCallback(
    async (scriptIds?: string[], platform?: string) => {
      try {
        const blob = await exportScriptsAPI(scriptIds, platform);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `scripts-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success('Đang tải file kịch bản...');
      } catch {
        toast.error('Không thể xuất kịch bản');
      }
    },
    []
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === scripts.length) {
        return new Set();
      }
      return new Set(scripts.map((s) => s.id!).filter(Boolean));
    });
  }, [scripts]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;
      setPage(newPage);
      loadHistory(newPage, selectedPlatform);
    },
    [totalPages, selectedPlatform, loadHistory]
  );

  const changePlatform = useCallback(
    (platform: string | undefined) => {
      setSelectedPlatform(platform);
      setPage(1);
      setSelectedIds(new Set());
      loadHistory(1, platform);
    },
    [loadHistory]
  );

  const refresh = useCallback(() => {
    loadHistory(page, selectedPlatform);
  }, [page, selectedPlatform, loadHistory]);

  return {
    scripts,
    loading,
    generating,
    regenerating,
    error,
    page,
    totalPages,
    total,
    selectedPlatform,
    selectedScript,
    setSelectedScript,
    selectedIds,
    generateScript,
    regenerateScript: regenerateScriptFn,
    deleteScript,
    bulkDeleteScripts: bulkDeleteScriptsFn,
    exportScripts: exportScriptsFn,
    goToPage,
    changePlatform,
    refresh,
    toggleSelect,
    selectAll,
    clearSelection,
  };
}
