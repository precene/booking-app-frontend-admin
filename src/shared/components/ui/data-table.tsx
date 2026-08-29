import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";

import { Pagination } from "#/shared/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/shared/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "#/shared/components/ui/table";

const defaultPageSizeOptions = [10, 20, 50] as const;

type DataTableRowsPerPage = {
  label?: string;
  onLimitChange: (limit: number) => void;
  options?: ReadonlyArray<number>;
};

type DataTablePagination = {
  isLoading?: boolean;
  limit: number;
  onPageChange: (page: number) => void;
  page: number;
  rowsPerPage?: DataTableRowsPerPage | false;
  total: number;
};

type DataTableProps<TData, TValue> = {
  columns: Array<ColumnDef<TData, TValue>>;
  data: Array<TData>;
  emptyMessage?: string;
  loadingMessage?: string;
  pagination?: DataTablePagination | false;
  resultLabel?: string;
  toolbar?: ReactNode;
};

function DataTable<TData, TValue>({
  columns,
  data,
  emptyMessage = "No results found.",
  loadingMessage = "Loading results...",
  pagination,
  resultLabel = "results",
  toolbar,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
  });

  const paginationConfig = pagination || null;
  const totalPages = paginationConfig
    ? Math.max(1, Math.ceil(paginationConfig.total / paginationConfig.limit))
    : 1;
  const firstResult =
    paginationConfig && paginationConfig.total
      ? (paginationConfig.page - 1) * paginationConfig.limit + 1
      : 0;
  const lastResult = paginationConfig
    ? Math.min(paginationConfig.page * paginationConfig.limit, paginationConfig.total)
    : data.length;
  const rowsPerPage =
    paginationConfig && paginationConfig.rowsPerPage ? paginationConfig.rowsPerPage : null;
  const pageSizeOptions = rowsPerPage?.options ?? defaultPageSizeOptions;

  return (
    <div className="space-y-3">
      {paginationConfig || toolbar || rowsPerPage ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {paginationConfig ? (
            <p className="text-muted text-sm">
              {paginationConfig.isLoading
                ? loadingMessage
                : `Showing ${firstResult}-${lastResult} of ${paginationConfig.total} ${resultLabel}`}
            </p>
          ) : (
            <span />
          )}

          {toolbar || rowsPerPage ? (
            <div className="flex items-center gap-3">
              {toolbar}

              {rowsPerPage ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted text-sm">{rowsPerPage.label ?? "Rows"}</span>
                  <Select
                    disabled={paginationConfig?.isLoading}
                    onValueChange={(value) => rowsPerPage.onLimitChange(Number(value))}
                    value={String(paginationConfig?.limit)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pageSizeOptions.map((option) => (
                        <SelectItem key={option} value={String(option)}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="bg-surface rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="text-muted h-24 text-center" colSpan={columns.length}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {paginationConfig ? (
        <Pagination
          isLoading={paginationConfig.isLoading}
          onPageChange={paginationConfig.onPageChange}
          page={paginationConfig.page}
          totalPages={totalPages}
        />
      ) : null}
    </div>
  );
}

export { DataTable };
