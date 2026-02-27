"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function TablePagination({
  page,
  totalPages,
  totalItems,
  pageSize = 6,
  onPageChange,
  className,
}: TablePaginationProps) {
  if (totalItems <= pageSize) return null;

  const safePage = Math.min(Math.max(page, 1), Math.max(totalPages, 1));
  const start = (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, totalItems);

  return (
    <div
      className={[
        "flex flex-col gap-3 border-t border-slate-800/60 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
        className ?? "",
      ].join(" ")}
    >
      <p className="text-xs text-slate-400">
        Mostrando <span className="font-semibold text-slate-200">{start}</span>-
        <span className="font-semibold text-slate-200">{end}</span> de{" "}
        <span className="font-semibold text-slate-200">{totalItems}</span>
      </p>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          className="h-8 border-slate-700/70 bg-slate-900/60 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Anterior
        </Button>

        <span className="text-xs text-slate-400">
          Página <span className="font-semibold text-slate-200">{safePage}</span> de{" "}
          <span className="font-semibold text-slate-200">{Math.max(totalPages, 1)}</span>
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          className="h-8 border-slate-700/70 bg-slate-900/60 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
        >
          Siguiente
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
