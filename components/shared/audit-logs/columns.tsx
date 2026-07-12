"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type AuditLog = {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

function actionVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
  if (action.endsWith(".created")) return "default";
  if (action.endsWith(".updated")) return "secondary";
  if (action.endsWith(".deleted")) return "destructive";
  return "outline";
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: "created_at",
    header: "Time",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(row.original.created_at)}
      </span>
    ),
  },
  {
    accessorKey: "actor_email",
    header: "Actor",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.actor_email ?? (
          <span className="text-muted-foreground italic">Unknown</span>
        )}
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Badge variant={actionVariant(row.original.action)} className="font-mono text-xs">
        {row.original.action}
      </Badge>
    ),
  },
  {
    accessorKey: "entity_type",
    header: "Entity",
    cell: ({ row }) => (
      <span className="text-sm capitalize">{row.original.entity_type}</span>
    ),
  },
  {
    accessorKey: "entity_id",
    header: "Entity ID",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-mono">
        {row.original.entity_id ?? "-"}
      </span>
    ),
  },
];
