import { supabase } from "@/lib/supabase";
import { columns } from "@/components/shared/posts/columns";
import { DataTable } from "@/components/shared/posts/data-table";

export default async function PostsPage() {
  const [{ data: posts, error: postsError }, { data: categories, error: categoriesError }] = await Promise.all([
    supabase
      .from("posts")
      .select("id, title, main_image, sub_images, content, sub_content, active, category_id, category_name, created_at")
      .order("created_at", { ascending: true }),
    supabase.from("categories").select("id, name"),
  ]);

  if (postsError || categoriesError) {
    return <div>{postsError?.message ?? categoriesError?.message}</div>;
  }

  const categoryMap = new Map((categories ?? []).map((category: { id: number; name: string }) => [category.id, category.name]));
  const normalizedPosts = (posts ?? []).map((post: any) => {
    const categoryName = post.category_name ?? (post.category_id != null ? categoryMap.get(post.category_id) ?? null : null);

    return {
      ...post,
      category_name: categoryName,
      category: post.category_id != null
        ? { id: post.category_id, name: categoryName }
        : null,
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">
        Posts
      </h1>

      <DataTable
        columns={columns}
        data={normalizedPosts}
      />
    </div>
  );
}