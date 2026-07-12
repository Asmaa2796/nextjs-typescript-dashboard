"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { eventSchema } from "@/lib/validations/event.schema";
import { logAudit } from "@/lib/audit-log";

// get events
export async function getEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date_from", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

// create event
export async function createEvent(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    date_from: formData.get("date_from") as string,
    date_to: formData.get("date_to") as string,
    time_from: formData.get("time_from") as string,
    time_to: formData.get("time_to") as string,
    location: formData.get("location") as string | null,
    email: formData.get("email") as string | null,
    phone: formData.get("phone") as string | null,
    highlight: formData.get("highlight") as string,
  };
  // zod validation
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    const errorMessage = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");

    throw new Error(errorMessage);
  }

  const { data: newEvent, error } = await supabase
    .from("events")
    .insert(parsed.data)
    .select()
    .single();
  if (error) throw new Error(error.message);

  await logAudit({
    action: "event.created",
    entityType: "event",
    entityId: newEvent?.id,
    metadata: { name: parsed.data.name, date_from: parsed.data.date_from },
  });

  revalidatePath("/events");
}
// update event
export async function updateEvent(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) throw new Error("Event ID is required");
  const raw = {
    name: formData.get("name") as string,
    date_from: formData.get("date_from") as string,
    date_to: formData.get("date_to") as string,
    time_from: formData.get("time_from") as string,
    time_to: formData.get("time_to") as string,
    location: formData.get("location") as string | null,
    email: formData.get("email") as string | null,
    phone: formData.get("phone") as string | null,
    highlight: formData.get("highlight") as string,
  };
  // zod validation
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    const errorMessage = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");

    throw new Error(errorMessage);
  }

  // Fetch "before" state for a meaningful audit diff
  const { data: previousEvent } = await supabase
    .from("events")
    .select("name, date_from, date_to, location")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("events")
    .update(parsed.data)
    .eq("id", id);
  if (error) throw new Error(error.message);

  await logAudit({
    action: "event.updated",
    entityType: "event",
    entityId: id,
    metadata: {
      before: previousEvent ?? null,
      after: {
        name: parsed.data.name,
        date_from: parsed.data.date_from,
        date_to: parsed.data.date_to,
        location: parsed.data.location,
      },
    },
  });

  revalidatePath("/events");
}

// delete event
export async function deleteEvent(id: string) {
  const { data: eventToDelete } = await supabase
    .from("events")
    .select("name")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logAudit({
    action: "event.deleted",
    entityType: "event",
    entityId: id,
    metadata: { name: eventToDelete?.name ?? null },
  });

  revalidatePath("/events");
}
