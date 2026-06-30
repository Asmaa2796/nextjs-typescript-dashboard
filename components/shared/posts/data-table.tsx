"use client";

import { useState } from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  getPaginationRowModel
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,

    state: {
      sorting,
      columnFilters,
    },

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="rounded-md border bg-white dark:bg-gray-950">
      <div className="p-4">
        <Input
          placeholder="Search title..."
          value={
            (table
              .getColumn("title")
              ?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table
              .getColumn("title")
              ?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={`h-15 pl-4 ${header.column.id === "actions"
                    ? "text-center"
                    : ""
                    }`}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className="pl-4"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No posts found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="px-3 py-2 flex items-center">
        <Button
          className="mx-1 flex items-center cursor-pointer"
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft /> <span>Previous</span>
        </Button>

        <Button
          className="mx-1 flex items-center cursor-pointer"
          variant="outline"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span>Next</span> <ChevronsRight />
        </Button>
      </div>
    </div>
  );
}