import { useCallback, useEffect, useRef, useState } from 'react';
import { getProducts } from '../services';
import { PAGE_SIZE } from '../constants';
import type { Product } from '../interfaces';
import toast from 'react-hot-toast';

const SEARCH_DEBOUNCE_MS = 400;

export function useProducts(initialSort = 'date_desc') {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState(initialSort);
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(false);

  const load = useCallback(
    async (searchQuery?: string, pageNum?: number, sortQuery?: string) => {
      if (!isMountedRef.current) return;

      setLoading(true);
      setError(null);
      try {
        const data = await getProducts({
          q: searchQuery || search || undefined,
          page: pageNum || page,
          limit: PAGE_SIZE,
          sort: sortQuery || sort,
        });
        if (!isMountedRef.current) return;

        setProducts(data.products);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setPage(data.page);
      } catch (e: unknown) {
        if (!isMountedRef.current) return;
        const message =
          e instanceof Error ? e.message : 'Không thể tải danh sách sản phẩm';
        setError(message);
        toast.error(message);
        setProducts([]);
        setTotal(0);
        setTotalPages(1);
        setPage(1);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
          setIsSearching(false);
        }
      }
    },
    [sort, search, page]
  );

  useEffect(() => {
    isMountedRef.current = true;
    load();

    return () => {
      isMountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => {
    load(search, page, sort);
  }, [load, search, page, sort]);

  const goToPage = useCallback(
    (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;
      setPage(newPage);
      load(search, newPage, sort);
    },
    [load, search, sort, totalPages]
  );

  const changeSort = useCallback(
    (newSort: string) => {
      setSort(newSort);
      setPage(1);
      load(search, 1, newSort);
    },
    [load, search]
  );

  const changeSearch = useCallback(
    (newSearch: string) => {
      setSearch(newSearch);
      setPage(1);

      // Debounce search to avoid spamming API
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setIsSearching(true);

      if (!newSearch.trim()) {
        // Immediate search for empty
        debounceRef.current = setTimeout(() => {
          load('', 1, sort);
        }, 50);
      } else {
        debounceRef.current = setTimeout(() => {
          load(newSearch, 1, sort);
        }, SEARCH_DEBOUNCE_MS);
      }
    },
    [load, sort]
  );

  return {
    products,
    setProducts,
    loading,
    isSearching,
    error,
    page,
    totalPages,
    total,
    sort,
    search,
    refresh,
    goToPage,
    changeSort,
    changeSearch,
  };
}
