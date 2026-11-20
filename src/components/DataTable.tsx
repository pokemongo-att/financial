"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  type ColumnDef,
  type SortingState,
  flexRender,
} from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/EmptyState";
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Extra per-column options read by DataTable. */
export type ColumnMeta = {
  align?: "left" | "right" | "center";
  /** Extra classes for both <th> and <td>, e.g. "hidden xl:table-cell". */
  className?: string;
  /** Wording for the phone sort menu. Defaults to "number" for right-aligned columns. */
  sortKind?: "text" | "number" | "date";
};

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumn?: string;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: React.ReactNode;
  /** Optional heading shown in the table's toolbar. */
  title?: React.ReactNode;
  /**
   * Renders a row as a list item. When given, screens below 1024px get a
   * touch-friendly list (with a sort menu) instead of a sideways-scrolling table.
   */
  renderCard?: (row: TData) => React.ReactNode;
  getRowId?: (row: TData, index: number) => string;
}

const SORT_WORDS: Record<NonNullable<ColumnMeta["sortKind"]>, { asc: string; desc: string }> = {
  text: { asc: "ก → ฮ", desc: "ฮ → ก" },
  number: { asc: "น้อย → มาก", desc: "มาก → น้อย" },
  date: { asc: "เก่า → ใหม่", desc: "ใหม่ → เก่า" },
};

function metaOf(col: { columnDef: { meta?: unknown } }): ColumnMeta {
  return (col.columnDef.meta ?? {}) as ColumnMeta;
}

function alignClass(meta: ColumnMeta) {
  return meta.align === "right" ? "text-right" : meta.align === "center" ? "text-center" : "text-left";
}

export function DataTable<TData>({
  columns,
  data,
  searchPlaceholder = "ค้นหา...",
  emptyIcon,
  emptyTitle = "ไม่มีรายการ",
  emptyDescription,
  toolbar,
  title,
  renderCard,
  getRowId,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId,
  });

  const rows = table.getRowModel().rows;

  const sortOptions = renderCard
    ? table
        .getAllLeafColumns()
        .filter((c) => c.getCanSort() && typeof c.columnDef.header === "string" && c.columnDef.header)
        .flatMap((c) => {
          const meta = metaOf(c);
          const kind = meta.sortKind ?? (meta.align === "right" ? "number" : "text");
          const header = c.columnDef.header as string;
          return [
            { value: `${c.id}:desc`, label: `${header}: ${SORT_WORDS[kind].desc}` },
            { value: `${c.id}:asc`, label: `${header}: ${SORT_WORDS[kind].asc}` },
          ];
        })
    : [];
  const sortValue = sorting[0] ? `${sorting[0].id}:${sorting[0].desc ? "desc" : "asc"}` : "";

  const empty = (
    <EmptyState
      icon={emptyIcon}
      title={globalFilter ? `ไม่พบ "${globalFilter}"` : emptyTitle}
      description={globalFilter ? "ลองค้นหาด้วยคำอื่น" : emptyDescription}
    />
  );

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3 border-b border-slate-100 px-4 py-3 sm:px-5 lg:px-6 lg:py-4">
        {(title || toolbar) && (
          <div className="flex min-w-0 flex-1 basis-80 flex-col gap-2.5">
            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
            {toolbar}
          </div>
        )}
        <div className="flex min-w-0 flex-1 basis-64 flex-wrap gap-2 lg:ml-auto lg:justify-end">
          <div className="relative min-w-0 flex-1 basis-28 lg:max-w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              enterKeyHint="search"
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="min-h-11 pl-9"
            />
          </div>
          {renderCard && sortOptions.length > 0 && (
            <Select
              aria-label="เรียงลำดับ"
              value={sortValue}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return setSorting([]);
                const [id, dir] = v.split(":");
                setSorting([{ id, desc: dir === "desc" }]);
              }}
              className="min-h-11 w-auto min-w-0 max-w-full flex-1 basis-32 lg:hidden"
            >
              <option value="">เรียงตามเดิม</option>
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          )}
        </div>
      </div>

      {/* Phone + tablet: list */}
      {renderCard && (
        <div className="lg:hidden">
          {rows.length === 0 ? (
            empty
          ) : (
            <ul className="divide-y divide-slate-100">
              {rows.map((row) => (
                <li key={row.id}>{renderCard(row.original)}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Desktop: table */}
      <div className={cn("overflow-x-auto", renderCard && "hidden lg:block")}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {table.getHeaderGroups().map((headerGroup) =>
                headerGroup.headers.map((header) => {
                  const meta = metaOf(header.column);
                  const canSort = header.column.getCanSort();
                  const sorted = header.column.getIsSorted();
                  const label = header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext());
                  return (
                    <th
                      key={header.id}
                      scope="col"
                      aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : undefined}
                      className={cn(
                        "whitespace-nowrap px-4 py-3 text-xs font-medium text-slate-500 xl:px-6",
                        alignClass(meta),
                        meta.className
                      )}
                    >
                      {canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className={cn(
                            "inline-flex items-center gap-1 rounded hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                            meta.align === "right" && "flex-row-reverse"
                          )}
                        >
                          {label}
                          {sorted === "asc" ? (
                            <ArrowUp className="h-3 w-3 text-indigo-500" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="h-3 w-3 text-indigo-500" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 text-slate-300" />
                          )}
                        </button>
                      ) : (
                        label
                      )}
                    </th>
                  );
                })
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>{empty}</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-slate-50/60">
                  {row.getVisibleCells().map((cell) => {
                    const meta = metaOf(cell.column);
                    return (
                      <td key={cell.id} className={cn("px-4 py-3 xl:px-6", alignClass(meta), meta.className)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
