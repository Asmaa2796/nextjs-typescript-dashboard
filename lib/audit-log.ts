import { supabase } from "@/lib/supabase";

type LogAuditParams = {
  action: string;
  entityType: string;
  entityId?: string | number | null;
  actorId?: string | number | null;
  actorEmail?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logAudit({
  action,
  entityType,
  entityId,
  actorId,
  actorEmail,
  metadata,
}: LogAuditParams) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("audit_logs").insert({
      actor_id: actorId ?? user?.id ?? null,
      actor_email: actorEmail ?? user?.email ?? null,
      action,
      entity_type: entityType,
      entity_id: entityId != null ? String(entityId) : null,
      metadata: metadata ?? null,
    });

    if (error) {
      console.error("Failed to write audit log:", error.message);
    }
  } catch (err) {
    console.error("Unexpected error writing audit log:", err);
  }
}