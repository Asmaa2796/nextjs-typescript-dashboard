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

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name");

  // Fetch tags
  const { data: tags } = await supabase
    .from("tags")
    .select("id, name");

  // Fetch post tags
  const { data: postTags } = await supabase
    .from("post_tags")
    .select("tag_id")
    .eq("post_id", id);

  return (
    <EditPostForm
      post={post}
      categories={categories || []}
      tags={tags || []}
      selectedTagIds={postTags?.map((pt) => pt.tag_id.toString()) || []}
    />
  );
}
