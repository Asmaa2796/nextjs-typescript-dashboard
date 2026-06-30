// المسار: app/posts/[id]/edit/page.tsx
// هذا Server Component يجيب البيانات ويبعتها للـ EditPostForm

import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { EditPostForm } from "./edit-post-form"; 
interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params; // ← Next.js 15: params is a Promise

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !post) notFound();

  return <EditPostForm post={post} />;
}
