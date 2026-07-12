"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { logAudit } from "@/lib/audit-log";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await logAudit({
      action: "auth.login_failed",
      entityType: "auth",
      actorEmail: email,
      actorId: null,
      metadata: { error: error.message },
    });
    return { error: error.message };
  }

  await logAudit({
    action: "auth.login",
    entityType: "auth",
    entityId: data.user?.id,
    actorId: data.user?.id ?? null,
    actorEmail: data.user?.email ?? email,
  });

  redirect("/");
}

export async function signOut() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  await logAudit({
    action: "auth.logout",
    entityType: "auth",
    entityId: user?.id,
    actorId: user?.id ?? null,
    actorEmail: user?.email ?? null,
  });

  redirect("/login");
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}