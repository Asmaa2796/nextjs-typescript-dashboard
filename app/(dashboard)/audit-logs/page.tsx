import { supabase } from "@/lib/supabase";
import { AuditLogTable } from "@/components/shared/audit-logs/audit-log-table";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {

  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-2">
        <h1 className="text-2xl font-bold mb-4 text-slate-800">Audit Logs</h1>
        <p className="text-destructive text-sm">
          Failed to load audit logs: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-2">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A record of every create, update, and delete action taken across the
          dashboard.
        </p>
      </div>

      <AuditLogTable data={data ?? []} />
    </div>
  );
}
