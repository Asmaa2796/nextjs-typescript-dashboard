"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDown,ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { columns, AuditLog } from "@/components/shared/audit-logs/columns";

interface AuditLogTableProps {
  data: AuditLog[];
}

export function AuditLogTable({ data }: AuditLogTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "created_at", desc: true },
  ]);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const actionOptions = useMemo(
    () => Array.from(new Set(data.map((log) => log.action))).sort(),
    [data]
  );
  const entityOptions = useMemo(
    () => Array.from(new Set(data.map((log) => log.entity_type))).sort(),
    [data]
  );

  const filteredData = useMemo(() => {
    return data.filter((log) => {
      if (actionFilter !== "all" && log.action !== actionFilter) return false;
      if (entityFilter !== "all" && log.entity_type !== entityFilter) return false;
      if (search) {
        const haystack = `${log.actor_email ?? ""} ${log.entity_id ?? ""} ${log.action}`.toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [data, search, actionFilter, entityFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by actor, action, or entity id..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs bg-background text-foreground"
        />

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 bg-background text-foreground border border-border dark:bg-[#09161f] text-sm rounded-md shadow-sm focus:border-ring focus:ring-2 focus:ring-ring"
        >
          <option value="all">All actions</option>
          {actionOptions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="px-3 py-2 bg-background text-foreground dark:bg-[#09161f] border border-border text-sm rounded-md shadow-sm focus:border-ring focus:ring-2 focus:ring-ring"
        >
          <option value="all">All entities</option>
          {entityOptions.map((entity) => (
            <option key={entity} value={entity} className="capitalize">
              {entity}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="border border-border rounded-md bg-card dark:bg-[#09161f] overflow-x-auto shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50 dark:text-foreground dark:bg-[#09161f]">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="cursor-pointer select-none text-foreground"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center w-full gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: <ArrowUp className="text-sky-600" size={15} />, desc: <ArrowDown className="text-green-600" size={15} /> }[header.column.getIsSorted() as string] ?? ""}
                    </div>
                  </TableHead>
                ))}
                <TableHead />
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="cursor-pointer text-xs"
                      onClick={() => setSelectedLog(row.original)}
                    >
                      View details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="text-center py-8 text-muted-foreground">
                  No audit log entries match your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1} ({filteredData.length} entries)
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-lg bg-card text-card-foreground dark:bg-[#09161f] border-border">
          <DialogHeader>
            <DialogTitle>Audit log details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-muted-foreground text-xs">Actor</p>
                  <p className="text-foreground">{selectedLog.actor_email ?? "Unknown"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Action</p>
                  <p className="font-mono text-foreground">{selectedLog.action}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Entity</p>
                  <p className="capitalize text-foreground">{selectedLog.entity_type}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Entity ID</p>
                  <p className="font-mono text-foreground">{selectedLog.entity_id ?? "-"}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Metadata</p>
                <pre className="bg-muted rounded-md p-3 text-xs overflow-x-auto max-h-64 border border-border text-foreground">
                  {selectedLog.metadata
                    ? JSON.stringify(selectedLog.metadata, null, 2)
                    : "No metadata recorded"}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
