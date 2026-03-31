"use client";

import { useState, useEffect } from "react";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface Column<T> {
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[] | undefined;
  total?: number;
  isLoading: boolean;
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  mobileCard: (item: T) => ReactNode;
  actions?: (item: T) => ReactNode;
  emptyIcon: LucideIcon;
  emptyText: string;
  // Server-side search
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  // Server-side pagination
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

export default function DataTable<T>({
  data,
  total,
  isLoading,
  columns,
  keyExtractor,
  mobileCard,
  actions,
  emptyIcon: EmptyIcon,
  emptyText,
  searchPlaceholder,
  onSearch,
  page = 0,
  pageSize = 10,
  onPageChange,
}: DataTableProps<T>) {
  const [searchInput, setSearchInput] = useState("");

  // Debounce search
  useEffect(() => {
    if (!onSearch) return;
    const t = setTimeout(() => onSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput, onSearch]);

  const showSearch = !!onSearch;
  const totalItems = total ?? data?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const showPagination = !!onPageChange && totalItems > pageSize;

  if (isLoading) {
    return (
      <div>
        {showSearch && (
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      {showSearch && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => { setSearchInput(e.target.value); onPageChange?.(0); }}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!data?.length ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 rounded-full bg-gray-100 p-3">
            <EmptyIcon className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">
            {searchInput.trim() ? "Sin resultados para la busqueda" : emptyText}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {data.map((item) => (
              <div key={keyExtractor(item)} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">{mobileCard(item)}</div>
                  {actions && <div className="ml-2 flex shrink-0 gap-1">{actions(item)}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {columns.map((col) => (
                    <th key={col.header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {col.header}
                    </th>
                  ))}
                  {actions && (
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((item) => (
                  <tr key={keyExtractor(item)} className="transition-colors hover:bg-gray-50/50">
                    {columns.map((col) => (
                      <td key={col.header} className={col.className ?? "px-4 py-3.5 text-sm text-gray-700"}>
                        {col.render(item)}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">{actions(item)}</div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {showPagination && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {page * pageSize + 1}-{Math.min((page + 1) * pageSize, totalItems)} de {totalItems}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onPageChange!(page - 1)}
                  disabled={page === 0}
                  className="rounded-lg border border-gray-200 bg-white p-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i)
                  .filter((i) => i >= Math.max(0, page - 2) && i <= Math.min(totalPages - 1, page + 2))
                  .map((i) => (
                    <button
                      key={i}
                      onClick={() => onPageChange!(i)}
                      className={`hidden rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors sm:block ${
                        i === page
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                <span className="px-1 text-sm text-gray-400 sm:hidden">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => onPageChange!(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="rounded-lg border border-gray-200 bg-white p-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
