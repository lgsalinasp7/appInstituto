"use client";

import { useCallback, useMemo, useState } from "react";

const DEFAULT_PAGE_SIZE = 6;

export function useTablePagination<T>(items: T[], pageSize: number = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const goToPage = useCallback((nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  }, [totalPages]);

  const resetPage = useCallback(() => setPage(1), []);

  return {
    page: currentPage,
    totalPages,
    totalItems,
    pageSize,
    paginatedItems,
    goToPage,
    setPage: goToPage,
    resetPage,
  };
}
